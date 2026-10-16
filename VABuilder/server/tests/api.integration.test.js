import {test,before,after,mock} from 'node:test';
import assert from 'node:assert/strict';
import 'dotenv/config';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import {User} from '../models/user.model.js';
import {Billing} from '../models/billing.model.js';
if(process.env.RUN_VA_INTEGRATION!=='1')test('database API checks require RUN_VA_INTEGRATION=1',{skip:true},()=>{});
else {
let server,base,user,other,token;const dbName='codex_va_test_'+Date.now();
before(async()=>{
 process.env.NODE_ENV='test';await mongoose.connect(process.env.MONGODB_URL,{dbName,serverSelectionTimeoutMS:6000});
 user=await User.create({name:'Test User',email:'test@example.com',geminiApiKey:'private-test-key'});
 other=await User.create({name:'Other',email:'other@example.com'});
 token=jwt.sign({userId:user._id},process.env.JWT_SECRET);
 const {default:app}=await import('../app.js');server=await new Promise(resolve=>{const s=app.listen(0,'127.0.0.1',()=>resolve(s));});base='http://127.0.0.1:'+server.address().port;
});
after(async()=>{mock.restoreAll();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}if(mongoose.connection.name===dbName)await mongoose.connection.dropDatabase();await mongoose.disconnect();});
const request=(path,method='GET',body,auth=true)=>fetch(base+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});
test('unverified name/email cannot impersonate a Google user',async()=>{const r=await request('/api/auth/google','POST',{name:'Someone',email:'test@example.com'},false);assert.equal(r.status,401);});
test('current user and public widget config never return the Gemini key',async()=>{
 const data=await(await request('/api/user/current-user')).json();assert.equal(data.data.hasGeminiApiKey,true);assert.equal(data.data.geminiApiKey,undefined);
 const config=await(await request('/api/assistant/config/'+user._id)).json();assert.equal(config.data.email,undefined);assert.equal(config.data.geminiApiKey,undefined);assert.equal(config.data.assistantName,'V A');
});
test('saving assistant preserves existing Gemini key and returns expected API shape',async()=>{
 const r=await request('/api/user/save-assistant','POST',{assistantName:'Helper',buisnessName:'Store',buisnessType:'Shop',buisnessDescription:'Demo',theme:'dark',tone:'friendly',pages:[{name:'Home',path:'/',keywords:['home']}]});assert.equal(r.status,200);
 const result=await r.json();assert.equal(result.data.assistantName,'Helper');assert.equal(result.data.hasGeminiApiKey,true);assert.equal(result.data.geminiApiKey,undefined);assert.equal((await User.findById(user._id)).geminiApiKey,'private-test-key');
});
test('foreign orders and forged payment signatures cannot upgrade accounts',async()=>{
 await Billing.create({userId:other._id,amount:299,plan:'pro',orderId:'order_foreign'});
 const r=await request('/api/billing/verify','POST',{razorpay_order_id:'order_foreign',razorpay_payment_id:'pay_test',razorpay_signature:'a'.repeat(64)});assert.equal(r.status,404);
 await Billing.create({userId:user._id,amount:299,plan:'pro',orderId:'order_own'});
 const forged=await request('/api/billing/verify','POST',{razorpay_order_id:'order_own',razorpay_payment_id:'pay_test',razorpay_signature:'a'.repeat(64)});assert.equal(forged.status,400);assert.equal((await User.findById(user._id)).plan,'free');
});
test('captured matching payment upgrades user; duplicate callback remains idempotent',async()=>{
 const {razorpay}=await import('../config/razorpay.js');let calls=0;
 mock.method(razorpay.payments,'fetch',async()=>{calls++;return{id:'pay_test',order_id:'order_own',amount:29900,currency:'INR',status:'captured'};});
 const body={razorpay_order_id:'order_own',razorpay_payment_id:'pay_test',razorpay_signature:crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET).update('order_own|pay_test').digest('hex')};
 const r=await request('/api/billing/verify','POST',body);assert.equal(r.status,200);const data=await r.json();assert.equal(data.data.user.plan,'pro');assert.equal(data.data.user.geminiApiKey,undefined);
 assert.equal((await request('/api/billing/verify','POST',body)).status,200);assert.equal(calls,1);
});
test('invalid widget input fails cleanly instead of calling toLowerCase on objects',async()=>{const r=await request('/api/assistant/ask','POST',{userId:user._id,message:{bad:true}},false);assert.equal(r.status,400);});
test('gateway authentication failure is reported without exposing credentials',async()=>{
 const {razorpay}=await import('../config/razorpay.js');
 const stub=mock.method(razorpay.orders,'create',async()=>{throw {statusCode:401,error:{description:'Authentication failed'}};});
 try{const response=await request('/api/billing/order','POST',{plan:'pro'});assert.equal(response.status,502);const data=await response.json();assert.match(data.message,/valid matching pair/);assert.ok(!JSON.stringify(data).includes(process.env.RAZORPAY_KEY_SECRET));}finally{stub.mock.restore();}
});
test('order creation returns nested order and authoritative public checkout key',async()=>{
 const {razorpay}=await import('../config/razorpay.js');
 const stub=mock.method(razorpay.orders,'create',async values=>{assert.equal(values.amount,29900);return {id:'order_create_regression',amount:29900,currency:'INR'};});
 try{const response=await request('/api/billing/order','POST',{plan:'pro'});assert.equal(response.status,200);const data=await response.json();assert.equal(data.data.order.amount,29900);assert.equal(data.data.keyId,process.env.RAZORPAY_KEY_ID);assert.equal((await Billing.findOne({orderId:'order_create_regression'})).userId.toString(),user._id.toString());}finally{stub.mock.restore();}
});
}
