(function (global) {
  'use strict';
  // F06 owns lifecycle and IF-1 calls; the approved core and renderer remain unchanged.
  const FLAG = 'F06.rainmaker';
  const enabled = () => global.RAFeatures.enabled(FLAG);
  const state = () => global.RAFrag.get('F06');
  const write = value => global.RAFrag.patch('F06', '', value);
  let mounted = null;
  function sound(id) {
    const entry = global.RAAudioManifest?.get(id);
    if (entry?.registered && (entry.file || entry.parts?.length)) global.RAAudio?.sfx(id);
  }
  // RM codes are authored in the OPEN patch. Missing/unregistered assets remain silent.
  function mount(canvas, options = {}) {
    if (!enabled()) throw new Error('F06_DISABLED');
    if (mounted) throw new Error('F06_ALREADY_MOUNTED');
    // RC2 (OL-063): options.terms = RAStripClub.terms() when the phone's STRIP CLUB app opens the club. Absent for every other caller,
    // so a direct mount charges exactly what the core threw. The approved core and tunables are untouched.
    const terms = options.terms || null;
    let round = null, disposed = false;
    const game = global.RAMakeItRainSandbox.mount(canvas, {
      seed: options.seed,
      hideTarget: options.hideTarget,       // F15 seam: the host stages its own performers
      tunables: options.tunables,
      audio: {
        onLoad: () => sound('RM_01'),
        onFlick: result => {
          if (!round || disposed) return;
          const current = game.getState(), saved = state();
          if (saved.active?.id !== round.id) return;
          const delta = current.spent - saved.active.spent;
          if (delta <= 0) return; // duplicate feedback is never a second charge
          const charge = terms ? global.RAStripClub.price(terms, delta) : delta;
          const payment = global.RASalesChannels.record('rainmaker', {amount: -charge, kind: 'flick', memo: String(round.id)});
          if (!payment.ok) { abort(); options.onError?.('insufficient-funds'); return; }
          if (terms) { terms.paid += charge; if (terms.first) global.RAStripClub.markFirstVisit(); }
          if(terms){global.RALife?.setFlag('stripClubSeen',true);global.RALife?.setFlag('stripClubLastDay',global.RALife.today().day);}
          // Reload abandons a partial round; it never replays a charge or grants a reward.
          const next = state();
          next.active.spent = current.spent;
          next.spent += charge;
          next.thrown = (next.thrown || 0) + delta;
          next.active.paid = (next.active.paid || 0) + charge;
          next.lastReceipt = {id:round.id,thrown:delta,paid:charge,discount:terms?.first?terms.discount:0};
          write(next);
          options.onSpend?.({delta:charge, thrown:delta, result, round: round.id}); // support tracks actual debit
          sound('RM_02');
        },
        onHit: () => sound('RM_04')
      },
      onRoundEnd: summary => {
        const saved = state();
        if (!round || saved.active?.id !== round.id || disposed) return;
        saved.active = null;
        saved.completed++;
        saved.bestRainScore = Math.max(saved.bestRainScore, summary.rainScore);
        saved.lastResult = {id: round.id, ...summary};
        write(saved);
        round = null;
        options.onResult?.(summary);
      }
    });
    function abort() {
      game.stop();
      const saved = state();
      if (round && saved.active?.id === round.id) { saved.active = null; write(saved); }
      round = null;
    }
    function start(budget = 10000) {
      if (disposed || !enabled()) return false;
      if (terms) {
        // first visit: the preset is trimmed to what the cap still allows (throw dollars); later visits keep the presets
        if (!(budget > 0 && budget <= 25000)) return false;
        if (terms.first) { budget = Math.min(budget, global.RAStripClub.room(terms)); if (budget < terms.minRound) return false; }
        else if (![5000, 10000, 25000].includes(budget)) return false;
      } else if (![5000, 10000, 25000].includes(budget)) return false;
      if (global.RAMoneyLedger.balance() < (terms && terms.first ? global.RAStripClub.price(terms, budget) : budget)) return false;
      if (round) abort();
      const saved = state();
      round = {id: ++saved.sequence, budget, spent: 0};
      saved.active = {...round};
      write(saved);
      game.startRound(budget);
      options.onStart?.({budget});
      return true;
    }
    function dispose() {
      if (disposed) return;
      abort(); disposed = true;
      game.destroy();
      mounted = null;
      options.onClose?.();
    }
    mounted = {start, dispose, game, terms};
    return mounted;
  }
  global.RASalesChannels.claim('rainmaker', {fragment: 'F06', meta: {scope: 'approved MAKE IT RAIN', rewards: false}});
  // A saved active round cannot be reconstructed without changing the approved pure core.
  // Treat reload as departure, retaining paid expenses and never applying unfinished results.
  if (enabled() && global.RAFrag.has('F06') && state().active) { const saved = state(); saved.active = null; write(saved); }
  global.RAFeatures.onChange(() => { if (!enabled()) mounted?.dispose(); });
  function launch(opts = {}) {
    if (!enabled() || mounted) return false;
    const previousFocus = global.document.activeElement;
    const host = global.document.createElement('div');
    host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true');
    host.setAttribute('aria-label', 'MAKE IT RAIN');
    host.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#090813;overflow:auto';
    const shadow = host.attachShadow({mode: 'open'});
    shadow.innerHTML = '<link rel="stylesheet" href="js/frag/F06/make_it_rain.css"><main class="cab"><div class="stage"><canvas id="stage-canvas" aria-label="Drag up to load bills, flick to throw"></canvas><div class="result-actions" hidden><button class="btn btn--again" type="button">RUN IT BACK</button></div></div><div class="player-bar"><button class="btn btn--budget" data-budget="5000">$5K</button><button class="btn btn--budget" data-budget="10000">$10K</button><button class="btn btn--budget" data-budget="25000">$25K</button><button class="btn btn--ghost" data-back>BACK</button></div><p role="status"></p></main>';
    global.document.body.appendChild(host);
    const actions = shadow.querySelector('.result-actions');
    const status = shadow.querySelector('[role="status"]');
    // RC2 (OL-063): the club's own notes (first-visit terms, cap, NEED CASH) were unstyled dark-on-dark text; they are now readable.
    const say = text => { status.textContent = text; status.style.cssText = 'color:#f4f0ff;font:8px/1.6 "Press Start 2P","Courier New",monospace;margin:8px 4px;text-align:center;min-height:14px'; };
    const key = event => { if (event.key === 'Escape') { event.stopPropagation(); session.dispose(); } };
    const scene = () => session.dispose();
    const f15 = global.RAF15Club?.enabled?.() ? global.RAF15Club.open({shadow, stage: shadow.querySelector('.stage'), canvas: shadow.querySelector('canvas')}) : null;   // F15 seam (dark)
    const session = mount(shadow.querySelector('canvas'), {
      terms: opts.terms || null,
      hideTarget: !!f15, tunables: f15?.tunables,
      onSpend: event => { f15?.onSpend(event);const receipt=`THROWN $${event.thrown} / PAID $${event.delta}${opts.terms?.first?' · 50% OFF':''}`;say((!host.dataset.voiceThrow?'RICH: '+global.RAWriting.voice(17)+'\n':'')+receipt);host.dataset.voiceThrow='1'; },
      onStart: ({budget}) => {
        actions.hidden = true; status.textContent = '';
        shadow.querySelectorAll('[data-budget]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.budget) === budget)));
      },
      onResult: summary => { actions.hidden = false;const paid=global.RAStripClub?.price(opts.terms,summary.spent)??summary.spent;say(`ROUND COMPLETE · PAID $${paid} · HITS ${summary.hits} · MISSES ${summary.misses} · BACK TO RETURN`); },
      onError: () => { say('RICH: '+global.RAWriting.voice(19)); },
      onClose: () => {
        f15?.close();
        global.document.removeEventListener('keydown', key, true);
        global.document.removeEventListener('ra:scene', scene);
        host.remove(); previousFocus?.focus?.();
      }
    });
    function start(budget) {
      if (session.start(budget)) return;
      const t = opts.terms;
      say(t && t.first && t.paid > 0 ? (global.RAEconLines?.get('club.cap_reached') || 'NEED CASH') : ('RICH: '+global.RAWriting.voice(19)));
    }
    shadow.querySelectorAll('[data-budget]').forEach(button => button.addEventListener('click', () => start(Number(button.dataset.budget))));
    shadow.querySelector('.btn--again').addEventListener('click', () => start(session.game.core.budget));
    f15?.bind(session, {start, launchScene: id => { session.dispose(); return global.RAAdventureScene?.begin?.(id, {from: 'phone'}); }});
    const back = shadow.querySelector('[data-back]');
    back.addEventListener('click', () => session.dispose()); back.focus();
    global.document.addEventListener('keydown', key, true);
    global.document.addEventListener('ra:scene', scene);
    start(10000);
    if(!status.textContent)say('RICH: '+global.RAWriting.voice(16)+(opts.terms?.first?'\nRICH: '+global.RAWriting.voice(20)+'\n'+opts.terms.line:''));
    return true;
  }
  global.RAPhoneRegistry.declare('F06', {
    id: 'rainmaker', flag: FLAG,
    // RC2 (OL-063): the STRIP CLUB phone app (js/systems/strip_club.js) is the one home-screen entry; this app stays reachable
    // by openApp() and applies the same first-visit terms, so neither door skips the protection.
    hidden: true,
    render: () => '<h1>RAINMAKER</h1><button type="button" class="phone-button" data-phone-action="do:rainmaker:launch">MAKE IT RAIN</button>',
    onAction: action => { if (action === 'launch') launch({terms: global.RAStripClub?.terms?.() || null}); }
  });
  global.RAF06Rainmaker = {mount, launch, state, enabled, close: () => mounted?.dispose()};
})(window);
