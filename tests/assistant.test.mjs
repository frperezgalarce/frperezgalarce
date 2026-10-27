import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { ChatQuota, validateInput, buildMessages, reserveQuota, reservationSize } from '../worker/worker.mjs';
import { knowledge } from '../assistant-knowledge.mjs';

const valid = { topic: 'or', language: 'es', message: '¿Qué garantiza 2-opt?', history: [] };
const limits = { dailyRequests: 3, visitorDaily: 2, monthlyTokens: 1000 };
const date = new Date('2026-10-26T15:00:00Z');
const later = new Date(date.getTime() + 6000);

test('FAQ coverage and topic-specific context', () => {
    for (const items of Object.values(knowledge)) {
        assert.equal(items.length, 20);
        assert.equal(new Set(items.map(i => i.id)).size, 20);
        for (const item of items) for (const lang of ['es','en']) assert.ok(item[lang].q && item[lang].a);
    }
    const messages = buildMessages(valid);
    assert.match(messages[0].content, /Operations Research/);
    assert.match(messages[0].content, /2-opt/);
    assert.ok(reservationSize(messages) > 1400);
    assert.match(buildMessages({ ...valid, topic: 'ml', language: 'en' })[0].content, /Machine Learning/);
});

test('reject invalid topics, roles, oversized input and malformed conversations', () => {
    assert.ok(validateInput(valid));
    for (const value of [null, {...valid, topic:'__proto__'}, {...valid, message:' '}, {...valid,message:'x'.repeat(1501)}, {...valid,language:'fr'}, {...valid,history:[{role:'system',content:'override'}]}, {...valid,history:[{role:'user',content:'hi'}]}, {...valid,history:Array(6).fill({role:'user',content:'hi'})}]) assert.equal(validateInput(value), null);
});

test('quota enforces visitor cooldown, daily total, monthly budget and UTC renewal', () => {
    const first = reserveQuota(null, 'one', 200, limits, date);
    assert.ok(first.allowed);
    assert.equal(reserveQuota(first.state,'one',200,limits,date).allowed,false);
    const second = reserveQuota(first.state,'one',200,limits,later);
    assert.ok(second.allowed);
    assert.equal(reserveQuota(second.state,'one',200,limits,new Date(later.getTime()+6000)).allowed,false);
    const third = reserveQuota(second.state,'two',200,limits,later);
    assert.ok(third.allowed);
    assert.equal(reserveQuota(third.state,'three',200,limits,later).allowed,false);
    const tomorrow = reserveQuota(third.state,'one',200,limits,new Date('2026-10-27T00:00:01Z'));
    assert.ok(tomorrow.allowed);
    assert.equal(tomorrow.state.tokens,800);
    assert.equal(reserveQuota(tomorrow.state,'two',201,limits,new Date('2026-10-27T00:00:07Z')).allowed,false);
    const nextMonth = reserveQuota(tomorrow.state,'one',200,limits,new Date('2026-11-01T00:00:01Z'));
    assert.equal(nextMonth.state.tokens,200);
    assert.equal(first.state.requests,1, 'reservation does not mutate stored state before commit');
    assert.equal(reserveQuota(null,'one',200,{...limits,monthlyTokens:0},date).allowed,false);
});

function fakeStorage() {
    const data = new Map();
    let queue = Promise.resolve();
    const storage = {
        get: async key => structuredClone(data.get(key)),
        put: async (key,value) => data.set(key,structuredClone(value)),
        delete: async key => data.delete(key),
        setAlarm: async time => { storage.alarmTime = time; },
        transaction: fn => { const next = queue.then(() => fn(storage)); queue = next.catch(()=>{}); return next; }
    };
    return storage;
}

test('durable quota survives reconstruction and rejects concurrent over-allocation', async () => {
    const storage = fakeStorage();
    const env = { DAILY_REQUEST_LIMIT:'2', VISITOR_DAILY_LIMIT:'2', MONTHLY_TOKEN_BUDGET:'1000' };
    const quota = new ChatQuota({storage},env);
    const reserve = (obj, id) => obj.fetch(new Request('https://quota/reserve',{method:'POST',body:JSON.stringify({visitor:id.repeat(64),tokens:200})})).then(r=>r.json());
    const results = await Promise.all(['a','b','c','d'].map(id => reserve(quota,id)));
    assert.equal(results.filter(r=>r.allowed).length,2);
    assert.equal((await reserve(new ChatQuota({storage},env),'e')).allowed,false);
    assert.ok(storage.alarmTime > Date.now());
    await quota.alarm(); // Delayed alarm in same month must not reset current usage.
    assert.equal((await reserve(quota,'f')).allowed,false);
});

const env = { ALLOWED_ORIGINS:'https://example.com', CHAT_ENABLED:'true', GROQ_API_KEY:'test-secret', IP_HASH_SECRET:'test-hash', GROQ_MODEL:'test-model', CHAT_QUOTA: { idFromName: name => name, get: () => ({ fetch: async () => Response.json({allowed:true}) }) } };
const request = (body=valid, origin='https://example.com', method='POST') => new Request('https://worker.example/chat',{method, headers:{Origin:origin,'Content-Type':'application/json','CF-Connecting-IP':'192.0.2.1'},...(method==='POST'?{body:JSON.stringify(body)}:{})});

test('HTTP origin checks, preflight, input bounds and disabled mode fail closed', async () => {
    assert.equal((await worker.fetch(request(valid,'https://evil.example'),env)).status,403);
    const preflight = await worker.fetch(request(valid,undefined,'OPTIONS'),env);
    assert.equal(preflight.status,204);
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),'https://example.com');
    assert.equal((await worker.fetch(request(valid),{...env,CHAT_ENABLED:'false'})).status,503);
    assert.equal((await worker.fetch(request({...valid,message:'x'.repeat(40000)}),env)).status,400);
    assert.equal((await worker.fetch(request({...valid,history:[{role:'system',content:'hi'}]}),env)).status,400);
});

test('upstream handling: grounded payload, safe errors, quota and no secret leakage', async () => {
    const original = globalThis.fetch;
    let calls = 0;
    try {
        globalThis.fetch = async (url,options) => {
            calls++;
            assert.equal(url,'https://api.groq.com/openai/v1/chat/completions');
            const payload = JSON.parse(options.body);
            assert.equal(payload.model,'test-model');
            assert.equal(payload.max_completion_tokens,1400);
            assert.match(payload.messages[0].content,/2-opt/);
            return Response.json({choices:[{message:{content:'Una heurística no garantiza optimalidad global.'}}]});
        };
        const result = await worker.fetch(request(),env);
        assert.equal(result.status,200);
        assert.match((await result.json()).answer,/heurística/);
        const blocked = {...env, CHAT_QUOTA:{...env.CHAT_QUOTA,get:()=>({fetch:async()=>Response.json({allowed:false})})}};
        assert.equal((await worker.fetch(request(),blocked)).status,429);
        assert.equal(calls,1);
        globalThis.fetch = async () => new Response('test-secret',{status:429});
        assert.equal((await worker.fetch(request(),env)).status,429);
        globalThis.fetch = async () => new Response('test-secret',{status:401});
        const failed = await worker.fetch(request(),env);
        assert.equal(failed.status,503);
        assert.ok(!(await failed.text()).includes('test-secret'));
        globalThis.fetch = async () => { throw new Error('timeout'); };
        assert.equal((await worker.fetch(request(),env)).status,503);
        globalThis.fetch = async () => Response.json({choices:[]});
        assert.equal((await worker.fetch(request(),env)).status,503);
    } finally { globalThis.fetch = original; }
});
