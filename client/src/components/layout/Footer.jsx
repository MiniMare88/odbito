import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const LEGAL_LINKS = [
  { to: '/izjava',        label: 'Izjava o odgovornosti' },
  { to: '/zasebnost',     label: 'Politika zasebnosti' },
  { to: '/piskotki',      label: 'Politika piškotkov' },
  { to: '/nagradne-igre', label: 'Pogoji nagradnih iger' },
  { to: '/pogoji-uporabe', label: 'Pogoji uporabe' },
  { to: '/videonadzor',   label: 'Obvestilo o videonadzoru' },
]

const NAV_LINKS = [
  { to: '/rezervacija', label: 'Rezervacija' },
  { to: '/cenik',       label: 'Cenik' },
  { to: '/vadbe',       label: 'Vadbe' },
  { to: '/o-nas',       label: 'O nas' },
  { to: '/kontakt',     label: 'Kontakt' },
]

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer style={{ background: 'var(--dark)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-6 py-14">

        {/* Top grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="font-display text-3xl leading-none mb-3" style={{ color: 'var(--accent)' }}>
              ODBITO<span style={{ color: 'var(--white)' }}>.</span>
            </div>
            <p className="font-condensed text-sm leading-relaxed mb-4" style={{ color: 'var(--gray)' }}>
              Gibalni center na Dolgem mostu v Ljubljani. Trampolini, akrobatika, fun park.
            </p>
            <div className="flex flex-col gap-1">
              <span className="font-condensed text-xs" style={{ color: 'var(--gray)' }}>
                Videm 9b, 1262 Dol pri Ljubljani
              </span>
              <a href="tel:+38640566926"
                className="font-condensed text-xs transition-colors"
                style={{ color: 'var(--gray)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gray)'}>
                040 566 926
              </a>
              <a href="mailto:info@odbito.si"
                className="font-condensed text-xs transition-colors"
                style={{ color: 'var(--gray)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--gray)'}>
                info@odbito.si
              </a>
            </div>
          </div>

          {/* Navigacija */}
          <div>
            <div className="font-condensed font-black text-xs uppercase tracking-widest mb-4"
              style={{ color: 'var(--white)' }}>
              Navigacija
            </div>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map(l => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="font-condensed text-sm transition-colors"
                    style={{ color: 'var(--gray)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--gray)'}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pravni dokumenti */}
          <div className="lg:col-span-2">
            <div className="font-condensed font-black text-xs uppercase tracking-widest mb-4"
              style={{ color: 'var(--white)' }}>
              Pravni dokumenti
            </div>
            <ul className="flex flex-col gap-2">
              {LEGAL_LINKS.map(l => (
                <li key={l.to}>
                  <Link to={l.to}
                    className="font-condensed text-sm transition-colors"
                    style={{ color: 'var(--gray)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--gray)'}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid var(--border)' }}>
          <p className="font-condensed text-xs" style={{ color: 'rgba(245,245,240,0.25)' }}>
            © {year} Odbito 360 d.o.o. · Vse pravice pridržane.
          </p>

          {/* Socialna omrežja */}
          <div className="flex items-center gap-2">
            {[
              { name: 'Instagram', href: 'https://instagram.com/odbito', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
              { name: 'TikTok',    href: 'https://tiktok.com/@odbito',   svg: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg> },
              { name: 'Snapchat',  href: 'https://snapchat.com/add/odbito', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.017 0C8.396 0 5.42 2.553 5.42 6.402c0 .368.026.733.08 1.09-.299.064-.61.1-.92.1-.43 0-.855-.06-1.264-.18l-.037-.01c-.09-.027-.178-.04-.264-.04-.31 0-.55.19-.55.467 0 .33.246.536.604.65.045.013 1.133.303 1.405 1.27.02.07.03.14.03.21 0 .36-.23.72-.69 1.07-1.02.775-1.54 1.47-1.54 2.065 0 .524.37.965 1.04 1.245.12.05.25.09.39.125.48.115.76.27.88.465.09.148.09.31.01.53-.16.44-.52.754-.99.754-.16 0-.33-.034-.5-.102-.31-.12-.63-.185-.95-.185-.34 0-.64.073-.88.22-.36.214-.54.543-.54.975 0 .04.003.08.007.12C1.735 17.84 4.31 19.5 7.5 20.44c.11.032.2.11.24.216.075.196.03.44-.13.66-.25.34-.37.626-.37.876 0 .39.27.705.81.938.415.18.9.27 1.44.27.35 0 .7-.038 1.04-.112.34-.075.67-.113 1-.113.33 0 .66.038 1 .113.34.074.69.112 1.04.112.54 0 1.025-.09 1.44-.27.54-.233.81-.548.81-.938 0-.25-.12-.536-.37-.876-.16-.22-.205-.464-.13-.66.04-.106.13-.184.24-.216 3.19-.94 5.765-2.6 5.765-5.91.004-.04.007-.08.007-.12 0-.432-.18-.761-.54-.975-.24-.147-.54-.22-.88-.22-.32 0-.64.065-.95.185-.17.068-.34.102-.5.102-.47 0-.83-.314-.99-.754-.08-.22-.08-.382.01-.53.12-.195.4-.35.88-.465.14-.035.27-.075.39-.125.67-.28 1.04-.721 1.04-1.245 0-.595-.52-1.29-1.54-2.065-.46-.35-.69-.71-.69-1.07 0-.07.01-.14.03-.21.272-.967 1.36-1.257 1.405-1.27.358-.114.604-.32.604-.65 0-.277-.24-.467-.55-.467-.086 0-.174.013-.264.04l-.037.01c-.409.12-.834.18-1.264.18-.31 0-.621-.036-.92-.1.054-.357.08-.722.08-1.09C18.597 2.553 15.638 0 12.017 0z"/></svg> },
              { name: 'YouTube',   href: 'https://youtube.com/@odbito',  svg: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
              { name: 'LinkedIn',  href: 'https://linkedin.com/company/odbito', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
            ].map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" title={s.name}
                className="flex items-center justify-center rounded-lg"
                style={{ width: 34, height: 34, color: 'rgba(245,245,240,0.3)', background: 'rgba(255,255,255,0.04)', transition: 'all 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(250,177,32,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,245,240,0.3)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              >
                {s.svg}
              </a>
            ))}
          </div>

          <p className="font-condensed text-xs" style={{ color: 'rgba(245,245,240,0.2)' }}>
            {t('common.powered_by')}
          </p>
        </div>

      </div>
    </footer>
  )
}
