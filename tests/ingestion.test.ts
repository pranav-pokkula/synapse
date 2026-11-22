import {describe,it,expect,vi,afterEach} from 'vitest';
import {advanceImport,beginImport} from '@/lib/github';
const sha='a'.repeat(40),blob='b'.repeat(40);
const source=`export async function GET() { return Response.json({ hello: 'world' }); }`;
function mockGitHub({rate=false,large=false,truncated=false,blobFailure=false,unsupported=false}={}){return vi.fn(async(url:string|URL|Request)=>{
 const u=String(url);if(rate)return new Response('{}',{status:429});
 if(u.includes('/git/blobs/'))return blobFailure?new Response('{}',{status:500}):Response.json({content:Buffer.from(source).toString('base64'),encoding:'base64',size:source.length});
 if(u.includes('/git/trees/'))return Response.json({truncated,tree:[{path:unsupported?'README.md':'app/api/hello/route.ts',type:'blob',sha:blob,size:source.length,mode:'100644'},{path:'.env',type:'blob',sha:blob,size:100,mode:'100644'},{path:'link.ts',type:'blob',sha:blob,size:20,mode:'120000'}]});
 if(u.includes('/commits/'))return Response.json({sha});
 return Response.json({private:false,default_branch:'main',size:large?200000:10,description:'A public fixture'});
 });}
afterEach(()=>vi.unstubAllGlobals());
describe('staged GitHub integration using controlled API responses',()=>{
 it('imports actual response content, pins a commit, excludes secrets and symlinks',async()=>{const fetch=mockGitHub();vi.stubGlobal('fetch',fetch);const job=await beginImport('https://github.com/example/public');expect(job.sha).toBe(sha);expect(job.queue).toHaveLength(1);const result=await advanceImport(job);expect(result.job.status).toBe('complete');expect(result.snapshot?.files[0].content).toBe(source);expect(result.snapshot?.concepts.some(c=>c.id==='requests')).toBe(true);expect(fetch.mock.calls.every(([url])=>String(url).startsWith('https://api.github.com/'))).toBe(true);});
 it('handles rate limits explicitly',async()=>{vi.stubGlobal('fetch',mockGitHub({rate:true}));await expect(beginImport('https://github.com/example/public')).rejects.toMatchObject({code:'GITHUB_RATE_LIMIT'});});
 it('refuses oversized repositories before blob downloads',async()=>{const fetch=mockGitHub({large:true});vi.stubGlobal('fetch',fetch);await expect(beginImport('https://github.com/example/public')).rejects.toMatchObject({code:'SIZE_LIMIT'});expect(fetch).toHaveBeenCalledTimes(1);});
 it('marks truncated coverage honestly',async()=>{vi.stubGlobal('fetch',mockGitHub({truncated:true}));const result=await advanceImport(await beginImport('https://github.com/example/public'));expect(result.snapshot?.coverage.partial).toBe(true);});
 it('preserves a failed import checkpoint and recovers on retry',async()=>{vi.stubGlobal('fetch',mockGitHub({blobFailure:true}));const job=await beginImport('https://github.com/example/public');const failed=await advanceImport(job);expect(failed.job.status).toBe('failed');expect(failed.job.cursor).toBe(0);vi.stubGlobal('fetch',mockGitHub());const recovered=await advanceImport(failed.job);expect(recovered.job.status).toBe('complete');expect(recovered.snapshot?.sha).toBe(sha);});
 it('rejects unsupported README-only repositories',async()=>{vi.stubGlobal('fetch',mockGitHub({unsupported:true}));await expect(beginImport('https://github.com/example/public')).rejects.toMatchObject({code:'UNSUPPORTED_REPO'});});
 it('converts timeouts into actionable recoverable errors',async()=>{vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new Error('timeout')));await expect(beginImport('https://github.com/example/public')).rejects.toMatchObject({code:'GITHUB_UNAVAILABLE'});});
});
