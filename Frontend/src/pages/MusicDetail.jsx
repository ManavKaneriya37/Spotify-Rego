import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function MusicDetail() {
  const { id } = useParams();
  const [music, setMusic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Audio state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    const fetchMusic = async () => {
      setLoading(true);
      setError("");
      const musicServerUrl =
        import.meta.env.VITE_MUSIC_SERVER_URL || "http://localhost:3002";

      try {
        const response = await axios.get(
          `${musicServerUrl}/api/music/${id}`,
          { withCredentials: true }
        );

        const data =
          response.data?.music || response.data?.data || response.data;
        if (data) {
          setMusic(data);
        } else {
          setError("Music track not found.");
        }
      } catch (err) {
        console.error("Error fetching music:", err);
        setError(
          err.response?.data?.message ||
            "Unable to load track details. Please make sure you are logged in."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMusic();
    }
  }, [id]);

  // Sync initial volume and loop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = isLooping;
    }
  }, [volume, isLooping]);

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const skipForward = (seconds = 10) => {
    if (!audioRef.current) return;
    const newTime = Math.min(audioRef.current.currentTime + seconds, duration);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = (seconds = 10) => {
    if (!audioRef.current) return;
    const newTime = Math.max(audioRef.current.currentTime - seconds, 0);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.muted = nextMuted;
  };

  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (audioRef.current) {
      audioRef.current.loop = nextLoop;
    }
  };

  const formatTime = (timeInSec) => {
    if (isNaN(timeInSec) || timeInSec < 0) return "0:00";
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const musicServerUrl =
    import.meta.env.VITE_MUSIC_SERVER_URL || "http://localhost:3002";

  // Resolve audio URL supporting musicKey, musicUrl, key, or path
  const audioSource =
    music?.musicKey ||
    music?.musicUrl ||
    music?.audioKey ||
    music?.audioUrl ||
    music?.key;

  const resolvedAudioUrl = audioSource
    ? audioSource.startsWith("http") || audioSource.startsWith("blob:")
      ? audioSource
      : `${musicServerUrl}/${audioSource.replace(/^\/+/, "")}`
    : "";

  // Resolve cover artwork supporting coverImageKey, coverImageUrl, etc.
  const coverSource =
    music?.coverImageKey ||
    music?.coverImageUrl ||
    music?.coverImage ||
    music?.image;

  const coverUrl = coverSource
    ? coverSource.startsWith("http") || coverSource.startsWith("blob:")
      ? coverSource
      : `${musicServerUrl}/${coverSource.replace(/^\/+/, "")}`
    : "";

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  const togglePlay = () => {
    if (!audioRef.current || !resolvedAudioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback error:", err));
    }
  };

  return (
    <div className="sp-immersive-player">
      {/* Dynamic Ambient Blur Backdrop */}
      <div
        className="sp-backdrop-art"
        style={{
          backgroundImage: coverUrl ? `url(${coverUrl})` : "none",
        }}
      />
      <div className="sp-backdrop-tint" />

      {/* Native Audio Engine */}
      <audio
        ref={audioRef}
        src={resolvedAudioUrl || undefined}
        preload="metadata"
        loop={isLooping}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
        onEnded={() => {
          if (!isLooping) setIsPlaying(false);
        }}
        onError={(e) => {
          console.error("Audio playback error on source:", resolvedAudioUrl, e);
          setIsPlaying(false);
        }}
      />

      {/* Top Header Navigation */}
      <header className="sp-top-bar">
        <Link to="/" className="sp-back-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Explore</span>
        </Link>
        <div className="sp-playing-indicator">
          <span className="sp-dot" />
          <span>NOW STREAMING</span>
        </div>
      </header>

      {/* Body Content Area */}
      {loading ? (
        <div className="sp-state-box">
          <div className="loading-spinner" />
          <p>Tuning in to track...</p>
        </div>
      ) : error ? (
        <div className="sp-state-box error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3>Playback unavailable</h3>
          <p>{error}</p>
          <Link to="/" className="btn-primary-action" style={{ marginTop: "1rem" }}>
            Return to catalogue
          </Link>
        </div>
      ) : music ? (
        <div className="sp-stage-content">
          {/* Hero Spotlight Header Banner */}
          <div className="sp-hero-header">
            <div className={`sp-cover-box ${isPlaying ? "playing" : ""}`}>
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={music.title}
                  className="sp-cover-img"
                />
              ) : (
                <div className="sp-cover-empty">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
              {isPlaying && <div className="sp-glow-aura" />}
            </div>

            <div className="sp-hero-info">
              <span className="sp-type-tag">SINGLE TRACK</span>
              <h1 className="sp-song-title">{music.title}</h1>
              <div className="sp-artist-row">
                <span className="sp-artist-avatar">🎵</span>
                <span className="sp-artist-name">{music.artist || "Unknown Artist"}</span>
                {music.createdAt && (
                  <>
                    <span className="sp-sep">•</span>
                    <span className="sp-release-year">
                      {new Date(music.createdAt).getFullYear()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Dock Console */}
          <footer className="sp-dock-console">
            {/* Timeline Row */}
            <div className="sp-timeline-row">
              <span className="sp-time-num">{formatTime(currentTime)}</span>
              <div className="sp-timeline-track">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="sp-scrub-input"
                  style={{
                    background: `linear-gradient(to right, var(--accent-primary) ${progressPercent}%, rgba(255,255,255,0.18) ${progressPercent}%)`,
                  }}
                  aria-label="Seek track position"
                />
              </div>
              <span className="sp-time-num">{formatTime(duration)}</span>
            </div>

            {/* Bottom Controls Bar: Left Meta, Center Playback, Right Volume */}
            <div className="sp-console-subrow">
              {/* Left Mini Info */}
              <div className="sp-dock-meta-left">
                <span className="sp-meta-title">{music.title}</span>
                <span className="sp-meta-artist">{music.artist || "Unknown Artist"}</span>
              </div>

              {/* Center Controls */}
              <div className="sp-dock-actions-center">
                {/* Loop Button */}
                <button
                  type="button"
                  className={`sp-btn-icon ${isLooping ? "active" : ""}`}
                  onClick={toggleLoop}
                  title={isLooping ? "Repeat On" : "Repeat Off"}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                </button>

                {/* Rewind 10s */}
                <button
                  type="button"
                  className="sp-btn-icon"
                  onClick={() => skipBackward(10)}
                  title="Rewind 10s"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" />
                  </svg>
                  <span className="sp-skip-badge">10</span>
                </button>

                {/* Central Play/Pause Button */}
                <button
                  type="button"
                  className="sp-btn-hero-play"
                  onClick={togglePlay}
                  disabled={!resolvedAudioUrl}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "3px" }}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Forward 10s */}
                <button
                  type="button"
                  className="sp-btn-icon"
                  onClick={() => skipForward(10)}
                  title="Forward 10s"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 17l5-5-5-5M6 17l5-5-5-5" />
                  </svg>
                  <span className="sp-skip-badge">10</span>
                </button>

                {/* Mute Button */}
                <button
                  type="button"
                  className={`sp-btn-icon ${isMuted ? "muted" : ""}`}
                  onClick={toggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0a7 7 0 0 1-.11 1.23" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Right Volume Control */}
              <div className="sp-dock-volume-right">
                <button
                  type="button"
                  className="sp-btn-vol-icon"
                  onClick={toggleMute}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
                <div className="sp-vol-slider-wrap">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="sp-vol-range"
                    style={{
                      background: `linear-gradient(to right, var(--accent-primary) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.18) ${(isMuted ? 0 : volume) * 100}%)`,
                    }}
                    aria-label="Adjust track volume"
                  />
                </div>
                <span className="sp-vol-label">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>
          </footer>
        </div>
      ) : null}
    </div>
  );
}
