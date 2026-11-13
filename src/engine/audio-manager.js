/* Web Audio mixer and original procedural score for the BYTE RUNNER campaign. */
(() => {
  'use strict';
  const api=window.ByteRunner,key='byteRunner.audio.v1',legacyKey='byteRunner.sound.v1';
  const stageMusic=[
    {title:'Placa em descoberta',bpm:106,root:48,scale:[0,2,4,7,9],chords:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]],melody:[0,-1,2,4,-1,4,2,-1,0,-1,2,4,5,-1,4,-1,2,-1,4,7,-1,5,4,2,0,-1,2,4,2,-1,0,-1],bass:[0,null,0,7,5,null,7,null],arp:null,lead:'square',pad:'triangle',bassWave:'triangle',cutoff:4200,drums:{kick:[0],snare:[4],hat:[]},combat:{kick:[0,3,4,7],snare:[2,6],hat:[1,3,5,7]}},
    {title:'Janelas do sistema',bpm:96,root:52,scale:[0,2,3,5,7,8,10],chords:[[0,3,7],[-8,-5,-1],[-3,0,4],[-10,-7,-3]],melody:[0,-1,2,3,-1,5,3,-1,2,-1,0,-1,3,5,7,-1,5,-1,3,2,-1,0,-2,-1,2,3,5,-1,7,5,3,-1],bass:[0,null,0,null,-8,null,-8,-3],arp:[0,2,1,3,2,1,3,1],lead:'sawtooth',pad:'sawtooth',bassWave:'triangle',cutoff:1500,drums:{kick:[0,5],snare:[4],hat:[2,6]},combat:{kick:[0,2,4,6],snare:[2,6],hat:[1,3,5,7]}},
    {title:'Roteamento de pacotes',bpm:112,root:50,scale:[0,2,3,5,7,9,10],chords:[[0,3,7],[-5,-2,2],[-8,-5,-1],[-3,0,4]],melody:[0,-1,3,-1,5,3,-1,2,0,-1,3,5,-1,7,5,-1,3,-1,5,7,5,-1,3,-1,2,-1,0,3,-1,5,3,-1],bass:[0,0,null,7,0,null,5,7],arp:[0,3,2,1,3,2,1,2],lead:'square',pad:'triangle',bassWave:'sawtooth',cutoff:2800,drums:{kick:[0,3,6],snare:[4],hat:[1,3,5,7]},combat:{kick:[0,2,3,4,6,7],snare:[2,6],hat:[0,1,2,3,4,5,6,7]}},
    {title:'Rota em alta velocidade',bpm:124,root:45,scale:[0,2,3,5,7,8,10],chords:[[0,3,7],[-5,-2,2],[2,5,9],[-3,0,4]],melody:[0,2,3,-1,5,3,2,-1,0,2,5,7,-1,5,3,-1,2,3,5,-1,7,5,3,2,0,-1,2,3,5,3,2,-1],bass:[0,null,0,3,5,null,3,7],arp:[0,1,3,2,4,3,1,2],lead:'sawtooth',pad:'sawtooth',bassWave:'sawtooth',cutoff:2300,drums:{kick:[0,2,4,6],snare:[2,6],hat:[0,1,2,3,4,5,6,7]},combat:{kick:[0,1,2,3,4,5,6,7],snare:[2,6],hat:[0,1,2,3,4,5,6,7]}},
    {title:'Sinal entre torres',bpm:78,root:54,scale:[0,2,4,6,7,9,11],chords:[[0,4,7],[-4,0,3],[-9,-5,-2],[-2,2,5]],melody:[0,-1,-1,2,-1,-1,4,-1,6,-1,4,-1,2,-1,-1,-1,0,-1,2,-1,4,6,-1,-1,7,-1,6,4,-1,2,-1,-1],bass:[0,null,null,7,null,null,-4,null],arp:[0,2,4,3,2,1,3,4],lead:'sine',pad:'sine',bassWave:'sine',cutoff:1900,drums:{kick:[0],snare:[],hat:[3,7]},combat:{kick:[0,4],snare:[4],hat:[1,3,5,7]}},
    {title:'Oficina de cabos',bpm:104,root:50,scale:[0,1,3,5,7,8,10],chords:[[0,3,7],[-2,2,5],[-7,-4,0],[-5,-2,2]],melody:[0,-1,3,2,-1,5,-1,3,0,-1,2,3,5,-1,3,-1,7,-1,5,3,-1,2,0,-1,3,-1,5,7,5,-1,3,-1],bass:[0,0,null,0,-7,null,-5,0],arp:[0,3,2,3,1,3,2,1],lead:'triangle',pad:'sawtooth',bassWave:'triangle',cutoff:1250,drums:{kick:[0,3,4],snare:[4],hat:[2,6],metal:[2,6]},combat:{kick:[0,2,3,4,6,7],snare:[2,6],hat:[1,3,5,7],metal:[0,4]}},
    {title:'Concessões em sequência',bpm:100,root:55,scale:[0,2,4,5,7,9,11],chords:[[0,4,7],[-5,-1,2],[-9,-5,-2],[-2,2,5]],melody:[0,-1,2,4,2,-1,5,-1,4,-1,2,0,-1,2,4,-1,5,-1,7,5,-1,4,2,-1,0,2,4,-1,5,4,2,-1],bass:[0,null,0,4,-5,null,-2,4],arp:[0,2,4,2,1,3,4,3],lead:'triangle',pad:'triangle',bassWave:'sine',cutoff:2600,drums:{kick:[0,4],snare:[4],hat:[2,6]},combat:{kick:[0,2,4,6],snare:[2,6],hat:[1,3,5,7]}},
    {title:'Ecos da resolução',bpm:84,root:50,scale:[0,2,3,6,7,8,11],chords:[[0,3,7],[-6,-3,1],[-8,-5,-1],[-1,2,5]],melody:[0,-1,3,-1,6,3,-1,-1,7,-1,6,3,-1,2,-1,-1,0,-1,2,3,-1,6,7,-1,6,-1,3,2,-1,0,-1,-1],bass:[0,null,-8,null,-6,null,-1,null],arp:[0,3,6,4,2,5,3,1],lead:'sine',pad:'sine',bassWave:'triangle',cutoff:1700,drums:{kick:[0],snare:[],hat:[3]},combat:{kick:[0,4],snare:[4],hat:[1,3,5,7]}},
    {title:'Protocolo de contenção',bpm:118,root:48,scale:[0,2,3,5,7,8,11],chords:[[0,3,7],[-9,-6,-2],[-5,-2,2],[-1,2,5]],melody:[0,-1,3,5,-1,3,2,-1,0,2,-1,5,7,-1,5,3,2,-1,5,7,-1,8,7,-1,5,3,2,-1,3,5,2,-1],bass:[0,0,null,0,-9,null,-5,0],arp:[0,2,3,5,4,2,1,3],lead:'sawtooth',pad:'sawtooth',bassWave:'sawtooth',cutoff:1750,drums:{kick:[0,3,4],snare:[4],hat:[2,6]},combat:{kick:[0,1,2,3,4,5,6,7],snare:[2,6],hat:[0,1,2,3,4,5,6,7]}},
    {title:'Núcleo de servidores',bpm:88,root:52,scale:[0,2,3,5,7,8,10],chords:[[0,3,7],[-8,-5,-1],[-3,0,4],[-10,-7,-3]],melody:[0,-1,-1,3,-1,5,-1,3,2,-1,0,-1,-2,-1,-1,-1,0,-1,3,5,-1,7,5,-1,3,-1,2,0,-1,-2,-1,-1],bass:[0,null,-8,null,-3,null,-10,null],arp:[0,2,3,5,3,2,1,2],lead:'triangle',pad:'sawtooth',bassWave:'sine',cutoff:1100,drums:{kick:[0],snare:[4],hat:[]},combat:{kick:[0,3,4,7],snare:[2,6],hat:[1,3,5,7],metal:[4]}}
  ];
  const bossMusic=[
    {title:'VIRUS ZERO // GUARDA',bpm:78,root:40,scale:[0,1,3,5,7,8,10],chords:[[0,3,7],[-5,-2,2],[-8,-5,-1],[-1,2,5]],melody:[0,-1,3,-1,5,3,-1,1,0,-1,3,5,-1,7,5,-1,3,-1,5,7,-1,8,7,5,3,-1,1,3,-1,5,3,-1],bass:[0,null,0,-8,0,null,-5,-1],arp:null,lead:'sawtooth',pad:'sawtooth',bassWave:'sawtooth',cutoff:1050,drums:{kick:[0,4],snare:[6],hat:[],metal:[4]},combat:{kick:[0,4],snare:[2,6],hat:[],metal:[4]}},
    {title:'VIRUS ZERO // SOBRECARGA',bpm:96,root:40,scale:[0,1,3,5,7,8,10],chords:[[0,3,7],[-5,-2,2],[-8,-5,-1],[-1,2,5]],melody:[0,-1,3,5,-1,3,1,-1,0,-1,3,5,7,-1,5,3,3,-1,5,7,-1,8,7,5,3,-1,1,3,5,-1,3,1],bass:[0,0,null,-8,0,null,-5,-1],arp:[0,2,3,2,4,3,2,1],lead:'sawtooth',pad:'sawtooth',bassWave:'sawtooth',cutoff:1450,drums:{kick:[0,2,4,6],snare:[2,6],hat:[1,3,5,7],metal:[4]},combat:{kick:[0,2,4,6],snare:[2,6],hat:[1,3,5,7],metal:[0,4]}},
    {title:'VIRUS ZERO // COLAPSO',bpm:116,root:40,scale:[0,1,3,5,7,8,10],chords:[[0,3,7],[-5,-2,2],[-8,-5,-1],[-1,2,5]],melody:[0,3,5,7,-1,8,7,5,3,-1,5,7,10,8,7,-1,3,5,7,8,-1,10,8,7,5,3,1,3,5,-1,3,1],bass:[0,0,-8,0,0,-5,-1,0],arp:[0,2,3,4,5,4,3,1],lead:'sawtooth',pad:'sawtooth',bassWave:'sawtooth',cutoff:1850,drums:{kick:[0,1,2,3,4,5,6,7],snare:[2,6],hat:[0,1,2,3,4,5,6,7],metal:[0,2,4,6]},combat:{kick:[0,1,2,3,4,5,6,7],snare:[2,6],hat:[0,1,2,3,4,5,6,7],metal:[0,2,4,6]}}
  ];
  const tone=(wave,frequency,end,duration,level,filter='lowpass',cutoff=2600,delay=0)=>({wave,frequency,end,duration,level,filter,cutoff,delay});
  const hiss=(duration,level,filter='bandpass',cutoff=1800,delay=0)=>({noise:true,duration,level,filter,cutoff,delay});
  const sounds={
    attack:{cooldown:.055,max:3,voices:[tone('triangle',720,410,.085,.035,'bandpass',1750)]},
    charge:{cooldown:.14,max:2,voices:[tone('sine',180,570,.23,.038,'lowpass',1200),tone('triangle',390,740,.19,.018,'lowpass',2200,.035)]},
    burst:{cooldown:.12,max:2,voices:[hiss(.09,.018,'highpass',3600),tone('sawtooth',180,72,.26,.055,'lowpass',680,.012),tone('triangle',490,230,.19,.03,'bandpass',1400,.025)]},
    burstHit:{cooldown:.04,max:4,voices:[tone('sine',135,48,.14,.055,'lowpass',460),hiss(.075,.027,'bandpass',1250)]},
    hit:{cooldown:.035,max:5,voices:[tone('triangle',220,105,.105,.038,'lowpass',900),hiss(.045,.012,'highpass',2400)]},
    enemyHit:{cooldown:.035,max:5,voices:[tone('triangle',310,145,.12,.04,'bandpass',1100),hiss(.055,.014,'highpass',2800,.012)]},
    armoredImpact:{cooldown:.08,max:3,voices:[tone('square',155,63,.16,.052,'lowpass',520),tone('sine',410,180,.19,.026,'bandpass',850,.012),hiss(.065,.018,'bandpass',900)]},
    jump:{cooldown:.08,max:2,voices:[tone('sine',245,455,.14,.035,'lowpass',1550),hiss(.055,.009,'highpass',3000,.025)]},
    land:{cooldown:.07,max:2,voices:[tone('sine',105,42,.12,.055,'lowpass',360),hiss(.045,.016,'lowpass',850)]},
    damage:{cooldown:.16,max:2,voices:[tone('sawtooth',190,54,.22,.055,'lowpass',650),hiss(.1,.023,'bandpass',1450,.018)]},
    shieldActivate:{cooldown:.2,max:1,voices:[tone('sine',300,820,.24,.027,'bandpass',2300),tone('triangle',460,920,.29,.02,'highpass',3800,.045),tone('sine',700,460,.25,.018,'lowpass',1800,.09)]},
    shieldExpire:{cooldown:.25,max:1,voices:[tone('sine',720,300,.28,.024,'bandpass',1800),hiss(.16,.012,'highpass',4200,.07)]},
    dash:{cooldown:.12,max:2,voices:[hiss(.15,.026,'bandpass',1050),tone('triangle',280,125,.13,.03,'lowpass',780,.012)]},
    heal:{cooldown:.2,max:1,voices:[tone('sine',440,540,.26,.027,'lowpass',1700),tone('sine',554,660,.28,.023,'lowpass',2100,.095),tone('sine',659,790,.36,.024,'lowpass',2500,.19)]},
    lowHealth:{cooldown:5,max:1,voices:[tone('sine',220,175,.22,.025,'lowpass',620),tone('triangle',196,150,.28,.018,'lowpass',520,.34)]},
    robotShutdown:{cooldown:2,max:1,voices:[tone('sawtooth',150,38,.82,.044,'lowpass',360),tone('sine',470,78,.66,.026,'bandpass',760,.16),hiss(.62,.015,'lowpass',580,.14)]},
    failureGlitch:{cooldown:2,max:1,voices:[hiss(.11,.025,'highpass',5200),tone('square',940,210,.17,.022,'bandpass',2300,.06),hiss(.13,.018,'bandpass',1350,.21)]},
    defeatCue:{cooldown:2,max:1,voices:[tone('triangle',196,174,.31,.024,'lowpass',900,.05),tone('sine',147,131,.46,.028,'lowpass',620,.37),tone('sine',110,82,.72,.03,'lowpass',380,.82)]},
    pulse:{cooldown:.2,max:1,voices:[tone('sine',260,520,.19,.028,'bandpass',1700),tone('triangle',420,760,.22,.022,'highpass',3200,.035)]},
    repairOpen:{channel:'interface',cooldown:.2,max:1,voices:[tone('sine',330,494,.2,.022,'lowpass',1500),tone('triangle',494,659,.25,.018,'lowpass',1800,.09)]},
    repairAction:{channel:'interface',cooldown:.065,max:3,voices:[tone('triangle',390,330,.055,.012,'lowpass',1100)]},
    wireConnect:{channel:'interface',cooldown:.08,max:2,voices:[tone('triangle',310,620,.13,.027,'bandpass',2100),hiss(.07,.012,'highpass',3300,.025)]},
    switchOn:{channel:'interface',cooldown:.1,max:2,voices:[tone('square',180,320,.12,.026,'lowpass',950),tone('sine',520,520,.16,.02,'bandpass',1800,.06)]},
    correct:{channel:'interface',cooldown:.08,max:3,voices:[tone('sine',523,659,.13,.023,'lowpass',1800),tone('triangle',659,784,.17,.025,'lowpass',2200,.1)]},
    wrong:{channel:'interface',cooldown:.16,max:2,voices:[tone('triangle',245,175,.17,.026,'lowpass',950),hiss(.055,.01,'bandpass',1000,.025)]},
    repair:{channel:'interface',cooldown:.3,max:1,voices:[tone('sine',392,523,.22,.025,'lowpass',1700),tone('sine',523,659,.24,.022,'lowpass',1950,.16),tone('triangle',659,784,.34,.026,'lowpass',2200,.32)]},
    repairFailed:{channel:'interface',cooldown:.3,max:1,voices:[tone('sawtooth',260,125,.28,.025,'lowpass',780),hiss(.12,.015,'bandpass',1200,.08)]},
    collect:{channel:'interface',cooldown:.045,max:4,voices:[tone('sine',690,880,.1,.025,'bandpass',2400),tone('triangle',990,1180,.12,.016,'highpass',4200,.045)]},
    xp:{channel:'interface',cooldown:.055,max:4,voices:[tone('triangle',560,730,.11,.022,'lowpass',2200)]},
    level:{channel:'interface',cooldown:.5,max:1,voices:[tone('sine',330,494,.22,.028,'lowpass',1800),tone('sine',440,659,.3,.025,'lowpass',2200,.15),tone('triangle',659,988,.42,.027,'lowpass',2600,.32)]},
    abilityUnlock:{channel:'interface',cooldown:.35,max:1,voices:[tone('triangle',440,554,.18,.025,'lowpass',1900),tone('sine',554,740,.22,.023,'lowpass',2300,.13),tone('sine',740,988,.33,.025,'lowpass',2800,.29)]},
    upgradeSelect:{channel:'interface',cooldown:.12,max:2,voices:[tone('triangle',440,660,.16,.024,'lowpass',2100),tone('sine',660,784,.19,.018,'lowpass',2400,.07)]},
    checkpoint:{channel:'interface',cooldown:.5,max:1,voices:[tone('sine',392,523,.18,.024,'lowpass',1800),tone('sine',523,659,.22,.023,'lowpass',2100,.16),tone('triangle',659,880,.3,.026,'lowpass',2500,.34)]},
    victory:{channel:'interface',cooldown:1,max:1,voices:[tone('triangle',392,523,.28,.022,'lowpass',1700),tone('triangle',523,659,.32,.025,'lowpass',2100,.24),tone('sine',659,784,.52,.027,'lowpass',2500,.5)]},
    start:{channel:'interface',cooldown:.4,max:1,voices:[tone('triangle',280,420,.18,.021,'lowpass',1500),tone('sine',420,560,.24,.02,'lowpass',1900,.12)]},
    correctAnswer:{channel:'interface',cooldown:.25,max:1,voices:[tone('sine',523,659,.16,.024,'lowpass',1900),tone('triangle',659,784,.2,.023,'lowpass',2200,.12),tone('sine',784,988,.28,.024,'lowpass',2500,.28)]},
    wrongAnswer:{channel:'interface',cooldown:.25,max:1,voices:[tone('triangle',294,247,.19,.025,'lowpass',1000),tone('sawtooth',196,147,.28,.02,'lowpass',660,.14)]},
    enemyWarning:{cooldown:.32,max:2,voices:[tone('triangle',330,440,.19,.024,'bandpass',1250),tone('sine',220,294,.23,.02,'lowpass',760,.08)]},
    enemyDetect:{cooldown:1.2,max:1,voices:[tone('sine',350,265,.2,.018,'bandpass',1050),tone('triangle',520,410,.16,.012,'highpass',2300,.06)]},
    dashWarning:{cooldown:.32,max:2,voices:[tone('sawtooth',180,360,.16,.026,'bandpass',1050),hiss(.12,.014,'highpass',2600,.04)]},
    infectWarning:{cooldown:.5,max:1,voices:[tone('sine',145,105,.3,.028,'lowpass',520),tone('triangle',310,230,.26,.017,'bandpass',940,.1)]},
    enemyStrike:{cooldown:.12,max:3,voices:[tone('triangle',180,75,.14,.038,'lowpass',580),hiss(.055,.018,'bandpass',1150)]},
    enemyDash:{cooldown:.14,max:2,voices:[hiss(.17,.025,'bandpass',1150),tone('sawtooth',245,82,.19,.03,'lowpass',630,.015)]},
    enemyShot:{cooldown:.16,max:2,voices:[tone('square',460,230,.12,.024,'bandpass',1450),hiss(.055,.01,'highpass',3600,.025)]},
    enemyDive:{cooldown:.25,max:2,voices:[tone('sine',640,150,.25,.027,'bandpass',1450),hiss(.15,.015,'highpass',3400,.045)]},
    enemySummon:{cooldown:.4,max:1,voices:[tone('sawtooth',110,165,.38,.026,'lowpass',560),tone('triangle',220,330,.33,.02,'bandpass',1050,.14)]},
    dnsEcho:{cooldown:.28,max:2,voices:[tone('sine',780,1170,.19,.021,'bandpass',2700),tone('triangle',520,780,.25,.015,'highpass',3300,.13)]},
    enemyDeath:{cooldown:.06,max:4,voices:[tone('sawtooth',260,72,.22,.035,'lowpass',770),hiss(.12,.014,'bandpass',1350,.035)]},
    flyerHum:{cooldown:.9,max:1,voices:[tone('sine',520,450,.22,.012,'bandpass',1250),tone('triangle',780,690,.18,.008,'highpass',2600,.06)]},
    bossTransition:{cooldown:.7,max:1,voices:[tone('sawtooth',95,42,.58,.042,'lowpass',420),hiss(.3,.017,'bandpass',900,.12)]},
    bossWarning:{cooldown:.35,max:2,voices:[tone('square',130,210,.28,.031,'lowpass',720),tone('sawtooth',260,195,.22,.018,'bandpass',1100,.1)]},
    bossImpact:{cooldown:.1,max:3,voices:[tone('sine',95,38,.23,.055,'lowpass',400),tone('square',180,70,.16,.024,'lowpass',650,.03)]},
    bossAppear:{cooldown:2,max:1,voices:[tone('sawtooth',68,42,.9,.04,'lowpass',210),hiss(.62,.018,'bandpass',480,.12)]},
    bossAlert:{cooldown:3,max:1,voices:[tone('sine',196,185,.38,.027,'lowpass',520),tone('triangle',392,392,.48,.022,'bandpass',1150,.22)]},
    bossIntroMotif:{cooldown:3,max:1,voices:[tone('sawtooth',164.81,164.81,.34,.024,'lowpass',860),tone('sawtooth',196,196,.34,.023,'lowpass',960,.38),tone('triangle',246.94,329.63,.58,.026,'bandpass',1350,.78),tone('sawtooth',164.81,82.41,.72,.028,'lowpass',480,1.4)]},
    bossHit:{cooldown:.075,max:4,voices:[tone('square',120,52,.18,.044,'lowpass',440),hiss(.08,.022,'bandpass',850,.018)]},
    bossSlam:{cooldown:.22,max:1,voices:[tone('sine',82,34,.34,.065,'lowpass',290),hiss(.12,.026,'lowpass',520,.025)]},
    bossChargeWarning:{cooldown:.35,max:1,voices:[tone('sawtooth',72,185,.52,.032,'lowpass',620),tone('sine',146,294,.42,.022,'bandpass',1050,.08)]},
    bossCharge:{cooldown:.25,max:1,voices:[hiss(.24,.032,'bandpass',820,.025),tone('sawtooth',185,48,.34,.058,'lowpass',480,.045)]},
    bossVolley:{cooldown:.2,max:1,voices:[tone('square',260,190,.16,.032,'bandpass',1100),tone('triangle',520,780,.19,.021,'highpass',2600,.075)]},
    bossProjectile:{cooldown:.2,max:2,voices:[tone('sawtooth',420,155,.17,.029,'bandpass',1450),hiss(.08,.012,'highpass',3800,.02)]},
    bossArea:{cooldown:.3,max:1,voices:[tone('sine',110,165,.42,.038,'lowpass',520),tone('sawtooth',220,73,.46,.035,'lowpass',640,.12),hiss(.18,.02,'bandpass',1050,.18)]},
    bossCombo:{cooldown:.35,max:1,voices:[tone('sawtooth',82,41,.38,.058,'lowpass',330),tone('square',246,493,.25,.025,'bandpass',1300,.08),hiss(.2,.022,'highpass',3200,.18)]},
    bossFinalWarning:{cooldown:.3,max:1,voices:[tone('sawtooth',98,196,.34,.035,'lowpass',630),tone('square',392,196,.28,.026,'bandpass',1250,.16),tone('sine',784,784,.12,.012,'highpass',3200,.45)]},
    bossDestroy:{cooldown:4,max:1,voices:[tone('sawtooth',185,28,.95,.058,'lowpass',360),hiss(.75,.026,'bandpass',760,.08),tone('sine',520,64,.7,.026,'bandpass',980,.2)]},
    bossVictoryCue:{cooldown:4,max:1,voices:[tone('triangle',164.81,164.81,.36,.027,'lowpass',1000),tone('triangle',196,196,.36,.026,'lowpass',1200,.34),tone('sine',246.94,329.63,.72,.03,'lowpass',2100,.68),tone('triangle',329.63,493.88,.82,.026,'lowpass',2600,1.02)]},
    pause:{channel:'interface',cooldown:.2,max:1,voices:[tone('triangle',520,380,.14,.02,'lowpass',1400)]},
    resume:{channel:'interface',cooldown:.2,max:1,voices:[tone('triangle',380,560,.15,.021,'lowpass',1600)]},
    menuOpen:{channel:'interface',cooldown:.15,max:1,voices:[tone('sine',350,480,.16,.02,'lowpass',1500)]},
    menuClose:{channel:'interface',cooldown:.15,max:1,voices:[tone('sine',480,350,.15,.018,'lowpass',1400)]},
    uiHover:{channel:'interface',cooldown:.09,max:1,voices:[tone('sine',780,820,.035,.005,'lowpass',1600)]},
    uiSelect:{channel:'interface',cooldown:.045,max:2,voices:[tone('triangle',420,560,.075,.014,'lowpass',1900)]},
    settingChange:{channel:'interface',cooldown:.1,max:1,voices:[tone('sine',500,640,.07,.012,'lowpass',1700)]},
    confirm:{channel:'interface',cooldown:.15,max:1,voices:[tone('sine',440,660,.14,.02,'lowpass',1800)]},
    error:{channel:'interface',cooldown:.2,max:1,voices:[tone('triangle',230,160,.16,.021,'lowpass',800)]}
  };
  const legacy=api.experience?.settings||{},defaults={master:legacy.volume??.65,music:legacy.music??.35,sfx:legacy.sfx??.85,muted:false};
  let prefs={...defaults};try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved)for(const n of ['master','music','sfx'])if(Number.isFinite(saved[n]))prefs[n]=Math.max(0,Math.min(1,saved[n]));if(typeof saved?.muted==='boolean')prefs.muted=saved.muted;else prefs.muted=localStorage.getItem(legacyKey)==='off';}catch{}
  let context=null,master=null,compressor=null,music=null,combat=null,ui=null,ambient=null,musicBus=null,explorationBus=null,combatLayer=null,moodBus=null,noiseBuffer=null,musicTimer=null,stopMusicTimer=null,crossfadeTimer=null,bossOutroTimer=null,activeTrack=-1,bossMode='idle',bossPhase=0,musicStarts=0,beat=0,nextNote=0,voices=[],activeSfx=0,sfxVoiceCount=0,sfxVoices=[],sfxCooldowns=new Map(),sfxCounts=new Map(),musicPaused=true,combatActive=false,repairActive=false,unlocked=false,settingsCallback=()=>{};
  const frequency=n=>440*Math.pow(2,(n-69)/12),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function store(){try{localStorage.setItem(key,JSON.stringify(prefs));localStorage.setItem(legacyKey,prefs.muted?'off':'on');}catch{}settingsCallback?.({...prefs});}
  function ramp(param,value,seconds=.08){if(!context||!param)return;const now=context.currentTime;param.cancelScheduledValues(now);param.setTargetAtTime(value,now,seconds);}
  function fadeTo(param,value,seconds){if(!context||!param)return;const now=context.currentTime,from=param.value;param.cancelScheduledValues(now);param.setValueAtTime(from,now);param.linearRampToValueAtTime(value,now+seconds);}
  function musicLevel(){return prefs.muted||prefs.master<=0||bossMode==='intro'||bossMode==='defeated'?0:prefs.music;}
  function syncMusicTimer(){const shouldRun=Boolean(context&&context.state==='running'&&!musicPaused&&activeTrack>=0&&musicLevel()>0);if(shouldRun&&!musicTimer)musicTimer=setInterval(schedule,30);else if(!shouldRun&&musicTimer){clearInterval(musicTimer);musicTimer=null;}}
  function refresh(){if(!context)return;const audible=prefs.muted?0:prefs.master;ramp(master.gain,audible);ramp(music.gain,musicPaused?0:musicLevel());ramp(combat.gain,prefs.muted?0:prefs.sfx);ramp(ui.gain,prefs.muted?0:prefs.sfx);ramp(ambient.gain,prefs.muted?0:1);ramp(moodBus.gain,repairActive ? .58 : 1,.45);ramp(explorationBus.gain,combatActive ? .84 : 1,.45);ramp(combatLayer.gain,combatActive&&!repairActive ? .76 : 0,.7);syncMusicTimer();}
  function ensure(){if(context)return context;const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return null;try{context=new Audio();context.onstatechange=syncMusicTimer;master=context.createGain();compressor=context.createDynamicsCompressor();compressor.threshold.setValueAtTime(-10,context.currentTime);compressor.knee.setValueAtTime(8,context.currentTime);compressor.ratio.setValueAtTime(8,context.currentTime);compressor.attack.setValueAtTime(.003,context.currentTime);compressor.release.setValueAtTime(.16,context.currentTime);music=context.createGain();combat=context.createGain();ui=context.createGain();ambient=context.createGain();musicBus=context.createGain();explorationBus=context.createGain();combatLayer=context.createGain();moodBus=context.createGain();music.connect(musicBus);explorationBus.connect(music);combatLayer.connect(music);musicBus.connect(moodBus);moodBus.connect(master);combat.connect(master);ui.connect(master);ambient.connect(master);master.connect(compressor);compressor.connect(context.destination);noiseBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*.5),context.sampleRate);const data=noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;refresh();return context;}catch{const failed=context;context=null;try{failed?.close().catch(()=>{});}catch{}return null;}}
  async function unlock(){const ctx=ensure();if(ctx?.state==='suspended')try{await ctx.resume();}catch{}unlocked=Boolean(ctx&&ctx.state==='running');syncMusicTimer();return unlocked;}
  function stopVoices(){for(const voice of voices){try{voice.node.stop();}catch{}try{voice.node.disconnect();voice.filter?.disconnect();voice.gain?.disconnect();}catch{}}voices=[];}
  function trackVoice(node,filter,gain,end){const entry={node,filter,gain};voices.push(entry);node.onended=()=>{try{node.disconnect();filter?.disconnect();gain?.disconnect();}catch{}voices=voices.filter(v=>v!==entry);end?.();};return entry;}
  function note(pitch,time,duration,options={}){if(voices.length>=30)return;try{const osc=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter();osc.type=options.wave||'triangle';osc.frequency.setValueAtTime(frequency(pitch),time);if(options.detune)osc.detune.setValueAtTime(options.detune,time);filter.type='lowpass';filter.frequency.setValueAtTime(options.cutoff||3200,time);filter.Q.setValueAtTime(options.q||.65,time);osc.connect(filter);filter.connect(gain);gain.connect(options.bus||explorationBus);const attack=options.attack??.025,release=options.release??.12,peak=Math.max(.0001,options.level||.012);gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(peak,time+attack);gain.gain.setValueAtTime(peak,time+Math.max(attack,duration-release));gain.gain.exponentialRampToValueAtTime(.0001,time+duration);osc.start(time);osc.stop(time+duration+.015);trackVoice(osc,filter,gain);}catch{}}
  function drum(kind,time,level=.018,bus=explorationBus){if(voices.length>=30)return;try{const gain=context.createGain();gain.connect(bus);const duration=kind==='kick'?.2:kind==='metal'?.32:kind==='snare'?.15:.065;gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(level,time+.004);gain.gain.exponentialRampToValueAtTime(.0001,time+duration);
      if(kind==='kick'){const osc=context.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(105,time);osc.frequency.exponentialRampToValueAtTime(42,time+.14);osc.connect(gain);osc.start(time);osc.stop(time+duration+.01);trackVoice(osc,null,gain);}
      else if(kind==='metal'){const osc=context.createOscillator();osc.type='square';osc.frequency.setValueAtTime(690,time);osc.frequency.exponentialRampToValueAtTime(310,time+.24);const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.setValueAtTime(1150,time);filter.Q.setValueAtTime(5,time);osc.connect(filter);filter.connect(gain);osc.start(time);osc.stop(time+duration+.01);trackVoice(osc,filter,gain);}
      else {const source=context.createBufferSource(),filter=context.createBiquadFilter();source.buffer=noiseBuffer;filter.type=kind==='hat'?'highpass':'bandpass';filter.frequency.setValueAtTime(kind==='hat'?7200:1700,time);filter.Q.setValueAtTime(kind==='hat'?0.7:1.2,time);source.connect(filter);filter.connect(gain);source.start(time);source.stop(time+duration);trackVoice(source,filter,gain);}
    }catch{}}
  function scalePitch(tune,degree,octaves=0){const size=tune.scale.length,oct=Math.floor(degree/size),index=((degree%size)+size)%size;return tune.root+tune.scale[index]+12*(oct+octaves);}
  function schedule(){if(!context||musicPaused||context.state!=='running'||activeTrack<0||musicLevel()<=0)return;const inBoss=bossMode==='battle',tune=inBoss?bossMusic[Math.max(0,bossPhase-1)]:stageMusic[activeTrack],step=60/tune.bpm/2,now=context.currentTime;if(nextNote<now)nextNote=now+.025;
    for(let count=0;nextNote<now+.115&&count<3;count++){const t=nextNote,i=beat%32,barStep=i%8,bar=Math.floor(i/8),chord=tune.chords[bar%tune.chords.length];
      if(barStep===0)for(const interval of chord)note(tune.root+12+interval,t,step*7.8,{wave:tune.pad,level:.008,attack:.22,release:.48,duration:step*7.8,cutoff:Math.min(tune.cutoff,2200),bus:explorationBus});
      const degree=tune.melody[i];if(degree!==null&&degree!==undefined)note(scalePitch(tune,degree,1),t,step*1.62,{wave:tune.lead,level:tune.lead==='square'?.019:.016,release:.13,duration:step*1.62,cutoff:tune.cutoff,bus:explorationBus});
      const bass=tune.bass[i%8];if(bass!==null&&bass!==undefined)note(tune.root+bass-12,t,step*1.7,{wave:tune.bassWave,level:.024,release:.16,duration:step*1.7,cutoff:Math.min(tune.cutoff,850),bus:explorationBus});
      if(tune.arp&&i%2===0){const arp=tune.arp[(i/2+bar)%tune.arp.length];note(scalePitch(tune,arp,2),t,step*.72,{wave:'triangle',level:.006,attack:.012,release:.1,duration:step*.72,cutoff:Math.min(4200,tune.cutoff*1.4),bus:explorationBus});}
      for(const kind of ['kick','snare','hat','metal'])if(tune.drums[kind]?.includes(barStep))drum(kind,t,kind==='hat'?.004:kind==='kick'?.014:kind==='metal'?.009:.008,explorationBus);
      if(combatActive&&!repairActive&&!inBoss){const combatDrums=tune.combat||{};for(const kind of ['kick','snare','hat','metal'])if(combatDrums[kind]?.includes(barStep))drum(kind,t,kind==='hat'?.006:kind==='kick'?.019:kind==='metal'?.012:.012,combatLayer);
        if(barStep===0||barStep===4)note(tune.root-12+(barStep===4?7:0),t,step*.8,{wave:tune.bassWave,level:.013,release:.1,duration:step*.8,cutoff:900,bus:combatLayer});
        if(degree!==null&&degree!==undefined&&barStep%2===0)note(scalePitch(tune,degree,2),t,step*.72,{wave:tune.lead,level:.006,release:.1,duration:step*.72,cutoff:tune.cutoff,bus:combatLayer});
      }
      beat++;nextNote+=step;
    }
  }
  function startTrack(track){activeTrack=track;musicStarts++;musicPaused=false;beat=0;nextNote=context?.currentTime+.04||0;if(stopMusicTimer){clearTimeout(stopMusicTimer);stopMusicTimer=null;}stopVoices();if(musicTimer){clearInterval(musicTimer);musicTimer=null;}refresh();}
  function playMusic(track=0){if(!Number.isFinite(track))track=0;if(!ensure())return;unlock();const next=Math.max(0,Math.min(stageMusic.length-1,Math.floor(track)));if(!musicPaused&&activeTrack===next)return;if(crossfadeTimer){clearTimeout(crossfadeTimer);crossfadeTimer=null;}startTrack(next);}
  function stopMusic(){musicPaused=true;if(crossfadeTimer){clearTimeout(crossfadeTimer);crossfadeTimer=null;}if(bossOutroTimer){clearTimeout(bossOutroTimer);bossOutroTimer=null;}if(musicTimer){clearInterval(musicTimer);musicTimer=null;}if(stopMusicTimer)clearTimeout(stopMusicTimer);const stoppedContext=context;if(stoppedContext){ramp(music.gain,0,.04);stopMusicTimer=setTimeout(()=>{stopMusicTimer=null;if(context!==stoppedContext)return;if(musicPaused)stopVoices();refresh();},180);}else stopVoices();}
  function fadeMusicOut(seconds=1){if(context&&!musicPaused)fadeTo(music.gain,0,Math.max(.1,seconds));}
  function playGameOver(options={}){fadeMusicOut(1.05);playSFX('robotShutdown',{...options,sourceId:'r07-shutdown'});playSFX('failureGlitch',{...options,sourceId:'r07-failure',delay:.22});setTimeout(()=>{if(!musicPaused)playSFX('defeatCue',{...options,sourceId:'r07-defeat-cue'});},520);}
  function enterBossEncounter(){if(bossMode!=='idle')return false;bossMode='intro';bossPhase=0;if(context&&!musicPaused)fadeTo(music.gain,0,.72);syncMusicTimer();playSFX('bossAppear',{sourceId:'virus-zero'});playSFX('bossAlert',{sourceId:'virus-zero-alert',delay:.42});playSFX('bossIntroMotif',{sourceId:'virus-zero-motif',delay:.92});return true;}
  function startBossMusic(phase=1){if(bossMode==='defeated')return false;const next=clamp(Math.floor(Number(phase)||1),1,3);if(bossMode==='battle'){setBossStage(next);return false;}bossMode='battle';bossPhase=next;beat=0;if(context&&!musicPaused){nextNote=context.currentTime+.04;fadeTo(music.gain,musicLevel(),.9);syncMusicTimer();}else refresh();return true;}
  function setBossStage(phase){const next=clamp(Math.floor(Number(phase)||1),1,3);if(bossMode!=='battle'||next===bossPhase)return;bossPhase=next;}
  function defeatBoss(){if(bossMode==='defeated')return false;bossMode='defeated';bossPhase=0;if(bossOutroTimer)clearTimeout(bossOutroTimer);if(context&&!musicPaused)fadeTo(music.gain,0,.9);syncMusicTimer();playSFX('bossDestroy',{sourceId:'virus-zero-destroy'});bossOutroTimer=setTimeout(()=>{bossOutroTimer=null;if(bossMode!=='defeated')return;stopVoices();playSFX('bossVictoryCue',{sourceId:'virus-zero-victory'});},980);return true;}
  function resetBossEncounter(){if(bossOutroTimer){clearTimeout(bossOutroTimer);bossOutroTimer=null;}bossMode='idle';bossPhase=0;refresh();}
  function silenceSFX(){for(const voice of sfxVoices){voice.source.onended=null;try{voice.source.stop();}catch{}for(const node of [voice.source,voice.filter,voice.gain,voice.panner])try{node?.disconnect();}catch{}}sfxVoices=[];sfxVoiceCount=0;activeSfx=0;sfxCounts.clear();}
  function suspendForHiddenTab(){if(!context)return;stopMusic();silenceSFX();if(context.state==='running')context.suspend().catch(()=>{});}
  function pauseMusic(){stopMusic();}
  function resumeMusic(){if(activeTrack<0||!musicPaused)return;musicPaused=false;nextNote=context?.currentTime+.04||0;if(musicTimer){clearInterval(musicTimer);musicTimer=null;}refresh();}
  function crossfadeMusic(track){const next=Math.max(0,Math.min(stageMusic.length-1,Math.floor(Number(track)||0)));if(activeTrack===next&&!musicPaused)return;if(!context||musicPaused){playMusic(next);return;}if(crossfadeTimer)clearTimeout(crossfadeTimer);fadeTo(music.gain,0,.24);crossfadeTimer=setTimeout(()=>{crossfadeTimer=null;if(musicPaused)return;stopVoices();activeTrack=next;musicStarts++;beat=0;nextNote=context.currentTime+.04;if(musicTimer){clearInterval(musicTimer);musicTimer=null;}fadeTo(music.gain,musicLevel(),.32);syncMusicTimer();},250);}
  function playSFX(kind,options={}){
    if(!unlocked||!context||context.state!=='running'||prefs.muted||prefs.master<=0||prefs.sfx<=0||activeSfx>=12)return false;
    const profile=sounds[kind];if(!profile)return false;
    const sourceKey=options.sourceId!=null?kind+':'+options.sourceId:kind,now=context.currentTime,last=sfxCooldowns.get(sourceKey)||-Infinity;
    if(now-last<(profile.cooldown||0))return false;
    const limit=profile.max||3;if((sfxCounts.get(sourceKey)||0)>=limit||sfxVoiceCount+profile.voices.length>36)return false;
    const channel=options.channel||profile.channel||'combat',bus=channel==='interface'?ui:channel==='ambient'?ambient:combat,volume=Math.max(0,Math.min(1,Number(options.volume??1))),pan=Math.max(-1,Math.min(1,Number(options.pan)||0));
    const typeFactor=({fast:1.28,armored:.72,flyer:1.18,shooter:.92,parasite:.82,boss:.63})[options.enemyType]||1;
    const waveOverride=({fast:'sawtooth',armored:'square',flyer:'sine',shooter:'triangle',parasite:'sine',boss:'sawtooth'})[options.enemyType];
    const made=[];let remaining=profile.voices.length;
    const finish=()=>{activeSfx=Math.max(0,activeSfx-1);const count=(sfxCounts.get(sourceKey)||1)-1;if(count<=0)sfxCounts.delete(sourceKey);else sfxCounts.set(sourceKey,count);};
    function connectVoice(source,voice,at){
      const filter=context.createBiquadFilter(),gain=context.createGain(),panner=typeof options.pan==='number'&&context.createStereoPanner?context.createStereoPanner():null;
      filter.type=voice.filter||'lowpass';filter.frequency.setValueAtTime(voice.cutoff||2200,at);filter.Q.setValueAtTime(voice.q||.7,at);
      source.connect(filter);filter.connect(gain);if(panner){panner.pan.setTargetAtTime(pan,at,.015);gain.connect(panner);panner.connect(bus);}else gain.connect(bus);
      const duration=voice.duration,attack=voice.attack??.008,level=Math.max(.0001,voice.level*volume*(options.enemyType ? .78 : 1));
      gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(level,at+attack);if(duration>attack*.8)gain.gain.setValueAtTime(level,at+Math.max(attack,duration*.45));gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
      sfxVoiceCount++;const entry={source,filter,gain,panner};sfxVoices.push(entry);
      source.onended=()=>{for(const node of [source,filter,gain,panner])try{node?.disconnect();}catch{}sfxVoices=sfxVoices.filter(v=>v!==entry);sfxVoiceCount=Math.max(0,sfxVoiceCount-1);if(--remaining===0)finish();};
      source.start(at);source.stop(at+duration+.015);made.push(entry);
    }
    try{
      for(const voice of profile.voices){const at=now+(Number(options.delay)||0)+(voice.delay||0);if(voice.noise){const source=context.createBufferSource();source.buffer=noiseBuffer;connectVoice(source,voice,at);}else{const source=context.createOscillator(),factor=kind==='enemyWarning'||kind==='dashWarning'||kind==='infectWarning'||kind==='enemyStrike'||kind==='enemyDash'||kind==='enemyShot'||kind==='enemyDive'||kind==='enemySummon'||kind==='dnsEcho'||kind==='enemyDeath'||kind==='flyerHum'||kind==='bossTransition'||kind==='bossWarning'||kind==='bossImpact'?typeFactor:1;source.type=waveOverride&&(kind.startsWith('enemy')||kind==='bossImpact')?waveOverride:voice.wave;source.frequency.setValueAtTime(Math.max(1,voice.frequency*factor),at);if(voice.end>0)source.frequency.exponentialRampToValueAtTime(Math.max(1,voice.end*factor),at+voice.duration);connectVoice(source,voice,at);}}
      sfxCooldowns.set(sourceKey,now);sfxCounts.set(sourceKey,(sfxCounts.get(sourceKey)||0)+1);activeSfx++;if(sfxCooldowns.size>128){for(const [key,time] of sfxCooldowns)if(now-time>8)sfxCooldowns.delete(key);}
      return true;
    }catch{for(const entry of made){try{entry.source.stop();}catch{}for(const node of [entry.source,entry.filter,entry.gain,entry.panner])try{node?.disconnect();}catch{}sfxVoices=sfxVoices.filter(v=>v!==entry);sfxVoiceCount=Math.max(0,sfxVoiceCount-1);}return false;}
  }
  function set(name,value){if(!['master','music','sfx'].includes(name))return;prefs[name]=clamp(Number(value)||0,0,1);refresh();store();}
  function muteAll(value=!prefs.muted){prefs.muted=Boolean(value);refresh();store();updateMuteButton();return prefs.muted;}
  function updateMuteButton(){const b=document.getElementById('soundToggle');if(b){b.textContent=prefs.muted?'SOM: DESLIGADO':'SOM: LIGADO';b.setAttribute('aria-pressed',String(!prefs.muted));}}
  function mountSettings(onOpen,onChange){settingsCallback=onChange;const button=document.getElementById('settingsButton'),dialog=document.getElementById('settingsDialog');for(const input of dialog?.querySelectorAll('[data-audio-setting]')||[]){const name=input.dataset.audioSetting;input.value=Math.round(prefs[name]*100);const output=input.parentElement.querySelector('output');if(output)output.textContent=input.value+'%';onChange?.(name,prefs[name]);input.addEventListener('input',()=>{set(name,Number(input.value)/100);if(output)output.textContent=input.value+'%';onChange?.(name,Number(input.value)/100);playSFX('settingChange',{channel:'interface'});});}button?.addEventListener('click',()=>{const audioReady=unlock();onOpen?.();dialog.showModal();audioReady.then(()=>playSFX('menuOpen',{channel:'interface'}));});document.getElementById('closeSettings')?.addEventListener('click',()=>dialog.close());document.getElementById('soundToggle')?.addEventListener('click',()=>muteAll());updateMuteButton();}
  api.audio=new (class AudioManager{
    get preferences(){return {...prefs};}get stageCount(){return stageMusic.length;}getStageTheme(index){return stageMusic[index]?.title||null;}
    get diagnostics(){return {contextState:context?.state||'uninitialized',currentMusic:activeTrack,musicPaused,bossMode,bossPhase,musicStarts,activeSFX:activeSfx,activeSFXVoices:sfxVoiceCount,activeMusicVoices:voices.length};}
    unlock(){return unlock();}playMusic(stage){return playMusic(stage);}stopMusic(){stopMusic();}pauseMusic(){pauseMusic();}resumeMusic(){resumeMusic();}crossfadeMusic(stage){crossfadeMusic(stage);}
    setCombat(active){const next=Boolean(active);if(next===combatActive)return;combatActive=next;refresh();}
    setRepair(active){const next=Boolean(active);if(next===repairActive)return;repairActive=next;refresh();}
    playSFX(kind,options){return playSFX(kind,options);}playAmbient(kind){return playSFX(kind,{channel:'ambient'});}playGameOver(options){playGameOver(options);}fadeMusicOut(seconds){fadeMusicOut(seconds);}
    setMasterVolume(v){set('master',v);}setMusicVolume(v){set('music',v);}setSFXVolume(v){set('sfx',v);}enterBossEncounter(){return enterBossEncounter();}startBossMusic(phase){return startBossMusic(phase);}setBossStage(phase){setBossStage(phase);}defeatBoss(){return defeatBoss();}resetBossEncounter(){resetBossEncounter();}
    muteAll(value){return muteAll(value);}pauseAll(){suspendForHiddenTab();}mountSettings(onOpen,onChange){mountSettings(onOpen,onChange);}
    close(){pauseMusic();if(musicTimer)clearInterval(musicTimer);if(stopMusicTimer){clearTimeout(stopMusicTimer);stopMusicTimer=null;}silenceSFX();if(context){stopVoices();const closing=context;context=null;closing.onstatechange=null;closing.close().catch(()=>{});unlocked=false;}}
  })();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendForHiddenTab();});
})();
