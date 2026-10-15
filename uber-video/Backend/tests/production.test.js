const {test,before,after} = require('node:test');
const assert = require('node:assert/strict');
if (process.env.RUN_PRODUCTION_TESTS !== '1') test('production HTTP checks require RUN_PRODUCTION_TESTS=1', {skip:true},()=>{});
else {
let server,base;
before(async()=>{
 process.env.NODE_ENV='production';
 process.env.RENDER_EXTERNAL_URL='https://uber.example';
 const app=require('../app');
 server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});
 base='http://127.0.0.1:'+server.address().port;
});
after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
test('production serves SPA and admin page; API errors remain JSON',async()=>{
 for(const path of ['/','/admin','/ride-history']){const r=await fetch(base+path);assert.equal(r.status,200);assert.ok((await r.text()).includes('id="root"'));}
 const missing=await fetch(base+'/api/unknown');assert.equal(missing.status,404);assert.equal((await missing.json()).message,'API route not found');
 const privateRoute=await fetch(base+'/api/users/profile');assert.equal(privateRoute.status,401);assert.equal(privateRoute.headers.get('cache-control'),'no-store');
});
test('production health reflects disconnected DB and emits security headers',async()=>{
 const r=await fetch(base+'/health');assert.equal(r.status,503);assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.ok(r.headers.get('strict-transport-security'));
});
test('environment file cannot be downloaded and errors omit stacks',async()=>{
 const r=await fetch(base+'/Backend/.env');const body=await r.text();assert.ok(!body.includes('DB_CONNECT='));assert.ok(!body.includes('RAZORPAY_KEY_SECRET='));
 const bad=await fetch(base+'/api/users/login',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad json'});assert.equal(bad.status,400);assert.equal((await bad.json()).message,'Invalid request body');
});
test('production authentication attempts are rate limited',async()=>{
 let response;
 for(let i=0;i<21;i++)response=await fetch(base+'/api/users/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'invalid',password:'x'})});
 assert.equal(response.status,429);assert.ok(response.headers.get('ratelimit'));
});
}
