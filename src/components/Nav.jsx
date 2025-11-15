import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/admin/certificates', label: 'Certificates' },
  { href: '/admin/issue-certificate', label: 'Issue' },
  { href: '/recruiter', label: 'Recruiter' },
  { href: '/interviewer', label: 'Interviewer' },

]

const Nav = () => {
  const location = useLocation()

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="text-xl font-semibold text-slate-800">Miners, Not Minors</div>
      <div className="flex gap-4 text-sm text-slate-700">
        {navLinks.map((link) => {
          const isActive =
            location.pathname === link.href ||
            (link.href !== '/' && location.pathname.startsWith(link.href))

          return (
            <Link
              key={link.href}
              to={link.href}
              className={`px-2 py-1 rounded transition-colors ${
                isActive
                  ? 'text-slate-900 bg-slate-100 border border-slate-200'
                  : 'hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default Nav
