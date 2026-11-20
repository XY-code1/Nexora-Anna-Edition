export type MemoryStatus = "candidate" | "confirmed" | "rejected";
export type AccessLevel = "allowed" | "summary-only" | "denied";
export interface Memory { id:string; title:string; content:string; summary:string; status:MemoryStatus; aiAccess:AccessLevel; createdAt:string; updatedAt:string; confirmedAt?:string; rejectedAt?:string; source:"conversation-submit"; revision:number; }
export interface AuditEvent { id:string; memoryId:string; action:string; at:string; actor:"user"|"system"; details?:Record<string,unknown>; }
export interface CandidateDraft { title:string; content:string; summary:string; }
