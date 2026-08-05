import { useState } from 'react'
import { navLinks } from './data/nav'
import { heroTitle, heroSubtitle, heroCta, stats } from './data/hero'
import { featuresTitle, features } from './data/features'
import { stepsTitle, steps } from './data/steps'
import { footerBrand, footerTagline, footerLinks, footerContact, footerCopyright, ctaFinal, trustSection } from './data/footer'
import {
  FiSmartphone, FiZap, FiUsers, FiBarChart2, FiGrid,
  FiStar, FiDollarSign, FiMapPin, FiArrowRight, FiExternalLink,
  FiHeart, FiTool, FiMenu, FiX, FiMessageCircle
} from 'react-icons/fi'

const iconMap = {
  smartphone: FiSmartphone,
  zap: FiZap,
  users: FiUsers,
  chart: FiBarChart2,
  grid: FiGrid,
  star: FiStar,
  dollar: FiDollarSign,
  handshake: FiUsers,
  heart: FiHeart,
  tool: FiTool,
}

function Icon({ name, className }) {
  const IconComponent = iconMap[name]
  return IconComponent ? <IconComponent className={className} /> : null
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white font-bold text-lg">Q</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">QRTa</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href={footerContact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-all hover:bg-green-100 sm:flex"
            >
              <FiMessageCircle className="h-4 w-4" />
              WhatsApp
            </a>

            <button className="rounded-full bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-orange-600/30 hover:-translate-y-0.5 sm:px-5" onClick={() => window.location.href = '/login'}>
              Iniciar sesión
            </button>

            {/* Hamburger button */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <FiX className="h-5 w-5" />
              ) : (
                <FiMenu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-gray-100 bg-white md:hidden">
            <div className="flex flex-col px-4 py-3">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-orange-600" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
              <a
                href={footerContact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-green-50 px-3 py-3 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
              >
                <FiMessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-12 sm:pt-32 sm:pb-20 md:pt-48 md:pb-32">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="/media/hero.mp4"
        ></video>
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center sm:gap-8 sm:px-6">
          <div className="flex items-center gap-2 text-orange-300/90">
            <FiMapPin className="h-4 w-4" />
            <span className="text-sm font-medium">Chitagá, Norte de Santander</span>
          </div>

          <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-7xl">
            {heroTitle.line1}
            <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent"> {heroTitle.highlight}</span>
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg md:text-xl">
            {heroSubtitle}
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:gap-4 sm:pt-4">
            <button className="group rounded-full bg-orange-600 px-6 py-3.5 font-semibold text-white shadow-xl shadow-orange-600/25 transition-all hover:bg-orange-700 hover:shadow-orange-600/40 hover:-translate-y-0.5 sm:px-8" onClick={() => window.location.href = heroCta.primary.href}>
              {heroCta.primary.label}
              <FiArrowRight className="ml-2 inline-block h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <a href={heroCta.secondary.href} className="rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-center font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/20 hover:-translate-y-0.5 sm:px-8">
              {heroCta.secondary.label}
            </a>
          </div>

          {/* Stats */}
          <div className="mt-8 grid w-full grid-cols-1 gap-6 border-t border-white/20 pt-8 sm:mt-12 sm:grid-cols-3 sm:gap-8 sm:pt-10">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative bg-gray-50/50 px-4 py-16 sm:px-6 sm:py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600">{featuresTitle.tag}</h2>
            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
              {featuresTitle.heading}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={i} className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-lg hover:shadow-orange-100/50 hover:-translate-y-1 sm:p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-100">
                  <Icon name={f.icon} className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 md:px-12">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-600">{stepsTitle.tag}</h2>
          <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">{stepsTitle.heading}</p>
        </div>

        <div className="relative grid gap-10 sm:gap-12 md:grid-cols-4">
          <div className="absolute top-6 left-0 hidden h-0.5 w-full bg-gradient-to-r from-orange-200 via-orange-400 to-orange-600 md:block"></div>

          {steps.map((s, i) => (
            <div key={i} className="relative cursor-pointer text-center transition-transform duration-200 hover:-translate-y-1">
              <div className="relative z-10 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-bold text-orange-600 shadow-lg ring-4 ring-orange-50">
                {s.num}
              </div>
              <h3 className="mb-2 text-base font-semibold text-gray-900 sm:text-lg">{s.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Section - Chitagá Tech */}
      <section className="bg-orange-50 px-4 py-16 sm:px-6 sm:py-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-orange-700">{trustSection.tag}</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
              {trustSection.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 sm:text-lg">
              {trustSection.description}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {trustSection.values.map((v, i) => (
              <div key={i} className="cursor-pointer rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-orange-100 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-100/50">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <Icon name={v.icon} className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{v.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href={trustSection.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-6 py-3 text-sm font-semibold text-orange-700 shadow-sm transition-all hover:bg-orange-50 hover:shadow-md"
            >
              {trustSection.cta.label}
              <FiExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-orange-600 px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-orange-500 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-amber-500 opacity-30 blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-5xl">
            {ctaFinal.heading}
          </h2>
          <p className="mb-8 text-base text-orange-100 sm:mb-10 sm:text-lg">
            {ctaFinal.subtitle}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button className="rounded-full bg-white px-8 py-4 text-base font-semibold text-orange-600 shadow-2xl shadow-orange-900/20 transition-all hover:bg-orange-50 hover:scale-105 sm:px-10 sm:text-lg">
              {ctaFinal.cta}
            </button>
            <a
              href={footerContact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:text-lg"
            >
              <FiMessageCircle className="h-5 w-5" />
              Escribir por WhatsApp
            </a>
          </div>
          <p className="mt-4 text-sm text-orange-200">{ctaFinal.disclaimer}</p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="border-t border-gray-100 bg-gray-50 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-white font-bold">Q</div>
                <span className="text-lg font-bold text-gray-900 sm:text-xl">{footerBrand}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">{footerTagline}</p>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              {footerLinks.map((link) => (
                <a key={link.label} href={link.href} className="min-h-[44px] min-w-[44px] py-2 text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">
                  {link.label}
                </a>
              ))}
              <a
                href={footerContact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 min-h-[44px] py-2 text-sm font-medium text-green-600 transition-colors hover:text-green-700"
              >
                <FiMessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>

            <p className="text-sm text-gray-400">{footerCopyright}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App