// IF-1 headless-harness helpers (integration-owned). The vm-based test harnesses load a hand-picked engine subset instead of
// index.html; these helpers splice the IF-1 modules into such a list at the SAME anchors js/loader/manifest.json uses, so the
// headless tests exercise production load order with every fragment flag OFF.
export const IF1_PRE_STATE=['js/if1/flag_defaults.js','js/if1/features.js','js/if1/migration_ledger.js','js/if1/migrations.js'];
export const IF1_AFTER_STATE=['js/if1/state_watch.js','js/if1/frag_state.js'];
export const IF1_AFTER_CLOCK=['js/if1/wake_bus.js','js/if1/money_ledger.js','js/if1/heat.js','js/if1/heat_floors.js','js/if1/social.js','js/if1/crew.js','js/if1/vehicles.js','js/if1/districts.js','js/if1/sales_channels.js'];
export const IF1_AFTER_VAMPGRAM=['js/if1/vampgram_api.js'];
export const IF1_AFTER_ART_REGISTRY=['js/data/art/registry_parts.js'];
// Loaded AFTER accepted content (needs RANewOga for its compatibility adapters).
export const IF1_TAIL=['js/if1/combat2_ext.js','js/if1/if1.js','js/if1/first_event_unlock.js'];
export function withIf1(files){
  const out=[];
  for(const f of files){
    if(f==='js/engine/state.js')out.push(...IF1_PRE_STATE);
    out.push(f);
    if(f==='js/engine/state.js')out.push(...IF1_AFTER_STATE);
    if(f==='js/systems/life_clock.js')out.push(...IF1_AFTER_CLOCK);
    if(f==='js/systems/vampgram.js')out.push(...IF1_AFTER_VAMPGRAM);
    if(f==='js/data/art_registry.js')out.push(...IF1_AFTER_ART_REGISTRY);
  }
  return out;
}
