import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="btn-primary-action">
        Back to Home
      </Link>
    </div>
  )
}
