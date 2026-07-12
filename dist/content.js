(() => {
  // node_modules/ba-click-fx/dist/ba-click-fx.js
  function e(e2) {
    return Number.isFinite(e2) ? Math.max(0, Math.min(1, e2)) : 0;
  }
  function t(e2, t2) {
    return e2 + Math.random() * (t2 - e2);
  }
  function n(e2) {
    return 1 - (1 - e2) ** 3;
  }
  function r(t2, n2, r2) {
    if (t2 === n2) return r2 < t2 ? 0 : 1;
    let i2 = e((r2 - t2) / (n2 - t2));
    return i2 * i2 * (3 - 2 * i2);
  }
  function i(e2, t2) {
    return Math.hypot(e2.x - t2.x, e2.y - t2.y);
  }
  function a(e2, t2, n2) {
    return e2 + (t2 - e2) * n2;
  }
  var o = /* @__PURE__ */ new Map();
  var s = 64;
  function c(t2, n2 = 1) {
    let r2 = e(n2), i2 = (t2[0] << 16 | t2[1] << 8 | t2[2]) * 1e3 + Math.round(r2 * 1e3), a2 = o.get(i2);
    if (a2 !== void 0) return a2;
    let c2 = `rgba(${t2[0]}, ${t2[1]}, ${t2[2]}, ${r2})`;
    return o.size >= s && o.delete(o.keys().next().value), o.set(i2, c2), c2;
  }
  function l(e2, t2, n2) {
    return [
      Math.round(e2[0] * (1 - n2) + t2[0] * n2),
      Math.round(e2[1] * (1 - n2) + t2[1] * n2),
      Math.round(e2[2] * (1 - n2) + t2[2] * n2)
    ];
  }
  var u = {
    color: [
      105,
      161,
      255
    ],
    scale: 1.1,
    opacity: 0.5,
    clickEnabled: true,
    clickSpeed: 1,
    trailSpeed: 1.05,
    maxDpr: 1,
    trailRenderScale: 1,
    touchAction: "auto",
    maxDeltaMs: 80,
    baseFrameMs: 1e3 / 60,
    filledCircle: {
      rAddRate: 26,
      maxLife: 12.5,
      expandEnd: 0.84,
      colorEnd: 0.34,
      fadeStart: 0.78,
      glowRadiusMul: 4.2,
      glowAlpha: 0.13
    },
    click: {
      scaleMul: 1.3,
      totalLife: 27,
      haloRadius: 96,
      shardFlickerPeriod: 8,
      shardFlickerMinAlpha: 0.45
    },
    rings: {
      delay: 2,
      maxLife: 27,
      rotationSpeed: 8e-3,
      baseRadiusMul: 0.47,
      radiusGrowEnd: 0.66,
      postDiskGrow: 24,
      emissionAlpha: 0.35,
      glowRadiusAdd: 54,
      glowAlpha: 0.15,
      softGlowRadiusAdd: 96,
      softGlowAlpha: 0.08,
      segmentCountMin: 2,
      segmentCountMax: 2,
      segmentExtraChance: 0,
      segmentClusterChance: 0.38,
      lenFull: 1.5 * Math.PI,
      lenEnd: Math.PI / 3,
      lenMulMin: 0.46,
      lenMulMax: 1.38,
      radiusJitterMin: 0.3,
      radiusJitterMax: 0.8,
      segmentRadiusGrowSmallMin: 0.75,
      segmentRadiusGrowSmallMax: 0.92,
      segmentRadiusGrowMin: 1,
      segmentRadiusGrowMax: 1,
      rotationMulMin: 0.54,
      rotationMulMax: 1.58,
      growEnd: 0.16,
      collapseStart: 0.16,
      fadeStart: 1,
      whiteMix: 0.75,
      colorFadeStart: 0.56,
      colorEndWhiteMix: 0.97,
      minW: 0.9,
      maxW: 4,
      widthEndMul: 0.55,
      alpha: 1
    },
    sparksCount: 4,
    trail: {
      enabled: true,
      always: false,
      minDistance: 0.06,
      sampleStep: 0.85,
      maxInterpolatedPoints: 80,
      maxCoalescedEvents: 24,
      maxJumpDistance: 420,
      smoothFactor: 0.5,
      renderStep: 0.75,
      renderMaxPoints: 2400,
      gradientChunkLength: 1.5,
      lengthSlow: 900,
      lengthFast: 4200,
      maxPoints: 12e3,
      lifeSlow: 22,
      lifeFast: 22,
      tailDecayMul: 1.28,
      headDecayMul: 0.95,
      releaseDecayMul: 1.18,
      speedDecay: 0.988,
      baseWidthSlow: 3,
      baseWidthFast: 3,
      coreWidthSlow: 0.3,
      coreWidthFast: 0.52,
      hotWidthSlow: 0.1,
      hotWidthFast: 0.24,
      ribbonWidthMul: 0,
      glowWidthMul: 1.7,
      softGlowWidthMul: 2.4,
      railWidthSlow: 0.22,
      railWidthFast: 0.36,
      alpha: 0.96,
      whiteMix: 0.45,
      mainAlpha: 1,
      ribbonAlpha: 0,
      coreAlpha: 0.78,
      hotAlpha: 0.34,
      glowAlpha: 0.18,
      softGlowAlpha: 0.045,
      railAlpha: 0.02,
      speedMin: 0.035,
      speedMax: 2.2,
      shardSpacing: 120,
      shardChanceSlow: 0.04,
      shardChanceFast: 0.18,
      shardOffsetMin: 2,
      shardOffsetMax: 36,
      shardLargeChance: 0.62,
      maxSparkParticles: 38,
      shardFlickerPeriod: 8,
      shardFlickerMinAlpha: 0.35,
      shardFlickerSizePulse: 0.16,
      moveSparkChance: 0,
      glowRadiusMul: 25,
      glowIntensity: 0.13
    },
    glow: {
      enabled: true,
      fake: true,
      clickFake: true
    }
  };
  var d = JSON.parse(JSON.stringify(u));
  function f(e2 = u) {
    return JSON.parse(JSON.stringify(e2));
  }
  function p() {
    return f(d);
  }
  function m(e2 = u) {
    return e2.scale * e2.click.scaleMul;
  }
  function h(e2 = u) {
    return l(e2.color, [
      255,
      255,
      255
    ], e2.trail.whiteMix);
  }
  function g(e2 = u) {
    return l(e2.color, [
      255,
      255,
      255
    ], 0.36);
  }
  function _(e2 = u) {
    return l(e2.color, [
      255,
      255,
      255
    ], 0.58);
  }
  function v(e2) {
    "@babel/helpers - typeof";
    return v = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e3) {
      return typeof e3;
    } : function(e3) {
      return e3 && typeof Symbol == "function" && e3.constructor === Symbol && e3 !== Symbol.prototype ? "symbol" : typeof e3;
    }, v(e2);
  }
  function y(e2, t2) {
    if (v(e2) != "object" || !e2) return e2;
    var n2 = e2[Symbol.toPrimitive];
    if (n2 !== void 0) {
      var r2 = n2.call(e2, t2 || "default");
      if (v(r2) != "object") return r2;
      throw TypeError("@@toPrimitive must return a primitive value.");
    }
    return (t2 === "string" ? String : Number)(e2);
  }
  function b(e2) {
    var t2 = y(e2, "string");
    return v(t2) == "symbol" ? t2 : t2 + "";
  }
  function x(e2, t2, n2) {
    return (t2 = b(t2)) in e2 ? Object.defineProperty(e2, t2, {
      value: n2,
      enumerable: true,
      configurable: true,
      writable: true
    }) : e2[t2] = n2, e2;
  }
  function S(e2) {
    let n2 = Math.max(1, Math.floor(e2.segmentCountMin ?? 2)), r2 = Math.max(n2, Math.floor(e2.segmentCountMax ?? n2)), i2 = +(r2 > n2 && Math.random() < (e2.segmentExtraChance ?? 0)), a2 = Math.min(r2, n2 + i2), o2 = [], s2 = Math.floor(Math.random() * a2);
    for (; o2.length < a2; ) {
      let n3 = o2.length, r3 = n3 > 0 && Math.random() < (e2.segmentClusterChance ?? 0), i3 = n3 === s2, a3 = Math.random() * Math.PI * 2;
      if (r3) {
        let e3 = o2[Math.floor(Math.random() * o2.length)], n4 = Math.random() < 0.5 ? -1 : 1;
        a3 = e3.off + n4 * t(0.3 * Math.PI, 0.92 * Math.PI);
      }
      o2.push({
        off: a3,
        lenMul: t(e2.lenMulMin, e2.lenMulMax),
        radiusOffset: i3 ? t(e2.radiusJitterMin, e2.radiusJitterMax) : 0,
        radiusGrowMul: i3 ? t(e2.segmentRadiusGrowSmallMin, e2.segmentRadiusGrowSmallMax) : t(e2.segmentRadiusGrowMin, e2.segmentRadiusGrowMax),
        rotationMul: t(e2.rotationMulMin, e2.rotationMulMax),
        alphaMul: t(0.92, 1.1),
        widthMul: t(0.68, 1.24),
        collapseBias: t(-0.16, 0.2)
      });
    }
    return o2;
  }
  function C(t2, n2, r2 = 0) {
    if (!t2 || t2.length === 0) return r2;
    let i2 = e(n2);
    if (t2.length === 1) return e(t2[0][1]);
    let o2 = t2[0];
    if (i2 <= o2[0]) return e(o2[1]);
    for (let n3 = 1; n3 < t2.length; n3++) {
      let r3 = t2[n3 - 1], o3 = t2[n3];
      if (i2 <= o3[0]) {
        let t3 = o3[0] - r3[0], n4 = t3 === 0 ? 1 : (i2 - r3[0]) / t3;
        return e(a(r3[1], o3[1], n4));
      }
    }
    return e(t2[t2.length - 1][1]);
  }
  var w = class {
    constructor(e2) {
      this._engine = e2, this.dead = true;
    }
    reset(e2, t2) {
      let n2 = this._engine.config.rings;
      this.x = e2, this.y = t2, this.life = 0, this.r = 0, this.dead = false, this.ring = {
        ang: Math.random() * Math.PI * 2,
        rs: n2.rotationSpeed,
        segs: S(n2)
      };
    }
    update(e2, t2) {
      this.life += t2, this.drawHalo(e2), this.drawFilledCircle(e2), this.drawRings(e2, t2), this.drawCenterDot(e2), this.life >= this._engine.config.click.totalLife && (this.dead = true);
    }
    getDiskRadius() {
      return this._engine.config.filledCircle.rAddRate * m(this._engine.config);
    }
    getRingStaticRadius() {
      return this.getDiskRadius() * this._engine.config.rings.baseRadiusMul;
    }
    getRingRadiusGrow(t2 = 0) {
      let r2 = this._engine.config.rings;
      return n(e(t2 / r2.radiusGrowEnd)) * r2.postDiskGrow * this._engine.config.scale;
    }
    getRingRadius(e2 = 0) {
      return this.getRingStaticRadius() + this.getRingRadiusGrow(e2);
    }
    drawHalo(t2) {
      if (!this._engine.config.glow.clickFake && !this._engine.config.glow.enabled) return;
      let n2 = e(this.life / this._engine.config.click.totalLife);
      this.life / this._engine.config.filledCircle.maxLife;
      let i2 = r(0.01, 0.2, n2), o2 = 1 - r(0.84, 1, n2), s2 = this._engine.config.color, c2 = a(this.getDiskRadius() * 2.1, this._engine.config.click.haloRadius * m(this._engine.config), r(0.04, 0.54, n2)), l2 = 0.06 * this._engine.config.opacity * i2 * o2;
      this._engine._drawRadialGlow(t2, this.x, this.y, c2, s2, l2);
    }
    drawFilledCircle(t2) {
      let i2 = this._engine.config.filledCircle, a2 = e(this.life / i2.maxLife);
      if (this.r = this.getDiskRadius(), a2 >= 1) return;
      let o2 = n(e(a2 / i2.expandEnd)), s2 = 1 - r(i2.fadeStart, 1, a2), c2 = this.r * o2, l2 = this._engine.config.color, u2 = this._engine.config.opacity * s2;
      (this._engine.config.glow.clickFake || this._engine.config.glow.enabled) && this._engine._drawDiskEdgeGlow(t2, this.x, this.y, c2, c2 * i2.glowRadiusMul, l2, u2 * i2.glowAlpha), this._engine._drawClickDisk(t2, this.x, this.y, c2, l2, u2);
      let d2 = (1 - r(0, 0.15, a2)) * 0.35 * s2;
      d2 > 0.01 && this._engine._drawClickDisk(t2, this.x, this.y, c2, [
        255,
        255,
        255
      ], d2);
    }
    drawRings(t2, n2) {
      let i2 = this._engine.config.rings, o2 = this.life - i2.delay;
      if (o2 <= 0) return;
      let s2 = e(o2 / (i2.maxLife - i2.delay));
      if (s2 >= 1) return;
      this.ring.ang -= this.ring.rs * n2;
      let c2 = r(0.02, i2.growEnd, s2), u2 = r(i2.collapseStart, 1, s2), d2 = 1 - r(i2.fadeStart, 1, s2), f2 = l([
        255,
        255,
        255
      ], l(this._engine.config.color, [
        255,
        255,
        255
      ], i2.colorEndWhiteMix), r(i2.colorFadeStart, 1, s2)), p2 = i2.alpha * c2 * d2, m2 = Math.max(c2, 0.15), h2 = i2.emissionAlpha * m2 * d2, g2 = this.getRingStaticRadius(), _2 = this.getRingRadiusGrow(s2), v2 = g2 + _2, y2 = a(1, 0.72, u2), b2 = a(1, i2.widthEndMul, s2 * s2);
      this._engine._drawClickRingGlow(t2, this.x, this.y, v2, f2, h2);
      for (let e2 of this.ring.segs) {
        let n3 = r(i2.collapseStart + e2.collapseBias, 1, s2), o3 = this.ring.ang * e2.rotationMul + e2.off, l2 = a(i2.lenFull * e2.lenMul * c2, i2.lenEnd, n3), u3 = o3, d3 = o3 + l2, m3 = g2 + _2 * e2.radiusGrowMul + e2.radiusOffset * this._engine.config.scale, h3 = p2 * e2.alphaMul, v3 = y2 * e2.widthMul * b2, x2 = i2.minW * v3 * this._engine.config.scale, S2 = i2.maxW * v3 * this._engine.config.scale;
        this._engine._drawClickArcRibbon(t2, this.x, this.y, m3, u3, d3, x2, S2, f2, h3);
      }
    }
    drawCenterDot(t2) {
      let n2 = e(this.life / this._engine.config.click.totalLife), i2 = r(0.43, 0.52, n2) * (1 - r(0.82, 1, n2)) * this._engine.config.opacity * 0.72;
      if (i2 <= 0) return;
      let o2 = a(1.5, 0.75, r(0.52, 1, n2)) * this._engine.config.scale;
      this._engine._drawCircle(t2, this.x, this.y, o2, this._engine.config.color, i2, o2 * 1.8, true);
    }
  };
  var T = class {
    constructor(e2) {
      this._engine = e2, this.dead = true;
    }
    reset(e2, n2, r2 = true) {
      let i2 = r2 ? m(this._engine.config) : this._engine.config.scale, a2 = i2 / 1.5, o2 = Math.random() * Math.PI * 2, s2 = r2 ? t(4.8, 6.8) * a2 : t(0.85, 1.8) * a2;
      this.x = e2, this.y = n2, this.vx = Math.cos(o2) * s2, this.vy = Math.sin(o2) * s2, this.rotation = Math.random() * Math.PI * 2, this.rotationSpeed = r2 ? t(-0.14, 0.14) : t(-0.08, 0.18), this.size = r2 ? t(4, 7) * i2 : t(2.4, 8.8) * i2, this.alpha = r2 ? 1 : t(0.28, 0.78), this.maxAlpha = this.alpha, this.alphaMul = 1, this.alphaDecay = 0.032, this.friction = r2 ? 0.9 : 0.95, this.color = r2 ? [
        255,
        255,
        255
      ] : l(this._engine.config.color, [
        255,
        255,
        255
      ], t(0.28, 0.82)), this.blur = r2 ? 2 * i2 : 2.8 * this._engine.config.scale, this.useFakeGlow = r2 ? this._engine.config.glow.clickFake : true, this.delay = 0, this.age = 0, this.flickerPeriod = 0, this.flickerMinAlpha = 1, this.flickerPhase = 0, this.flickerSizePulse = 0, this.sizeGrowEnd = 0, this.sizeShrinkStart = 1, this.spawnSizeMul = 1, this.endSizeMul = 1, this.fromClick = r2, this.dead = false;
    }
    update(t2, n2) {
      if (this.delay > 0) {
        this.delay -= n2;
        return;
      }
      this.x += this.vx * n2, this.y += this.vy * n2, this.vx *= this.friction ** +n2, this.vy *= this.friction ** +n2, this.rotation += this.rotationSpeed * n2, this.alpha -= this.alphaDecay * n2;
      let i2 = this.alpha * this.alphaMul, o2 = 1;
      if (this.flickerPeriod > 0) {
        let e2 = (this.age + this.flickerPhase) % this.flickerPeriod / this.flickerPeriod;
        o2 = (1 - Math.cos(e2 * Math.PI * 2)) / 2, i2 *= a(this.flickerMinAlpha, 1, o2);
      }
      let s2 = this.maxAlpha > 0 ? e(1 - this.alpha / this.maxAlpha) : 1, c2 = a(this.spawnSizeMul, 1, r(0, this.sizeGrowEnd, s2)), l2 = e((s2 - this.sizeShrinkStart) / (1 - this.sizeShrinkStart)), u2 = l2 * l2, d2 = a(1, this.endSizeMul, u2), f2 = this.size * c2 * d2, p2 = this.flickerPeriod > 0 && this.flickerSizePulse > 0 ? f2 * a(1 - this.flickerSizePulse, 1 + this.flickerSizePulse, o2) : f2;
      this._engine._drawTriangle(t2, this.x, this.y, p2, this.rotation, this.color, i2), this.age += n2, this.alpha <= 0 && (this.dead = true);
    }
  };
  var E = class {
    constructor(e2 = {}) {
      if (x(this, "_smoothPosCache", {
        x: 0,
        y: 0
      }), this.config = p(), this._animationLoopBound = this._animationLoop.bind(this), e2.color && (this.config.color = [
        e2.color[0],
        e2.color[1],
        e2.color[2]
      ]), e2.scale !== void 0 && (this.config.scale = Math.max(0.5, Math.min(3, Number(e2.scale) ?? 1.1))), e2.opacity !== void 0 && (this.config.opacity = Math.max(0.1, Math.min(1, Number(e2.opacity) ?? 0.5))), e2.trailAlways !== void 0 && (this.config.trail.always = !!e2.trailAlways), e2.trailEnabled !== void 0 && (this.config.trail.enabled = !!e2.trailEnabled), e2.clickEnabled !== void 0 && (this.config.clickEnabled = !!e2.clickEnabled), e2.touchAction !== void 0 && (this.config.touchAction = e2.touchAction), this._resolveCanvas(e2.target), this.ctx = this.canvas.getContext("2d", {
        alpha: true,
        desynchronized: true
      }), !this.ctx) throw Error("[ba-click-fx] 无法获取 Canvas 2D 上下文");
      this.trailCanvas = document.createElement("canvas"), this.trailCtx = this.trailCanvas.getContext("2d", {
        alpha: true,
        desynchronized: true
      }), this.waveCanvas = document.createElement("canvas"), this.waveCtx = this.waveCanvas.getContext("2d", {
        alpha: true,
        desynchronized: true
      }), this.width = 0, this.height = 0, this.dpr = 1, this.waves = [], this.sparks = [], this.trailStrokes = [], this.currentTrailStroke = null, this.wavePool = [], this.sparkPool = [], this.isDown = false, this.lastTrailPos = null, this.lastTrailEventTime = 0, this.trailSpeedFactor = 0, this.trailShardDistance = 0, this.trailSmoothX = null, this.trailSmoothY = null, this.lastTime = performance.now(), this.running = false, this._resizeTimer = 0, this._renderPointCache = [], this._radialGradCache = /* @__PURE__ */ new Map(), this._onResize = this._debouncedResize.bind(this), window.addEventListener("resize", this._onResize), this._resizeCanvas(), this._setupInput(), this._requestRender();
    }
    _resolveCanvas(e2) {
      if (e2) {
        if (typeof e2 == "string" ? this.canvas = document.querySelector(e2) : e2 instanceof HTMLElement && (this.canvas = e2), !this.canvas) throw Error(`[ba-click-fx] 未找到目标元素: ${e2}`);
        if (this.canvas.tagName !== "CANVAS") throw Error("[ba-click-fx] 目标元素必须是 <canvas>");
        this._ownsCanvas = false, this.canvas.style.touchAction = this.config.touchAction;
        return;
      }
      let t2 = document.getElementById("sparkCanvas");
      if (t2 && t2.tagName === "CANVAS") {
        this.canvas = t2, this._ownsCanvas = false, this.canvas.style.touchAction = this.config.touchAction;
        return;
      }
      this.canvas = document.createElement("canvas"), this.canvas.id = "sparkCanvas", this.canvas.style.cssText = `position:fixed;inset:0;z-index:999999;width:100vw;height:100vh;pointer-events:none;display:block;touch-action:${this.config.touchAction};`;
      let n2 = document.body || document.documentElement;
      if (!n2) throw Error("[ba-click-fx] 无法挂载 Canvas：请在 DOM 加载完成后初始化");
      n2.appendChild(this.canvas), this._ownsCanvas = true;
    }
    _resizeCanvas() {
      let e2 = this.canvas.getBoundingClientRect();
      this.width = e2.width || window.innerWidth, this.height = e2.height || window.innerHeight, this.dpr = Math.min(window.devicePixelRatio || 1, this.config.maxDpr), this.canvas.width = Math.floor(this.width * this.dpr), this.canvas.height = Math.floor(this.height * this.dpr), this.canvas.style.width = `${this.width}px`, this.canvas.style.height = `${this.height}px`, this.trailCanvas.width = Math.floor(this.width * this.dpr * this.config.trailRenderScale), this.trailCanvas.height = Math.floor(this.height * this.dpr * this.config.trailRenderScale), this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0), this.trailCtx.setTransform(this.dpr * this.config.trailRenderScale, 0, 0, this.dpr * this.config.trailRenderScale, 0, 0), this.waveCanvas.width = Math.floor(this.width * this.dpr), this.waveCanvas.height = Math.floor(this.height * this.dpr), this.waveCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0), this._clearCanvas(), this._clearTrailCanvas(), this._requestRender();
    }
    _debouncedResize() {
      clearTimeout(this._resizeTimer), this._resizeTimer = setTimeout(() => this._resizeCanvas(), 150);
    }
    _clearCanvas() {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    _clearTrailCanvas() {
      this.trailCtx.save(), this.trailCtx.setTransform(1, 0, 0, 1, 0, 0), this.trailCtx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height), this.trailCtx.restore(), this.trailCtx.setTransform(this.dpr * this.config.trailRenderScale, 0, 0, this.dpr * this.config.trailRenderScale, 0, 0);
    }
    _requestRender() {
      this.running || (this.running = true, this.lastTime = performance.now(), this._rafId = requestAnimationFrame(this._animationLoopBound));
    }
    _drawCircle(e2, t2, n2, r2, i2, a2, o2 = 0, s2 = true) {
      a2 <= 0 || r2 <= 0 || (e2.save(), s2 && this.config.glow.fake && this.config.glow.enabled && o2 > 0 && (e2.fillStyle = c(i2, a2 * 0.12), e2.beginPath(), e2.arc(t2, n2, r2 + o2 * 1.2, 0, Math.PI * 2), e2.fill(), e2.fillStyle = c(i2, a2 * 0.16), e2.beginPath(), e2.arc(t2, n2, r2 + o2 * 0.55, 0, Math.PI * 2), e2.fill()), e2.fillStyle = c(i2, a2), e2.beginPath(), e2.arc(t2, n2, r2, 0, Math.PI * 2), e2.fill(), e2.restore());
    }
    _drawTriangle(e2, t2, n2, r2, i2, a2, o2) {
      o2 <= 0 || (e2.save(), e2.translate(t2, n2), e2.rotate(i2), e2.fillStyle = c(a2, o2), ((t3) => {
        let n3 = t3 * Math.sqrt(3) * 0.5, r3 = t3 * 0.5;
        e2.beginPath(), e2.moveTo(0, -t3), e2.lineTo(n3, r3), e2.lineTo(-n3, r3), e2.closePath();
      })(r2), e2.fill(), e2.restore());
    }
    _drawRadialGlow(e2, t2, n2, r2, i2, a2) {
      if (a2 <= 0 || r2 <= 0) return;
      let o2 = e2.createRadialGradient(t2, n2, 0, t2, n2, r2);
      o2.addColorStop(0, c(i2, a2 * 0.68)), o2.addColorStop(0.2, c(i2, a2 * 0.48)), o2.addColorStop(0.52, c(i2, a2 * 0.2)), o2.addColorStop(0.82, c(i2, a2 * 0.055)), o2.addColorStop(1, c(i2, 0)), e2.save(), e2.globalCompositeOperation = "screen", e2.fillStyle = o2, e2.beginPath(), e2.arc(t2, n2, r2, 0, Math.PI * 2), e2.fill(), e2.restore();
    }
    _drawClickDisk(e2, t2, n2, r2, i2, a2) {
      a2 <= 0 || r2 <= 0 || (e2.save(), e2.fillStyle = c(i2, a2), e2.beginPath(), e2.arc(t2, n2, r2, 0, Math.PI * 2), e2.fill(), e2.restore());
    }
    _drawDiskEdgeGlow(e2, t2, n2, r2, i2, a2, o2) {
      if (o2 <= 0 || i2 <= r2) return;
      let s2 = e2.createRadialGradient(t2, n2, 0, t2, n2, i2);
      s2.addColorStop(0, c(a2, o2)), s2.addColorStop(0.08, c(a2, o2 * 0.85)), s2.addColorStop(0.2, c(a2, o2 * 0.55)), s2.addColorStop(0.4, c(a2, o2 * 0.25)), s2.addColorStop(0.65, c(a2, o2 * 0.08)), s2.addColorStop(0.85, c(a2, o2 * 0.02)), s2.addColorStop(1, c(a2, 0)), e2.save(), e2.globalCompositeOperation = "screen", e2.fillStyle = s2, e2.beginPath(), e2.arc(t2, n2, i2, 0, Math.PI * 2), e2.fill(), e2.restore();
    }
    _drawClickArcRibbon(e2, t2, n2, i2, o2, s2, l2, u2, d2, f2) {
      let p2 = Math.abs(s2 - o2);
      if (f2 <= 0 || i2 <= 0 || u2 <= 0 || p2 < 1e-3) return;
      let m2 = Math.max(10, Math.min(96, Math.ceil(p2 / 0.07)));
      e2.save(), e2.fillStyle = c(d2, f2), e2.beginPath();
      for (let c2 = 0; c2 <= m2; c2++) {
        let d3 = c2 / m2, f3 = a(o2, s2, d3), p3 = i2 + a(l2, u2, r(0, 1, Math.sin(Math.PI * d3))) * 0.5, h2 = t2 + Math.cos(f3) * p3, g2 = n2 + Math.sin(f3) * p3;
        c2 === 0 ? e2.moveTo(h2, g2) : e2.lineTo(h2, g2);
      }
      for (let c2 = m2; c2 >= 0; c2--) {
        let d3 = c2 / m2, f3 = a(o2, s2, d3), p3 = a(l2, u2, r(0, 1, Math.sin(Math.PI * d3))), h2 = Math.max(0.1, i2 - p3 * 0.5);
        e2.lineTo(t2 + Math.cos(f3) * h2, n2 + Math.sin(f3) * h2);
      }
      e2.closePath(), e2.fill(), e2.restore();
    }
    _drawClickRingGlow(e2, t2, n2, r2, i2, a2) {
      if (a2 <= 0 || r2 <= 0 || !this.config.glow.clickFake && !this.config.glow.enabled) return;
      let o2 = this.config.rings;
      this._drawRadialGlow(e2, t2, n2, r2 + o2.softGlowRadiusAdd * m(this.config), this.config.color, a2 * o2.softGlowAlpha), this._drawRadialGlow(e2, t2, n2, r2 + o2.glowRadiusAdd * m(this.config), this.config.color, a2 * o2.glowAlpha);
    }
    _getWave(e2, t2) {
      let n2 = this.wavePool.pop() ?? new w(this);
      return n2.reset(e2, t2), n2;
    }
    _releaseWave(e2) {
      e2.dead = true, this.wavePool.length < 64 && this.wavePool.push(e2);
    }
    _getSpark(e2, t2, n2) {
      let r2 = this.sparkPool.pop() ?? new T(this);
      return r2.reset(e2, t2, n2), r2;
    }
    _releaseSpark(e2) {
      e2.dead = true, this.sparkPool.length < 256 && this.sparkPool.push(e2);
    }
    _tuneClickShard(e2, n2, r2) {
      let i2 = Math.random() * Math.PI * 2, a2 = i2 + Math.PI / 2, o2 = this.config.filledCircle.rAddRate * m(this.config), s2 = t(0.4, 0.7) * this.config.scale, c2 = t(-0.4, 0.4) * this.config.scale, u2 = t(0.3, 0.55);
      e2.x = n2 + Math.cos(i2) * o2, e2.y = r2 + Math.sin(i2) * o2, e2.vx = Math.cos(i2) * s2 + Math.cos(a2) * c2, e2.vy = Math.sin(i2) * s2 + Math.sin(a2) * c2, e2.delay = 1.5, e2.size = t(5.2, 10) * this.config.scale, e2.alpha = t(0.9, 1), e2.maxAlpha = e2.alpha, e2.alphaMul = t(1.6, 2), e2.alphaDecay = t(0.028, 0.044), e2.friction = t(0.96, 0.985), e2.rotation = Math.random() < 0.5 ? 0 : Math.PI, e2.rotationSpeed = 0, e2.color = l(this.config.color, [
        255,
        255,
        255
      ], u2), e2.blur = t(0.8, 2.2) * this.config.scale, e2.useFakeGlow = this.config.glow.clickFake, e2.flickerPeriod = this.config.click.shardFlickerPeriod, e2.flickerMinAlpha = this.config.click.shardFlickerMinAlpha, e2.flickerPhase = 0, e2.flickerSizePulse = 0.08, e2.sizeGrowEnd = t(0.16, 0.28), e2.sizeShrinkStart = t(0.62, 0.76), e2.spawnSizeMul = t(0.02, 0.1), e2.endSizeMul = t(0.18, 0.36);
    }
    _tuneTrailShard(e2, n2, r2, i2) {
      let a2 = this.config.trail, o2 = Math.random() < a2.shardLargeChance, s2 = this.config.scale, c2 = t(-Math.PI / 2, Math.PI / 2), u2 = t(0.04, 0.32) * (0.65 + i2 * 0.5) * s2, d2 = r2 + c2;
      e2.vx = Math.cos(d2) * u2, e2.vy = Math.sin(d2) * u2;
      let f2 = o2 ? t(0.35, 0.6) : t(0.2, 0.48);
      e2.size = (o2 ? t(7.4, 12.2) : t(4.2, 6.4)) * s2, e2.alpha = o2 ? t(0.7, 1) : t(0.55, 0.85), e2.maxAlpha = e2.alpha, e2.alphaMul = o2 ? t(1.6, 2) : t(1.5, 1.8);
      let p2 = t(20, 28);
      e2.alphaDecay = e2.alpha / p2, e2.friction = o2 ? t(0.978, 0.99) : t(0.965, 0.982), e2.rotation = Math.random() < 0.5 ? 0 : Math.PI, e2.rotationSpeed = 0, e2.color = l(this.config.color, [
        255,
        255,
        255
      ], f2), e2.blur = (o2 ? t(0.7, 1.6) : t(0.15, 0.65)) * s2, e2.useFakeGlow = true, e2.flickerPeriod = a2.shardFlickerPeriod, e2.flickerMinAlpha = o2 ? a2.shardFlickerMinAlpha : Math.min(0.34, a2.shardFlickerMinAlpha + 0.1), e2.flickerPhase = t(0, a2.shardFlickerPeriod), e2.flickerSizePulse = a2.shardFlickerSizePulse;
      let m2 = t(0.12, 0.18);
      e2.sizeGrowEnd = m2, e2.sizeShrinkStart = m2, e2.spawnSizeMul = o2 ? t(0.35, 0.55) : t(0.25, 0.45), e2.endSizeMul = 0;
    }
    _spawnTrailShards(n2, r2, o2) {
      let s2 = this.config.trail, c2 = i(n2, r2), l2 = s2.shardSpacing * this.config.scale * a(2.5, 1.8, e(o2));
      this.trailShardDistance += c2;
      let u2 = Math.round(this.trailShardDistance / l2), d2 = Math.min(2, u2);
      if (d2 <= 0) return;
      this.trailShardDistance -= d2 * l2, this.trailShardDistance < 0 && (this.trailShardDistance = 0);
      let f2 = a(s2.shardChanceSlow, s2.shardChanceFast, e(o2)), p2 = Math.atan2(r2.y - n2.y, r2.x - n2.x);
      for (let e2 = 0; e2 < d2; e2++) {
        if (this.sparks.length >= s2.maxSparkParticles) return;
        let e3 = Math.random() < f2 && this.sparks.length < s2.maxSparkParticles - 1 ? 2 : 1;
        for (let i2 = 0; i2 < e3; i2++) {
          let e4 = t(0.16, 0.98), i3 = p2 + (Math.random() < 0.5 ? -1 : 1) * Math.PI / 2 + t(-0.24, 0.24), c3 = t(s2.shardOffsetMin, s2.shardOffsetMax) * this.config.scale * (0.82 + o2 * 0.22), l3 = t(-8, 10) * this.config.scale, u3 = a(n2.x, r2.x, e4) + Math.cos(i3) * c3 + Math.cos(p2) * l3, d3 = a(n2.y, r2.y, e4) + Math.sin(i3) * c3 + Math.sin(p2) * l3, f3 = this._getSpark(u3, d3, false);
          this._tuneTrailShard(f3, p2, i3, o2), this.sparks.push(f3);
        }
      }
    }
    _createClickEffect(e2, t2) {
      this.waves.push(this._getWave(e2, t2));
      for (let n2 = 0; n2 < this.config.sparksCount; n2++) {
        let n3 = this._getSpark(e2, t2, true);
        this._tuneClickShard(n3, e2, t2), this.sparks.push(n3);
      }
      this._requestRender();
    }
    _resetTrailInput() {
      this.lastTrailPos = null, this.lastTrailEventTime = 0, this.trailShardDistance = 0;
    }
    _endTrailStroke() {
      this.currentTrailStroke && (this.currentTrailStroke.released = true), this.currentTrailStroke = null;
    }
    _resetTrailAll() {
      this._resetTrailInput(), this._endTrailStroke(), this.trailSpeedFactor = 0, this.trailStrokes.length = 0, this.trailSmoothX = null, this.trailSmoothY = null, this._clearTrailCanvas();
    }
    _updateTrailSpeed(t2, n2, r2) {
      let a2 = i(t2, n2);
      if (this.lastTrailEventTime <= 0) return this.lastTrailEventTime = r2, 0;
      let o2 = e((a2 / Math.max(1, r2 - this.lastTrailEventTime) - this.config.trail.speedMin) / (this.config.trail.speedMax - this.config.trail.speedMin));
      return this.trailSpeedFactor = Math.max(this.trailSpeedFactor, o2), this.lastTrailEventTime = r2, o2;
    }
    _createTrailStroke(t2 = 0) {
      let n2 = [];
      return n2.speedFactor = e(t2), n2.released = false, this.trailStrokes.push(n2), this.currentTrailStroke = n2, n2;
    }
    _beginTrailStroke(e2, t2, n2 = 0) {
      let r2 = this._createTrailStroke(n2);
      return this._addTrailPoint(e2, t2, n2, r2), r2;
    }
    _getTrailMaxLength(t2 = this.currentTrailStroke) {
      let n2 = t2 ? t2.speedFactor ?? 0 : this.trailSpeedFactor;
      return a(this.config.trail.lengthSlow, this.config.trail.lengthFast, e(n2));
    }
    _getTotalTrailPointCount() {
      let e2 = 0;
      for (let t2 of this.trailStrokes) e2 += t2.length;
      return e2;
    }
    _trimOldestTrailPointsByCount() {
      let e2 = this._getTotalTrailPointCount();
      if (e2 > this.config.trail.maxPoints && this.trailStrokes.length > 0) {
        let t2 = this.trailStrokes[0], n2 = e2 - this.config.trail.maxPoints;
        if (t2.length > 0) {
          let e3 = Math.min(t2.length, n2);
          t2.splice(0, e3);
        }
        t2.length === 0 && (t2 === this.currentTrailStroke && (this.currentTrailStroke = null), this.trailStrokes.shift());
      }
      for (; this.trailStrokes.length > 64; ) this.trailStrokes.shift() === this.currentTrailStroke && (this.currentTrailStroke = null);
    }
    _trimTrailPoints(e2 = this.currentTrailStroke) {
      if (!e2 || e2.length < 2) return;
      let t2 = 0;
      for (let n3 = e2.length - 1; n3 > 0; n3--) t2 += i(e2[n3], e2[n3 - 1]);
      let n2 = this._getTrailMaxLength(e2), r2 = 0;
      for (; t2 > n2 && r2 + 1 < e2.length - 7; ) t2 -= i(e2[r2], e2[r2 + 1]), r2++;
      r2 > 0 && e2.splice(0, r2);
    }
    _addTrailPoint(t2, n2, r2 = 0, i2 = this.currentTrailStroke, o2 = false) {
      let s2 = i2 || this._createTrailStroke(r2);
      s2.speedFactor = Math.max(s2.speedFactor ?? 0, e(r2));
      let c2 = a(this.config.trail.lifeSlow, this.config.trail.lifeFast, e(r2));
      s2.push({
        x: t2,
        y: n2,
        life: c2,
        maxLife: c2,
        speedFactor: e(r2),
        distanceFromTail: 0
      }), o2 || this._trimTrailPoints(s2), this._requestRender();
    }
    _addInterpolatedTrailPoints(t2, n2, r2) {
      let o2 = i(t2, n2);
      if (o2 < this.config.trail.minDistance) return;
      if (o2 > this.config.trail.maxJumpDistance) {
        this._endTrailStroke(), this._beginTrailStroke(n2.x, n2.y, r2), this.lastTrailPos = n2;
        return;
      }
      let s2 = this.currentTrailStroke || this._createTrailStroke(r2), c2 = this.config.trail.sampleStep * (1 + e(r2) * 2), l2 = Math.min(this.config.trail.maxInterpolatedPoints, Math.max(2, Math.ceil(o2 / c2)));
      for (let e2 = 1; e2 <= l2; e2++) {
        let i2 = e2 / l2;
        this._addTrailPoint(a(t2.x, n2.x, i2), a(t2.y, n2.y, i2), r2, s2, true);
      }
      this._trimTrailPoints(s2);
    }
    _updateTrailPoints(t2) {
      if (this.trailStrokes.length === 0) return;
      let n2 = [];
      for (let r2 of this.trailStrokes) {
        if (r2.length === 0) continue;
        let i2 = r2 === this.currentTrailStroke && !r2.released && (this.isDown || this.config.trail.always) ? 1 : this.config.trail.releaseDecayMul;
        for (let e2 = 0; e2 < r2.length; e2++) {
          let n3 = r2[e2], o3 = r2.length > 1 ? e2 / (r2.length - 1) : 1, s2 = a(this.config.trail.tailDecayMul, this.config.trail.headDecayMul, o3);
          n3.life -= t2 * s2 * i2;
        }
        let o2 = 0;
        for (; o2 < r2.length && r2[o2].life <= 0; ) o2++;
        o2 > 0 && r2.splice(0, o2), r2.speedFactor = e((r2.speedFactor ?? 0) * this.config.trail.speedDecay ** +t2), this._trimTrailPoints(r2), r2.length > 0 ? n2.push(r2) : r2 === this.currentTrailStroke && (this.currentTrailStroke = null);
      }
      this.trailStrokes = n2, this.currentTrailStroke && !this.trailStrokes.includes(this.currentTrailStroke) && (this.currentTrailStroke = null), this.trailSpeedFactor *= this.config.trail.speedDecay ** +t2, this._trimOldestTrailPointsByCount();
    }
    _buildTrailRenderPoints(e2) {
      if (e2.length < 2) return e2;
      let t2 = this._renderPointCache, n2 = 0, r2 = this.config.trail.renderMaxPoints;
      for (let r3 = 0; r3 < e2.length - 1; r3++) {
        let o3 = e2[r3], s3 = e2[r3 + 1], c3 = i(o3, s3), l2 = Math.max(1, Math.ceil(c3 / this.config.trail.renderStep));
        for (let e3 = 0; e3 < l2; e3++) {
          let r4 = e3 / l2;
          n2 >= t2.length && t2.push({
            x: 0,
            y: 0,
            life: 0,
            maxLife: 0,
            speedFactor: 0,
            distanceFromTail: 0
          });
          let i2 = t2[n2];
          if (i2.x = a(o3.x, s3.x, r4), i2.y = a(o3.y, s3.y, r4), i2.life = a(o3.life, s3.life, r4), i2.maxLife = a(o3.maxLife, s3.maxLife, r4), i2.speedFactor = a(o3.speedFactor ?? 0, s3.speedFactor ?? 0, r4), i2.distanceFromTail = 0, n2 > 0) {
            let e4 = t2[n2 - 1];
            if (Math.hypot(i2.x - e4.x, i2.y - e4.y) < 0.2) continue;
          }
          n2++;
        }
      }
      let o2 = e2[e2.length - 1];
      n2 >= t2.length && t2.push({
        x: 0,
        y: 0,
        life: 0,
        maxLife: 0,
        speedFactor: 0,
        distanceFromTail: 0
      });
      let s2 = t2[n2];
      if (s2.x = o2.x, s2.y = o2.y, s2.life = o2.life, s2.maxLife = o2.maxLife, s2.speedFactor = o2.speedFactor ?? 0, s2.distanceFromTail = 0, (n2 === 0 || Math.hypot(s2.x - t2[n2 - 1].x, s2.y - t2[n2 - 1].y) >= 0.2) && n2++, t2.length = n2, t2.length > r2) {
        let e3 = r2, n3 = t2.length - e3;
        for (let r3 = 0; r3 < e3; r3++) {
          let e4 = t2[n3 + r3], i2 = t2[r3];
          i2.x = e4.x, i2.y = e4.y, i2.life = e4.life, i2.maxLife = e4.maxLife, i2.speedFactor = e4.speedFactor;
        }
        t2.length = e3;
      }
      if (t2.length === 0) return e2;
      let c2 = 0;
      t2[0].distanceFromTail = 0;
      for (let e3 = 1; e3 < t2.length; e3++) c2 += i(t2[e3 - 1], t2[e3]), t2[e3].distanceFromTail = c2;
      return t2.totalLength = c2, t2;
    }
    _strokeSegmentedTrailPath(e2, t2, n2) {
      let { widthValue: r2, stops: i2, widthStops: a2, minWidth: o2 = 0, maxChunks: s2 = 128 } = n2, l2 = t2.totalLength ?? t2[t2.length - 1]?.distanceFromTail ?? 0;
      if (t2.length < 2 || r2 <= 0 || l2 <= 0) return;
      let u2 = Math.max(1, this.config.trail.gradientChunkLength ?? 1.5), d2 = Math.max(u2, l2 / s2), f2 = 0;
      for (let s3 = 1; s3 < t2.length; s3++) {
        let u3 = t2[s3].distanceFromTail - t2[f2].distanceFromTail, p2 = s3 === t2.length - 1;
        if (u3 < d2 && !p2) continue;
        let m2 = (t2[f2].distanceFromTail + t2[s3].distanceFromTail) / 2 / l2, h2 = C(i2, m2), g2 = C(a2, m2, 1), _2 = Math.max(o2, r2 * g2);
        if (h2 > 0 && _2 > 0 && s3 > f2) {
          e2.strokeStyle = c(n2.color, h2), e2.lineWidth = _2, e2.lineCap = "butt", e2.lineJoin = "round", e2.beginPath(), e2.moveTo(t2[f2].x, t2[f2].y);
          for (let n3 = f2 + 1; n3 <= s3; n3++) e2.lineTo(t2[n3].x, t2[n3].y);
          e2.stroke();
        }
        f2 = s3;
      }
    }
    _renderTrailStrokeToCanvas(t2) {
      if (!t2 || t2.length < 2) return;
      let n2 = this._buildTrailRenderPoints(t2);
      if (n2.length < 2) return;
      let i2 = h(this.config), o2 = g(this.config), s2 = _(this.config), c2 = n2[n2.length - 1], l2 = Math.max(c2.speedFactor ?? 0, t2.speedFactor ?? 0), u2 = a(this.config.trail.baseWidthSlow, this.config.trail.baseWidthFast, l2) * this.config.scale, d2 = a(this.config.trail.coreWidthSlow, this.config.trail.coreWidthFast, l2) * this.config.scale, f2 = a(this.config.trail.hotWidthSlow, this.config.trail.hotWidthFast, l2) * this.config.scale, p2 = a(this.config.trail.railWidthSlow, this.config.trail.railWidthFast, l2) * this.config.scale, m2 = r(0.05, 0.45, c2.maxLife > 0 ? e(c2.life / c2.maxLife) : 1), v2 = this.config.trail.alpha * m2, y2 = [
        {
          widthValue: p2,
          minWidth: 0.08 * this.config.scale,
          color: this.config.color,
          widthStops: [
            [0, 0.38],
            [0.35, 0.52],
            [0.72, 0.72],
            [1, 0.52]
          ],
          stops: [
            [0, this.config.trail.railAlpha * 0.16 * v2],
            [0.22, this.config.trail.railAlpha * 0.34 * v2],
            [0.62, this.config.trail.railAlpha * 0.58 * v2],
            [1, this.config.trail.railAlpha * 0.3 * v2]
          ]
        },
        {
          condition: this.config.glow.fake && this.config.glow.enabled,
          widthValue: u2 * this.config.trail.softGlowWidthMul,
          minWidth: u2 * 0.05,
          color: this.config.color,
          widthStops: [
            [0, 0.18],
            [0.42, 0.55],
            [0.78, 0.92],
            [1, 1]
          ],
          stops: [
            [0, 0],
            [0.22, this.config.trail.softGlowAlpha * 0.18 * v2],
            [0.52, this.config.trail.softGlowAlpha * 0.58 * v2],
            [0.82, this.config.trail.softGlowAlpha * v2],
            [1, this.config.trail.softGlowAlpha * 0.72 * v2]
          ]
        },
        {
          condition: this.config.glow.fake && this.config.glow.enabled,
          widthValue: u2 * this.config.trail.glowWidthMul,
          minWidth: u2 * 0.04,
          color: i2,
          widthStops: [
            [0, 0.22],
            [0.38, 0.54],
            [0.76, 0.88],
            [1, 1]
          ],
          stops: [
            [0, 0],
            [0.2, this.config.trail.glowAlpha * 0.16 * v2],
            [0.5, this.config.trail.glowAlpha * 0.48 * v2],
            [0.82, this.config.trail.glowAlpha * v2],
            [1, this.config.trail.glowAlpha * 0.82 * v2]
          ]
        },
        {
          condition: this.config.trail.ribbonAlpha > 0 && this.config.trail.ribbonWidthMul > 0,
          widthValue: u2 * this.config.trail.ribbonWidthMul,
          minWidth: u2 * 0.05,
          color: i2,
          widthStops: [
            [0, 0.06],
            [0.26, 0.36],
            [0.56, 0.88],
            [0.86, 1],
            [1, 0.72]
          ],
          stops: [
            [0, 0],
            [0.18, this.config.trail.ribbonAlpha * 0.08 * v2],
            [0.48, this.config.trail.ribbonAlpha * 0.36 * v2],
            [0.78, this.config.trail.ribbonAlpha * v2],
            [1, this.config.trail.ribbonAlpha * 0.52 * v2]
          ]
        },
        {
          widthValue: u2,
          minWidth: u2 * 0.14,
          color: i2,
          widthStops: [
            [0, 0.24],
            [0.28, 0.46],
            [0.58, 0.82],
            [0.86, 1],
            [1, 0.88]
          ],
          stops: [
            [0, this.config.trail.mainAlpha * 0.04 * v2],
            [0.16, this.config.trail.mainAlpha * 0.14 * v2],
            [0.44, this.config.trail.mainAlpha * 0.48 * v2],
            [0.74, this.config.trail.mainAlpha * v2],
            [1, this.config.trail.mainAlpha * 0.86 * v2]
          ]
        },
        {
          widthValue: d2,
          minWidth: d2 * 0.12,
          color: o2,
          widthStops: [
            [0, 0.16],
            [0.42, 0.42],
            [0.72, 0.9],
            [1, 0.75]
          ],
          stops: [
            [0, 0],
            [0.34, this.config.trail.coreAlpha * 0.08 * v2],
            [0.58, this.config.trail.coreAlpha * 0.42 * v2],
            [0.86, this.config.trail.coreAlpha * v2],
            [1, this.config.trail.coreAlpha * 0.62 * v2]
          ]
        },
        {
          widthValue: f2,
          minWidth: f2 * 0.1,
          color: s2,
          widthStops: [
            [0, 0],
            [0.52, 0.35],
            [0.78, 1],
            [1, 0.62]
          ],
          stops: [
            [0, 0],
            [0.46, 0],
            [0.66, this.config.trail.hotAlpha * 0.28 * v2],
            [0.86, this.config.trail.hotAlpha * v2],
            [1, this.config.trail.hotAlpha * 0.48 * v2]
          ]
        }
      ];
      for (let e2 of y2) e2.condition !== false && this._strokeSegmentedTrailPath(this.trailCtx, n2, {
        widthValue: e2.widthValue,
        minWidth: e2.minWidth,
        color: e2.color,
        widthStops: e2.widthStops,
        stops: e2.stops
      });
      if (this.config.glow.enabled && n2.length > 1) {
        let e2 = n2[n2.length - 1].distanceFromTail || 1, t3 = u2 * this.config.trail.glowRadiusMul, r2 = Math.max(t3 * 0.4, 4), i3 = 0;
        for (let a2 = 0; a2 < n2.length; a2++) {
          if (a2 > 0) {
            let e3 = n2[a2].x - n2[a2 - 1].x, t4 = n2[a2].y - n2[a2 - 1].y;
            i3 += Math.sqrt(e3 * e3 + t4 * t4);
          }
          if (i3 >= r2 || a2 === 0 || a2 === n2.length - 1) {
            i3 = 0;
            let r3 = (n2[a2].distanceFromTail || 0) / e2, o3 = this.config.trail.glowIntensity, s3 = C([
              [0, 0],
              [0.2, o3 * 0.12],
              [0.5, o3 * 0.35],
              [0.8, o3 * 0.71],
              [1, o3]
            ], r3) * this.config.trail.mainAlpha * v2;
            s3 > 5e-3 && this._drawRadialGlow(this.trailCtx, n2[a2].x, n2[a2].y, t3, this.config.color, s3);
          }
        }
      }
    }
    _renderTrailToCanvas() {
      if (this._clearTrailCanvas(), !(!this.config.trail.enabled || this.trailStrokes.length === 0)) {
        this.trailCtx.save(), this.trailCtx.globalCompositeOperation = "lighter";
        for (let e2 of this.trailStrokes) this._renderTrailStrokeToCanvas(e2);
        this.trailCtx.restore();
      }
    }
    _updateWaves(e2, t2) {
      for (let n2 = this.waves.length - 1; n2 >= 0; n2--) {
        let r2 = this.waves[n2];
        r2.update(e2, t2), r2.dead && (this.waves.splice(n2, 1), this._releaseWave(r2));
      }
    }
    _updateSparks(e2, t2, n2) {
      for (let r2 = this.sparks.length - 1; r2 >= 0; r2--) {
        let i2 = this.sparks[r2], a2 = i2.fromClick ? t2 : n2;
        i2.update(e2, a2), i2.dead && (this.sparks.splice(r2, 1), this._releaseSpark(i2));
      }
    }
    _hasActiveEffects() {
      return this.waves.length > 0 || this.sparks.length > 0 || this.trailStrokes.length > 0 || this.isDown;
    }
    _animationLoop(e2) {
      let t2 = Math.min(e2 - this.lastTime, this.config.maxDeltaMs);
      this.lastTime = e2;
      let n2 = t2 / this.config.baseFrameMs, r2 = n2 * this.config.clickSpeed, i2 = n2 * this.config.trailSpeed;
      this._clearCanvas(), this._updateTrailPoints(i2), this._renderTrailToCanvas(), this.ctx.save(), this.ctx.globalCompositeOperation = "source-over", this.ctx.drawImage(this.trailCanvas, 0, 0, this.width, this.height);
      for (let e3 = 0; e3 < this.waves.length; e3++) {
        let t3 = this.waves[e3];
        this.waveCtx.save(), this.waveCtx.setTransform(1, 0, 0, 1, 0, 0), this.waveCtx.clearRect(0, 0, this.waveCanvas.width, this.waveCanvas.height), this.waveCtx.restore(), t3.update(this.waveCtx, r2), this.ctx.drawImage(this.waveCanvas, 0, 0, this.width, this.height);
      }
      for (let e3 = this.waves.length - 1; e3 >= 0; e3--) this.waves[e3].dead && (this._releaseWave(this.waves[e3]), this.waves.splice(e3, 1));
      this._updateSparks(this.ctx, r2, i2), this.ctx.restore(), this._hasActiveEffects() ? this._rafId = requestAnimationFrame(this._animationLoopBound) : (this.running = false, this._clearCanvas(), this._clearTrailCanvas());
    }
    _getPointerPos(e2) {
      let t2 = this.canvas.getBoundingClientRect();
      return {
        x: e2.clientX - t2.left,
        y: e2.clientY - t2.top
      };
    }
    _handlePointerMove(n2) {
      let r2 = typeof n2.getCoalescedEvents == "function" ? n2.getCoalescedEvents() : [n2];
      if (r2.length === 0 && (r2 = [n2]), r2.length > this.config.trail.maxCoalescedEvents) {
        let e2 = this.config.trail.maxCoalescedEvents, t2 = [];
        for (let n3 = 0; n3 < e2; n3++) {
          let i2 = Math.round((r2.length - 1) * (n3 / (e2 - 1)));
          t2.push(r2[i2]);
        }
        r2 = t2;
      }
      if (!(this.config.trail.always || this.isDown)) {
        this._resetTrailInput(), this._endTrailStroke();
        return;
      }
      let a2 = null, o2 = 0;
      for (let t2 of r2) {
        let n3 = o2 >= 1024, r3 = this._getPointerPos(t2);
        a2 = r3;
        let s2 = this.config.trail.smoothFactor;
        if (s2 > 0 && (this.trailSmoothX == null ? (this.trailSmoothX = r3.x, this.trailSmoothY = r3.y) : (this.trailSmoothX = this.trailSmoothX * s2 + r3.x * (1 - s2), this.trailSmoothY = this.trailSmoothY * s2 + r3.y * (1 - s2)), this._smoothPosCache.x = this.trailSmoothX, this._smoothPosCache.y = this.trailSmoothY, r3 = this._smoothPosCache), !this.lastTrailPos) {
          this.lastTrailPos = {
            x: r3.x,
            y: r3.y
          }, this.lastTrailEventTime = t2.timeStamp || performance.now(), this.currentTrailStroke || this._beginTrailStroke(r3.x, r3.y, this.trailSpeedFactor), a2 = r3;
          continue;
        }
        let c2 = t2.timeStamp || performance.now(), l2 = this._updateTrailSpeed(this.lastTrailPos, r3, c2), u2 = i(this.lastTrailPos, r3), d2 = this.config.trail.sampleStep * (1 + e(l2) * 2);
        o2 += Math.ceil(u2 / d2), n3 || this._addInterpolatedTrailPoints(this.lastTrailPos, r3, l2), this._spawnTrailShards(this.lastTrailPos, r3, l2), this.lastTrailPos = {
          x: r3.x,
          y: r3.y
        };
      }
      if (a2 && Math.random() < this.config.trail.moveSparkChance) {
        let e2 = Math.random() * Math.PI * 2, n3 = t(5, 22) * this.config.scale, r3 = this._getSpark(a2.x + Math.cos(e2) * n3, a2.y + Math.sin(e2) * n3, false);
        this._tuneTrailShard(r3, e2, e2, this.trailSpeedFactor), this.sparks.push(r3);
      }
      this._requestRender();
    }
    _setupInput() {
      this._onPointerDown = (e2) => {
        this.isDown = true;
        let t2 = this._getPointerPos(e2);
        this.trailSmoothX = null, this.trailSmoothY = null, this.lastTrailPos = t2, this.lastTrailEventTime = e2.timeStamp || performance.now(), this.trailSpeedFactor = Math.max(this.trailSpeedFactor, 0.15), this._endTrailStroke(), this._beginTrailStroke(t2.x, t2.y, this.trailSpeedFactor), this.config.clickEnabled && this._createClickEffect(t2.x, t2.y);
      }, this._onPointerMove = this._handlePointerMove.bind(this), this._onPointerUp = () => {
        this.isDown = false, this._resetTrailInput(), this._endTrailStroke(), this._requestRender();
      }, this._onBlur = () => {
        this.isDown = false, this._resetTrailInput(), this._endTrailStroke(), this._requestRender();
      }, window.addEventListener("pointerdown", this._onPointerDown), window.addEventListener("pointermove", this._onPointerMove, { passive: true }), window.addEventListener("pointerup", this._onPointerUp), window.addEventListener("pointercancel", this._onPointerUp), window.addEventListener("blur", this._onBlur);
    }
    _teardownInput() {
      window.removeEventListener("pointerdown", this._onPointerDown), window.removeEventListener("pointermove", this._onPointerMove), window.removeEventListener("pointerup", this._onPointerUp), window.removeEventListener("pointercancel", this._onPointerUp), window.removeEventListener("blur", this._onBlur);
    }
    destroy() {
      window.removeEventListener("resize", this._onResize), this._teardownInput(), clearTimeout(this._resizeTimer), this.running = false, this._rafId != null && (cancelAnimationFrame(this._rafId), this._rafId = null), this._ownsCanvas && this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas);
    }
    setColor(e2, t2, n2) {
      this.config.color = [
        e2,
        t2,
        n2
      ], this.clearTrail(), this._clearCanvas(), this._clearTrailCanvas(), this._requestRender();
    }
    setScale(e2) {
      this.config.scale = Math.max(0.5, Math.min(3, Number(e2) ?? 1.1)), this._requestRender();
    }
    setOpacity(e2) {
      this.config.opacity = Math.max(0.1, Math.min(1, Number(e2) ?? 0.5)), this._requestRender();
    }
    setSpeed(e2, t2 = e2) {
      this.config.clickSpeed = Math.max(0.2, Math.min(3, Number(e2) ?? 1)), this.config.trailSpeed = Math.max(0.2, Math.min(3, Number(t2) ?? 1)), this._requestRender();
    }
    setDpr(e2) {
      this.config.maxDpr = Math.max(1, Math.min(2, Number(e2) ?? 1)), this._resizeCanvas();
    }
    setTrailRenderScale(e2) {
      this.config.trailRenderScale = Math.max(0.5, Math.min(1, Number(e2) ?? 1)), this._resizeCanvas();
    }
    setTouchAction(e2 = "auto") {
      this.config.touchAction = e2, this.canvas.style.touchAction = e2, this._requestRender();
    }
    setGlow(e2) {
      this.config.glow.enabled = !!e2, this._requestRender();
    }
    setFakeGlow(e2) {
      this.config.glow.fake = !!e2, this._requestRender();
    }
    setClickFakeGlow(e2) {
      this.config.glow.clickFake = !!e2, this._requestRender();
    }
    setRingRotationSpeed(e2 = 8e-3) {
      this.config.rings.rotationSpeed = Math.max(0, Math.min(0.05, Number(e2) ?? 8e-3)), this._requestRender();
    }
    setRingEmission(e2 = 0.35) {
      this.config.rings.emissionAlpha = Math.max(0, Math.min(1, Number(e2) ?? 0.35)), this._requestRender();
    }
    setRingWidth(e2 = 0.9, t2 = 4) {
      this.config.rings.minW = Math.max(0.3, Math.min(3, Number(e2) ?? 0.9)), this.config.rings.maxW = Math.max(this.config.rings.minW, Math.min(10, Number(t2) ?? 4)), this._requestRender();
    }
    setRingWidthEndMul(e2 = 0.35) {
      this.config.rings.widthEndMul = Math.max(0.05, Math.min(1, Number(e2) ?? 0.35)), this._requestRender();
    }
    setRingAlpha(e2 = 0.9) {
      this.config.rings.alpha = Math.max(0.1, Math.min(1, Number(e2) ?? 0.9)), this._requestRender();
    }
    setRingWhiteMix(e2 = 0.75) {
      this.config.rings.whiteMix = Math.max(0, Math.min(1, Number(e2) ?? 0.75)), this._requestRender();
    }
    setTrailBrightness(e2 = 0.96) {
      this.config.trail.alpha = Math.max(0.1, Math.min(1, Number(e2) ?? 0.96)), this._requestRender();
    }
    setTrailWhiteMix(e2 = 0.45) {
      this.config.trail.whiteMix = Math.max(0, Math.min(1, Number(e2) ?? 0.45)), this._requestRender();
    }
    setTrail(e2) {
      this.config.trail.enabled = !!e2, this._requestRender();
    }
    setClick(e2) {
      this.config.clickEnabled = !!e2, this._requestRender();
    }
    setTrailAlways(e2) {
      this.config.trail.always = !!e2, this._resetTrailInput(), this._endTrailStroke(), this._requestRender();
    }
    setTrailWidth(e2 = 3, t2 = 3) {
      this.config.trail.baseWidthFast = Math.max(0.5, Math.min(6, Number(e2) ?? 3)), this.config.trail.baseWidthSlow = Math.max(0.3, Math.min(this.config.trail.baseWidthFast, Number(t2) ?? 3)), this._requestRender();
    }
    setTrailLength(e2 = 900, t2 = 4200) {
      this.config.trail.lengthSlow = Math.max(20, Math.min(5e3, Number(e2) ?? 900)), this.config.trail.lengthFast = Math.max(this.config.trail.lengthSlow + 20, Math.min(8e3, Number(t2) ?? 4200)), this._requestRender();
    }
    setTrailLife(e2 = 22, t2 = 22) {
      this.config.trail.lifeSlow = Math.max(5, Math.min(400, Number(e2) ?? 22)), this.config.trail.lifeFast = Math.max(this.config.trail.lifeSlow, Math.min(600, Number(t2) ?? 22)), this._requestRender();
    }
    setTrailDecay(e2 = 1.28, t2 = 0.95, n2 = 1.18) {
      this.config.trail.tailDecayMul = Math.max(0.1, Math.min(5, Number(e2) ?? 1.28)), this.config.trail.headDecayMul = Math.max(0.1, Math.min(this.config.trail.tailDecayMul, Number(t2) ?? 0.95)), this.config.trail.releaseDecayMul = Math.max(0.5, Math.min(12, Number(n2) ?? 1.18)), this._requestRender();
    }
    setTrailSpeedDecay(e2 = 0.988) {
      this.config.trail.speedDecay = Math.max(0.8, Math.min(0.999, Number(e2) ?? 0.988)), this._requestRender();
    }
    setTrailSpeedRange(e2 = 0.035, t2 = 2.2) {
      this.config.trail.speedMin = Math.max(0, Number(e2) ?? 0.035), this.config.trail.speedMax = Math.max(this.config.trail.speedMin + 0.1, Number(t2) ?? 2.2), this._requestRender();
    }
    setTrailSampling(e2 = 0.85, t2 = 80) {
      this.config.trail.sampleStep = Math.max(0.3, Math.min(12, Number(e2) ?? 0.85)), this.config.trail.maxInterpolatedPoints = Math.max(2, Math.min(160, Number(t2) ?? 80)), this._requestRender();
    }
    setTrailRenderSampling(e2 = 0.75, t2 = 2400) {
      this.config.trail.renderStep = Math.max(0.3, Math.min(8, Number(e2) ?? 0.75)), this.config.trail.renderMaxPoints = Math.max(60, Math.min(3600, Number(t2) ?? 2400)), this._requestRender();
    }
    setTrailSmooth(e2 = 0.5) {
      this.config.trail.smoothFactor = Math.max(0, Math.min(0.9, Number(e2) ?? 0.5)), this.trailSmoothX = null, this.trailSmoothY = null, this._requestRender();
    }
    setTrailLayerAlpha(e2 = 1, t2 = 0.78, n2 = 0.34, r2 = 0.18, i2 = 0.045, a2 = 0.02) {
      this.config.trail.mainAlpha = Math.max(0, Math.min(1, Number(e2) ?? 1)), this.config.trail.coreAlpha = Math.max(0, Math.min(1, Number(t2) ?? 0.78)), this.config.trail.hotAlpha = Math.max(0, Math.min(1, Number(n2) ?? 0.34)), this.config.trail.glowAlpha = Math.max(0, Math.min(1, Number(r2) ?? 0.18)), this.config.trail.softGlowAlpha = Math.max(0, Math.min(0.5, Number(i2) ?? 0.045)), this.config.trail.railAlpha = Math.max(0, Math.min(1, Number(a2) ?? 0.02)), this._requestRender();
    }
    setMoveSparkChance(e2 = 0) {
      this.config.trail.moveSparkChance = Math.max(0, Math.min(0.05, Number(e2) ?? 0));
    }
    setShardSpacing(e2 = 220) {
      this.config.trail.shardSpacing = Math.max(20, Math.min(500, Number(e2) ?? 220)), this._requestRender();
    }
    setShardChance(e2 = 0.04, t2 = 0.18) {
      this.config.trail.shardChanceSlow = Math.max(0, Math.min(1, Number(e2) ?? 0.04)), this.config.trail.shardChanceFast = Math.max(this.config.trail.shardChanceSlow, Math.min(1, Number(t2) ?? 0.18)), this._requestRender();
    }
    setShardLargeChance(e2 = 0.62) {
      this.config.trail.shardLargeChance = Math.max(0, Math.min(1, Number(e2) ?? 0.62)), this._requestRender();
    }
    setMaxShards(e2 = 38) {
      this.config.trail.maxSparkParticles = Math.max(0, Math.min(200, Number(e2) ?? 38)), this._requestRender();
    }
    setSparksCount(e2 = 4) {
      this.config.sparksCount = Math.max(0, Math.min(12, Number(e2) ?? 4)), this._requestRender();
    }
    setClickTotalLife(e2 = 27) {
      this.config.click.totalLife = Math.max(10, Math.min(60, Number(e2) ?? 27)), this._requestRender();
    }
    setClickScaleMul(e2 = 1.3) {
      this.config.click.scaleMul = Math.max(0.5, Math.min(3, Number(e2) ?? 1.3)), this._requestRender();
    }
    setClickHaloRadius(e2 = 96) {
      this.config.click.haloRadius = Math.max(30, Math.min(200, Number(e2) ?? 96)), this._requestRender();
    }
    setRingDelay(e2 = 2) {
      this.config.rings.delay = Math.max(0, Math.min(10, Number(e2) ?? 2)), this._requestRender();
    }
    setRingMaxLife(e2 = 27) {
      this.config.rings.maxLife = Math.max(10, Math.min(60, Number(e2) ?? 27)), this._requestRender();
    }
    setRingBaseRadiusMul(e2 = 0.47) {
      this.config.rings.baseRadiusMul = Math.max(0.2, Math.min(1, Number(e2) ?? 0.47)), this._requestRender();
    }
    setRingRadiusGrowEnd(e2 = 0.66) {
      this.config.rings.radiusGrowEnd = Math.max(0.2, Math.min(1, Number(e2) ?? 0.66)), this._requestRender();
    }
    setRingPostDiskGrow(e2 = 24) {
      this.config.rings.postDiskGrow = Math.max(5, Math.min(60, Number(e2) ?? 24)), this._requestRender();
    }
    setRingGlowRadiusAdd(e2 = 54) {
      this.config.rings.glowRadiusAdd = Math.max(10, Math.min(150, Number(e2) ?? 54)), this._requestRender();
    }
    setRingSoftGlowRadiusAdd(e2 = 96) {
      this.config.rings.softGlowRadiusAdd = Math.max(20, Math.min(200, Number(e2) ?? 96)), this._requestRender();
    }
    setRingColorFadeStart(e2 = 0.56) {
      this.config.rings.colorFadeStart = Math.max(0, Math.min(1, Number(e2) ?? 0.56)), this._requestRender();
    }
    setRingColorEndWhiteMix(e2 = 0.97) {
      this.config.rings.colorEndWhiteMix = Math.max(0, Math.min(1, Number(e2) ?? 0.97)), this._requestRender();
    }
    setRingGlowAlpha(e2 = 0.15) {
      this.config.rings.glowAlpha = Math.max(0, Math.min(1, Number(e2) ?? 0.15)), this._requestRender();
    }
    setRingSoftGlowAlpha(e2 = 0.08) {
      this.config.rings.softGlowAlpha = Math.max(0, Math.min(1, Number(e2) ?? 0.08)), this._requestRender();
    }
    setClickShardFlicker(e2 = 8, t2 = 0.45) {
      this.config.click.shardFlickerPeriod = Math.max(2, Math.min(30, Number(e2) ?? 8)), this.config.click.shardFlickerMinAlpha = Math.max(0, Math.min(1, Number(t2) ?? 0.45)), this._requestRender();
    }
    setTrailShardFlicker(e2 = 8, t2 = 0.35, n2 = 0.16) {
      this.config.trail.shardFlickerPeriod = Math.max(2, Math.min(30, Number(e2) ?? 8)), this.config.trail.shardFlickerMinAlpha = Math.max(0, Math.min(1, Number(t2) ?? 0.35)), this.config.trail.shardFlickerSizePulse = Math.max(0, Math.min(0.5, Number(n2) ?? 0.16)), this._requestRender();
    }
    setDiskSize(e2 = 26) {
      this.config.filledCircle.rAddRate = Math.max(10, Math.min(50, Number(e2) ?? 26)), this._requestRender();
    }
    setDiskGlow(e2 = 4.2, t2 = 0.13) {
      this.config.filledCircle.glowRadiusMul = Math.max(1, Math.min(10, Number(e2) ?? 4.2)), this.config.filledCircle.glowAlpha = Math.max(0, Math.min(1, Number(t2) ?? 0.13)), this._requestRender();
    }
    setTrailMainAlpha(e2 = 1) {
      this.config.trail.mainAlpha = Math.max(0, Math.min(1, Number(e2) ?? 1)), this._requestRender();
    }
    setTrailCoreAlpha(e2 = 0.78) {
      this.config.trail.coreAlpha = Math.max(0, Math.min(1, Number(e2) ?? 0.78)), this._requestRender();
    }
    setTrailHotAlpha(e2 = 0.34) {
      this.config.trail.hotAlpha = Math.max(0, Math.min(1, Number(e2) ?? 0.34)), this._requestRender();
    }
    setTrailGlowAlpha(e2 = 0.18) {
      this.config.trail.glowAlpha = Math.max(0, Math.min(1, Number(e2) ?? 0.18)), this._requestRender();
    }
    setTrailSoftGlowAlpha(e2 = 0.045) {
      this.config.trail.softGlowAlpha = Math.max(0, Math.min(0.5, Number(e2) ?? 0.045)), this._requestRender();
    }
    setTrailRailAlpha(e2 = 0.02) {
      this.config.trail.railAlpha = Math.max(0, Math.min(1, Number(e2) ?? 0.02)), this._requestRender();
    }
    setTrailGlowWidthMul(e2 = 1.7) {
      this.config.trail.glowWidthMul = Math.max(0.3, Math.min(8, Number(e2) ?? 1.7)), this._requestRender();
    }
    setTrailSoftGlowWidthMul(e2 = 2.4) {
      this.config.trail.softGlowWidthMul = Math.max(0.5, Math.min(15, Number(e2) ?? 2.4)), this._requestRender();
    }
    setTrailTailDecayMul(e2 = 1.28) {
      this.config.trail.tailDecayMul = Math.max(0.1, Math.min(5, Number(e2) ?? 1.28)), this._requestRender();
    }
    setTrailHeadDecayMul(e2 = 0.95) {
      this.config.trail.headDecayMul = Math.max(0.1, Math.min(5, Number(e2) ?? 0.95)), this._requestRender();
    }
    setTrailReleaseDecayMul(e2 = 1.18) {
      this.config.trail.releaseDecayMul = Math.max(0.5, Math.min(12, Number(e2) ?? 1.18)), this._requestRender();
    }
    setTrailSpeedMin(e2 = 0.035) {
      this.config.trail.speedMin = Math.max(5e-3, Math.min(0.5, Number(e2) ?? 0.035)), this.config.trail.speedMin >= this.config.trail.speedMax && (this.config.trail.speedMax = this.config.trail.speedMin + 5e-3), this._requestRender();
    }
    setTrailSpeedMax(e2 = 2.2) {
      this.config.trail.speedMax = Math.max(0.5, Math.min(5, Number(e2) ?? 2.2)), this.config.trail.speedMax <= this.config.trail.speedMin && (this.config.trail.speedMin = this.config.trail.speedMax - 5e-3), this._requestRender();
    }
    setRingArcLength(e2 = 1.5 * Math.PI, t2 = Math.PI / 3) {
      this.config.rings.lenFull = Math.max(0.5, Math.min(6.28, Number(e2) ?? 4.71)), this.config.rings.lenEnd = Math.max(0.1, Math.min(this.config.rings.lenFull, Number(t2) ?? 1.05)), this._requestRender();
    }
    setRingRotationJitter(e2 = 0.54, t2 = 1.58) {
      this.config.rings.rotationMulMin = Math.max(0.1, Math.min(5, Number(e2) ?? 0.54)), this.config.rings.rotationMulMax = Math.max(this.config.rings.rotationMulMin, Math.min(5, Number(t2) ?? 1.58)), this._requestRender();
    }
    setRingSegmentCount(e2 = 2, t2 = 2) {
      this.config.rings.segmentCountMin = Math.max(1, Math.min(8, Number(e2) ?? 2)), this.config.rings.segmentCountMax = Math.max(this.config.rings.segmentCountMin, Math.min(8, Number(t2) ?? 2)), this._requestRender();
    }
    setRingSmallRadius(e2 = 0.75, t2 = 0.92) {
      this.config.rings.segmentRadiusGrowSmallMin = Math.max(0.3, Math.min(1.5, Number(e2) ?? 0.75)), this.config.rings.segmentRadiusGrowSmallMax = Math.max(this.config.rings.segmentRadiusGrowSmallMin, Math.min(1.5, Number(t2) ?? 0.92)), this._requestRender();
    }
    setTrailShardOffset(e2 = 2, t2 = 36) {
      this.config.trail.shardOffsetMin = Math.max(0, Math.min(100, Number(e2) ?? 2)), this.config.trail.shardOffsetMax = Math.max(this.config.trail.shardOffsetMin, Math.min(100, Number(t2) ?? 36)), this._requestRender();
    }
    setTrailCoreWidth(e2 = 0.3, t2 = 0.52) {
      this.config.trail.coreWidthSlow = Math.max(0.05, Math.min(5, Number(e2) ?? 0.3)), this.config.trail.coreWidthFast = Math.max(this.config.trail.coreWidthSlow, Math.min(5, Number(t2) ?? 0.52)), this._requestRender();
    }
    setTrailHotWidth(e2 = 0.1, t2 = 0.24) {
      this.config.trail.hotWidthSlow = Math.max(0.05, Math.min(5, Number(e2) ?? 0.1)), this.config.trail.hotWidthFast = Math.max(this.config.trail.hotWidthSlow, Math.min(5, Number(t2) ?? 0.24)), this._requestRender();
    }
    setTrailGradientChunk(e2 = 1.5) {
      this.config.trail.gradientChunkLength = Math.max(0.3, Math.min(10, Number(e2) ?? 1.5)), this._requestRender();
    }
    setTrailMaxPoints(e2 = 12e3) {
      this.config.trail.maxPoints = Math.max(500, Math.min(3e4, Number(e2) ?? 12e3)), this._requestRender();
    }
    setDiskTiming(e2 = 12.5, t2 = 0.84, n2 = 0.34, r2 = 0.78) {
      this.config.filledCircle.maxLife = Math.max(5, Math.min(30, Number(e2) ?? 12.5)), this.config.filledCircle.expandEnd = Math.max(0.1, Math.min(1, Number(t2) ?? 0.84)), this.config.filledCircle.colorEnd = Math.max(0.05, Math.min(1, Number(n2) ?? 0.34)), this.config.filledCircle.fadeStart = Math.max(0.1, Math.min(1, Number(r2) ?? 0.78)), this._requestRender();
    }
    setRingSegmentDetail(e2 = 0, t2 = 0.38, n2 = 0.46, r2 = 1.38) {
      this.config.rings.segmentExtraChance = Math.max(0, Math.min(1, Number(e2) ?? 0)), this.config.rings.segmentClusterChance = Math.max(0, Math.min(1, Number(t2) ?? 0.38)), this.config.rings.lenMulMin = Math.max(0.1, Math.min(1, Number(n2) ?? 0.46)), this.config.rings.lenMulMax = Math.max(this.config.rings.lenMulMin, Math.min(3, Number(r2) ?? 1.38)), this._requestRender();
    }
    setRingRadiusJitter(e2 = 0.3, t2 = 0.8) {
      this.config.rings.radiusJitterMin = Math.max(0, Math.min(2, Number(e2) ?? 0.3)), this.config.rings.radiusJitterMax = Math.max(this.config.rings.radiusJitterMin, Math.min(2, Number(t2) ?? 0.8)), this._requestRender();
    }
    setRingNormalGrow(e2 = 1, t2 = 1) {
      this.config.rings.segmentRadiusGrowMin = Math.max(0.3, Math.min(2, Number(e2) ?? 1)), this.config.rings.segmentRadiusGrowMax = Math.max(this.config.rings.segmentRadiusGrowMin, Math.min(2, Number(t2) ?? 1)), this._requestRender();
    }
    setRingCollapseTiming(e2 = 0.16, t2 = 0.16, n2 = 1) {
      this.config.rings.growEnd = Math.max(0.05, Math.min(0.5, Number(e2) ?? 0.16)), this.config.rings.collapseStart = Math.max(0.05, Math.min(1, Number(t2) ?? 0.16)), this.config.rings.fadeStart = Math.max(0.1, Math.min(1, Number(n2) ?? 1)), this._requestRender();
    }
    setTrailMinDistance(e2 = 0.06) {
      this.config.trail.minDistance = Math.max(0.01, Math.min(5, Number(e2) ?? 0.06)), this._requestRender();
    }
    setTrailMaxJumpDistance(e2 = 420) {
      this.config.trail.maxJumpDistance = Math.max(50, Math.min(2e3, Number(e2) ?? 420)), this._requestRender();
    }
    setTrailMaxCoalescedEvents(e2 = 24) {
      this.config.trail.maxCoalescedEvents = Math.max(1, Math.min(100, Number(e2) ?? 24)), this._requestRender();
    }
    setTrailRailWidth(e2 = 0.22, t2 = 0.36) {
      this.config.trail.railWidthSlow = Math.max(0.05, Math.min(3, Number(e2) ?? 0.22)), this.config.trail.railWidthFast = Math.max(this.config.trail.railWidthSlow, Math.min(3, Number(t2) ?? 0.36)), this._requestRender();
    }
    setTrailRibbon(e2 = 0, t2 = 0) {
      this.config.trail.ribbonWidthMul = Math.max(0, Math.min(5, Number(e2) ?? 0)), this.config.trail.ribbonAlpha = Math.max(0, Math.min(1, Number(t2) ?? 0)), this._requestRender();
    }
    setTrailGlowRadius(e2 = 25) {
      this.config.trail.glowRadiusMul = Math.max(4, Math.min(30, Number(e2) ?? 25)), this._requestRender();
    }
    setTrailGlowIntensity(e2 = 0.13) {
      this.config.trail.glowIntensity = Math.max(0.02, Math.min(0.5, Number(e2) ?? 0.13)), this._requestRender();
    }
    clearTrail() {
      this._resetTrailAll(), this._requestRender();
    }
    boom(e2 = window.innerWidth / 2, t2 = window.innerHeight / 2) {
      this.config.clickEnabled && this._createClickEffect(e2, t2);
    }
    getConfig() {
      return f(this.config);
    }
    resetConfig() {
      this.config = p(), this._resizeCanvas(), this._requestRender();
    }
    get CONFIG() {
      return this.config;
    }
  };

  // src/shared/settings.js
  var DEFAULT_SETTINGS = Object.freeze(
    {
      enabled: true,
      clickEnabled: true,
      trailEnabled: true,
      trailAlways: true,
      color: "#69a1ff",
      opacity: 0.5,
      scale: 1.1,
      quality: "balanced",
      disabledSites: Object.freeze({})
    }
  );
  var QUALITY_PROFILES = Object.freeze(
    {
      performance: Object.freeze(
        {
          maxDpr: 1,
          trailRenderScale: 0.6
        }
      ),
      balanced: Object.freeze(
        {
          maxDpr: 1,
          trailRenderScale: 0.8
        }
      ),
      high: Object.freeze(
        {
          maxDpr: 2,
          trailRenderScale: 1
        }
      )
    }
  );
  var HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
  var MAX_SITE_KEY_LENGTH = 512;
  var MAX_RENDER_PIXEL_LAYERS = 2e7;
  function clamp(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      return fallback;
    }
    return Math.max(min, Math.min(max, number));
  }
  function normalizeDisabledSites(value) {
    const sites = {};
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return sites;
    }
    for (const [key, disabled] of Object.entries(value)) {
      if (disabled === true && typeof key === "string" && key.length > 0 && key.length <= MAX_SITE_KEY_LENGTH) {
        sites[key] = true;
      }
    }
    return sites;
  }
  function normalizeSettings(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    const color = typeof source.color === "string" && HEX_COLOR_PATTERN.test(source.color) ? source.color.toLowerCase() : DEFAULT_SETTINGS.color;
    const quality = Object.hasOwn(QUALITY_PROFILES, source.quality) ? source.quality : DEFAULT_SETTINGS.quality;
    return {
      enabled: source.enabled === void 0 ? DEFAULT_SETTINGS.enabled : source.enabled === true,
      clickEnabled: source.clickEnabled === void 0 ? DEFAULT_SETTINGS.clickEnabled : source.clickEnabled === true,
      trailEnabled: source.trailEnabled === void 0 ? DEFAULT_SETTINGS.trailEnabled : source.trailEnabled === true,
      trailAlways: source.trailAlways === void 0 ? DEFAULT_SETTINGS.trailAlways : source.trailAlways === true,
      color,
      opacity: clamp(source.opacity, 0.1, 1, DEFAULT_SETTINGS.opacity),
      scale: clamp(source.scale, 0.5, 2, DEFAULT_SETTINGS.scale),
      quality,
      disabledSites: normalizeDisabledSites(source.disabledSites)
    };
  }
  function getQualityProfile(quality) {
    return QUALITY_PROFILES[quality] || QUALITY_PROFILES[DEFAULT_SETTINGS.quality];
  }
  function getEffectiveMaxDpr(quality, viewportWidth, viewportHeight, screenWidth = viewportWidth, screenHeight = viewportHeight) {
    const profile = getQualityProfile(quality);
    const normalizeDimension = (value) => {
      const number = Number(value);
      return Number.isFinite(number) && number > 0 ? number : 1;
    };
    const viewportPixels = normalizeDimension(viewportWidth) * normalizeDimension(viewportHeight);
    const screenPixels = normalizeDimension(screenWidth) * normalizeDimension(screenHeight);
    const cssPixels = Math.max(viewportPixels, screenPixels);
    const layerMultiplier = 1 + profile.trailRenderScale ** 2;
    const budgetDpr = Math.sqrt(MAX_RENDER_PIXEL_LAYERS / (cssPixels * layerMultiplier));
    return Math.max(1, Math.min(profile.maxDpr, budgetDpr));
  }
  function getSiteKey(urlValue) {
    try {
      const url = new URL(urlValue);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.origin;
      }
      if (url.protocol === "file:") {
        return "file://";
      }
    } catch {
      return null;
    }
    return null;
  }
  function hexToRgb(hex) {
    const normalized = HEX_COLOR_PATTERN.test(hex) ? hex : DEFAULT_SETTINGS.color;
    const value = Number.parseInt(normalized.slice(1), 16);
    return [
      value >> 16 & 255,
      value >> 8 & 255,
      value & 255
    ];
  }

  // src/content.js
  var MESSAGE_GET_STATUS = "BA_CLICK_FX_GET_STATUS";
  var MESSAGE_PREVIEW = "BA_CLICK_FX_PREVIEW";
  var ROOT_ATTRIBUTE = "data-ba-click-fx-extension-root";
  var siteKey = getSiteKey(window.location.href);
  var currentSettings = normalizeSettings(DEFAULT_SETTINGS);
  var engine = null;
  var surface = null;
  var appliedSettings = null;
  var appliedMaxDpr = null;
  var appliedTrailRenderScale = null;
  var defaultTrailMaxShards = 38;
  var ready = false;
  function readSettings() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(DEFAULT_SETTINGS, (stored) => {
        const error = chrome.runtime.lastError;
        if (error) {
          reject(new Error(error.message));
          return;
        }
        resolve(normalizeSettings(stored));
      });
    });
  }
  function setImportantStyle(element, property, value) {
    element.style.setProperty(property, value, "important");
  }
  function createSurface() {
    const host = document.createElement("div");
    host.setAttribute(ROOT_ATTRIBUTE, "");
    host.setAttribute("aria-hidden", "true");
    setImportantStyle(host, "all", "initial");
    setImportantStyle(host, "position", "fixed");
    setImportantStyle(host, "inset", "0");
    setImportantStyle(host, "display", "block");
    setImportantStyle(host, "width", "100vw");
    setImportantStyle(host, "height", "100vh");
    setImportantStyle(host, "overflow", "hidden");
    setImportantStyle(host, "pointer-events", "none");
    setImportantStyle(host, "z-index", "2147483647");
    setImportantStyle(host, "contain", "strict");
    const shadowRoot = host.attachShadow({ mode: "closed" });
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    setImportantStyle(canvas, "position", "absolute");
    setImportantStyle(canvas, "inset", "0");
    setImportantStyle(canvas, "display", "block");
    setImportantStyle(canvas, "width", "100%");
    setImportantStyle(canvas, "height", "100%");
    setImportantStyle(canvas, "pointer-events", "none");
    setImportantStyle(canvas, "touch-action", "auto");
    shadowRoot.appendChild(canvas);
    const parent = document.documentElement || document.body;
    if (!parent) {
      throw new Error("页面尚未提供可挂载的根元素。");
    }
    parent.appendChild(host);
    return {
      host,
      canvas
    };
  }
  function applySettings(settings) {
    if (!engine) {
      return;
    }
    const quality = getQualityProfile(settings.quality);
    const effectiveMaxDpr = getEffectiveMaxDpr(
      settings.quality,
      window.innerWidth,
      window.innerHeight,
      window.screen?.availWidth || window.innerWidth,
      window.screen?.availHeight || window.innerHeight
    );
    const [red, green, blue] = hexToRgb(settings.color);
    if (!appliedSettings || appliedSettings.color !== settings.color) {
      engine.setColor(red, green, blue);
    }
    if (!appliedSettings || appliedSettings.opacity !== settings.opacity) {
      engine.setOpacity(settings.opacity);
    }
    if (!appliedSettings || appliedSettings.scale !== settings.scale) {
      engine.setScale(settings.scale);
    }
    if (!appliedSettings || appliedSettings.clickEnabled !== settings.clickEnabled) {
      engine.setClick(settings.clickEnabled);
    }
    if (!appliedSettings || appliedSettings.trailEnabled !== settings.trailEnabled) {
      engine.setTrail(settings.trailEnabled);
      engine.setMaxShards(settings.trailEnabled ? defaultTrailMaxShards : 0);
      if (!settings.trailEnabled) {
        engine.isDown = false;
        engine.clearTrail();
      }
    }
    const trailAlways = settings.trailEnabled && settings.trailAlways;
    const previousTrailAlways = appliedSettings ? appliedSettings.trailEnabled && appliedSettings.trailAlways : null;
    if (previousTrailAlways !== trailAlways) {
      engine.setTrailAlways(trailAlways);
    }
    if (appliedTrailRenderScale !== quality.trailRenderScale) {
      engine.setTrailRenderScale(quality.trailRenderScale);
    }
    if (appliedMaxDpr !== effectiveMaxDpr) {
      engine.setDpr(effectiveMaxDpr);
    }
    appliedSettings = settings;
    appliedMaxDpr = effectiveMaxDpr;
    appliedTrailRenderScale = quality.trailRenderScale;
  }
  function createEngine() {
    if (engine) {
      applySettings(currentSettings);
      return;
    }
    surface = createSurface();
    try {
      engine = new E({ target: surface.canvas });
      const initialConfig = engine.getConfig();
      defaultTrailMaxShards = initialConfig.trail.maxSparkParticles;
      appliedMaxDpr = initialConfig.maxDpr;
      appliedTrailRenderScale = initialConfig.trailRenderScale;
      applySettings(currentSettings);
      window.addEventListener("pointerdown", stopDisabledTrailInput, { passive: true });
    } catch (error) {
      if (engine) {
        engine.destroy();
        engine = null;
      }
      appliedSettings = null;
      appliedMaxDpr = null;
      appliedTrailRenderScale = null;
      surface.host.remove();
      surface = null;
      throw error;
    }
  }
  function stopDisabledTrailInput() {
    if (!engine || currentSettings.trailEnabled) {
      return;
    }
    engine.isDown = false;
    engine.clearTrail();
  }
  function destroyEngine() {
    window.removeEventListener("pointerdown", stopDisabledTrailInput);
    if (engine) {
      engine.destroy();
      engine = null;
    }
    appliedSettings = null;
    appliedMaxDpr = null;
    appliedTrailRenderScale = null;
    if (surface) {
      surface.host.remove();
      surface = null;
    }
  }
  function shouldEnable(settings) {
    return Boolean(
      siteKey && document.visibilityState !== "hidden" && settings.enabled && (settings.clickEnabled || settings.trailEnabled) && settings.disabledSites[siteKey] !== true
    );
  }
  function reconcile() {
    if (shouldEnable(currentSettings)) {
      createEngine();
    } else {
      destroyEngine();
    }
  }
  function reportError(error) {
    console.warn("[BA Click FX] 初始化失败：", error);
  }
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") {
      return;
    }
    const next = { ...currentSettings };
    for (const [key, change] of Object.entries(changes)) {
      if (Object.hasOwn(DEFAULT_SETTINGS, key)) {
        next[key] = change.newValue;
      }
    }
    currentSettings = normalizeSettings(next);
    try {
      reconcile();
    } catch (error) {
      reportError(error);
    }
  });
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === MESSAGE_GET_STATUS) {
      sendResponse(
        {
          ready,
          active: Boolean(engine),
          siteKey
        }
      );
      return;
    }
    if (message?.type === MESSAGE_PREVIEW) {
      if (engine && currentSettings.clickEnabled) {
        engine.boom();
        sendResponse({ ok: true });
      } else {
        sendResponse({ ok: false });
      }
    }
  });
  document.addEventListener("visibilitychange", () => {
    try {
      reconcile();
    } catch (error) {
      reportError(error);
    }
  });
  window.addEventListener("pageshow", () => {
    try {
      reconcile();
    } catch (error) {
      reportError(error);
    }
  });
  readSettings().then((settings) => {
    currentSettings = settings;
    reconcile();
    ready = true;
  }).catch(reportError);
})();
