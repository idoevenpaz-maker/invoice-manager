import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { useSettingsStore } from '../../store/useSettingsStore'

const navItems = [
  { to: '/',          label: 'לוח בקרה',   icon: '📊' },
  { to: '/invoices',  label: 'חשבוניות',    icon: '🧾' },
  { to: '/receipts',  label: 'קבלות',       icon: '📄' },
  { to: '/clients',   label: 'לקוחות',      icon: '👥' },
  { to: '/settings',  label: 'הגדרות',      icon: '⚙️' },
]

export function Sidebar() {
  const businessName = useSettingsStore(s => s.businessName)

  return (
    <aside
      id="sidebar"
      className="w-56 bg-brand-500 text-white flex flex-col h-full shrink-0"
    >
      {/* Logo / business name */}
      <div className="px-5 py-6 border-b border-brand-600">
        <p className="text-xs text-blue-200 mb-0.5">מנהל עסק</p>
        <p className="font-bold text-lg leading-tight truncate">
          {businessName || 'העסק שלי'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-blue-100 hover:bg-brand-600 hover:text-white'
              )
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-brand-600 text-xs text-blue-300">
        v1.0
      </div>
    </aside>
  )
}
