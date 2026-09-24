import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MusicDetail from "./pages/MusicDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ArtistDashboard from "./pages/ArtistDashboard";
import UploadMusic from "./pages/UploadMusic";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/app.css";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

function AppContent() {
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io(`${import.meta.env.VITE_MUSIC_SERVER_URL}`, {
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on("play", (data) => {
      const musicId = data.musicId;
      navigate(`/music/${musicId}`);
    });

    return () => newSocket.disconnect();
  }, [navigate]);

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home socket={socket} />} />
          <Route path="/music/:id" element={<MusicDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/artist/dashboard"
            element={
              <ProtectedRoute artistOnly>
                <ArtistDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/artist/upload"
            element={
              <ProtectedRoute artistOnly>
                <UploadMusic />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
