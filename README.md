# Cards carousel — UI component

**[Live demo](https://domvybe.com/components/cards-carousel/)** · [Step-by-step tutorial](https://domvybe.com/library/cards-carousel/) · [Download the ZIP](https://github.com/UlviShabanbayli/domvybe-cards-carousel/releases/latest/download/cards-carousel-source.zip)

A carousel of picture cards that never runs out: drag, throw and snap it; films line a curved screen, framed products swing on threads, cars drift in on tyre smoke; three looks.

Open `index.html` through any local static server (for example `python3 -m http.server`) and try it with a mouse,
a finger or the keyboard. Plain HTML, CSS and JavaScript; no build step, no libraries.

- `index.html` — the component and its stage
- `style.css` — the look (colours are variables at the top)
- `app.js` — the interaction and the animation
- `mechanics.js` — the three ways the cards move (films, icons, cars): each turns the one position into a picture
- `spring.js` — a small spring, written from scratch, that every motion uses
- `img` — the pictures: products and cars generated with Google Gemini (unofficial, not official photos); the film posters are placeholders (see below)

The film posters in the live demo are © their studios and shown there for illustration only, so they are not in this
download: `img/film-*.jpg` and `img/blur/film-*.jpg` are plain placeholder gradients with the same names and sizes.
Put your own posters (2:3) in their place, and a tiny blurred copy of each in `img/blur/` (the detail's backdrop).
The product and car pictures were generated with Google Gemini; they are not official photos of those products.

It respects `prefers-reduced-motion`. Made by Ulvi (Code with Ulvi) · domvybe.com

## Licence

MIT — see [LICENSE](LICENSE). Use it in your own projects, commercial ones included.
