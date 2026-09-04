// public/sylva.js
// Ultra-Performant WebGL Engine for Urban Vibes Interior (Production Safe)

setTimeout(() => {
  /* =====================================================================
     SECTION 1: Liquid Metal Shader Buttons (Production Optimized)
     ===================================================================== */
  (function () {
    'use strict';

    function mountLiquidMetal(host) {
      const hostWindow = globalThis;
      const document = {
        body: host,
        getElementById(id) {
          if (id === 'stage') return host;
          if (id === 'fx') return host.querySelector('.liquid-fx');
          if (id === 'btn') return host.querySelector('.liquid-button');
          return null;
        },
        querySelector(selector) { return host.querySelector(selector); }
      };

      const VERT = `#version 300 es
in vec2 position; void main(){ gl_Position = vec4(position,0.,1.); }`;

      const HEAD = `#version 300 es
precision highp float;
out vec4 o;

uniform vec2  uC;        
uniform vec2  uHalf;     
uniform float uT;        
uniform float uHover;    
uniform float uPress;    
uniform vec4  uRip[3];   
uniform vec4  uRipK;     
uniform vec4  uRipK2;    
uniform vec4  uPtr;      
uniform vec4  uPtrK;     

#define PI 3.14159265

float sdPill(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x,q.y),0.) + length(max(q,0.)) - r;
}

float ripple(vec2 p, float t){
  float sum = 0.;
  for(int i = 0; i < 3; i++){
    if(uRip[i].w < 0.5) continue;
    float age = t - uRip[i].z;
    if(age < 0. || age > 4.) continue;
    vec2  rp = p - uRip[i].xy;
    float facet = 1. + uRipK2.x * cos(uRipK2.y * atan(rp.y, rp.x) + age * 2.1 + float(i) * 2.4);
    float x = (length(rp) - age * uRipK.x * facet) / uRipK.y;
    sum += exp(-pow(abs(x) + 1e-4, uRipK2.z)) * exp(-age * uRipK.z);
  }
  return sum;
}

float pointerW(vec2 p){
  if(uPtr.z < 0.001) return 0.;
  float d = length(p - uPtr.xy) / uPtrK.x;
  return exp(-d*d) * uPtr.z;
}

vec2 pointerWarp(vec2 p){
  float w = pointerW(p);
  if(w <= 0.) return vec2(0.);
  return normalize(p - uPtr.xy + vec2(1e-5)) * w * (uPtrK.y + uPtrK.z * uPtr.w);
}
`;

      const FRAG_RIM = HEAD + `
uniform float uBw;
uniform float uE[8];

float perim(vec2 d, float a, float r){
  float P = 4.*a + 2.*PI*r;
  float s;
  if(d.x >= a){
    float th = atan(d.y, d.x - a); if(th < 0.) th += 2.*PI;
    s = (th <= PI*0.5) ? r*th : P - r*(2.*PI - th);
  } else if(d.x <= -a){
    float th = atan(d.y, d.x + a); if(th < 0.) th += 2.*PI;
    s = r*PI*0.5 + 2.*a + r*(th - PI*0.5);
  } else if(d.y >= 0.){
    s = r*PI*0.5 + (a - d.x);
  } else {
    s = r*PI*1.5 + 2.*a + (d.x + a);
  }
  return s / P;
}

float pb(float u, float w){ u = fract(u); float x = min(u, 1.-u); return exp(-(x*x)/(w*w)); }

float rimHot(float s, float t){
  float v = uE[0];
  v += 0.62 * pb(s - t*uE[4],             0.075);
  v += 0.44 * pb(s + t*uE[4]*0.63 + 0.41, 0.135);
  v += 0.30 * pb(s - t*uE[4]*0.34 + 0.73, 0.200);
  return v;
}

float rimBand(float sd, float off){ return 1. - smoothstep(0., uBw*1.05, abs(sd + uBw*0.55 + off)); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uHalf.y);
  if(sd > uBw*2.5 || sd < -uBw*3.5){ o = vec4(0.); return; }

  float a = max(uHalf.x - uHalf.y, 0.);
  float s = perim(d, a, uHalf.y);
  float top = mix(1., 0.5 + 0.5 * (d.y / uHalf.y), uE[5]);

  vec2  p   = vec2(d.x, -d.y) / (uHalf.y * 2.);
  float lift = 1. + uPress * uE[6] + ripple(p, uT) * uE[7] + pointerW(p) * uPtrK.w;

  o = vec4(vec3(
    rimBand(sd,  uE[2]) * rimHot(s + uE[3], uT),
    rimBand(sd,  0.   ) * rimHot(s,         uT),
    rimBand(sd, -uE[2]) * rimHot(s - uE[3], uT)
  ) * uE[1] * top * lift, 1.);
}`;

      const FRAG_SCENE = HEAD + `
uniform float uP[21];

float h21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  float a = h21(i), b = h21(i+vec2(1,0)), c = h21(i+vec2(0,1)), d = h21(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y) * 2. - 1.;
}
float fbm(vec2 p, float g){
  float s = 0., a = 1., n = 0.;
  for(int i=0;i<4;i++){ s += a*vn(p); n += a; p = p*2.03 + 11.7; a *= g; }
  return s / n;
}
float fbm(vec2 p){ return fbm(p, 0.5); }

float wig(float x, float t, float seed){
  return vn(vec2(x,          t*0.150 + seed)) * 0.60
       + vn(vec2(x*2.07 + 4., t*0.105 + seed)) * 0.27
       + vn(vec2(x*4.30 - 7., t*0.080 + seed)) * 0.13;
}

float valleyAt(vec2 p, float t){ return wig(p.x*uP[0], t, 0.0) * uP[1]; }
float densAt  (vec2 p, float t){ return uP[2] * exp(uP[3] * wig(p.x*uP[4] + 9.0, t, 2.7)); }

float surface(vec2 p, float t){
  float V = (p.y - valleyAt(p,t)) * densAt(p,t);
  V += uP[5] * fbm(p*vec2(0.8, 1.7)*uP[6] + vec2(t*0.05, -t*0.03), uP[17]);
  return V - uP[7];
}

float tone(float v){
  float u = fract(v);
  float e = uP[9], W = uP[10] * 0.5;
  return smoothstep(0.5-W-e, 0.5-W, u) * (1. - smoothstep(0.5+W, 0.5+W+e, u));
}
vec3 spec(float t){ return clamp(vec3(1.5) - abs(4.*t - vec3(3.,2.,1.)), 0., 1.); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uHalf.y);
  float pill = 1. - smoothstep(-1., 1., sd);
  float S = uHalf.y * 2.;
  float t = uT;

  if(uHover <= 0.0015 || pill <= 0.0015){ o = vec4(0., 0., 0., pill); return; }

  vec2  p = vec2(d.x, -d.y) / S;
  vec2  q = p + pointerWarp(p);

  float h0 = surface(q, t);
  vec2  gp = vec2(dFdx(h0), -dFdy(h0)) * S;
  float V  = surface(q - gp * uP[8] / max(uP[2], .001), t);

  vec2  gd = normalize(gp + vec2(1e-5));
  V += uP[13] * fbm(vec2(dot(q,gd)*uP[14], dot(q, vec2(-gd.y,gd.x))*uP[14]*0.04) + vec2(0., t*0.06));

  float rip  = ripple(p, t);
  float well = pointerW(p);
  V += rip * uRipK.w;

  const int N = 21;
  float mid = 1. - pow(0.5, uP[12]);
  vec3 col = vec3(0.), wsum = vec3(0.);
  for(int i=0;i<N;i++){
    float k = float(i)/float(N-1);
    vec3  w = spec(k);
    col   += w * tone(V + ((1. - pow(1. - k, uP[12])) - mid) * uP[11]);
    wsum += w;
  }
  col /= wsum;
  col = pow(col, vec3(uP[15]));

  float lit = smoothstep(uP[18], uP[19], q.y - valleyAt(q, t));
  lit *= mix(1., lit, 0.55);
  col *= uP[16] * lit;

  col = col * (1. + rip * 1.15 + well * 0.60);
  o = vec4(col * pill * uHover, pill);
}`;

      const FRAG_DOWN = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex, uTex2;
uniform vec2 uDstTexel;
uniform vec2 uSrcTexel;
uniform float uAdd;
void main(){
  vec2 uv = gl_FragCoord.xy * uDstTexel;
  vec2 e = uDstTexel * 0.25;
  vec4 s = texture(uTex, uv + vec2(-e.x,-e.y)) + texture(uTex, uv + vec2( e.x,-e.y))
         + texture(uTex, uv + vec2(-e.x, e.y)) + texture(uTex, uv + vec2( e.x, e.y));
  s *= 0.25;
  if(uAdd > 0.5){
    vec4 r = texture(uTex2, uv + vec2(-e.x,-e.y)) + texture(uTex2, uv + vec2( e.x,-e.y))
           + texture(uTex2, uv + vec2(-e.x, e.y)) + texture(uTex2, uv + vec2( e.x, e.y));
    s.rgb += r.rgb * 0.25;
  }
  o = s;
}`;

      const FRAG_BLUR = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex; uniform vec2 uTexel; uniform vec2 uDir; uniform float uR;
void main(){
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec2 st = uTexel * uDir * uR;
  vec4 s = texture(uTex, uv) * 0.1964;
  s += (texture(uTex, uv + st*1.4118) + texture(uTex, uv - st*1.4118)) * 0.2969;
  s += (texture(uTex, uv + st*3.2941) + texture(uTex, uv - st*3.2941)) * 0.0944;
  s += (texture(uTex, uv + st*5.1765) + texture(uTex, uv - st*5.1765)) * 0.0104;
  o = s;
}`;

      const FRAG_COMP = HEAD + `
uniform sampler2D uSoft, uRim, uGlow;
uniform vec2  uRes;
uniform float uGlowGain, uGlowIn, uOccl, uDim, uPunch;

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 glow = texture(uGlow, uv).rgb;

  vec2  d    = gl_FragCoord.xy - uC;
  float sd   = sdPill(d, uHalf, uHalf.y);
  float pill = 1. - smoothstep(-1., 1., sd);

  vec4 m = texture(uSoft, uv);
  float veil = 1. - smoothstep(0.46, 0.88, abs(d.y) / uHalf.y);
  vec3 metal = pow(max(m.rgb / max(m.a, 1e-3), 0.), vec3(uPunch));

  vec3 core = metal * pill * mix(1., uDim, veil) + texture(uRim, uv).rgb;

  float rip = ripple(vec2(d.x, -d.y) / (uHalf.y * 2.), uT);
  core += vec3(rip * rip) * uRipK2.w * pill * mix(1., 0.42, veil);

  float sdSh = sdPill(d + vec2(0., uHalf.y * 0.62), uHalf * 0.94, uHalf.y * 0.94);
  float occl = uOccl * exp(-max(sdSh, 0.) / (uHalf.y * 0.75));

  vec3 rgb = core + glow * uGlowGain * mix(1., uGlowIn, pill) * (1. - occl * (1. - pill));
  float a = clamp(max(rgb.r, max(rgb.g, rgb.b)), 0., 1.);
  o = vec4(min(rgb, vec3(1.)), a);
}`;

      const cv = document.getElementById('fx');
      if (!cv) return;
      const gl = cv.getContext('webgl2', {alpha:true, antialias:false, premultipliedAlpha:true, powerPreference:'high-performance'});
      const stage = document.getElementById('stage');
      const btn   = document.getElementById('btn');

      if (!gl) return;

      function sh(type, src){
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      }
      function prog(fs){
        const p = gl.createProgram();
        gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
        gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
        gl.bindAttribLocation(p, 0, 'position');
        gl.linkProgram(p);
        const u = {};
        const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for(let i=0;i<n;i++){ const info = gl.getActiveUniform(p,i); u[info.name.replace('[0]','')] = gl.getUniformLocation(p, info.name); }
        return {p, u};
      }
      const pScene = prog(FRAG_SCENE), pRim = prog(FRAG_RIM),
            pDown  = prog(FRAG_DOWN),  pBlur = prog(FRAG_BLUR), pComp = prog(FRAG_COMP);

      const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const hasFloat = !!gl.getExtension('EXT_color_buffer_half_float');
      function makeTarget(){
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        return {tex, fbo, w:0, h:0};
      }
      function sizeTarget(t, w, h){
        if(t.w === w && t.h === h) return;
        t.w = w; t.h = h;
        gl.bindTexture(gl.TEXTURE_2D, t.tex);
        if(hasFloat) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
        else         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8,   w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      }
      const T_core = makeTarget(), T_rim = makeTarget(), T_s1 = makeTarget(), T_s2 = makeTarget(), T_a = makeTarget(), T_b = makeTarget();

      let W = 0, H = 0, DPR = 1, BW = 0, BH = 0, CX = 0, CY = 0, DOWN = 4;
      const GLOW_TEX = 129;
      let needResize = true;

      function resize(){
        if(!stage || !btn) return;
        const r  = stage.getBoundingClientRect();
        const br = btn.getBoundingClientRect();
        DPR = 1.0; // Strictly cap DPR to 1.0 to save laptop GPU memory
        const w = Math.max(2, Math.round(r.width  * DPR));
        const h = Math.max(2, Math.round(r.height * DPR));
        if(w !== W || h !== H){ W = w; H = h; cv.width = W; cv.height = H; }
        BW = br.width  * DPR; BH = br.height * DPR;
        CX = (br.left - r.left) * DPR + BW/2;
        CY = H - ((br.top - r.top) * DPR + BH/2);
        sizeTarget(T_core, W, H); sizeTarget(T_rim, W, H);
        const hw = Math.max(2, Math.ceil(W/2)), hh = Math.max(2, Math.ceil(H/2));
        sizeTarget(T_s1, hw, hh); sizeTarget(T_s2, hw, hh);
        DOWN = Math.max(1, Math.min(4, Math.round(BH / GLOW_TEX)));
        const dw = Math.max(2, Math.ceil(W/DOWN)), dh = Math.max(2, Math.ceil(H/DOWN));
        sizeTarget(T_a, dw, dh); sizeTarget(T_b, dw, dh);
        needResize = false;
      }
      if(stage) new ResizeObserver(() => { needResize = true; }).observe(stage);

      function drawTo(t){
        gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fbo : null);
        gl.viewport(0, 0, t ? t.w : W, t ? t.h : H);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      const P = {
        valFreq: 0.50, valAmp: 0.55, dens: 2.40, densVar: 2.20, densFreq: 0.32,
        wobAmp: 0.12, wobFreq: 1.60, lift: 0.05, refract: 0.18, edge: 0.04,
        width: 0.46, disp: 0.30, skew: 1.50, fineAmp: 0.0, fineFreq: 9.0,
        gamma: 1.00, gain: 1.90, octGain: 0.32, litLo: -0.26, litHi: 0.10, dim: 0.44
      };
      const PKEYS = Object.keys(P);

      const E = { base: 0.20, hot: 0.82, chromA: 0.42, chromS: 0.030, speed: 0.070, top: 0.35, press: 0.85, ripple: 1.60 };
      const EKEYS = Object.keys(E);

      const C = {
        glow: host.dataset.liquidMetal === 'play' ? 1.28 : 1.95,
        glowR: host.dataset.liquidMetal === 'play' ? 0.94 : 1.30,
        glowIn: 0.30, occl: 0.62, soften: 0.24, punch: 1.50
      };

      const R = {
        speed: 1.85, width: 0.20, decay: 1.35, amp: 1.35, facet: 0.18, lobes: 6.0,
        sharp: 1.15, emit: 0.45, ptrRad: 0.55, ptrAmp: 0.32, ptrFast: 0.40, ptrRim: 0.80, ptrLag: 0.0016, ptrVref: 4.5
      };

      const uArr = new Float32Array(PKEYS.length);
      const eArr = new Float32Array(EKEYS.length);
      let hover = 0, hoverTarget = 0, clock = 0, last = performance.now();

      const RIP = [0,1,2].map(() => ({x:0, y:0, t:-99, on:0}));
      const ripArr = new Float32Array(12);
      let ripNext = 0, press = 0, pressTarget = 0;

      const ptr = {x:0, y:0}, ptrS = {x:0, y:0};
      let ptrAmt = 0, ptrSpeed = 0;

      const calm = matchMedia('(prefers-reduced-motion: reduce)');

      function frame(now){
        // PAUSE RENDER LOOP IF TAB IS INACTIVE OR NOT IN HERO VIEW
        if (globalThis.document.hidden) {
          requestAnimationFrame(frame);
          return;
        }

        const dtRaw = (now - last) / 1000; last = now;
        const dt = Math.min(dtRaw, 1/20);
        if(!calm.matches) clock += dt;

        const k = hoverTarget > hover ? 1 - Math.pow(0.0012, dt) : 1 - Math.pow(0.00012, dt);
        hover += (hoverTarget - hover) * k;
        if(Math.abs(hoverTarget - hover) < 0.0008) hover = hoverTarget;

        const pk = pressTarget > press ? 1 - Math.pow(1e-9, dt) : 1 - Math.pow(0.004, dt);
        press += (pressTarget - press) * pk;
        if(Math.abs(pressTarget - press) < 0.002) press = pressTarget;

        for(let i = 0; i < RIP.length; i++){
          const r = RIP[i];
          if(r.on && clock - r.t > 4) r.on = 0;
          ripArr[i*4] = r.x; ripArr[i*4+1] = r.y; ripArr[i*4+2] = r.t; ripArr[i*4+3] = r.on;
        }

        const lag = 1 - Math.pow(R.ptrLag, dt);
        const dx = (ptr.x - ptrS.x) * lag, dy = (ptr.y - ptrS.y) * lag;
        ptrS.x += dx; ptrS.y += dy;

        if(needResize) resize();

        for(let i = 0; i < uArr.length; i++) uArr[i] = P[PKEYS[i]];
        for(let i = 0; i < eArr.length; i++) eArr[i] = E[EKEYS[i]];
        const bw = Math.max(1.5, 3.2 * (BH/516));

        gl.useProgram(pScene.p);
        gl.uniform2f(pScene.u.uC, CX, CY);
        gl.uniform2f(pScene.u.uHalf, BW/2, BH/2);
        gl.uniform1f(pScene.u.uT, clock);
        gl.uniform1f(pScene.u.uHover, hover);
        gl.uniform1f(pScene.u.uPress, press);
        gl.uniform4fv(pScene.u.uRip, ripArr);
        gl.uniform4f(pScene.u.uRipK, R.speed, R.width, R.decay, R.amp);
        gl.uniform4f(pScene.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
        gl.uniform4f(pScene.u.uPtr, ptrS.x, ptrS.y, ptrAmt, ptrSpeed);
        gl.uniform4f(pScene.u.uPtrK, R.ptrRad, R.ptrAmp, R.ptrFast, R.ptrRim);
        gl.uniform1fv(pScene.u.uP, uArr);
        drawTo(T_core);

        gl.useProgram(pRim.p);
        gl.uniform2f(pRim.u.uC, CX, CY);
        gl.uniform2f(pRim.u.uHalf, BW/2, BH/2);
        gl.uniform1f(pRim.u.uT, clock);
        gl.uniform1f(pRim.u.uBw, bw);
        gl.uniform1f(pRim.u.uPress, press);
        gl.uniform4fv(pRim.u.uRip, ripArr);
        gl.uniform4f(pRim.u.uRipK, R.speed, R.width, R.decay, R.amp);
        gl.uniform4f(pRim.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
        gl.uniform4f(pRim.u.uPtr, ptrS.x, ptrS.y, ptrAmt, ptrSpeed);
        gl.uniform4f(pRim.u.uPtrK, R.ptrRad, R.ptrAmp, R.ptrFast, R.ptrRim);
        gl.uniform1fv(pRim.u.uE, eArr);
        drawTo(T_rim);

        gl.useProgram(pDown.p);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T_core.tex);
        gl.uniform1i(pDown.u.uTex, 0);
        gl.uniform1f(pDown.u.uAdd, 0);
        gl.uniform2f(pDown.u.uDstTexel, 1/T_s1.w, 1/T_s1.h);
        gl.uniform2f(pDown.u.uSrcTexel, 1/W, 1/H);
        drawTo(T_s1);

        gl.useProgram(pBlur.p);
        gl.uniform1i(pBlur.u.uTex, 0);
        gl.uniform2f(pBlur.u.uTexel, 1/T_s1.w, 1/T_s1.h);
        const sigTex = C.soften * (BH * 0.5) * 0.95;
        if(sigTex > 0.1){
          const iters = Math.min(4, Math.max(1, Math.ceil(sigTex / 3.0)));
          gl.uniform1f(pBlur.u.uR, sigTex / Math.sqrt(iters) / 1.95);
          for(let i = 0; i < iters; i++){
            gl.bindTexture(gl.TEXTURE_2D, T_s1.tex); gl.uniform2f(pBlur.u.uDir, 1, 0); drawTo(T_s2);
            gl.bindTexture(gl.TEXTURE_2D, T_s2.tex); gl.uniform2f(pBlur.u.uDir, 0, 1); drawTo(T_s1);
          }
        }

        gl.useProgram(pDown.p);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T_s1.tex);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T_rim.tex);
        gl.uniform1i(pDown.u.uTex, 0); gl.uniform1i(pDown.u.uTex2, 1); gl.uniform1f(pDown.u.uAdd, 1);
        gl.uniform2f(pDown.u.uDstTexel, 1/T_a.w, 1/T_a.h);
        gl.uniform2f(pDown.u.uSrcTexel, 1/T_s1.w, 1/T_s1.h);
        drawTo(T_a);

        gl.useProgram(pBlur.p);
        gl.activeTexture(gl.TEXTURE0); gl.uniform1i(pBlur.u.uTex, 0);
        gl.uniform2f(pBlur.u.uTexel, 1/T_a.w, 1/T_a.h);
        const rs = C.glowR * (BH / DOWN) / GLOW_TEX;
        for(const r of [1.0, 2.3, 5.2, 9.0].map(v => v * rs)){
          gl.uniform1f(pBlur.u.uR, r);
          gl.bindTexture(gl.TEXTURE_2D, T_a.tex); gl.uniform2f(pBlur.u.uDir, 1, 0); drawTo(T_b);
          gl.bindTexture(gl.TEXTURE_2D, T_b.tex); gl.uniform2f(pBlur.u.uDir, 0, 1); drawTo(T_a);
        }

        gl.useProgram(pComp.p);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T_s1.tex); gl.uniform1i(pComp.u.uSoft, 0);
        gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T_rim.tex);  gl.uniform1i(pComp.u.uRim, 1);
        gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, T_a.tex);    gl.uniform1i(pComp.u.uGlow, 2);
        gl.uniform2f(pComp.u.uRes, W, H); gl.uniform2f(pComp.u.uC, CX, CY); gl.uniform2f(pComp.u.uHalf, BW/2, BH/2);
        gl.uniform1f(pComp.u.uT, clock); gl.uniform4fv(pComp.u.uRip, ripArr);
        gl.uniform4f(pComp.u.uRipK, R.speed, R.width, R.decay, R.amp);
        gl.uniform4f(pComp.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
        gl.uniform1f(pComp.u.uGlowGain, C.glow); gl.uniform1f(pComp.u.uGlowIn, C.glowIn);
        gl.uniform1f(pComp.u.uOccl, C.occl); gl.uniform1f(pComp.u.uDim, P.dim); gl.uniform1f(pComp.u.uPunch, C.punch);
        drawTo(null);

        requestAnimationFrame(frame);
      }

      resize();
      requestAnimationFrame(frame);
    }

    const hosts = globalThis.document.querySelectorAll('[data-liquid-metal]');
    for (let i = 0; i < hosts.length; i++) mountLiquidMetal(hosts[i]);
  })();

  /* =====================================================================
     SECTION 2: Three.js Moss Root Engine & Interactive Scene (Safe)
     ===================================================================== */
  (function () {
    'use strict';

    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pointer = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
    var heroEl = document.getElementById('hero');
    var lastX = null, lastY = null;
    var ticking = false, parOn = false;

    function startTick() {
      if (ticking) return;
      ticking = true;
      (function loop() { requestAnimationFrame(loop); tick(); })();
    }

    var lastTick = 0;
    function tick() {
      // AUTO-PAUSE IF BROWSER TAB IS HIDDEN OR NOT ON HOME PAGE
      if (document.hidden || !heroEl || heroEl.offsetHeight === 0) {
        return;
      }

      var now = performance.now();
      var dtUI = lastTick ? Math.min((now - lastTick) / 1000, 0.05) : 0.016;
      lastTick = now;

      if (renderer && clock) renderFrame();
    }

    var canvas   = document.getElementById('scene');
    var hero     = document.getElementById('hero');

    var ARCH   = { w: 1900, left: -180, top: 306, aspect: 2800 / 1377 };
    var ARCH_N = { w: 1120, left: -290, top: 555, aspect: 2800 / 1377 };
    var FAR    = { w: 1150, left:  -40, top: 320, aspect: 1600 /  757, z: -260 };
    var FAR_N  = { w:  780, left: -110, top: 600, aspect: 1600 /  757, z: -260 };

    var renderer, scene, camera;
    var nearGroup, farGroup, motes, shadowMesh, glowMesh;
    var W = 1, H = 1, DIST = 1400;
    var clock = null;
    var readyStarted = false;

    function ready() {
      if (readyStarted) return;
      readyStarted = true;
      document.body.classList.add('is-ready');
      startTick();
    }

    var ndc = { x: 10, y: 10 };
    if (!window.THREE || !canvas) { ready(); return; }

    var rng = (function () {
      var a = 0x3f9a1c7b;
      return function () {
        a |= 0; a = (a + 0x6d2b79f5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();
    function rand(lo, hi) { return lo + (hi - lo) * rng(); }
    function sstep(a, b, x) { var t = Math.min(Math.max((x - a) / (b - a), 0), 1); return t * t * (3 - 2 * t); }
    function clamp01(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }

    function hash2(x, y) {
      var n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263);
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
    }
    function vnoise(x, y) {
      var ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
      var ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      var a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
      var t = a + (b - a) * ux;
      return t + ((c + (d - c) * ux) - t) * uy;
    }
    function fbm2(x, y) {
      var s = 0, amp = 0.5, nx, ny;
      for (var i = 0; i < 4; i++) {
        s += amp * vnoise(x, y);
        nx = 0.80 * x + 0.60 * y; ny = -0.60 * x + 0.80 * y;
        x = nx * 2.07 + 3.1; y = ny * 2.07 - 1.7; amp *= 0.5;
      }
      return s / 0.9375;
    }

    var UP = new THREE.Vector3(0, 1, 0);
    var TAU = Math.PI * 2;
    var BOXW = 10;

    function makeP(aspect) {
      var bh = BOXW / aspect;
      return function (fx, fy, z) {
        return new THREE.Vector3((fx - 0.5) * BOXW, (0.5 - fy) * bh, z || 0);
      };
    }

    function transportFrames(curve, segs) {
      var pts = [], tans = [], nrms = [], i;
      for (i = 0; i <= segs; i++) {
        pts.push(curve.getPointAt(i / segs));
        tans.push(curve.getTangentAt(i / segs).normalize());
      }
      var ref = Math.abs(tans[0].y) < 0.9 ? UP : new THREE.Vector3(1, 0, 0);
      nrms.push(new THREE.Vector3().crossVectors(tans[0], ref).normalize());
      for (i = 1; i <= segs; i++) {
        var axis = new THREE.Vector3().crossVectors(tans[i - 1], tans[i]);
        var n = nrms[i - 1].clone();
        if (axis.lengthSq() > 1e-12) {
          axis.normalize();
          n.applyAxisAngle(axis, Math.acos(Math.min(1, Math.max(-1, tans[i - 1].dot(tans[i])))));
        }
        nrms.push(n.normalize());
      }
      return { pts: pts, tans: tans, nrms: nrms };
    }

    function mossCap(p, n, steep) {
      var upness = n.y + n.z * (0.10 + 0.42 * steep) - n.x * (0.05 + 0.45 * steep);
      var fray = fbm2(p.x * 2.30 + 4.4, p.z * 2.30 - p.y * 1.90) - 0.5;
      var tongue = fbm2(p.x * 0.95 + 21.0, p.z * 0.95 - p.y * 0.80) - 0.5;
      var patch = fbm2(p.x * 0.52 + 9.3, p.z * 0.52 + p.y * 0.44);
      var c = sstep(0.16, 0.70, upness + fray * 0.40 + tongue * 0.52);
      return c * sstep(0.10, 0.50, patch);
    }
    function mossLump(p) {
      return 0.66 + 0.48 * fbm2(p.x * 2.4 - 2.2, p.z * 2.4 + p.y * 2.0) + 0.18 * fbm2(p.x * 7.3 + 5.1, p.z * 7.3 - p.y * 4.4) - 0.09;
    }

    function table(vals) {
      return function (t) {
        var x = clamp01(t) * (vals.length - 1);
        var i = Math.min(vals.length - 2, Math.floor(x));
        return vals[i] + (vals[i + 1] - vals[i]) * (x - i);
      };
    }

    function makeLimb(P, pts, opt) {
      var v3 = pts.map(function (q) { return P(q[0], q[1], q[2]); });
      var curve = new THREE.CatmullRomCurve3(v3, false, 'centripetal', 0.5);
      var rw = opt.rw, moss = opt.moss;
      if (opt.rt) {
        var rt = table(opt.rt);
        rw = function (t) { return rt(t) * 0.52 * knot(t, 0.05, 0.024); };
        moss = function (t) { return rt(t) * 0.88; };
      }
      return {
        curve: curve, segs: opt.segs, radial: opt.radial, rw: rw, moss: moss,
        blade: opt.blade || function (t) { return moss(t) * 0.055 + 0.014; },
        sink: opt.sink || 0, vScale: opt.vScale, fr: transportFrames(curve, opt.segs), len: curve.getLength()
      };
    }

    var _fp = new THREE.Vector3(), _ft = new THREE.Vector3(), _fn = new THREE.Vector3(), _fb = new THREE.Vector3();
    function limbFrame(L, t) {
      var f = clamp01(t) * L.segs;
      var i = Math.min(L.segs - 1, Math.floor(f)), a = f - i;
      _fp.copy(L.fr.pts[i]).lerp(L.fr.pts[i + 1], a);
      if (L.sink) _fp.y -= L.moss(t) * L.sink;
      _ft.copy(L.fr.tans[i]).lerp(L.fr.tans[i + 1], a).normalize();
      _fn.copy(L.fr.nrms[i]).lerp(L.fr.nrms[i + 1], a);
      _fn.addScaledVector(_ft, -_fn.dot(_ft)).normalize();
      _fb.crossVectors(_ft, _fn).normalize();
    }

    function limbSurface(L, t, th, outP, outN) {
      limbFrame(L, t);
      var steep = Math.min(1, Math.abs(_ft.y) * 1.15);
      var c = Math.cos(th), s = Math.sin(th);
      outN.set(_fn.x * c + _fb.x * s, _fn.y * c + _fb.y * s, _fn.z * c + _fb.z * s).normalize();
      var rw = L.rw(t);
      outP.copy(_fp).addScaledVector(outN, rw);
      var cap = mossCap(outP, outN, steep);
      var d = rw + L.moss(t) * cap * mossLump(outP);
      outP.copy(_fp).addScaledVector(outN, d);
      return cap;
    }

    function tessellate(L, bag) {
      var S = L.segs, R = L.radial;
      var base = bag.pos.length / 3;
      var grid = new Float32Array((S + 1) * (R + 1) * 3);
      var gnrm = new Float32Array((S + 1) * (R + 1) * 3);
      var caps = new Float32Array((S + 1) * (R + 1));
      var p = new THREE.Vector3(), n = new THREE.Vector3();
      var i, j, k;

      for (i = 0; i <= S; i++) {
        for (j = 0; j <= R; j++) {
          var cap = limbSurface(L, i / S, (j / R) * TAU, p, n);
          k = (i * (R + 1) + j) * 3;
          grid[k] = p.x; grid[k + 1] = p.y; grid[k + 2] = p.z;
          caps[i * (R + 1) + j] = cap;
        }
      }

      var a = new THREE.Vector3(), b = new THREE.Vector3(), du = new THREE.Vector3(), dv = new THREE.Vector3();
      function get(i2, j2, out) {
        i2 = Math.min(S, Math.max(0, i2)); j2 = (j2 + R) % R;
        var q = (i2 * (R + 1) + j2) * 3;
        return out.set(grid[q], grid[q + 1], grid[q + 2]);
      }

      for (i = 0; i <= S; i++) {
        for (j = 0; j <= R; j++) {
          get(i + 1, j, a); get(i - 1, j, b); du.subVectors(a, b);
          get(i, j + 1, a); get(i, j - 1, b); dv.subVectors(a, b);
          n.crossVectors(dv, du);
          if (n.lengthSq() < 1e-12) { limbSurface(L, i / S, (j / R) * TAU, p, n); } else n.normalize();
          k = (i * (R + 1) + j) * 3;
          bag.pos.push(grid[k], grid[k + 1], grid[k + 2]);
          bag.nor.push(n.x, n.y, n.z);
          bag.inf.push(1 - Math.abs(2 * (j / R) - 1), (i / S) * L.vScale, caps[i * (R + 1) + j]);
          gnrm[k] = n.x; gnrm[k + 1] = n.y; gnrm[k + 2] = n.z;
        }
      }
      for (i = 0; i < S; i++) for (j = 0; j < R; j++) {
        var q0 = base + i * (R + 1) + j, q1 = q0 + R + 1;
        bag.idx.push(q0, q1, q0 + 1, q1, q1 + 1, q0 + 1);
      }
      L.grid = grid; L.gnrm = gnrm; L.gcaps = caps; L.S = S; L.R = R;
    }

    function plantBlades(L, count, bag) {
      var S = L.S, R = L.R, grid = L.grid, gn = L.gnrm, caps = L.gcaps;
      if (!grid) return 0;
      var cells = S * R, cdf = new Float64Array(cells), total = 0;
      var ax, ay, az, bx, by, bz, cx, cy, cz, i, j;

      for (i = 0; i < S; i++) for (j = 0; j < R; j++) {
        var q00 = (i * (R + 1) + j) * 3, q10 = q00 + 3, q01 = ((i + 1) * (R + 1) + j) * 3;
        ax = grid[q10] - grid[q00]; ay = grid[q10 + 1] - grid[q00 + 1]; az = grid[q10 + 2] - grid[q00 + 2];
        bx = grid[q01] - grid[q00]; by = grid[q01 + 1] - grid[q00 + 1]; bz = grid[q01 + 2] - grid[q00 + 2];
        cx = ay * bz - az * by; cy = az * bx - ax * bz; cz = ax * by - ay * bx;
        var area = Math.sqrt(cx * cx + cy * cy + cz * cz);
        var cap = 0.25 * (caps[i * (R + 1) + j] + caps[i * (R + 1) + j + 1] + caps[(i + 1) * (R + 1) + j] + caps[(i + 1) * (R + 1) + j + 1]);
        total += area * cap * cap;
        cdf[i * R + j] = total;
      }
      if (total <= 0) return 0;

      var planted = 0;
      for (var b = 0; b < count; b++) {
        var target = rng() * total, lo = 0, hi = cells - 1;
        while (lo < hi) { var mid = (lo + hi) >> 1; if (cdf[mid] < target) lo = mid + 1; else hi = mid; }
        i = (lo / R) | 0; j = lo - i * R;
        var u = rng(), v = rng();

        var i0 = i * (R + 1) + j, i1 = i0 + 1, i2 = i0 + R + 1, i3 = i2 + 1;
        var w0 = (1 - u) * (1 - v), w1 = u * (1 - v), w2 = (1 - u) * v, w3 = u * v;
        var cap2 = caps[i0] * w0 + caps[i1] * w1 + caps[i2] * w2 + caps[i3] * w3;
        if (cap2 < 0.05) continue;

        var p0 = i0 * 3, p1 = i1 * 3, p2 = i2 * 3, p3 = i3 * 3;
        var px = grid[p0] * w0 + grid[p1] * w1 + grid[p2] * w2 + grid[p3] * w3;
        var py = grid[p0 + 1] * w0 + grid[p1 + 1] * w1 + grid[p2 + 1] * w2 + grid[p3 + 1] * w3;
        var pz = grid[p0 + 2] * w0 + grid[p1 + 2] * w1 + grid[p2 + 2] * w2 + grid[p3 + 2] * w3;
        var nx = gn[p0] * w0 + gn[p1] * w1 + gn[p2] * w2 + gn[p3] * w3;
        var ny = gn[p0 + 1] * w0 + gn[p1 + 1] * w1 + gn[p2 + 1] * w2 + gn[p3 + 1] * w3;
        var nz = gn[p0 + 2] * w0 + gn[p1 + 2] * w1 + gn[p2 + 2] * w2 + gn[p3 + 2] * w3;
        var nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

        bag.off.push(px, py, pz);
        bag.nrm.push(nx / nl, ny / nl, nz / nl);
        var stray = rng() < 0.06 ? rand(1.4, 1.9) : 1.0;
        bag.rnd.push(
          rng() * TAU,
          L.blade((i + v) / S) * (0.45 + 0.60 * cap2) * (0.58 + 0.50 * rng()) * stray,
          (rng() - 0.5) * 1.15, rng()
        );
        bag.aux.push(fbm2(px * 0.85 + 17.0, pz * 0.85 - py * 0.7) * 0.62 + fbm2(px * 5.60 - 3.3, pz * 5.60 + py * 2.1) * 0.38);
        planted++;
      }
      return planted;
    }

    var knot = function (t, a, b) {
      return 1 + a * Math.sin(t * 23.0 + 1.3) + b * Math.sin(t * 57.0 + 0.4) + b * 0.5 * Math.sin(t * 103.0 + 2.2);
    };

    function buildNearRoot() {
      var P = makeP(ARCH.aspect);
      var limbs = [];

      limbs.push(makeLimb(P, [
        [-0.075, 0.845, -0.62], [ 0.000, 0.790, -0.38], [ 0.107, 0.695,  0.04], [ 0.196, 0.588,  0.28],
        [ 0.250, 0.566,  0.34], [ 0.304, 0.603,  0.22], [ 0.411, 0.733, -0.10], [ 0.500, 0.779, -0.28],
        [ 0.585, 0.742, -0.05], [ 0.696, 0.661,  0.20], [ 0.750, 0.672,  0.14], [ 0.850, 0.640, -0.08],
        [ 0.930, 0.626, -0.30], [ 1.030, 0.634, -0.55], [ 1.090, 0.638, -0.70]
      ], {
        segs: 200, radial: 18, vScale: 30,
        rt: [0.575, 0.590, 0.630, 0.680, 0.695, 0.615, 0.580, 0.480, 0.550, 0.550, 0.520], sink: 0.5
      }));

      return limbs;
    }

    function buildFarRoot() {
      var P = makeP(FAR.aspect);
      return [makeLimb(P, [
        [-0.060, 0.880, -0.35], [ 0.100, 0.762, -0.05], [ 0.210, 0.698,  0.22], [ 0.300, 0.570,  0.30],
        [ 0.410, 0.467,  0.18], [ 0.500, 0.500, -0.05], [ 0.600, 0.622, -0.22], [ 0.720, 0.748, -0.26]
      ], {
        segs: 120, radial: 14, vScale: 26,
        rt: [0.760, 0.900, 0.900, 0.960, 0.925, 0.950, 1.020, 1.020], sink: 0.5
      })];
    }

    var LIGHT_GLSL = [
      'uniform vec3 uKeyDir, uKeyCol, uFillDir, uFillCol, uAmbCol, uHazeCol;',
      'uniform float uHaze, uFog, uMaskOn, uHazeLift;',
      'uniform vec4 uMask;',
      'vec3 litSurface(vec3 N, vec3 albedo, float ao){',
      '  float k = max(dot(N, uKeyDir), 0.0);',
      '  float f = max(dot(N, uFillDir), 0.0);',
      '  float sky = 0.5 + 0.5 * N.y;',
      '  return albedo * (uKeyCol * (0.09 + 1.05 * k) + uFillCol * (0.04 + 0.34 * f) + uAmbCol * (0.35 + 0.65 * sky)) * ao;',
      '}',
      'vec3 aerial(vec3 c, float h){',
      '  float amt = clamp(uFog + uHaze * smoothstep(0.05, 0.95, h), 0.0, 1.0);',
      '  return mix(c, uHazeCol, amt);',
      '}',
      'float maskAt(vec3 lp, float boxH){ return 1.0; }'
    ].join('\n');

    var NOISE_GLSL = [
      'vec2 hash22(vec2 p){',
      '  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));',
      '  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);',
      '}',
      'float gnoise(vec2 p){',
      '  vec2 i = floor(p), f = fract(p);',
      '  vec2 u = f * f * (3.0 - 2.0 * f);',
      '  return mix(mix(dot(hash22(i + vec2(0,0)), f - vec2(0,0)),',
      '                 dot(hash22(i + vec2(1,0)), f - vec2(1,0)), u.x),',
      '             mix(dot(hash22(i + vec2(0,1)), f - vec2(0,1)),',
      '                 dot(hash22(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);',
      '}',
      'const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);',
      'float gfbm(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 3; i++){ s += a * gnoise(p); p = ROT * p * 2.03; a *= 0.5; } return s; }',
      'float ridged(vec2 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 2; i++){ s += a * (1.0 - abs(gnoise(p) * 2.0)); p = ROT * p * 2.11; a *= 0.5; } return s; }'
    ].join('\n');

    var WIND_GLSL = [
      'uniform float uTime;',
      'uniform float uWind;',
      'vec3 windOffset(vec3 p){',
      '  float ph = p.x * 0.42 + p.y * 0.30;',
      '  return vec3(sin(uTime * 0.58 + ph) * 0.020 * uWind, 0.0, 0.0);',
      '}'
    ].join('\n');

    function barkMaterial(cfg) {
      return new THREE.ShaderMaterial({
        uniforms: cfg.uniforms,
        vertexShader: WIND_GLSL + [
          'attribute vec3 inf;',
          'varying vec3 vN; varying vec3 vW; varying vec3 vInf; varying float vH; varying vec3 vL;',
          'uniform float uBoxH;',
          'void main(){',
          '  vInf = inf;',
          '  vN = normalize(normal);',
          '  vec3 p = position + windOffset(position);',
          '  vL = p;',
          '  vH = clamp(p.y / uBoxH + 0.5, 0.0, 1.0);',
          '  vec4 wp = modelMatrix * vec4(p, 1.0);',
          '  vW = wp.xyz;',
          '  gl_Position = projectionMatrix * viewMatrix * wp;',
          '}'
        ].join('\n'),
        fragmentShader: NOISE_GLSL + LIGHT_GLSL + [
          'precision highp float;',
          'uniform float uAlpha; uniform float uBoxH;',
          'varying vec3 vN; varying vec3 vW; varying vec3 vInf; varying float vH; varying vec3 vL;',
          'void main(){',
          '  vec2 uv = vInf.xy;',
          '  float cap = vInf.z;',
          '  float m = smoothstep(0.05, 0.42, cap);',
          '  vec3 N = normalize(vN);',
          '  vec3 wood = vec3(0.18, 0.15, 0.12);',
          '  vec3 moss = vec3(0.09, 0.14, 0.02);',
          '  vec3 col = mix(wood, moss, m);',
          '  vec3 lit = litSurface(N, col, 1.0);',
          '  gl_FragColor = vec4(aerial(lit, vH), uAlpha);',
          '  #include <tonemapping_fragment>',
          '  #include <encodings_fragment>',
          '}'
        ].join('\n'),
        transparent: cfg.transparent === true, depthWrite: true, side: THREE.DoubleSide
      });
    }

    function grassMaterial(cfg) {
      return new THREE.ShaderMaterial({
        uniforms: cfg.uniforms, side: THREE.DoubleSide, transparent: cfg.transparent === true, depthWrite: true,
        vertexShader: WIND_GLSL + [
          'attribute vec3 offset;',
          'attribute vec3 nrm;',
          'attribute vec4 rnd;',
          'attribute float aux;',
          'uniform float uBoxH;',
          'varying float vT; varying vec3 vN; varying vec3 vW; varying float vH;',
          'void main(){',
          '  float t = uv.y; vT = t;',
          '  float len = rnd.y;',
          '  vec3 world = offset + windOffset(offset) + nrm * (t * len);',
          '  vN = nrm;',
          '  vH = clamp(world.y / uBoxH + 0.5, 0.0, 1.0);',
          '  vec4 wp = modelMatrix * vec4(world, 1.0);',
          '  vW = wp.xyz;',
          '  gl_Position = projectionMatrix * viewMatrix * wp;',
          '}'
        ].join('\n'),
        fragmentShader: LIGHT_GLSL + [
          'precision highp float;',
          'uniform float uAlpha; uniform float uBoxH;',
          'varying float vT; varying vec3 vN; varying vec3 vW; varying float vH;',
          'void main(){',
          '  vec3 col = mix(vec3(0.02, 0.03, 0.01), vec3(0.12, 0.18, 0.03), vT);',
          '  vec3 lit = litSurface(normalize(vN), col, 1.0);',
          '  gl_FragColor = vec4(aerial(lit, vH), uAlpha);',
          '  #include <tonemapping_fragment>',
          '  #include <encodings_fragment>',
          '}'
        ].join('\n')
      });
    }

    function bladeGeometry() {
      var SEGS = 2, verts = [], uvs = [], idx = [], i;
      for (i = 0; i <= SEGS; i++) {
        var t = i / SEGS, w = 0.5 * (1 - t * t);
        verts.push(-w, t, 0, w, t, 0); uvs.push(0, t, 1, t);
      }
      for (i = 0; i < SEGS; i++) {
        var a = i * 2, b = a + 1, c = a + 2, d = a + 3;
        idx.push(a, b, c, b, d, c);
      }
      var g = new THREE.InstancedBufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      g.setIndex(idx);
      return g;
    }

    function assembleRoot(limbs, opt) {
      var group = new THREE.Group();
      var uni = {
        uTime: uTime, uWind: uWind,
        uKeyDir:   { value: new THREE.Vector3(-0.3, 0.9, 0.3).normalize() },
        uKeyCol:   { value: new THREE.Color(1.1, 1.0, 0.8) },
        uFillDir:  { value: new THREE.Vector3(0.1, -0.8, 0.5).normalize() },
        uFillCol:  { value: new THREE.Color(0.7, 0.7, 0.6) },
        uAmbCol:   { value: new THREE.Color(0.1, 0.1, 0.1) },
        uHazeCol:  { value: new THREE.Color(0.17, 0.19, 0.14) },
        uHaze:     { value: 0.1 },
        uFog:      { value: 0.0 },
        uAlpha:    { value: 1.0 },
        uBoxH:     { value: BOXW / opt.aspect }
      };

      var bag = { pos: [], nor: [], inf: [], idx: [] };
      for (var i = 0; i < limbs.length; i++) tessellate(limbs[i], bag);
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(bag.pos, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(bag.nor, 3));
      geo.setAttribute('inf', new THREE.Float32BufferAttribute(bag.inf, 3));
      geo.setIndex(bag.idx);
      var shell = new THREE.Mesh(geo, barkMaterial({ uniforms: uni, transparent: false, depthWrite: true }));
      shell.frustumCulled = false;
      group.add(shell);

      var fur = { off: [], nrm: [], rnd: [], aux: [] };
      var total = 0;
      for (i = 0; i < limbs.length; i++) total += limbs[i].len;
      for (i = 0; i < limbs.length; i++) { plantBlades(limbs[i], Math.round(opt.blades * limbs[i].len / total), fur); }
      var bg = bladeGeometry();
      bg.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(fur.off), 3));
      bg.setAttribute('nrm',    new THREE.InstancedBufferAttribute(new Float32Array(fur.nrm), 3));
      bg.setAttribute('rnd',    new THREE.InstancedBufferAttribute(new Float32Array(fur.rnd), 4));
      bg.setAttribute('aux',    new THREE.InstancedBufferAttribute(new Float32Array(fur.aux), 1));
      bg.instanceCount = fur.off.length / 3;
      var grass = new THREE.Mesh(bg, grassMaterial({ uniforms: uni, transparent: false, depthWrite: true }));
      grass.frustumCulled = false;
      group.add(grass);

      for (i = 0; i < limbs.length; i++) { limbs[i].grid = limbs[i].gnrm = limbs[i].gcaps = null; }
      return group;
    }

    function build() {
      // PRODUCTION PROFILES: Cap pixels to 1.0 DPR and lower blade density to eliminate lag on Retina/4K laptops
      var isMobile = window.innerWidth < 768;
      var BLADES_NEAR = isMobile ? 2500 : 8000;
      var BLADES_FAR  = isMobile ? 600  : 2000;

      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
      renderer.setClearColor(0x000000, 0);
      
      // STRICT DPR CAP AT 1.0 FOR MAXIMUM GPU EFFICIENCY
      renderer.setPixelRatio(1.0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.20;

      // Handle WebGL Context Lost gracefully (prevents browser tab crashes)
      canvas.addEventListener('webglcontextlost', function (event) {
        event.preventDefault();
        if (renderer) renderer.dispose();
      }, false);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, 1, 10, 8000);
      camera.position.set(0, 0, DIST);

      nearGroup = assembleRoot(buildNearRoot(), { aspect: ARCH.aspect, blades: BLADES_NEAR });
      scene.add(nearGroup);

      farGroup = assembleRoot(buildFarRoot(), { aspect: FAR.aspect, blades: BLADES_FAR });
      scene.add(farGroup);

      layout();
      window.addEventListener('resize', layout);
      clock = new THREE.Clock();

      renderFrame();
      startTick();
    }

    function layout() {
      if (!hero || !stageEl || !camera) return;
      W = hero.clientWidth; H = hero.clientHeight;
      if (W === 0 || H === 0) return;
      
      renderer.setSize(W, H, false);
      camera.fov = 2 * Math.atan((H / 2) / DIST) * 180 / Math.PI;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();

      var narrow = window.innerWidth < 900;
      var A = narrow ? ARCH_N : ARCH, F = narrow ? FAR_N : FAR;

      function place(group, box, pinFx, pinFy, z) {
        var scale = (box.w * (W / 1600)) / BOXW;
        group.scale.setScalar(scale);
        group.position.set(0, 0, z);
      }

      place(nearGroup, A, 0.732, 0.06, 0);
      place(farGroup,  F, 0.410, 0.32, F.z);
    }

    var uTime = { value: 0 };
    var uWind = { value: 1.0 };

    function renderFrame() {
      var dt = Math.min(clock.getDelta(), 0.033);
      uTime.value += dt;

      renderer.render(scene, camera);
      if (!readyStarted) ready();
    }

    ready();
    requestAnimationFrame(function () {
      try { build(); } catch (err) { console.error(err); }
    });

  })();

}, 50);
