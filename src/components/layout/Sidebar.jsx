import { useState } from 'react'
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

export function Sidebar({ onLogout, user }) {
  const businessName = useSettingsStore(s => s.businessName)
  const [collapsed, setCollapsed] = useState(true)

  return (
    <aside
      id="sidebar"
      className={clsx(
        'bg-brand-500 text-white flex flex-col h-full shrink-0 transition-all duration-300',
        collapsed ? 'w-14' : 'w-56'
      )}
    >
      {/* Header */}
      <div className={clsx(
        'border-b border-brand-600 flex items-center',
        collapsed ? 'justify-center py-4 px-0' : 'justify-between px-5 py-5'
      )}>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-xs text-blue-200 mb-0.5">מנהל עסק</p>
            <p className="font-bold text-base leading-tight truncate">
              {businessName || 'העסק שלי'}
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-blue-200 hover:text-white transition-colors text-lg leading-none shrink-0"
          title={collapsed ? 'הרחב תפריט' : 'כווץ תפריט'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
              clsx(
                'flex items-center py-3 text-sm font-medium transition-colors',
                collapsed ? 'justify-center px-0' : 'gap-3 px-5',
                isActive
                  ? 'bg-brand-600 text-white'
                  : 'text-blue-100 hover:bg-brand-600 hover:text-white'
              )
            }
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {!collapsed && item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={clsx(
        'border-t border-brand-600 py-4',
        collapsed ? 'flex justify-center' : 'px-5'
      )}>
        {!collapsed && user && (
          <div className="text-xs text-blue-200 mb-2 truncate">{user.email}</div>
        )}
        <button
          onClick={onLogout}
          title="התנתק"
          className="text-xs text-blue-300 hover:text-white transition-colors"
        >
          {collapsed ? '🚪' : 'התנתק'}
        </button>
      </div>
    </aside>
  )
}
