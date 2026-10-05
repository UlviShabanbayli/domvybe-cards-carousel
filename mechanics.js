// The mechanics: how each look lays its cards out from the carousel's position. The carousel (app.js) owns the
// position — a number in cards that never runs out (2.4 is between the third and the fourth, 6 is the third again on
// a four-card set) — and the throw, the snap, the keys and the dots. A mechanic only turns that number into a picture.
// A mechanic is MECH.name(ctx) → { unit, axis, repeat, frame(s) }:
//   ctx  = { rig, cards: [{ el, win, pic, glare, info, shade, data }], n (distinct cards), calm, spring, critical }
//   unit = how many px of drag move one card; axis = 'x' or 'y'; repeat = how many times the set is laid out
//   s    = { pos, vel (cards a second), tx, ty (the tilt of the front card, −1…1), dt, t, active (data index) }
window.MECH = {};

const wrap = (v, n, lo) => ((((v - lo) % n) + n) % n) + lo;        // v folded into [lo, lo + n)
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const f2 = (v) => v.toFixed(2);
function el(tag, cls, parent, html = '') { const e = document.createElement(tag); e.className = cls; e.innerHTML = html; parent.append(e); return e; }

// the front card's tilt, shared: it leans towards the pointer, the picture slides the other way (the window),
// the glare follows the light
function tilt(c, k, tx, ty) {
  c.glare.style.opacity = f2(k * (0.25 + 0.5 * Math.hypot(tx, ty)));
  c.glare.style.setProperty('--gx', `${50 + tx * 40}%`);
  c.glare.style.setProperty('--gy', `${35 + ty * 30}%`);
  return `rotateY(${f2(tx * 9 * k)}deg) rotateX(${f2(-ty * 9 * k)}deg)`;
}

// FILMS · a wide curved screen you stand inside. The cards line its inner wall: the one in front of you is flat and
// largest, the ones beside it turn in to face you as the wall curves round. Drag and the wall turns; when a card
// settles in front of you a band of light sweeps across it. The front poster's colours spill into the room behind,
// and every card stands on a glossy floor that reflects it.
MECH.films = ({ rig, cards, n, calm }) => {
  const R = 560, GAP = 26, W = 210, STEP = (W + GAP) / R;          // the wall's radius, and the angle between two cards
  const back = [...document.querySelectorAll('.backdrop')];
  const shown = [-1, -1];
  let fast = false, sweep = 1;
  return {
    unit: W + GAP, axis: 'x', repeat: 1,
    frame({ pos, vel, tx, ty, dt }) {
      const speed = Math.abs(vel);
      if (speed > 1.2) fast = true;
      if (fast && speed < 0.25 && Math.abs(pos - Math.round(pos)) < 0.02) { fast = false; sweep = calm ? 1 : 0; }   // a card has landed
      sweep = Math.min(1, sweep + dt / 0.7);
      for (const [i, c] of cards.entries()) {
        const d = wrap(i - pos, n, -n / 2), ad = Math.abs(d), a = d * STEP, k = clamp01(1 - ad * 2);
        const x = Math.sin(a) * R, z = (1 - Math.cos(a)) * R * 0.9 - k * 30, scale = 1 + k * 0.08;
        c.el.style.transform = `translate3d(${f2(x)}px, ${f2(-k * 6)}px, ${f2(-z)}px) rotateY(${f2((-a * 180) / Math.PI)}deg) scale(${f2(scale)}) ${tilt(c, k, tx, ty)}`;
        c.el.style.zIndex = String(100 - Math.round(ad * 10));
        c.el.style.opacity = f2(clamp01((2.2 - ad) / 0.6));             // only the neighbours show; the rest are round the back
        c.pic.style.transform = `translate3d(${f2(-d * 10 - tx * 4 * k)}%, ${f2(-ty * 3 * k)}%, 0)`;
        c.shade.style.opacity = f2(Math.min(0.7, ad * 0.55));
        c.info.style.opacity = f2(clamp01(1 - ad * 3));
        c.info.style.transform = `translate3d(0, ${f2((1 - clamp01(1 - ad * 3)) * 14)}px, 40px)`;
        const sw = k > 0.5 ? f2(-60 + sweep * 220) + '%' : '-60%';
        if (c.sweep !== sw) { c.sweep = sw; c.el.style.setProperty('--sweep', sw); }   // a custom property restyles the card: only when it moves
      }
      const a = wrap(Math.floor(pos), n, 0), b = (a + 1) % n, f = pos - Math.floor(pos);
      [a, b].forEach((idx, j) => { if (shown[j] !== idx) { shown[j] = idx; back[j].style.backgroundImage = cards[idx].data.img ? `url("${cards[idx].data.img.replace('img/', 'img/blur/')}")` : 'none'; } });
      back[0].style.opacity = f2((1 - f) * 0.9);
      back[1].style.opacity = f2(f * 0.9);
    },
    idle: () => sweep >= 1 && !fast,
  };
};

// ICONS · a gallery window by day. Framed products hang on fine threads, each at its own height, the neighbours
// tucked in behind the one in front and turned a little towards it, over a glossy floor. Push the row and every frame
// swings on its thread — each at its own pace, as things on strings do — and sways to rest; its shadow swings on the
// wall behind it, and the picture inside stays level, so the product seems to hang in the window.
MECH.icons = ({ rig, cards, n, calm, spring }) => {
  const OVER = 150, PAST = 104, PUSH = 14;                          // how far the first neighbour sits out, the rest; how hard a push swings them
  const DROP = [0, -26, 18, -12, 24, -20, 10];                      // each thread its own length
  const GAP = 12;                                                   // twice the frame's height over the floor, at rest
  el('div', 'gallery-floor', rig);
  for (const c of cards) c.el.prepend(Object.assign(document.createElement('i'), { className: 'thread' }));
  const swing = cards.map((_, i) => new Spring(0, spring(24 + (i % 3) * 6, 2.4)));
  const lift = new Spring(1, spring(60, 15.5));                     // the front frame comes forward a little when it settles
  let lastVel = 0;
  return {
    unit: OVER, axis: 'x', repeat: 1,
    frame({ pos, vel, tx, ty, dt }) {
      const acc = Math.max(-40, Math.min(40, (vel - lastVel) / Math.max(dt, 1 / 240)));   // the row's push, cards a second²
      lastVel = vel;
      lift.target = Math.abs(pos - Math.round(pos)) < 0.02 && Math.abs(vel) < 0.15 ? 1 : 0;
      lift.step(dt);
      for (const [i, c] of cards.entries()) {
        const s = swing[i];
        if (!calm) s.velocity -= acc * PUSH * dt;                    // the frame lags behind the rail, then swings past
        s.step(dt);
        const d = wrap(i - pos, n, -n / 2), ad = Math.abs(d), k = clamp01(1 - ad * 2), out = clamp01(ad);
        const x = Math.sign(d) * (ad < 1 ? ad * OVER : OVER + (ad - 1) * PAST);
        const y = DROP[i % DROP.length] * out, z = -Math.min(ad, 3) * 120 + k * lift.value * 24;
        const a = Math.max(-28, Math.min(28, s.value));
        c.el.style.transform = `translate3d(${f2(x)}px, ${f2(y)}px, ${f2(z)}px) rotateY(${f2(-Math.sign(d) * out * 12)}deg) rotateZ(${f2(a)}deg) ${tilt(c, k * 0.6, tx, ty)}`;
        c.el.style.opacity = f2(clamp01((3.2 - ad) / 0.6));
        c.el.style.filter = `drop-shadow(${f2(14 + a * 1.8)}px ${f2(22 + k * 10)}px 18px rgb(70 50 30 / ${f2(0.2 + k * 0.1)}))`;   // its shadow on the wall
        c.pic.style.transform = `translate3d(${f2(-d * 8 - tx * 4 * k)}%, ${f2(-ty * 3 * k)}%, 0) rotate(${f2(-a * 0.7)}deg)`;
        c.shade.style.opacity = f2(Math.min(0.5, ad * 0.28));
        // its reflection: mirrored about the floor, not about the frame — a frame hanging higher sees it further down —
        // and swinging the other way, as a mirror image does
        c.refl.style.transform = `translateY(${f2(GAP - 2 * y)}px) rotate(${f2(-2 * a)}deg) scaleY(-1)`;
      }
    },
    idle: () => lift.resting(0.001) && swing.every((s) => s.resting(0.02)),
  };
};

// CARS · drift. The cars stand in a row on a wet floor under one warm light. Throw the row and every car slides in
// sideways — the cards swing round on their wheels, tyre smoke pours off the back corners and black rubber is laid on
// the floor; let go and they catch the slide, swing past straight and settle. The car that lands in front flashes its
// own headlights twice, and its figures count up.
MECH.cars = ({ rig, cards, n, calm, spring }) => {
  const W = 236, GAP = 30, STEP = W + GAP, FLOOR = 154;            // a card's width, the row's step, the floor line below the centre
  const CW = 1000, CH = 560, PERSP = 1000;                         // the smoke canvases, in the rig's px; the rig's perspective
  const yaw = new Spring(0, spring(70, 8));                         // the slide: it swings past straight before it settles
  const count = new Spring(1, spring(50, 13));
  el('div', 'floor', rig);
  // two canvases, one behind the cards and one in front, pushed back and forward in depth and scaled so they still
  // draw in the rig's own px (the perspective's centre is the rig's centre)
  const layer = (cls, z) => {
    const cv = el('canvas', `smoke ${cls}`, rig);
    cv.style.transform = `translateZ(${z}px) scale(${(PERSP - z) / PERSP})`;
    return { cv, g: cv.getContext('2d') };
  };
  const back = layer('back', -160), front = layer('front', 60);
  // one soft puff, drawn once and stamped many times
  const puff = document.createElement('canvas');
  puff.width = puff.height = 128;
  { const g = puff.getContext('2d'), r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(232,228,222,1)'); r.addColorStop(0.45, 'rgba(220,216,210,.45)'); r.addColorStop(1, 'rgba(210,206,200,0)');
    g.fillStyle = r; g.fillRect(0, 0, 128, 128); }
  // the headlights: a layer the size of the picture, and each car's own lights on it where they are in the photo —
  // their shape, size, angle and colour (halogen, LED ring, daytime strip, parking lamp, covered lens, vintage)
  for (const c of cards) {
    if (!c.data.lamps) continue;
    c.lamps = el('div', 'lamps', c.win, c.data.lamps.map(([x, y, w, h, r, kind]) =>
      `<i class="lamp ${kind}" style="left:${x}%;top:${y}%;width:${w}%;padding-top:${h}%;--rot:${r}deg"></i>`).join(''));
    c.lamps.style.setProperty('--on', '0');
  }
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };   // seeded: the same throw draws the same smoke
  const puffs = [], marks = [], prev = new Map();
  let res = 0, lastActive = -1, armed = false, flash = calm ? 1 : -0.6, landed = 0;   // the first car flashes as the section opens (not under reduced motion)
  function size() {                                                 // the canvases' pixels follow the rig's scale on screen
    const r = Math.min(2, (devicePixelRatio || 1) * (rig.getBoundingClientRect().width / Math.max(1, rig.offsetWidth)) * 0.75);
    if (Math.abs(r - res) < 0.05) return;
    res = r;
    for (const l of [back, front]) { l.cv.width = Math.round(CW * r); l.cv.height = Math.round(CH * r); }
  }
  return {
    unit: STEP * 0.8, axis: 'x', repeat: 1,
    frame({ pos, vel, tx, ty, dt, active }) {
      size();
      const speed = Math.abs(vel), dir = Math.sign(vel) || 1;      // vel > 0: the row runs to the left
      yaw.target = calm ? 0 : Math.max(-26, Math.min(26, -vel * 8));
      yaw.step(dt);
      if (active !== lastActive) { lastActive = active; count.value = 0; count.target = 1; }
      count.step(dt);
      if (speed > 1) armed = true;
      if (armed && speed < 0.2 && Math.abs(pos - Math.round(pos)) < 0.03) { armed = false; flash = calm ? 1 : 0; landed = active; }   // it has landed: a flash, or just its lights on under reduced motion
      flash += dt;
      const pulse = (c) => Math.exp(-(((flash - c) / 0.07) ** 2));
      const lampsOn = Math.min(1, 0.32 + 1.4 * Math.max(pulse(0.06), pulse(0.38)));

      for (const [i, c] of cards.entries()) {
        const d = wrap(i - pos, n, -n / 2), ad = Math.abs(d), k = clamp01(1 - ad * 2);
        const x = Math.sign(d) * (ad < 1 ? ad * STEP : STEP + (ad - 1) * STEP * 0.84);
        const z = -Math.min(ad, 2) * 70, scale = 1 - Math.min(ad, 1) * 0.1;
        const y2 = yaw.value * (1 - Math.min(ad, 1.5) * 0.3);       // this card's slide angle
        c.el.style.transform = `translate3d(${f2(x)}px, 0, ${f2(z)}px) rotateY(${f2(y2)}deg) rotateZ(${f2(y2 * 0.08)}deg) scale(${f2(scale)}) ${tilt(c, k, tx, ty)}`;
        c.el.style.opacity = f2(clamp01((2.6 - ad) / 0.6));
        const picT = `translate3d(${f2(-d * 8 - tx * 4 * k + y2 * 0.22)}%, ${f2(-ty * 3 * k)}%, 0)`;
        c.pic.style.transform = picT;
        if (c.lamps) {
          c.lamps.style.transform = `translateY(-50%) ${picT}`;
          c.lamps.style.setProperty('--on', f2(i === landed && i === active ? lampsOn : 0));
        }
        c.shade.style.opacity = f2(Math.min(0.65, ad * 0.5));
        c.info.style.opacity = f2(clamp01(1 - ad * 2.2));
        c.info.style.transform = `translate3d(0, ${f2((1 - clamp01(1 - ad * 2.2)) * -10)}px, 30px)`;
        if (i === active) for (const b of c.info.querySelectorAll('[data-to]')) b.textContent = (+b.dataset.to * Math.min(1, count.value)).toFixed(+(b.dataset.dp || 0));

        // the tyres: a sliding car smokes from its back corners and lays rubber on the floor
        if (calm || ad > 1.3) { prev.delete(i); continue; }
        const cos = Math.cos((y2 * Math.PI) / 180), half = (W / 2) * scale * cos;
        const wheels = [x + dir * half * 0.86, x - dir * half * 0.8];   // the back corner (it trails), then the front
        const slide = clamp01((speed - 0.5) / 2.5) * (1 - ad * 0.55);
        if (slide > 0) {
          let want = slide * 150 * dt;                                  // puffs this frame
          while (want > 0) {
            if (rnd() < want) {
              const w = rnd() < 0.78 ? 0 : 1, life = 1.8 + rnd() * 1.8;
              puffs.push({ x: wheels[w] + (rnd() - 0.5) * 16, y: FLOOR - 4 - rnd() * 8, vx: (rnd() - 0.5) * 40 - dir * 14,
                vy: -20 - rnd() * 55, r0: 14 + rnd() * 10, r1: 90 + rnd() * 130 * slide, life, age: 0, a: (0.3 + rnd() * 0.25) * (0.6 + slide * 0.6), front: rnd() < 0.4 });
            }
            want -= 1;
          }
        }
        if (slide > 0.25 && Math.abs(y2) > 5) {
          const p = prev.get(i);
          if (p) wheels.forEach((wx, w) => marks.push({ x1: p[w], x2: wx, y: FLOOR + 2 + w * 5, age: 0, a: Math.min(1, slide * 1.2) * (w ? 0.55 : 1) }));
          prev.set(i, wheels);
        } else prev.delete(i);
      }

      // draw: the rubber and most of the smoke behind the cards, a thinner veil of smoke in front
      for (const l of [back, front]) { l.g.setTransform(res, 0, 0, res, (CW / 2) * res, (CH / 2) * res); l.g.clearRect(-CW / 2, -CH / 2, CW, CH); }
      const bg = back.g;
      bg.lineCap = 'round';
      for (let m = marks.length - 1; m >= 0; m--) {
        const s = marks[m];
        s.age += dt;
        if (s.age > 4) { marks.splice(m, 1); continue; }
        bg.strokeStyle = `rgba(8,8,10,${f2(s.a * 0.75 * (1 - s.age / 4))})`;
        bg.lineWidth = 7;
        bg.beginPath(); bg.moveTo(s.x1, s.y); bg.lineTo(s.x2, s.y); bg.stroke();
      }
      if (marks.length > 900) marks.splice(0, marks.length - 900);
      for (let q = puffs.length - 1; q >= 0; q--) {
        const p = puffs[q];
        p.age += dt;
        if (p.age > p.life) { puffs.splice(q, 1); continue; }
        const u = p.age / p.life, e = 1 - (1 - u) ** 3;
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 1 - dt * 0.8; p.vy *= 1 - dt * 0.3;
        const r = p.r0 + (p.r1 - p.r0) * e, a = p.a * (1 - u) ** 1.6 * Math.min(1, p.age / 0.08) * (p.front ? 0.6 : 1);
        const g = p.front ? front.g : bg;
        g.globalAlpha = a;
        g.drawImage(puff, p.x - r, p.y - r * 0.8, r * 2, r * 1.6);
      }
      back.g.globalAlpha = front.g.globalAlpha = 1;
      if (puffs.length > 900) puffs.splice(0, puffs.length - 900);
    },
    idle: () => !puffs.length && !marks.length && flash > 1 && yaw.resting(0.01) && count.resting(0.001),
  };
};
