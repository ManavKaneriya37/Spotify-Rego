import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export default function Navbar() {
  const { user, isArtist, logoutUser } = useUser()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logoutUser()
    navigate('/login')
  }

  // Determine display name
  const displayName =
    user?.fullname?.firstName
      ? `${user.fullname.firstName} ${user.fullname.lastName || ''}`.trim()
      : typeof user?.fullname === 'string'
      ? user.fullname
      : user?.username || user?.email?.split('@')[0] || 'User'

  const userInitial = displayName.charAt(0).toUpperCase() || 'U'

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

      {/* Navigation Links: Customize according to role */}
      <nav className="nav-links">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-link-item ${isActive ? 'active' : ''}`
          }
        >
          Home
        </NavLink>

        {/* Dashboard link is ONLY available for Artists */}
        {user && isArtist && (
          <NavLink
            to="/artist/dashboard"
            className={({ isActive }) =>
              `nav-link-item ${isActive ? 'active' : ''}`
            }
          >
            Dashboard
          </NavLink>
        )}
      </nav>

      {/* Action Area: Logged In vs Logged Out */}
      {user ? (
        <div className="nav-user-section">
          <div className="nav-user-chip" title={`Logged in as ${displayName}`}>
            <div className="nav-user-avatar">{userInitial}</div>
            <span className="nav-user-name">{displayName}</span>
            <span
              className={`nav-role-badge ${
                isArtist ? 'badge-artist' : 'badge-user'
              }`}
            >
              {isArtist ? 'Artist' : 'User'}
            </span>
          </div>

          <button
            type="button"
            className="btn-nav-logout"
            onClick={handleLogout}
            title="Log out of your account"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="logout-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span>Log Out</span>
          </button>
        </div>
      ) : (
        <div className="nav-auth-buttons">
          <Link to="/login" className="btn-nav-login">
            Log In
          </Link>
          <Link to="/register" className="btn-nav-signup">
            Sign Up
          </Link>
        </div>
      )}
    </header>
  )
}
