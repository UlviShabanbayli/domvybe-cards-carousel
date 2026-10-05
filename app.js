// Cards carousel — a carousel of picture cards that never runs out. Each card is a window: the picture inside moves on
// its own as the card travels and as you tilt it, so it reads as depth. The carousel owns one number, its position in
// cards; drag it (and throw it), press the arrows or the dots, use the arrow keys or the wheel, and the position
// springs to the next whole card. How that number becomes a picture is the look's mechanic (mechanics.js): Films line
// a curved wide screen, Icons hang and swing in a shop window, Cars drift in on a smoking floor.
// Real component: a region with the carousel role, every card a labelled slide, the dots a tab list, the current card
// announced politely, the arrow keys on the focused carousel, and prefers-reduced-motion (no throw, tilt or flicker).
//
// The six stages of the tutorial:
//   1. the look and the springs                 4. moving: drag, throw, snap, arrows, dots, keys, wheel
//   2. a card: the window and its picture          5. the mechanics: screen, window, drift
//   3. the carousel's position, and wrapping it    6. the tilt, the words for screen readers, the loop
//                                                  7. the detail: tap the front card and it opens

// ================================================================================================================
// STAGE 1 · the look and the springs
// ================================================================================================================
const html = document.documentElement;
const $ = (s, r = document) => r.querySelector(s);
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const look = html.dataset.look;

$('meta[name="theme-color"]').content = getComputedStyle(html).getPropertyValue('--page').trim();

const studio = (window.__studio = window.__studio || {});
if (!studio.now) studio.now = () => performance.now();

const spring = (stiffness, damping) => ({ stiffness, damping: calm ? 2 * Math.sqrt(stiffness) : damping });
const critical = (stiffness) => ({ stiffness, damping: 2 * Math.sqrt(stiffness) });

// each look: what the carousel is called, its cards (real films, real products, real cars), the words each card
// carries, and the line that credits the pictures
const LOOK = {
  films: {
    site: { brand: 'Aurora Cinemas', links: ['Films', 'Cinemas', 'Offers'], cta: 'Book tickets', title: 'Aurora Cinemas — Now showing',
      eyebrow: 'Now showing · Laser 4K', h2: 'Tonight on the <em>big screen</em>', lede: 'Six films, one wide screen. Drag to choose yours, then watch the trailer.', more: 'All films and showtimes →' },
    label: 'Now showing',
    credit: 'Posters © their studios · shown for illustration',
    cards: [
      { name: 'Dune', img: 'img/film-dune.jpg', html: '<span class="f-rate" style="--r:80"><b>8.0</b><i>IMDb</i></span><p class="f-tags"><span>Sci-fi</span><span>Epic</span></p><p class="f-meta">2021 · 2h 35m · Denis Villeneuve</p><p class="f-acts"><span class="f-play">▶&nbsp; Trailer</span><span class="f-add">+</span></p>' },
      { name: 'Interstellar', img: 'img/film-interstellar.jpg', html: '<span class="f-rate" style="--r:87"><b>8.7</b><i>IMDb</i></span><p class="f-tags"><span>Sci-fi</span><span>Drama</span></p><p class="f-meta">2014 · 2h 49m · Christopher Nolan</p><p class="f-acts"><span class="f-play">▶&nbsp; Trailer</span><span class="f-add">+</span></p>' },
      { name: 'Blade Runner 2049', img: 'img/film-blade-runner-2049.jpg', html: '<span class="f-rate" style="--r:80"><b>8.0</b><i>IMDb</i></span><p class="f-tags"><span>Neo-noir</span><span>Sci-fi</span></p><p class="f-meta">2017 · 2h 44m · Denis Villeneuve</p><p class="f-acts"><span class="f-play">▶&nbsp; Trailer</span><span class="f-add">+</span></p>' },
      { name: 'Oppenheimer', img: 'img/film-oppenheimer.jpg', html: '<span class="f-rate" style="--r:83"><b>8.3</b><i>IMDb</i></span><p class="f-tags"><span>Drama</span><span>History</span></p><p class="f-meta">2023 · 3h 0m · Christopher Nolan</p><p class="f-acts"><span class="f-play">▶&nbsp; Trailer</span><span class="f-add">+</span></p>' },
      { name: 'Top Gun: Maverick', img: 'img/film-top-gun-maverick.jpg', html: '<span class="f-rate" style="--r:82"><b>8.2</b><i>IMDb</i></span><p class="f-tags"><span>Action</span><span>Drama</span></p><p class="f-meta">2022 · 2h 10m · Joseph Kosinski</p><p class="f-acts"><span class="f-play">▶&nbsp; Trailer</span><span class="f-add">+</span></p>' },
      { name: 'Mad Max: Fury Road', img: 'img/film-mad-max-fury-road.jpg', html: '<span class="f-rate" style="--r:81"><b>8.1</b><i>IMDb</i></span><p class="f-tags"><span>Action</span><span>Road</span></p><p class="f-meta">2015 · 2h 0m · George Miller</p><p class="f-acts"><span class="f-play">▶&nbsp; Trailer</span><span class="f-add">+</span></p>' },
      { name: 'All films', all: true, html: '<p class="all-k">This week</p><p class="all-n">42 films</p><p class="all-go">See all films <i>→</i></p>' },
    ],
  },
  icons: {
    site: { brand: 'Objet & Co.', links: ['Shop', 'Journal', 'Visit'], cta: 'Subscribe', title: 'Objet & Co. — The autumn window',
      eyebrow: 'The autumn window · 6 icons', h2: 'Six things that <em>never</em> get old', lede: 'Six designs that outlived their decades, framed and hung in our window. Give the rail a push.', more: 'See all 36 icons →' },
    label: 'Design icons',
    credit: 'Images generated with Google Gemini · unofficial',
    cards: [
      { name: 'Air Jordan 1', img: 'img/product-air-jordan-1.jpg', html: '<p class="pg-no">No. 01</p><p class="pg-name">Air Jordan 1</p><p class="pg-line">High OG “Chicago” · 1985</p><p class="pg-text">The sneaker the league tried to ban, and the one that made basketball shoes a culture.</p>' },
      { name: 'Rolex Submariner', img: 'img/product-rolex-submariner.jpg', html: '<p class="pg-no">No. 02</p><p class="pg-name">Submariner</p><p class="pg-line">Date, blue · since 1953</p><p class="pg-text">Built for divers and worn by everyone else; still rated to 300 metres.</p>' },
      { name: 'Leica M6', img: 'img/product-leica-m6.jpg', html: '<p class="pg-no">No. 03</p><p class="pg-name">Leica M6</p><p class="pg-line">Rangefinder · 1984</p><p class="pg-text">The quiet camera photojournalists trusted, with a light meter in the viewfinder.</p>' },
      { name: 'Game Boy', img: 'img/product-game-boy.jpg', html: '<p class="pg-no">No. 04</p><p class="pg-name">Game Boy</p><p class="pg-line">Handheld · 1989</p><p class="pg-text">Four shades of green, four AA batteries and Tetris in the box.</p>' },
      { name: 'Polaroid SX-70', img: 'img/product-polaroid-sx-70.jpg', html: '<p class="pg-no">No. 05</p><p class="pg-name">Polaroid SX-70</p><p class="pg-line">Instant camera · 1972</p><p class="pg-text">A camera that folds flat into a pocket and hands you the picture a minute later.</p>' },
      { name: 'AirPods Max', img: 'img/product-airpods-max.jpg', html: '<p class="pg-no">No. 06</p><p class="pg-name">AirPods Max</p><p class="pg-line">Headphones · 2020</p><p class="pg-text">Aluminium cups, a knit-mesh canopy and a crown borrowed from a watch.</p>' },
      { name: 'The whole window', all: true, html: '<p class="all-k">In the window</p><p class="all-n">36 icons</p><p class="all-go">See them all <i>→</i></p>' },
    ],
  },
  cars: {
    site: { brand: 'Redline Collection', links: ['Collection', 'Track days', 'Visit'], cta: 'Book a visit', title: 'Redline Collection — Six legends',
      eyebrow: 'The collection · 6 legends', h2: 'Six legends. <em>Sideways.</em>', lede: 'Throw the row and every car drifts in. The one that lands in front flashes its lights.', more: 'See the whole collection →' },
    label: 'Legends',
    credit: 'Images generated with Google Gemini · unofficial',
    cards: [
      { name: 'Ferrari F40', lamps: [[23.5, 61.7, 3.9, 2.8, -3, 'halo rect'], [46.9, 63.2, 4.8, 3.9, 4, 'halo rect']], img: 'img/car-ferrari-f40.jpg', html: '<p class="c-year">1987</p><p class="c-name">Ferrari F40</p><div class="c-specs"><span><b data-to="478">478</b>hp</span><span><b data-to="4.1" data-dp="1">4.1</b>s 0–100</span><span><b data-to="324">324</b>km/h</span></div>' },
      { name: 'Porsche 911 GT3', lamps: [[15.3, 51.5, 6.2, 7.6, 22, 'led ring'], [50.2, 52.5, 10.3, 7.7, -8, 'led ring'], [12.2, 58.3, 3.1, 0.9, 12, 'drl'], [43.2, 59.7, 7.4, 0.8, -6, 'drl']], img: 'img/car-porsche-911-gt3.jpg', html: '<p class="c-year">2021</p><p class="c-name">Porsche 911 GT3</p><div class="c-specs"><span><b data-to="510">510</b>hp</span><span><b data-to="3.4" data-dp="1">3.4</b>s 0–100</span><span><b data-to="318">318</b>km/h</span></div>' },
      { name: 'Lamborghini Countach', lamps: [[22.6, 59.4, 1.9, 1.9, 0, 'halo'], [24.7, 59.6, 1.9, 1.9, 0, 'halo'], [40.5, 60.6, 1.9, 1.9, 0, 'halo'], [42.9, 60.7, 1.9, 1.9, 0, 'halo'], [21.8, 61.6, 5.5, 1.7, -8, 'park rect'], [39.6, 62.9, 6.4, 1.9, -8, 'park rect']], img: 'img/car-lamborghini-countach.jpg', html: '<p class="c-year">1974</p><p class="c-name">Countach LP400</p><div class="c-specs"><span><b data-to="375">375</b>hp</span><span><b data-to="5.6" data-dp="1">5.6</b>s 0–100</span><span><b data-to="290">290</b>km/h</span></div>' },
      { name: 'BMW M3 E30', lamps: [[15.4, 62.8, 3.2, 3.2, 0, 'halo'], [18.8, 62.9, 2.9, 2.9, 0, 'halo dim'], [37.7, 63.6, 2.9, 2.9, 0, 'halo dim'], [42.6, 63.8, 3.65, 3.65, 0, 'halo']], img: 'img/car-bmw-m3-e30.jpg', html: '<p class="c-year">1986</p><p class="c-name">BMW M3 E30</p><div class="c-specs"><span><b data-to="195">195</b>hp</span><span><b data-to="6.7" data-dp="1">6.7</b>s 0–100</span><span><b data-to="235">235</b>km/h</span></div>' },
      { name: 'Mercedes-Benz 300 SL', lamps: [[64.8, 72, 5, 5, 0, 'vintage'], [90.6, 67.7, 4.1, 4.8, -6, 'vintage']], img: 'img/car-mercedes-300-sl.jpg', html: '<p class="c-year">1954</p><p class="c-name">300 SL Gullwing</p><div class="c-specs"><span><b data-to="215">215</b>hp</span><span><b data-to="8.8" data-dp="1">8.8</b>s 0–100</span><span><b data-to="263">263</b>km/h</span></div>' },
      { name: 'Ford GT40', lamps: [[15, 60, 7.7, 5, -18, 'lens'], [42.1, 63.1, 11, 6.1, -12, 'lens']], img: 'img/car-ford-gt40.jpg', html: '<p class="c-year">1966</p><p class="c-name">Ford GT40 Mk II</p><div class="c-specs"><span><b data-to="485">485</b>hp</span><span><b data-to="4.2" data-dp="1">4.2</b>s 0–100</span><span><b data-to="320">320</b>km/h</span></div>' },
      { name: 'The whole hall', all: true, html: '<p class="all-k">In the hall</p><p class="all-n">58 cars</p><p class="all-go">See the collection <i>→</i></p>' },
    ],
  },
}[look];

// what each card opens onto: the detail behind it (films: the plot, cast and today's times; icons: the story and the
// facts; cars: the engine, the figures and a line of history). Plots and stories are our own words.
const MORE = {
  films: {
    'Dune': { cert: 'PG-13', genre: 'Sci-fi, Epic', cast: 'Timothée Chalamet, Rebecca Ferguson, Oscar Isaac', times: ['13:20', '16:40', '20:00', '22:50'],
      plot: 'A noble family is handed the desert planet Arrakis, the only source of the most valuable substance there is — and its young heir is pulled into the war that follows.' },
    'Interstellar': { cert: 'PG-13', genre: 'Sci-fi, Drama', cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain', times: ['12:45', '16:30', '20:15'],
      plot: 'With the Earth failing, a former pilot leads a crew through a wormhole to look for a new home, while time runs differently for the daughter he left behind.' },
    'Blade Runner 2049': { cert: 'R', genre: 'Neo-noir, Sci-fi', cast: 'Ryan Gosling, Harrison Ford, Ana de Armas', times: ['14:10', '17:50', '21:30'],
      plot: 'A hunter of rogue replicants digs up a buried secret that could tip society into chaos, and goes looking for the man who vanished thirty years before.' },
    'Oppenheimer': { cert: 'R', genre: 'Drama, History', cast: 'Cillian Murphy, Emily Blunt, Robert Downey Jr.', times: ['13:00', '17:00', '21:00'],
      plot: 'The physicist who led the race to build the atomic bomb — the years in the desert, the test at dawn, and the hearing that later put his loyalty on trial.' },
    'Top Gun: Maverick': { cert: 'PG-13', genre: 'Action, Drama', cast: 'Tom Cruise, Miles Teller, Jennifer Connelly', times: ['15:15', '18:00', '20:45', '23:10'],
      plot: 'Decades after his own flight-school days, Maverick comes back to train a team of young pilots for a mission none of them is expected to fly home from.' },
    'Mad Max: Fury Road': { cert: 'R', genre: 'Action, Road', cast: 'Tom Hardy, Charlize Theron, Nicholas Hoult', times: ['16:00', '19:20', '22:30'],
      plot: 'Across a desert wasteland, a drifter and a rebel commander run from a tyrant in a war rig carrying the people he thinks he owns.' },
  },
  icons: {
    'Air Jordan 1': { facts: [['Designer', 'Peter Moore'], ['Made by', 'Nike'], ['First out', '1985']] },
    'Rolex Submariner': { facts: [['Made by', 'Rolex'], ['Water resistance', '300 m'], ['First out', '1953']] },
    'Leica M6': { facts: [['Made by', 'Leica'], ['Film', '35 mm'], ['Light meter', 'Built in']] },
    'Game Boy': { facts: [['Made by', 'Nintendo'], ['Screen', '4 shades of green'], ['Power', '4 × AA']] },
    'Polaroid SX-70': { facts: [['Made by', 'Polaroid'], ['Invented by', 'Edwin Land'], ['Film', 'SX-70 instant']] },
    'AirPods Max': { facts: [['Made by', 'Apple'], ['Cups', 'Aluminium'], ['Control', 'Digital Crown']] },
  },
  cars: {
    'Ferrari F40': { engine: '2.9 L twin-turbo V8', facts: [['Drive', 'Rear'], ['Built', '1,315'], ['Body', 'Carbon & Kevlar']],
      story: 'Ferrari’s fortieth birthday present to itself, and the last new car Enzo Ferrari signed off.' },
    'Porsche 911 GT3': { engine: '4.0 L flat-six', facts: [['Drive', 'Rear'], ['Redline', '9,000 rpm'], ['Gearbox', 'PDK or manual']],
      story: 'A naturally aspirated flat-six that screams to 9,000 rpm, in the 911 built for the track and driven home.' },
    'Lamborghini Countach': { engine: '3.9 L V12', facts: [['Drive', 'Rear'], ['Built', '157'], ['Doors', 'Scissor']],
      story: 'The wedge that went up on a million bedroom walls: scissor doors, and a V12 laid lengthwise behind the seats.' },
    'BMW M3 E30': { engine: '2.3 L four-cylinder', facts: [['Drive', 'Rear'], ['Made for', 'Touring cars'], ['Built from', '1986']],
      story: 'Built so BMW could go touring-car racing — and it went on to win more of those races than any car before it.' },
    'Mercedes-Benz 300 SL': { engine: '3.0 L straight-six', facts: [['Fuel', 'Direct injection'], ['Built', '1,400'], ['Doors', 'Gullwing']],
      story: 'Its frame left no room for ordinary doors, so they open to the sky; the first road car with fuel injection.' },
    'Ford GT40': { engine: '7.0 L V8', facts: [['Drive', 'Rear'], ['Le Mans 1966', '1–2–3'], ['Height', '40 inches']],
      story: 'Ford’s answer to Ferrari: in 1966 three of them crossed the line at Le Mans together.' },
  },
}[look];

const carousel = $('.carousel'), rig = $('.rig'), rigIn = $('.rig-in'), dotsEl = $('.dots'), live = $('.carousel .sr-only');
// the site around it: the header, the section's words
const SITE = LOOK.site;
document.title = SITE.title;
$('.brand-name').textContent = SITE.brand;
$('.links').innerHTML = SITE.links.map((l) => `<a href="#">${l}</a>`).join('');
$('.cta').textContent = SITE.cta;
$('.eyebrow').textContent = SITE.eyebrow;
$('#sc-title').innerHTML = SITE.h2;
$('.lede').textContent = SITE.lede;
$('.more').textContent = SITE.more;
carousel.setAttribute('aria-label', LOOK.label);
$('.credit-line').textContent = LOOK.credit;

// ================================================================================================================
// STAGE 2 · a card: the window and its picture
// ================================================================================================================
const n = LOOK.cards.length;
function card(data, i) {
  const node = $('#card').content.firstElementChild.cloneNode(true);
  const c = { el: node, win: $('.win', node), pic: $('.pic', node), glare: $('.glare', node), info: $('.info', node), data, i };
  if (data.all) {                                            // the last card: a mosaic of the others, and the way to all of them
    node.classList.add('is-all');
    c.pic.remove();
    c.pic = document.createElement('div');
    c.pic.className = 'pic mosaic';
    c.pic.innerHTML = LOOK.cards.filter((o) => o.img).map((o) => `<i style="background-image:url('${o.img}')"></i>`).join('');
    c.win.prepend(c.pic);
  } else {
    c.pic.src = data.img;
    c.pic.alt = data.name;
    c.pic.addEventListener('error', () => c.win.classList.add('is-empty'), { once: true });   // a picture still to come
  }
  c.info.innerHTML = data.html;
  c.shade = document.createElement('i');
  c.shade.className = 'shade';
  c.win.append(c.shade);
  // every card stands over a glossy floor: a flipped copy below it — the picture for films and cars, the whole frame
  // (mat, picture and caption) for icons
  const r = document.createElement('div');
  r.className = 'refl';
  r.setAttribute('aria-hidden', 'true');
  if (look === 'icons') { r.classList.add('frame'); r.append(c.win.cloneNode(true), c.info.cloneNode(true)); }
  else r.append(c.pic.cloneNode(true));
  c.reflPic = r.querySelector('.pic');
  c.reflPic.removeAttribute('alt');
  c.refl = r;
  node.append(r);
  rigIn.append(node);
  return c;
}

// ================================================================================================================
// STAGE 3 · the carousel's position, and the mechanic that lays it out
// ================================================================================================================
const probe = MECH[look]({ rig: rigIn, cards: [], n, calm, spring, critical });   // ask the mechanic how it wants to be laid out
rigIn.replaceChildren();
const cards = [];
for (let r = 0; r < probe.repeat; r++) LOOK.cards.forEach((d, i) => cards.push(card(d, i)));
cards.forEach((c, k) => { c.el.setAttribute('aria-label', `${c.i + 1} of ${n}: ${c.data.name}`); if (k >= n) c.el.setAttribute('aria-hidden', 'true'); });
const mech = MECH[look]({ rig: rigIn, cards, n, calm, spring, critical });

// the whole rig is drawn for a phone and scaled up on wider screens (and a little down on the narrowest)
let sc = 1;
new ResizeObserver(() => {
  sc = clamp(Math.min(rig.clientWidth / 430, rig.clientHeight / 430), 0.82, 1.7);
  rigIn.style.transform = `scale(${sc.toFixed(3)})`;
}).observe(rig);

const pos = new Spring(0, spring(140, 22));                // the position, in cards; the target is always a whole card
const wrapped = (v) => (((v % n) + n) % n);
const active = () => wrapped(Math.round(pos.value));

// ================================================================================================================
// STAGE 4 · moving: drag and throw, the arrows, the dots, the keys, the wheel
// ================================================================================================================
function go(by) { pos.target = Math.round(pos.target) + by; wake(); }
function goTo(i) {                                           // the nearest way round to card i
  const now = Math.round(pos.target), diff = (((i - wrapped(now)) % n) + n) % n;
  pos.target = now + (diff > n / 2 ? diff - n : diff);
  wake();
}
$('.prev').addEventListener('click', () => go(-1));
$('.next').addEventListener('click', () => go(1));
carousel.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); go(-1); }
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); go(1); }
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(cards[active()]); }
});
LOOK.cards.forEach((d, i) => {
  const b = document.createElement('button');
  b.className = 'dot';
  b.type = 'button';
  b.setAttribute('role', 'tab');
  b.setAttribute('aria-label', d.name);
  b.addEventListener('click', () => goTo(i));
  dotsEl.append(b);
});

// which card a tap is on: the nearest one to the front whose window covers the point. Worked out from the cards'
// boxes on screen — the browser's own hit-testing is not reliable through the 3D transforms
function cardAt(x, y) {
  const off = (c) => Math.abs((((c.i - pos.value) % n) + n * 1.5) % n - n / 2);
  return [...cards].sort((a, b) => off(a) - off(b)).find((c) => {
    if (+(c.el.style.opacity || 1) < 0.3) return false;
    const r = c.win.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  });
}

// a drag moves the position with the pointer; let go and it carries on with the speed it had, landing on a card
let drag = null;
rig.addEventListener('pointerdown', (e) => {
  if (e.button !== 0) return;
  drag = { x: e.clientX, y: e.clientY, from: pos.value, moved: false, samples: [{ p: pos.value, at: performance.now() }] };
  rig.setPointerCapture(e.pointerId);
});
rig.addEventListener('pointermove', (e) => {
  aim(e);
  if (!drag) return;
  const k = sc;                                              // the rig is scaled to the screen
  const along = mech.axis === 'y' ? -(e.clientY - drag.y) : -(e.clientX - drag.x);
  if (!drag.moved && Math.abs(along) < 4) return;
  drag.moved = true;
  rig.classList.add('is-dragging');
  pos.value = pos.target = drag.from + along / k / mech.unit;
  pos.velocity = 0;
  drag.samples.push({ p: pos.value, at: performance.now() });   // the page's clock (the same one the springs run on)
  if (drag.samples.length > 6) drag.samples.shift();
  wake();
});
// the drag's speed in cards a second, from the last 0.1 s of it only: a drag that has stopped does not throw
function dragSpeed() {
  const now = performance.now(), s = drag.samples.filter((p) => now - p.at < 100);
  return s.length > 1 ? (s.at(-1).p - s[0].p) / Math.max(1, s.at(-1).at - s[0].at) * 1000 : 0;
}
const release = (e) => {
  if (!drag) return;
  const v = dragSpeed();
  if (drag.moved) {
    pos.velocity = calm ? 0 : v;
    pos.target = Math.round(pos.value + (calm ? 0 : clamp(v * 0.28, -3, 3)));
  } else if (e.type === 'pointerup') {                       // a tap: the front card opens, any other comes to the front
    const c = cardAt(e.clientX, e.clientY);
    if (c && c.i === active() && Math.abs(pos.value - pos.target) < 0.05) openDetail(c); else if (c) goTo(c.i);
  }
  drag = null;
  rig.classList.remove('is-dragging');
  wake();
};
rig.addEventListener('pointerup', release);
rig.addEventListener('pointercancel', release);
let wheelSum = 0;
rig.addEventListener('wheel', (e) => {
  const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  if (mech.axis === 'x' && Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;   // a vertical wheel scrolls the page past a sideways carousel
  e.preventDefault();
  wheelSum += d;
  if (Math.abs(wheelSum) > 60) { go(Math.sign(wheelSum)); wheelSum = 0; }
}, { passive: false });

// ================================================================================================================
// STAGE 6 · the tilt, the words for screen readers, and the loop     (stage 5, the mechanics, is mechanics.js)
// ================================================================================================================
const tx = new Spring(0, spring(120, 14)), ty = new Spring(0, spring(120, 14));
function aim(e) {                                            // the front card leans towards the pointer
  if (calm || drag?.moved) { tx.target = ty.target = 0; return; }
  const r = rig.getBoundingClientRect();
  tx.target = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
  ty.target = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
  wake();
}
rig.addEventListener('pointerleave', () => { tx.target = ty.target = 0; wake(); });

let shown = -1;
function tell() {
  const a = active();
  if (a === shown) return;
  shown = a;
  [...dotsEl.children].forEach((d, i) => d.setAttribute('aria-selected', String(i === a)));
  live.textContent = `${LOOK.cards[a].name}, ${a + 1} of ${n}`;
}

const glows = [...document.querySelectorAll('.amb .glow')];
let running = false, last = 0, quiet = false;
function wake() { quiet = false; if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
function frame(now) {
  const dt = Math.min(0.032, Math.max(0, (now - last) / 1000));
  last = now;
  if (!drag?.moved) pos.step(dt);
  tx.step(dt); ty.step(dt);
  const t = studio.now() / 1000;
  const still = pos.resting(0.0005) && tx.resting(0.001) && ty.resting(0.001) && !drag;
  if (!(still && quiet)) {                                   // nothing moving and the look has settled: nothing to redraw
    mech.frame({ pos: pos.value, vel: drag?.moved ? dragSpeed() : pos.velocity,
      tx: tx.value, ty: ty.value, dt, t, active: active() });
    for (const c of cards) if (c.reflPic && c.reflPic.style.transform !== c.pic.style.transform) c.reflPic.style.transform = c.pic.style.transform;
  }
  quiet = still && (mech.idle ? mech.idle() : false);
  tell();
  const amb = calm ? 0 : t;
  glows.forEach((el, i) => (el.style.transform = `translate(${(Math.sin(amb * (0.13 + i * 0.05) + i * 2) * 26).toFixed(1)}px, ${(Math.cos(amb * (0.11 + i * 0.04) + i) * 18).toFixed(1)}px)`));
  if (!calm || !still) requestAnimationFrame(frame); else running = false;
}
wake();

// ================================================================================================================
// STAGE 7 · the detail: tap the front card and it opens — the picture flies from the card into a sheet (a panel on
// wider screens) with everything behind it. A real dialog: focus moves in and is kept there, Escape or a tap outside
// closes it, and focus comes back to the carousel.
// ================================================================================================================
const dialog = $('.detail'), media = $('.dt-media'), dPic = $('.dt-pic'), dLamps = $('.dt-lamps'), dBody = $('.dt-body'), sheet = $('.dt-sheet');
const ease = 'cubic-bezier(.2, .8, .2, 1)';
const real = cards.filter((c) => c.i < n && !c.data.all);   // the cards that open (not See all)
const pad = (v) => String(v).padStart(2, '0');
let opened = null;

// cars: each figure against the rest of the hall — the bar under it is full for the best of the six (for 0–100, the quickest)
const FIG = (html) => [...html.matchAll(/<b data-to="([\d.]+)"(?: data-dp="(\d)")?>[^<]*<\/b>([^<]+)/g)].map(([, to, dp, unit]) => ({ to: +to, dp: +(dp || 0), unit }));
const best = look === 'cars' ? FIG(real[0].data.html).map((f, j) => {
  const all = real.map((c) => FIG(c.data.html)[j].to);
  return /0–100/.test(f.unit) ? { low: true, v: Math.min(...all) } : { low: false, v: Math.max(...all) };
}) : [];
const FORMATS = ['Laser 4K', 'Dolby Atmos', 'Laser 4K', 'Late show'];

const DETAIL = {
  films: (d, m) => `
    <p class="dt-kicker">Now showing · Aurora Cinemas</p>
    <h3 id="dt-title">${d.name}</h3>
    <p class="dt-meta"><span class="dt-cert">${m.cert}</span>${d.html.match(/f-meta">([^·]+)·([^·]+)·/).slice(1, 3).join('·')}· ${m.genre}</p>
    <div class="dt-rate">${d.html.match(/<span class="f-rate"[^]*?<\/span>/)[0]}<p>Directed by <b>${d.html.match(/f-meta">[^<]*· ([^<]+)<\/p>/)[1]}</b><br>With ${m.cast}</p></div>
    <p class="dt-text">${m.plot}</p>
    <p class="dt-label">Today · choose a time</p>
    <div class="dt-times" role="radiogroup" aria-label="Showtimes">${m.times.map((t, i) => `<button type="button" role="radio" aria-checked="${i === 1}"><b>${t}</b><small>${FORMATS[i]}</small></button>`).join('')}</div>
    <div class="dt-acts"><a class="dt-cta" href="#"><span>Book <b>${m.times[1]}</b> · from $14</span></a><a class="dt-ghost" href="#">▶&nbsp; Trailer</a></div>`,
  icons: (d, m) => `
    <p class="dt-kicker">${d.html.match(/pg-no">([^<]+)/)[1]} · The autumn window</p>
    <h3 id="dt-title">${d.html.match(/pg-name">([^<]+)/)[1]}</h3>
    <p class="dt-meta">${d.html.match(/pg-line">([^<]+)/)[1]}</p>
    <p class="dt-text">${d.html.match(/pg-text">([^<]+)/)[1]}</p>
    <dl class="dt-facts">${m.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <div class="dt-acts"><a class="dt-cta" href="#">Read the story</a><a class="dt-ghost" href="#">Save to list</a></div>
    <p class="dt-folio">Objet &amp; Co. — Issue No. 07</p>`,
  cars: (d, m) => `
    <p class="dt-kicker"><span class="dt-lot">Lot ${pad(d.i + 1)}</span>${d.html.match(/c-year">([^<]+)/)[1]} · Redline Collection</p>
    <h3 id="dt-title">${d.html.match(/c-name">([^<]+)/)[1]}</h3>
    <p class="dt-meta">${m.engine}</p>
    <div class="dt-specs">${FIG(d.html).map((f, j) => `<span><b data-to="${f.to}" data-dp="${f.dp}">0</b>${f.unit}
      <i class="dt-bar"><i style="--v:${(best[j].low ? best[j].v / f.to : f.to / best[j].v).toFixed(3)}"></i></i></span>`).join('')}</div>
    <p class="dt-text">${m.story}</p>
    <dl class="dt-facts">${m.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    <div class="dt-acts"><a class="dt-cta" href="#">Book a viewing</a><a class="dt-ghost" href="#">Track days</a></div>`,
};

// fill the dialog with a card: its picture (and, for cars, its own headlights), the words behind it, the count
function fill(c) {
  opened = c;
  dPic.src = c.data.img;
  dPic.alt = c.data.name;
  dLamps.innerHTML = c.data.lamps ? c.data.lamps.map(([x, y, w, h, r, kind]) =>
    `<i class="lamp ${kind}" style="left:${x}%;top:${y}%;width:${w}%;padding-top:${h}%;--rot:${r}deg"></i>`).join('') : '';
  if (look === 'films') sheet.style.setProperty('--poster', `url("${c.data.img.replace('img/', 'img/blur/')}")`);
  dBody.innerHTML = DETAIL[look]({ ...c.data, i: c.i }, MORE[c.data.name]);
  $('.dt-count').textContent = `${pad(real.indexOf(c) + 1)} / ${pad(real.length)}`;
  // the figures count up, the bars fill, the headlights flash — as on the card
  const nums = [...dBody.querySelectorAll('[data-to]')], start = performance.now();
  (function count(now) {
    const k = calm ? 1 : Math.min(1, (now - start - 250) / 900), e = 1 - (1 - Math.max(0, k)) ** 3;
    nums.forEach((b) => (b.textContent = (+b.dataset.to * e).toFixed(+b.dataset.dp)));
    dBody.style.setProperty('--fill', e.toFixed(3));
    if (k < 1 && opened === c) requestAnimationFrame(count);
  })(start);
  dLamps.classList.remove('is-flash'); void dLamps.offsetWidth; dLamps.classList.add('is-flash');
}

function openDetail(c) {
  if (!c || c.data.all || !MORE[c.data.name] || dialog.open) return;
  fill(c);
  dialog.showModal();
  html.classList.add('is-locked');
  dialog.classList.remove('is-shut');
  // the picture flies from the card into place; the sheet and the words fade in round it
  const from = c.win.getBoundingClientRect(), to = media.getBoundingClientRect();
  const t = calm ? 0 : 1;
  media.animate([{ transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width}, ${from.height / to.height})` },
    { transform: 'none' }], { duration: 560 * t, easing: ease });
  sheet.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320 * t, easing: 'ease-out' });
  for (const el of [dBody, $('.dt-tools')]) el.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 460 * t, delay: 160 * t, easing: ease, fill: 'backwards' });
  $('.dt-close').focus();
}

// the next or the previous one, without closing: the words slide over, the picture crossfades, and the carousel
// follows underneath so closing flies back to the right card
function step(by) {
  if (!dialog.open || dialog.classList.contains('is-shut')) return;
  const c = real[(real.indexOf(opened) + by + real.length) % real.length], t = calm ? 0 : 1;
  goTo(c.i);
  const out = dBody.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-by * 24}px)` }], { duration: 160 * t, easing: 'ease-in', fill: 'forwards' });
  media.animate([{ opacity: 1 }, { opacity: 0.2 }], { duration: 160 * t, easing: 'ease-in' });
  out.finished.then(() => {
    fill(c);
    out.cancel();
    dBody.animate([{ opacity: 0, transform: `translateX(${by * 24}px)` }, { opacity: 1, transform: 'none' }], { duration: 380 * t, easing: ease });
    media.animate([{ opacity: 0.2, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }], { duration: 480 * t, easing: ease });
  });
}

function closeDetail() {
  if (!dialog.open || dialog.classList.contains('is-shut')) return;
  dialog.classList.add('is-shut');
  const c = opened, from = media.getBoundingClientRect(), to = c.win.getBoundingClientRect(), t = calm ? 0 : 1;
  sheet.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 * t, delay: 80 * t, easing: 'ease-in', fill: 'forwards' });
  for (const el of [dBody, $('.dt-tools')]) el.animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(12px)' }], { duration: 180 * t, easing: 'ease-in', fill: 'forwards' });
  const fly = media.animate([{ transform: 'none' }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width}, ${to.height / from.height})` }],
    { duration: 420 * t, easing: ease, fill: 'forwards' });
  fly.finished.then(() => {
    dialog.close();
    html.classList.remove('is-locked');
    dialog.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    carousel.focus({ preventScroll: true });
  });
}

$('.dt-close').addEventListener('click', closeDetail);
$('.dt-prev').addEventListener('click', () => step(-1));
$('.dt-next').addEventListener('click', () => step(1));
dialog.addEventListener('keydown', (e) => {
  if (e.target.closest('.dt-times')) return;                 // the arrow keys there move between the times
  if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
});
dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDetail(); });   // Escape
dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDetail(); });   // a tap outside the panel
dBody.addEventListener('click', (e) => {
  const time = e.target.closest('.dt-times button');
  if (time) {                                                // films: choose a time, the button books it
    dBody.querySelectorAll('.dt-times button').forEach((b) => b.setAttribute('aria-checked', String(b === time)));
    dBody.querySelector('.dt-cta b').textContent = time.querySelector('b').textContent;
  }
  if (e.target.closest('a[href="#"]')) e.preventDefault();
});

// the touch circle, for the video
const touch = $('.touch');
let down = false;
const showTouch = (e) => { touch.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; touch.classList.add('is-on'); };
addEventListener('pointerdown', (e) => { down = true; showTouch(e); });
addEventListener('pointermove', (e) => { if (down) showTouch(e); });
addEventListener('pointerup', () => { down = false; touch.classList.remove('is-on'); });

// for scripts and the tutorial's console
window.__cards = { go, goTo, open: (i = active()) => openDetail(cards[i]), close: closeDetail, state: () => ({ pos: +pos.value.toFixed(3), active: active(), name: LOOK.cards[active()].name }) };
