// tools/apply_logo_styles.mjs
import fs from 'fs';

const cssPath = 'public/styles.css';
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Update .brand and add .header-game-logo
const oldBrand = `.brand {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #f7d268;
  text-shadow: 0 2px 8px rgba(245, 202, 86, 0.4), 1px 2px #221405;
  display: flex;
  align-items: center;
  gap: 8px;
}`;

const newBrand = `.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.header-game-logo {
  height: 42px;
  width: auto;
  max-width: 220px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.85));
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease;
  cursor: pointer;
}

.header-game-logo:hover {
  transform: scale(1.04);
  filter: drop-shadow(0 0 10px rgba(247, 210, 104, 0.5)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9));
}`;

// Normalize line breaks for matching
const normalize = (str) => str.replace(/\r\n/g, '\n');

if (normalize(css).includes(normalize(oldBrand))) {
  css = normalize(css).replace(normalize(oldBrand), normalize(newBrand));
} else {
  console.log('Old brand block not found by exact string, checking if already updated');
}

// 2. Update .menu-hero-card and .menu-seal
const oldMenuCard = `.menu-hero-card {
  width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #ede5cf;
  text-shadow: 0 2px 4px #000;
  animation: menu-hero-in 0.8s ease-out both;
}

.menu-seal {
  width: 280px;
  height: 280px;
  display: grid;
  place-items: center;
  background: none;
  image-rendering: auto;
  filter: drop-shadow(0 0 24px rgba(220, 165, 60, 0.2));
}

.menu-seal img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.55));
}`;

const newMenuCard = `.menu-hero-card {
  width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #ede5cf;
  text-shadow: 0 2px 4px #000;
  animation: menu-hero-in 0.8s ease-out both;
}

.menu-seal {
  width: 300px;
  height: 125px;
  display: grid;
  place-items: center;
  background: none;
  image-rendering: auto;
  filter: drop-shadow(0 0 24px rgba(220, 165, 60, 0.25));
  margin-bottom: 12px;
}

.menu-seal img, .menu-hero-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.75));
  transition: transform 0.3s ease;
}

.menu-seal img:hover, .menu-hero-logo:hover {
  transform: scale(1.03);
}`;

if (normalize(css).includes(normalize(oldMenuCard))) {
  css = normalize(css).replace(normalize(oldMenuCard), normalize(newMenuCard));
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('styles.css updated with logo styles!');
