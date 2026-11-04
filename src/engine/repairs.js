(() => {
  'use strict';
  const games = new Map();
  const api = window.ByteRunner;
  api.repairs = Object.freeze({
    register(type, factory) {
      if (games.has(type) || typeof factory !== 'function') throw new Error('Invalid repair game: '+type);
      games.set(type,factory);
    },
    create(spec = {type:'hold'}, context) {
      const factory = games.get(spec.type);
      if (!factory) throw new Error('Unknown repair game: '+spec.type);
      const game = factory(spec,context);
      return Object.assign({progress:0, status:'running', blocksWorld:false, update(){}, cancel(){this.status='cancelled';}},game);
    }
  });
  api.repairs.register('hold', (spec, context) => ({
    elapsed:0,
    update(dt,input) {
      if (!input.keys.has('e')) { this.cancel(); return; }
      this.elapsed += dt;
      this.progress = Math.min(1,this.elapsed/(spec.duration || context.duration));
      if (this.progress >= 1) this.status = 'success';
    }
  }));
  // Opt-in example: future maps can replace it with wiring, routing or packet games.
  api.repairs.register('sequence', spec => ({
    blocksWorld:true, index:0, previous:new Set(['e']),
    update(dt,input) {
      const sequence = spec.keys || ['1','2','3'];
      for (const key of input.keys) {
        if (this.previous.has(key) || key === 'e') continue;
        if (key !== sequence[this.index]) { this.status='failed'; break; }
        this.index++;
        this.progress = this.index/sequence.length;
        if (this.index === sequence.length) { this.status='success'; break; }
      }
      this.previous = new Set(input.keys);
    },
    label() { return (spec.keys || ['1','2','3']).map((key,i) => (i<this.index?'✓ ':i===this.index?'▶ ':'')+key.toUpperCase()).join('   '); }
  }));
})();
