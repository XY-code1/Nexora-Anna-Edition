import type {AccessLevel, AuditEvent, CandidateDraft, Memory} from "./memory";
const now=()=>new Date().toISOString(); const uid=()=>crypto.randomUUID();
export function createCandidate(d:CandidateDraft):Memory { const t=now(); return {id:uid(),...d,status:"candidate",aiAccess:"denied",createdAt:t,updatedAt:t,source:"conversation-submit",revision:1}; }
function candidateOnly(m:Memory){if(m.status!=="candidate") throw new Error("Only candidate memories can transition");}
export function editCandidate(m:Memory, patch:Partial<Pick<Memory,"title"|"content"|"summary">>):Memory { candidateOnly(m); return {...m,...patch,updatedAt:now(),revision:m.revision+1}; }
export function confirm(m:Memory):Memory { candidateOnly(m); const t=now(); return {...m,status:"confirmed",confirmedAt:t,updatedAt:t,revision:m.revision+1}; }
export function reject(m:Memory):Memory { candidateOnly(m); const t=now(); return {...m,status:"rejected",rejectedAt:t,updatedAt:t,revision:m.revision+1}; }
export function setAccess(m:Memory,aiAccess:AccessLevel):Memory { if(m.status!=="confirmed") throw new Error("Access applies only to confirmed memories"); return {...m,aiAccess,updatedAt:now(),revision:m.revision+1}; }
export function audit(memoryId:string,action:string,actor:AuditEvent["actor"],details?:Record<string,unknown>):AuditEvent{return {id:uid(),memoryId,action,actor,at:now(),details};}
