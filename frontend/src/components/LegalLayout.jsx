export function LegalLayout({ title, updated, intro, sections }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-accent-50 dark:from-gray-900 dark:to-gray-950">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <a href="/" className="flex items-center gap-2" title="Ir al inicio de QRTa">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-bold text-lg text-white">Q</div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-2xl">QRTa</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/" className="text-sm font-medium text-gray-500 transition-colors hover:text-brand-600 dark:text-gray-400" title="Volver a la página principal">
              Volver al inicio
            </a>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <article className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 sm:p-10">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{updated}</p>
          <p className="mt-6 text-base leading-relaxed text-gray-600 dark:text-gray-400">{intro}</p>

          {sections.map((section) => (
            <section key={section.title} className="mt-8">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{section.title}</h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
