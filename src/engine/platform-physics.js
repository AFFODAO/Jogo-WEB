// Shared base physics: generation and the actual player read the same values.
(() => {
  const base=Object.freeze({width:34,height:48,gravity:1850,speed:255,jump:690});
  const flight=dy=>{const d=base.jump**2+2*base.gravity*dy;return d<0?null:(base.jump+Math.sqrt(d))/base.gravity;};
  ByteRunner.platformPhysics=Object.freeze({base,
    jumpHeight:base.jump**2/(2*base.gravity),
    flightTime:flight(0),maxHorizontal:base.speed*flight(0),
    horizontalAt(dy){const t=flight(dy);return t===null?0:t*base.speed;},
    // Player left-edge intervals, not center-to-center distances. Keep landing room.
    canReach(from,to){
      const dy=to.y-from.y,time=flight(dy);if(time===null||to.width<base.width+12)return false;
      const left=from.x+6,right=from.x+from.width-base.width-6;
      const targetLeft=to.x+6,targetRight=to.x+to.width-base.width-6;
      return Math.max(targetLeft-right,left-targetRight,0)<=base.speed*time*.82;
    }
  });
})();
