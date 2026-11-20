import type {AuditEvent,Memory} from "../../domain/memory";
export interface StoreData {schemaVersion:1; memories:Memory[]; audit:AuditEvent[];}
const KEY="nexora-memory/v1/store"; const EMPTY:StoreData={schemaVersion:1,memories:[],audit:[]}; let dev:StoreData=structuredClone(EMPTY);
export async function loadStore():Promise<StoreData>{if(!window.anna){return structuredClone(dev)} const r=await window.anna.storage.get({key:KEY,scope:"app"}); return r.exists?validate(r.value):structuredClone(EMPTY);}
export async function saveStore(value:StoreData){validate(value); if(!window.anna){dev=structuredClone(value);return;} await window.anna.storage.set({key:KEY,value,scope:"app"});}
export async function deleteAll(){if(!window.anna){dev=structuredClone(EMPTY);return;} await window.anna.storage.delete({key:KEY,scope:"app"});}
export function exportJson(s:StoreData){return JSON.stringify(s,null,2);}
function validate(v:any):StoreData{if(!v||v.schemaVersion!==1||!Array.isArray(v.memories)||!Array.isArray(v.audit))throw new Error("Invalid APS store payload"); return v as StoreData;}
