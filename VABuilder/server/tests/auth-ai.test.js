import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createFirebaseVerifier } from '../config/firebase.js';
import { generateGeminiResponse } from '../config/gemini.js';
import { User } from '../models/user.model.js';
const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const publicKey = keys.publicKey.export({ type: 'spki', format: 'pem' });
const now = Math.floor(Date.now()/1000);
const identity = { sub: 'google-user', email: 'rider@example.com', email_verified: true, auth_time: now - 10, firebase: { sign_in_provider: 'google.com' } };
const sign = (overrides={},options={}) => jwt.sign({...identity,...overrides},keys.privateKey,{algorithm:'RS256',keyid:'key1',audience:'project-test',issuer:'https://securetoken.google.com/project-test',expiresIn:300,...options});
let certificateRequests=0;
const verify = createFirebaseVerifier('project-test', async()=>{certificateRequests++;return {ok:true,headers:new Headers({'cache-control':'max-age=300'}),json:async()=>({key1:publicKey})};});
test('valid Google identity verifies and certificates are cached',async()=>{
 assert.equal((await verify(sign())).email,'rider@example.com');await verify(sign());assert.equal(certificateRequests,1);
});
test('forged, expired, wrong-project and unverified identities are rejected',async()=>{
 await assert.rejects(verify(jwt.sign(identity,'forged',{keyid:'key1'})));
 await assert.rejects(verify(sign({}, {audience:'other-project'})));
 await assert.rejects(verify(sign({}, {expiresIn:-1})));
 await assert.rejects(verify(sign({email_verified:false})));
 await assert.rejects(verify(sign({auth_time:now+1000})));
 await assert.rejects(verify(undefined));
});
test('Gemini quota response persists a schema-valid quota state',async()=>{
 const original=global.fetch;
 const user=new User({name:'Test',email:'test@example.com'});let saved=false;
 user.save=async()=>{await user.validate();saved=true;};
 global.fetch=async()=>({ok:false,status:429,json:async()=>({error:{message:'Quota exhausted'}})});
 try{await assert.rejects(generateGeminiResponse({prompt:'hello',apikey:'test-key',user}),/quota exceeded/i);assert.equal(user.geminiStatus,'quota_exceeded');assert.equal(saved,true);}finally{global.fetch=original;}
});
test('Gemini returns trimmed generated text',async()=>{
 const original=global.fetch;global.fetch=async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:'  Hello  '}]}}]})});
 try{assert.equal(await generateGeminiResponse({prompt:'hello',apikey:'test-key'}),'Hello');}finally{global.fetch=original;}
});
