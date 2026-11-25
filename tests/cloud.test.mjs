import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import worker from '../server/worker.mjs';
import {initialState,mutate,pickPrize} from '../server/domain.mjs';
class D1 {
 constructor(sqlite){this.sqlite=sqlite}
 prepare(sql){const db=this.sqlite;let args=[];return {bind(...values){args=values;return this},async first(){return db.prepare(sql).get(...args)||null},async all(){return {results:db.prepare(sql).all(...args)}},async run(){const result=db.prepare(sql).run(...args);return {success:true,meta:{changes:Number(result.changes)}}},sync(){return db.prepare(sql).run(...args)}}}
 async batch(stmts){this.sqlite.exec('BEGIN');try{const result=stmts.map(s=>s.sync());this.sqlite.exec('COMMIT');return result}catch(e){this.sqlite.exec('ROLLBACK');throw e}}
}
const sql=new DatabaseSync(':memory:');sql.exec(readFileSync('drizzle/0000_family.sql','utf8'));const env={DB:new D1(sql),ADMIN_LINK_KEY:'a-long-test-secret-not-production',ADMIN_PIN:'1986'};
async function api(path,body,token){const headers={'Origin':'https://tidisung.github.io','Content-Type':'application/json','CF-Connecting-IP':'test-'+crypto.randomUUID()};if(token)headers.Authorization='Bearer '+token;const res=await worker.fetch(new Request('https://api.test/api'+path,{method:body===undefined?'GET':'POST',headers,body:body===undefined?undefined:JSON.stringify(body)}),env);return {status:res.status,body:await res.json(),headers:res.headers}}
assert.equal((await api('/state')).status,401);
assert.equal((await api('/login',{key:'wrong',pin:'1986'})).status,401);
const login=await api('/login',{key:env.ADMIN_LINK_KEY,pin:'1986'});assert.equal(login.status,200);const admin=login.body.token;
assert.equal((await api('/state',undefined,admin)).body.children[0].stars,0);
const pair=await api('/pair/create',{child:0},admin);const code=new URL(pair.body.url).hash.slice(6);const paired=await api('/pair',{code});assert.equal(paired.status,200);const melody=paired.body.token;
assert.equal((await api('/pair',{code})).status,401);
const pair2=await api('/pair/create',{child:1},admin);const areum=(await api('/pair',{code:new URL(pair2.body.url).hash.slice(6)})).body.token;
const action=(data,t=admin)=>api('/action',{...data,requestId:crypto.randomUUID()},t);
assert.equal((await action({type:'give',child:0,amount:2,reason:'test'})).status,400);
assert.equal((await action({type:'give',child:0,amount:1,reason:'test'},melody)).status,400);
const old={children:[{stars:10,tickets:5},{stars:0,tickets:0}],history:[],threshold:10};assert.equal((await action({type:'import',snapshot:old})).status,200);
assert.equal((await action({type:'import',snapshot:old})).status,400);
const req={type:'give',child:0,amount:1,reason:'정리했어요',requestId:crypto.randomUUID()};const given=await api('/action',req,admin);assert.equal(given.status,200);assert.equal(given.body.state.children[0].stars,11);assert.equal((await api('/action',req,admin)).body.state.children[0].stars,11);
assert.equal((await action({type:'transfer',child:1,amount:1},melody)).status,400);
assert.equal((await action({type:'transfer',child:0,amount:3},melody)).status,200);
let state=(await api('/state',undefined,areum)).body;assert.equal(state.children[1].stars,3);assert.ok(state.history.every(h=>h.child===1));
assert.equal((await action({type:'convert',child:0},melody)).status,400);
const prize=await action({type:'roulette',child:0},melody);assert.equal(prize.status,200);assert.equal(prize.body.state.children[0].tickets,prize.body.card.rank===5?3:0);
assert.equal((await action({type:'roulette',child:0},melody)).status,400);
assert.equal((await action({type:'wish',cardId:prize.body.card.id,wish:'남의 소원'},areum)).status,400);
const counts=[0,0,0,0,0];for(let i=0;i<1000;i++)counts[pickPrize(i).rank-1]++;assert.deepEqual(counts,[30,100,200,335,335]);
for(const n of [0,30,130,330,665]){const data=initialState();data.children[0].tickets=5;const result=mutate(data,{role:'child',child:0},{type:'roulette',child:0},{id:'x',date:1,draw:n});assert.equal(data.children[0].tickets,n===665?3:0);assert.equal(result.events.length,1)}
// Independent clients' concurrent operations must both persist exactly once.
const results=await Promise.all([action({type:'give',child:1,amount:1,reason:'a'}),action({type:'give',child:1,amount:1,reason:'b'})]);assert.ok(results.every(r=>r.status===200));assert.equal((await api('/state',undefined,areum)).body.children[1].stars,5);
// Keep more than the UI page size in the durable event log.
for(let i=0;i<205;i++)assert.equal((await action({type:'give',child:1,amount:1,reason:'누적 '+i})).status,200);
const exportData=await api('/export',undefined,admin);assert.ok(exportData.body.history.length>200);assert.equal((await api('/export',undefined,melody)).status,403);
const recent=(await api('/state',undefined,areum)).body.history;assert.equal(recent.length,200);const older=await api('/history?before='+recent.at(-1).id,undefined,areum);assert.ok(older.body.history.length>0);
const devices=await api('/devices',undefined,admin);await api('/devices/revoke',{id:devices.body.devices.find(x=>x.child===1).id},admin);assert.equal((await api('/state',undefined,areum)).status,401);
const cors=await worker.fetch(new Request('https://api.test/api/state',{headers:{Origin:'https://evil.test'}}),env);assert.equal(cors.status,403);
await api('/logout',{},admin);assert.equal((await api('/state',undefined,admin)).status,401);
console.log('PASS: server auth, pairing/reuse/revocation, ownership, one-star awards, durable balances, idempotency, concurrent updates, exact roulette odds/refunds, >200 cumulative logs, pagination/export, CORS, logout.');
