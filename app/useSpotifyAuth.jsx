// useSpotifyAuth.jsx
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://jbeycklmkrjxlttwtmkb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZXlja2xta3JqeGx0dHd0bWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5OTQ3MjAsImV4cCI6MjAzODU3MDcyMH0.xix1tPCFdcPXCkmvrFANHKSNXWetWEzJBnqpQ9sDtoQ"
);

const useSpotifyAuth = () => {
  const [token, setToken] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState(null);
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

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  useEffect(() => {
    if (token && tokenExpiration) {
      const checkTokenExpiration = setInterval(() => {
        if (Date.now() >= tokenExpiration) {
          logout();
        }
      }, 60000); // 60000 = per min

      return () => clearInterval(checkTokenExpiration);
    }
  }, [token, tokenExpiration]);

  const loadToken = async () => {
    console.log("Initiate loadtoken");

    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedExpiration = await AsyncStorage.getItem("tokenExpiration");
      if (storedToken && storedExpiration) {
        const expirationTime = parseInt(storedExpiration, 10);
        if (Date.now() < expirationTime) {
          setToken(storedToken);
          setTokenExpiration(expirationTime);
          console.log("storedToken: " + storedToken);
        } else {
          console.log("Token has expired");
          logout();
        }
      }
    } catch (error) {
      console.error("Error loading token:", error);
    }
  };

  const loadUserProfile = async () => {
    console.log("Initiate load user profile");

    try {
      const userProfileString = await AsyncStorage.getItem("userData");
      if (userProfileString) {
        const userProfileData = JSON.parse(userProfileString);
        setUserProfile(userProfileData);
        console.log("Stored user profile:", userProfileData);
        return;
      } else {
        console.log("No stored user profile found");
      }
    } catch (error) {
      console.error("Error loading userProfile:", error);
      setUserProfile(null);
    }
  };

  const fetchAndSaveUserProfile = async (accessToken) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      await AsyncStorage.setItem("userData", JSON.stringify(data));
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const logout = async () => {
    console.log("Running Lougout()");
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("tokenExpiration");
      await AsyncStorage.removeItem("userData");
      setToken(null);
      setTokenExpiration(null);
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
        url: `https://api.spotify.com/v1/users/${userId}/playlists`,
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

  const loginAndSaveUser = async (spotifyToken, spotifyProfile, expiresIn) => {
    console.log("Attempting to save user. Token:", !!spotifyToken);
    console.log("Spotify Profile:", spotifyProfile);

    if (!spotifyProfile || !spotifyProfile.id) {
      console.error("Invalid Spotify profile or missing ID");
      return null;
    }

    const expirationTime = Date.now() + expiresIn * 1000;
    setToken(spotifyToken);
    setTokenExpiration(expirationTime);
    setUserProfile(spotifyProfile);

    await AsyncStorage.setItem("token", spotifyToken);
    await AsyncStorage.setItem("tokenExpiration", expirationTime.toString());

    // Save user to supabase
    const { data, error } = await supabase.from("users").upsert(
      {
        spotify_id: spotifyProfile.id,
        email: spotifyProfile.email,
        role: "admin", // Default role
      },
      { onConflict: "spotify_id" }
    );

    if (error) {
      console.error("Error saving user to Supabase:", error);
      console.error("Error details:", error.message, error.details);
    } else if (data) {
      console.log("User successfully saved to Supabase:", data);
    }

    // Check and return the user role
    return await checkUserRole(spotifyProfile);
  };

  const checkUserRole = async (spotifyProfile) => {
    if (!spotifyProfile.id) {
      console.log("spotify id: " + spotifyProfile.id);
      console.error("Spotify ID not provided");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("spotify_id", spotifyProfile.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return null;
      }

      if (!data) {
        console.log("User not found in database");
        return null;
      }

      console.log("User role fetched:", data.role);
      return data.role;
    } catch (error) {
      console.error("Unexpected error in checkUserRole:", error);
      return null;
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
    fetchAndSaveUserProfile,
    getUserPlaylists,
    getPlaylistTracks,
    setSelectedPlaylistId,
    loginAndSaveUser,
    checkUserRole,
  };
};

export default useSpotifyAuth;
