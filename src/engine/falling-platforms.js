// Opt-in falling surfaces. State belongs to the existing per-level platformRuntime.
(() => {
  ByteRunner.fallingPlatforms=Object.freeze({
    update(spec,state,dt,occupied){
      if(!state.triggered)return;
      state.fallTime=(state.fallTime||0)+dt;
      if(state.active){
        const elapsed=Math.max(0,state.fallTime-(spec.duration??.65));
        state.drop=Math.min(spec.dropDistance??224,500*elapsed*elapsed);
        if(state.drop>=(spec.dropDistance??224)){state.active=false;state.fallTime=0;}
      }else if(state.fallTime>=(spec.respawnDelay??2.5)&&!occupied(spec)){
        state.active=true;state.triggered=false;state.drop=0;state.fallTime=0;
      }
    }
  });
})();
