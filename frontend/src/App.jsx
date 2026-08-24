import { useEffect, useState } from 'react'
import { motion, MotionConfig } from 'motion/react'
import { navLinks } from './data/nav'
import { heroTitle, heroSubtitle, heroCta, stats } from './data/hero'
import { featuresTitle, features } from './data/features'
import { stepsTitle, steps } from './data/steps'
import { footerBrand, footerTagline, footerLinks, footerContact, footerSocial, footerCopyright, ctaFinal, trustSection } from './data/footer'
import { preciosTitle, planes, preciosNota } from './data/precios'
import { testimoniosTitle, testimonios } from './data/testimonios'
import { faqTitle, faq } from './data/faq'
import {
  FiSmartphone, FiZap, FiUsers, FiBarChart2, FiGrid,
  FiStar, FiDollarSign, FiMapPin, FiArrowRight, FiExternalLink,
  FiHeart, FiTool, FiMenu, FiX, FiCheck, FiChevronDown, FiUser, FiSettings
} from 'react-icons/fi'
import { useAuth } from './auth'
import {
  FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok, FaYoutube
} from 'react-icons/fa6'
import { Card } from './components/ui/Card'

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

const socialIconMap = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  youtube: FaYoutube,
}

const heroContainerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const heroItemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

function Icon({ name, className }) {
  const IconComponent = iconMap[name]
  return IconComponent ? <IconComponent className={className} /> : null
}

function FaqItem({ item }) {
  const [open, setOpen] = useState(false)
  const slug = item.pregunta.replace(/\s+/g, '-').toLowerCase()
  const panelId = `faq-panel-${slug}`
  const buttonId = `faq-button-${slug}`

  return (
    <div
      className={`rounded-2xl bg-white ring-1 shadow-card transition-all duration-200 dark:bg-gray-900 ${
        open ? 'ring-brand-200 shadow-card-hover dark:ring-brand-500/50' : 'ring-gray-100 dark:ring-gray-800 hover:ring-brand-100 dark:hover:ring-brand-500/30'
      }`}
    >
      <button
        type="button"
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        title={open ? 'Ocultar respuesta' : 'Ver respuesta'}
        className="flex min-h-14 w-full items-center gap-4 rounded-2xl px-5 py-4 text-left sm:px-6"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-200 ${
            open ? 'bg-brand-600 text-white' : 'bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-400'
          }`}
          aria-hidden="true"
        >
          ?
        </span>
        <span className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100 sm:text-base">{item.pregunta}</span>
        <FiChevronDown
          className={`h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:px-6 sm:pl-[3.75rem] sm:text-base">
            {item.respuesta}
          </p>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-white font-sans antialiased dark:bg-gray-950">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white/80 backdrop-blur-md dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-lg">Q</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">QRTa</span>
          </div>

          {/* Desktop nav — reemplazado por el menú hamburguesa en todos los tamaños */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              {user ? (
                <button
                  title="Ir a tu panel de administración"
                  className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-brand-600/30 hover:-translate-y-0.5 sm:px-5"
                  onClick={() => (window.location.href = '/dashboard')}
                >
                  Mi panel
                </button>
              ) : (
                <button
                  title="Accede a tu panel de administración"
                  className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-brand-600/30 hover:-translate-y-0.5 sm:px-5"
                  onClick={() => (window.location.href = '/login')}
                >
                  Iniciar sesión
                </button>
              )}
            </div>

            <a
              href={footerContact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              title="Chatea con nosotros por WhatsApp"
              className="flex items-center gap-2 rounded-full border border-success-200 bg-success-50 px-3 py-2 text-sm font-medium text-success-700 transition-all hover:bg-success-100 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400 dark:hover:bg-success-500/20 sm:px-4"
            >
              <FaWhatsapp className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Hamburger button */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              title={menuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
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

        {/* Menú hamburguesa — drawer lateral en todos los tamaños */}
        {menuOpen && (
          <div className="absolute top-[4.5rem] right-0 h-[calc(100vh-4.5rem)] w-72 max-w-[85vw] overflow-y-auto rounded-l-2xl border-t-0 border-l border-gray-100 bg-white shadow-2xl shadow-gray-900/20 animate-[slide-in-right_0.25s_ease-out] dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col px-5 py-6">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} title={link.desc} className="rounded-lg px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 hover:text-brand-600 dark:hover:bg-gray-800 dark:hover:text-brand-400" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}

              {/* Configuración — visible para todos; sin sesión solo muestra apariencia */}
              <a
                href="/dashboard/perfil?tab=config"
                className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                onClick={() => setMenuOpen(false)}
              >
                <FiSettings className="h-5 w-5" />
                Configuración
              </a>

              {/* Mi perfil — solo si hay sesión iniciada */}
              {user && (
                <a
                  href="/dashboard/perfil"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                  onClick={() => setMenuOpen(false)}
                >
                  <FiUser className="h-5 w-5" />
                  Mi perfil
                </a>
              )}

              {!user && (
                <button
                  title="Accede a tu panel de administración"
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-colors hover:bg-brand-700"
                  onClick={() => {
                    setMenuOpen(false)
                    window.location.href = '/login'
                  }}
                >
                  Iniciar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {menuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40"
        />
      )}

      {/* Hero */}
<section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white px-4 pt-32 pb-20 dark:from-brand-950/60 dark:via-gray-950 dark:to-gray-950 lg:pt-36 lg:pb-24 nest:flex nest:min-h-[90vh] nest:flex-col nest:justify-center nest:pt-20 nest:pb-8 small:pt-24 small:pb-16 min-[390px]:pt-32 min-[390px]:pb-20 tablet:pt-36 tablet:pb-20">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl dark:bg-brand-500/15"></div>
        <MotionConfig reducedMotion="user">
          <motion.div
            className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14 nest:gap-6 small:gap-10 tablet:gap-12"
            initial="hidden"
            animate="show"
            variants={heroContainerVariants}
          >
            <motion.div className="flex w-full flex-col items-center text-center lg:col-start-1 lg:row-start-1 lg:items-start lg:text-left" variants={heroItemVariants}>
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
                <FiMapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Chitagá, Norte de Santander</span>
              </div>

              <h1 className="mt-6 max-w-2xl text-4xl leading-[1.1] font-extrabold tracking-tight text-gray-900 dark:text-gray-100 lg:text-6xl nest:mt-3 nest:text-4xl small:mt-5 small:text-3xl tablet:mt-5 tablet:text-5xl">
                {heroTitle.line1}
                <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent dark:from-brand-400 dark:to-accent-400"> {heroTitle.highlight}</span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400 lg:mt-5 lg:text-lg nest:mt-3 nest:text-sm small:mt-5 small:text-sm tablet:mt-5 tablet:text-lg">
                {heroSubtitle}
              </p>
            </motion.div>

            <motion.div className="w-full max-w-md lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:max-w-none lg:self-center nest:max-w-[22rem] nest:self-center small:max-w-64 min-[390px]:max-w-80" variants={heroItemVariants}>
              <img
                src="/chef-hero.png"
                alt="Chef atendiendo con el menú digital QRTa"
                className="w-full rounded-3xl object-cover shadow-2xl shadow-brand-600/15 ring-1 ring-brand-100 dark:ring-brand-500/30"
              />
            </motion.div>

            <motion.div className="flex w-full flex-col items-center text-center lg:col-start-1 lg:row-start-2 lg:items-start lg:text-left" variants={heroItemVariants}>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 small:gap-5 tablet:flex-row tablet:gap-4">
                <button className="group rounded-full bg-brand-600 px-7 py-3.5 font-semibold text-white shadow-xl shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-brand-600/40 hover:-translate-y-0.5 small:w-full" onClick={() => window.location.href = heroCta.primary.href} title="Crea tu cuenta y prueba QRTa gratis">
                  {heroCta.primary.label}
                  <FiArrowRight className="ml-2 inline-block h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <a href={heroCta.secondary.href} title="Aprende cómo funciona QRTa" className="rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-7 py-3.5 text-center font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-600 hover:text-white dark:hover:border-brand-600 dark:hover:bg-brand-600 dark:hover:text-white small:w-full">
                  {heroCta.secondary.label}
                </a>
              </div>

              {/* Stats */}
              <div className="mt-12 grid w-full grid-cols-1 gap-6 border-t border-gray-100 dark:border-gray-800 pt-10 lg:grid-cols-3 lg:gap-8 nest:mt-6 nest:pt-4 small:mt-10 small:pt-8 min-[390px]:grid-cols-3 min-[390px]:gap-4 tablet:grid-cols-3 tablet:gap-8">
                {stats.map((stat, i) => (
                  <motion.div key={i} className="text-center" variants={heroItemVariants}>
                    <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 nest:text-2xl small:text-2xl">{stat.value}</div>
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </MotionConfig>
      </section>

      {/* Features */}
      <section id="features" className="relative bg-brand-50/50 dark:bg-gray-900/50 px-5 py-20 sm:px-6 sm:py-24 md:px-12 nest:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center sm:mb-16 nest:mb-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">{featuresTitle.tag}</h2>
            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl md:text-4xl">
              {featuresTitle.heading}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 tablet:grid-cols-2 tablet:gap-6">
            {features.map((f, i) => (
              <Card key={i} hover className="group cursor-pointer p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-all duration-200 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-500/10 dark:text-brand-400 dark:group-hover:bg-brand-600 dark:group-hover:text-white">
                  <Icon name={f.icon} className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">{f.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-24 md:px-12 nest:py-16">
        <div className="mb-14 text-center sm:mb-16 nest:mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">{stepsTitle.tag}</h2>
          <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl md:text-4xl">{stepsTitle.heading}</p>
        </div>

        <div className="relative grid gap-12 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
          <div className="absolute top-6 left-0 hidden h-0.5 w-full bg-gradient-to-r from-brand-200 via-brand-400 to-brand-600 dark:from-brand-800 dark:via-brand-500 dark:to-brand-400 lg:block"></div>

          {steps.map((s, i) => (
            <div key={i} className="relative cursor-pointer text-center transition-transform duration-200 hover:-translate-y-1">
              <div className="relative z-10 mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-bold text-brand-600 dark:bg-gray-900 dark:text-brand-400 shadow-lg ring-4 ring-brand-50 dark:ring-gray-800 transition-all duration-200 hover:ring-brand-200 dark:hover:ring-brand-500/40">
                {s.num}
              </div>
              <h3 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">{s.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="px-5 py-20 sm:px-6 sm:py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center sm:mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">{testimoniosTitle.tag}</h2>
            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl md:text-4xl">
              {testimoniosTitle.heading}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">{testimoniosTitle.subtitle}</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 tablet:grid-cols-2 tablet:gap-6">
            {testimonios.map((t, i) => (
              <Card key={i} hover className="flex flex-col p-6">
                <div className="mb-4 flex gap-1 text-accent-500" aria-label="5 de 5 estrellas">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <FiStar key={s} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">"{t.texto}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-sm font-bold text-brand-700 dark:text-brand-400" aria-hidden="true">
                    {t.iniciales}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.nombre}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.rol}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="bg-brand-50/50 dark:bg-gray-900/50 px-5 py-20 sm:px-6 sm:py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center sm:mb-16">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">{preciosTitle.tag}</h2>
            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl md:text-4xl">
              {preciosTitle.heading}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">{preciosTitle.subtitle}</p>
          </div>

          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2 tablet:grid-cols-2">
            {planes.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-6 transition-all duration-200 sm:p-8 ${
                  plan.destacado
                    ? 'bg-brand-600 text-white shadow-xl shadow-brand-600/25 ring-1 ring-brand-700 dark:bg-brand-700 dark:ring-brand-600'
                    : 'bg-white ring-1 ring-gray-100 dark:ring-gray-800 shadow-card hover:-translate-y-1 hover:shadow-card-hover dark:bg-gray-900'
                }`}
              >
                {plan.destacado && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-500 px-4 py-1 text-xs font-bold text-white shadow-md">
                    Más popular
                  </span>
                )}
                <h3 className={`text-lg font-bold ${plan.destacado ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{plan.nombre}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-3xl font-extrabold sm:text-4xl ${plan.destacado ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>{plan.precio}</span>
                  <span className={`text-sm ${plan.destacado ? 'text-brand-100' : 'text-gray-500 dark:text-gray-400'}`}>{plan.periodo}</span>
                </div>
                <p className={`mt-3 text-sm leading-relaxed ${plan.destacado ? 'text-brand-100' : 'text-gray-500 dark:text-gray-400'}`}>{plan.descripcion}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.caracteristicas.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <FiCheck className={`mt-0.5 h-4 w-4 shrink-0 ${plan.destacado ? 'text-accent-300' : 'text-brand-600 dark:text-brand-400'}`} />
                      <span className={plan.destacado ? 'text-brand-50' : 'text-gray-600 dark:text-gray-400'}>{c}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-8 min-h-12 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                    plan.destacado
                      ? 'bg-white text-brand-700 shadow-lg hover:bg-brand-50 dark:bg-gray-900 dark:text-brand-300 dark:hover:bg-brand-500 dark:hover:text-white'
                      : 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700 dark:bg-gray-800 dark:text-brand-400 dark:hover:bg-brand-600 dark:hover:text-white'
                  }`}
                  onClick={() => (window.location.href = '/registro')}
                  title={`Elegir el plan ${plan.nombre}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-gray-100">{preciosNota.titulo}</span> {preciosNota.texto}
            </p>
            <a
              href={footerContact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              title="Escríbenos por WhatsApp para elegir plan"
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-success-200 bg-success-50 px-6 py-3 text-sm font-semibold text-success-700 transition-colors hover:bg-success-100 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400 dark:hover:bg-success-500/20"
            >
              <FaWhatsapp className="h-4 w-4" />
              Hablar con nosotros
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative overflow-hidden bg-brand-50/50 dark:bg-gray-900/50 px-5 py-20 sm:px-6 sm:py-24 md:px-12">
        <div className="absolute -top-32 -right-16 h-80 w-80 rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-500/15" aria-hidden="true"></div>
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent-100/60 blur-3xl dark:bg-accent-500/15" aria-hidden="true"></div>

        <div className="relative mx-auto max-w-3xl">
          <div className="mb-14 text-center sm:mb-14">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">{faqTitle.tag}</h2>
            <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl md:text-4xl">
              {faqTitle.heading}
            </p>
            <p className="mx-auto mt-4 max-w-xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">{faqTitle.subtitle}</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faq.map((item, i) => (
              <FaqItem key={i} item={item} />
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-center shadow-lg shadow-brand-600/20 dark:from-brand-700 dark:to-brand-600 sm:p-8">
            <p className="text-base font-bold text-white sm:text-lg">¿Sigues con dudas?</p>
            <p className="mt-1 text-sm text-brand-100">Cuéntanos tu caso y te ayudamos a decidir si QRTa es para ti.</p>
            <a
              href={footerContact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              title="Escríbenos por WhatsApp"
              className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 shadow-md transition-all hover:bg-brand-50 dark:bg-gray-900 dark:text-brand-300 dark:hover:bg-brand-600 dark:hover:text-white"
            >
              <FaWhatsapp className="h-4 w-4" />
              Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="relative overflow-hidden bg-brand-600 px-4 py-16 text-center sm:px-6 sm:py-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-brand-50 dark:bg-brand-500/100 opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-accent-500 opacity-30 blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-3xl">
          <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl md:text-5xl">
            {ctaFinal.heading}
          </h2>
          <p className="mb-8 text-base text-brand-100 sm:mb-10 sm:text-lg">
            {ctaFinal.subtitle}
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button className="rounded-full bg-white px-8 py-4 text-base font-semibold text-brand-600 shadow-2xl shadow-brand-900/20 transition-all hover:bg-brand-50 hover:scale-105 dark:bg-gray-900 dark:text-brand-400 dark:hover:bg-brand-500 dark:hover:text-white sm:px-10 sm:text-lg" title="Crea tu cuenta y prueba QRTa gratis">
              {ctaFinal.cta}
            </button>
            <a
              href={footerContact.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              title="Contacta con nosotros por WhatsApp"
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 sm:text-lg"
            >
              <FaWhatsapp className="h-5 w-5" />
              Escribir por WhatsApp
            </a>
          </div>
          <p className="mt-4 text-sm text-brand-200">{ctaFinal.disclaimer}</p>
        </div>
      </section>

      {/* Trust Section - Chitagá Tech */}
      <section className="relative overflow-hidden bg-brand-50 dark:bg-brand-950/60 px-5 py-20 sm:px-6 sm:py-20 md:px-12">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-white/50 blur-3xl dark:bg-brand-600/10"></div>
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <span className="inline-block rounded-full bg-brand-100 dark:bg-brand-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">{trustSection.tag}</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl md:text-4xl">
              {trustSection.heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:text-lg">
              {trustSection.description}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 tablet:grid-cols-3">
            {trustSection.values.map((v, i) => (
              <div key={i} className="cursor-pointer rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-brand-100 dark:bg-gray-900 dark:ring-brand-500/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-100/50 dark:hover:ring-brand-500/40">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400">
                  <Icon name={v.icon} className="h-7 w-7" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">{v.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a
              href={trustSection.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              title="Conoce el proyecto de Chitagá Tech"
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-600 hover:bg-brand-600 hover:text-white hover:shadow-md dark:border-brand-500/30 dark:bg-gray-900 dark:text-brand-400 dark:hover:border-brand-600 dark:hover:bg-brand-600 dark:hover:text-white"
            >
              {trustSection.cta.label}
              <FiExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold">Q</div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100 sm:text-xl">{footerBrand}</span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{footerTagline}</p>
              <div className="mt-4 flex items-center justify-center gap-3 md:justify-start">
                {footerSocial.map((s) => {
                  const SocialIcon = socialIconMap[s.icon]
                  if (!SocialIcon) return null
                  return (
                    <a
                      key={s.icon}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={s.label}
                      aria-label={s.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-500 dark:text-gray-400 shadow-card ring-1 ring-gray-100 dark:ring-gray-800 transition-all duration-200 hover:-translate-y-0.5 hover:text-brand-600 dark:hover:text-brand-400 hover:shadow-card-hover dark:bg-gray-800"
                    >
                      <SocialIcon className="h-4 w-4" />
                    </a>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
              {footerLinks.map((link) => (
                <a key={link.label} href={link.href} title={`${link.label} en QRTa`} className="min-h-11 min-w-11 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:text-brand-600 dark:hover:text-brand-400">
                  {link.label}
                </a>
              ))}
              <a
                href={footerContact.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 min-h-11 py-2 text-sm font-medium text-success-600 transition-colors hover:text-success-700"
              >
                <FaWhatsapp className="h-4 w-4" />
                WhatsApp
              </a>
            </div>

            <p className="text-sm text-gray-400 dark:text-gray-500">{footerCopyright}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
