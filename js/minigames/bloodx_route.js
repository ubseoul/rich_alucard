(function (global) {
 'use strict';
 // Reusable route shell. Authored story, cars, geography and settlement live in the supplied config.
 const clone = value => JSON.parse(JSON.stringify(value));
 const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const PHASES = new Set(['assignment','car','drive','arrival','encounter','encounter-lost','receipt','complete']);
 const DIRECTIONS = {north:[0,-1],east:[1,0],south:[0,1],west:[-1,0]};
 let provider = null;

 function validate(config) {
  if (!config || typeof config.id !== 'string' || !config.id) throw Error('route-config-required');
  if (typeof config.save !== 'function') throw Error('route-atomic-save-required');
  if (!Array.isArray(config.cars) || new Set(config.cars.map(c => c.id)).size !== config.cars.length || config.cars.some(c => !c.id)) throw Error('route-car-ids-invalid');
  if (!Array.isArray(config.stops) || config.stops.length !== 3 || new Set(config.stops.map(s => s.id)).size !== 3) throw Error('route-needs-three-ordered-stops');
  const map = config.map;
  if (!map || !Array.isArray(map.nodes) || !Array.isArray(map.edges)) throw Error('route-map-required');
  const nodes = new Map(map.nodes.map(n => [n.id,n]));
  if (nodes.size !== map.nodes.length || !nodes.has(map.startNode) || map.nodes.some(n => !n.id || !Number.isFinite(n.x) || !Number.isFinite(n.y))) throw Error('route-map-nodes-invalid');
  for (const edge of map.edges) {
   const a = nodes.get(edge.from), b = nodes.get(edge.to);
   if (!a || !b || a.id === b.id || (a.x !== b.x && a.y !== b.y)) throw Error('route-map-edge-invalid');
  }
  for (const stop of config.stops) {
   if (!nodes.has(stop.nodeId) || !Array.isArray(stop.choices) || !stop.choices.length) throw Error('route-stop-invalid');
   if (new Set(stop.choices.map(c => c.id)).size !== stop.choices.length || stop.choices.some(c => !c.id || !['complete','encounter'].includes(c.action))) throw Error('route-choice-invalid');
  }
  const reachable = new Set([map.startNode]), pending = [map.startNode];
  while (pending.length) {
   const at = pending.shift();
   for (const edge of map.edges) {
    const id = at === edge.from ? edge.to : at === edge.to ? edge.from : null;
    if (id && !reachable.has(id)) { reachable.add(id); pending.push(id); }
   }
  }
  if (config.stops.some(s => !reachable.has(s.nodeId))) throw Error('route-stop-unreachable');
  return {nodes};
 }

 function initialState(config) {
  return {version:1,routeId:config.id,attemptId:config.attemptId || null,revision:0,carId:null,currentStop:0,position:{nodeId:config.map.startNode},phase:'assignment',outcomes:[],choiceId:null,encounter:null,battleAttempt:0,durableTerminal:null};
 }

 function restore(config, saved, nodes) {
  if (!saved) return initialState(config);
  const s = clone(saved);
  if (s.version !== 1 || s.routeId !== config.id || !PHASES.has(s.phase) || !Number.isInteger(s.currentStop) || s.currentStop < 0 || s.currentStop > 3 || !nodes.has(s.position?.nodeId) || !Array.isArray(s.outcomes) || !Number.isInteger(s.revision) || s.revision < 0) throw Error('route-checkpoint-invalid');
  if (s.outcomes.length !== (s.phase === 'receipt' ? s.currentStop + 1 : s.currentStop)) throw Error('route-checkpoint-order-invalid');
  for (let i = 0; i < s.outcomes.length; i++) {
   const o = s.outcomes[i], stop = config.stops[i];
   if (!stop || o.stopId !== stop.id || !stop.choices.some(c => c.id === o.choiceId) || !['delivered','win'].includes(o.outcome)) throw Error('route-checkpoint-outcome-invalid');
  }
  if (s.phase === 'complete' ? (s.currentStop !== 3 || s.durableTerminal !== 'completed') : (s.currentStop >= 3 || s.durableTerminal !== null)) throw Error('route-checkpoint-terminal-invalid');
  if (s.phase !== 'assignment' && (typeof s.attemptId !== 'string' || !s.attemptId)) throw Error('route-checkpoint-attempt-invalid');
  if (!['assignment','car','complete'].includes(s.phase) && !config.cars.some(c => c.id === s.carId && c.owned !== false && c.available !== false)) throw Error('route-selected-car-unavailable');
  if (['arrival','encounter','encounter-lost','receipt'].includes(s.phase) && s.position.nodeId !== config.stops[s.currentStop]?.nodeId) throw Error('route-checkpoint-location-invalid');
  if (['encounter','encounter-lost','receipt'].includes(s.phase) && !config.stops[s.currentStop]?.choices.some(c => c.id === s.choiceId)) throw Error('route-checkpoint-choice-invalid');
  s.battleAttempt = Number.isInteger(s.battleAttempt) ? s.battleAttempt : 0;
  return s;
 }

 function createModel(config) {
  const {nodes} = validate(config);
  let state = restore(config,config.state,nodes), canceled = false, chain = Promise.resolve();
  const listeners = new Set();
  const read = () => clone(state);
  function commit(type, reduce, meta = {}) {
   const work = chain.then(async () => {
    if (canceled) return read();
    const next = read();
    const changed = reduce(next);
    if (!changed) return read();
    next.revision = state.revision + 1;
    const event = {id:`${config.id}:${next.attemptId || 'offer'}:${next.revision}`,type,routeId:config.id,attemptId:next.attemptId,stopId:config.stops[next.currentStop]?.id || null,choiceId:next.choiceId,...meta};
    if (type === 'stop-complete') event.completion = clone(next.outcomes[next.outcomes.length - 1]);
    await config.save(clone(next),clone(event));
    state = next;
    if (!canceled) for (const listener of listeners) listener(read(),event);
    return read();
   });
   chain = work.catch(() => {});
   return work;
  }
  function availableDirections(fromId = state.position.nodeId) {
   const from = nodes.get(fromId), result = {};
   for (const edge of config.map.edges) {
    const id = edge.from === fromId ? edge.to : edge.to === fromId ? edge.from : null;
    if (!id) continue;
    const to = nodes.get(id), dx = to.x - from.x, dy = to.y - from.y;
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'east' : 'west') : (dy > 0 ? 'south' : 'north');
    const distance = Math.hypot(dx,dy);
    if (!result[dir] || result[dir].distance > distance) result[dir] = {nodeId:id,edge,distance};
   }
   return result;
  }
  function path(fromId = state.position.nodeId,toId = config.stops[state.currentStop]?.nodeId) {
   if (!toId) return [];
   const pending = [[fromId]], visited = new Set([fromId]);
   while (pending.length) {
    const route = pending.shift(), last = route[route.length - 1];
    if (last === toId) return route;
    for (const option of Object.values(availableDirections(last))) if (!visited.has(option.nodeId)) { visited.add(option.nodeId); pending.push([...route,option.nodeId]); }
   }
   return [];
  }
  function complete(next,outcome,result = {}) {
   const stop = config.stops[next.currentStop];
   if (!stop || next.outcomes.some(o => o.stopId === stop.id)) return false;
   next.outcomes.push({stopId:stop.id,choiceId:next.choiceId,outcome,attemptId:result.attemptId || null,turns:result.turns || 0});
   next.encounter = result.state || result.snapshot || next.encounter;
   next.phase = 'receipt';
   return true;
  }
  return {
   read,availableDirections,path,
   subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
   accept() { return commit('assignment-accepted',s => {
    if (s.phase !== 'assignment') return false;
    s.attemptId = s.attemptId || `${config.id}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2,9)}`;
    s.phase = 'car'; return true;
   }); },
   chooseCar(id) { return commit('car-selected',s => {
    if (s.phase !== 'car' || !config.cars.some(c => c.id === id && c.owned !== false && c.available !== false)) return false;
    s.carId = id; s.phase = s.position.nodeId === config.stops[s.currentStop].nodeId ? 'arrival' : 'drive'; return true;
   }); },
   move(direction) { return commit('movement',s => {
    if (s.phase !== 'drive') return false;
    const option = availableDirections(s.position.nodeId)[direction];
    if (!option) return false;
    s.position = {nodeId:option.nodeId,street:option.edge.street || '',direction};
    if (s.position.nodeId === config.stops[s.currentStop].nodeId) s.phase = 'arrival';
    return true;
   },{direction}); },
   choose(id) {
    const choice = config.stops[state.currentStop]?.choices.find(c => c.id === id);
    return commit(choice?.action === 'complete' ? 'stop-complete' : 'encounter-started',s => {
     if (s.phase !== 'arrival') return false;
     const selected = config.stops[s.currentStop].choices.find(c => c.id === id);
     if (!selected) return false;
     s.choiceId = id;
     if (selected.action === 'complete') return complete(s,'delivered');
     s.phase = 'encounter'; s.encounter = null; s.battleAttempt++; return true;
    });
   },
   saveEncounter(snapshot,meta = {}) { return commit('encounter-checkpoint',s => {
    if (s.phase !== 'encounter') return false;
    s.encounter = clone(snapshot); return true;
   },{encounterMeta:meta}); },
   resolveEncounter(result) {
    return commit(result?.outcome === 'win' ? 'stop-complete' : 'encounter-ended',s => {
     if (s.phase !== 'encounter') return false;
     if (!result || !['win','lose','quit','retry','interrupted'].includes(result.outcome)) throw Error('route-encounter-result-invalid');
     s.encounter = result.state || result.snapshot || s.encounter;
     if (result.outcome === 'win') return complete(s,'win',result);
     if (result.outcome === 'retry') { s.encounter = null; s.battleAttempt++; }
     if (result.outcome === 'lose') s.phase = 'encounter-lost';
     return true;
    },{encounterOutcome:result?.outcome});
   },
   retryEncounter() { return commit('encounter-retry',s => {
    if (s.phase !== 'encounter-lost') return false;
    s.encounter = null; s.battleAttempt++; s.phase = 'encounter'; return true;
   }); },
   continue() { return commit(state.currentStop === 2 ? 'route-completed' : 'next-stop',s => {
    if (s.phase !== 'receipt') return false;
    s.currentStop++; s.choiceId = null; s.encounter = null; s.battleAttempt = 0;
    s.phase = s.currentStop === 3 ? 'complete' : s.position.nodeId === config.stops[s.currentStop].nodeId ? 'arrival' : 'drive';
    if (s.phase === 'complete') s.durableTerminal = 'completed';
    return true;
   }); },
   flush() { return chain.then(read); },
   cancel() { canceled = true; listeners.clear(); }
  };
 }

 const CSS = `
 .bx-route{position:absolute;inset:0;overflow:auto;background:#0b0716;color:#f6efd9;font:400 9px/1.85 "Press Start 2P",monospace;isolation:isolate;overscroll-behavior:contain;--bx-gold:#ffd36a;--bx-red:#e74767;--bx-green:#89d8ad}
 .bx-route *{box-sizing:border-box}.bx-route button{font:inherit;cursor:pointer;touch-action:manipulation;min-height:44px;border:2px solid #514663;color:#f6efd9;background:#221a31;padding:10px 12px;border-radius:3px;text-align:center}
 .bx-route button:focus-visible{outline:3px solid var(--bx-gold);outline-offset:2px}.bx-route button:disabled{opacity:.38;cursor:default}.bx-route .bx-primary{background:var(--bx-gold);color:#130d21;border-color:var(--bx-gold)}
 .bx-route .bx-danger{background:#651e35;border-color:#a74161}.bx-route h1,.bx-route h2,.bx-route p{margin:0}.bx-route h1{font-size:15px;letter-spacing:1px}.bx-route h2{font-size:11px;color:var(--bx-gold)}
 .bx-route .bx-kicker{font-size:7px;letter-spacing:1.4px;color:#b8afc8;text-transform:uppercase}.bx-route .bx-head{padding:13px 14px 9px;border-bottom:1px solid #514663;display:flex;justify-content:space-between;gap:8px;align-items:center}
 .bx-route .bx-progress{color:var(--bx-green);white-space:nowrap}.bx-route .bx-body{padding:13px;display:flex;flex-direction:column;gap:12px}.bx-route .bx-lines{display:flex;flex-direction:column;gap:10px;font-weight:400;line-height:1.85}
 .bx-route .bx-lines p{white-space:pre-wrap}.bx-route .bx-speaker{font-size:7px;font-weight:700;letter-spacing:1px;color:var(--bx-gold);display:block;margin-bottom:3px}.bx-route .bx-actions{display:flex;flex-direction:column;gap:8px}
 .bx-route .bx-hand{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;image-rendering:pixelated;pointer-events:none;z-index:-1}.bx-route .bx-assignment{min-height:100%;padding:26px 22px 100px;background:linear-gradient(#06030b66,#06030b00)}
 .bx-route .bx-phone{border:3px solid #363342;border-radius:24px;background:linear-gradient(#171720,#0b0b11);padding:14px 13px;box-shadow:0 10px 28px #000c;display:flex;flex-direction:column;gap:14px;max-width:340px;margin:0 auto}
 .bx-route .bx-phone-status{display:flex;justify-content:space-between;gap:8px;font-size:7px;color:#aaa5ba;letter-spacing:1px}.bx-route .bx-phone-title{border-bottom:1px solid #403948;padding-bottom:12px}.bx-route .bx-phone-title h1{font-size:14px;color:var(--bx-gold);margin-top:6px}
 .bx-route .bx-call-name{font-size:10px;color:#fff;letter-spacing:1px}.bx-route .bx-phone .bx-primary{border-radius:22px;background:#2c9c53;border-color:#2c9c53;color:white}
 .bx-route .bx-cars{display:flex;flex-direction:column;gap:8px}.bx-route .bx-car-option{display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;min-height:64px}.bx-route .bx-car-option img{width:84px;height:44px;object-fit:contain;image-rendering:pixelated}
 .bx-route .bx-empty{border:1px solid #524461;padding:16px;color:#c3b9cf}.bx-route .bx-map{width:100%;display:block;max-height:280px;background:#151021;border:1px solid #3e334e;border-radius:5px;touch-action:none}
 .bx-route .bx-road-edge{stroke:#2c243c;stroke-width:23;stroke-linecap:round}.bx-route .bx-road{stroke:#645570;stroke-width:14;stroke-linecap:round}.bx-route .bx-centerline{stroke:#c5b18a;stroke-width:1.2;stroke-dasharray:8 7;opacity:.55}
 .bx-route .bx-map-route{fill:none;stroke:#ffd36a;stroke-width:5;stroke-dasharray:7 6;stroke-linecap:round}.bx-route .bx-street{fill:#ded2e6;font-size:12px;font-weight:700;paint-order:stroke;stroke:#151021;stroke-width:4px}
 .bx-route .bx-landmark{fill:#645470;font-size:13px;letter-spacing:1px}.bx-route .bx-pin{fill:#362644;stroke:#9383a5;stroke-width:2}.bx-route .bx-pin-current{fill:#ffd36a;stroke:#fff3cc;stroke-width:3}.bx-route .bx-pin-done{fill:#89d8ad;stroke:#d2f9e1}.bx-route .bx-pin-label{fill:#f6efd9;font-size:13px;font-weight:700}.bx-route .bx-car-marker{filter:drop-shadow(0 2px 3px #000);transition:transform 220ms linear}
 .bx-route .bx-next{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:11px}.bx-route .bx-next strong{color:var(--bx-gold)}.bx-route .bx-road-status{font-size:7px;color:#c6bad3;min-height:14px}.bx-route .bx-controls{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;max-width:250px;width:100%;margin:0 auto}.bx-route .bx-controls button{font-size:19px;padding:8px;min-height:44px}.bx-route .bx-controls [data-move=north]{grid-column:2}.bx-route .bx-controls [data-move=west]{grid-row:2;grid-column:1}.bx-route .bx-controls [data-move=south]{grid-row:2;grid-column:2}.bx-route .bx-controls [data-move=east]{grid-row:2;grid-column:3}
 .bx-route .bx-controls-hint{font-size:7px;text-align:center;color:#bfb2ce}.bx-route .bx-stops{list-style:none;display:flex;flex-direction:column;gap:5px;margin:0;padding:0;font-size:10px}.bx-route .bx-stops li{display:flex;align-items:center;gap:7px;opacity:.55}.bx-route .bx-stops li.current{opacity:1;color:var(--bx-gold)}.bx-route .bx-stops li.done{opacity:1;color:var(--bx-green)}.bx-route .bx-number{border:1px solid currentColor;min-width:19px;line-height:18px;text-align:center;border-radius:50%}
 .bx-route .bx-scene{aspect-ratio:270/280;position:relative;background:#17131e;overflow:hidden;border:1px solid #574063;image-rendering:pixelated}.bx-route .bx-scene-bg{position:absolute;left:0;bottom:0;width:100%;height:auto;image-rendering:pixelated}.bx-route .bx-portraits{position:absolute;inset:0;display:block}.bx-route .bx-portraits img{position:absolute;left:50%;bottom:0;object-fit:contain;width:59.259259%;height:68.571429%;transform:translateX(-50%);transform-origin:50% 91.66667%;image-rendering:pixelated;filter:drop-shadow(2px 1px #0b0716)}
 .bx-route .bx-portraits img:first-child:nth-last-child(3){left:19%}.bx-route .bx-portraits img:nth-child(3){left:81%}
 .bx-route .bx-receipt{background:#f2e6c7;color:#21152c;padding:18px 14px;border-top:7px solid #89d8ad;box-shadow:0 4px 0 #655172}.bx-route .bx-receipt h2{color:#3b2948}.bx-route .bx-receipt .bx-speaker{color:#7d2747}.bx-route .bx-receipt .bx-lines{margin-top:14px}.bx-route .bx-reward{border-top:1px dashed #a4947b;margin-top:14px;padding-top:9px;font-weight:700;color:#33604d}.bx-route .bx-busy{position:sticky;bottom:0;background:#0b0716;padding:5px 12px;font-size:9px;color:#a89bb8;text-align:center;min-height:22px}.bx-route .bx-encounter-host{min-height:100%;position:relative}.bx-route .bx-pause{position:absolute;inset:0;z-index:40;background:#0b0716dd;display:flex;align-items:center;justify-content:center;color:#ffd36a}.bx-route .bx-finish{padding:20px 14px}
.bx-route[data-phase=drive] .bx-head h2{font-size:8px}.bx-route[data-phase=drive] .bx-body{gap:8px;padding:10px}.bx-route[data-phase=drive] .bx-next{font-size:8px}.bx-route[data-phase=drive] .bx-map{height:170px}.bx-route .bx-controls button{line-height:1}.bx-route .bx-stops{font-size:7px}.bx-route .bx-street{font-size:16px}
 .bx-route[data-phase=encounter] .bx-content{height:100%}.bx-route[data-phase=encounter] .bx-encounter-host{height:100%;min-height:0}
 @media(prefers-reduced-motion:reduce){.bx-route .bx-car-marker{transition:none}}
 `;

 function mount(root,config,ctx = {}) {
  const model = createModel(config), copy = config.copy || {}, life = new AbortController();
  const frame = document.createElement('section'); frame.className = 'bx-route'; frame.setAttribute('aria-label',config.title || 'Delivery route');
  if (config.uiFont) frame.style.fontFamily = config.uiFont;
  const style = document.createElement('style'); style.textContent = CSS;
  const content = document.createElement('div'); content.className = 'bx-content'; const status = document.createElement('div'); status.className = 'bx-busy'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite');
  frame.append(style,content,status); root.append(frame);
  let disposed = false, paused = false, busy = false, finished = false, battle = null, battleSerial = 0, swipe = null, touchPress = null, touchButtonAt = 0, renderedPhase = null, artTimer = null;
  let resolveResult; const result = new Promise(resolve => { resolveResult = resolve; });
  const txt = (key,fallback) => copy[key] == null ? fallback : String(copy[key]);
  const lines = rows => `<div class="bx-lines">${(rows || []).map(row => typeof row === 'string' ? `<p>${esc(row)}</p>` : `<p>${row.speaker ? `<span class="bx-speaker">${esc(row.speaker)}</span>` : ''}${esc(row.text)}</p>`).join('')}</div>`;
  const button = (label,action,cls = '',attrs = '') => `<button type="button" class="${cls}" data-action="${esc(action)}" ${attrs}>${esc(label)}</button>`;
  function currentChoice(s) { return config.stops[s.currentStop]?.choices.find(c => c.id === s.choiceId); }
  function final(outcome,error) {
   if (finished) return; finished = true;
   const route = model.read(), payload = {outcome,quit:outcome !== 'completed',routeId:route.routeId,attemptId:route.attemptId,carId:route.carId,route,...(error ? {error:String(error.message || error)} : {})};
   dispose(); resolveResult(payload); ctx.finish?.(payload); return payload;
  }
  function failure(error) { final('error',error); }
  async function action(work) {
   if (disposed || paused || busy) return;
   busy = true; status.textContent = txt('savingLabel','Saving…'); frame.setAttribute('aria-busy','true'); disableButtons();
   try { await work(); }
   catch (error) { if (!disposed) failure(error); }
   finally { busy = false; if (!disposed) { frame.removeAttribute('aria-busy'); status.textContent = ''; render(); } }
  }
  function disableButtons() { content.querySelectorAll('button').forEach(b => { b.disabled = true; }); }
  function head(s) { return `<header class="bx-head"><div><p class="bx-kicker">${esc(config.title || txt('routeTitle','Delivery route'))}</p><h2>${esc(config.map.title || '')}</h2></div><span class="bx-progress">${s.outcomes.length}/3</span></header>`; }
  function stopList(s) { return `<ol class="bx-stops">${config.stops.map((stop,i) => `<li class="${i === s.currentStop ? 'current' : i < s.outcomes.length ? 'done' : ''}"><span class="bx-number">${i + 1}</span><span>${esc(stop.label)}</span>${i < s.outcomes.length ? '<span aria-label="Complete">✓</span>' : ''}</li>`).join('')}</ol>`; }
  function mapMarkup(s) {
   const map = config.map, w = map.viewBox?.width || 480, h = map.viewBox?.height || 420, nodes = new Map(map.nodes.map(n => [n.id,n]));
   const route = model.path().map(id => `${nodes.get(id).x},${nodes.get(id).y}`).join(' '), streets = new Map();
   const roads = map.edges.map(edge => {
    const a = nodes.get(edge.from), b = nodes.get(edge.to);
    if (!streets.has(edge.street)) streets.set(edge.street,{a,b});
    return ['bx-road-edge','bx-road','bx-centerline'].map(cls => `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`).join('');
   }).join('');
   const labels = [...streets].map(([street,{a,b}]) => {
    const vertical = a.x === b.x, x = (a.x + b.x)/2 + (vertical ? (a.x < w/2 ? -18 : 20) : 0), y = (a.y + b.y)/2 + (vertical ? 0 : -20);
    return `<text class="bx-street" x="${x}" y="${y}" text-anchor="middle"${vertical ? ` transform="rotate(-90 ${x} ${y})"` : ''}>${esc(street)}</text>`;
   }).join('');
   const pins = config.stops.map((stop,i) => {
    const n = nodes.get(stop.nodeId), done = i < s.outcomes.length, active = i === s.currentStop;
    return `<g><circle class="bx-pin ${done ? 'bx-pin-done' : active ? 'bx-pin-current' : ''}" cx="${n.x}" cy="${n.y - 27}" r="13"/><text x="${n.x}" y="${n.y - 23}" text-anchor="middle" class="bx-pin-label"${done || active ? ' style="fill:#1b1327"' : ''}>${done ? '✓' : i + 1}</text></g>`;
   }).join('');
   const n = nodes.get(s.position.nodeId), car = config.cars.find(c => c.id === s.carId), color = /^#[0-9a-f]{3,8}$/i.test(car?.color || '') ? car.color : '#ded6cc', angle = {north:0,east:90,south:180,west:270}[s.position.direction] || 0;
   const vehicle = `<g class="bx-car-marker" transform="translate(${n.x} ${n.y})"><g transform="rotate(${angle})"><rect x="-10" y="-18" width="20" height="36" rx="4" fill="${color}" stroke="#090512" stroke-width="2"/><rect x="-7" y="-10" width="14" height="9" fill="#31213d"/><rect x="-7" y="5" width="14" height="5" fill="#31213d"/><rect x="-10" y="-17" width="5" height="3" fill="#fff0ad"/><rect x="5" y="-17" width="5" height="3" fill="#fff0ad"/></g></g>`;
   const landmarks = (map.landmarks || []).map(l => `<text class="bx-landmark" x="${l.x}" y="${l.y}" text-anchor="middle">${esc(l.label)}</text>`).join('');
   return `<svg class="bx-map" data-map="1" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(map.ariaLabel || map.title || txt('mapLabel','Route map'))}"><rect width="${w}" height="${h}" fill="#151021"/>${landmarks}${roads}<polyline class="bx-map-route" points="${route}"/>${labels}${pins}${vehicle}</svg>`;
  }
  function artFrames(scene,phase) {
   let source = phase === 'receipt' ? scene.receiptFrames : scene.frames;
   if (!source && scene.poseFrames) source = phase === 'receipt' ? [...(scene.poseFrames.payment || []),...(scene.poseFrames.leave || [])] : [...(scene.poseFrames.idle || []),...(scene.poseFrames.tap || [])];
   if (Array.isArray(source) && source.length) return source.slice(0,12).map(frame => Array.isArray(frame) ? frame.slice(0,3) : [frame]);
   const portraits = scene.portraits || [];
   const tracks = portraits.slice(0,3).map(p => {
    const authored = typeof p === 'string' ? [p] : (phase === 'receipt' ? p.receiptFrames : p.frames);
    return Array.isArray(authored) && authored.length ? authored : [typeof p === 'string' ? p : p.src];
   });
   const length = Math.min(12,Math.max(0,...tracks.map(t => t.length)));
   return Array.from({length},(_,i) => tracks.map(t => t[i % t.length]));
  }
  function sceneMarkup(stop,phase = 'arrival') {
   const scene = stop.scene || {}, frames = artFrames(scene,phase), portraits = scene.portraits || (scene.portrait ? [{src:scene.portrait,alt:stop.label}] : frames[0]?.map(src => ({src,alt:''})) || []);
   if (!scene.background && !portraits.length) return '';
   return `<div class="bx-scene">${scene.background ? `<img class="bx-scene-bg" src="${esc(scene.background)}" alt="">` : ''}<div class="bx-portraits">${portraits.slice(0,3).map(p => `<img src="${esc(typeof p === 'string' ? p : p.src)}" alt="${esc(typeof p === 'string' ? '' : p.alt || '')}">`).join('')}</div></div>`;
  }
  function startSceneArt(stop,phase) {
   const scene = stop.scene || {}, frames = artFrames(scene,phase), actors = [...content.querySelectorAll('.bx-portraits img')];
   if (!frames.length || !actors.length) return;
   const delay = Math.min(500,Math.max(120,Number(scene.frameMs) || 320)), reduced = global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
   const max = frames.length < 2 || reduced ? 1 : phase === 'receipt' ? frames.length : Math.min(18,Math.floor(6000/delay));
   let index = 0;
   const tick = () => {
    if (disposed || paused || model.read().phase !== phase) return;
    const set = frames[index % frames.length]; actors.forEach((image,i) => { if (typeof set[i] === 'string') image.src = set[i]; });
    index++; if (index < max) artTimer = setTimeout(tick,delay); else artTimer = null;
   };
   tick();
  }
  function render() {
   if (disposed) return;
   if (artTimer) { clearTimeout(artTimer); artTimer = null; }
   const s = model.read(); if (renderedPhase !== s.phase) { frame.scrollTop = 0; renderedPhase = s.phase; } frame.dataset.phase = s.phase; frame.dataset.stop = String(s.currentStop); frame.dataset.node = s.position.nodeId; frame.dataset.car = s.carId || ''; frame.dataset.revision = String(s.revision);
   if (s.phase === 'encounter') { if (!paused && !battle) runEncounter(); return; }
   if (s.phase === 'assignment') {
    content.innerHTML = `<div class="bx-assignment">${config.art?.phoneBackdrop ? `<img class="bx-hand" src="${esc(config.art.phoneBackdrop)}" alt="${esc(txt('phoneArtAlt','Phone in hand'))}">` : ''}<div class="bx-phone"><div class="bx-phone-status"><span>${esc(txt('phoneStatus','MESSAGE'))}</span><span>${esc(config.phoneTime || '')}</span></div><div class="bx-phone-title"><p class="bx-kicker">${esc(txt('assignmentKicker','ASSIGNMENT'))}</p><h1>${esc(config.title || txt('routeTitle','Delivery route'))}</h1></div><p class="bx-call-name">${esc(copy.sender || '')}</p>${lines(copy.assignmentLines)}${button(txt('acceptLabel','Take route'),'accept','bx-primary')}</div></div>`;
   } else if (s.phase === 'car') {
    const cars = config.cars.filter(c => c.owned !== false && c.available !== false);
    content.innerHTML = `${head(s)}<div class="bx-body"><h2>${esc(txt('carTitle','Choose your car'))}</h2>${lines(copy.carLines)}<div class="bx-cars">${cars.map(c => button(c.label || c.id,'car','bx-car-option',`data-car-id="${esc(c.id)}"`)).join('') || `<p class="bx-empty">${esc(txt('noCarsLabel','No available car'))}</p>`}</div>${stopList(s)}</div>`;
    content.querySelectorAll('[data-car-id]').forEach(b => { const car = cars.find(c => c.id === b.dataset.carId); if (car.art) { const img = document.createElement('img'); img.src = car.art; img.alt = ''; b.prepend(img); } });
   } else if (s.phase === 'drive') {
    const stop = config.stops[s.currentStop], directions = model.availableDirections(), route = model.path(), next = route[1], nextDirection = Object.entries(directions).find(([,v]) => v.nodeId === next)?.[0];
    content.innerHTML = `${head(s)}<div class="bx-body"><div class="bx-next"><strong>${esc(txt('nextLabel','Next'))}: ${esc(stop.label)}</strong><span>${s.currentStop + 1}/3</span></div>${mapMarkup(s)}<p class="bx-road-status">${esc(s.position.street || config.map.startLabel || '')}${nextDirection ? ` · ${esc(copy.directions?.[nextDirection] || nextDirection)}` : ''}</p><div class="bx-controls" aria-label="${esc(txt('controlsLabel','Drive controls'))}">${Object.keys(DIRECTIONS).map(dir => `<button type="button" data-move="${dir}" aria-label="${esc(copy.directions?.[dir] || dir)}" ${!directions[dir] ? 'disabled' : ''}>${{north:'↑',east:'→',south:'↓',west:'←'}[dir]}</button>`).join('')}</div><p class="bx-controls-hint">${esc(txt('controlsHint','Tap arrows · Swipe map · Arrow keys'))}</p>${stopList(s)}</div>`;
   } else if (s.phase === 'arrival') {
    const stop = config.stops[s.currentStop];
    content.innerHTML = `${head(s)}<div class="bx-body">${sceneMarkup(stop)}<p class="bx-kicker">${esc(txt('arrivalLabel','ARRIVED'))} ${s.currentStop + 1}/3</p><h2>${esc(stop.label)}</h2>${lines(stop.arrivalLines)}<div class="bx-actions">${stop.choices.map(c => button(c.label,'choice',c.action === 'encounter' ? 'bx-danger' : 'bx-primary',`data-choice-id="${esc(c.id)}"`)).join('')}</div></div>`;
   } else if (s.phase === 'encounter-lost') {
    const stop = config.stops[s.currentStop], choice = currentChoice(s);
    content.innerHTML = `${head(s)}<div class="bx-body"><h2>${esc(stop.label)}</h2>${lines(choice?.lossLines || copy.lossLines)}<div class="bx-actions">${button(txt('retryLabel','Retry'),'retry','bx-primary')}${button(txt('quitLabel','Leave route'),'quit','bx-danger')}</div></div>`;
   } else if (s.phase === 'receipt') {
    const stop = config.stops[s.currentStop], choice = currentChoice(s), outcome = s.outcomes[s.outcomes.length - 1];
    const rows = choice.receiptByOutcome?.[outcome.outcome] || choice.receiptLines || stop.receiptLines || [];
    const reward = choice.rewardByOutcome?.[outcome.outcome] || choice.rewardSummary;
    content.innerHTML = `${head(s)}<div class="bx-body">${stop.scene?.receiptFrames || stop.scene?.poseFrames?.payment || stop.scene?.portraits?.some(p => p.receiptFrames) ? sceneMarkup(stop,'receipt') : ''}<div class="bx-receipt"><p class="bx-kicker">${esc(txt('receiptLabel','RECEIPT'))} ${s.currentStop + 1}/3</p><h2>${esc(stop.label)}</h2>${lines(rows)}${reward ? `<p class="bx-reward">${esc(reward)}</p>` : ''}</div>${button(s.currentStop === 2 ? txt('completeLabel','Finish route') : txt('continueLabel','Next stop'),'continue','bx-primary')}${stopList(s)}</div>`;
   } else {
    content.innerHTML = `${head(s)}<div class="bx-body bx-finish"><h1>${esc(txt('completeTitle','Route complete'))}</h1>${lines(copy.completeLines)}${stopList(s)}${button(txt('doneLabel','Done'),'done','bx-primary')}</div>`;
   }
   if (['arrival','receipt'].includes(s.phase)) startSceneArt(config.stops[s.currentStop],s.phase);
   if (busy || paused) disableButtons();
  }
  async function runEncounter() {
   if (disposed || paused || battle || model.read().phase !== 'encounter') return;
   const s = model.read(), stop = config.stops[s.currentStop], choice = currentChoice(s), authored = choice.encounter || {};
   const run = config.runEncounter || global.RABloodXEncounters?.mount;
   if (typeof run !== 'function') { failure(Error('route-encounter-adapter-required')); return; }
   const control = new AbortController(), serial = ++battleSerial; battle = control;
   const abort = () => control.abort(); life.signal.addEventListener('abort',abort,{once:true});
   content.innerHTML = '<div class="bx-encounter-host"></div>';
   const host = content.firstElementChild;
   const save = async (snapshot,meta) => { if (!disposed) await model.saveEncounter(snapshot,meta); };
   const encounterId = authored.encounter?.id || authored.encounterId || `${s.routeId}:${stop.id}`;
   const options = {...authored,root:host,type:authored.type || authored.kind,kind:authored.kind || authored.type,encounterId,encounter:authored.encounter || authored.enemy || {},state:s.encounter,snapshot:s.encounter,saveProgress:save,save,signal:control.signal,scope:ctx.scope,attemptId:`${s.attemptId}:${stop.id}:${s.battleAttempt}`,seed:authored.seed == null ? `${s.attemptId}:${stop.id}:${s.battleAttempt}` : authored.seed};
   try {
    const outcome = await run(options);
    if (disposed || serial !== battleSerial) return;
    if (outcome?.outcome === 'error') throw Error(outcome.error || 'route-encounter-error');
    await model.resolveEncounter(outcome);
    if (disposed) return;
    battle = null;
    if (['quit','interrupted'].includes(outcome.outcome) && !paused && !control.pauseAbort) { await model.flush(); final('quit'); return; }
    render();
   } catch (error) { if (!disposed) failure(error); }
   finally { life.signal.removeEventListener('abort',abort); if (serial === battleSerial) battle = null; }
  }
  function drive(direction) {
   return action(async () => {
    const before = model.read(), after = await model.move(direction);
    if (disposed || before.position.nodeId === after.position.nodeId) return;
    const from = config.map.nodes.find(n => n.id === before.position.nodeId), to = config.map.nodes.find(n => n.id === after.position.nodeId), marker = content.querySelector('.bx-car-marker');
    if (marker?.animate && !global.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
     const animation = marker.animate([{transform:`translate(${from.x}px, ${from.y}px)`},{transform:`translate(${to.x}px, ${to.y}px)`}],{duration:220,easing:'linear',fill:'forwards'});
     const cancel = () => animation.cancel(); life.signal.addEventListener('abort',cancel,{once:true});
     await animation.finished.catch(() => {}); life.signal.removeEventListener('abort',cancel);
    }
   });
  }
  function activate(b) {
   if (!b || !frame.contains(b) || b.disabled || disposed || paused || busy) return;
   if (b.dataset.move) { drive(b.dataset.move); return; }
   const act = b.dataset.action;
   if (act === 'accept') action(() => model.accept());
   if (act === 'car') action(() => model.chooseCar(b.dataset.carId));
   if (act === 'choice') action(() => model.choose(b.dataset.choiceId));
   if (act === 'continue') action(() => model.continue());
   if (act === 'retry') action(() => model.retryEncounter());
   if (act === 'done') final('completed');
   if (act === 'quit') { model.flush().then(() => final('quit')); }
  }
  function click(event) {
   const b = event.target.closest?.('button');
   activate(b);
  }
  function suppressTouchClick(event) {
   if (touchButtonAt && Date.now() - touchButtonAt < 450 && event.detail > 0) { event.preventDefault(); event.stopImmediatePropagation(); touchButtonAt = 0; }
  }
  function key(event) {
   if (disposed || paused || !frame.isConnected || model.read().phase !== 'drive' || /INPUT|TEXTAREA|SELECT/.test(event.target?.tagName || '')) return;
   const dir = {ArrowUp:'north',ArrowRight:'east',ArrowDown:'south',ArrowLeft:'west',w:'north',d:'east',s:'south',a:'west'}[event.key];
   if (dir) { event.preventDefault(); drive(dir); }
  }
  function down(event) {
   touchButtonAt = 0;
   if (!disposed && !paused && !busy && event.pointerType === 'touch') {
    const b = event.target.closest?.('button[data-action],button[data-move]');
    if (b && frame.contains(b) && !b.disabled) touchPress = {id:event.pointerId,x:event.clientX,y:event.clientY,button:b};
   }
   if (disposed || paused || busy || model.read().phase !== 'drive' || !event.target.closest?.('[data-map]')) return;
   swipe = {id:event.pointerId,x:event.clientX,y:event.clientY};
   try { event.target.closest('[data-map]').setPointerCapture(event.pointerId); } catch (_) {}
  }
  function up(event) {
   if (!swipe) {
    const press = touchPress; touchPress = null;
    if (event.type === 'pointerup' && event.pointerType === 'touch' && press?.id === event.pointerId && Math.hypot(event.clientX - press.x,event.clientY - press.y) < 20) {
     const b = event.target.closest?.('button[data-action],button[data-move]');
     if (b === press.button && frame.contains(b) && !b.disabled) { if (!['done','quit'].includes(b.dataset.action)) { touchButtonAt = Date.now(); activate(b); } }
    }
    return;
   }
   if (swipe.id !== event.pointerId) return;
   const start = swipe; swipe = null;
   if (event.type !== 'pointerup') return;
   const dx = event.clientX - start.x, dy = event.clientY - start.y;
   if (Math.max(Math.abs(dx),Math.abs(dy)) < 24) return;
   const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'east' : 'west') : (dy > 0 ? 'south' : 'north');
   drive(dir);
  }
  function pause() {
   if (artTimer) { clearTimeout(artTimer); artTimer = null; }
   if (disposed || paused) return; paused = true; swipe = null; touchPress = null; if (battle) { battle.pauseAbort = true; battle.abort(); } disableButtons();
   const overlay = document.createElement('div'); overlay.className = 'bx-pause'; overlay.textContent = txt('pausedLabel','Paused'); frame.append(overlay);
  }
  function resume() { if (disposed || !paused) return; paused = false; frame.querySelector('.bx-pause')?.remove(); render(); }
  function dispose() {
   if (artTimer) { clearTimeout(artTimer); artTimer = null; }
   if (disposed) return; disposed = true; life.abort(); battleSerial++; battle?.abort(); model.cancel(); unsubscribe(); swipe = null; touchPress = null; touchButtonAt = 0;
   frame.removeEventListener('click',click); frame.removeEventListener('click',suppressTouchClick,true); frame.removeEventListener('pointerdown',down); frame.removeEventListener('pointerup',up); frame.removeEventListener('pointercancel',up); frame.removeEventListener('lostpointercapture',up); global.removeEventListener('keydown',key); frame.remove();
   if (!finished) { finished = true; const s = model.read(); resolveResult({outcome:'quit',quit:true,route:s,routeId:s.routeId,attemptId:s.attemptId,carId:s.carId}); }
  }
  const unsubscribe = model.subscribe(() => { if (!busy && !battle) render(); });
  frame.addEventListener('click',suppressTouchClick,true); frame.addEventListener('click',click); frame.addEventListener('pointerdown',down); frame.addEventListener('pointerup',up); frame.addEventListener('pointercancel',up); frame.addEventListener('lostpointercapture',up); global.addEventListener('keydown',key);
  ctx.scope?.cleanup?.(dispose);
  render();
  return {dispose,pause,resume,result,snapshot:model.read};
 }

 function register(host = global.RAMinigames) {
  if (!host?.register) return false;
  host.register('bloodx_route',{title:'DELIVERY ROUTE',kind:'story',mount(root,ctx) {
   const config = provider?.(ctx.params || {},ctx);
   if (!config) throw Error('route-config-provider-required');
   return mount(root,config,ctx);
  }});
  return true;
 }
 global.RABloodXRoute = {version:1,createModel,mount,register,setConfigProvider(fn) { if (typeof fn !== 'function') throw Error('route-config-provider-required'); provider = fn; }};
 global.RAMinigameLogic = global.RAMinigameLogic || {}; global.RAMinigameLogic.bloodx_route = {createModel};
 register();
})(typeof window !== 'undefined' ? window : globalThis);



