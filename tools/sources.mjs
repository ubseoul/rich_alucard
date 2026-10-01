#!/usr/bin/env node
// Build-time registry checks only. No source contents are printed or executed.
import {readFileSync, statSync, realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const authorities = new Set(['AUTHORITATIVE', 'SUPPORTING', 'HISTORICAL', 'PROPOSED', 'SOURCE_REQUIRED']);
const spoilers = new Set(['OPEN', 'PRIVATE', 'SEALED']);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
export const digest = (bytes, mode = 'bytes') => createHash('sha256')
  .update(mode === 'lf' ? Buffer.from(bytes.toString('utf8').replace(/\r\n/g, '\n')) : bytes).digest('hex');
const safePath = value => nonempty(value) && !/[\x00-\x1f\x7f]/.test(value) && !value.includes('\\') && !value.includes(':') &&
  !value.startsWith('/') && !value.split('/').some(part => !part || part === '.' || part === '..') &&
  !/^(?:\.git|node_modules|private_overlay|sealed_overlay|overlay|hq|\.hq|dist-private)(?:\/|$)/i.test(value) &&
  !/(?:hq_only|do_not_open|(?:^|[\/_.-])sealed(?:[\/_.-]|$))/i.test(value);
const within = (base, target) => {const relative = path.relative(base, target); return relative !== '' && !relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative);};

export function validate(manifest, repoRoot = root) {
  const errors = [], ids = new Set();
  const fail = (label, message) => errors.push(`${label}: ${message}`);
  if (!object(manifest) || manifest.schema_version !== 1 || !Array.isArray(manifest.sources)) {
    return ['manifest: expected schema_version=1 and a sources array'];
  }
  if (!/^[a-f0-9]{40}$/.test(manifest.base_production_commit || '')) fail('manifest', 'invalid base_production_commit');
  for (let index = 0; index < manifest.sources.length; index++) {
    const source = manifest.sources[index], label = `source[${index}]`;
    if (!object(source)) {fail(label, 'expected an object'); continue;}
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.source_id || '')) fail(label, 'invalid source_id');
    if (ids.has(source.source_id)) fail(label, 'duplicate source_id');
    ids.add(source.source_id);
    for (const field of ['title', 'source_type', 'owner', 'provenance', 'notes']) {
      if (!nonempty(source[field])) fail(label, `missing or empty ${field}`);
    }
    if (!authorities.has(source.authority_status)) fail(label, 'invalid authority_status');
    if (!spoilers.has(source.spoiler_class)) fail(label, 'invalid spoiler_class');
    if (typeof source.present !== 'boolean') fail(label, 'present must be boolean');
    if (!Array.isArray(source.feature_ids) || source.feature_ids.some(id => typeof id !== 'string' || !/^(?:F\d{2}|T10|CEO_ENCOUNTER)$/.test(id)) || new Set(source.feature_ids).size !== source.feature_ids.length) fail(label, 'invalid or duplicate feature_ids');
    if (source.source_commit != null && !/^[a-f0-9]{40}$/.test(source.source_commit)) fail(label, 'invalid source_commit');
    if (source.source_branch != null && !nonempty(source.source_branch)) fail(label, 'invalid source_branch');
    if (source.source_path != null && !safePath(source.source_path)) fail(label, 'invalid source_path');
    if (source.sha256 != null && !/^[a-f0-9]{64}$/.test(source.sha256)) fail(label, 'invalid sha256');
    if (source.hash_mode != null && !['bytes', 'lf'].includes(source.hash_mode)) fail(label, 'invalid hash_mode');
    if (source.hash_mode != null && source.sha256 == null) fail(label, 'hash_mode requires sha256');
    if (source.path !== null && !safePath(source.path)) {fail(label, 'path must be null or a safe repository-relative file path'); continue;}
    // This is an OPEN public registry. Restricted entries are safe metadata only;
    // never open them even if someone incorrectly marks their payload present.
    if (source.spoiler_class !== 'OPEN' && (source.present === true || source.path !== null || source.sha256 != null)) {
      fail(label, 'restricted source must remain metadata-only (present=false, path=null, no hash)'); continue;
    }
    if (source.present === false) {
      if (source.path !== null || source.sha256 != null) fail(label, 'absent source must have path=null and no hash');
      continue;
    }
    if (source.present !== true) continue;
    if (source.path === null) {fail(label, 'present source requires a file path'); continue;}
    try {
      const target = path.resolve(repoRoot, source.path);
      if (!within(realpathSync(repoRoot), realpathSync(target))) {fail(label, 'path resolves outside repository'); continue;}
      if (!statSync(target).isFile()) {fail(label, 'registered path is not a file'); continue;}
      if (source.sha256 != null && digest(readFileSync(target), source.hash_mode) !== source.sha256) fail(label, 'sha256 mismatch');
    } catch {fail(label, 'registered file missing or unreadable');}
  }
  return errors;
}

export const missingSources = manifest => manifest.sources.filter(source => !source.present || source.authority_status === 'SOURCE_REQUIRED');
export function inventory(manifest) {
  const result = {total: manifest.sources.length, authority_status: {}, spoiler_class: {}, present: 0, missing: 0};
  for (const source of manifest.sources) {
    result.authority_status[source.authority_status] = (result.authority_status[source.authority_status] || 0) + 1;
    result.spoiler_class[source.spoiler_class] = (result.spoiler_class[source.spoiler_class] || 0) + 1;
    result[source.present ? 'present' : 'missing']++;
  }
  return result;
}

function main(args) {
  const [command, ...flags] = args;
  if (!['check', 'missing', 'stats'].includes(command) || flags.some(flag => flag !== '--json')) {
    console.error('Usage: node tools/sources.mjs <check|missing|stats> [--json]'); return 2;
  }
  let manifest;
  try {manifest = JSON.parse(readFileSync(path.join(root, 'source_vault', 'manifest.json'), 'utf8'));}
  catch {console.error('FAIL source manifest missing or invalid JSON'); return 1;}
  const errors = validate(manifest);
  if (errors.length) {console.error(`FAIL sources:check (${errors.length} errors)\n${errors.join('\n')}`); return 1;}
  if (command === 'check') console.log(`PASS sources:check (${manifest.sources.length} sources; ${missingSources(manifest).length} unresolved requirements)`);
  else if (command === 'stats') console.log(JSON.stringify(inventory(manifest), null, 2));
  else {
    // Safe registry metadata only; no source body excerpts and no restricted titles.
    const queue = missingSources(manifest).map(source => ({source_id: source.source_id,
      title: source.spoiler_class === 'OPEN' ? source.title : `${source.spoiler_class} source (metadata only)`,
      feature_ids: source.feature_ids, owner: source.owner, spoiler_class: source.spoiler_class,
      present: source.present, authority_status: source.authority_status}));
    console.log(flags.includes('--json') ? JSON.stringify(queue, null, 2) :
      `WHAT WE STILL NEED FROM UBE/HQ (${queue.length})\n${queue.map(source => `${source.source_id} | ${source.title} | ${source.feature_ids.join(', ') || 'project'} | ${source.owner}`).join('\n')}`);
  }
  return 0;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
