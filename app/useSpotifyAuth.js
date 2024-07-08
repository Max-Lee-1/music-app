// useSpotifyAuth.js
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

const useSpotifyAuth = () => {
  const [token, setToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        console.log("storedToken: " + storedToken);
      }
    } catch (error) {
      console.error("Error loading token:", error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userProfile = await AsyncStorage.getItem("userData");
      if (userProfile) {
        setUserProfile(JSON.parse(userProfile));
        console.log("store user profile: " + userProfile);
      }
    } catch (error) {
      console.error("Error loading userProfile:", error);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userData");
      setToken(null);
      setUserProfile(null);
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return { token, userProfile, logout, loadToken, loadUserProfile };
};

export default useSpotifyAuth;
