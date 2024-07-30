// useSpotifyAuth.js
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";

const useSpotifyAuth = () => {
  const [token, setToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      await loadToken();
      await loadUserProfile();
    };
    loadData();
  }, []);

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
      const userProfileString = await AsyncStorage.getItem("userData");
      if (userProfileString) {
        const userProfileData = JSON.parse(userProfileString);
        setUserProfile(userProfileData);
        console.log("Stored user profile:", userProfileData);
      }
    } catch (error) {
      console.error("Error loading userProfile:", error);
      setUserProfile(null);
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

  const getUserPlaylists = async () => {
    console.log("running getUserPlaylist");
    try {
      const accessToken = await AsyncStorage.getItem("token");
      if (!accessToken) {
        console.error("No access token found");
        return;
      }
      if (!userProfile || !userProfile.id) {
        console.error("User profile not loaded");
        return;
      }
      const userId = userProfile.id;
      console.log("User Id:", userId);

      const response = await axios({
        method: "get",
        url: `https://api.spotify.com/v1/users/${userId}/playlists?limit=10`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const userPlaylists = response.data;
      setUserPlaylists(userPlaylists);
      console.log("Playlists fetched:", userPlaylists.items.length);
    } catch (err) {
      console.log("Error fetching playlists:", err.message);
    }
  };

  const getPlaylistTracks = async (playlistId) => {
    const accessToken = await AsyncStorage.getItem("token");
    console.log("running getPlaylistTracks for playlist:", playlistId);

    try {
      const response = await axios({
        method: "get",
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const tracks = response.data.items.map((item) => item.track);
      setPlaylistTracks(tracks);
      setSelectedPlaylistId(playlistId);
      console.log("Tracks fetched:", tracks.length);
    } catch (err) {
      console.log(err.message);
    }
  };

  return {
    token,
    userProfile,
    userPlaylists,
    playlistTracks,
    selectedPlaylistId,
    logout,
    loadToken,
    loadUserProfile,
    getUserPlaylists,
    getPlaylistTracks,
    setSelectedPlaylistId,
  };
};

export default useSpotifyAuth;
