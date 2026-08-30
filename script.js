// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile hamburger
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.nav__mobile-link, .nav__mobile .btn').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
reveals.forEach(el => observer.observe(el));

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    }
  });
});

// WebGL stripe gradient background for the Contact section
(function () {
  const canvas = document.getElementById('contactBgCanvas');
  if (!canvas) return;
  const section = canvas.closest('section');
  const gl = canvas.getContext('webgl2', { alpha: true });
  if (!gl) return;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const vs = `#version 300 es
precision mediump float;
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;

  const fs = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1,0)), f.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv.x *= uResolution.x / uResolution.y;

  float t = uTime * 0.4;
  float n = fbm(uv * 1.0 + t * 0.15) * 0.08;

  float stripe = fract((uv.x * 0.6 + uv.y * 0.4 + n) * 3.0 + t * 0.12);

  vec3 c1 = vec3(1.0, 1.0, 1.0);
  vec3 c2 = vec3(0.55, 0.78, 1.0);
  vec3 c3 = vec3(0.14, 0.42, 0.96);

  vec3 color;
  if (stripe < 0.333) color = mix(c1, c2, smoothstep(0.0, 0.333, stripe));
  else if (stripe < 0.666) color = mix(c2, c3, smoothstep(0.333, 0.666, stripe));
  else color = mix(c3, c1, smoothstep(0.666, 1.0, stripe));

  outColor = vec4(color, 1.0);
}`;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPosition');
  gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uResolution');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const startTime = performance.now();

  function resize() {
    canvas.width = section.offsetWidth;
    canvas.height = section.offsetHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  new ResizeObserver(resize).observe(section);

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (performance.now() - startTime) * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  render();
})();

// WebGL wavy blue mesh background for the Why section
(function () {
  const canvas = document.getElementById('whyBgCanvas');
  if (!canvas) return;

  const section = canvas.closest('section');
  const gl = canvas.getContext('webgl2', { alpha: true });
  if (!gl) return;

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const seaColors = [
    [0.0,0.02,0.05],[0.0,0.04,0.08],[0.0,0.06,0.12],[0.0,0.08,0.18],
    [0.0,0.1,0.24],[0.0,0.14,0.32],[0.0,0.2,0.4],[0.0,0.24,0.48],
    [0.0,0.3,0.55],[0.05,0.35,0.6],[0.08,0.4,0.65],[0.1,0.45,0.7],
    [0.15,0.5,0.75],[0.2,0.58,0.8],[0.25,0.65,0.85],[0.3,0.72,0.9],
    [0.4,0.78,0.92],[0.5,0.85,0.95],[0.7,0.9,0.97],[0.85,0.95,1.0]
  ];
  const colorArraySrc = seaColors.map(c => `vec3(${c[0]},${c[1]},${c[2]})`).join(',\n  ');

  const vs = `#version 300 es
precision mediump float;
in vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }`;

  const fs = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uTime;
#define NUM_COLORS 20
vec3 seaColors[NUM_COLORS] = vec3[](${colorArraySrc});
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x,289.0); }
float noise2D(vec2 v) {
  const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
  vec2 i = floor(v+dot(v,C.yy));
  vec2 x0 = v-i+dot(i,C.xx);
  vec2 i1 = (x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
  vec4 x12 = x0.xyxy+C.xxzz; x12.xy -= i1;
  i = mod(i,289.0);
  vec3 p = permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
  vec3 m = max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0*fract(p*C.www)-1.0;
  vec3 h = abs(x)-0.5;
  vec3 ox = floor(x+0.5);
  vec3 a0 = x-ox;
  m *= 1.792843-0.853734*(a0*a0+h*h);
  vec3 g;
  g.x = a0.x*x0.x+h.x*x0.y;
  g.yz = a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m,g);
}
float fbm(vec2 st) {
  float value=0.0, amplitude=0.5, freq=1.0;
  for(int i=0;i<10;i++){value+=amplitude*noise2D(st*freq);freq*=2.0;amplitude*=0.5;}
  return value;
}
void main() {
  vec2 uv = (gl_FragCoord.xy/uResolution.xy)*2.0-1.0;
  uv.x *= uResolution.x/uResolution.y;
  uv *= 0.3;
  float t = uTime*0.25;
  float waveAmp = 0.2+0.15*noise2D(vec2(t,27.7));
  uv.x += waveAmp*sin(uv.y*4.0+t);
  uv.y += waveAmp*sin(uv.x*4.0-t);
  float r = length(uv);
  float angle = atan(uv.y,uv.x);
  float swirl = 1.2*(1.0-smoothstep(0.0,1.0,r));
  angle += swirl*sin(uTime+r*5.0);
  uv = vec2(cos(angle),sin(angle))*r;
  float n = fbm(uv);
  n += 0.2*sin(t+n*3.0);
  float noiseVal = 0.5*(n+1.0);
  float idx = clamp(noiseVal,0.0,1.0)*float(NUM_COLORS-1);
  int iLow = int(floor(idx));
  int iHigh = int(min(float(iLow+1),float(NUM_COLORS-1)));
  float f = fract(idx);
  vec3 color = mix(seaColors[iLow],seaColors[iHigh],f);
  if(iLow==0 && iHigh==0) outColor = vec4(color,0.0);
  else outColor = vec4(color,1.0);
}`;

  function compileShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return; }
  gl.useProgram(prog);

  const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
  const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPosition');
  gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uResolution');
  const uTime = gl.getUniformLocation(prog, 'uTime');
  const startTime = performance.now();

  function resize() {
    const w = section.offsetWidth, h = section.offsetHeight;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
  }
  resize();
  new ResizeObserver(resize).observe(section);

  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (performance.now() - startTime) * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  }
  render();
})();

// Reviews carousel — 1 opinia na raz
(function () {
  const track = document.getElementById('reviewsTrack');
  const dotsWrap = document.getElementById('reviewsDots');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.rc'));
  const total = cards.length;
  let current = 0;

  // Dots
  const dots = cards.map((_, i) => {
    const d = document.createElement('button');
    d.className = 'reviews__dot' + (i === 0 ? ' reviews__dot--active' : '');
    d.setAttribute('aria-label', 'Opinia ' + (i + 1));
    d.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(d);
    return d;
  });

  const prev = document.querySelector('.reviews__arrow--prev');
  const next = document.querySelector('.reviews__arrow--next');

  function goTo(i) {
    current = Math.max(0, Math.min(i, total - 1));
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('reviews__dot--active', idx === current));
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === total - 1;
  }

  if (prev) prev.addEventListener('click', () => goTo(current - 1));
  if (next) next.addEventListener('click', () => goTo(current + 1));

  // Touch swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  goTo(0);
})();

// Contact form – submitted via Formsubmit.co
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', () => {
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Wysyłanie… ✦';
    btn.disabled = true;
  });
}