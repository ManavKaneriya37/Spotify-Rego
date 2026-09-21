import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function UploadMusic() {
  const [title, setTitle] = useState('')
  const [musicFile, setMusicFile] = useState(null)
  const [coverImageFile, setCoverImageFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverImageFile(file)
      setCoverPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleMusicChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMusicFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!title.trim()) {
      setError('Please provide a music title.')
      return
    }

    if (!musicFile) {
      setError('Please select an audio file (music).')
      return
    }

    if (!coverImageFile) {
      setError('Please select a cover image file.')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('music', musicFile)
      formData.append('coverImage', coverImageFile)

      const response = await axios.post(
        `${import.meta.env.VITE_MUSIC_SERVER_URL}/api/music/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (response.status === 200 || response.status === 201) {
        setSuccess('Music uploaded successfully! Redirecting...')
        setTimeout(() => {
          navigate('/artist/dashboard')
        }, 1500)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to upload music. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-page-container">
      <div className="upload-card">
        <div className="upload-header">
          <Link to="/artist/dashboard" className="btn-back-link">
            ← Back to Dashboard
          </Link>
          <h1>Upload New Music</h1>
          <p>Add your track with cover artwork and master audio file.</p>
        </div>

        {error && <div className="upload-alert alert-error">{error}</div>}
        {success && <div className="upload-alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Title input */}
          <div className="form-group">
            <label htmlFor="music-title">Track Title</label>
            <input
              id="music-title"
              type="text"
              placeholder="e.g. Midnight Echoes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Cover Image input */}
          <div className="form-group">
            <label htmlFor="cover-image">Cover Artwork (coverImage)</label>
            <div className="cover-upload-area">
              {coverPreview ? (
                <div className="cover-preview-wrapper">
                  <img
                    src={coverPreview}
                    alt="Cover Preview"
                    className="cover-preview-img"
                  />
                  <label htmlFor="cover-image" className="btn-change-cover">
                    Change Artwork
                  </label>
                </div>
              ) : (
                <label htmlFor="cover-image" className="cover-drop-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>Click to choose image (JPG, PNG, WebP)</span>
                </label>
              )}
              <input
                id="cover-image"
                type="file"
                name="coverImage"
                accept="image/*"
                onChange={handleCoverChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Music Audio File input */}
          <div className="form-group">
            <label htmlFor="music-file">Audio File (music)</label>
            <div className="music-file-area">
              <label htmlFor="music-file" className="music-file-box">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <div className="music-file-info">
                  <span className="file-name">
                    {musicFile ? musicFile.name : 'Choose master audio file (MP3, WAV, FLAC)'}
                  </span>
                  <span className="file-meta">
                    {musicFile
                      ? `${(musicFile.size / (1024 * 1024)).toFixed(2)} MB`
                      : 'Max size ~50MB'}
                  </span>
                </div>
              </label>
              <input
                id="music-file"
                type="file"
                name="music"
                accept="audio/*"
                onChange={handleMusicChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="form-actions">
            <Link to="/artist/dashboard" className="btn-cancel">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-submit-upload"
              disabled={loading}
            >
              {loading ? 'Uploading...' : 'Publish Track'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
