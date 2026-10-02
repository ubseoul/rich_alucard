import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {validate, digest, missingSources} from './sources.mjs';

const source = overrides => ({source_id:'fixture-source', title:'Fixture', path:'source.txt',
  source_type:'test input', authority_status:'SUPPORTING', spoiler_class:'OPEN',
  feature_ids:['F01'], owner:'HQ', provenance:'Test fixture', present:true,
  notes:'Test fixture only', ...overrides});
const manifest = sources => ({schema_version:1, base_production_commit:'a'.repeat(40), sources});
function fixture(fn) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'ra-source-vault-'));
  writeFileSync(path.join(root, 'source.txt'), 'Original\r\ntext\r\n');
  try {return fn(root);} finally {rmSync(root, {recursive:true, force:true});}
}
const has = (errors, text) => assert.ok(errors.some(error => error.includes(text)), errors.join('\n'));

test('valid exact-byte and LF-mode hashes; changed source rejected', () => fixture(root => {
  const raw = source({sha256:digest(Buffer.from('Original\r\ntext\r\n'))});
  assert.deepEqual(validate(manifest([raw]), root), []);
  const lf = source({sha256:digest(Buffer.from('Original\ntext\n')), hash_mode:'lf'});
  assert.deepEqual(validate(manifest([lf]), root), []);
  writeFileSync(path.join(root, 'source.txt'), 'changed content');
  has(validate(manifest([raw]), root), 'sha256 mismatch');
  has(validate(manifest([lf]), root), 'sha256 mismatch');
}));

test('duplicate IDs and malformed enums/features are rejected', () => fixture(root => {
  has(validate(manifest([source({}), source({})]), root), 'duplicate source_id');
  for (const [change, message] of [
    [{authority_status:'APPROVED'}, 'invalid authority_status'],
    [{spoiler_class:'PUBLIC'}, 'invalid spoiler_class'],
    [{feature_ids:['F1']}, 'feature_ids'],
    [{feature_ids:['F01', 'F01']}, 'feature_ids'],
    [{present:'true'}, 'present must be boolean'],
    [{sha256:'not-a-hash'}, 'invalid sha256'],
    [{source_commit:'short'}, 'invalid source_commit'],
  ]) has(validate(manifest([source(change)]), root), message);
}));

test('present file absent or directory path fails', () => fixture(root => {
  has(validate(manifest([source({path:'missing.txt'})]), root), 'file missing');
  mkdirSync(path.join(root, 'directory'));
  has(validate(manifest([source({path:'directory'})]), root), 'not a file');
  has(validate(manifest([source({path:null})]), root), 'requires a file path');
}));

test('absolute paths, traversal and unsafe source paths fail before opening', () => fixture(root => {
  for (const value of ['../outside.txt', '/absolute.txt', 'C:/absolute.txt', 'folder\\file', '.git/config', '.Git/config', 'sealed/payload.txt', 'private_overlay/payload.txt', 'folder/DO_NOT_OPEN.txt', 'unsafe\npath']) {
    has(validate(manifest([source({path:value})]), root), 'safe repository-relative');
  }
  has(validate(manifest([source({source_path:'../outside.txt'})]), root), 'invalid source_path');
}));

test('required inputs validate without fictitious files and either missing condition is listed', () => fixture(root => {
  const absent = source({path:null, present:false, authority_status:'SOURCE_REQUIRED'});
  assert.deepEqual(validate(manifest([absent]), root), []);
  assert.equal(missingSources(manifest([absent])).length, 1);
  assert.equal(missingSources(manifest([source({authority_status:'SOURCE_REQUIRED'})])).length, 1);
  assert.equal(missingSources(manifest([source({path:null, present:false})])).length, 1);
  assert.equal(missingSources(manifest([source({})])).length, 0);
  has(validate(manifest([source({present:false})]), root), 'absent source must have path=null');
}));

test('PRIVATE/SEALED allow safe absent metadata and reject payload/hash without reading', () => fixture(root => {
  for (const spoiler_class of ['PRIVATE', 'SEALED']) {
    assert.deepEqual(validate(manifest([source({spoiler_class, path:null, present:false})]), root), []);
    has(validate(manifest([source({spoiler_class, path:'do-not-read.txt'})]), root), 'restricted source must remain metadata-only');
    has(validate(manifest([source({spoiler_class, path:null, present:false, sha256:'0'.repeat(64)})]), root), 'restricted source must remain metadata-only');
  }
}));
