/* Bounded presentation effects and original procedural ambience. No physics here. */
(() => {
  'use strict';
  const api=window.ByteRunner,key='byteRunner.experience.v1';
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  const defaults={volume:.65,sfx:.85,music:.35,reducedEffects:reduced,shake:!reduced};
  const normalize=value=>{
    const result={...defaults};
    for(const name of ['volume','sfx','music'])if(Number.isFinite(value?.[name]))result[name]=Math.max(0,Math.min(1,value[name]));
    for(const name of ['reducedEffects','shake'])if(typeof value?.[name]==='boolean')result[name]=value[name];
    return result;
  };
  let stored;try{stored=JSON.parse(localStorage.getItem(key));}catch{}
  const settings=normalize(stored),floats=[],rings=[];
  let shakePower=0,shakeLife=0,clock=0,mixer=null,nextNote=0,beat=0,track=-1,lastActive=false,voices=[];
  const tracks=[
    {root:48,bpm:72,notes:[0,7,12,7,3,10,7,3]},{root:50,bpm:78,notes:[0,3,7,10,12,10,7,3]},
    {root:55,bpm:84,notes:[0,7,3,10,0,12,7,3]},{root:46,bpm:80,notes:[0,5,7,12,10,7,5,3]},
    {root:57,bpm:68,notes:[0,12,7,3,10,7,12,3]},{root:43,bpm:86,notes:[0,7,0,3,10,7,12,7]},
    {root:53,bpm:82,notes:[0,3,10,7,12,7,3,10]},{root:51,bpm:74,notes:[0,7,14,10,3,12,7,10]},
    {root:45,bpm:90,notes:[0,0,7,3,10,7,0,12]},{root:41,bpm:94,notes:[0,7,3,10,0,12,10,7]}
  ];
  const frequency=note=>440*Math.pow(2,(note-69)/12);
  function silence(context){if(mixer&&context?.state==='running'){mixer.gain.cancelScheduledValues(context.currentTime);mixer.gain.setTargetAtTime(0,context.currentTime,.035);}}
  const experience={settings,tracks,floats,rings,
    configure(value){Object.assign(settings,normalize({...settings,...value}));document.body.classList.toggle('reduced-effects',settings.reducedEffects);if(settings.reducedEffects||!settings.shake){shakePower=0;shakeLife=0;}try{localStorage.setItem(key,JSON.stringify(settings));}catch{}},
    reset(){floats.length=0;rings.length=0;shakePower=0;shakeLife=0;clock=0;},
    pop(text,x,y,color='#a2ffe1'){if(floats.length>=16)floats.shift();floats.push({text,x,y,color,life:1.3});},
    impact(x,y,strong=false,color='#a1ffe9') {
      if(rings.length>=12)rings.shift();rings.push({x,y,color,life:.3,max:.3,strong});
      if(strong)this.shake(2.5,.16);
    },
    shake(power=2.5,duration=.16){if(settings.reducedEffects||!settings.shake)return;shakePower=Math.min(3,Math.max(shakePower,power));shakeLife=Math.min(.23,Math.max(shakeLife,duration));},
    offset(){if(!shakeLife||settings.reducedEffects||!settings.shake)return {x:0,y:0};const amount=shakePower*Math.min(1,shakeLife/.12);return {x:Math.sin(clock*109)*amount,y:Math.sin(clock*83)*amount*.65};},
    update(dt){clock+=dt;shakeLife=Math.max(0,shakeLife-dt);for(const items of [floats,rings])for(let i=items.length-1;i>=0;i--){items[i].life-=dt;if(items[i].life<=0)items.splice(i,1);}},
    draw(ctx){ctx.save();ctx.textAlign='center';ctx.font='bold 12px monospace';
      for(const item of floats){ctx.globalAlpha=Math.min(1,item.life*3);ctx.fillStyle='#08121fec';ctx.fillRect(item.x-ctx.measureText(item.text).width/2-5,item.y-14-(1.3-item.life)*18,ctx.measureText(item.text).width+10,20);ctx.fillStyle=item.color;ctx.fillText(item.text,item.x,item.y-(1.3-item.life)*18);}
      for(const ring of rings){ctx.globalAlpha=ring.life/ring.max;const size=4+(1-ring.life/ring.max)*(settings.reducedEffects?7:ring.strong?30:17);if(api.pixelArt)api.pixelArt.ring(ctx,ring.x,ring.y,size,ring.color);else{ctx.strokeStyle=ring.color;ctx.beginPath();ctx.arc(ring.x,ring.y,size,0,Math.PI*2);ctx.stroke();}}
      ctx.restore();
    },
    follow(current,target,dt,speed=7){return current+(target-current)*(1-Math.exp(-speed*dt));},
    camera(player,view,map,dt){
      const maxX=Math.max(0,map.width-view.width),maxY=Math.max(0,map.height-view.height);
      const clamp=(v,max)=>Math.max(0,Math.min(max,v));
      const lead=Math.max(-65,Math.min(65,player.vx*.16));
      const verticalLead=player.grounded?0:Math.max(-48,Math.min(75,player.vy*.11));
      const tx=map.axes.includes('x')?clamp(player.x-view.width*map.offsetX+lead,maxX):0;
      const desired=player.y-view.height*map.offsetY+verticalLead;
      // Small vertical dead zone avoids following every step and landing bob.
      const ty=map.axes.includes('y')?clamp(Math.abs(desired-view.y)<22?view.y:desired,maxY):0;
      let x=this.follow(view.x,tx,dt),y=this.follow(view.y,ty,dt,player.vy>350?10:6);
      // Safety envelope: keep feet and head visible when falling quickly.
      if(map.axes.includes('y'))y=clamp(Math.max(player.y+player.height-view.height+60,Math.min(y,player.y-45)),maxY);
      return {x:clamp(x,maxX),y:clamp(y,maxY)};
    },
    // Legacy direct-context adapter remains available to older integrations; gameplay uses ByteRunner.audio.
    audio(context,index,active,bossStage=0){
      if(!context?.createOscillator||!context.createGain)return;
      try{if(!mixer||mixer.context!==context){mixer=context.createGain();mixer.connect(context.destination);nextNote=0;track=-1;voices=[];}
        const audible=active&&!document.hidden&&context.state==='running'&&settings.music>0&&settings.volume>0;mixer.gain.cancelScheduledValues(context.currentTime);mixer.gain.setTargetAtTime(audible?settings.volume*settings.music:0,context.currentTime,.08);if(!audible){lastActive=false;return;}
        if(index!==track||!lastActive){track=index;beat=0;nextNote=context.currentTime+.04;for(const voice of voices){try{voice.stop();}catch{}}voices=[];}lastActive=true;
        const tune=tracks[index]||tracks[0],step=60/(tune.bpm+(bossStage?bossStage*7:0))/2;if(nextNote<context.currentTime)nextNote=context.currentTime+.02;
        for(let count=0;nextNote<context.currentTime+.12&&count<3;count++){const now=nextNote,note=tune.root+tune.notes[beat%8];for(const [pitch,gainValue,type,duration] of [[note,.026,'triangle',step*.8],...(beat%4===0?[[tune.root-12,.035,'sine',step*2.5]]:[])]){if(voices.length>=12)break;const oscillator=context.createOscillator(),gain=context.createGain();oscillator.type=type;oscillator.frequency.setValueAtTime(frequency(pitch),now);gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(gainValue,now+.035);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);oscillator.connect(gain);gain.connect(mixer);oscillator.start(now);oscillator.stop(now+duration+.03);voices.push(oscillator);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();voices=voices.filter(v=>v!==oscillator);};}beat++;nextNote+=step;}
      }catch{/* Optional legacy audio remains best-effort. */}
    },
    silence,
    mountSettings(onOpen,onChange){
      const dialog=document.getElementById('settingsDialog');
      if(!dialog)return;
      for(const input of dialog.querySelectorAll('[data-setting]')) {
        const name=input.dataset.setting;
        if(input.type==='checkbox')input.checked=settings[name];else input.value=Math.round(settings[name]*100);
        const output=input.parentElement.querySelector('output');if(output)output.textContent=input.value+'%';
        input.addEventListener('input',()=>{this.configure({[name]:input.type==='checkbox'?input.checked:Number(input.value)/100});if(output)output.textContent=input.value+'%';onChange?.();});
      }
    }
  };
  experience.configure(settings);api.experience=experience;
})();
