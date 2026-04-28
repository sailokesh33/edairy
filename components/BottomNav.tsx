'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/',            label: 'Dashboard', icon: '▦' },
  { href: '/log',         label: 'Log',       icon: '+' },
  { href: '/history',     label: 'History',   icon: '≡' },
  { href: '/medications', label: 'Meds',      icon: '⬡' },
  { href: '/report',      label: 'Report',    icon: '↗' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto flex">
        {links.map(link => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 text-xs transition-colors ${
                active ? 'text-violet-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-lg leading-none">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}