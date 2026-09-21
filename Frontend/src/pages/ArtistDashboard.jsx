import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ArtistDashboard() {
  // State for musics list: [{ title, artist, coverImageUrl, musicUrl, ... }]
  const [musics, setMusics] = useState([]);

  // State for playlists: [{ title, artist, musics: [{ title, artist, coverImageUrl, musicUrl }] }]
  const [playlists, setPlaylists] = useState([]);

  // Audio player state
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  // Playlist creation modal state
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [playlistError, setPlaylistError] = useState("");
  const [newPlaylistForm, setNewPlaylistForm] = useState({
    title: "",
    artist: "",
    selectedMusicIds: [],
    isPublic: true,
  });

  const fetchPlaylists = () => {
    axios
      .get(
        `${import.meta.env.VITE_MUSIC_SERVER_URL}/api/music/playlist/artist`,
        { withCredentials: true },
      )
      .then(async (res) => {
        const rawPlaylists = res.data?.playlists || res.data || [];
        if (!Array.isArray(rawPlaylists)) {
          setPlaylists([]);
          return;
        }

        const populatedPlaylists = await Promise.all(
          rawPlaylists.map(async (playlist) => {
            if (!Array.isArray(playlist.musics) || playlist.musics.length === 0) {
              return { ...playlist, musics: [] };
            }

            const populatedMusics = await Promise.all(
              playlist.musics.map(async (musicItem) => {
                const musicId =
                  typeof musicItem === "object"
                    ? musicItem._id || musicItem.id
                    : musicItem;

                if (!musicId) return musicItem;

                try {
                  const musicRes = await axios.get(
                    `${import.meta.env.VITE_MUSIC_SERVER_URL}/api/music/${musicId}`,
                    { withCredentials: true },
                  );
                  return musicRes.data?.music || musicRes.data || musicItem;
                } catch (error) {
                  console.error(`Error fetching music ${musicId}:`, error);
                  return typeof musicItem === "object"
                    ? musicItem
                    : { _id: musicId, id: musicId, title: "Unknown Track" };
                }
              }),
            );

            return { ...playlist, musics: populatedMusics };
          }),
        );

        setPlaylists(populatedPlaylists);
      })
      .catch((err) => {
        console.error("Error fetching artist playlists:", err);
      });
  };

  // Fetch artist musics & playlists from API
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_MUSIC_SERVER_URL}/api/music/artist-musics`, {
        withCredentials: true,
      })
      .then((res) => {
        const data = res.data?.musics || res.data || [];
        setMusics(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching artist musics:", err);
      });

    fetchPlaylists();
  }, []);

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
      : `${import.meta.env.VITE_MUSIC_SERVER_URL}/${raw.replace(/^\/+/, "")}`;
  };

  const handleTogglePlay = (music) => {
    const audioUrl = getAudioUrl(music);
    if (!audioUrl) return;

    if (currentPlaying?.resolvedAudioUrl === audioUrl) {
      setCurrentPlaying(null);
    } else {
      setCurrentPlaying({
        ...music,
        resolvedAudioUrl: audioUrl,
      });
    }
  };

  const toggleTrackSelection = (id) => {
    setNewPlaylistForm((prev) => {
      const exists = prev.selectedMusicIds.includes(id);
      return {
        ...prev,
        selectedMusicIds: exists
          ? prev.selectedMusicIds.filter((item) => item !== id)
          : [...prev.selectedMusicIds, id],
      };
    });
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistForm.title.trim()) {
      setPlaylistError("Playlist title is required.");
      return;
    }

    try {
      setPlaylistLoading(true);
      setPlaylistError("");

      const payload = {
        title: newPlaylistForm.title.trim(),
        artist: newPlaylistForm.artist.trim(),
        musics: newPlaylistForm.selectedMusicIds,
        isPublic: newPlaylistForm.isPublic,
      };

      const response = await axios.post(
        `${import.meta.env.VITE_MUSIC_SERVER_URL}/api/music/playlist`,
        payload,
        { withCredentials: true },
      );

      if (response.status === 200 || response.status === 201) {
        // Refresh playlists list
        fetchPlaylists();
        setNewPlaylistForm({
          title: "",
          artist: "",
          selectedMusicIds: [],
          isPublic: true,
        });
        setShowNewPlaylistModal(false);
      }
    } catch (err) {
      console.error("Failed to create playlist:", err);
      setPlaylistError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to create playlist. Please try again.",
      );
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handleDeletePlaylist = (id) => {
    setPlaylists(playlists.filter((p) => (p._id || p.id) !== id));
    if ((selectedPlaylist?._id || selectedPlaylist?.id) === id) {
      setSelectedPlaylist(null);
    }
  };

  return (
    <div className="artist-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-title-group">
          <span className="dashboard-badge">Artist Studio</span>
          <h1>Artist Dashboard</h1>
          <p>Manage your music catalogue and playlists.</p>
        </div>
        <div className="dashboard-actions">
          <button
            type="button"
            className="btn-create-playlist"
            onClick={() => setShowNewPlaylistModal(true)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Playlist
          </button>
          <Link to="/artist/upload" className="btn-upload-track">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload Music
          </Link>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper track-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Musics</span>
            <span className="stat-value">{musics.length}</span>
            <span className="stat-trend neutral">In your library</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stream-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Playlists</span>
            <span className="stat-value">{playlists.length}</span>
            <span className="stat-trend positive">Created playlists</span>
          </div>
        </div>
      </section>

      {/* Playlists Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Playlists</h2>
            <p className="section-subtitle">
              Playlists with <code>title</code>, <code>artist</code>, and{" "}
              <code>musics</code>.
            </p>
          </div>
          <button
            type="button"
            className="btn-create-playlist"
            onClick={() => setShowNewPlaylistModal(true)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Playlist
          </button>
        </div>

        {playlists.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              color: "var(--text-muted)",
            }}
          >
            <p>
              No playlists created yet. Click "Create Playlist" to make one!
            </p>
          </div>
        ) : (
          <div className="playlists-grid">
            {playlists.map((playlist) => {
              const pId = playlist._id || playlist.id;
              const firstMusic = playlist.musics?.[0];
              const isSelected =
                (selectedPlaylist?._id || selectedPlaylist?.id) === pId;

              return (
                <div
                  key={pId}
                  className={`playlist-card ${isSelected ? "selected" : ""}`}
                >
                  <div className="playlist-cover">
                    {firstMusic?.coverImageUrl ? (
                      <img
                        src={firstMusic.coverImageUrl}
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

                    <span
                      className={`playlist-visibility-tag ${playlist.isPublic ? "tag-public" : "tag-private"}`}
                    >
                      {playlist.isPublic ? "Public" : "Private"}
                    </span>

                    {firstMusic && (
                      <button
                        type="button"
                        className="playlist-play-badge-btn"
                        onClick={() => handleTogglePlay(firstMusic)}
                        title={`Play ${firstMusic.title}`}
                      >
                        {currentPlaying?.musicUrl === firstMusic.musicUrl ? (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="playlist-content">
                    <div className="playlist-title-header">
                      <h3 className="playlist-title">{playlist.title}</h3>
                      <span className="playlist-artist-badge">
                        {playlist.artist}
                      </span>
                    </div>

                    <div className="playlist-meta">
                      <span>{playlist.musics?.length || 0} musics</span>
                      <span>•</span>
                      <span>Artist: {playlist.artist}</span>
                    </div>

                    <div className="playlist-card-footer">
                      <button
                        type="button"
                        className="btn-playlist-edit"
                        onClick={() =>
                          setSelectedPlaylist(isSelected ? null : playlist)
                        }
                      >
                        {isSelected ? "Close Details" : "View Musics"}
                      </button>
                      <button
                        type="button"
                        className="btn-playlist-delete"
                        onClick={() => handleDeletePlaylist(pId)}
                        title="Delete playlist"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Playlist Musics Details */}
        {selectedPlaylist && (
          <div className="selected-playlist-viewer">
            <div className="viewer-header">
              <div className="viewer-info">
                <span className="viewer-badge">Playlist View</span>
                <h3>{selectedPlaylist.title}</h3>
                <p>
                  Artist: <strong>{selectedPlaylist.artist}</strong> •{" "}
                  {selectedPlaylist.musics?.length || 0} Musics
                </p>
              </div>
              <button
                type="button"
                className="btn-close-viewer"
                onClick={() => setSelectedPlaylist(null)}
              >
                ✕ Close
              </button>
            </div>

            <div className="playlist-musics-list">
              {selectedPlaylist.musics?.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  No musics in this playlist yet.
                </p>
              ) : (
                selectedPlaylist.musics?.map((music, index) => {
                  const mId = music._id || music.id || index;
                  const isPlaying = currentPlaying?.musicUrl === music.musicUrl;
                  const releaseDate =
                    music.createdAt || music.releaseDate
                      ? new Date(
                          music.createdAt || music.releaseDate,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "";

                  return (
                    <div
                      key={mId}
                      className={`music-item-row ${isPlaying ? "is-playing" : ""}`}
                    >
                      <span className="music-item-index">{index + 1}</span>
                      {music.coverImageUrl ? (
                        <img
                          src={music.coverImageUrl}
                          alt={music.title}
                          className="music-item-cover"
                        />
                      ) : (
                        <div
                          className="music-item-cover"
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
                      <div className="music-item-details">
                        <span className="music-item-title">{music.title}</span>
                        <span className="music-item-artist">
                          {music.artist}
                        </span>
                      </div>

                      {releaseDate && (
                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          {releaseDate}
                        </span>
                      )}

                      <button
                        type="button"
                        className={`btn-music-play ${isPlaying ? "active" : ""}`}
                        onClick={() => handleTogglePlay(music)}
                        title={isPlaying ? "Pause" : "Play preview"}
                      >
                        {isPlaying ? (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </section>

      {/* Music Catalogue Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Musics</h2>
            <p className="section-subtitle">
              All music tracks with <code>title</code>, <code>artist</code>,{" "}
              <code>coverImageUrl</code>, and release date.
            </p>
          </div>
          <Link to="/" className="section-link">
            Home
          </Link>
        </div>

        {musics.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem 1rem",
              color: "var(--text-muted)",
            }}
          >
            <p>No musics loaded yet.</p>
          </div>
        ) : (
          <div className="tracks-table-wrapper">
            <table className="tracks-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cover</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Released Date</th>
                  <th>Play</th>
                </tr>
              </thead>
              <tbody>
                {musics.map((music, idx) => {
                  const mId = music._id || music.id || idx;
                  const isPlaying = currentPlaying?.musicUrl === music.musicUrl;
                  const releaseDate =
                    music.createdAt || music.releaseDate
                      ? new Date(
                          music.createdAt || music.releaseDate,
                        ).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "—";

                  return (
                    <tr key={mId}>
                      <td className="track-index">{idx + 1}</td>
                      <td>
                        {music.coverImageUrl || music.coverImageKey ? (
                          <img
                            src={music.coverImageUrl || music.coverImageKey}
                            alt={music.title}
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
                              fontSize: "1.2rem",
                            }}
                          >
                            🎵
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="track-name">{music.title}</span>
                      </td>
                      <td>{music.artist}</td>
                      <td>
                        <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                          {releaseDate}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn-table-play ${isPlaying ? "playing" : ""}`}
                          onClick={() => handleTogglePlay(music)}
                          disabled={!music.musicUrl}
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Floating Audio Player when music is playing */}
      {currentPlaying && (
        <div className="dashboard-audio-dock">
          <div className="audio-dock-left">
            {currentPlaying.coverImageUrl ? (
              <img
                src={currentPlaying.coverImageUrl}
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
              <span className="audio-dock-artist">{currentPlaying.artist}</span>
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

      {/* Create Playlist Modal */}
      {showNewPlaylistModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowNewPlaylistModal(false)}
        >
          <div
            className="modal-card modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-header-text">
                <h3>Create New Playlist</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowNewPlaylistModal(false);
                  setPlaylistError("");
                }}
              >
                ✕
              </button>
            </div>

            {playlistError && (
              <div className="modal-alert-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{playlistError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePlaylist} className="modal-form">
              <div className="modal-input-group">
                <label htmlFor="playlist-title">Playlist Title</label>
                <input
                  id="playlist-title"
                  type="text"
                  placeholder="e.g. Neon Horizon Collection"
                  value={newPlaylistForm.title}
                  onChange={(e) =>
                    setNewPlaylistForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              {/* Musics Picker */}
              <div className="modal-input-group">
                <label>Select Musics to Add</label>
                {musics.length === 0 ? (
                  <p
                    style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}
                  >
                    No musics available to add.
                  </p>
                ) : (
                  <div className="musics-picker-list">
                    {musics.map((m) => {
                      const mId = m._id || m.id;
                      const isChecked =
                        newPlaylistForm.selectedMusicIds.includes(mId);
                      return (
                        <div
                          key={mId}
                          className={`music-picker-item ${isChecked ? "selected" : ""}`}
                          onClick={() => toggleTrackSelection(mId)}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                          />
                          {m.coverImageUrl ? (
                            <img
                              src={m.coverImageUrl}
                              alt={m.title}
                              className="picker-thumb"
                            />
                          ) : (
                            <div
                              className="picker-thumb"
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
                          <div className="picker-text">
                            <span className="picker-title">{m.title}</span>
                            <span className="picker-artist">{m.artist}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => {
                    setShowNewPlaylistModal(false);
                    setPlaylistError("");
                  }}
                  disabled={playlistLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-modal-submit"
                  disabled={playlistLoading}
                >
                  {playlistLoading ? "Creating Playlist..." : "Save Playlist"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
