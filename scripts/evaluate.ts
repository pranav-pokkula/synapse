import {mkdir,writeFile} from 'node:fs/promises';
import {performance} from 'node:perf_hooks';
import {sampleSnapshot} from '../lib/sample';
import {retrieve,validCitation,rankConcepts} from '../lib/analysis';
import {modelRequest,providerConfigured} from '../lib/provider';
const snapshot=sampleSnapshot();
const cases=[
 {id:'validation',question:'Where is the note body validated and what limits are applied?',expectedPath:'lib/validation.ts'},
 {id:'identity',question:'Where does the route check getUser before inserting a note?',expectedPath:'app/api/notes/route.ts'},
 {id:'query',question:'How does listNotes filter notes by user_id and limit results?',expectedPath:'lib/notes.ts'},
 {id:'state',question:'How does note-composer use useState and fetch when saving?',expectedPath:'components/note-composer.tsx'},
 {id:'tests',question:'What validation behavior does validation.test.ts assert?',expectedPath:'tests/validation.test.ts'},
 {id:'unknown',question:'Which production region hosts the database, and what uptime does it achieve?',expectedPath:null},
];
await mkdir('evidence',{recursive:true});
const retrieval=cases.filter(c=>c.expectedPath).map(c=>{const start=performance.now();const found=retrieve(snapshot,c.question,3);return {id:c.id,expected:c.expectedPath,retrieved:found.map(x=>x.path),hitAt3:found.some(x=>x.path===c.expectedPath),citationsValid:found.every(x=>validCitation(x,snapshot)),ms:Number((performance.now()-start).toFixed(3))};});
const alphabetical=[...snapshot.concepts].sort((a,b)=>a.title.localeCompare(b.title));const ranked=rankConcepts(snapshot.concepts);
function violations(concepts:typeof ranked){return concepts.reduce((n,c,i)=>n+c.prerequisites.filter(p=>concepts.findIndex(x=>x.id===p)>i).length,0);}
const outputs=[];
if(process.env.RUN_LLM_EVAL==='1'&&providerConfigured()){
 // Two controlled conditions, same model, prompt, questions and output validator.
 // Raw outputs require human accuracy / pedagogical scoring; no self-grading.
 for(const c of cases)for(const condition of ['baseline','synapse'] as const){const evidence=condition==='baseline'?snapshot.files.slice(0,2).map(f=>({path:f.path,content:f.content})):retrieve(snapshot,c.question,3);const start=performance.now();try{const answer=await modelRequest(snapshot,c.question,JSON.stringify(evidence),'intermediate');outputs.push({id:c.id,condition,ms:Math.round(performance.now()-start),answer,humanScores:null});}catch(e){outputs.push({id:c.id,condition,ms:Math.round(performance.now()-start),error:(e as Error).message,humanScores:null});}}
}
const report={recordedAt:new Date().toISOString(),dataset:'embedded Fieldnotes fixture, six predeclared questions (five answerable, one unknown)',fixtureHash:snapshot.sha,retrieval:{cases:retrieval,hitAt3:retrieval.filter(x=>x.hitAt3).length/Math.max(1,retrieval.length)},ordering:{metric:'Prerequisite inversions; this is not a learner-outcomes study',alphabetical:violations(alphabetical),synapse:violations(ranked)},llm:{status:outputs.length?'executed; human scoring pending':'not run — no provider selected / RUN_LLM_EVAL not enabled',model:process.env.LLM_MODEL??null,outputs,requiredManualMetrics:['technical accuracy','citation relevance','unsupported claims','explanation usefulness','pedagogical clarity'],limitations:['Small author-created fixture; not independently reviewed','Text-match citations do not validate semantic entailment','No measured learning benefit','Model latency/tokens only available after configured run','No fabricated live-model results']}};
await writeFile('evidence/evaluation-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
