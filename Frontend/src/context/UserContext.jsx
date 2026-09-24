import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext(null);

export function normalizeUserData(rawUser) {
  if (!rawUser) return null;

  let fullname = rawUser.fullname;
  if (typeof fullname === "string") {
    const parts = fullname.trim().split(/\s+/);
    fullname = {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
    };
  } else if (!fullname || typeof fullname !== "object") {
    fullname = {
      firstName: rawUser.firstName || rawUser.username || "",
      lastName: rawUser.lastName || "",
    };
  } else {
    fullname = {
      firstName: fullname.firstName || "",
      lastName: fullname.lastName || "",
    };
  }

  return {
    ...rawUser,
    fullname,
    role: (rawUser.role || rawUser.userType || "user").toLowerCase(),
  };
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("spotify_user");
      return stored ? normalizeUserData(JSON.parse(stored)) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate and store user details using /api/auth/me
  const validateSession = async () => {
    const authServerUrl =
      import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:3000";
    try {
      const res = await axios.get(`${authServerUrl}/api/auth/me`, {
        withCredentials: true,
      });
      const rawUser = res.data?.user || res.data;
      if (
        rawUser &&
        (rawUser.email || rawUser._id || rawUser.id || rawUser.fullname)
      ) {
        const formattedUser = normalizeUserData(rawUser);
        setUser(formattedUser);
        localStorage.setItem("spotify_user", JSON.stringify(formattedUser));
        return formattedUser;
      } else {
        setUser(null);
        localStorage.removeItem("spotify_user");
        return null;
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setUser(null);
        localStorage.removeItem("spotify_user");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage whenever user state changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem("spotify_user", JSON.stringify(user));
      } catch (err) {
        console.error("Failed to save user to localStorage:", err);
      }
    } else {
      localStorage.removeItem("spotify_user");
    }
  }, [user]);

  // Validate on initial mount
  useEffect(() => {
    validateSession();
  }, []);

  const loginUser = (userData) => {
    const normalizedUser = normalizeUserData(userData?.user || userData);
    setUser(normalizedUser);
    try {
      localStorage.setItem("spotify_user", JSON.stringify(normalizedUser));
    } catch (err) {
      console.error("Error storing user:", err);
    }
    return normalizedUser;
  };

  const logoutUser = async () => {
    const authServerUrl =
      import.meta.env.VITE_AUTH_SERVER_URL || "http://localhost:3000";
    try {
      await axios.post(
        `${authServerUrl}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
    } catch {
      // ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem("spotify_user");
    }
  };

  const userRole = (user?.role || user?.userType || "")?.toLowerCase();
  const isArtist = userRole === "artist";

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        logoutUser,
        validateSession,
        isArtist,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export default UserContext;
