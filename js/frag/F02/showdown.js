(function(){
 'use strict';
 // F02 → F01 SEAM — SHOWDOWN_CORE INTEGRATION BOUNDARY.
 // F01 SHOWDOWN_CORE is NOT frozen. This module therefore ships DATA and a CONTRACT only. It deliberately implements no
 // tactical combat, no turn model, no Oga loadout resolution and no substitute for F01. Every entry point is marked
 // F01_INTEGRATION_PENDING and every consumer is expected to bind it after F01 freezes.
 //
 // What F02 promises F01 (authored in Rich_Alucard_Patch_IRON_AND_GRACE_Guns.docx):
 //   * per-gun Showdown stats: damage (or range like "4-6"), range band (close|mid|long|area), hits/knockback/area.
 //   * guns change class play (MUSCLE + SAPPORO SHOTGUN = breacher; GHOST + SILENCER = assassin) — prose only.
 //   * each Oga carries one gun (the carried gun is F01 state; F02 supplies the catalog + resolution).
 //   * enemy guns: Open Mouth Gang Enforcers (shotguns), hunters (silver crossbows), Gbenga (Golden Draco).
 // What F02 needs from F01 (the binding contract, currently unimplemented):
 //   * RACombat2Ext.registerBossScript / registerAction for Showdown-specific abilities, or an F01-owned seam.
 //   * a per-Oga loadout read/write that F02 can assign a gun to (`showdown.assign`).
 //   * a shot resolver that consumes `showdown.stats(gunId)` and applies SILENCER/SCOPE.
 const R=window.RAIronAndGrace,C=window.RAIronCatalog;
 if(!R||!C)throw new Error('F02 showdown must load after catalog + registry');
 const PENDING='F01_INTEGRATION_PENDING';

 const showdown={
  pending:PENDING,
  frozen:false,
  // Authored data, safe to read now. Behaviour belongs to F01.
  stats:gunId=>R.showdown.stats(gunId),
  roster:()=>R.showdown.roster(),
  enemies:()=>R.showdown.enemies(),
  classNote:gunId=>R.showdown.classNote(gunId),
  // Assignment of a gun to an Oga is persisted in save.frag.F02 so it survives until F01 binds it. It is inert data:
  // nothing reads it into a fight in OPEN.
  assign(ogaId,gunId){return R.trap.assign(`oga:${ogaId}`,gunId);},
  carried:ogaId=>R.trap.owner(`oga:${ogaId}`),
  carriedList:()=>R.trap.list().filter(x=>x.owner.startsWith('oga:')),
  // No combat is implemented. Any caller that reaches here in OPEN gets an explicit refusal, never a substitute system.
  resolveShot(){throw new Error(`${PENDING}: SHOWDOWN_CORE is not frozen — F02 ships data/contracts only (no tactical combat)`);},
  simulate(){throw new Error(`${PENDING}: F02 does not simulate Showdowns`);}
 };

 window.RAIronShowdown=showdown;
 window.RAIronAndGrace.showdownSeam=showdown;
})();
