# Lane M music contract (candidate)

Baseline 9fae3173c898d8cbc7416474a06c51b3a41b13a8. Assistant implementation decisions under delegated authority, not creator quotations.

RAMusic.getCareer() and storyContext() return {cooked,released,responses,performed}. cooked/released are latest draft or null: id,title,memory,memoryId,hook,trackId,masterTitle,day,dropped. Responses contain id,songId,trackId,draftTitle,title,masterTitle,memoryId,handle,text,responseKind,day,followers. performed is latest explicit success or null: id,receiptId,songId,title,trackId,masterTitle,outcome,pay,crowd,day. Legacy unqualified shows do not imply success.

COOK drafts reference existing masters; choices do not synthesize/remix audio. Seven playable IDs: bloodbath,ice_level_intro,montana,on_the_moon,almond_freestyle,oxblood,playmakers. octopus_brain/shopping_addict remain missing catalog slots. Stable cook operation ID, song release ID, response song/stage ID and performance run ID prevent duplicate effects. Success alone pays; failure/quit persist without pay.

Coordinator route patch: keep nine apps. Existing Radio contains WRITE A TRACK -> api.begin('COOK',{vars:{where:'music_room'}}), CATACOMB -> api.begin(done('A14')?'SHOW':'A14'), BARS -> RAMusic.playBars(api). Add ['COOK','A14','SHOW','A15','A16'] to allowed adventures. COOK uses its existing memory availability/oncePerNight; SHOW uses existing A14 prerequisite/oncePerNight, A15 uses existing A14 prerequisite. No new campaign/ending predicate. A16 remains optional S invitation. canStart permits phone/chain (and explicit retained castle entry) for these IDs; no restoration of other cut content. Radio do actions already pass phoneAction.

Shared game.js patch requested: START currently calls seekToLoopStart unconditionally, resetting saved radio time and applying Bloodbath loop offset to other masters. Replace that START-only call with `if (!window.RAMusicLibrary?.restored?.()) seekToLoopStart();`; add library restored() read-only flag or use library start() adapter. Ending library rotation remains unchanged. Coordinator owns game.js patch.

W preserves music post data and supplies photo rendering/approved keys. Stable post IDs music:release:<songId>, music:response:<songId>:<stage>. Specific photo moments: released saved draft at castle laptop (caption: draft title and reference master); successful selected-song Catacomb set (caption: actual draft title and audience recognition, never universal success). Do not attach a success photograph to failure/quit.

R21/R23/R41/R42/R43/R44/R45 BUILT is distinct from TESTED/ACCEPTED. No listener claim from playback or decode; actual human listening remains required. Natural integrated route awaits coordinator policy; fixtures must be labeled.
