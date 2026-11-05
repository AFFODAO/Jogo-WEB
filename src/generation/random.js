// Deterministic streams. No shared Math.random state or dependency on room order.
(() => {
  const ns=window.ByteRunner.mapGeneration=window.ByteRunner.mapGeneration || {};
  ns.random=seed=>{
    if(!(typeof seed==='string'||Number.isSafeInteger(seed)))throw new Error('Generation seed must be a string or safe integer');
    const identity=typeof seed+':'+seed;
    let state=2166136261;
    for(let i=0;i<identity.length;i++)state=Math.imul(state^identity.charCodeAt(i),16777619)>>>0;
    const next=()=>{
      state=(state+0x6D2B79F5)>>>0;
      let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);
      return ((t^(t>>>14))>>>0)/4294967296;
    };
    const int=(min,max)=>{
      if(!Number.isSafeInteger(min)||!Number.isSafeInteger(max)||max<min||max-min>=4294967296)throw new Error('Invalid random integer range');
      return min+Math.floor(next()*(max-min+1));
    };
    return Object.freeze({seed,next,int,pick(items){if(!Array.isArray(items)||!items.length)throw new Error('Cannot choose from an empty pool');return items[int(0,items.length-1)];},fork(label){return ns.random(identity+'|'+String(label).length+':'+label);}});
  };
})();
