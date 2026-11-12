// Run after next build, with only synthetic accounts and documents.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
assert.ok(url && anon && process.env.SUPABASE_SERVICE_ROLE_KEY, 'Supabase configuration required');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, options);
const origin = 'http://127.0.0.1:3099';
const accounts = [], clientIds = [], paths = [];
let server;
const must = result => { assert.ifError(result.error); return result.data; };
const request = (path, cookie = '', init = {}) => fetch(origin + path, { ...init, redirect: 'manual', headers: { ...init.headers, Cookie: cookie } });
async function waitForServer() {
  const end = Date.now() + 30000;
  while (Date.now() < end) {
    try { const r = await request('/'); if (r.ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error('Portal test server did not start');
}
try {
  for (let index = 0; index < 3; index++) {
    const email = `numeracount-portal-test-${randomUUID()}@example.com`;
    const password = randomUUID() + randomUUID();
    const { user } = must(await admin.auth.admin.createUser({ email, password, email_confirm: true }));
    accounts.push({ id: user.id, email, cookie: '' });
    const jar = new Map();
    const session = createServerClient(url, anon, { cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: values => values.forEach(({name, value}) => jar.set(name, value)),
    }});
    must(await session.auth.signInWithPassword({ email, password }));
    accounts[index].cookie = [...jar].map(([key, value]) => `${key}=${value}`).join('; ');
    if (index < 2) {
      const client = must(await admin.from('clients').insert({ name: `Synthetic portal test ${index}`, email, auth_user_id: user.id }).select('id').single());
      clientIds.push(client.id);
    } else {
      must(await admin.from('profiles').update({role:'staff'}).eq('id', user.id));
    }
  }
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3099'], {
    env: { ...process.env, PORTAL_ENABLED: 'true', SITE_URL: origin }, stdio: ['ignore', 'ignore', 'inherit'],
  });
  await waitForServer();
  const [a,b,staff] = accounts;
  assert.equal((await request('/portal')).status,307, 'Anonymous portal entry must redirect');
  const dashboard = await request('/portal',a.cookie);
  assert.equal(dashboard.status,200);
  const html = await dashboard.text();
  assert.ok(html.includes('Synthetic portal test 0'));
  assert.ok(!html.includes('Synthetic portal test 1'), 'Dashboard must not expose another client');
  assert.equal((await request(`/portal/${clientIds[1]}`,a.cookie)).status,404, 'Other client page must be hidden');
  const endpoint = `/api/clients/${clientIds[0]}/files`;
  const payload = {method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({name:'test.txt',size:26})};
  assert.equal((await request(endpoint,b.cookie,payload)).status,403,'Cross-client signed upload must fail');
  assert.equal((await request('/api/clients',a.cookie,{...payload,body:JSON.stringify({name:'Forged staff operation',email:a.email})})).status,403,'Clients cannot create spaces');
  assert.equal((await request(endpoint,a.cookie,{...payload,headers:{...payload.headers,Origin:'https://other.example'}})).status,403,'Cross-origin signing must fail');
  assert.equal((await request(endpoint,a.cookie,{...payload,body:JSON.stringify({name:'large.txt',size:10485761})})).status,400,'Oversized request must fail');
  const signedResponse = await request(endpoint,a.cookie,payload);
  assert.equal(signedResponse.status,200,'Own upload authorization must succeed');
  const signed = await signedResponse.json();
  assert.ok(signed.path.startsWith(a.id+'/'),'Signed path must be generated from authorized account');
  paths.push(signed.path);
  const body = new Blob(['Synthetic portal test file']);
  const storage = createClient(url,anon,options).storage.from('Client-Documents');
  must(await storage.uploadToSignedUrl(signed.path,signed.token,body));
  const fileId = signed.path.split('/')[1];
  const downloadPath = endpoint+'/'+encodeURIComponent(fileId);
  const download = await request(downloadPath,a.cookie);
  assert.equal(download.status,200);
  assert.equal(await download.text(),await body.text());
  assert.equal(download.headers.get('cache-control'),'private, no-store');
  assert.ok(download.headers.get('content-disposition').startsWith('attachment;'));
  assert.equal((await request(downloadPath,b.cookie)).status,403,'Cross-client download must fail');
  assert.equal((await request(`/api/clients/${clientIds[1]}/files/${encodeURIComponent(fileId)}`,b.cookie)).status,404,'File ID cannot be used in a different space');
  assert.equal((await request(downloadPath,a.cookie,{method:'DELETE'})).status,405,'Delete endpoint must not exist');
  const staffDashboard = await request('/portal',staff.cookie);
  const staffHtml = await staffDashboard.text();
  assert.ok(staffHtml.includes('Synthetic portal test 0') && staffHtml.includes('Synthetic portal test 1'));
  assert.equal((await request(downloadPath,staff.cookie)).status,200,'Staff can download client documents');
  const staffUpload = await request(endpoint,staff.cookie,payload);
  assert.equal(staffUpload.status,200,'Staff can authorize upload to a client space');
  const staffSigned = await staffUpload.json();
  paths.push(staffSigned.path);
  must(await storage.uploadToSignedUrl(staffSigned.path,staffSigned.token,body));
  assert.equal((await request(endpoint+'/'+encodeURIComponent(staffSigned.path.split('/')[1]),a.cookie)).status,200,'Client can download staff file');
  console.log('PASS PORTAL: session login, client dashboard isolation, page/API authorization, own upload/download, staff exchange, attachment headers, CSRF denial, no delete endpoint');
} finally {
  if (server) server.kill('SIGTERM');
  if (paths.length) must(await admin.storage.from('Client-Documents').remove(paths));
  if (clientIds.length) must(await admin.from('clients').delete().in('id',clientIds));
  for (const account of accounts) must(await admin.auth.admin.deleteUser(account.id));
}
