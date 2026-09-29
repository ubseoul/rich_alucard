// F13 HOLISTIC BALANCE HARNESS — missing-fragment adapters (INFRASTRUCTURE ONLY).
// The rule: a fragment that is not integrated produces NOT_AVAILABLE, never fake behaviour. Integration truth comes
// from what the accepted loader knows: a fragment exists only when its js/frag/<ID>/manifest.json is present (the
// loader expands exactly those files) AND, for state, when it has submitted a migration or declared a namespace.
// A reserved feature flag alone (features.js reserves F01–F07 DARK) is NOT integration. Nothing is cherry-picked.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { root } from './game.mjs';

export const STATUS = Object.freeze({ AVAILABLE: 'AVAILABLE', NOT_AVAILABLE: 'NOT_AVAILABLE', PARTIAL: 'PARTIAL' });

// Known campaign fragments. Labels are documentation only; presence is decided by the loader manifest, never a label.
export const FRAGMENTS = Object.freeze([
  { id: 'F01', label: 'SHOWDOWN' },
  { id: 'F02', label: 'IRON AND GRACE / ARMORY' },
  { id: 'F03', label: 'NEW OGA LADDER CLOSE' },
  { id: 'F04', label: 'WAR ROOM' },
  { id: 'F05', label: 'THE TRAP' },
  { id: 'F06', label: 'RAINMAKER' },
  { id: 'F07', label: 'M8 AND FINALE' },
  { id: 'F08', label: 'UNSPECIFIED' },
  { id: 'F09', label: 'UNSPECIFIED' },
  { id: 'F10', label: 'DEMO SLICE (barred for placeholders)' },
  { id: 'F11', label: 'UNSPECIFIED' },
  { id: 'F12', label: 'UNSPECIFIED' }
]);

export function fragmentManifest(base, id) {
  const file = path.join(base, 'js', 'frag', id, 'manifest.json');
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    return { files: [], css: [], error: String(error.message || error) };
  }
}

function na(id, kind, reason, detail = {}) {
  return { id, kind, status: STATUS.NOT_AVAILABLE, reason, ...detail };
}
function avail(id, kind, detail = {}) {
  return { id, kind, status: STATUS.AVAILABLE, reason: null, ...detail };
}

// Fragment integration census for one loaded context. Read-only.
export function fragmentCensus(base, ctx, id) {
  const manifest = fragmentManifest(base, id);
  const flags = ctx.RAFeatures?.list?.(id) || [];
  let namespace = false;
  let migrations = [];
  try {
    namespace = !!ctx.RAMigrations?.hasNamespace?.(id);
    migrations = (ctx.RAMigrations?.submissions?.() || []).filter(m => m.fragment === id);
  } catch { /* registry absent (baseline harness) */ }
  const integrated = !!manifest && (manifest.files || []).length > 0;
  const entry = {
    id,
    label: FRAGMENTS.find(f => f.id === id)?.label || id,
    status: integrated ? STATUS.AVAILABLE : STATUS.NOT_AVAILABLE,
    files: manifest?.files || [],
    flags: flags.map(f => ({ id: f.id, enabled: !!f.enabled, default: !!f.default })),
    namespace,
    migrations: migrations.map(m => m.id)
  };
  if (!integrated) entry.reason = manifest ? 'manifest has no files' : 'no fragment manifest (not integrated)';
  return entry;
}

export function fragmentCensusAll(base, ctx) {
  const out = {};
  for (const f of FRAGMENTS) out[f.id] = fragmentCensus(base, ctx, f.id);
  return out;
}

// Service/content adapters. `present` is the real global; content tells whether the ACCEPTED world actually has
// anything in it yet (e.g. IF-1's crew registry exists but no fragment has defined a unit).
export function buildAdapters(base, ctx) {
  const services = {};
  const content = {};
  const notAvailable = [];

  const service = (name, api) => {
    const present = !!ctx[api];
    services[name] = present
      ? avail(`service:${name}`, 'if1-service', { api })
      : na(`service:${name}`, 'if1-service', `window.${api} missing`, { api });
    if (!present) notAvailable.push(services[name]);
    return present;
  };
  service('moneyLedger', 'RAMoneyLedger');
  service('heat', 'RAHeat');
  service('social', 'RASocial');
  service('crew', 'RACrew');
  service('vehicles', 'RAVehicles');
  service('districts', 'RADistricts');
  service('salesChannels', 'RASalesChannels');
  service('wakeBus', 'RAWakeBus');
  service('stateWatch', 'RAStateWatch');
  service('fragState', 'RAFrag');

  // Content inside IF-1 registries — empty registries are NOT_AVAILABLE content, not fake seats.
  const crewIds = ctx.RACrew?.ids?.() || [];
  content.crew = crewIds.length
    ? avail('content:crew', 'if1-content', { ids: crewIds })
    : na('content:crew', 'if1-content', 'no fragment defines a crew unit');
  if (content.crew.status !== STATUS.AVAILABLE) notAvailable.push(content.crew);

  const districtIds = ctx.RADistricts?.ids?.() || [];
  content.districts = districtIds.length
    ? avail('content:districts', 'if1-content', { ids: districtIds })
    : na('content:districts', 'if1-content', 'no fragment defines a district');
  if (content.districts.status !== STATUS.AVAILABLE) notAvailable.push(content.districts);

  const channels = ctx.RASalesChannels?.list?.() || [];
  const claimed = channels.filter(c => c.claimed);
  content.salesChannels = claimed.length
    ? avail('content:salesChannels', 'if1-content', { claimed: claimed.map(c => c.id), reserved: channels.filter(c => !c.claimed).map(c => c.id) })
    : na('content:salesChannels', 'if1-content', 'reserved channels are unclaimed (no TRAP / RAINMAKER economy)', { reserved: channels.map(c => c.id) });
  if (content.salesChannels.status !== STATUS.AVAILABLE) notAvailable.push(content.salesChannels);

  // Accepted content systems the harness can drive today.
  const accepted = [
    ['adventures', 'RAAdventures'], ['places', 'RAPlaces'], ['temptations', 'RATemptations'],
    ['relations', 'RARelations'], ['cars', 'RACars'], ['castle', 'RACastle'], ['realEstate', 'RARealEstate'],
    ['dating', 'RADating'], ['rewards', 'RALifeRewards'], ['newOga', 'RANewOga'], ['life', 'RALife'],
    ['lifeClock', 'RAClock'], ['features', 'RAFeatures'], ['migrations', 'RAMigrations']
  ];
  for (const [name, api] of accepted) {
    if (ctx[api]) content[name] = avail(`content:${name}`, 'accepted', { api });
    else {
      content[name] = na(`content:${name}`, 'accepted', `window.${api} missing`, { api });
      notAvailable.push(content[name]);
    }
  }

  const fragments = fragmentCensusAll(base, ctx);
  for (const f of Object.values(fragments)) if (f.status !== STATUS.AVAILABLE) notAvailable.push({ id: `fragment:${f.id}`, kind: 'fragment', status: f.status, reason: f.reason, label: f.label });

  return { schema: 'f13.adapters/1', fragments, services, content, notAvailable };
}

export { root };
