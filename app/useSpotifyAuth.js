// useSpotifyAuth.js
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

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
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userData");
      setToken(null);
      setUserData(null);
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return { token, userData, logout };
};
