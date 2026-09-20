import { Link } from 'react-router-dom'

const popularPlaylists = [
  {
    id: 1,
    title: "Today's Top Hits",
    description: 'The hottest tracks right now across all genres.',
    coverClass: 'cover-color-1',
    icon: '🎵',
  },
  {
    id: 2,
    title: 'Chill Vibes',
    description: 'Relax and unwind with smooth, mellow beats.',
    coverClass: 'cover-color-2',
    icon: '☕',
  },
  {
    id: 3,
    title: 'Workout Energy',
    description: 'High-energy anthems to fuel your training sessions.',
    coverClass: 'cover-color-3',
    icon: '⚡',
  },
  {
    id: 4,
    title: 'Focus & Study',
    description: 'Instrumental and low-fi melodies to help you concentrate.',
    coverClass: 'cover-color-4',
    icon: '📚',
  },
]

const trendingSongs = [
  { id: 1, title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:20' },
  { id: 2, title: 'As It Was', artist: 'Harry Styles', duration: '2:47' },
  { id: 3, title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', duration: '2:21' },
  { id: 4, title: 'Levitating', artist: 'Dua Lipa', duration: '3:23' },
]

export default function Home() {
  return (
    <div className="home-wrapper">
      {/* Hero Section */}
      <section className="hero-card">
        <div className="hero-badge">
          <span>New Music Every Day</span>
        </div>
        <h1 className="hero-title">Listen to music anytime, anywhere.</h1>
        <p className="hero-subtitle">
          Discover new releases, build your personal playlists, and stream millions
          of songs and podcasts on all your devices.
        </p>
        <div className="hero-actions">
          <Link to="/register" className="btn-primary-action">
            Get Started Free
          </Link>
          <Link to="/login" className="btn-secondary-action">
            Log In
          </Link>
        </div>
      </section>

      {/* Popular Playlists */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">Popular Playlists</h2>
            <p className="section-subtitle">Handpicked collections to match every mood</p>
          </div>
        </div>

        <div className="playlists-grid">
          {popularPlaylists.map((playlist) => (
            <div key={playlist.id} className="playlist-card" tabIndex={0}>
              <div className={`card-cover ${playlist.coverClass}`}>
                <span>{playlist.icon}</span>
              </div>
              <h3 className="card-title">{playlist.title}</h3>
              <p className="card-desc">{playlist.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Songs */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Songs</h2>
            <p className="section-subtitle">Top played tracks this week</p>
          </div>
        </div>

        <div className="track-list">
          {trendingSongs.map((song) => (
            <div key={song.id} className="track-row">
              <div className="track-row-left">
                <span className="track-number">{song.id}</span>
                <div className="track-details">
                  <h4>{song.title}</h4>
                  <p>{song.artist}</p>
                </div>
              </div>
              <span className="track-duration">{song.duration}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
