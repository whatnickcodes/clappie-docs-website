// ═══════════════════════════════════════════════════════════════════════════
// CLAPPIE DOCS FOOTER - Extended pixel art garden scene
// ═══════════════════════════════════════════════════════════════════════════

// Dog sprite (the logo!)
export const dogSprite = `   ▖ ▖
▗ █▜▛█
 ▛▛▛▛▀`;

// Crab sprite (friend!) - commented out
// export const crabSprite = ` ▐▛███▜▌
// ▝▜█████▛▘
//   ▘▘ ▝▝`;

// Bee sprite
export const beeSprite = `▄▀▄
█▀█
 ▀`;

// Butterfly sprite
export const butterflySprite = `▜▄▛
 █
▟▀▙`;

// ─────────────────────────────────────────────────────────────────────────────
// PIXEL FONT (5x7 pixels per character) - for title rendering
// ─────────────────────────────────────────────────────────────────────────────

export const PIXEL_FONT = {
  'A': ['  ##  ', ' #  # ', '#    #', '######', '#    #', '#    #', '#    #'],
  'B': ['##### ', '#    #', '#    #', '##### ', '#    #', '#    #', '##### '],
  'C': [' #####', '#     ', '#     ', '#     ', '#     ', '#     ', ' #####'],
  'D': ['#### ', '#   #', '#    #', '#    #', '#    #', '#   # ', '#### '],
  'E': ['######', '#     ', '#     ', '####  ', '#     ', '#     ', '######'],
  'F': ['######', '#     ', '#     ', '####  ', '#     ', '#     ', '#     '],
  'G': [' #### ', '#     ', '#     ', '#  ###', '#    #', '#    #', ' #### '],
  'H': ['#    #', '#    #', '#    #', '######', '#    #', '#    #', '#    #'],
  'I': ['######', '  #   ', '  #   ', '  #   ', '  #   ', '  #   ', '######'],
  'J': ['   ###', '    # ', '    # ', '    # ', '    # ', '#   # ', ' ###  '],
  'K': ['#    #', '#   # ', '#  #  ', '###   ', '#  #  ', '#   # ', '#    #'],
  'L': ['#     ', '#     ', '#     ', '#     ', '#     ', '#     ', '######'],
  'M': ['#    #', '##  ##', '# ## #', '#    #', '#    #', '#    #', '#    #'],
  'N': ['#    #', '##   #', '# #  #', '#  # #', '#   ##', '#    #', '#    #'],
  'O': [' #### ', '#    #', '#    #', '#    #', '#    #', '#    #', ' #### '],
  'P': ['##### ', '#    #', '#    #', '##### ', '#     ', '#     ', '#     '],
  'Q': [' #### ', '#    #', '#    #', '#    #', '#  # #', '#   # ', ' ### #'],
  'R': ['##### ', '#    #', '#    #', '##### ', '#  #  ', '#   # ', '#    #'],
  'S': [' #####', '#     ', '#     ', ' #### ', '     #', '     #', '##### '],
  'T': ['######', '  #   ', '  #   ', '  #   ', '  #   ', '  #   ', '  #   '],
  'U': ['#    #', '#    #', '#    #', '#    #', '#    #', '#    #', ' #### '],
  'V': ['#    #', '#    #', '#    #', '#    #', ' #  # ', ' #  # ', '  ##  '],
  'W': ['#    #', '#    #', '#    #', '#    #', '# ## #', '##  ##', '#    #'],
  'X': ['#    #', ' #  # ', '  ##  ', '  #   ', '  ##  ', ' #  # ', '#    #'],
  'Y': ['#    #', ' #  # ', '  ##  ', '  #   ', '  #   ', '  #   ', '  #   '],
  'Z': ['######', '    # ', '   #  ', '  #   ', ' #    ', '#     ', '######'],
  ' ': ['   ', '   ', '   ', '   ', '   ', '   ', '   '],
  '-': ['      ', '      ', '      ', '######', '      ', '      ', '      '],
  '.': ['  ', '  ', '  ', '  ', '  ', '##', '##'],
};

// Smaller 3x5 font for lead text
export const SMALL_FONT = {
  'A': ['###', '# #', '###', '# #', '# #'],
  'B': ['## ', '# #', '## ', '# #', '## '],
  'C': ['###', '#  ', '#  ', '#  ', '###'],
  'D': ['## ', '# #', '# #', '# #', '## '],
  'E': ['###', '#  ', '## ', '#  ', '###'],
  'F': ['###', '#  ', '## ', '#  ', '#  '],
  'G': ['###', '#  ', '# #', '# #', '###'],
  'H': ['# #', '# #', '###', '# #', '# #'],
  'I': ['###', ' # ', ' # ', ' # ', '###'],
  'J': ['  #', '  #', '  #', '# #', '###'],
  'K': ['# #', '## ', '#  ', '## ', '# #'],
  'L': ['#  ', '#  ', '#  ', '#  ', '###'],
  'M': ['# #', '###', '# #', '# #', '# #'],
  'N': ['# #', '###', '###', '# #', '# #'],
  'O': ['###', '# #', '# #', '# #', '###'],
  'P': ['###', '# #', '###', '#  ', '#  '],
  'Q': ['###', '# #', '# #', '###', '  #'],
  'R': ['###', '# #', '## ', '# #', '# #'],
  'S': ['###', '#  ', '###', '  #', '###'],
  'T': ['###', ' # ', ' # ', ' # ', ' # '],
  'U': ['# #', '# #', '# #', '# #', '###'],
  'V': ['# #', '# #', '# #', '# #', ' # '],
  'W': ['# #', '# #', '# #', '###', '# #'],
  'X': ['# #', '# #', ' # ', '# #', '# #'],
  'Y': ['# #', '# #', '###', ' # ', ' # '],
  'Z': ['###', '  #', ' # ', '#  ', '###'],
  ' ': ['  ', '  ', '  ', '  ', '  '],
  '.': ['  ', '  ', '  ', '  ', '# '],
  '-': ['   ', '   ', '###', '   ', '   '],
};

// ─────────────────────────────────────────────────────────────────────────────
// PIXEL TITLE GENERATOR - Uses half-block characters
// ─────────────────────────────────────────────────────────────────────────────

export function generatePixelTitle(text) {
  const rows = 7; // font height

  // Seeded random for consistent builds
  let seed = 12345;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  // Build each letter as its own block
  const letters = [];
  for (const char of text.toUpperCase()) {
    const glyph = PIXEL_FONT[char] || PIXEL_FONT[' '];
    const letterLines = [];

    for (let row = 0; row < rows; row += 2) {
      const topRow = glyph[row] || '';
      const bottomRow = glyph[row + 1] || '';
      let line = '';

      for (let col = 0; col < Math.max(topRow.length, bottomRow.length); col++) {
        const top = topRow[col] === '#';
        const bottom = bottomRow[col] === '#';

        let ch;
        if (top && bottom) ch = '█';
        else if (top) ch = '▀';
        else if (bottom) ch = '▄';
        else ch = ' ';

        // Wrap non-space chars in span with random explosion values
        if (ch !== ' ') {
          const tx = Math.round((random() - 0.5) * 200);
          const ty = Math.round((random() - 0.5) * 150);
          const r = Math.round((random() - 0.5) * 720);
          const scale = (0.6 + random() * 0.8).toFixed(2);
          const hue = Math.round((random() - 0.5) * 60); // ±30deg hue shift
          const br = Math.round(random() * 50); // 0-50% border radius
          line += `<span class="px" style="--tx:${tx}px;--ty:${ty}px;--r:${r}deg;--s:${scale};--h:${hue}deg;--br:${br}%">${ch}</span>`;
        } else {
          line += ' ';
        }
      }
      letterLines.push(line);
    }

    letters.push(`<span class="pl">${letterLines.join('\n')}</span>`);
  }

  return letters.join('');
}

// Generate small pixel text for lead/subtitle
export function generatePixelLead(text) {
  const rows = 5;
  const lines = [];

  for (let row = 0; row < rows; row += 2) {
    let line = '';
    for (const char of text.toUpperCase()) {
      const glyph = SMALL_FONT[char] || SMALL_FONT[' '];
      const topRow = glyph[row] || '';
      const bottomRow = glyph[row + 1] || '';

      for (let col = 0; col < Math.max(topRow.length, bottomRow.length); col++) {
        const top = topRow[col] === '#';
        const bottom = bottomRow[col] === '#';

        if (top && bottom) line += '█';
        else if (top) line += '▀';
        else if (bottom) line += '▄';
        else line += ' ';
      }
      line += ' '; // char spacing
    }
    lines.push(line);
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// EXTENDED GARDEN SCENE - More flowers, more grass, more life!
// ─────────────────────────────────────────────────────────────────────────────

// Grass colors
const G1 = 'rgb(34,85,51)';    // darkest
const G2 = 'rgb(45,106,64)';
const G3 = 'rgb(56,128,77)';
const G4 = 'rgb(72,155,95)';
const G5 = 'rgb(100,180,70)';  // brightest

// Flower colors
const PINK = 'rgb(255,150,180)';
const PURPLE = 'rgb(170,100,210)';
const ORANGE = 'rgb(255,160,70)';
const WHITE = 'rgb(250,250,240)';
const YELLOW = 'rgb(255,220,80)';
const RED = 'rgb(230,90,90)';
const BLUE = 'rgb(100,160,220)';
const CORAL = 'rgb(217,119,87)';

// Sprite colors
const DOG_COLOR = 'rgb(180,130,90)';
const CRAB_COLOR = 'rgb(217,119,87)';

// Helper to create a colored span
const c = (color, char) => `<span style="color:${color}">${char}</span>`;

// Build extended garden scene with more flowers
const flowerRow1 = `${c(PINK,'▄')}      ${c(RED,'▄')}         ${c(PURPLE,'▄')}        ${c(BLUE,'▄')}                ${c(ORANGE,'▄')}${c(ORANGE,'█')}${c(ORANGE,'▄')}    ${c(WHITE,'▄')}          ${c(PINK,'▄')}        ${c(YELLOW,'▄')}`;
const flowerRow2 = `${c(PINK,'▀')}${c(YELLOW,'█')}${c(PINK,'▀')}    ${c(RED,'▀')}${c(YELLOW,'█')}${c(RED,'▀')}       ${c(PURPLE,'▀')}${c(YELLOW,'█')}${c(PURPLE,'▀')}      ${c(BLUE,'▀')}${c(YELLOW,'█')}${c(BLUE,'▀')}              ${c(ORANGE,'█')}      ${c(WHITE,'▀')}${c(YELLOW,'█')}${c(WHITE,'▀')}        ${c(PINK,'▀')}${c(YELLOW,'█')}${c(PINK,'▀')}      ${c(YELLOW,'▀')}${c(YELLOW,'█')}${c(YELLOW,'▀')}`;
const flowerRow3 = ` ${c(G5,'█')}        ${c(G5,'█')}           ${c(G5,'█')}          ${c(G5,'█')}                ${c(ORANGE,'█')}        ${c(G5,'█')}            ${c(G5,'█')}          ${c(G5,'█')}`;

// Flower sprite helper
const flower = (petal, stem = G5) => ` ${c(petal,'▄')}
${c(petal,'▀')}${c(YELLOW,'█')}${c(petal,'▀')}
 ${c(stem,'█')}`;

// Grass detail row - repeat pattern 3x for width
const grassUnit = `${c(G3,'▌')} ${c(G2,'▖')}${c(G3,'▟')}${c(G4,'█')}${c(G3,'▗')}${c(G2,'▄')}${c(G2,'▄')}${c(G2,'▄')}${c(G2,'▄')}${c(G3,'▄')}${c(G4,'▌')} ${c(G3,'▄')}${c(G4,'▌')}${c(G4,'▌')}${c(G3,'▐')}${c(G3,'▄')}${c(G4,'▐')} ${c(G3,'▙')}${c(G2,'▖')}${c(G4,'▙')}${c(G3,'▄')}${c(G2,'▖')}${c(G2,'▖')}${c(G2,'▗')}${c(G5,'█')}${c(G2,'▄')}${c(G3,'▐')}${c(G3,'▐')} ${c(G3,'▖')} ${c(G4,'▙')}${c(G2,'▗')}${c(G4,'▟')}${c(G3,'▖')}${c(G2,'▗')}${c(G2,'▄')}${c(G4,'█')}${c(G3,'█')}${c(G3,'▗')}${c(G3,'▙')}${c(G4,'▙')}${c(G2,'▄')}${c(G2,'▖')}${c(G4,'▌')}${c(G5,'█')}${c(G4,'▟')} ${c(G4,'▐')}${c(G2,'▄')}${c(G2,'▗')}${c(G3,'▗')}${c(G2,'▗')}${c(G4,'█')}${c(G4,'▟')}${c(G2,'▄')}${c(G5,'█')}${c(G4,'█')}${c(G3,'▄')}${c(G3,'█')}${c(G2,'▄')}${c(G3,'█')}${c(G3,'▗')}${c(G3,'▗')}${c(G2,'▖')}${c(G4,'█')}${c(G3,'▙')}${c(G4,'▙')}${c(G2,'▖')}${c(G5,'█')} ${c(G3,'▖')}${c(G3,'▙')}${c(G2,'▗')}${c(G4,'▟')}${c(G2,'▗')}${c(G3,'▐')}${c(G4,'▌')} ${c(G2,'▖')}${c(G3,'▟')}${c(G4,'█')}${c(G3,'▗')}${c(G2,'▄')}${c(G3,'▄')}${c(G2,'▄')}${c(G4,'▌')}`;
const grassRow = grassUnit + grassUnit + grassUnit;

// Base row - solid dark green
const baseChar = c(G1,'█');
const baseRow = baseChar.repeat(300);

// Flower positions (base %)
const FLOWER_POSITIONS = [5, 15, 25, 38, 52, 65, 78, 90];

// All petal colors for randomization
const PETAL_COLORS = [PINK, RED, PURPLE, BLUE, ORANGE, WHITE, YELLOW, CORAL];
const STEM_COLORS = [G3, G4, G5];

export const footerHTML = `
<footer class="garden-footer">
  <div class="garden-container">
    <div class="garden-scene">
${grassRow}
${baseRow}
    </div>
    <div class="flower-sprite" data-base="5"></div>
    <div class="flower-sprite" data-base="15"></div>
    <div class="flower-sprite" data-base="25"></div>
    <div class="flower-sprite" data-base="38"></div>
    <div class="flower-sprite" data-base="52"></div>
    <div class="flower-sprite" data-base="65"></div>
    <div class="flower-sprite" data-base="78"></div>
    <div class="flower-sprite" data-base="90"></div>
    <div class="sprites-layer">
      <div class="sprite-wrapper" id="dog-wrapper" title="woof!">
<span id="dog-sprite" style="color:rgb(180,130,90)">   ▖ ▖
▗ █▜▛█
 ▛▛▛▛▀</span>
      </div>
      <!-- <div class="sprite-wrapper" id="crab-wrapper" title="click click">
<span id="crab-sprite" style="color:rgb(217,119,87)"> ▐▛███▜▌
▝▜█████▛▘
  ▘▘ ▝▝</span>
      </div> -->
    </div>
  </div>
</footer>
<script>
(function() {
  // ═══════════════════════════════════════════════════════════════════════════
  // COLOR PALETTES
  // ═══════════════════════════════════════════════════════════════════════════

  const petalColors = [
    'rgb(255,150,180)',  // pink
    'rgb(230,90,90)',    // red
    'rgb(170,100,210)',  // purple
    'rgb(100,160,220)',  // blue
    'rgb(255,160,70)',   // orange
    'rgb(250,250,240)',  // white
    'rgb(255,220,80)',   // yellow
    'rgb(217,119,87)',   // coral
  ];

  const stemColors = [
    'rgb(56,128,77)',    // G3
    'rgb(72,155,95)',    // G4
    'rgb(100,180,70)',   // G5
  ];

  const yellowCenter = 'rgb(255,220,80)';

  // Sprite colors - vibrant & cute! (rgb for sprites, hex for CSS var)
  const spriteColors = [
    { rgb: 'rgb(255,142,198)', hex: '#ff8ec6' },   // pink (primary - dog default)
    { rgb: 'rgb(255,105,180)', hex: '#ff69b4' },  // hot-pink
    { rgb: 'rgb(87,207,255)', hex: '#57cfff' },   // sky-blue
    { rgb: 'rgb(180,255,105)', hex: '#b4ff69' },  // lime-green
    { rgb: 'rgb(138,43,226)', hex: '#8a2be2' },   // blue-violet
    { rgb: 'rgb(0,255,200)', hex: '#00ffc8' },    // aqua-mint
    { rgb: 'rgb(255,165,0)', hex: '#ffa500' },    // orange
    { rgb: 'rgb(255,99,71)', hex: '#ff6347' },    // tomato
    { rgb: 'rgb(147,112,219)', hex: '#9370db' },  // purple
    { rgb: 'rgb(64,224,208)', hex: '#40e0d0' },   // turquoise
    { rgb: 'rgb(255,215,0)', hex: '#ffd700' },    // gold
    { rgb: 'rgb(50,205,50)', hex: '#32cd32' },    // lime
    { rgb: 'rgb(255,20,147)', hex: '#ff1493' },   // deep-pink
    { rgb: 'rgb(0,191,255)', hex: '#00bfff' },    // deep-sky-blue
    { rgb: 'rgb(186,85,211)', hex: '#ba55d3' },   // orchid
  ];

  // Crab-only colors (doesn't affect page theme)
  const crabColors = [
    'rgb(217,119,87)',   // coral (crab default)
    'rgb(255,105,180)',  // hot-pink
    'rgb(87,207,255)',   // sky-blue
    'rgb(255,165,0)',    // orange
    'rgb(255,99,71)',    // tomato
    'rgb(64,224,208)',   // turquoise
    'rgb(255,215,0)',    // gold
    'rgb(50,205,50)',    // lime
  ];

  // Restore color preferences from localStorage
  let dogColorIndex = parseInt(localStorage.getItem('dogColor') || '0', 10) % spriteColors.length;
  let crabColorIndex = parseInt(localStorage.getItem('crabColor') || '0', 10) % crabColors.length;

  // ═══════════════════════════════════════════════════════════════════════════
  // FLOWER INITIALIZATION & HOVER
  // ═══════════════════════════════════════════════════════════════════════════

  function buildFlower(petal, stem, stemHeight) {
    const stemHtml = (' <span class="flower-stem" style="color:' + stem + '">█</span>\\n').repeat(stemHeight);
    return '<span class="flower-inner">' +
      ' <span class="flower-petal" style="color:' + petal + '">▄</span>\\n' +
      '<span class="flower-petal" style="color:' + petal + '">▀</span><span style="color:' + yellowCenter + '">█</span><span class="flower-petal" style="color:' + petal + '">▀</span>\\n' +
      stemHtml.trimEnd() + '</span>';
  }

  document.querySelectorAll('.flower-sprite').forEach((el, idx) => {
    const base = parseFloat(el.dataset.base);
    const offset = (Math.random() - 0.5) * 6;
    el.style.left = (base + offset) + '%';

    // Store original color for hover
    const petal = petalColors[Math.floor(Math.random() * petalColors.length)];
    const stem = stemColors[Math.floor(Math.random() * stemColors.length)];
    const stemHeight = Math.floor(Math.random() * 2) + 1;

    el.dataset.petal = petal;
    el.dataset.stem = stem;
    el.dataset.stemHeight = stemHeight;
    el.innerHTML = buildFlower(petal, stem, stemHeight);

    // Staggered entrance animation
    el.style.animationDelay = (idx * 0.08) + 's';

    // Hover: change color
    el.addEventListener('mouseenter', () => {
      const newPetal = petalColors[Math.floor(Math.random() * petalColors.length)];
      el.querySelectorAll('.flower-petal').forEach(p => p.style.color = newPetal);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // DOG & CRAB CLICK TO CHANGE COLOR
  // ═══════════════════════════════════════════════════════════════════════════

  const dogSprite = document.getElementById('dog-sprite');
  const crabSprite = document.getElementById('crab-sprite');
  const dogWrapper = document.getElementById('dog-wrapper');
  const crabWrapper = document.getElementById('crab-wrapper');

  // Set initial colors from saved preferences
  if (dogSprite) {
    const color = spriteColors[dogColorIndex];
    dogSprite.style.color = color.rgb;
    document.documentElement.style.setProperty('--primary', color.hex);
  }

  if (crabSprite) {
    crabSprite.style.color = crabColors[crabColorIndex];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SPRITE HELPERS - bubbles, dust, sparkles
  // ═══════════════════════════════════════════════════════════════════════════

  function spawnBubble(el, text) {
    const bubble = document.createElement('div');
    bubble.className = 'sprite-bubble';
    bubble.textContent = text;
    bubble.style.left = '50%';
    bubble.style.bottom = '100%';
    el.appendChild(bubble);
    setTimeout(() => bubble.remove(), 800);
  }

  function spawnDust(el) {
    for (let i = 0; i < 5; i++) {
      const dust = document.createElement('div');
      dust.className = 'sprite-dust';
      dust.style.left = (40 + Math.random() * 20) + '%';
      dust.style.setProperty('--dx', ((Math.random() - 0.5) * 30) + 'px');
      el.appendChild(dust);
      setTimeout(() => dust.remove(), 400);
    }
  }

  function spawnSparkleTrail(el) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sprite-sparkle';
    sparkle.textContent = ['✦', '✧', '★', '·'][Math.floor(Math.random() * 4)];
    sparkle.style.left = (Math.random() * 60 + 20) + '%';
    sparkle.style.bottom = (Math.random() * 30 + 10) + '%';
    sparkle.style.color = ['#ff8ec6', '#ffd700', '#57cfff', '#b4ff69'][Math.floor(Math.random() * 4)];
    el.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
  }

  // Double-click tracking
  let dogLastClick = 0;
  let crabLastClick = 0;

  if (dogWrapper && dogSprite) {
    dogWrapper.addEventListener('click', () => {
      const now = Date.now();

      // Double-click easter egg - BACKFLIP!
      if (now - dogLastClick < 300) {
        dogWrapper.classList.add('dog-backflip');
        for (let i = 0; i < 8; i++) {
          setTimeout(() => spawnSparkleTrail(dogWrapper), i * 80);
        }
        setTimeout(() => dogWrapper.classList.remove('dog-backflip'), 600);
        dogLastClick = 0;
        return;
      }
      dogLastClick = now;

      // Normal click - change color
      dogColorIndex = (dogColorIndex + 1) % spriteColors.length;
      localStorage.setItem('dogColor', dogColorIndex);
      const color = spriteColors[dogColorIndex];
      dogSprite.style.color = color.rgb;
      document.documentElement.style.setProperty('--primary', color.hex);
      dogWrapper.classList.add('sprite-pop');
      setTimeout(() => dogWrapper.classList.remove('sprite-pop'), 200);
    });
  }

  if (crabWrapper && crabSprite) {
    crabWrapper.addEventListener('click', () => {
      const now = Date.now();

      // Double-click easter egg - CLAW CLACK!
      if (now - crabLastClick < 300) {
        crabWrapper.classList.add('crab-clack');
        setTimeout(() => crabWrapper.classList.remove('crab-clack'), 500);
        crabLastClick = 0;
        return;
      }
      crabLastClick = now;

      // Normal click - change color
      crabColorIndex = (crabColorIndex + 1) % crabColors.length;
      localStorage.setItem('crabColor', crabColorIndex);
      crabSprite.style.color = crabColors[crabColorIndex];
      crabWrapper.classList.add('sprite-pop');
      setTimeout(() => crabWrapper.classList.remove('sprite-pop'), 200);
    });
  }

  // Hover expand effect - expands then shrinks on each hover + speech bubble
  if (dogWrapper) {
    dogWrapper.addEventListener('mouseenter', () => {
      dogWrapper.classList.add('sprite-expand');
      setTimeout(() => dogWrapper.classList.remove('sprite-expand'), 120);
      spawnBubble(dogWrapper, 'WOOF!');
    });
  }
  if (crabWrapper) {
    crabWrapper.addEventListener('mouseenter', () => {
      crabWrapper.classList.add('sprite-expand');
      setTimeout(() => crabWrapper.classList.remove('sprite-expand'), 120);
      spawnBubble(crabWrapper, 'CLAUK!');
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DOG & CRAB ANIMATIONS - Exact match to terminal display timing
  // Runs at 100ms ticks with same probabilities as crab-garden.js
  // ═══════════════════════════════════════════════════════════════════════════

  // State machines (matching terminal exactly)
  const dogState = {
    phase: 'idle',  // 'idle' | 'skittering' | 'jumping' | 'pausing' | 'zoomies'
    pauseFrames: 0,
    zoomiesDashes: 0,
    animating: false
  };

  const crabState = {
    phase: 'idle',
    pauseFrames: 0,
    animating: false
  };

  // DOG CONFIG
  const DOG = {
    PROB_ZOOMIES: 0.015,
    PROB_SKITTER: 0.05,
    PROB_JUMP: 0.04,
    PROB_PAUSE: 0.02,
    PAUSE_MIN: 10,
    PAUSE_RANGE: 20,
    ZOOMIES_DASHES_MIN: 3,
    ZOOMIES_DASHES_RANGE: 3
  };

  // CRAB CONFIG
  const CRAB = {
    PROB_SKITTER: 0.03,
    PROB_JUMP: 0.02,
    PROB_PAUSE: 0.03,
    PAUSE_MIN: 15,
    PAUSE_RANGE: 40
  };

  function tickDog() {
    if (!dogWrapper) return;

    switch (dogState.phase) {
      case 'idle': {
        const action = Math.random();
        if (action < DOG.PROB_ZOOMIES) {
          // ZOOMIES! with sparkle trail
          dogState.phase = 'zoomies';
          dogState.zoomiesDashes = DOG.ZOOMIES_DASHES_MIN + Math.floor(Math.random() * DOG.ZOOMIES_DASHES_RANGE);
          dogWrapper.classList.add('dog-zoomies');
          // Sparkle trail during zoomies
          const sparkleInterval = setInterval(() => spawnSparkleTrail(dogWrapper), 100);
          setTimeout(() => {
            clearInterval(sparkleInterval);
            dogWrapper.classList.remove('dog-zoomies');
            dogState.phase = 'idle';
          }, 1000);
        } else if (action < DOG.PROB_ZOOMIES + DOG.PROB_SKITTER) {
          // Skitter
          dogState.phase = 'skittering';
          const dir = Math.random() < 0.5 ? 'left' : 'right';
          dogWrapper.classList.add('dog-skitter-' + dir);
          setTimeout(() => {
            dogWrapper.classList.remove('dog-skitter-' + dir);
            dogState.phase = 'idle';
          }, 400);
        } else if (action < DOG.PROB_ZOOMIES + DOG.PROB_SKITTER + DOG.PROB_JUMP) {
          // Jump with squash/stretch
          dogState.phase = 'jumping';
          dogWrapper.classList.add('dog-jump');
          // Dust on landing
          setTimeout(() => spawnDust(dogWrapper), 280);
          setTimeout(() => {
            dogWrapper.classList.remove('dog-jump');
            dogState.phase = 'idle';
          }, 350);
        } else if (action < DOG.PROB_ZOOMIES + DOG.PROB_SKITTER + DOG.PROB_JUMP + DOG.PROB_PAUSE) {
          // Pause
          dogState.phase = 'pausing';
          dogState.pauseFrames = DOG.PAUSE_MIN + Math.floor(Math.random() * DOG.PAUSE_RANGE);
        }
        break;
      }
      case 'pausing':
        dogState.pauseFrames--;
        if (dogState.pauseFrames <= 0) {
          dogState.phase = 'idle';
        }
        break;
      // skittering, jumping, zoomies handled by setTimeout
    }
  }

  function tickCrab() {
    if (!crabWrapper) return;

    switch (crabState.phase) {
      case 'idle': {
        const action = Math.random();
        if (action < CRAB.PROB_SKITTER) {
          // Skitter
          crabState.phase = 'skittering';
          const dir = Math.random() < 0.5 ? 'left' : 'right';
          crabWrapper.classList.add('crab-skitter-' + dir);
          setTimeout(() => {
            crabWrapper.classList.remove('crab-skitter-' + dir);
            crabState.phase = 'idle';
          }, 500);
        } else if (action < CRAB.PROB_SKITTER + CRAB.PROB_JUMP) {
          // Jump with dust
          crabState.phase = 'jumping';
          crabWrapper.classList.add('crab-jump');
          setTimeout(() => spawnDust(crabWrapper), 240);
          setTimeout(() => {
            crabWrapper.classList.remove('crab-jump');
            crabState.phase = 'idle';
          }, 300);
        } else if (action < CRAB.PROB_SKITTER + CRAB.PROB_JUMP + CRAB.PROB_PAUSE) {
          // Pause
          crabState.phase = 'pausing';
          crabState.pauseFrames = CRAB.PAUSE_MIN + Math.floor(Math.random() * CRAB.PAUSE_RANGE);
        }
        break;
      }
      case 'pausing':
        crabState.pauseFrames--;
        if (crabState.pauseFrames <= 0) {
          crabState.phase = 'idle';
        }
        break;
    }
  }

  // Run at 150ms ticks
  setInterval(tickDog, 150);
  setInterval(tickCrab, 150);

  // ═══════════════════════════════════════════════════════════════════════════
  // ENTRANCE ANIMATION
  // ═══════════════════════════════════════════════════════════════════════════

  const footer = document.querySelector('.garden-footer');
  if (footer) {
    footer.classList.add('garden-entrance');
  }
})();
</script>
`;

// ─────────────────────────────────────────────────────────────────────────────
// CLOUD SHAPES - For hero section
// ─────────────────────────────────────────────────────────────────────────────

export const CLOUD_SHAPES = {
  small: `  ▄██▄
 █████▄
▀▀▀▀▀▀▀`,
  medium: `    ▄███▄
  ▄██████▄
 ███████████
▀▀▀▀▀▀▀▀▀▀▀▀▀`,
  large: `      ▄████▄
    ▄████████▄
  ▄█████████████
 ██████████████████
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`,
  tiny: ` ▄█▄
█████
▀▀▀▀▀`,
};

// Generate cloud HTML for placement
export function generateCloudHTML(size = 'medium', x = 0, y = 0) {
  const shape = CLOUD_SHAPES[size] || CLOUD_SHAPES.medium;
  return `<div class="cloud" style="left:${x}%;top:${y}%">${shape}</div>`;
}

// Generate multiple clouds for hero
export function generateCloudsHTML(count = 8) {
  const clouds = [];
  const sizes = ['tiny', 'small', 'small', 'medium', 'medium', 'large'];

  for (let i = 0; i < count; i++) {
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const x = Math.random() * 85 + 5; // 5-90%
    const y = Math.random() * 60 + 10; // 10-70%
    clouds.push(generateCloudHTML(size, x, y));
  }

  return clouds.join('\n');
}

// Generate stars for dark mode
export function generateStarsHTML(count = 30) {
  const stars = [];
  const chars = ['·', '∙', '*', '˚', '°', '+', '×'];

  for (let i = 0; i < count; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    const x = Math.random() * 95 + 2;
    const y = Math.random() * 80 + 5;
    stars.push(`<span class="star" style="left:${x}%;top:${y}%">${char}</span>`);
  }

  return stars.join('\n');
}
