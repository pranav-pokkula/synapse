import {chromium,request} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {validCitation} from '../lib/analysis';
import type {Snapshot} from '../lib/types';
const baseURL=process.env.TEST_BASE_URL??'http://127.0.0.1:3000';
const client=await request.newContext({baseURL,extraHTTPHeaders:{Origin:new URL(baseURL).origin}});
await client.get('/api/session');
const outcomes:Record<string,unknown>[]=[];
await mkdir('evidence',{recursive:true});
async function importRepo(url:string,label:string){
 const start=performance.now();const response=await client.post('/api/import',{data:{url}});let job=await response.json();if(!response.ok())throw new Error(job.error);const cached=Boolean(job.cached);
 for(let i=0;job.status!=='complete'&&i<20;i++){const r=await client.post(`/api/import/${job.id}`,{data:{}});job=await r.json();if(!r.ok()||job.status==='failed')throw new Error(job.error??'Import failed');}
 if(job.status!=='complete')throw new Error('Import did not finish within 20 checkpoints');
 const result=await client.get(`/api/project/${job.snapshotId??job.id}`);const snapshot=await result.json() as Snapshot;
 const citations=snapshot.concepts.flatMap(c=>c.evidence);const valid=citations.filter(c=>validCitation(c,snapshot)).length;
 if(!snapshot.files.length||!snapshot.concepts.length||valid!==citations.length)throw new Error('Import evidence failed validation');
 outcomes.push({case:label,url,expected:'Pinned snapshot, genuine source, nonempty concept path, valid citations',observed:'pass',sha:snapshot.sha,files:snapshot.files.length,eligible:snapshot.coverage.eligible,partial:snapshot.coverage.partial,concepts:snapshot.concepts.map(c=>c.id),citations:citations.length,validCitations:valid,cached,ms:Math.round(performance.now()-start),snapshotId:snapshot.id});
 return snapshot;
}
try{
 const first=await importRepo('https://github.com/sindresorhus/is-absolute-url','ordinary-1');
 await importRepo('https://github.com/sindresorhus/is-plain-obj','ordinary-2');
 const repeat=await importRepo('https://github.com/sindresorhus/is-absolute-url','repeatability');
 if(first.sha!==repeat.sha)outcomes.push({case:'repeat-sha',observed:'upstream changed between imports; results not directly comparable'});
 await importRepo('https://github.com/lukeed/clsx','more-demanding');
 const invalid=await client.post('/api/import',{data:{url:'https://127.0.0.1/internal'}});outcomes.push({case:'invalid-host',expected:400,observed:invalid.status(),body:await invalid.json()});
 // Separate session so the missing-repository case does not hit the five-import cap.
 const failureClient=await request.newContext({baseURL,extraHTTPHeaders:{Origin:new URL(baseURL).origin}});await failureClient.get('/api/session');
 const missing=await failureClient.post('/api/import',{data:{url:'https://github.com/synapse-nonexistent-example-2026/no-repository'}});outcomes.push({case:'missing-repository',expected:404,observed:missing.status(),body:await missing.json()});await failureClient.dispose();
 const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHROMIUM?'chromium':'chrome'});const context=await browser.newContext({storageState:await client.storageState(),viewport:{width:1440,height:1000}});const page=await context.newPage();await page.goto(baseURL+'/learn');await page.evaluate(id=>localStorage.setItem('synapse-project',id),first.id);await page.reload();await page.getByRole('heading',{name:/sindresorhus/}).waitFor();await page.screenshot({path:'evidence/live-import-desktop.png',fullPage:true});await page.getByRole('button',{name:'Start learning',exact:true}).click();await page.getByTestId('animation-stage').waitFor();await page.screenshot({path:'evidence/live-lesson-desktop.png',fullPage:true});await browser.close();
}catch(error){outcomes.push({case:'execution-error',observed:'failed',message:(error as Error).message});process.exitCode=1;}
await writeFile('evidence/live-import-results.json',JSON.stringify({recordedAt:new Date().toISOString(),network:'Real public GitHub REST API; no mock responses',outcomes},null,2));
console.log(JSON.stringify(outcomes,null,2));await client.dispose();
