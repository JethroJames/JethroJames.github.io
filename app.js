import { prepare, layout } from 'https://esm.sh/@chenglou/pretext'

// ============================================================
// Pretext Canvas – Decorative text layout visualization
// Uses pretext's text measurement to render flowing academic
// keywords in the hero background as a canvas-based effect.
// ============================================================

const canvas = document.getElementById('pretextCanvas')
const ctx = canvas.getContext('2d')
let animationId = null
let particles = []

const KEYWORDS = [
  'Trusted AI', 'Video Understanding', 'Embodied AI', 'Agentic Systems',
  'Evidential Deep Learning', 'Multi-View Classification', 'Zero-Shot Learning',
  'Temporal Grounding', 'Preference Optimization', 'Facial Expression Recognition',
  'AAAI', 'ICML', 'NeurIPS', 'ACM MM', 'Deep Learning', 'Computer Vision',
  'Dempster-Shafer Theory', 'Uncertainty', 'Robustness', 'Multi-Modal',
  'Video Generation', 'Language Models', 'Gaussian Splatting', 'Data Fusion'
]

class TextParticle {
  constructor(canvasW, canvasH) {
    this.text = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)]
    this.fontSize = 12 + Math.random() * 16
    this.font = `${this.fontSize}px Inter`
    this.x = Math.random() * canvasW
    this.y = Math.random() * canvasH
    this.vx = (Math.random() - 0.5) * 0.3
    this.vy = -0.15 - Math.random() * 0.25
    this.opacity = 0.05 + Math.random() * 0.2
    this.canvasW = canvasW
    this.canvasH = canvasH

    try {
      const prepared = prepare(this.text, this.font)
      const result = layout(prepared, canvasW, this.fontSize * 1.4)
      this.measuredHeight = result.height
    } catch {
      this.measuredHeight = this.fontSize * 1.4
    }
  }

  update() {
    this.x += this.vx
    this.y += this.vy
    if (this.y < -this.measuredHeight - 20) {
      this.y = this.canvasH + 20
      this.x = Math.random() * this.canvasW
    }
    if (this.x < -200) this.x = this.canvasW + 50
    if (this.x > this.canvasW + 200) this.x = -50
  }

  draw(ctx) {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.font = this.font
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--text').trim()
    ctx.fillText(this.text, this.x, this.y)
    ctx.restore()
  }
}

function initCanvas() {
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  ctx.scale(dpr, dpr)

  particles = []
  const count = Math.min(Math.floor((rect.width * rect.height) / 25000), 40)
  for (let i = 0; i < count; i++) {
    particles.push(new TextParticle(rect.width, rect.height))
  }
}

function animate() {
  const rect = canvas.parentElement.getBoundingClientRect()
  ctx.clearRect(0, 0, rect.width, rect.height)
  for (const p of particles) {
    p.update()
    p.draw(ctx)
  }
  animationId = requestAnimationFrame(animate)
}

function startCanvasAnimation() {
  if (animationId) cancelAnimationFrame(animationId)
  initCanvas()
  animate()
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
if (!prefersReducedMotion.matches) {
  startCanvasAnimation()
  let resizeTimer
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(startCanvasAnimation, 200)
  })
}

// ============================================================
// Theme Toggle
// ============================================================

const themeToggle = document.getElementById('themeToggle')
const root = document.documentElement

function setTheme(theme) {
  root.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
  if (!prefersReducedMotion.matches) {
    setTimeout(startCanvasAnimation, 100)
  }
}

const savedTheme = localStorage.getItem('theme')
if (savedTheme) {
  setTheme(savedTheme)
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  setTheme('dark')
}

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme')
  setTheme(current === 'dark' ? 'light' : 'dark')
})

// ============================================================
// Mobile Navigation
// ============================================================

const hamburger = document.getElementById('navHamburger')
const navLinks = document.querySelector('.nav-links')

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open')
})

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'))
})

// ============================================================
// Scroll Reveal Animation
// ============================================================

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60)
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
)

document.querySelectorAll('.news-item, .pub-item').forEach(el => {
  observer.observe(el)
})

// ============================================================
// Publication Filtering
// ============================================================

const filters = document.querySelectorAll('.pub-filter')
const pubItems = document.querySelectorAll('.pub-item')

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(f => f.classList.remove('active'))
    btn.classList.add('active')
    const filter = btn.dataset.filter

    pubItems.forEach(item => {
      if (filter === 'all' || item.dataset.type === filter) {
        item.classList.remove('hidden')
        setTimeout(() => item.classList.add('visible'), 50)
      } else {
        item.classList.add('hidden')
        item.classList.remove('visible')
      }
    })
  })
})

// ============================================================
// Nav background on scroll
// ============================================================

const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20)
}, { passive: true })
