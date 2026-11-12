import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const required = name => { if (!process.env[name]) throw new Error(`Missing ${name}`); return process.env[name]; };
const url = required('NEXT_PUBLIC_SUPABASE_URL');
const anon = required('NEXT_PUBLIC_SUPABASE_ANON_KEY');
const admin = createClient(url, required('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
const bucket = 'Client-Documents';
const users = [], paths = [];
const bytes = new Blob(['Numeracount synthetic access test'], { type: 'text/plain' });
const client = () => createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
async function upload(storage, path, value = bytes, options = {}) {
  const result = await storage.upload(path, value, options);
  if (!result.error) paths.push(path);
  return result;
}
try {
  const { data: config, error } = await admin.storage.getBucket(bucket);
  assert.ifError(error);
  assert.equal(config.public, false, 'Bucket must be private');
  assert.equal(Number(config.file_size_limit), 10485760, 'Bucket must enforce 10 MB');
  for (let i = 0; i < 2; i++) {
    const email = `numeracount-test-${randomUUID()}@example.com`, password = randomUUID() + randomUUID();
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    assert.ifError(error);
    users.push(data.user);
    const session = client();
    const login = await session.auth.signInWithPassword({ email, password });
    assert.ifError(login.error);
    users[i].session = session;
  }
  const [a, b] = users;
  const sa = a.session.storage.from(bucket), sb = b.session.storage.from(bucket);
  const pathA = `${a.id}/${randomUUID()}_test.txt`, pathB = `${b.id}/${randomUUID()}_test.txt`;
  assert.ifError((await upload(sa, pathA)).error);
  assert.ifError((await upload(sb, pathB)).error);
  const own = await sa.download(pathA);
  assert.ifError(own.error);
  assert.equal(await own.data.text(), await bytes.text());
  assert.ok((await sb.download(pathA)).error, 'Cross-client download must fail');
  const foreignList = await sb.list(a.id);
  assert.ok(foreignList.error || foreignList.data.length === 0, 'Cross-client list must be empty');
  assert.ok((await upload(sb, `${a.id}/${randomUUID()}_forged.txt`)).error, 'Cross-client upload must fail');
  assert.ok((await sb.createSignedUrl(pathA, 60)).error, 'Cross-client signed download must fail');
  assert.ok((await sb.createSignedUploadUrl(`${a.id}/${randomUUID()}_forged.txt`)).error, 'Cross-client signed upload must fail');
  assert.ok((await upload(sa, pathA, bytes, { upsert: true })).error, 'Overwrite must fail');
  const removed = await sa.remove([pathA]);
  assert.ok(removed.error || removed.data.length === 0, 'Client deletion must not remove a file');
  assert.ifError((await sa.download(pathA)).error);
  const movedPath = `${a.id}/${randomUUID()}_moved.txt`;
  paths.push(movedPath);
  assert.ok((await sa.move(pathA, movedPath)).error, 'Move must fail');
  const signedPath = `${a.id}/${randomUUID()}_signed.txt`;
  const signed = await sa.createSignedUploadUrl(signedPath, { upsert: false });
  assert.ifError(signed.error);
  paths.push(signedPath);
  assert.ifError((await client().storage.from(bucket).uploadToSignedUrl(signedPath, signed.data.token, bytes)).error);
  assert.ok((await client().storage.from(bucket).uploadToSignedUrl(signedPath, signed.data.token, bytes)).error, 'Signed upload cannot replace existing files');
  assert.ok((await upload(sa, `${a.id}/${randomUUID()}_large.txt`, new Blob([new Uint8Array(10485761)]))).error, 'Oversized upload must fail');
  const unauthenticated = client().storage.from(bucket);
  assert.ok((await unauthenticated.download(pathA)).error, 'Anonymous download must fail');
  assert.ok((await upload(unauthenticated, `${a.id}/${randomUUID()}_anonymous.txt`)).error, 'Anonymous upload must fail');
  console.log('PASS: private bucket, own access, signed upload, client isolation, no overwrite/move/delete, size limit, anonymous denial');
} finally {
  if (paths.length) {
    const { error } = await admin.storage.from(bucket).remove(paths);
    assert.ifError(error);
  }
  for (const user of users) assert.ifError((await admin.auth.admin.deleteUser(user.id)).error);
}
