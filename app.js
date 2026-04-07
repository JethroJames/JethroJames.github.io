import { prepare, layout } from 'https://esm.sh/@chenglou/pretext'

// ============================================================
// Loading Screen
// ============================================================

const loader = document.getElementById('loader')
const LOADER_SOFT_DELAY_MS = 1400
const LOADER_HARD_TIMEOUT_MS = 4200

function dismissLoader() {
  if (loader && !loader.classList.contains('done')) {
    loader.classList.add('done')
  }
}

if (loader) {
  loader.addEventListener('click', dismissLoader)

  const scheduleDismiss = (delay) => setTimeout(dismissLoader, delay)

  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    scheduleDismiss(LOADER_SOFT_DELAY_MS)
  } else {
    window.addEventListener('DOMContentLoaded', () => scheduleDismiss(LOADER_SOFT_DELAY_MS), { once: true })
  }

  window.addEventListener('load', () => scheduleDismiss(500), { once: true })
  scheduleDismiss(LOADER_HARD_TIMEOUT_MS)
}

// ============================================================
// WeChat Modal
// ============================================================

const wechatBtn = document.getElementById('wechatBtn')
const wechatModal = document.getElementById('wechatModal')
const modalClose = document.getElementById('modalClose')

wechatBtn.addEventListener('click', () => wechatModal.classList.add('open'))
const collabWechatBtn = document.getElementById('collabWechatBtn')
if (collabWechatBtn) collabWechatBtn.addEventListener('click', () => wechatModal.classList.add('open'))
modalClose.addEventListener('click', () => wechatModal.classList.remove('open'))
wechatModal.addEventListener('click', (e) => {
  if (e.target === wechatModal) wechatModal.classList.remove('open')
})
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') wechatModal.classList.remove('open')
})

// ============================================================
// Pretext Canvas – Research keyword flow in hero background
// ============================================================

const canvas = document.getElementById('pretextCanvas')
const ctx = canvas.getContext('2d')
let animationId = null
let particles = []

const KEYWORDS = [
  'Embodied AI', 'Agentic System', 'Video Reasoning',
  'Temporal Grounding', 'Preference Optimization', 'Multi-View Learning',
  'Zero-Shot Learning', 'Evidential Deep Learning', 'Robustness',
  'AAAI', 'ICML', 'NeurIPS', 'ACM MM', 'Gaussian Splatting',
  'Spatial Reasoning', 'Robot', 'Computer Vision', 'Deep Learning'
]

class TextParticle {
  constructor(w, h) {
    this.text = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)]
    this.fontSize = 11 + Math.random() * 14
    this.font = `${this.fontSize}px Inter`
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * 0.25
    this.vy = -0.12 - Math.random() * 0.2
    this.opacity = 0.04 + Math.random() * 0.18
    this.w = w
    this.h = h
    try {
      const p = prepare(this.text, this.font)
      this.mh = layout(p, w, this.fontSize * 1.4).height
    } catch { this.mh = this.fontSize * 1.4 }
  }
  update() {
    this.x += this.vx
    this.y += this.vy
    if (this.y < -this.mh - 10) { this.y = this.h + 10; this.x = Math.random() * this.w }
    if (this.x < -150) this.x = this.w + 40
    if (this.x > this.w + 150) this.x = -40
  }
  draw(c) {
    c.save()
    c.globalAlpha = this.opacity
    c.font = this.font
    c.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
    c.fillText(this.text, this.x, this.y)
    c.restore()
  }
}

function initCanvas() {
  const dpr = window.devicePixelRatio || 1
  const r = canvas.parentElement.getBoundingClientRect()
  canvas.width = r.width * dpr
  canvas.height = r.height * dpr
  canvas.style.width = r.width + 'px'
  canvas.style.height = r.height + 'px'
  ctx.scale(dpr, dpr)
  particles = []
  const n = Math.min(Math.floor((r.width * r.height) / 28000), 35)
  for (let i = 0; i < n; i++) particles.push(new TextParticle(r.width, r.height))
}

function animate() {
  const r = canvas.parentElement.getBoundingClientRect()
  ctx.clearRect(0, 0, r.width, r.height)
  for (const p of particles) { p.update(); p.draw(ctx) }
  animationId = requestAnimationFrame(animate)
}

function startCanvas() {
  if (animationId) cancelAnimationFrame(animationId)
  initCanvas()
  animate()
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
if (!reducedMotion.matches) {
  startCanvas()
  let rt
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(startCanvas, 200) })
}

// ============================================================
// Theme Toggle
// ============================================================

const themeToggle = document.getElementById('themeToggle')
const root = document.documentElement

function setTheme(t) {
  root.setAttribute('data-theme', t)
  localStorage.setItem('theme', t)
  if (!reducedMotion.matches) setTimeout(startCanvas, 80)
}

const saved = localStorage.getItem('theme')
if (saved) setTheme(saved)
else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark')

themeToggle.addEventListener('click', () => {
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')
})

// ============================================================
// Mobile Nav
// ============================================================

const hamburger = document.getElementById('navHamburger')
const navLinks = document.querySelector('.nav-links')
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'))
document.querySelectorAll('.nav-links a').forEach(l =>
  l.addEventListener('click', () => navLinks.classList.remove('open'))
)

// ============================================================
// Scroll Reveal – staggered per batch (news + pub cards)
// ============================================================

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 50)
        io.unobserve(e.target)
      }
    })
  },
  { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
)
document.querySelectorAll('.news-item, .pub-card').forEach(el => io.observe(el))

// ============================================================
// Scroll Reveal – text & card elements with pretext-style blur
// ============================================================

const textObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        const delay = i * 80
        setTimeout(() => e.target.classList.add('revealed'), delay)
        textObserver.unobserve(e.target)
      }
    })
  },
  { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
)
document.querySelectorAll('.reveal-text, .about-card, .contact-card').forEach(el => textObserver.observe(el))

// ============================================================
// Publication Card Click → Open Paper URL
// ============================================================

document.querySelectorAll('.pub-card[data-url]').forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.pub-link')) return
    window.open(card.dataset.url, '_blank')
  })
})

// ============================================================
// Publication Filtering
// ============================================================

const filters = document.querySelectorAll('.pub-filter')
const cards = document.querySelectorAll('.pub-card')

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'))
    btn.classList.add('active')
    const f = btn.dataset.filter
    cards.forEach(c => {
      if (f === 'all' || c.dataset.type === f) {
        c.classList.remove('hidden')
        requestAnimationFrame(() => c.classList.add('visible'))
      } else {
        c.classList.add('hidden')
        c.classList.remove('visible')
      }
    })
  })
})
