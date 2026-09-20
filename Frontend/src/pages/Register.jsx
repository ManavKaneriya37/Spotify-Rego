import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'User',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/auth/register`, {
        email: formData.email,
        fullname: {
          firstName: formData.username.split(' ')[0],
          lastName: formData.username.split(' ')[1],
        },
        password: formData.password,
        role: formData.userType.toLowerCase(),
      }, {
        withCredentials: true
      });

      if (response.status == 201) {
        navigate('/')
      }
    } catch (error) {
      console.log(error)
      setError(error.response.data.message)
    }

  }

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <div className="auth-card-header">
          <h1>Create an Account</h1>
          <p>Sign up to start listening to your favorite music.</p>
        </div>

        {error && <div className="alert-message">{error}</div>}

        <div className="form-field" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">I want to register as</label>
          <div className="radio-group">
            <label className={`radio-card ${formData.userType === 'User' ? 'active' : ''}`}>
              <input
                type="radio"
                name="userType"
                value="User"
                checked={formData.userType === 'User'}
                onChange={handleChange}
              />
              <span>User</span>
            </label>
            <label className={`radio-card ${formData.userType === 'Artist' ? 'active' : ''}`}>
              <input
                type="radio"
                name="userType"
                value="Artist"
                checked={formData.userType === 'Artist'}
                onChange={handleChange}
              />
              <span>Artist</span>
            </label>
          </div>
        </div>

        <button
          type="button"
          className="btn-google"
          onClick={() => window.location.href = `${import.meta.env.VITE_SERVER_URL}/api/auth/google?role=${formData.userType.toLowerCase()}`}
        >
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-body">

          <div className="form-field">
            <label htmlFor="username" className="form-label">
              Full Name
            </label>
            <div className="input-container">
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="form-text-input"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className="input-container">
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="form-text-input"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                className="form-text-input"
                minLength={6}
                required
              />
              <button
                type="button"
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="input-container">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className="form-text-input"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-submit-form">
            Create Account
          </button>
        </form>

        <div className="auth-card-footer">
          Already have an account?
          <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  )
}
