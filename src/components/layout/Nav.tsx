import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTerraceStore } from '@/lib/store';

const NAV_LINKS = [
  { label: 'Season',  href: '#season'  },
  { label: 'Players', href: '#players' },
  { label: 'Clubs',   href: '#clubs'   },
  { label: 'H2H',     href: '#h2h'     },
  { label: 'Legends', href: '#legends' },
  { label: 'Live',    href: '#live'    },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeSkin = useTerraceStore(s => s.activeSkin);
  const isEditorial = activeSkin === 'editorial';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between transition-all duration-500',
        scrolled
          ? isEditorial
            ? 'backdrop-blur-md bg-[rgba(245,242,235,0.9)] border-b border-[var(--editorial-border)]'
            : 'backdrop-blur-md bg-[rgba(10,10,15,0.8)] border-b border-[var(--border)]'
          : 'bg-gradient-to-b from-[rgba(0,0,0,0.32)] to-transparent',
      )}
    >
      {/* Wordmark */}
      <a
        href="#"
        className="text-[var(--accent)] text-lg leading-none"
        style={{ fontFamily: 'var(--font-body)', fontWeight: 800 }}
      >
        Terrace
      </a>

      {/* Desktop links */}
      <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
        {NAV_LINKS.map(({ label, href }) => (
          <li key={href}>
            <a
              href={href}
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                isEditorial
                  ? 'text-[var(--editorial-secondary)] hover:text-[var(--editorial-text)]'
                  : scrolled
                    ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    : 'text-[rgba(10,10,20,0.65)] hover:text-[rgba(10,10,20,0.9)]',
              )}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-[5px] p-2 group"
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span
          className={cn(
            'block w-5 h-[1.5px] transition-all duration-200 origin-center',
            isEditorial ? 'bg-[var(--editorial-text)]' : 'bg-[var(--text-primary)]',
            menuOpen && 'rotate-45 translate-y-[6.5px]',
          )}
        />
        <span
          className={cn(
            'block w-5 h-[1.5px] transition-all duration-200',
            isEditorial ? 'bg-[var(--editorial-text)]' : 'bg-[var(--text-primary)]',
            menuOpen && 'opacity-0',
          )}
        />
        <span
          className={cn(
            'block w-5 h-[1.5px] transition-all duration-200 origin-center',
            isEditorial ? 'bg-[var(--editorial-text)]' : 'bg-[var(--text-primary)]',
            menuOpen && '-rotate-45 -translate-y-[6.5px]',
          )}
        />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[var(--bg-secondary)] border-b border-[var(--border)] py-4 px-6 flex flex-col gap-4 md:hidden">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-[var(--text-primary)] font-medium text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
