import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Home() {
  const [musics, setMusics] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPlaying, setCurrentPlaying] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      const musicServerUrl =
        import.meta.env.VITE_MUSIC_SERVER_URL || "http://localhost:3002";

      try {
        const [musicRes, playlistRes] = await Promise.allSettled([
          axios.get(`${musicServerUrl}/api/music/`, { withCredentials: true }),
          axios.get(`${musicServerUrl}/api/music/playlist`, {
            withCredentials: true,
          }),
        ]);

        if (musicRes.status === "fulfilled") {
          const rawMusics =
            musicRes.value.data?.musics ||
            musicRes.value.data?.data ||
            musicRes.value.data ||
            [];
          setMusics(Array.isArray(rawMusics) ? rawMusics : []);
        } else {
          console.error("Failed to load musics:", musicRes.reason);
        }

        if (playlistRes.status === "fulfilled") {
          const rawPlaylists =
            playlistRes.value.data?.playlists ||
            playlistRes.value.data?.data ||
            playlistRes.value.data ||
            [];
          setPlaylists(Array.isArray(rawPlaylists) ? rawPlaylists : []);
        } else {
          console.error("Failed to load playlists:", playlistRes.reason);
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError("Failed to fetch tracks and playlists.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const musicServerUrl =
    import.meta.env.VITE_MUSIC_SERVER_URL || "http://localhost:3002";

  const getAudioUrl = (song) => {
    const raw =
      song?.musicKey ||
      song?.musicUrl ||
      song?.audioKey ||
      song?.audioUrl ||
      song?.key;
    if (!raw) return "";
    return raw.startsWith("http") || raw.startsWith("blob:")
      ? raw
      : `${musicServerUrl}/${raw.replace(/^\/+/, "")}`;
  };

  const handleTogglePlay = (music) => {
    const songUrl = getAudioUrl(music);
    if (!songUrl) return;

    if (currentPlaying?.resolvedAudioUrl === songUrl) {
      setCurrentPlaying(null);
    } else {
      setCurrentPlaying({
        ...music,
        resolvedAudioUrl: songUrl,
      });
    }
  };

  return (
    <div className="home-wrapper">
      {/* Loading & Error States */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "2.5rem",
            color: "var(--text-muted)",
          }}
        >
          <div className="loading-spinner" style={{ margin: "0 auto 1rem" }} />
          <p>Loading playlists and musics...</p>
        </div>
      )}

      {error && (
        <div
          className="alert-message"
          style={{
            margin: "0 0 1rem",
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
          }}
        >
          {error}
        </div>
      )}

      {/* All Playlists Section */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">Playlists</h2>
            <p className="section-subtitle">
              Browse public & artist curated collections
            </p>
          </div>
        </div>

        {!loading && playlists.length === 0 ? (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "2.5rem 1.5rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>
              No playlists available
            </p>
            <span style={{ fontSize: "0.85rem" }}>
              Check back soon for newly curated playlists.
            </span>
          </div>
        ) : (
          <div className="playlists-grid">
            {playlists.map((playlist, idx) => {
              const pId = playlist._id || playlist.id || idx;
              const playlistMusics = Array.isArray(playlist.musics)
                ? playlist.musics
                : [];
              const firstMusic = playlistMusics[0];
              const coverImg =
                playlist.coverImageUrl ||
                playlist.coverImage ||
                (typeof firstMusic === "object" && firstMusic?.coverImageUrl);

              return (
                <div key={pId} className={`playlist-card`}>
                  <div className="playlist-cover">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={playlist.title}
                        className="playlist-cover-image"
                      />
                    ) : (
                      <div className="playlist-cover-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="playlist-content">
                    <div className="playlist-title-header">
                      <h3 className="playlist-title">{playlist.title}</h3>
                      {playlist.artist && (
                        <span className="playlist-artist-badge">
                          {playlist.artist}
                        </span>
                      )}
                    </div>

                    <div className="playlist-meta">
                      <span>{playlistMusics.length} tracks</span>
                      {playlist.artist && (
                        <>
                          <span>•</span>
                          <span>{playlist.artist}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* All Musics Section */}
      <section>
        <div className="section-header">
          <div>
            <h2 className="section-title">All Musics</h2>
            <p className="section-subtitle">
              Listen to the latest music catalogue uploaded across the platform
            </p>
          </div>
        </div>

        {!loading && musics.length === 0 ? (
          <div
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "2.5rem 1.5rem",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <p style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>
              No musics available yet
            </p>
            <span style={{ fontSize: "0.85rem" }}>
              Stay tuned as artists drop new tracks!
            </span>
          </div>
        ) : (
          <div className="track-list">
            {musics.map((song, idx) => {
              const mId = song._id || song.id || idx;
              const songAudioUrl = getAudioUrl(song);
              const isPlaying =
                songAudioUrl && currentPlaying?.resolvedAudioUrl === songAudioUrl;
              const coverImg = song.coverImageUrl || song.coverImageKey;
              const releaseDate =
                song.createdAt || song.releaseDate
                  ? new Date(
                      song.createdAt || song.releaseDate,
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "";

              return (
                <div
                  key={mId}
                  className={`track-row ${isPlaying ? "active-row" : ""}`}
                  style={
                    isPlaying
                      ? { backgroundColor: "var(--bg-surface-hover)" }
                      : {}
                  }
                >
                  <div className="track-row-left">
                    <span className="track-number">{idx + 1}</span>

                    <Link to={`/music/${mId}`} title={`Open ${song.title}`}>
                      {coverImg ? (
                        <img
                          src={coverImg}
                          alt={song.title}
                          className="track-thumbnail-img"
                        />
                      ) : (
                        <div
                          className="track-thumbnail-img"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255,255,255,0.06)",
                            fontSize: "1.1rem",
                          }}
                        >
                          🎵
                        </div>
                      )}
                    </Link>

                    <div className="track-details">
                      <Link
                        to={`/music/${mId}`}
                        style={{
                          textDecoration: "none",
                          color: "inherit",
                          transition: "color var(--transition-fast)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--accent-primary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "inherit")
                        }
                        title={`Open ${song.title}`}
                      >
                        <h4>{song.title}</h4>
                      </Link>
                      <p>{song.artist || "Unknown Artist"}</p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                    }}
                  >
                    {releaseDate && (
                      <span className="track-duration">{releaseDate}</span>
                    )}

                    {getAudioUrl(song) && (
                      <button
                        type="button"
                        className={`btn-table-play ${isPlaying ? "playing" : ""}`}
                        onClick={() => handleTogglePlay(song)}
                        title={isPlaying ? "Pause" : "Play audio"}
                      >
                        {isPlaying ? (
                          <>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                            </svg>
                            <span>Playing</span>
                          </>
                        ) : (
                          <>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            <span>Play</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom Floating Audio Dock */}
      {currentPlaying && (
        <div className="dashboard-audio-dock">
          <div className="audio-dock-left">
            {currentPlaying.coverImageUrl || currentPlaying.coverImageKey ? (
              <img
                src={
                  (currentPlaying.coverImageUrl || currentPlaying.coverImageKey).startsWith("http")
                    ? currentPlaying.coverImageUrl || currentPlaying.coverImageKey
                    : `${musicServerUrl}/${(currentPlaying.coverImageUrl || currentPlaying.coverImageKey).replace(/^\/+/, "")}`
                }
                alt={currentPlaying.title}
                className="audio-dock-cover"
              />
            ) : (
              <div
                className="audio-dock-cover"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.06)",
                }}
              >
                🎵
              </div>
            )}
            <div className="audio-dock-meta">
              <span className="audio-dock-title">{currentPlaying.title}</span>
              <span className="audio-dock-artist">
                {currentPlaying.artist || "Unknown Artist"}
              </span>
            </div>
          </div>

          <div className="audio-dock-center">
            <audio
              src={currentPlaying.resolvedAudioUrl || currentPlaying.musicUrl}
              autoPlay
              controls
              className="audio-dock-element"
            />
          </div>

          <div className="audio-dock-right">
            <button
              type="button"
              className="audio-dock-close"
              onClick={() => setCurrentPlaying(null)}
              title="Close player"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
