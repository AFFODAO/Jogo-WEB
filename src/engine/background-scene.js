/* Scenery pass: screen background, authored background and world decorations. */
(() => {
  function base(ctx,view,time,index,phase,visuals) {
    const {x:cameraX,y:cameraY,width,height}=view;
    // The native parallax covers the complete viewport with an opaque base.
    // Keep the gradient only for the legacy/missing-image fallback.
    if(!visuals?.parallax?.config||!visuals.source(visuals.parallax.config.asset)){
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, phase.palette[1]);gradient.addColorStop(1, phase.palette[0]);
      ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
    }
    ByteRunner.art.background(ctx,view,time,index,phase.palette,visuals);
    if (phase.presentation?.procedural === false) return;

    // Distant circuit paths move slower than the level for a subtle parallax effect.
    ctx.save();
    ctx.translate(-(cameraX * .22) % 180, 0);
    ctx.strokeStyle = phase.palette[3];
    ctx.globalAlpha = .3;
    ctx.lineWidth = 1;
    for (let x = -180; x < width + 200; x += 180) {
      const top = 55 + ((x * 7) % 105 + 105) % 105;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + 48, top);
      ctx.lineTo(x + 48, top + 42);
      ctx.lineTo(x + 124, top + 42);
      ctx.stroke();
      ctx.fillStyle = phase.palette[2];
      ctx.fillRect(x + 44, top - 2, 5, 5);
      ctx.fillRect(x + 120, top + 39, 5, 5);
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-cameraX * .42, 0);
    for (let i = 0; i < 13; i++) {
      const x = 130 + i * 330;
      ctx.fillStyle = phase.palette[3];
      ctx.globalAlpha = .22;
      ctx.fillRect(x, height - 190 - (i % 3) * 24, 74, 46);
      ctx.strokeStyle = phase.palette[2];
      ctx.globalAlpha = .3;
      ctx.strokeRect(x + .5, height - 189.5 - (i % 3) * 24, 73, 45);
      ctx.fillStyle = phase.palette[2];
      ctx.globalAlpha = .42;
      ctx.fillRect(x + 9, height - 179 - (i % 3) * 24, 22, 2);
      ctx.fillStyle = phase.palette[4];
      ctx.fillRect(x + 9, height - 170 - (i % 3) * 24, 43, 2);
    }
    ctx.restore();
  }

  ByteRunner.backgroundScene=Object.freeze({
    base,
    draw(ctx,view,time,index,phase,visuals,drawStructures){
      ctx.save();
      try{
        base(ctx,view,time,index,phase,visuals);
        visuals.layers(ctx,'background',view,time);
        if(phase.presentation?.procedural!==false&&drawStructures){ctx.save();try{ctx.translate(-view.x,-view.y);drawStructures();}finally{ctx.restore();}}
        visuals.layers(ctx,'midground',view,time);
      }finally{ctx.restore();}
    }
  });
})();
