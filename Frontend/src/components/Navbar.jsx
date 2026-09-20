import { NavLink, Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="site-navbar">
      {/* Brand */}
      <Link to="/" className="nav-brand">
        <div className="brand-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
        </div>
        <span>Spotify Rego</span>
      </Link>

      {/* Navigation Links */}
      <nav className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-link-item ${isActive ? 'active' : ''}`
          }
        >
          Home
        </NavLink>
      </nav>

      {/* Action Buttons */}
      <div className="nav-auth-buttons">
        <Link to="/login" className="btn-nav-login">
          Log In
        </Link>
        <Link to="/register" className="btn-nav-signup">
          Sign Up
        </Link>
      </div>
    </header>
  )
}
