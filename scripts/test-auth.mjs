// End-to-end auth checks use synthetic users and generated links, never email.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL, anon=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
assert.ok(url && anon && process.env.SUPABASE_SERVICE_ROLE_KEY,'Supabase configuration required');
const admin=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const origin='http://127.0.0.1:3100', users=[],spaces=[];
const must=result=>{assert.ifError(result.error);return result.data;};
const cookieFrom=response=>response.headers.getSetCookie().filter(value=>!value.includes('Max-Age=0')).map(value=>value.split(';')[0]).join('; ');
const request=(path,cookie='',init={})=>fetch(origin+path,{...init,redirect:'manual',headers:{Origin:origin,'Content-Type':'application/json',...init.headers,Cookie:cookie}});
const post=(path,body,cookie='',headers={})=>request(path,cookie,{method:'POST',body:JSON.stringify(body),headers});
let server;
async function openGeneratedLink(type,email){
 const data=must(await admin.auth.admin.generateLink({type,email,options:{redirectTo:'https://www.numeracount.com/auth/callback'}}));
 if(type==='invite') users.push(data.user);
 const response=await fetch(data.properties.action_link,{redirect:'manual'});
 assert.ok([302,303].includes(response.status),'Email action must redirect');
 const location=new URL(response.headers.get('location'));
 assert.equal(location.pathname,'/auth/callback','Existing callback must be used');
 const params=new URLSearchParams(location.hash.slice(1));
 assert.ok(params.get('access_token') && params.get('refresh_token'),'Email verification must establish a session');
 assert.equal(params.get('type'),type);
 const jar=new Map();
 const session=createServerClient(url,anon,{cookies:{getAll:()=>[...jar].map(([name,value])=>({name,value})),setAll:values=>values.forEach(({name,value})=>jar.set(name,value))}});
 must(await session.auth.setSession({access_token:params.get('access_token'),refresh_token:params.get('refresh_token')}));
 const identity=must(await session.auth.getUser()).user;
 assert.equal(identity.email,email);
 const replay=await fetch(data.properties.action_link,{redirect:'manual'});
 assert.ok(!new URLSearchParams(new URL(replay.headers.get('location')).hash.slice(1)).has('access_token'),'Setup/recovery links must be single use');
 return [...jar].map(([name,value])=>`${name}=${value}`).join('; ');
}
try{
 for(let i=0;i<2;i++){
  const email=`numeracount-auth-test-${randomUUID()}@example.com`,password=randomUUID()+randomUUID();
  const {user}=must(await admin.auth.admin.createUser({email,password,email_confirm:true}));
  users.push({...user,password});
  const space=must(await admin.from('clients').insert({name:`Auth test ${i}`,email,auth_user_id:user.id}).select('id').single());spaces.push(space.id);
 }
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3100'],{env:{...process.env,PORTAL_ENABLED:'true',SITE_URL:origin},stdio:['ignore','ignore','inherit']});
 const end=Date.now()+30000;let started=false;
 while(Date.now()<end){try{const r=await request('/');if(r.ok){started=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,250));}
 assert.ok(started,'Auth test server must start');
 const [a,b]=users;
 const loginPage=await request('/login');const markup=await loginPage.text();
 assert.ok(markup.includes('current-password') && markup.includes('Set up or reset password'));
 assert.equal((await post('/api/auth/sign-in',{email:a.email,password:a.password},'',{Origin:'https://other.example'})).status,403);
 assert.equal((await post('/api/auth/sign-in',{email:'invalid',password:'invalid'})).status,400);
 assert.equal((await post('/api/auth/sign-in',{email:a.email,password:'Incorrect-password-123'})).status,401);
 const signIn=await post('/api/auth/sign-in',{email:a.email,password:a.password});assert.equal(signIn.status,200);
 const cookieA=cookieFrom(signIn);assert.ok(cookieA,'Password login must set session cookies');
 const own=await request('/portal',cookieA);assert.equal(own.status,200);const html=await own.text();assert.ok(html.includes('Auth test 0')&&!html.includes('Auth test 1'));
 assert.equal((await request(`/portal/${spaces[1]}`,cookieA)).status,404);
 assert.equal((await post('/api/auth/password',{password:'Another-long-password'})).status,401);
 assert.equal((await post('/api/auth/password',{password:'Another-long-password'},cookieA,{Origin:'https://other.example'})).status,403);
 assert.equal((await post('/api/auth/password',{password:'short'},cookieA)).status,400);
 assert.equal((await post('/api/auth/recover',{email:'invalid'})).status,400);
 assert.equal((await post('/api/auth/recover',{email:a.email},'',{Origin:'https://other.example'})).status,403);
 const callback=await request('/auth/callback');assert.equal(new URL(callback.headers.get('location'),origin).pathname,'/auth/password');
 const openRedirect=await request('/auth/callback?next=https://other.example');assert.equal(new URL(openRedirect.headers.get('location'),origin).origin,origin);
 const recovered=await openGeneratedLink('recovery',a.email);
 const newPassword=randomUUID()+randomUUID();
 assert.equal((await post('/api/auth/password',{password:newPassword},recovered)).status,200,'Recovery session must set only its own password');
 assert.equal((await post('/api/auth/sign-in',{email:a.email,password:a.password})).status,401,'Old password must stop working');
 const newLogin=await post('/api/auth/sign-in',{email:a.email,password:newPassword});assert.equal(newLogin.status,200,'New password must sign in');
 assert.equal((await request(`/portal/${spaces[0]}`,cookieFrom(newLogin))).status,200);
 assert.equal((await request(`/portal/${spaces[1]}`,cookieFrom(newLogin))).status,404);
 assert.equal((await post('/api/auth/sign-in',{email:b.email,password:b.password})).status,200,'Other account password must remain unchanged');
 const invitationEmail=`numeracount-invite-test-${randomUUID()}@example.com`;
 const invited=await openGeneratedLink('invite',invitationEmail);
 const invitePassword=randomUUID()+randomUUID();
 assert.equal((await post('/api/auth/password',{password:invitePassword},invited)).status,200);
 assert.equal((await post('/api/auth/sign-in',{email:invitationEmail,password:invitePassword})).status,200,'Invitee must be able to set a password and sign in');
 console.log('PASS AUTH: password sign-in and session cookies, invalid login, origin checks, recovery, single-use links, new-invite password setup, unchanged client isolation');
}finally{
 if(server) server.kill('SIGTERM');
 if(spaces.length)must(await admin.from('clients').delete().in('id',spaces));
 for(const user of users)must(await admin.auth.admin.deleteUser(user.id));
}
