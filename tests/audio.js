test('audio: ten original stage themes have distinct identities',()=>{
  const audio=ByteRunner.audio,themes=Array.from({length:audio.stageCount},(_,i)=>audio.getStageTheme(i));
  assert(audio.stageCount===10&&themes.every(Boolean)&&new Set(themes).size===10,'stage themes are missing or duplicated');
});
test('audio: independent volume values persist and mute restores preferences',()=>{
  const audio=ByteRunner.audio,before=audio.preferences;
  try{
    audio.setMasterVolume(.42);audio.setMusicVolume(.27);audio.setSFXVolume(.73);audio.muteAll(true);
    const saved=JSON.parse(localStorage.getItem('byteRunner.audio.v1'));
    assert(Math.abs(saved.master-.42)<.001&&Math.abs(saved.music-.27)<.001&&Math.abs(saved.sfx-.73)<.001&&saved.muted,'audio values did not persist independently');
    audio.muteAll(false);
    assert(!audio.preferences.muted,'unmute did not restore audio');
  }finally{
    audio.setMasterVolume(before.master);audio.setMusicVolume(before.music);audio.setSFXVolume(before.sfx);audio.muteAll(before.muted);
  }
});
test('audio: same-track requests do not restart playback',()=>{
  const audio=ByteRunner.audio,before=audio.diagnostics,oldTrack=before.currentMusic,wasPaused=before.musicPaused;
  if(before.contextState==='uninitialized'&&!window.AudioContext&&!window.webkitAudioContext)return;
  try{
    audio.playMusic(1);const started=audio.diagnostics.musicStarts;
    audio.playMusic(1);
    assert(audio.diagnostics.currentMusic===1&&audio.diagnostics.musicStarts===started,'same stage restarted its music');
  }finally{
    audio.stopMusic();
    if(oldTrack>=0&&!wasPaused)audio.playMusic(oldTrack);
  }
});
test('audio: settings opens synchronously with its user interaction',()=>{
  const dialog=document.getElementById('settingsDialog');if(dialog.open)dialog.close();
  document.getElementById('settingsButton').click();
  assert(dialog.open,'settings dialog waited for AudioContext resume');
  dialog.close();ByteRunner.audio.stopMusic();
});
test('audio: opening settings pauses active gameplay immediately',()=>{
  setup(9);running=true;paused=false;menuScreen=false;
  const dialog=document.getElementById('settingsDialog');if(dialog.open)dialog.close();
  document.getElementById('settingsButton').click();
  assert(dialog.open&&paused&&!running,'settings failed to pause the running game');
  dialog.close();ByteRunner.audio.stopMusic();
});
test('audio: boss intro, phases, defeat and retry are idempotent',()=>{
  const audio=ByteRunner.audio;
  try{
    assert(audio.enterBossEncounter(),'boss intro did not start');
    assert(!audio.enterBossEncounter()&&audio.diagnostics.bossMode==='intro','boss intro duplicated');
    assert(audio.startBossMusic(1)&&audio.diagnostics.bossPhase===1,'phase one theme did not start');
    audio.setBossStage(2);assert(audio.diagnostics.bossPhase===2,'phase two theme did not change');
    audio.setBossStage(3);assert(audio.diagnostics.bossPhase===3,'phase three theme did not change');
    assert(audio.defeatBoss()&&!audio.defeatBoss()&&audio.diagnostics.bossMode==='defeated','boss defeat cue duplicated');
  }finally{audio.resetBossEncounter();audio.stopMusic();audio.pauseAll();}
  assert(audio.diagnostics.bossMode==='idle'&&audio.diagnostics.activeMusicVoices===0,'boss cleanup left music active');
});
test('audio: VIRUS ZERO gameplay events select phase music and defeat cue',()=>{
  const audio=ByteRunner.audio;setup(9);audio.resetBossEncounter();
  const boss=viruses.find(v=>v.multiStage);assert(Boolean(boss),'VIRUS ZERO missing from final stage');
  components.forEach(component=>{component.repaired=true;component.corruption=0;component.integrity=100;});
  player.x=boss.bossBounds.left+260;player.y=bossGroundY(boss)-player.height;boss.bossCycleCooldown=0;
  draw();assert(audio.diagnostics.bossMode==='intro','entering the arena did not trigger its intro');
  updateVirusZero(boss,1/60,player.x+17,player.y+24);
  assert(audio.diagnostics.bossMode==='battle'&&audio.diagnostics.bossPhase===1,'first telegraph did not start phase one music');
  boss.hp=boss.maxHp*.66;updateVirusZero(boss,1/60,player.x+17,player.y+24);
  assert(boss.bossStage===2&&audio.diagnostics.bossPhase===2,'real phase two threshold did not change the music');
  boss.hp=boss.maxHp*.33;updateVirusZero(boss,1/60,player.x+17,player.y+24);
  assert(boss.bossStage===3&&audio.diagnostics.bossPhase===3,'real phase three threshold did not change the music');
  boss.bossPhaseTransitionTime=0;damageVirus(boss,boss.hp+1e4);
  assert(!boss.alive&&audio.diagnostics.bossMode==='defeated','boss defeat did not silence the battle score');
  audio.resetBossEncounter();audio.stopMusic();audio.pauseAll();audio.close();
  assert(audio.diagnostics.contextState==='uninitialized'&&audio.diagnostics.activeSFXVoices===0,'AudioContext or SFX voices survived cleanup');
});
