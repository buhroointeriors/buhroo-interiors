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
  } else if(d.y >= 0 me){
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
        DPR = 1.0;
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

      const calm = matchMedia('(prefers-reduced-motion: reduce)');

      function frame(now){
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

        for(let i = 0; i < RIP.length; i++){
          const r = RIP[i];
          if(r.on && clock - r.t > 4) r.on = 0;
          ripArr[i*4] = r.x; ripArr[i*4+1] = r.y; ripArr[i*4+2] = r.t; ripArr[i*4+3] = r.on;
        }

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

    var canvas   = document.getElementById('scene');
    var hero     = document.getElementById('hero');
    var stageEl  = document.getElementById('stage');

    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ticking = false;

    function startTick() {
      if (ticking) return;
      ticking = true;
      (function loop() { requestAnimationFrame(loop); tick(); })();
    }

    function tick() {
      // SAFELY PAUSE ANIMATION LOOP IF HERO ELEMENT IS NOT DISPLAYED
      if (document.hidden || !hero || hero.offsetHeight === 0) {
        return;
      }
      if (renderer && clock) renderFrame();
    }

    var ARCH   = { w: 1900, left: -180, top: 306, aspect: 2800 / 1377 };
    var ARCH_N = { w: 1120, left: -290, top: 555, aspect: 2800 / 1377 };
    var FAR    = { w: 1150, left:  -40, top: 320, aspect: 1600 /  757, z: -260 };
    var FAR_N  = { w:  780, left: -110, top: 600, aspect: 1600 /  757, z: -260 };

    var renderer, scene, camera;
    var nearGroup, farGroup;
    var W = 1, H = 1, DIST = 1400;
    var clock = null;
    var readyStarted = false;

    function ready() {
      if (readyStarted) return;
      readyStarted = true;
      document.body.classList.add('is-ready');
      startTick();
    }

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

    var UP = new THREE.Vector3(0, 1, 0);
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

    function table(vals) {
      return function (t) {
        var x = Math.min(Math.max(t, 0), 1) * (vals.length - 1);
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
        rw = function (t) { return rt(t) * 0.52; };
        moss = function (t) { return rt(t) * 0.88; };
      }
      return {
        curve: curve, segs: opt.segs, radial: opt.radial, rw: rw, moss: moss,
        blade: function (t) { return moss(t) * 0.055 + 0.014; },
        sink: opt.sink || 0, vScale: opt.vScale, fr: transportFrames(curve, opt.segs), len: curve.getLength()
      };
    }

    var _fp = new THREE.Vector3(), _ft = new THREE.Vector3(), _fn = new THREE.Vector3(), _fb = new THREE.Vector3();
    function limbFrame(L, t) {
      var f = Math.min(Math.max(t, 0), 1) * L.segs;
      var i = Math.min(L.segs - 1, Math.floor(f)), a = f - i;
      _fp.copy(L.fr.pts[i]).lerp(L.fr.pts[i + 1], a);
      _ft.copy(L.fr.tans[i]).lerp(L.fr.tans[i + 1], a).normalize();
      _fn.copy(L.fr.nrms[i]).lerp(L.fr.nrms[i + 1], a);
      _fn.addScaledVector(_ft, -_fn.dot(_ft)).normalize();
      _fb.crossVectors(_ft, _fn).normalize();
    }

    function limbSurface(L, t, th, outP, outN) {
      limbFrame(L, t);
      var c = Math.cos(th), s = Math.sin(th);
      outN.set(_fn.x * c + _fb.x * s, _fn.y * c + _fb.y * s, _fn.z * c + _fb.z * s).normalize();
      var rw = L.rw(t);
      outP.copy(_fp).addScaledVector(outN, rw);
      return 0.5;
    }

    function tessellate(L, bag) {
      var S = L.segs, R = L.radial;
      var base = bag.pos.length / 3;
      var grid = new Float32Array((S + 1) * (R + 1) * 3);
      var p = new THREE.Vector3(), n = new THREE.Vector3();
      var i, j, k;

      for (i = 0; i <= S; i++) {
        for (j = 0; j <= R; j++) {
          limbSurface(L, i / S, (j / R) * Math.PI * 2, p, n);
          k = (i * (R + 1) + j) * 3;
          grid[k] = p.x; grid[k + 1] = p.y; grid[k + 2] = p.z;
        }
      }

      for (i = 0; i <= S; i++) {
        for (j = 0; j <= R; j++) {
          k = (i * (R + 1) + j) * 3;
          bag.pos.push(grid[k], grid[k + 1], grid[k + 2]);
          bag.nor.push(0, 1, 0);
          bag.inf.push(1, 1, 0.5);
        }
      }
      for (i = 0; i < S; i++) for (j = 0; j < R; j++) {
        var q0 = base + i * (R + 1) + j, q1 = q0 + R + 1;
        bag.idx.push(q0, q1, q0 + 1, q1, q1 + 1, q0 + 1);
      }
      L.grid = grid; L.S = S; L.R = R;
    }

    function plantBlades(L, count, bag) {
      var S = L.S, R = L.R, grid = L.grid;
      if (!grid) return 0;
      for (var b = 0; b < count; b++) {
        var i = Math.floor(rng() * S), j = Math.floor(rng() * R);
        var p0 = (i * (R + 1) + j) * 3;
        bag.off.push(grid[p0], grid[p0 + 1], grid[p0 + 2]);
        bag.nrm.push(0, 1, 0);
        bag.rnd.push(rng() * Math.PI * 2, 0.08, 0, rng());
        bag.aux.push(0.5);
      }
      return count;
    }

    function buildNearRoot() {
      var P = makeP(ARCH.aspect);
      return [makeLimb(P, [
        [-0.075, 0.845, -0.62], [ 0.000, 0.790, -0.38], [ 0.107, 0.695,  0.04], [ 0.196, 0.588,  0.28],
        [ 0.250, 0.566,  0.34], [ 0.304, 0.603,  0.22], [ 0.411, 0.733, -0.10], [ 0.500, 0.779, -0.28]
      ], {
        segs: 120, radial: 14, vScale: 20,
        rt: [0.575, 0.590, 0.630, 0.680, 0.695, 0.615, 0.580, 0.480], sink: 0.5
      })];
    }

    function buildFarRoot() {
      var P = makeP(FAR.aspect);
      return [makeLimb(P, [
        [-0.060, 0.880, -0.35], [ 0.100, 0.762, -0.05], [ 0.210, 0.698,  0.22], [ 0.300, 0.570,  0.30]
      ], {
        segs: 80, radial: 10, vScale: 16,
        rt: [0.760, 0.900, 0.900, 0.960], sink: 0.5
      })];
    }

    var LIGHT_GLSL = [
      'uniform vec3 uKeyDir, uKeyCol, uAmbCol;',
      'vec3 litSurface(vec3 N, vec3 albedo){',
      '  float k = max(dot(N, uKeyDir), 0.0);',
      '  return albedo * (uKeyCol * (0.2 + 0.9 * k) + uAmbCol);',
      '}'
    ].join('\n');

    function barkMaterial(cfg) {
      return new THREE.ShaderMaterial({
        uniforms: cfg.uniforms,
        vertexShader: [
          'attribute vec3 inf;',
          'varying vec3 vN; varying vec3 vW;',
          'void main(){',
          '  vN = normalize(normal);',
          '  vec4 wp = modelMatrix * vec4(position, 1.0);',
          '  vW = wp.xyz;',
          '  gl_Position = projectionMatrix * viewMatrix * wp;',
          '}'
        ].join('\n'),
        fragmentShader: LIGHT_GLSL + [
          'precision highp float;',
          'varying vec3 vN; varying vec3 vW;',
          'void main(){',
          '  vec3 col = vec3(0.18, 0.15, 0.12);',
          '  vec3 lit = litSurface(normalize(vN), col);',
          '  gl_FragColor = vec4(lit, 1.0);',
          '  #include <tonemapping_fragment>',
          '  #include <encodings_fragment>',
          '}'
        ].join('\n'),
        transparent: false, depthWrite: true, side: THREE.DoubleSide
      });
    }

    function grassMaterial(cfg) {
      return new THREE.ShaderMaterial({
        uniforms: cfg.uniforms, side: THREE.DoubleSide, transparent: false, depthWrite: true,
        vertexShader: [
          'attribute vec3 offset;',
          'attribute vec3 nrm;',
          'attribute vec4 rnd;',
          'varying vec3 vN; varying vec3 vW;',
          'void main(){',
          '  float t = uv.y; float len = rnd.y;',
          '  vec3 world = offset + nrm * (t * len);',
          '  vN = nrm;',
          '  vec4 wp = modelMatrix * vec4(world, 1.0);',
          '  vW = wp.xyz;',
          '  gl_Position = projectionMatrix * viewMatrix * wp;',
          '}'
        ].join('\n'),
        fragmentShader: LIGHT_GLSL + [
          'precision highp float;',
          'varying vec3 vN; varying vec3 vW;',
          'void main(){',
          '  vec3 col = vec3(0.08, 0.15, 0.03);',
          '  vec3 lit = litSurface(normalize(vN), col);',
          '  gl_FragColor = vec4(lit, 1.0);',
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
        uTime: uTime,
        uKeyDir:   { value: new THREE.Vector3(-0.3, 0.9, 0.3).normalize() },
        uKeyCol:   { value: new THREE.Color(1.1, 1.0, 0.8) },
        uAmbCol:   { value: new THREE.Color(0.15, 0.15, 0.15) }
      };

      var bag = { pos: [], nor: [], inf: [], idx: [] };
      for (var i = 0; i < limbs.length; i++) tessellate(limbs[i], bag);
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(bag.pos, 3));
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(bag.nor, 3));
      geo.setAttribute('inf', new THREE.Float32BufferAttribute(bag.inf, 3));
      geo.setIndex(bag.idx);
      var shell = new THREE.Mesh(geo, barkMaterial({ uniforms: uni }));
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
      var grass = new THREE.Mesh(bg, grassMaterial({ uniforms: uni }));
      grass.frustumCulled = false;
      group.add(grass);

      for (i = 0; i < limbs.length; i++) { limbs[i].grid = limbs[i].gnrm = limbs[i].gcaps = null; }
      return group;
    }

    function build() {
      var isMobile = window.innerWidth < 768;
      var BLADES_NEAR = isMobile ? 1500 : 5000;
      var BLADES_FAR  = isMobile ? 400  : 1500;

      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
      renderer.setClearColor(0x000000, 0);
      
      // STRICT DPR CAP TO PREVENT GPU OVERHEATING ON RETINA LAPTOPS
      renderer.setPixelRatio(1.0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.20;

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
      if (!hero || !camera) return;
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
