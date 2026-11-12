/* Opt-in physical scene primitives. Puzzle rules and art belong to each repair. */
(() => {
  'use strict';
  const reducedMotion=()=>document.body.classList.contains('reduced-effects')||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  const snap=(value,step=1)=>Math.round(value/step)*step;
  const angle=(point,center)=>Math.atan2(point.y-center.y,point.x-center.x)*180/Math.PI;
  const angleDelta=(from,to)=>((to-from+540)%360)-180;
  const cablePath=(a,b,bend=48)=>`M ${a.x} ${a.y} C ${a.x+bend} ${a.y}, ${b.x-bend} ${b.y}, ${b.x} ${b.y}`;

  function create(host,{width=640,height=360,label='Bancada de reparo',isActive=()=>true}={}) {
    if(!(width>0&&height>0))throw new RangeError('Invalid repair scene size');
    const abort=new AbortController(),animations=new Set(),ticks=new Set();
    const viewport=document.createElement('div'),stage=document.createElement('div');
    viewport.className='repair-scene-viewport';stage.className='repair-scene-stage';
    stage.setAttribute('role','group');stage.setAttribute('aria-label',label);
    stage.style.width=width+'px';stage.style.height=height+'px';
    viewport.append(stage);host.append(viewport);
    let disposed=false,paused=false,gesture=null,elapsed=0;
    const active=()=>!disposed&&!paused&&isActive()&&!document.hidden;
    const listen=(element,type,handler,options={})=>element.addEventListener(type,handler,{...options,signal:abort.signal});
    function fit(){
      if(disposed)return;
      const scale=Math.min(1,viewport.clientWidth/width);
      stage.style.transform=`scale(${scale})`;
      viewport.style.height=height*scale+'px';
      viewport.style.setProperty('--repair-scene-scale',scale);
    }
    const observer=new ResizeObserver(fit);observer.observe(viewport);fit();
    function point(clientX,clientY){
      const rect=stage.getBoundingClientRect();
      return {x:(clientX-rect.left)*width/(rect.width||width),y:(clientY-rect.top)*height/(rect.height||height)};
    }
    function cancelGesture(){
      if(!gesture)return;
      const current=gesture;gesture=null;
      try {current.element.releasePointerCapture(current.id);}catch{/* Capture may already be released. */}
      current.handlers.cancel?.(current.last);
    }
    function syncMotion(){
      const playing=active()&&!reducedMotion();
      for(const animation of animations){
        if(reducedMotion()){animation.cancel();animations.delete(animation);}
        else if(playing)animation.play();else animation.pause();
      }
      viewport.dataset.paused=String(!active());
      if(!active())cancelGesture();
    }
    // The caller owns commit/rollback; movement never rebuilds the equipment DOM.
    function bindPointer(element,handlers){
      element.classList.add('repair-scene-handle');
      listen(element,'pointerdown',event=>{
        if(!active()||gesture||!event.isPrimary||event.button!==0)return;
        const start=point(event.clientX,event.clientY);
        if(handlers.start?.(start,event)===false)return;
        gesture={element,handlers,id:event.pointerId,start,last:start};
        try {element.setPointerCapture(event.pointerId);}catch{cancelGesture();return;}
        event.preventDefault();
      });
      listen(element,'pointermove',event=>{
        if(gesture?.element!==element||gesture.id!==event.pointerId)return;
        if(!active()){cancelGesture();return;}
        gesture.last=point(event.clientX,event.clientY);
        handlers.move?.(gesture.last,gesture.start,event);
      });
      listen(element,'pointerup',event=>{
        if(gesture?.element!==element||gesture.id!==event.pointerId)return;
        if(!active()){cancelGesture();return;}
        const current=gesture;gesture=null;
        try {element.releasePointerCapture(event.pointerId);}catch{/* Browser may release first. */}
        handlers.end?.(point(event.clientX,event.clientY),current.start,event);
      });
      for(const type of ['pointercancel','lostpointercapture'])listen(element,type,event=>{
        if(gesture?.element===element&&gesture.id===event.pointerId)cancelGesture();
      });
    }
    listen(window,'blur',cancelGesture);
    listen(document,'visibilitychange',syncMotion);
    function animate(element,frames,options={}){
      if(!active()||reducedMotion())return null;
      const animation=element.animate(frames,{duration:240,easing:'steps(6,end)',...options});
      animations.add(animation);
      animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));
      return animation;
    }
    const scene={
      viewport,stage,point,fit,bindPointer,animate,
      hitTest(clientX,clientY,selector){
        const target=document.elementFromPoint(clientX,clientY)?.closest(selector);
        return target&&stage.contains(target)?target:null;
      },
      onTick(callback){ticks.add(callback);return ()=>ticks.delete(callback);},
      update(dt){
        syncMotion();
        if(!active())return;
        const delta=clamp(Number.isFinite(dt)?dt:0,0,.05);elapsed+=delta;
        for(const tick of ticks)tick(delta,elapsed,reducedMotion());
      },
      setPaused(value){paused=Boolean(value);syncMotion();},
      // A valid physical change can request the existing session's verification.
      // Invalid intermediate arrangements never consume a mistake or hint.
      completion(check,commit){
        let completed=false;
        return ()=>{
          if(completed||!active()||!check())return false;
          completed=true;commit();return true;
        };
      },
      dispose(){
        if(disposed)return;
        disposed=true;cancelGesture();abort.abort();observer.disconnect();
        for(const animation of animations)animation.cancel();
        animations.clear();ticks.clear();viewport.remove();
      }
    };
    return Object.freeze(scene);
  }
  window.ByteRunner.repairScene=Object.freeze({create,reducedMotion,clamp,snap,angle,angleDelta,cablePath});
})();
