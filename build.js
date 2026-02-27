#!/usr/bin/env bun

// ═══════════════════════════════════════════════════════════════════════════
// CLAPPIE DOCS BUILD - Terminal pixel art aesthetic
// ═══════════════════════════════════════════════════════════════════════════

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  footerHTML,
  dogSprite,
  generatePixelTitle,
  generatePixelLead,
  CLOUD_SHAPES,
} from './footer.js';

const DOCS_DIR = import.meta.dir;
const PAGES_DIR = join(DOCS_DIR, 'pages/ai-processed');
const NOTES_DIR = join(DOCS_DIR, 'pages/notes');
const OUT_DIR = join(DOCS_DIR, 'dist');

// ─────────────────────────────────────────────────────────────────────────────
// MARKDOWN PARSER (basic but solid)
// ─────────────────────────────────────────────────────────────────────────────

function md(text) {
  // Extract code blocks first to protect them from paragraph processing
  const codeBlocks = [];
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(`<pre><code class="language-${lang}">${code.trim()}</code></pre>`);
    return placeholder;
  });

  // Handle TLDR sections - format: TLDR: summary\n- bullet\n- bullet
  text = text.replace(/^TLDR:\s*(.+?)(?:\n((?:[-*]\s+.+\n?)+))?(?=\n\n|\n#|$)/gim, (match, summary, bullets) => {
    let html = `<div class="tldr"><div class="tldr-label">TLDR</div><p>${summary.trim()}</p>`;
    if (bullets) {
      const items = bullets.trim().split('\n').map(b => b.replace(/^[-*]\s+/, '').trim()).filter(Boolean);
      if (items.length) {
        html += '<ul>' + items.map(item => `<li>${item}</li>`).join('') + '</ul>';
      }
    }
    html += '</div>';
    return html;
  });

  // Handle multi-line blockquotes
  text = text.replace(/^(>.*\n?)+/gm, (match) => {
    const lines = match.split('\n').filter(line => line.startsWith('>'));
    const content = lines
      .map(line => line.slice(1).trim())
      .join('\n')
      .replace(/\n\n+/g, '</p><p>')
      .replace(/\n/g, '<br>');

    const isWarning = /NOT AFFILIATED|EXPERIMENTAL|RISK|WARRANTY|DISCLAIMER|AT YOUR OWN RISK/i.test(content);
    const className = isWarning ? ' class="warning"' : '';

    return `<blockquote${className}><p>${content}</p></blockquote>`;
  });

  // Helper to create slug from text
  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  text = text
    // Headers with auto-generated ids and anchor links
    .replace(/^### (.+)$/gm, (m, t) => `<h3 id="${slugify(t)}"><a href="#${slugify(t)}">${t}</a></h3>`)
    .replace(/^## (.+)$/gm, (m, t) => `<h2 id="${slugify(t)}"><a href="#${slugify(t)}">${t}</a></h2>`)
    .replace(/^# (.+)$/gm, (m, t) => `<h1 id="${slugify(t)}">${t}</h1>`)
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<uli>$1</uli>')
    .replace(/(<uli>.*<\/uli>\n?)+/g, (m) => '<ul>' + m.replace(/<\/?uli>/g, (t) => t.replace('uli', 'li')) + '</ul>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<oli>$1</oli>')
    .replace(/(<oli>.*<\/oli>\n?)+/g, (m) => '<ol>' + m.replace(/<\/?oli>/g, (t) => t.replace('oli', 'li')) + '</ol>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[huplb_])/gm, (m, o, s) => s[o-1] === '>' ? '' : '<p>')
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<[huplb_])/g, '$1')
    .replace(/(<\/[huplb].>)<\/p>/g, '$1')
    .replace(/<p>(__CODE)/g, '$1')
    .replace(/(CODE__)<\/p>/g, '$1');

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    text = text.replace(`__CODE_BLOCK_${i}__`, block);
  });

  return text;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOG LOGO (coral color, slightly smaller)
// ─────────────────────────────────────────────────────────────────────────────

const dogLogo = `<a href="/" class="logo" aria-label="Clappie home">
  <span class="logo-dog">   ▖ ▖
▗ █▜▛█
 ▛▛▛▛▀</span>
  <span class="logo-text">
    <span class="logo-letter">C</span><span class="logo-letter">l</span><span class="logo-letter">a</span><span class="logo-letter">p</span><span class="logo-letter">p</span><span class="logo-letter">i</span><span class="logo-letter">e</span>
  </span>
</a>`;

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATION - Dropdown menus with titles + descriptions
// ─────────────────────────────────────────────────────────────────────────────

// Navigation structure: { label, href?, items?: [{title, desc, href}] }
const NAV_ITEMS = [
  {
    label: 'Tutorial',
    href: '/tutorial/',
    items: [
      { icon: '🚀', title: 'What is This?', desc: 'Your Claude Code terminal, but accessible from anywhere. One skill file.', href: '/tutorial/#intro' },
      { icon: '⚙️', title: 'Requirements', desc: 'Mac, Ghostty, tmux, Bun, Claude Code. That\'s the whole list.', href: '/tutorial/#requirements' },
      { icon: '📦', title: 'Step by Step', desc: 'Zero to working in 10 steps. Copy-paste and go.', href: '/tutorial/#steps' },
    ]
  },
  {
    label: 'Features',
    href: '/features/',
    items: [
      { icon: '🎯', title: 'Sidekicks', desc: 'Spawn full Claude Code sessions on demand. The core feature.', href: '/features/#sidekicks' },
      { icon: '✅', title: 'Chores', desc: 'AI drafts, you approve. The safety net for risky actions.', href: '/features/#chores' },
      { icon: '🖥️', title: 'Displays', desc: 'Interactive terminal UIs. Never leave your terminal.', href: '/features/#displays' },
      { icon: '🔔', title: 'Notifications', desc: 'Dump raw data in, get curated items out.', href: '/features/#notifications' },
      { icon: '🧠', title: 'Recall', desc: 'Memory, logs, settings. Plain text files you can read yourself.', href: '/features/#recall' },
      { icon: '🎉', title: 'Parties', desc: 'AI swarm simulations. Define games, spawn agents, watch chaos.', href: '/features/#parties' },
      { icon: '📂', title: 'Projects', desc: 'Build and serve apps from your clappie workspace.', href: '/features/#projects' },
      { icon: '🦸', title: 'Background', desc: 'One command starts everything.', href: '/features/#background' },
    ]
  },
  {
    label: 'Ways to Chat',
    href: '/ways-to-chat/',
    items: [
      { icon: '💻', title: 'Terminal', desc: 'Displays and direct chat. Home base.', href: '/ways-to-chat/#terminal' },
      { icon: '⏰', title: 'Heartbeat', desc: 'AI reaches out to you on a schedule.', href: '/ways-to-chat/#heartbeat' },
      { icon: '🌐', title: 'SSH', desc: 'Tailscale + SSH. Access from anywhere.', href: '/ways-to-chat/#ssh' },
      { icon: '💬', title: 'Messaging', desc: 'Telegram, Slack. Your AI in your pocket.', href: '/ways-to-chat/#messaging' },
    ]
  },
  {
    label: 'Integrations',
    href: '/integrations/',
    items: [
      { icon: '🔌', title: 'Built-in', desc: 'Telegram, Slack, Whisper. Ready to go.', href: '/integrations/#built-in' },
      { icon: '🛠️', title: 'Build Your Own', desc: 'Any API. Just ask Claude to build it.', href: '/integrations/#build-your-own' },
      { icon: '🔑', title: 'OAuth Helper', desc: 'Token management that auto-refreshes. Set up once.', href: '/integrations/#oauth-helper' },
      { icon: '🪝', title: 'Webhooks', desc: 'Route incoming events to the right handler.', href: '/integrations/#webhook-routing' },
    ]
  },
  {
    label: 'Misc',
    href: '/misc/',
    items: [
      { icon: '📋', title: 'CLI Commands', desc: 'clappie list is your homebase. Everything else grows from there.', href: '/misc/#cli' },
      { icon: '🧬', title: 'CLAUDE.md', desc: 'The soul. Your personal instructions to the AI.', href: '/misc/#claude-md' },
      { icon: '🗑️', title: 'Uninstall', desc: 'How to remove everything cleanly.', href: '/misc/#uninstall' },
    ]
  },
];

function generateNav() {
  const items = NAV_ITEMS.map(item => {
    if (item.items) {
      // Dropdown - add 'wide' class if more than 5 items
      const isWide = item.items.length > 5;
      const dropdownItems = item.items.map(sub => `
        <a href="${sub.href}" class="dropdown-item">
          <span class="dropdown-item-header">
            <span class="dropdown-item-icon">${sub.icon || '◆'}</span>
            <span class="dropdown-item-title">${sub.title}</span>
          </span>
          <span class="dropdown-item-desc">${sub.desc}</span>
        </a>
      `).join('');

      // Trigger is a link if href provided, otherwise button
      const trigger = item.href
        ? `<a href="${item.href}" class="nav-dropdown-trigger">${item.label}</a>`
        : `<button class="nav-dropdown-trigger">${item.label}</button>`;

      return `
        <div class="nav-dropdown">
          ${trigger}
          <div class="nav-dropdown-menu${isWide ? ' wide' : ''}">
            ${dropdownItems}
          </div>
        </div>
      `;
    } else {
      // Simple link
      const target = item.external ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${item.href}"${target}>${item.label}</a>`;
    }
  }).join('');

  return `<nav>${items}</nav>`;
}

const nav = generateNav();

// ─────────────────────────────────────────────────────────────────────────────
// THEME TOGGLE (Terminal style: ☀️━━━━━🌙)
// ─────────────────────────────────────────────────────────────────────────────

// Theme toggle - matches display engine exactly
// Light: ━━━🌞  Dark: 🌚•••
const themeToggle = `<button class="theme-toggle" onclick="toggleTheme()" aria-label="Toggle theme">
  <span class="toggle-light">━━━🌞</span>
  <span class="toggle-dark">🌚•••</span>
</button>`;

// Garden toggle - show/hide footer
const gardenToggle = `<button class="garden-toggle" onclick="toggleGarden()" aria-label="Toggle garden">
  <span class="garden-shown">🌻</span>
  <span class="garden-hidden">🌱</span>
</button>`;

// ─────────────────────────────────────────────────────────────────────────────
// THEME SCRIPT
// ─────────────────────────────────────────────────────────────────────────────

const themeScript = `<script>
(function() {
  // ─── SCROLL TO TOP ON LOAD ──────────────────────────────────────────────────
  window.scrollTo(0, 0);

  // ─── COPY COMMAND ───────────────────────────────────────────────────────────
  window.copyCommand = function(el) {
    const text = el.querySelector('.command-text').textContent;
    navigator.clipboard.writeText(text).then(() => {
      el.classList.add('copied');
      setTimeout(() => el.classList.remove('copied'), 1500);
    });
  };

  // ─── HERO COMMAND SPOTLIGHT ─────────────────────────────────────────────────
  const heroCommand = document.querySelector('.hero-command');
  if (heroCommand) {
    heroCommand.addEventListener('mouseenter', () => {
      document.documentElement.classList.add('command-hover');
    });
    heroCommand.addEventListener('mouseleave', () => {
      document.documentElement.classList.remove('command-hover');
    });
  }

  // ─── THEME ───────────────────────────────────────────────────────────────────
  function getTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(t) {
    localStorage.setItem('theme', t);
    document.documentElement.dataset.theme = t;
  }

  window.toggleTheme = function() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  };

  setTheme(getTheme());

  // ─── GARDEN TOGGLE ──────────────────────────────────────────────────────────
  function getGarden() {
    const saved = localStorage.getItem('garden');
    return saved !== 'hidden';
  }

  function setGarden(show) {
    localStorage.setItem('garden', show ? 'shown' : 'hidden');
    document.documentElement.dataset.garden = show ? 'shown' : 'hidden';
  }

  window.toggleGarden = function() {
    setGarden(!getGarden());
  };

  setGarden(getGarden());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ─── FLOATING PIXELS ─────────────────────────────────────────────────────────
  const hero = document.querySelector('.hero');
  if (hero) {
    const particles = ['▀', '▄', '█', '▌', '▐', '░', '▒', '▓', '◆', '◇', '★', '✦'];
    const colors = ['#ff8ec6', '#57cfff', '#b4ff69', '#ffd700', '#ff6347', '#40e0d0'];

    for (let i = 0; i < 15; i++) {
      const p = document.createElement('span');
      p.className = 'pixel-particle';
      p.textContent = particles[Math.floor(Math.random() * particles.length)];
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.color = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = -Math.random() * 10 + 's';
      p.style.fontSize = (10 + Math.random() * 12) + 'px';
      hero.appendChild(p);
    }
  }

  // ─── RANDOM GLITCH - sporadic 4-10 second intervals ─────────────────────────
  function triggerGlitch() {
    if (hero) {
      hero.classList.add('glitching');
      setTimeout(() => hero.classList.remove('glitching'), 600);
    }
    // Schedule next glitch at random interval (4-10 seconds)
    const nextDelay = 4000 + Math.random() * 6000;
    setTimeout(triggerGlitch, nextDelay);
  }
  // Start first glitch after 3-6 seconds
  setTimeout(triggerGlitch, 3000 + Math.random() * 3000);

  // ─── CLICK SPARKLES ─────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    // Skip sparkles in performance mode
    if (document.documentElement.dataset.garden === 'hidden') return;
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('div');
      spark.className = 'sparkle';
      spark.style.left = e.clientX + (Math.random() - 0.5) * 40 + 'px';
      spark.style.top = e.clientY + (Math.random() - 0.5) * 40 + 'px';
      spark.style.background = ['#ff8ec6', '#57cfff', '#b4ff69', '#ffd700'][Math.floor(Math.random() * 4)];
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 600);
    }
  });

  // ─── SCROLL HEADER ───────────────────────────────────────────────────────────
  const header = document.querySelector('header');
  let ticking = false;

  function updateHeader() {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  updateHeader();

  // ─── HELLO BAR ────────────────────────────────────────────────────────────────
  const helloBar = document.querySelector('.hello-bar');
  const dismissBtn = document.querySelector('.hello-bar-dismiss');
  if (helloBar && dismissBtn) {
    var dismissedAt = localStorage.getItem('hello-bar-dismissed');
    if (dismissedAt && (Date.now() - parseInt(dismissedAt)) < 4 * 60 * 60 * 1000) {
      helloBar.remove();
    } else {
      setTimeout(() => {
        helloBar.classList.add('visible');
        document.body.classList.add('hello-bar-active');

        // Face scramble engine
        const face = document.getElementById('hb-face');
        const urlEl = document.getElementById('hb-url');
        if (face) {
          const bigEyes = 'O0@◉⊙●◎';
          const smolEyes = 'o°·.•';
          const wildEyes = '*#^~$&!?¤×÷±∞';
          const allEyes = bigEyes + smolEyes + wildEyes;
          const seps = '_-=~·•.:¯';
          const others = ['o_◉', 'o_°', 'o_•', 'o_◎', 'o_⊙', 'o_◕', 'o_⦿', 'o_●', 'o_*', 'o_☉'];
          const settled = [];
          for (const f of others) {
            settled.push('o_0', f);
          }
          const urls = ['oh0.ai', 'oh-zero.com', 'ohzero.ai', '@oh0'];
          let idx = 0;
          let urlIdx = 0;

          // URL text scramble
          function scrambleUrl() {
            if (!urlEl) return;
            urlIdx = (urlIdx + 1) % urls.length;
            const target = urls[urlIdx];
            let ticks = 0;
            const chars = 'abcdefghijklmnopqrstuvwxyz0123456789.-/';
            const run = setInterval(() => {
              let out = '';
              for (let i = 0; i < target.length; i++) {
                out += ticks > (i * 0.8) ? target[i] : chars[Math.floor(Math.random() * chars.length)];
              }
              urlEl.textContent = out;
              ticks++;
              if (ticks >= target.length + 3) {
                clearInterval(run);
                urlEl.textContent = target;
              }
            }, 40);
          }

          // Face reacts directly to mouse movement
          let settleTimer = null;
          let hoveringBar = false;
          const helloBar = document.querySelector('.hello-bar');
          helloBar.addEventListener('mouseenter', () => { hoveringBar = true; });
          helloBar.addEventListener('mouseleave', () => { hoveringBar = false; });
          document.addEventListener('mousemove', (e) => {
            const speed = Math.abs(e.movementX) + Math.abs(e.movementY);
            if (speed < 3) return;
            if (hoveringBar) {
              face.textContent = 'o_0';
              face.classList.remove('glitching');
              return;
            }
            // Random face on every move
            const a = allEyes[Math.floor(Math.random() * allEyes.length)];
            const s = seps[Math.floor(Math.random() * seps.length)];
            const b = allEyes[Math.floor(Math.random() * allEyes.length)];
            face.textContent = a + s + b;
            face.classList.add('glitching');
            // Reset settle timer
            clearTimeout(settleTimer);
            settleTimer = setTimeout(() => {
              idx = (idx + 1) % settled.length;
              face.textContent = settled[idx];
              face.classList.remove('glitching');
              face.classList.add('landed');
              setTimeout(() => face.classList.remove('landed'), 300);
            }, 200);
          });
          setInterval(scrambleUrl, 7000);
        }
      }, 3000);

      dismissBtn.addEventListener('click', () => {
        helloBar.classList.add('dismissing');
        document.body.classList.remove('hello-bar-active');
        setTimeout(() => {
          helloBar.remove();
          localStorage.setItem('hello-bar-dismissed', Date.now().toString());
        }, 400);
      });
    }
  }

  // ─── MOBILE NAV ──────────────────────────────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.querySelector('nav');
  if (navToggle && nav) {
    navToggle.addEventListener('change', () => {
      const isOpen = navToggle.checked;
      nav.classList.toggle('open', isOpen);
      document.body.classList.toggle('nav-open', isOpen);
      if (isOpen) {
        window.scrollTo(0, 0);
      }
    });
  }

  // ─── DROPDOWN TOGGLES (mobile accordion, desktop hover) ───────────────────────
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  const isMobile = () => window.innerWidth <= 768;

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (trigger) {
      trigger.addEventListener('click', (e) => {
        if (isMobile()) {
          e.preventDefault();
          // Close other dropdowns
          dropdowns.forEach(d => {
            if (d !== dropdown) d.classList.remove('open');
          });
          dropdown.classList.toggle('open');
        }
      });
    }
  });

  // Close dropdowns when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (isMobile() && !e.target.closest('.nav-dropdown')) {
      dropdowns.forEach(d => d.classList.remove('open'));
    }
  });

})();
</script>`;

// ─────────────────────────────────────────────────────────────────────────────
// CLOUD SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

function generateClouds() {
  // Deterministic cloud placement for consistency
  const placements = [
    { size: 'tiny', x: 5, y: 15 },
    { size: 'small', x: 18, y: 25 },
    { size: 'medium', x: 35, y: 10 },
    { size: 'tiny', x: 55, y: 30 },
    { size: 'small', x: 70, y: 18 },
    { size: 'large', x: 82, y: 8 },
    { size: 'tiny', x: 92, y: 35 },
    { size: 'small', x: 8, y: 45 },
    { size: 'tiny', x: 48, y: 50 },
    { size: 'small', x: 75, y: 42 },
  ];

  return placements.map(({ size, x, y }) => {
    const shape = CLOUD_SHAPES[size] || CLOUD_SHAPES.small;
    return `<div class="cloud" style="left:${x}%;top:${y}%">${shape}</div>`;
  }).join('\n    ');
}

function generateStars() {
  // Deterministic star placement
  const stars = [];
  const chars = ['·', '∙', '*', '˚', '°', '+'];

  // Seeded random for consistency
  let seed = 42;
  const random = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let i = 0; i < 35; i++) {
    const char = chars[Math.floor(random() * chars.length)];
    const x = (random() * 90 + 5).toFixed(1);
    const y = (random() * 70 + 10).toFixed(1);
    stars.push(`<span class="star" style="left:${x}%;top:${y}%">${char}</span>`);
  }

  return stars.join('\n    ');
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────────────────────────────────────

// Hero config per page
const HERO_CONFIG = {
  index: {
    title: 'CLAPPIE',
    lead: 'git clone https://github.com/whatnickcodes/clappie',
    isCommand: true,
  },
  test: {
    title: 'TEST',
    lead: 'STYLE TESTING GROUND',
  },
  'tutorial': {
    title: 'TUTORIAL',
    lead: 'ZERO TO WORKING IN 10 STEPS',
  },
  'features': {
    title: 'FEATURES',
    lead: 'EVERYTHING CLAPPIE CAN DO',
  },
  'ways-to-chat': {
    title: 'WAYS TO CHAT',
    lead: 'TERMINAL, PHONE, REMOTE, BOTS',
  },
  'integrations': {
    title: 'INTEGRATIONS',
    lead: 'CONNECT TO EXTERNAL SERVICES',
  },
  'misc': {
    title: 'REFERENCE',
    lead: 'FOLDERS, COMMANDS, CONFIG',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM HOMEPAGE CONTENT
// ─────────────────────────────────────────────────────────────────────────────

const homepageContent = `
<section class="homepage-hero">
  <h1 class="hero-headline">
    <span class="hero-intro">Create, Manage, And Access Your</span>
    <span class="hero-highlight" data-text="Claude Code Terminals">Claude Code Terminal<span class="hero-s">s</span></span>
    <span class="hero-payoff">like they're <em>24/7 Mobile Personal Agents</em></span>
  </h1>

  <div class="hero-orbit">
    <a href="/ways-to-chat/#bots" class="orb" style="--float-y:-8px;--float-dur:3.2s;--delay:0.2s">
      <span class="orb-badge">💬</span>
      <span class="orb-label">Chat into Your Terminal<br><small>Directly from Telegram, Slack & More</small></span>
    </a>
    <a href="/features/#sidekicks" class="orb" style="--float-y:10px;--float-dur:3.8s;--delay:0.28s">
      <span class="orb-badge">🎯</span>
      <span class="orb-label">Manage Multiple Terminals<br><small>Spawn independent terminals called "sidekicks"</small></span>
    </a>
    <a href="/features/#displays" class="orb" style="--float-y:-6px;--float-dur:4.1s;--delay:0.36s">
      <span class="orb-badge">🖥️</span>
      <span class="orb-label">TUI Displays<br><small>Fun interactive terminal UIs</small></span>
    </a>
    <a href="/ways-to-chat/#heartbeat" class="orb" style="--float-y:7px;--float-dur:3.5s;--delay:0.44s">
      <span class="orb-badge">💓</span>
      <span class="orb-label">Heartbeat<br><small>Crons, Memory & Notifications</small></span>
    </a>
    <a href="/tutorial/" class="orb" style="--float-y:-5px;--float-dur:2.8s;--delay:0.52s">
      <span class="orb-badge">⚡</span>
      <span class="orb-label">Dead-Simple Setup<br><small>Just one skill. That's it.</small></span>
    </a>
    <a href="/features/#chores" class="orb" style="--float-y:6px;--float-dur:3.0s;--delay:0.58s">
      <span class="orb-badge">✅</span>
      <span class="orb-label">Human Chores<br><small>You don't tell the AI what to do, it tells you what to do</small></span>
    </a>
    <a href="/integrations/#build-your-own" class="orb" style="--float-y:-7px;--float-dur:3.4s;--delay:0.64s">
      <span class="orb-badge">🛠️</span>
      <span class="orb-label">Skill Builder<br><small>Skip Scary 3rd Parties. Build Your Own.</small></span>
    </a>
    <a href="/misc/" class="orb" style="--float-y:-9px;--float-dur:2.5s;--delay:0.70s">
      <span class="orb-badge">🐕</span>
      <span class="orb-label">Add an ASCII Dog (important!)<br><small>To Your Claude Code Setup</small></span>
    </a>
  </div>

  <a href="/tutorial/" class="hero-cta">Tutorial</a>
  <a href="https://github.com/whatnickcodes/clappie" target="_blank" rel="noopener" class="github-subtle">
    <span class="github-icon">◆</span> view source on github <span class="github-arrow">→</span>
  </a>
</section>

<section class="showcase">
  <div class="showcase-head">
    <h2 class="showcase-title">Chat to Your Terminal</h2>
    <p class="showcase-lead">Skip the complex personal agent frameworks — just spin up as many simple Claude Code terminals as you need, on demand.</p>
  </div>

  <!-- ═══ TELEGRAM SCENE ═══ -->
  <div class="showcase-scene" data-sc-tab="telegram">
    <!-- PHONE -->
    <div class="sc-phone">
      <div class="sc-phone-notch"></div>
      <div class="sc-phone-screen">
        <div class="sc-tg-header">
          <span class="sc-tg-arrow">‹</span>
          <div class="sc-tg-pfp"><svg viewBox="0 0 240 240" width="32" height="32"><defs><linearGradient id="tg" x1="120" y1="240" x2="120" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1d93d2"/><stop offset="1" stop-color="#38b0e3"/></linearGradient></defs><circle cx="120" cy="120" r="120" fill="url(#tg)"/><path d="M81.229,128.772l14.237,39.406s1.78,3.687,3.686,3.687,30.255-29.492,30.255-29.492l31.525-60.89L81.737,118.6Z" fill="#c8daea"/><path d="M100.106,138.878l-2.733,29.046s-1.144,8.9,7.754,0,17.415-15.763,17.415-15.763" fill="#a9c6d8"/><path d="M81.486,130.178,52.2,120.636s-3.5-1.42-2.373-4.64c.232-.664.7-1.229,2.1-2.2,6.489-4.523,120.106-45.36,120.106-45.36s3.208-1.081,5.1-.362a2.766,2.766,0,0,1,1.885,2.055,9.357,9.357,0,0,1,.254,2.585c-.009.752-.1,1.449-.169,2.542-.692,11.165-21.4,94.493-21.4,94.493s-1.239,4.876-5.678,5.043A8.13,8.13,0,0,1,146.1,172.5c-8.711-7.493-38.819-27.727-45.472-32.177a1.27,1.27,0,0,1-.546-.9c-.093-.469.417-1.05.417-1.05s52.426-46.6,53.821-51.492c.108-.379-.3-.566-.848-.4-3.482,1.281-63.844,39.4-70.506,43.607A3.21,3.21,0,0,1,81.486,130.178Z" fill="#fff"/></svg></div>
          <div class="sc-tg-info">
            <span class="sc-tg-name">Clappie</span>
            <span class="sc-tg-status">online</span>
          </div>
        </div>
        <div class="sc-tg-body">
          <div class="sc-msg sc-msg-out" style="--d:1">
            check my emails
            <span class="sc-msg-meta">14:32 ✓✓</span>
          </div>
          <div class="sc-typing" style="--d:3.8;--dur:1.2s">
            <span></span><span></span><span></span>
          </div>
          <div class="sc-msg sc-msg-in" style="--d:4.8">
            3 unread:<br>
            • Sarah — API rate limits<br>
            • Mom — dinner Sunday?<br>
            • Vercel — deploy failed
            <span class="sc-msg-meta">14:32</span>
          </div>
          <div class="sc-msg sc-msg-out" style="--d:6">
            reply to mom, say yes, skip creating a chore
            <span class="sc-msg-meta">14:33 ✓✓</span>
          </div>
          <div class="sc-typing" style="--d:7.8;--dur:0.8s">
            <span></span><span></span><span></span>
          </div>
          <div class="sc-msg sc-msg-in" style="--d:8.5">
            Done! Replied to Mom ✓
            <span class="sc-msg-meta">14:33</span>
          </div>
        </div>
        <div class="sc-tg-bar">
          <span>Message</span>
          <span class="sc-tg-send">➤</span>
        </div>
      </div>
      <div class="sc-phone-home"></div>
    </div>

    <!-- SIGNAL -->
    <div class="sc-signal">
      <div class="sc-signal-line"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:1.3"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:1.5"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:1.7"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:3.6"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:3.8"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:4.0"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:6.3"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:6.5"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:6.7"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:7.6"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:7.8"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:8.0"></div>
      <span class="sc-signal-tag">webhook</span>
    </div>

    <!-- TERMINAL -->
    <div class="sc-term sc-term-appear" style="--pop:1.8">
      <div class="sc-term-chrome">
        <span class="sc-term-dot" style="background:#ff5f56"></span>
        <span class="sc-term-dot" style="background:#ffbd2e"></span>
        <span class="sc-term-dot" style="background:#27c93f"></span>
        <span class="sc-term-title">~/clappie — claude</span>
      </div>
      <div class="sc-term-body">
        <div class="sc-tl" style="--d:0.3"><span class="sc-t-prompt">$</span> claude</div>
        <div class="sc-tl" style="--d:0.6"><span class="sc-t-muted">╭─ Claude Code ─────────────────────╮</span></div>
        <div class="sc-tl" style="--d:2"><span class="sc-t-pink">[sidekick]</span> telegram: "check my emails"</div>
        <div class="sc-tl" style="--d:2.4"><span class="sc-t-muted">›</span> Reading email inbox...</div>
        <div class="sc-tl" style="--d:2.8"><span class="sc-t-muted">›</span> Found 3 unread emails</div>
        <div class="sc-tl" style="--d:3.1"><span class="sc-t-muted">›</span> Sending summary to Telegram</div>
        <div class="sc-tl" style="--d:3.4"><span class="sc-t-green">✓</span> Summary sent</div>
        <div class="sc-tl sc-tl-gap" style="--d:6.5"><span class="sc-t-muted">›</span> telegram: "reply to mom, say yes, skip creating a chore"</div>
        <div class="sc-tl" style="--d:6.9"><span class="sc-t-muted">›</span> Drafting reply to Mom...</div>
        <div class="sc-tl" style="--d:7.2"><span class="sc-t-muted">›</span> Sent via email API</div>
        <div class="sc-tl" style="--d:7.5"><span class="sc-t-pink">✓ Sidekick complete</span></div>
        <div class="sc-tl sc-term-cursor" style="--d:8.5">█</div>
      </div>
    </div>
  </div>

  <!-- ═══ SLACK SCENE ═══ -->
  <div class="showcase-scene" data-sc-tab="slack" style="display:none">
    <!-- SLACK DESKTOP -->
    <div class="sc-desktop">
      <div class="sc-desktop-chrome">
        <span class="sc-term-dot" style="background:#ff5f56"></span>
        <span class="sc-term-dot" style="background:#ffbd2e"></span>
        <span class="sc-term-dot" style="background:#27c93f"></span>
        <span class="sc-desktop-title">Slack — Acme Inc</span>
      </div>
      <div class="sc-slack">
        <div class="sc-slack-sidebar">
          <div class="sc-slack-ws">Acme Inc ▾</div>
          <div class="sc-slack-label">Channels</div>
          <div class="sc-slack-ch"># general</div>
          <div class="sc-slack-ch sc-slack-ch-active"># engineering</div>
          <div class="sc-slack-ch"># design</div>
          <div class="sc-slack-label">Direct Messages</div>
          <div class="sc-slack-dm"><span class="sc-slack-online">●</span> Sarah Chen</div>
          <div class="sc-slack-dm sc-slack-dm-dim">David Park</div>
        </div>
        <div class="sc-slack-main">
          <div class="sc-slack-chname"># engineering</div>
          <div class="sc-slack-msgs">
            <div class="sc-slack-msg" style="--d:1">
              <div class="sc-slack-av" style="background:#e8a445">M</div>
              <div>
                <div class="sc-slack-who">Marcus <span class="sc-slack-ts">10:41 AM</span></div>
                <div class="sc-slack-txt">can someone check why API latency spiked? seeing 2s+ on the dashboard</div>
              </div>
            </div>
            <div class="sc-slack-msg" style="--d:3.8">
              <div class="sc-slack-av sc-slack-av-bot">🐕</div>
              <div>
                <div class="sc-slack-who">Clappie <span class="sc-slack-app">APP</span> <span class="sc-slack-ts">10:41 AM</span></div>
                <div class="sc-slack-txt">Redis connection pool exhausted — restarted, latency is back to normal.</div>
                <div class="sc-slack-thread-link">💬 2 replies</div>
              </div>
            </div>
            <div class="sc-slack-msg" style="--d:4.5">
              <div class="sc-slack-av" style="background:#6b8e9b">S</div>
              <div>
                <div class="sc-slack-who">Sarah Chen <span class="sc-slack-ts">10:43 AM</span></div>
                <div class="sc-slack-txt"><span class="sc-slack-mention">@clappie</span> review PR #847 when you get a chance</div>
              </div>
            </div>
            <div class="sc-slack-msg" style="--d:7.2">
              <div class="sc-slack-av sc-slack-av-bot">🐕</div>
              <div>
                <div class="sc-slack-who">Clappie <span class="sc-slack-app">APP</span> <span class="sc-slack-ts">10:44 AM</span></div>
                <div class="sc-slack-txt">PR #847 reviewed — LGTM! Left comments on the auth middleware.</div>
                <div class="sc-slack-thread-link">💬 1 reply</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SIGNAL -->
    <div class="sc-signal">
      <div class="sc-signal-line"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:1.3"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:1.5"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:1.7"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:3.4"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:3.6"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:3.8"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:4.8"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:5.0"></div>
      <div class="sc-signal-dot sc-signal-out" style="--d:5.2"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:6.8"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:7.0"></div>
      <div class="sc-signal-dot sc-signal-back" style="--d:7.2"></div>
      <span class="sc-signal-tag">webhook</span>
    </div>

    <!-- TERMINAL STACK — separate sessions per thread -->
    <div class="sc-term-stack">
      <div class="sc-term sc-term-sm sc-term-appear" style="--pop:1.8">
        <div class="sc-term-chrome">
          <span class="sc-term-dot" style="background:#ff5f56"></span>
          <span class="sc-term-dot" style="background:#ffbd2e"></span>
          <span class="sc-term-dot" style="background:#27c93f"></span>
          <span class="sc-term-title">session 1 — #engineering</span>
        </div>
        <div class="sc-term-body sc-term-body-sm">
          <div class="sc-tl" style="--d:2.0"><span class="sc-t-pink">[sidekick]</span> #engineering → marcus</div>
          <div class="sc-tl" style="--d:2.3"><span class="sc-t-muted">›</span> Checking API metrics...</div>
          <div class="sc-tl" style="--d:2.6"><span class="sc-t-muted">›</span> Redis pool exhausted — restarting</div>
          <div class="sc-tl" style="--d:2.9"><span class="sc-t-muted">›</span> Posting fix to thread</div>
          <div class="sc-tl" style="--d:3.2"><span class="sc-t-green">✓</span> Replied in #engineering</div>
        </div>
      </div>
      <div class="sc-term sc-term-sm sc-term-appear" style="--pop:4.8">
        <div class="sc-term-chrome">
          <span class="sc-term-dot" style="background:#ff5f56"></span>
          <span class="sc-term-dot" style="background:#ffbd2e"></span>
          <span class="sc-term-dot" style="background:#27c93f"></span>
          <span class="sc-term-title">session 2 — PR review</span>
        </div>
        <div class="sc-term-body sc-term-body-sm">
          <div class="sc-tl" style="--d:5.2"><span class="sc-t-pink">[sidekick]</span> #engineering → @sarah</div>
          <div class="sc-tl" style="--d:5.5"><span class="sc-t-muted">›</span> Fetching PR #847 diff...</div>
          <div class="sc-tl" style="--d:5.8"><span class="sc-t-muted">›</span> 12 files changed — reviewing</div>
          <div class="sc-tl" style="--d:6.2"><span class="sc-t-muted">›</span> LGTM, noting auth middleware</div>
          <div class="sc-tl" style="--d:6.5"><span class="sc-t-green">✓</span> Review posted</div>
        </div>
      </div>
    </div>
  </div>

  <div class="showcase-foot">
    <div class="showcase-tabs">
      <button class="sc-tab sc-tab-active" data-tab="telegram">Telegram</button>
      <span class="sc-tab-nudge"><span class="sc-arrow sc-arrow-1">↓</span><span class="sc-arrow sc-arrow-2">→</span><button class="sc-tab sc-tab-new" data-tab="slack">Slack</button><span class="sc-arrow sc-arrow-3">←</span><span class="sc-arrow sc-arrow-4">↓</span></span>
      <span class="sc-tab sc-tab-disabled">iMessage</span>
      <span class="sc-tab sc-tab-disabled">Your App</span>
      <span class="sc-tab sc-tab-disabled">API</span>
      <span class="sc-tab sc-tab-disabled">CLI</span>
    </div>
    <a href="/ways-to-chat/" class="showcase-more">Explore Ways to Chat →</a>
  </div>
</section>

<script>
(function() {
  // Scroll-triggered animations
  var showcase = document.querySelector('.showcase');
  if (showcase && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        showcase.classList.add('sc-visible');
        io.disconnect();
      }
    }, { threshold: 0.15 });
    io.observe(showcase);
  } else if (showcase) {
    showcase.classList.add('sc-visible');
  }

  // Tab switching
  var tabs = document.querySelectorAll('.sc-tab[data-tab]');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = this.getAttribute('data-tab');
      document.querySelectorAll('.sc-tab').forEach(function(t) { t.classList.remove('sc-tab-active'); t.classList.remove('sc-tab-new'); });
      this.classList.add('sc-tab-active');
      document.querySelectorAll('.showcase-scene').forEach(function(s) { s.style.display = 'none'; });
      var scene = document.querySelector('.showcase-scene[data-sc-tab="' + target + '"]');
      if (scene) {
        var clone = scene.cloneNode(true);
        scene.parentNode.replaceChild(clone, scene);
        clone.style.display = 'flex';
      }
    });
  });
})();
</script>

<section class="heartbeat">
  <div class="hb-head">
    <h2 class="hb-title">Heartbeat (cron)</h2>
    <p class="hb-lead">Schedule background tasks to scan your emails, triage notifications, send telegrams, draft replies — whatever you want, on autopilot.</p>
  </div>
  <div class="hb-visual">
    <div class="hb-core">
      <div class="hb-pixel"></div>
    </div>
    <div class="hb-ring hb-ring-1"></div>
    <div class="hb-ring hb-ring-2"></div>
    <div class="hb-ring hb-ring-3"></div>
    <div class="hb-ping" style="--tx:-155px;--ty:-175px;--d:0;--c:#5ba4f5"><span class="hb-ping-icon">📧</span> scanned 14 new emails, archived 9</div>
    <div class="hb-ping" style="--tx:175px;--ty:-150px;--d:1.5;--c:#e8a445"><span class="hb-ping-icon">✈️</span> telegram → mom: "dinner at 7, bringing salad"</div>
    <div class="hb-ping" style="--tx:220px;--ty:25px;--d:3;--c:#a78bfa"><span class="hb-ping-icon">✏️</span> drafted reply to Rachel re: board demo</div>
    <div class="hb-ping" style="--tx:140px;--ty:170px;--d:4.5;--c:#4ade80"><span class="hb-ping-icon">📋</span> created chore: "email boss Q1 roadmap update"</div>
    <div class="hb-ping" style="--tx:-55px;--ty:195px;--d:6;--c:#22d3ee"><span class="hb-ping-icon">✈️</span> telegram → you: "PR #847 needs your review"</div>
    <div class="hb-ping" style="--tx:-205px;--ty:90px;--d:7.5;--c:#fb923c"><span class="hb-ping-icon">📅</span> synced 4 calendar events, conflict at 2pm</div>
    <div class="hb-ping" style="--tx:-225px;--ty:-30px;--d:9;--c:#f472b6"><span class="hb-ping-icon">💬</span> slack: resolved alert in #engineering</div>
    <div class="hb-ping" style="--tx:95px;--ty:-195px;--d:10.5;--c:#34d399"><span class="hb-ping-icon">🐙</span> github: merged 2 dependabot PRs</div>
    <div class="hb-ping" style="--tx:-175px;--ty:-135px;--d:12;--c:#818cf8"><span class="hb-ping-icon">✈️</span> telegram → you: "mom emailed about dinner"</div>
    <div class="hb-ping" style="--tx:200px;--ty:100px;--d:13.5;--c:#fbbf24"><span class="hb-ping-icon">🗑️</span> unsubscribed from 5 newsletters</div>
    <div class="hb-ping" style="--tx:-120px;--ty:170px;--d:15;--c:#e879f9"><span class="hb-ping-icon">🧹</span> cleaned 340MB from ~/Downloads</div>
    <div class="hb-ping" style="--tx:55px;--ty:205px;--d:16.5;--c:#5eead4"><span class="hb-ping-icon">💾</span> backed up memory + synced recall/</div>
  </div>
  <div class="hb-foot">
    <div class="hb-ideas">
      <span class="hb-idea">Email Triage</span>
      <span class="hb-idea">Telegram Alerts</span>
      <span class="hb-idea">Draft Replies</span>
      <span class="hb-idea">Calendar Sync</span>
      <span class="hb-idea">GitHub Watch</span>
      <span class="hb-idea">File Cleanup</span>
      <span class="hb-idea">Slack Monitor</span>
      <span class="hb-idea">Auto-Unsubscribe</span>
    </div>
    <a href="/features/" class="hb-link">Explore Features →</a>
  </div>
</section>
<script>
(function() {
  var hb = document.querySelector('.heartbeat');
  if (hb && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { hb.classList.add('hb-visible'); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(hb);
  } else if (hb) { hb.classList.add('hb-visible'); }
})();
</script>

<section class="displays">
  <div class="displays-head">
    <h2 class="displays-title">Displays (TUI)</h2>
    <p class="displays-lead">Interactive terminal UIs that render right inside your Claude Code pane — notifications, dashboards, forms, anything. Plus and most importantly a fun little ASCII dog for your Claude Code crab to hang out with.</p>
  </div>
  <div class="displays-slider">
    <div class="displays-slide" onclick="expandSlide(this)"><video src="/img/telegram-demo.mp4" class="displays-img displays-video" autoplay loop muted playsinline></video><p class="displays-caption">Telegram — chat into your terminal from anywhere</p></div>
    <div class="displays-slide" onclick="expandSlide(this)"><img src="/img/notifications.png" alt="Notifications display" class="displays-img" /><p class="displays-caption">"show me my notifications"</p></div>
    <div class="displays-slide" onclick="expandSlide(this)"><img src="/img/email-display.png" alt="Email display" class="displays-img" /><p class="displays-caption">"open my email inbox"</p></div>
    <div class="displays-slide" onclick="expandSlide(this)"><video src="/img/slack-demo.mp4" class="displays-img displays-video" autoplay loop muted playsinline></video><p class="displays-caption">Slack — threaded replies, each spawning its own terminal</p></div>
    <div class="displays-slide" onclick="expandSlide(this)"><video src="/img/parties.mp4" class="displays-img displays-video" autoplay loop muted playsinline></video><p class="displays-caption">Parties — AI swarm simulations with shared rules</p></div>
    <div class="displays-slide" onclick="expandSlide(this)"><img src="/img/chores.png" alt="Chores approval queue" class="displays-img" /><p class="displays-caption">"show me my pending chores"</p></div>
    <div class="displays-slide" onclick="expandSlide(this)"><img src="/img/chores-revise.png" alt="Chore revision" class="displays-img" /><p class="displays-caption">"revise that email draft"</p></div>
    <div class="displays-slide" onclick="expandSlide(this)"><img src="/img/heartbeat.png" alt="Heartbeat scheduler" class="displays-img" /><p class="displays-caption">"check my heartbeat status"</p></div>
    <div class="displays-slide" onclick="expandSlide(this)"><img src="/img/background-manager.png" alt="Background manager" class="displays-img" /><p class="displays-caption">"show background services"</p></div>
  </div>
  <div class="displays-ideas">
    <span class="displays-idea">Push/Pop Navigation</span>
    <span class="displays-idea">Mouse/Touch Clicks</span>
    <span class="displays-idea">Automatic Keyboard Shortcuts</span>
    <span class="displays-idea">Dark/Light Theme</span>
    <span class="displays-idea">UI Kit for Custom</span>
    <span class="displays-idea">Buttons & Forms</span>
    <span class="displays-idea">Live Data</span>
    <span class="displays-idea">Two-Way Communication</span>
    <span class="displays-idea">Pixel Art Graphics</span>
    <span class="displays-idea">Zero Dependencies</span>
    <span class="displays-idea">Fully Responsive</span>
  </div>
  <div class="displays-foot">
    <a href="/features/#displays" class="displays-link">Explore Displays →</a>
  </div>
</section>
<script>
(function() {
  var lb = document.createElement('div');
  lb.className = 'displays-lightbox';
  lb.onclick = function() { closeLightbox(); };
  var inner = document.createElement('div');
  inner.className = 'displays-lightbox-inner';
  inner.onclick = function(e) { e.stopPropagation(); };
  lb.appendChild(inner);
  document.body.appendChild(lb);

  var openTime = 0;

  window.expandSlide = function(slide) {
    var media = slide.querySelector('img, video');
    var caption = slide.querySelector('.displays-caption');
    inner.innerHTML = '';
    if (media.tagName === 'VIDEO') {
      var v = document.createElement('video');
      v.src = media.src; v.autoplay = true; v.loop = true; v.muted = false; v.playsInline = true; v.controls = true;
      v.className = 'displays-lightbox-media';
      inner.appendChild(v);
    } else {
      var img = document.createElement('img');
      img.src = media.src; img.alt = media.alt || '';
      img.className = 'displays-lightbox-media';
      inner.appendChild(img);
    }
    if (caption) {
      var p = document.createElement('p');
      p.className = 'displays-lightbox-caption';
      p.textContent = caption.textContent;
      inner.appendChild(p);
    }
    openTime = Date.now();
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeLightbox = function() {
    if (Date.now() - openTime < 300) return;
    lb.classList.remove('active');
    document.body.style.overflow = '';
  };

  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeLightbox(); });
})();
</script>

<section class="parties">
  <div class="parties-head">
    <h2 class="parties-title">Parties (Bot Coordination)</h2>
    <p class="parties-lead">Swarms made simple. Define a game in plain text, spawn autonomous AI agents that share a ledger, exchange private messages, form alliances, bluff, negotiate, and self-terminate.</p>
  </div>

  <div class="pa-viewport">
    <div class="pa-tabs-row">
      <div class="pa-tabs pa-tabs-l1">
        <button class="pa-tab pa-tab-l1 active" data-s="council" style="--tab-bg:#5b2d9e">🏛️ Council</button>
        <button class="pa-tab pa-tab-l1" data-s="redblue" style="--tab-bg:#b22830">⚔️ Red vs Blue</button>
        <button class="pa-tab pa-tab-l1" data-s="biz" style="--tab-bg:#1a7a9e">💼 Small Biz</button>
        <button class="pa-tab pa-tab-l1" data-s="survivor" style="--tab-bg:#1e8c4a">🐉 D&amp;D</button>
      </div>
      <div class="pa-tabs pa-tabs-l2">
        <button class="pa-tab pa-tab-l2" data-s="chain" style="--tab-bg:#8b3ecf">🔗 Chain</button>
        <button class="pa-tab pa-tab-l2" data-s="star" style="--tab-bg:#c48a15">⭐ Star</button>
        <button class="pa-tab pa-tab-l2" data-s="tree" style="--tab-bg:#2d9e2d">🌳 Tree</button>
        <button class="pa-tab pa-tab-l2" data-s="mesh" style="--tab-bg:#2255bb">🕸️ Full Mesh</button>
        <button class="pa-tab pa-tab-l2" data-s="smallworld" style="--tab-bg:#c42a7a">✨ Small-World</button>
      </div>
    </div>
    <div class="pa-body">
      <div class="pa-screen" id="pa-screen">
        <svg class="pa-svg" id="pa-svg"></svg>
        <div id="pa-terms"></div>
        <div id="pa-msgs"></div>
      </div>
      <div class="pa-ledger">
        <div class="pa-ledger-head">SHARED LEDGER</div>
        <div id="pa-lrows"></div>
      </div>
    </div>
  </div>

  <div class="parties-ideas">
    <span class="parties-idea">Plain Text Games</span>
    <span class="parties-idea">Shared Ledger</span>
    <span class="parties-idea">Private DMs</span>
    <span class="parties-idea">Dice & RNG</span>
    <span class="parties-idea">Squads & Teams</span>
    <span class="parties-idea">Any Model Mix</span>
    <span class="parties-idea">Self-Terminate</span>
    <span class="parties-idea">Negotiate & Bluff</span>
  </div>

  <div class="parties-foot">
    <a href="/features/#parties" class="parties-link">Explore Parties →</a>
  </div>
</section>
<script src="/parties.js"></script>

<section class="mobile">
  <div class="mobile-head">
    <h2 class="mobile-title">Many Mobile Options</h2>
    <p class="mobile-subtitle">Use Claude Code like you do on desktop from anywhere</p>
    <p class="mobile-lead">Use our easy SSH setup guide to get the Claude Code terminal on your phone to have ALL the features you would have on your desktop.</p>
  </div>

  <div class="mobile-phones">
    <div class="mobile-phone" style="--pd:0">
      <div class="mobile-frame">
        <div class="mobile-notch"></div>
        <div class="mobile-screen mobile-collage">
          <div class="mobile-app" style="--ai:0;--ac:#5865F2"><span>Discord</span></div>
          <div class="mobile-app" style="--ai:1;--ac:#25D366"><span>WhatsApp</span></div>
          <div class="mobile-app" style="--ai:2;--ac:#0088cc"><span>Telegram</span></div>
          <div class="mobile-app" style="--ai:3;--ac:#E1306C"><span>Instagram</span></div>
          <div class="mobile-app" style="--ai:4;--ac:#4A154B"><span>Slack</span></div>
          <div class="mobile-app" style="--ai:5;--ac:#3A76F0"><span>Signal</span></div>
          <div class="mobile-app" style="--ai:6;--ac:#34B7F1"><span>iMessage</span></div>
          <div class="mobile-app" style="--ai:7;--ac:#FF4500"><span>Reddit</span></div>
          <div class="mobile-app" style="--ai:8;--ac:#1DA1F2"><span>Twitter</span></div>
          <div class="mobile-app" style="--ai:9;--ac:#0A66C2"><span>LinkedIn</span></div>
          <div class="mobile-app" style="--ai:10;--ac:#FF0000"><span>YouTube</span></div>
          <div class="mobile-app" style="--ai:11;--ac:#EA4335"><span>Gmail</span></div>
        </div>
      </div>
      <p class="mobile-caption">Setup to talk to Clappie from any app you already use via webhook integration helper</p>
    </div>

    <div class="mobile-phone" style="--pd:1">
      <div class="mobile-frame">
        <div class="mobile-notch"></div>
        <div class="mobile-screen mobile-ssh-screen">
          <div class="mobile-ssh">
            <div class="ssh-line"><span class="ssh-prompt">~$</span> ssh clappie@home</div>
            <div class="ssh-line ssh-dim">Connected to macbook.tail1234.ts.net</div>
            <div class="ssh-line ssh-dim">Last login: Mon Feb 24 09:41</div>
            <div class="ssh-line"><span class="ssh-prompt">~$</span> claude</div>
                        <div class="ssh-line ssh-accent">╭────────────────────╮</div>
            <div class="ssh-line ssh-accent">│ Claude Code v1.0.3 │</div>
            <div class="ssh-line ssh-accent">│ ~/clappie          │</div>
            <div class="ssh-line ssh-accent">╰────────────────────╯</div>
            <div class="ssh-line"><span class="ssh-prompt">></span> check my emails</div>
            <div class="ssh-line ssh-dim">Reading inbox… 3 new</div>
            <div class="ssh-line ssh-green">✓ Summarized & created chores</div>
            <div class="ssh-line"><span class="ssh-prompt">></span> <span class="ssh-cursor">█</span></div>
          </div>
        </div>
      </div>
      <p class="mobile-caption">Piggy back off this setup for super easy SSH</p>
    </div>


  </div>

  <div class="mobile-foot">
    <a href="/ways-to-chat/" class="mobile-link">Setup Guide →</a>
  </div>
</section>
<script>
(function() {
  var mob = document.querySelector('.mobile');
  if (mob && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { mob.classList.add('mobile-visible'); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(mob);
  } else if (mob) { mob.classList.add('mobile-visible'); }
})();
</script>

<section class="setup">
  <div class="setup-head">
    <h2 class="setup-title">Dead Simple Setup</h2>
    <p class="setup-subtitle">A Single Skill / Dead Simple Setup<br>No complex agent frameworks</p>
    <p class="setup-lead">It's really just a super minimal codebase that relays and piggybacks you to Claude Code from anywhere. The code is basically 1 skill.</p>
  </div>

  <div class="setup-split">
    <div class="setup-tree-wrap">
      <div class="setup-tree-chrome">
        <span class="sc-term-dot" style="background:#ff5f57"></span>
        <span class="sc-term-dot" style="background:#febc2e"></span>
        <span class="sc-term-dot" style="background:#28c840"></span>
        <span class="setup-tree-title">~/clappie</span>
      </div>
      <div class="setup-tree">
        <div class="st-line" style="--d:0"><span class="st-dir">clappie/</span></div>
        <div class="st-line" style="--d:1">├── <span class="st-dir">.claude/skills/</span></div>
        <div class="st-line" style="--d:2">│   ├── <span class="st-dir">your-skill/</span> <span class="st-note st-note-green">← build your own</span></div>
        <div class="st-line" style="--d:3">│   │   ├── SKILL.md</div>
        <div class="st-line" style="--d:4">│   │   ├── webhook.json <span class="st-note st-note-green">← webhooks to your machine</span></div>
        <div class="st-line" style="--d:5">│   │   ├── oauth.json <span class="st-note st-note-green">← instant OAuth helper</span></div>
        <div class="st-line" style="--d:6">│   │   └── your-skill.js <span class="st-note st-note-green">← auto-extends clappie CLI</span></div>
        <div class="st-line" style="--d:7">│   ├── <span class="st-dir">clappie/</span> <span class="st-note st-note-pink">← the whole engine</span></div>
        <div class="st-line" style="--d:8">│   │   ├── <span class="st-dir">clapps/</span> <span class="st-note">← displays, sidekicks, heartbeat…</span></div>
        <div class="st-line" style="--d:9">│   │   └── clappie.js</div>
        <div class="st-line" style="--d:10">│   ├── <span class="st-dir">telegram-bot/</span> <span class="st-note">← message from anywhere</span></div>
        <div class="st-line" style="--d:11">│   └── <span class="st-note">[+ 3 more: slack, github, whisper]</span></div>
        <div class="st-line" style="--d:12">├── <span class="st-dir">recall/</span></div>
        <div class="st-line" style="--d:13">│   ├── <span class="st-dir">memory/</span> <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:14">│   ├── <span class="st-dir">settings/</span> <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:15">│   ├── <span class="st-dir">oauth/</span> <span class="st-note">← token storage</span></div>
        <div class="st-line" style="--d:16">│   ├── <span class="st-dir">files/</span> <span class="st-note st-note-cyan">← photos, voice, video</span></div>
        <div class="st-line" style="--d:17">│   ├── <span class="st-dir">parties/</span> <span class="st-note">← AI swarm games</span></div>
        <div class="st-line" style="--d:18">│   ├── <span class="st-dir">logs/</span> <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:19">│   └── profile.txt <span class="st-note">← synthesized user profile</span></div>
        <div class="st-line" style="--d:20">├── <span class="st-dir">chores/</span></div>
        <div class="st-line" style="--d:21">│   ├── <span class="st-dir">humans/</span> <span class="st-note st-note-cyan">← prepared AI drafts, you approve</span></div>
        <div class="st-line" style="--d:22">│   │   ├── reply-cto-roadmap.txt <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:23">│   │   └── call-dad-birthday.txt <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:24">│   └── <span class="st-dir">bots/</span> <span class="st-note st-note-cyan">← automated heartbeat tasks</span></div>
        <div class="st-line" style="--d:25">│       ├───── clean-notifications.txt <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:26">│       └───── system-health.txt <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:27">├── <span class="st-dir">notifications/</span></div>
        <div class="st-line" style="--d:28">│   ├── <span class="st-dir">dirty/</span> <span class="st-note st-note-amber">← raw dumps from integrations</span></div>
        <div class="st-line" style="--d:29">│   │   ├── gmail-sync.txt <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:30">│   │   └── slack-sync.json <span class="st-note">← technically a .txt file</span></div>
        <div class="st-line" style="--d:31">│   └── <span class="st-dir">clean/</span> <span class="st-note st-note-amber">← triaged, ready to review</span></div>
        <div class="st-line" style="--d:32">│       ├───── 3-new-work-chores.txt <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:33">│       └───── 6-auto-archived-emails.txt <span class="st-note">← .txt files</span></div>
        <div class="st-line" style="--d:34">├── <span class="st-dir">projects/</span> <span class="st-note st-note-green">← websites, apps, anything</span></div>
        <div class="st-line" style="--d:35">├── .env <span class="st-note">← API keys (gitignored)</span></div>
        <div class="st-line" style="--d:36">├── .gitignore</div>
        <div class="st-line" style="--d:37">└── CLAUDE.md <span class="st-note st-note-pink">← that's it, that's the whole thing</span></div>
      </div>
    </div>

    <div class="setup-grid">
      <div class="setup-card" style="--cd:0;--accent:#22d3ee">
        <div class="setup-card-icon">⚡</div>
        <h3 class="setup-card-title">Background</h3>
        <ul class="setup-card-list">
          <li>Easy Tailscale private VPN helper</li>
          <li>Background cron runner</li>
          <li>Sidekick control center</li>
        </ul>
      </div>
      <div class="setup-card" style="--cd:1;--accent:#a78bfa">
        <div class="setup-card-icon">📁</div>
        <h3 class="setup-card-title">.txt File Philosophy</h3>
        <ul class="setup-card-list">
          <li>Simple folder structure</li>
          <li>Plain text settings &amp; config</li>
          <li>Claude reads &amp; writes naturally</li>
        </ul>
      </div>
      <div class="setup-card" style="--cd:2;--accent:#4ade80">
        <div class="setup-card-icon">🔧</div>
        <h3 class="setup-card-title">Skill Builder</h3>
        <ul class="setup-card-list">
          <li>Skip risky third-party skill dirs</li>
          <li>Build your own integrations instead</li>
          <li>OAuth &amp; webhook managers baked in</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="setup-foot">
    <a href="/tutorial/" class="setup-link">Tutorial →</a>
  </div>
</section>
<script>
(function() {
  var setup = document.querySelector('.setup');
  if (setup && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) { setup.classList.add('setup-visible'); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(setup);
  } else if (setup) { setup.classList.add('setup-visible'); }
})();
</script>

`;

function generateHero(pageName = 'index', options = {}) {
  const config = HERO_CONFIG[pageName] || HERO_CONFIG.index;
  const { title, lead, isCommand } = config;

  const pixelTitle = generatePixelTitle(title);
  const clouds = generateClouds();
  const stars = generateStars();

  // Option to use pixel lead text instead of regular text
  // If lead is null, don't render lead at all
  let leadHtml = '';
  if (lead) {
    if (isCommand) {
      // Special command style with click-to-copy
      leadHtml = `<div class="hero-command" onclick="copyCommand(this)" title="Click to copy">
        <span class="command-prompt">$</span>
        <span class="command-text">${lead}</span>
        <span class="command-copied">Copied!</span>
      </div>`;
    } else if (options.pixelLead) {
      leadHtml = `<pre class="pixel-lead" aria-label="${lead}">${generatePixelLead(lead)}</pre>`;
    } else {
      leadHtml = `<p class="hero-lead">${lead}</p>`;
    }
  }

  return `
  <section class="hero" role="banner">
    <div class="cloud-layer">
    ${clouds}
    </div>
    <div class="stars-layer">
    ${stars}
    </div>
    <pre class="pixel-title" aria-label="${title}">${pixelTitle}</pre>
    ${leadHtml}
  </section>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// SITE-WIDE DISCLAIMERS
// ─────────────────────────────────────────────────────────────────────────────

const disclaimers = `
<div class="squiggly-divider"></div>
<section class="disclaimers">
  <div class="disclaimer-box vibe">
    <span class="disclaimer-icon">✨</span>
    <div class="disclaimer-content">
      <strong>CODED IN ENGLISH</strong>
      <p>This was my personal Claude Code setup being released as a project. It was "vibe coded" — the architecture is human, the code is robot. Built entirely through conversation with Claude Code. Beware of serious issues, bugs or vulnerabilities. But it was also built with love.</p>
    </div>
  </div>

  <div class="disclaimer-box warning">
    <span class="disclaimer-icon">⚠</span>
    <div class="disclaimer-content">
      <strong>NOT AFFILIATED WITH ANTHROPIC</strong>
      <p>Clappie is an <strong>independent project</strong> designed to work with Claude Code. It is <strong>NOT</strong> created, endorsed, or supported by <strong>Anthropic</strong>. "Claude" and "Claude Code" are trademarks of Anthropic. This software is <strong>not guaranteed to work</strong>, may break at any time <strong>without notice</strong> from a Claude Code update or from the author simply not maintaining it, may degrade or interfere with your normal Claude Code experience, and comes with <strong>zero expectation</strong> of continued functionality or compatibility.</p>
      <p>By using Clappie, you acknowledge that your use of Claude Code remains subject to <strong>Anthropic's <a href="https://www.anthropic.com/legal/aup" target="_blank" rel="noopener">Acceptable Use Policy</a></strong> and <strong><a href="https://www.anthropic.com/legal/consumer-terms" target="_blank" rel="noopener">Terms of Service</a></strong>. Clappie provides no separate license, warranty, or terms of its own. All AI interactions are processed through your existing Claude Code subscription and are governed solely by your agreement with Anthropic. Clappie's author assumes <strong>no liability</strong> for any actions taken by Claude Code on your behalf, any costs incurred through API usage, or any consequences arising from the use of this software.</p>
    </div>
  </div>

  <div class="disclaimer-box danger">
    <span class="disclaimer-icon">☠</span>
    <div class="disclaimer-content">
      <strong>EXPERIMENTAL SOFTWARE - EXTREME RISK</strong>
      <p>This is autonomous AI software that takes actions with minimal human oversight. It should <strong>ONLY</strong> be used in highly controlled, sandboxed, monitored environments - never with real accounts, real data, or production systems. It is <strong>NOT SECURE</strong>, has <strong>NOT BEEN AUDITED</strong>, and may cause <strong>IRREVERSIBLE HARM</strong> to your data, systems, accounts, finances, or reputation. There is <strong>NO WARRANTY</strong> of any kind. The authors accept <strong>NO LIABILITY</strong> and <strong>NO RESPONSIBILITY</strong> for any consequences. By using this software you assume <strong>ALL RISK</strong>. If you are not fully comfortable with experimental autonomous software acting on your behalf, <strong>DO NOT USE THIS</strong>.</p>
    </div>
  </div>

  <div class="site-links">
    <a href="https://twitter.com/whatnicktweets" target="_blank" rel="noopener">@whatnicktweets</a>
    <span class="link-sep">•</span>
    <a href="https://github.com/whatnickcodes/clappie" target="_blank" rel="noopener">GitHub</a>
  </div>
</section>`;

// ─────────────────────────────────────────────────────────────────────────────
// FILE TREE GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

// Tree structure with metadata:
// - _link: optional docs page link
// - _summary: optional summary for preview
// - _open: default open state (true/false)
// - _highlight: array of section ids that highlight this item
const CLAPPIE_TREE = {
  '~/clappie/': {
    _info: 'Self-contained project folder - everything lives here',
    _open: true,
    _highlight: ['folder-structure', 'key-directories'],
    '.claude/': {
      _info: 'Claude Code configuration - skills, settings, hooks',
      'skills/': {
        _info: 'Skill modules - each folder is a capability',
        'clappie/': {
          _info: 'Core clappie skill - displays, sidekicks, background',
          'clapps/': {
            _info: 'Built-in features and engines',
            _files: [
              { name: 'display-engine/', info: 'Terminal UI system - renders views, handles input' },
              { name: 'sidekicks/', info: 'Autonomous AI agents - spawn, route, complete' },
              { name: 'background/', info: 'Background task manager - heartbeats, always-on' },
              { name: 'chores/', info: 'Human approval queue UI' },
              { name: 'notifications/', info: 'Notification center UI' },
              { name: 'heartbeat/', info: 'Scheduled task runner' },
              { name: 'oauth/', info: 'OAuth flow + token management' },
              { name: 'tailscale/', info: 'Webhook server via Tailscale funnel' },
              { name: 'parties/', info: 'Gamified AI swarm simulations' },
              { name: 'projects/', info: 'Project workspace manager' },
              { name: 'utility/', info: 'Shared display components - pickers, editors, charts' },
              { name: 'skill-maker/', info: 'Guide for building new skills and integrations' },
              { name: 'example-demo-screens/', info: 'Reference implementations for display-engine patterns' },
            ]
          },
          _files: [
            { name: 'SKILL.md', info: 'Full clappie documentation' },
            { name: 'clappie.js', info: 'CLI entry point' },
          ]
        },
        'github/': {
          _info: 'GitHub integration - repos, PRs, issues, commits',
          _files: [
            { name: 'SKILL.md', info: 'Setup guide and CLI reference' },
            { name: 'github.js', info: 'CLI entry point' },
            { name: '.env.example', info: 'Required env vars' },
          ]
        },
        'whisper/': {
          _info: 'Audio transcription and text-to-speech via OpenAI',
          _files: [
            { name: 'SKILL.md', info: 'Setup guide and CLI reference' },
            { name: 'whisper.js', info: 'CLI entry point' },
            { name: '.env.example', info: 'Required env vars' },
          ]
        },
        'telegram-bot/': {
          _info: 'Telegram bot - message it from anywhere, it messages you back',
          'webhooks/': {
            _info: 'Webhook handling for Telegram updates',
            'routes/': {
              _info: 'Event-specific handlers',
              _files: [
                { name: 'incoming-message.js', info: 'Main message handler', explainer: 'Receives Telegram updates, parses messages, downloads attachments, and spawns sidekicks.', content: `// Telegram webhook handler - spawns sidekicks for messages

export default {
  path: '{webhook-path}',
  name: 'incoming-message',
  events: ['*'],  // Catch-all
  action: 'run',

  run: async (payload, ctx) => {
    const msg = parseMessage(payload);
    if (!msg) return { handled: true };

    // Check allowed users
    const allowedUsers = ctx.loadSkillSettingList('users');
    if (!isAllowedUser(msg.userId, allowedUsers)) {
      return { handled: true };
    }

    // Download attachments to recall/files/telegram/
    const attachments = await downloadAttachments(msg, ctx);

    return {
      sidekick: true,
      conversationId: msg.chatId,
      userId: msg.userId,
      content: msg.text,
      context: \`telegram user \${msg.userId}\`,
      attachments,
    };
  }
};` },
              ]
            },
            _files: [
              { name: 'verify.js', info: 'Signature verification', explainer: 'Telegram sends a secret token in the header. Simple string comparison.', content: `// Telegram webhook signature verification

export default function verify(req, rawBody, env) {
  const token = req.headers.get('x-telegram-bot-api-secret-token');
  const secret = env.TELEGRAM_WEBHOOK_SECRET;
  return token === secret;
}` },
              { name: 'send.js', info: 'Send messages, photos, reactions', explainer: 'Functions for sending messages back to Telegram. Used by sidekicks to reply.', content: `// Telegram send functions - used by Sidekick to reply

export async function send(chatId, message, options = {}) {
  const url = \`https://api.telegram.org/bot\${botToken}/sendMessage\`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });
}

export async function sendPhoto(chatId, filePath, caption) { /* ... */ }
export async function sendDocument(chatId, filePath, caption) { /* ... */ }
export async function sendVoice(chatId, filePath, caption) { /* ... */ }
export async function setReaction(chatId, messageId, emoji) { /* ... */ }` },
              { name: 'parse.js', info: 'Parse Telegram update payloads' },
            ]
          },
          _files: [
            { name: 'SKILL.md', info: 'Full setup guide', explainer: 'Complete instructions for setting up the Telegram bot - BotFather, webhook, Tailscale Funnel, etc.', content: `# Telegram Bot Skill

Text your AI from anywhere via Telegram.

## Setup

1. Create bot with @BotFather → get token
2. Add to .env: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET
3. Enable: echo "true" > recall/settings/telegram-bot/enabled.txt
4. Add your user ID: echo "123456" > recall/settings/telegram-bot/users.txt
5. Start sidekicks: clappie background start sidekicks
6. Expose via Tailscale: tailscale funnel 7777
7. Set webhook with Telegram API

## CLI Commands

clappie telegram send <chatId> <message>
clappie telegram photo <chatId> <path>
clappie telegram react <chatId> <msgId> <emoji>` },
            { name: 'telegram.js', info: 'CLI entry point', explainer: 'Handles clappie telegram <command> calls.', content: `#!/usr/bin/env bun
// Telegram bot CLI - clappie telegram <command>

import * as api from './webhooks/send.js';

const [cmd, ...args] = process.argv.slice(2);

switch (cmd) {
  case 'send': {
    const [chatId, ...msg] = args;
    await api.send(chatId, msg.join(' '));
    console.log('✓ Sent');
    break;
  }
  case 'photo': {
    const [chatId, path, ...caption] = args;
    await api.sendPhoto(chatId, path, caption.join(' '));
    console.log('✓ Photo sent');
    break;
  }
  case 'react': {
    const [chatId, msgId, emoji] = args;
    await api.setReaction(chatId, parseInt(msgId), emoji);
    console.log('✓ Reacted');
    break;
  }
}` },
            { name: 'webhook.json', info: 'Webhook config', explainer: 'Points to verification function and env var for signing secret.', content: `{
  "signing": {
    "verify": "webhooks/verify.js",
    "secretEnvVar": "TELEGRAM_WEBHOOK_SECRET"
  },
  "send": "webhooks/send.js"
}` },
            { name: '.env.example', info: 'Required env vars', content: `TELEGRAM_BOT_TOKEN=123456:ABC-your-bot-token
TELEGRAM_WEBHOOK_SECRET=any-random-secret-you-make-up` },
          ]
        },
        'slack-bot/': {
          _info: 'Slack bot - message it from anywhere, it messages you back',
          'webhooks/': {
            _info: 'Webhook handling for Slack events',
            'routes/': {
              _info: 'Event-specific handlers',
              _files: [
                { name: 'incoming-message.js', info: 'Main message handler', explainer: 'Receives Slack events, handles URL verification, parses messages, manages threads.', content: `// Slack events handler - spawns sidekicks for messages

export default {
  path: '{webhook-path}',
  name: 'incoming-message',
  events: ['*'],
  action: 'run',

  run: async (payload, ctx) => {
    const msg = parseMessage(payload);

    // URL verification challenge
    if (msg._challenge) {
      return { handled: true, challenge: msg._challenge };
    }

    // Check allowed users
    const allowedUsers = ctx.loadSkillSettingList('users');
    if (!isAllowedUser(msg.userId, allowedUsers)) {
      return { handled: true };
    }

    // Threads become separate conversations
    let conversationId = msg.chatId;
    if (msg.threadTs) {
      conversationId = \`\${msg.chatId}:\${msg.threadTs}\`;
    }

    return {
      sidekick: true,
      conversationId,
      userId: msg.userId,
      content: msg.text,
      context: \`slack channel \${msg.chatId}\`,
    };
  }
};` },
              ]
            },
            _files: [
              { name: 'verify.js', info: 'HMAC-SHA256 verification', explainer: 'Slack uses HMAC-SHA256 with timestamp for replay protection. More complex than Telegram.', content: `// Slack webhook signature verification
// HMAC-SHA256 with timestamp replay protection

import crypto from 'crypto';

export default function verify(req, rawBody, env) {
  const signature = req.headers.get('x-slack-signature');
  const timestamp = req.headers.get('x-slack-request-timestamp');

  if (!signature || !timestamp) return false;

  // Reject old requests (5 min window)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const sigBase = \`v0:\${timestamp}:\${rawBody}\`;
  const expected = 'v0=' + crypto
    .createHmac('sha256', env.SLACK_SIGNING_SECRET)
    .update(sigBase)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}` },
              { name: 'send.js', info: 'Send messages, files, reactions' },
              { name: 'parse.js', info: 'Parse Slack event payloads' },
            ]
          },
          _files: [
            { name: 'SKILL.md', info: 'Full setup guide', explainer: 'Complete instructions for setting up Slack bot - app creation, scopes, events, etc.', content: `# Slack Bot Skill

AI in your Slack workspace. Threads become separate sidekicks.

## Setup

1. Create Slack App at api.slack.com/apps
2. Add Bot Token Scopes: chat:write, files:read, reactions:write
3. Subscribe to events: message.im, message.channels, reaction_added
4. Install to workspace → get Bot Token
5. Add to .env: SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET
6. Enable: echo "true" > recall/settings/slack-bot/enabled.txt
7. Start sidekicks: clappie background start sidekicks
8. Set Request URL in Slack app settings

## CLI Commands

clappie slack-bot send <channel> <message>
clappie slack-bot thread <channel:ts> <message>
clappie slack-bot react <channel> <ts> <emoji>` },
            { name: 'slack-bot.js', info: 'CLI entry point', explainer: 'Handles clappie slack-bot <command> calls.', content: `#!/usr/bin/env bun
// Slack bot CLI - clappie slack-bot <command>

import * as api from './webhooks/send.js';

const [cmd, ...args] = process.argv.slice(2);

switch (cmd) {
  case 'send': {
    const [channel, ...msg] = args;
    await api.send(channel, msg.join(' '));
    console.log('✓ Sent');
    break;
  }
  case 'thread': {
    const [channelTs, ...msg] = args;
    await api.send(channelTs, msg.join(' '));
    console.log('✓ Replied in thread');
    break;
  }
  case 'react': {
    const [channel, ts, emoji] = args;
    await api.setReaction(channel, ts, emoji);
    console.log('✓ Reacted');
    break;
  }
}` },
            { name: 'webhook.json', info: 'Webhook config', content: `{
  "signing": {
    "verify": "webhooks/verify.js",
    "secretEnvVar": "SLACK_SIGNING_SECRET"
  },
  "send": "webhooks/send.js"
}` },
            { name: '.env.example', info: 'Required env vars', content: `SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret` },
          ]
        },
      },
      _files: [
        { name: 'settings.json', info: 'Claude Code config - permissions, deny patterns', explainer: 'Configure your Claude Code experience. Permissions control what tools Claude can use. Deny patterns protect sensitive files.', content: `{
  "permissions": {
    "allow": [
      "Read",
      "Edit",
      "Write",
      "Task",
      "Skill",
      "WebFetch",
      "WebSearch",
      "TodoWrite",
      "mcp__*",
      "Bash",
      "Glob",
      "Grep"
    ],
    "deny": [
      "Read(.env)",
      "Read(**/.env)",
      "Edit(.env)",
      "Edit(**/.env)",
      "Write(.env)"
    ]
  }
}` },
      ]
    },
    'chores/': {
      _info: 'Tasks to do - AI drafts risky actions, you approve before execution',
      _highlight: ['chores', 'two-types', 'file-format', 'approving-chores'],
      _open: true,
      'bots/': {
        _info: 'Automated tasks - run on schedule via heartbeat cron',
        _highlight: ['heartbeat', 'creating-a-bot-chore', 'built-in-bots', 'robot-chores'],
        _files: [
          { name: 'clean-notifications.txt', info: 'Runs every 15m - triages incoming notifications', explainer: 'This is the core notification processing heartbeat. It reads raw dumps from dirty/, applies your rules, and creates curated items in clean/. Runs every 15 minutes with Sonnet.', content: `Process incoming notifications from dirty/ folder.

1. Read all files in notifications/dirty/
2. Parse and understand each notification
3. Apply rules from notifications/instructions.txt
4. Create curated items in notifications/clean/
5. Delete processed files from dirty/
6. For urgent items, ping via Telegram

Log to recall/logs/heartbeat/

[heartbeat-meta]
interval: 15m
model: sonnet` },
          { name: 'fetch-my-calendars-and-dump-into-dirty.txt', info: 'Runs hourly - pulls calendar events' },
          { name: 'get-email-activity.txt', info: 'Runs every 30m - checks for new emails' },
          { name: '.imessage-dump-to-dirty.txt', info: 'Disabled (dot prefix) - remove dot to enable', explainer: 'Prefix a filename with a dot to disable it. The heartbeat runner skips dotfiles. Remove the dot to re-enable.' },
        ]
      },
      'humans/': {
        _info: 'Approval queue - drafts waiting for your go-ahead',
        _highlight: ['chores', 'human-chores', 'approving-chores'],
        _files: [
          { name: 'reply-cto-roadmap.txt', info: 'Draft email ready - review before sending', explainer: 'AI drafted this email based on your calendar and recent context. Edit the draft if needed, then approve to send.', content: `Reply to CTO about Q1 roadmap input

Draft email to send:

To: cto@acme-corp.com
Subject: Re: Q1 Roadmap - Need Your Input TODAY

Hi,

Here's my input on the Q1 roadmap:

**API Migration (my main focus)**
- Current status: 60% complete, on track for Feb 28
- Blockers: Need DevOps bandwidth for cutover

**My Recommendation**
- Ship migration first, tackle rate limits in Q2

Happy to jump on a call if you want to discuss.

Nick

---
[chore-meta]
status: pending
created: 2026-02-04 09:17
context: notification processing
icon: 📧
title: Reply to CTO about Q1 roadmap
summary: Draft ready - needs your review before sending` },
          { name: 'call-dad-birthday.txt', info: 'Reminder queued - approve to add to calendar' },
          { name: 'resolve-calendar-conflict.txt', info: 'Two meetings overlap - pick one to keep' },
        ]
      },
    },
    'notifications/': {
      _info: 'Inbox for everything - emails, texts, calendar, GitHub, etc.',
      _highlight: ['notifications', 'the-flow'],
      _open: true,
      'dirty/': {
        _info: 'Raw dumps land here - AI triages them every 15 min',
        _highlight: ['dirty-folder', 'dirty', 'the-flow'],
        _files: [
          { name: 'gmail-unread.json', info: 'Unread emails from Gmail sync' },
          { name: 'gmail-read-ids.txt', info: 'IDs of emails you read on phone (for cleanup)' },
          { name: 'gcal-today.json', info: 'Today\'s calendar events' },
          { name: 'github-prs.json', info: 'PR notifications from GitHub API', explainer: 'Raw GitHub notifications. AI parses this and creates clean items for what matters.', content: `[
  {
    "id": "1234567890",
    "reason": "review_requested",
    "subject": {
      "title": "feat: add webhook routing",
      "type": "PullRequest"
    },
    "repository": { "full_name": "org/repo" }
  }
]` },
        ]
      },
      'clean/': {
        _info: 'What actually matters - curated by AI, reviewed by you',
        _highlight: ['clean-folder', 'clean', 'the-flow', 'viewing-notifications'],
        _files: [
          { name: 'cto-q1-roadmap.txt', info: 'Work email - draft reply ready', explainer: 'AI read the email, understood context, and drafted a reply. Linked chore lets you review before sending.', content: `CTO needs Q1 roadmap input today

Email from cto@acme-corp.com at 08:45 marked IMPORTANT.
Subject: "Re: Q1 Roadmap - Need Your Input TODAY"

Probably wants your take on the API migration timeline
and resource allocation.

Action: Drafted a reply summarizing current status and blockers.

---
[meta]
source: email
source_id: gmail-18e2a7b3c4d5e
created: 2026-02-04 09:17
icon: 📋
title: CTO needs Q1 roadmap input
summary: Marked IMPORTANT - due today, draft ready
chore: reply-cto-roadmap` },
          { name: 'auto-handled.txt', info: '4 things handled automatically', explainer: 'Newsletters unsubscribed, meetings auto-accepted, noise filtered. Nothing needed from you.' },
          { name: 'family-stuff.txt', info: 'Dad called, Mom emailed about birthday dinner' },
        ]
      },
      _files: [
        { name: 'instructions.txt', info: 'Your rules - what\'s urgent, what to auto-handle', _highlight: ['instructions'], explainer: 'Edit this to customize how AI triages your notifications.', content: `# My Notification Rules

## Normal stuff
- Newsletters: try to unsubscribe via the link, hate spam
- Work emails: auto-draft a reply (use Dropbox, calendar, etc.
  as needed) and create a chore for me to review
- Calendar invites: triple check no conflict on work AND
  personal calendars, then auto-accept

## Urgent stuff
- Take liberties on what's actually urgent
- If urgent: still move to clean, but ALSO ping me on
  Telegram immediately - just shoot me a text ASAP!
- If my chores queue gets more than 10 items, text me` },
      ]
    },
    'recall/': {
      _info: 'Persistent memory - survives across sessions',
      _highlight: ['recall', 'glossary'],
      _open: true,
      'memory/': {
        _info: 'Facts about you - Claude reads these to remember who you are',
        _highlight: ['memory', 'recall', 'profile'],
        _files: [
          { name: 'personal.txt', info: 'Personal details - family, location, life', explainer: 'One fact per line. Claude reads these to understand who you are.', content: `Has a dog named Korra (corgi)
Wife is Abby, married 2023
Lives in Leesburg, VA
Birthday is March 15
Parents live nearby, Sunday dinners` },
          { name: 'preferences.txt', info: 'Likes, dislikes, communication style' },
          { name: 'people.txt', info: 'Key contacts and relationships' },
          { name: 'another-category.txt', info: 'Create files for any category you need' },
        ]
      },
      'settings/': {
        _info: 'App configuration - all runtime settings live here',
        _highlight: ['settings', 'configuration'],
        _open: true,
        'theme/': {
          _info: 'Display theme settings',
          _highlight: ['theme', 'settings'],
          _files: [
            { name: 'mode.txt', info: 'dark | light', content: `dark` },
            { name: 'scene.txt', info: 'shown | hidden', content: `shown` },
            { name: 'animations.txt', info: 'on | off', content: `on` },
            { name: 'colors.txt', info: 'Color scheme', content: `default` },
            { name: 'toggle.txt', info: 'Toggle state', content: `on` },
            { name: 'crab.txt', info: 'on | off', content: `on` },
            { name: 'dog.txt', info: 'on | off', content: `on` },
          ]
        },
        'heartbeat/': {
          _info: 'Heartbeat daemon settings',
          _highlight: ['heartbeat', 'configuration'],
          _files: [
            { name: 'enabled.txt', info: 'true | false', content: `true` },
            { name: 'interval.txt', info: 'Seconds between checks', content: `300` },
            { name: 'starting-model.txt', info: 'Model for heartbeat sessions', content: `sonnet` },
          ]
        },
        'sidekicks/': {
          _info: 'Sidekick system settings',
          _highlight: ['sidekicks', 'webhooks'],
          'webhooks/': {
            _info: 'User-defined webhook handlers (no skill required)',
            _highlight: ['webhook-routing', 'custom-webhooks'],
            _files: [
              { name: '.demo-dirty.js', info: 'Disabled - dumps payload to dirty/', explainer: 'Simplest webhook mode: just dump the payload to notifications/dirty/ for later processing.', content: `// Simplest mode: just dump payload to dirty/
export default {
  path: 'ifttt/{webhook-path}',
  signing: 'none',
  prefix: 'ifttt',
  // No run() = auto-dumps to notifications/dirty/
}` },
              { name: '.demo-sidekick.js', info: 'Disabled - spawns a Claude sidekick', explainer: 'Spawn an autonomous Claude session to handle the webhook intelligently.', content: `// Spawn an AI sidekick to handle the webhook
export default {
  path: 'github/{webhook-path}',
  signing: 'hmac',
  secret: 'GITHUB_WEBHOOK_SECRET',
  instructions: \`
    You received a GitHub webhook.
    If I was @mentioned, send me a Telegram notification.
    Otherwise, log it and complete.
  \`
}` },
              { name: '.demo-run.js', info: 'Disabled - custom code, full control', explainer: 'Full control mode: write your own logic to decide what to do with the webhook.', content: `// Custom logic to decide what to do
export default {
  path: 'alerts/{webhook-path}',
  signing: 'hmac',
  secret: 'ALERTS_WEBHOOK_SECRET',
  async run(payload, ctx) {
    if (payload.priority === 'high') {
      return { sidekick: true, content: \`URGENT: \${payload.message}\` };
    }
    return { noise: true };  // dump to dirty/
  }
}` },
            ]
          },
          _files: [
            { name: 'port.txt', info: 'HTTP server port', content: `7777` },
            { name: 'default-model.txt', info: 'Default model for spawned sidekicks', content: `opus` },
            { name: 'prompt-mode.txt', info: 'system | message', content: `system` },
            { name: 'allowed-send-file-paths.txt', info: 'Paths sidekicks can send files from', content: `recall/files
/tmp
~/Downloads` },
          ]
        },
        'telegram-bot/': {
          _info: 'Telegram bot configuration',
          _highlight: ['telegram', 'bots', 'integrations'],
          'webhooks/': {
            _info: 'Enable routes from skill - must opt-in manually',
            _files: [
              { name: 'incoming-message.txt', info: 'true | false - matches route in skill', content: `true` },
            ]
          },
          _files: [
            { name: 'enabled.txt', info: 'true | false - master switch', content: `true` },
            { name: 'webhook-path.txt', info: 'Secret URL segment for webhook', content: `abc123xyz` },
            { name: 'sidekick-prompt.txt', info: 'Custom prompt/personality for sidekicks (overrides skill defaults)', content: `You are my personal AI assistant via Telegram.
Be casual and brief - this is mobile.
Use emoji occasionally.
For complex tasks, confirm before acting.` },
            { name: 'users.txt', info: 'Allowed user IDs (one per line)', content: `123456789` },
          ]
        },
        'slack-bot/': {
          _info: 'Slack bot configuration',
          _highlight: ['slack', 'bots', 'integrations'],
          'webhooks/': {
            _info: 'Enable routes from skill - must opt-in manually',
            _files: [
              { name: 'incoming-message.txt', info: 'true | false - matches route in skill', content: `true` },
            ]
          },
          _files: [
            { name: 'enabled.txt', info: 'true | false', content: `false` },
            { name: 'webhook-path.txt', info: 'Secret URL segment for webhook', content: `slack-secret-123` },
            { name: 'sidekick-prompt.txt', info: 'Custom prompt/personality for sidekicks (overrides skill defaults)' },
            { name: 'users.txt', info: 'Allowed user IDs' },
          ]
        },
        'github/': {
          _info: 'GitHub webhook settings (overrides skill defaults)',
          _highlight: ['webhook-routing'],
          'webhooks/': {
            _info: 'Enable/disable specific webhook routes',
            _files: [
              { name: 'fork.txt', info: 'true | false - enable fork webhook', content: `true` },
              { name: 'star.txt', info: 'true | false - enable star webhook', content: `true` },
              { name: 'pull_request.txt', info: 'true | false - enable PR webhook', content: `true` },
              { name: 'issues.txt', info: 'true | false - enable issue webhook', content: `true` },
              { name: 'push.txt', info: 'true | false - enable push webhook', content: `false` },
              { name: 'release.txt', info: 'true | false - enable release webhook', content: `true` },
              { name: '.demo-github-signing.js', info: 'Disabled - override with custom signing logic' },
            ]
          },
          _files: [
            { name: 'enabled.txt', info: 'true | false', content: `true` },
            { name: 'webhook-path.txt', info: 'Auto-generated secret for webhook URL', content: `x7k9m2p4` },
          ]
        },
        'parties/': {
          _info: 'Party game settings',
          _highlight: ['parties'],
          _files: [
            { name: 'sidekick-prompt.txt', info: 'Custom prompt for party sidekicks' },
          ]
        },
      },
      'logs/': {
        _info: 'Activity logs - all history lives here',
        _highlight: ['logs', 'recall'],
        'heartbeat/': {
          _info: 'Daily heartbeat activity',
          _files: [{ name: '[...]', info: 'Log files per run' }]
        },
        'sidekicks/': {
          _info: 'Sidekick conversation logs',
          _files: [{ name: '[...]', info: 'Log files per session' }]
        },
        'chores/': {
          _info: 'Completed/rejected chores',
          _files: [{ name: '[...]', info: 'Archived chore files' }]
        },
        'notifications/': {
          _info: 'Notification processing history',
          _files: [{ name: '[...]', info: 'Processing logs' }]
        },
      },
      'files/': {
        _info: 'Media from messages - photos, voice notes, video',
        _highlight: ['files', 'recall'],
        _files: [{ name: '[...]', info: 'Photos, screenshots, telegram cache, etc.' }]
      },
      'oauth/': {
        _info: 'OAuth tokens and certificates',
        _highlight: ['oauth-helper', 'getting-tokens'],
        _files: [
          { name: 'clappie-localhost-key.pem', info: 'HTTPS key for local OAuth callback' },
          { name: 'clappie-localhost.pem', info: 'HTTPS cert for local OAuth callback' },
          { name: 'demo-oauth.json', info: 'Stored tokens for this provider', explainer: 'OAuth tokens are stored per-provider. Contains access_token, refresh_token, and expiry. Auto-refreshes when expired.', content: `{
  "access_token": "ya29.xxx...",
  "refresh_token": "1//xxx...",
  "expires_at": 1706990400000,
  "scope": "https://www.googleapis.com/auth/calendar.readonly"
}` },
        ]
      },
      'parties/': {
        _info: 'AI swarm games and simulation logs',
        _highlight: ['parties'],
        'games/': {
          _info: 'Game rule files — plain text definitions',
          _files: [
            { name: 'council.txt', info: 'AIs debate and vote on proposals' },
            { name: 'red-vs-blue.txt', info: 'Two teams competing' },
            { name: 'startup-sim.txt', info: 'Simulate a startup company' },
            { name: 'dungeon-crawl.txt', info: 'Collaborative adventure' },
            { name: 'demo-star.txt', info: 'Star topology demo' },
            { name: 'demo-chain.txt', info: 'Chain topology demo' },
            { name: 'demo-tree.txt', info: 'Tree topology demo' },
            { name: 'demo-full-mesh.txt', info: 'Full mesh topology demo' },
            { name: 'demo-small-world.txt', info: 'Small world topology demo' },
          ]
        },
        'simulations/': {
          _info: 'Logs from completed games',
          _files: [{ name: '[...]', info: 'Timestamped simulation logs' }]
        },
      },
      _files: [
        { name: 'profile.txt', info: 'Cached quick summary - auto-generated from memory/', _highlight: ['profile', 'memory'], explainer: 'Auto-generated by heartbeat. Synthesizes all memory files into one profile Claude reads at a glance.', content: `# Nick

Location: Leesburg, VA
Wife: Abby (married 2023)
Dog: Korra (corgi)

## Communication Style
Direct, zero fluff. Expects autonomous action.
HATES explanatory preambles - just do it.
Casual tone - "we're friends not formal".
Uses "dog", "bro", swears naturally.

## Work
Senior engineer, API migration lead.
Prefers Bun over Node, TypeScript.` },
      ]
    },
    'projects/': {
      _info: 'Full workspace - websites, apps, APIs, cloned repos',
      _highlight: ['projects', 'folder-structure'],
      _open: true,
      _files: [
        { name: 'budget-tracker/', info: 'Quick personal finance app' },
        { name: 'temp-app/', info: 'Static site served via Tailscale' },
        { name: '.gitignore', info: 'List repos with their own .git/ here to protect from outer repo ops', explainer: 'The outer clappie repo tracks projects/ by default. Quick apps and static sites get committed normally. But if a project has its own .git/ (cloned repos, serious standalone projects), it MUST be listed here so git clean doesn\'t destroy it.', content: `# Rule: if it has its own git, add it here.
#
# Example:
#   my-cloned-repo/
#   big-serious-project/` },
      ]
    },
    _files: [
      { name: '.env', info: 'API keys and secrets (gitignored)', _highlight: ['environment-variables'], explainer: 'Store all your API keys here. Never commit this file.', content: `# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_WEBHOOK_SECRET=your-secret

# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_SIGNING_SECRET=...

# OpenAI (for Whisper)
OPENAI_API_KEY=sk-...

# OAuth clients (per-integration)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...` },
{ name: '.gitignore', info: 'Files excluded from git' },
      { name: 'CLAUDE.md', info: 'The brain - ships with a solid default, tweak as you like', _highlight: ['claude-md', 'customization'], explainer: 'Tiny file. Just personality and a few pointers. The whole config.' },
    ]
  },
};

// HTML escape helper
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Extract file contents from tree for preview modal
function extractFileContents(tree, parentPath = '') {
  const contents = {};

  for (const [name, value] of Object.entries(tree)) {
    if (name.startsWith('_')) continue;

    const isDir = name.endsWith('/');
    const path = parentPath + name;

    if (isDir && value && typeof value === 'object') {
      // Recurse into directories
      Object.assign(contents, extractFileContents(value, path));

      // Also check _files in this directory
      if (value._files) {
        for (const file of value._files) {
          if (typeof file === 'object' && (file.content || file.explainer)) {
            const fileName = file.name;
            const fileId = (path + fileName).replace(/[^a-zA-Z0-9]/g, '_');
            contents[fileId] = {
              explainer: file.explainer || '',
              content: file.content || ''
            };
          }
        }
      }
    }
  }

  // Handle root-level _files
  if (tree._files) {
    for (const file of tree._files) {
      if (typeof file === 'object' && (file.content || file.explainer)) {
        const fileName = file.name;
        const fileId = (parentPath + fileName).replace(/[^a-zA-Z0-9]/g, '_');
        contents[fileId] = {
          explainer: file.explainer || '',
          content: file.content || ''
        };
      }
    }
  }

  return contents;
}

function renderTree(tree, depth = 0, parentPath = '', openFolders = []) {
  let html = '';

  for (const [name, value] of Object.entries(tree)) {
    // Skip metadata keys
    if (name.startsWith('_')) continue;

    const isDir = name.endsWith('/');
    const path = parentPath + name;
    const cleanName = name.replace(/\/+$/, ''); // Remove trailing slashes

    if (isDir && value && typeof value === 'object') {
      const meta = value;
      const isOpen = meta._open || openFolders.includes(path);
      const highlights = meta._highlight || [];
      const info = meta._info ? escapeHtml(meta._info) : '';

      html += `<div class="tree-item tree-dir" data-path="${path}" data-highlights="${highlights.join(',')}"${info ? ` data-info="${info}"` : ''} onclick="toggleFolder(this)">
        <span class="tree-arrow">${isOpen ? '▼' : '▶'}</span>
        <span class="tree-name">${cleanName}/</span>
      </div>`;
      html += `<div class="tree-children${isOpen ? '' : ' collapsed'}" data-path="${path}">`;

      // Render subdirectories and files
      html += renderTree(meta, depth + 1, path, openFolders);

      // Render _files array if present
      if (meta._files) {
        for (const file of meta._files) {
          const fileName = typeof file === 'string' ? file : file.name;
          const fileInfo = typeof file === 'object' && file.info ? escapeHtml(file.info) : '';
          const hasContent = typeof file === 'object' && (file.content || file.explainer);
          const fileId = (path + fileName).replace(/[^a-zA-Z0-9]/g, '_');
          const clickHandler = hasContent ? `onclick="showPreview('${path}${fileName}', '${fileId}')"` : '';
          const fileHighlights = typeof file === 'object' && file._highlight ? file._highlight.join(',') : '';

          html += `<div class="tree-item tree-file${hasContent ? ' has-preview' : ''}" data-path="${path}${fileName}"${fileInfo ? ` data-info="${fileInfo}"` : ''} data-file-id="${fileId}"${fileHighlights ? ` data-highlights="${fileHighlights}"` : ''} ${clickHandler}>
            <span class="tree-arrow"></span>
            <span class="tree-name">${fileName}</span>
            ${hasContent ? '<span class="tree-preview-icon">👁</span>' : ''}
          </div>`;
        }
      }

      html += '</div>';
    }
  }

  // Handle root-level _files
  if (tree._files && depth === 0) {
    for (const file of tree._files) {
      const fileName = typeof file === 'string' ? file : file.name;
      const fileInfo = typeof file === 'object' && file.info ? escapeHtml(file.info) : '';
      const hasContent = typeof file === 'object' && (file.content || file.explainer);
      const fileId = (parentPath + fileName).replace(/[^a-zA-Z0-9]/g, '_');
      const clickHandler = hasContent ? `onclick="showPreview('${parentPath}${fileName}', '${fileId}')"` : '';
      const fileHighlights = typeof file === 'object' && file._highlight ? file._highlight.join(',') : '';

      html += `<div class="tree-item tree-file${hasContent ? ' has-preview' : ''}" data-path="${parentPath}${fileName}"${fileInfo ? ` data-info="${fileInfo}"` : ''} data-file-id="${fileId}"${fileHighlights ? ` data-highlights="${fileHighlights}"` : ''} ${clickHandler}>
        <span class="tree-arrow"></span>
        <span class="tree-name">${fileName}</span>
        ${hasContent ? '<span class="tree-preview-icon">👁</span>' : ''}
      </div>`;
    }
  }

  return html;
}

function generateFileTree(currentPage = '', openFolders = []) {
  return `<div class="tree-wrapper">
    <aside class="file-tree">
      <div class="tree-header">
        <span class="tree-title">File Structure</span>
        <button class="tree-collapse" onclick="toggleTreeSidebar()" aria-label="Toggle tree">◀</button>
      </div>
      <div class="tree-content">
        ${renderTree(CLAPPIE_TREE, 0, '', openFolders)}
      </div>
    </aside>
  </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE OF CONTENTS GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

function extractHeadings(html) {
  const headings = [];
  const regex = /<h([23]) id="([^"]+)"><a href="[^"]+">([^<]+)<\/a><\/h[23]>/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      id: match[2],
      text: match[3]
    });
  }

  return headings;
}

function generateTOC(headings) {
  if (headings.length === 0) return '';

  const items = headings.map(h => {
    const indent = h.level === 3 ? ' toc-indent' : '';
    return `<a href="#${h.id}" class="toc-item${indent}" data-id="${h.id}" onclick="if(window.switchTab)switchTab('clean')">${h.text}</a>`;
  }).join('\n          ');

  return `
      <div class="toc-wrapper">
        <aside class="toc-sidebar">
          <div class="toc-header">
            <span class="toc-title">📑 On this page</span>
          </div>
          <nav class="toc-nav">
            ${items}
          </nav>
        </aside>
      </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT TABS (CLEAN/DIRTY)
// ─────────────────────────────────────────────────────────────────────────────

function generateContentTabs(cleanContent, dirtyContent, hasNotes) {
  if (!hasNotes) {
    return `<div class="page-content">${cleanContent}</div>`;
  }

  // For dirty content, just show raw text - no markdown processing
  return `
    <div class="tab-content active" id="tab-clean">
      <div class="page-content">${cleanContent}</div>
    </div>
    <div class="tab-content" id="tab-dirty">
      <div class="dirty-box">${dirtyContent}</div>
    </div>`;
}

function generateTabBar(hasNotes) {
  if (!hasNotes) return '';

  return `
    <div class="content-tabs">
      <button class="tab-btn active" data-tab="clean" onclick="switchTab('clean')">
        <span class="tab-icon">✨</span> Cleaned (generated)
      </button>
      <button class="tab-btn" data-tab="dirty" onclick="switchTab('dirty')">
        <span class="tab-icon">📝</span> Notes (human)
      </button>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTML TEMPLATE
// ─────────────────────────────────────────────────────────────────────────────

// Extract TLDR from content
function extractTLDR(content) {
  // Match the full TLDR div including nested elements
  const tldrMatch = content.match(/<div class="tldr">(?:<div class="tldr-label">.*?<\/div>)?[\s\S]*?<\/div>/);
  if (tldrMatch) {
    // Find the actual full tldr block by counting div tags
    const start = content.indexOf('<div class="tldr">');
    if (start !== -1) {
      let depth = 0;
      let end = start;
      for (let i = start; i < content.length; i++) {
        if (content.slice(i, i + 4) === '<div') depth++;
        if (content.slice(i, i + 6) === '</div>') {
          depth--;
          if (depth === 0) {
            end = i + 6;
            break;
          }
        }
      }
      const tldr = content.slice(start, end);
      return {
        tldr,
        content: content.slice(0, start) + content.slice(end)
      };
    }
  }
  return { tldr: '', content };
}

const html = (title, content, pageName = null, isHomepage = false, hasNotes = false, dirtyContent = '', toc = '') => {
  const { tldr, content: mainContent } = extractTLDR(content);
  return `<!DOCTYPE html>
<html lang="en"${isHomepage ? ' class="homepage"' : ''} data-page="${pageName || ''}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Clappie - Turn Claude Code into a 24/7 autonomous personal agent with a single skill file. Terminal UIs, background tasks, phone integration, and more.">
  <meta name="theme-color" content="#d97757">
  <title>${title} - Clappie</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 110'><rect fill='%23ff8ec6' x='22' y='0' width='20' height='30'/><rect fill='%23ff8ec6' x='78' y='0' width='20' height='30'/><rect fill='%23ff8ec6' x='10' y='20' width='100' height='90' rx='20'/><rect fill='%231a1918' x='32' y='50' width='18' height='24'/><rect fill='%231a1918' x='70' y='50' width='18' height='24'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-json.min.js" defer></script>
</head>
<body>
  <div class="aurora"></div>
  <header>
    <div class="hello-bar">
      <a href="https://oh0.ai" class="hello-bar-link-wrap">
        <span class="hb-prompt">▸</span>
        <span class="hb-pre">looking for</span>
        <span class="hb-face" id="hb-face">o_0</span>
        <span class="hb-post">?</span>
        <span class="hb-arrow">→</span>
        <span class="hb-bracket">[</span><span class="hb-url" id="hb-url">oh0.ai</span><span class="hb-bracket">]</span>
      </a>
      <button class="hello-bar-dismiss" aria-label="Dismiss">×</button>
    </div>
    <div class="header-inner">
      ${dogLogo}
      ${nav}
      <div class="header-right">
        ${gardenToggle}
        ${themeToggle}
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-hidden="true">
        <label for="nav-toggle" class="nav-burger" aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </label>
      </div>
    </div>
  </header>
  ${pageName ? generateHero(pageName) : ''}
  ${!isHomepage && tldr ? `<div class="tldr-wrapper">${tldr}</div>` : ''}
  ${isHomepage ? content : `
    <div class="docs-layout">
      ${generateFileTree(pageName)}
      <div class="docs-main">
        ${generateTabBar(hasNotes)}
        <main>
          ${generateContentTabs(mainContent, dirtyContent, hasNotes)}
        </main>
      </div>
      ${toc}
    </div>
  `}
  ${disclaimers}
  ${footerHTML}
  ${themeScript}
  ${isHomepage ? homepageScript : ''}
  ${!isHomepage ? generateFileContentsScript() : ''}
  ${!isHomepage ? docsScript : ''}
</body>
</html>`;
};

// Generate script with file contents for preview modal
function generateFileContentsScript() {
  const contents = extractFileContents(CLAPPIE_TREE);
  return `<script>window.FILE_CONTENTS = ${JSON.stringify(contents)};</script>`;
}

// Docs page script (tabs, tree, preview)
const docsScript = `<script>
(function() {
  // Tab switching
  window.switchTab = function(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === 'tab-' + tab);
    });
  };

  // Sidebar collapse toggle
  window.toggleTreeSidebar = function() {
    const tree = document.querySelector('.file-tree');
    const wrapper = document.querySelector('.tree-wrapper');
    tree.classList.toggle('collapsed');
    const isCollapsed = tree.classList.contains('collapsed');
    const width = isCollapsed ? '50px' : '250px';
    wrapper.style.width = width;
    wrapper.style.minWidth = width;
    tree.style.width = width;
  };

  // Folder toggle
  window.toggleFolder = function(el) {
    const path = el.dataset.path;
    const children = document.querySelector('.tree-children[data-path="' + path + '"]');
    const arrow = el.querySelector('.tree-arrow');
    if (children) {
      children.classList.toggle('collapsed');
      arrow.textContent = children.classList.contains('collapsed') ? '▶' : '▼';
    }
  };

  // JS-based sticky file tree
  const tree = document.querySelector('.file-tree');
  const wrapper = document.querySelector('.tree-wrapper');
  const layout = document.querySelector('.docs-layout');
  if (tree && wrapper && layout) {
    const treeWidth = tree.offsetWidth;
    wrapper.style.width = treeWidth + 'px';
    wrapper.style.minWidth = treeWidth + 'px';
    wrapper.style.flexShrink = '0';

    let ticking = false;

    function updateSticky() {
      const layoutRect = layout.getBoundingClientRect();
      const layoutBottom = layoutRect.bottom;
      const viewportHeight = window.innerHeight;

      if (layoutRect.top <= 0 && layoutBottom > viewportHeight) {
        tree.style.position = 'fixed';
        tree.style.top = '0';
        tree.style.left = layoutRect.left + 'px';
        tree.style.height = '100vh';
        tree.style.width = treeWidth + 'px';
        tree.classList.add('sticky');
      } else if (layoutBottom <= viewportHeight && layoutRect.top <= 0) {
        tree.style.position = 'absolute';
        tree.style.top = 'auto';
        tree.style.bottom = '0';
        tree.style.left = '0';
        tree.style.height = '100vh';
        tree.style.width = treeWidth + 'px';
        tree.classList.add('sticky');
      } else {
        tree.style.position = 'relative';
        tree.style.top = 'auto';
        tree.style.bottom = 'auto';
        tree.style.left = 'auto';
        tree.style.height = '100%';
        tree.style.width = '';
        tree.classList.remove('sticky');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateSticky);
        ticking = true;
      }
    });
    window.addEventListener('resize', updateSticky);
    updateSticky();
  }

  // File preview modal with explainer + content
  window.showPreview = function(path, fileId) {
    let modal = document.getElementById('preview-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'preview-modal';
      modal.className = 'preview-modal';
      modal.innerHTML = '<div class="preview-backdrop" onclick="closePreview()"></div>' +
        '<div class="preview-content">' +
        '<div class="preview-header">' +
        '<span class="preview-path"></span>' +
        '<button class="preview-close" onclick="closePreview()">✕</button>' +
        '</div>' +
        '<div class="preview-body"></div>' +
        '</div>';
      document.body.appendChild(modal);
    }

    modal.querySelector('.preview-path').textContent = path;

    const bodyEl = modal.querySelector('.preview-body');
    const fileData = window.FILE_CONTENTS && window.FILE_CONTENTS[fileId];

    if (fileData && (fileData.content || fileData.explainer)) {
      let html = '';
      if (fileData.explainer) {
        html += '<div class="preview-explainer">' + fileData.explainer + '</div>';
      }
      if (fileData.content) {
        // Detect language from filename
        let lang = 'javascript';
        if (fileId.endsWith('.json')) lang = 'json';
        else if (fileId.endsWith('.md')) lang = 'markdown';
        else if (fileId.endsWith('.sh') || fileId.endsWith('.bash')) lang = 'bash';
        html += '<pre class="preview-code"><code class="language-' + lang + '">' + escapeHtmlClient(fileData.content) + '</code></pre>';
      }
      bodyEl.innerHTML = html;
      // Apply Prism syntax highlighting
      const codeEl = bodyEl.querySelector('code[class*="language-"]');
      if (codeEl && window.Prism) Prism.highlightElement(codeEl);
    } else {
      bodyEl.innerHTML = '<p class="preview-no-content">No preview available</p>';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  // Info tooltip on hover
  let infoTooltip = null;
  document.querySelectorAll('.tree-item[data-info]').forEach(item => {
    item.addEventListener('mouseenter', (e) => {
      const info = item.dataset.info;
      if (!info) return;

      if (!infoTooltip) {
        infoTooltip = document.createElement('div');
        infoTooltip.className = 'tree-info-tooltip';
        document.body.appendChild(infoTooltip);
      }

      infoTooltip.textContent = info;
      infoTooltip.classList.add('visible');

      const rect = item.getBoundingClientRect();
      infoTooltip.style.left = (rect.right + 8) + 'px';
      infoTooltip.style.top = rect.top + 'px';
    });

    item.addEventListener('mouseleave', () => {
      if (infoTooltip) infoTooltip.classList.remove('visible');
    });
  });

  function escapeHtmlClient(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.closePreview = function() {
    const modal = document.getElementById('preview-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // ESC to close preview
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePreview();
  });

  // Section-based highlighting with auto-expand
  // Find all h2/h3 with ids and watch scroll position
  const sections = document.querySelectorAll('h2[id], h3[id]');
  const treeItems = document.querySelectorAll('.tree-item[data-highlights]');

  // Helper: expand all parent folders of an element
  function expandParents(item) {
    let parent = item.parentElement;
    while (parent) {
      if (parent.classList.contains('tree-children') && parent.classList.contains('collapsed')) {
        parent.classList.remove('collapsed');
        // Update the arrow on the parent folder
        const path = parent.dataset.path;
        const folder = document.querySelector('.tree-dir[data-path="' + path + '"]');
        if (folder) {
          const arrow = folder.querySelector('.tree-arrow');
          if (arrow) arrow.textContent = '▼';
        }
      }
      parent = parent.parentElement;
    }
  }

  // Helper: expand children of a folder
  function expandChildren(item) {
    if (!item.classList.contains('tree-dir')) return;
    const path = item.dataset.path;
    const children = document.querySelector('.tree-children[data-path="' + path + '"]');
    if (children && children.classList.contains('collapsed')) {
      children.classList.remove('collapsed');
      const arrow = item.querySelector('.tree-arrow');
      if (arrow) arrow.textContent = '▼';
    }
  }

  let hasScrolled = false;

  function updateHighlights() {
    let currentSection = '';
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150) {
        currentSection = section.id || section.textContent.toLowerCase().replace(/[^a-z0-9]/g, '-');
      }
    });

    // Track which items to scroll to (first highlighted one)
    let firstNewHighlight = null;

    treeItems.forEach(item => {
      const highlights = (item.dataset.highlights || '').split(',').filter(Boolean);
      const isHighlighted = highlights.some(h => currentSection.includes(h));
      const wasHighlighted = item.classList.contains('highlighted');
      item.classList.toggle('highlighted', isHighlighted);

      if (hasScrolled) {
        // Auto-expand when highlighted
        if (isHighlighted && !wasHighlighted) {
          expandParents(item);
          expandChildren(item);
          if (!firstNewHighlight) firstNewHighlight = item;
        }
        // Auto-collapse when un-highlighted
        if (!isHighlighted && wasHighlighted) {
          collapseChildren(item);
        }
      }
    });

    // Scroll to first newly highlighted item
    if (firstNewHighlight) {
      scrollTreeToItem(firstNewHighlight);
    }
  }

  // Collapse children of a folder
  function collapseChildren(item) {
    if (!item.classList.contains('tree-dir')) return;
    const path = item.dataset.path;
    const children = document.querySelector('.tree-children[data-path="' + path + '"]');
    if (children && !children.classList.contains('collapsed')) {
      children.classList.add('collapsed');
      const arrow = item.querySelector('.tree-arrow');
      if (arrow) arrow.textContent = '▶';
    }
  }

  // Scroll tree to show item at 25% from top
  function scrollTreeToItem(item) {
    const fileTree = document.querySelector('.file-tree');
    if (!fileTree) return;

    const treeRect = fileTree.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const targetOffset = treeRect.height * 0.25;

    // Calculate where item is relative to tree
    const itemTopInTree = itemRect.top - treeRect.top + fileTree.scrollTop;
    const scrollTo = itemTopInTree - targetOffset;

    fileTree.scrollTo({ top: Math.max(0, scrollTo), behavior: 'smooth' });
  }

  window.addEventListener('scroll', () => {
    hasScrolled = true;
    updateHighlights();
  });
  updateHighlights();

  // ─── TABLE OF CONTENTS SCROLL SPY ─────────────────────────────────────────────
  const tocItems = document.querySelectorAll('.toc-item');
  const tocHeadings = document.querySelectorAll('h2[id], h3[id]');

  function updateTOC() {
    if (!tocItems.length || !tocHeadings.length) return;

    let currentId = '';

    tocHeadings.forEach(heading => {
      const rect = heading.getBoundingClientRect();
      if (rect.top <= 120) {
        currentId = heading.id;
      }
    });

    tocItems.forEach(item => {
      const isActive = item.dataset.id === currentId;
      item.classList.toggle('active', isActive);
    });
  }

  window.addEventListener('scroll', updateTOC, { passive: true });
  updateTOC();

  // Smooth scroll for TOC links
  tocItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const id = item.dataset.id;
      const target = document.getElementById(id);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

  // ─── TOC STICKY (mirrors file tree logic) ─────────────────────────────────────
  const toc = document.querySelector('.toc-sidebar');
  const tocWrapper = document.querySelector('.toc-wrapper');
  if (toc && tocWrapper && layout) {
    const tocWidth = toc.offsetWidth;
    tocWrapper.style.width = tocWidth + 'px';
    tocWrapper.style.minWidth = tocWidth + 'px';
    tocWrapper.style.flexShrink = '0';

    let tocTicking = false;

    function updateTocSticky() {
      const layoutRect = layout.getBoundingClientRect();
      const layoutBottom = layoutRect.bottom;
      const viewportHeight = window.innerHeight;

      if (layoutRect.top <= 0 && layoutBottom > viewportHeight) {
        // Fixed: stick to viewport
        toc.style.position = 'fixed';
        toc.style.top = '0';
        toc.style.left = (layoutRect.right - tocWidth) + 'px';
        toc.style.right = 'auto';
        toc.style.height = '100vh';
        toc.style.width = tocWidth + 'px';
        toc.classList.add('sticky');
      } else if (layoutBottom <= viewportHeight && layoutRect.top <= 0) {
        // Absolute: stick to bottom of layout
        toc.style.position = 'absolute';
        toc.style.top = 'auto';
        toc.style.bottom = '0';
        toc.style.left = 'auto';
        toc.style.right = '0';
        toc.style.height = '100vh';
        toc.style.width = tocWidth + 'px';
        toc.classList.add('sticky');
      } else {
        // Static: normal flow
        toc.style.position = 'relative';
        toc.style.top = 'auto';
        toc.style.bottom = 'auto';
        toc.style.left = 'auto';
        toc.style.right = 'auto';
        toc.style.height = '100%';
        toc.style.width = '';
        toc.classList.remove('sticky');
      }
      tocTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!tocTicking) {
        requestAnimationFrame(updateTocSticky);
        tocTicking = true;
      }
    });
    window.addEventListener('resize', updateTocSticky);
    updateTocSticky();
  }
})();
</script>`;

// Homepage-specific script
const homepageScript = `<script>
(function() {
  // Feature card hover preview
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('hovered');
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('hovered');
    });
  });

  // Randomize pixel explosion on each hover
  document.querySelectorAll('.pixel-title .pl').forEach(line => {
    line.addEventListener('mouseenter', () => {
      line.querySelectorAll('.px').forEach(px => {
        const tx = Math.round((Math.random() - 0.5) * 150);
        const ty = Math.round((Math.random() - 0.5) * 150);
        const r = Math.round((Math.random() - 0.5) * 720);
        const scale = (0.6 + Math.random() * 0.8).toFixed(2);
        const hue = Math.round((Math.random() - 0.5) * 60);
        const br = Math.round(Math.random() * 50);
        px.style.setProperty('--tx', tx + 'px');
        px.style.setProperty('--ty', ty + 'px');
        px.style.setProperty('--r', r + 'deg');
        px.style.setProperty('--s', scale);
        px.style.setProperty('--h', hue + 'deg');
        px.style.setProperty('--br', br + '%');
      });
    });
  });
})();
</script>`;

// ─────────────────────────────────────────────────────────────────────────────
// BUILD
// ─────────────────────────────────────────────────────────────────────────────

async function build() {
  console.log('🔨 Building Clappie docs...\n');

  await mkdir(OUT_DIR, { recursive: true });

  const allFiles = await readdir(PAGES_DIR);
  const notesFiles = await readdir(NOTES_DIR).catch(() => []);
  // Get main .md files
  const files = allFiles.filter(f => f.endsWith('.md'));

  // Pages that get hero sections (all of them!)
  const HERO_PAGES = ['index', 'test', 'tutorial', 'features', 'ways-to-chat', 'integrations', 'misc'];

  // Build custom homepage first
  await writeFile(join(OUT_DIR, 'index.html'), html('Home', homepageContent, 'index', true));
  console.log('  ✓ custom homepage → /');

  for (const file of files) {
    const name = file.replace('.md', '');

    // Skip index.md - we use custom homepage instead
    if (name === 'index') continue;

    const content = await readFile(join(PAGES_DIR, file), 'utf-8');
    const title = content.match(/^# (.+)$/m)?.[1] || name;
    const hasHero = HERO_PAGES.includes(name);

    // Check for corresponding notes file in notes/ directory
    const notesFile = `${name}.md`;
    const hasNotes = notesFiles.includes(notesFile);
    let dirtyContent = '';
    if (hasNotes) {
      dirtyContent = await readFile(join(NOTES_DIR, notesFile), 'utf-8');
    }

    await mkdir(join(OUT_DIR, name), { recursive: true });

    // Process markdown and extract headings for TOC
    const processedContent = md(content);
    const headings = extractHeadings(processedContent);
    const toc = generateTOC(headings);

    await writeFile(
      join(OUT_DIR, name, 'index.html'),
      html(title, processedContent, hasHero ? name : null, false, hasNotes, dirtyContent, toc)
    );

    const notesIndicator = hasNotes ? ' (+ notes)' : '';
    console.log(`  ✓ ${file}${notesIndicator} → /${name}/`);
  }

  // Copy stylesheet
  await writeFile(
    join(OUT_DIR, 'style.css'),
    await readFile(join(DOCS_DIR, 'style.css'), 'utf-8')
  );
  console.log('  ✓ style.css');

  // Copy fonts
  const fontsDir = join(DOCS_DIR, 'fonts');
  const outFontsDir = join(OUT_DIR, 'fonts');
  await mkdir(outFontsDir, { recursive: true });
  const fontFiles = await readdir(fontsDir).catch(() => []);
  for (const f of fontFiles) {
    await writeFile(join(outFontsDir, f), await readFile(join(fontsDir, f)));
  }
  if (fontFiles.length) console.log(`  ✓ ${fontFiles.length} fonts`);

  // Copy parties.js
  await writeFile(join(OUT_DIR, 'parties.js'), await readFile(join(DOCS_DIR, 'parties.js'), 'utf-8'));
  console.log('  ✓ parties.js');

  console.log(`\n✨ Built ${files.length} pages to dist/`);
}

build().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
