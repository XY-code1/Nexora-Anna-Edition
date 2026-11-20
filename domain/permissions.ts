import type {Memory} from "./memory";
export interface AuthorizedContext {memoryId:string; text:string; disclosure:"full"|"summary";}
const tokens=(s:string)=>new Set(s.toLowerCase().match(/[\p{L}\p{N}]+/gu)??[]);
export function buildMinimumContext(memories:Memory[], task:string, limit=5):AuthorizedContext[]{ const q=tokens(task); return memories.filter(m=>m.status==="confirmed"&&(m.aiAccess==="allowed"||m.aiAccess==="summary-only")).map(m=>({m,score:[...tokens(`${m.title} ${m.summary} ${m.content}`)].filter(x=>q.has(x)).length})).filter(x=>q.size===0||x.score>0).sort((a,b)=>b.score-a.score||b.m.updatedAt.localeCompare(a.m.updatedAt)).slice(0,limit).map(({m})=>m.aiAccess==="allowed"?{memoryId:m.id,text:m.content,disclosure:"full"}:{memoryId:m.id,text:m.summary,disclosure:"summary"}); }
