import { createContext, useState, useEffect } from "react";
import {
  loginUser,
  registerUser,
  saveFcmToken,
} from "../services/authService";
import socket from "../socket";
import { messaging, getToken } from "../firebase";

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("shnoor_user");
    const storedToken = localStorage.getItem("shnoor_token");

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);

      setUser(userData);

      socket.emit("register", {
        userId: userData.id,
        role: "user",
      });
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);

    localStorage.setItem("shnoor_token", data.token);
    localStorage.setItem("shnoor_user", JSON.stringify(data.user));

    setUser(data.user);

    try {
      const fcmToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (fcmToken) {
        await saveFcmToken(fcmToken);
      }
    } catch (err) {
      console.error("Failed to save FCM Token", err);
    }

    socket.emit("register", {
      userId: data.user.id,
      role: "user",
    });

    return data.user;
  };

  const register = async (payload) => {
    const data = await registerUser(payload);

    localStorage.setItem("shnoor_token", data.token);
    localStorage.setItem("shnoor_user", JSON.stringify(data.user));

    setUser(data.user);

   try {
  const fcmToken = await getToken(messaging, {
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  });

  console.log("FCM Token:", fcmToken);

  if (fcmToken) {
    await saveFcmToken(fcmToken);
  }
} catch (err) {
  console.error("Failed to save FCM Token", err);
}

    socket.emit("register", {
      userId: data.user.id,
      role: "user",
    });

    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("shnoor_token");
    localStorage.removeItem("shnoor_user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;