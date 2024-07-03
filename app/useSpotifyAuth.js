// useSpotifyAuth.js
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useSpotifyAuth = () => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadTokenAndUserData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("spotifyToken");
        const storedUserData = await AsyncStorage.getItem("spotifyUserData");
        if (storedToken) setToken(storedToken);
        if (storedUserData) setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error loading auth data:", error);
      }
    };

    loadTokenAndUserData();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("spotifyToken");
      await AsyncStorage.removeItem("spotifyUserData");
      setToken(null);
      setUserData(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return { token, userData, logout };
};
