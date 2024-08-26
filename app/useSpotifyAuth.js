import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";
import { ResponseType } from "expo-auth-session";
import * as Crypto from "expo-crypto";

// Supabase client setup
const supabase = createClient(
  "https://jbeycklmkrjxlttwtmkb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpiZXlja2xta3JqeGx0dHd0bWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI5OTQ3MjAsImV4cCI6MjAzODU3MDcyMH0.xix1tPCFdcPXCkmvrFANHKSNXWetWEzJBnqpQ9sDtoQ"
);

const clientId = "990510f4dd5f44e399690dfcde5b5828";

const redirectUri =
  process.env.NODE_ENV === "production"
    ? "https://technify-b4ap64qdg-maxs-projects-f7c3cc13.vercel.app/spotify-auth-callback"
    : "http://localhost:8081/spotify-auth-callback";

const discovery = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

const useSpotifyAuth = () => {
  const [token, setToken] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();

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
      }, 60000); // 60000 = per minute

      return () => clearInterval(checkTokenExpiration);
    }
  }, [token, tokenExpiration]);

  // Helper functions
  const generateRandomString = (length) => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };

  const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest("SHA-256", data);
  };

  const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  };

  const startAuth = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const codeVerifier = generateRandomString(64);
      const hashed = await sha256(codeVerifier);
      const codeChallenge = base64encode(hashed);

      await AsyncStorage.setItem("codeVerifier", codeVerifier);

      const authRequest = new AuthSession.AuthRequest({
        clientId,
        responseType: ResponseType.Code,
        scopes: [
          "user-read-private",
          "user-read-email",
          "user-library-read",
          "user-read-recently-played",
          "user-top-read",
          "playlist-read-private",
          "playlist-read-collaborative",
          "playlist-modify-public",
          "user-read-playback-state",
          "user-modify-playback-state",
          "streaming",
          "user-read-currently-playing",
        ],
        redirectUri,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      });

      try {
        const result = await authRequest.promptAsync(discovery);

        if (result.type === "success" && result.params.code) {
          const storedCodeVerifier = await AsyncStorage.getItem("codeVerifier");
          await exchangeCodeForToken(result.params.code, storedCodeVerifier);
        } else {
          console.error("Authentication failed:", result);
        }
      } catch (error) {
        console.error("Error during authentication:", error);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const exchangeCodeForToken = async (code, codeVerifier) => {
    try {
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          code,
          redirectUri,
          extraParams: {
            code_verifier: codeVerifier,
          },
        },
        discovery
      );

      if (tokenResult.accessToken) {
        await AsyncStorage.setItem("token", tokenResult.accessToken);
        const expirationTime = Date.now() + tokenResult.expiresIn * 1000;
        await AsyncStorage.setItem(
          "tokenExpiration",
          expirationTime.toString()
        );
        const userData = await fetchAndSaveUserProfile(tokenResult.accessToken);

        if (userData) {
          await loginAndSaveUser(
            tokenResult.accessToken,
            userData,
            tokenResult.expiresIn
          );
          router.replace("/");
        } else {
          throw new Error("Failed to fetch user data");
        }
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      throw error;
    }
  };

  const loadToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      const storedExpiration = await AsyncStorage.getItem("tokenExpiration");
      if (storedToken && storedExpiration) {
        const expirationTime = parseInt(storedExpiration, 10);
        if (Date.now() < expirationTime) {
          setToken(storedToken);
          setTokenExpiration(expirationTime);
        } else {
          logout();
        }
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
    try {
      const accessToken = await AsyncStorage.getItem("token");
      if (!accessToken || !userProfile?.id) {
        console.error("No access token or user profile found");
        return;
      }
      const userId = userProfile.id;
      const response = await axios.get(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setUserPlaylists(response.data.items);
    } catch (err) {
      console.error("Error fetching playlists:", err.message);
    }
  };

  const getPlaylistTracks = async (playlistId) => {
    try {
      const accessToken = await AsyncStorage.getItem("token");
      if (!accessToken) {
        console.error("No access token found");
        return;
      }
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setPlaylistTracks(response.data.items.map((item) => item.track));
      setSelectedPlaylistId(playlistId);
    } catch (err) {
      console.error("Error fetching playlist tracks:", err.message);
    }
  };

  return {
    token,
    userProfile,
    userPlaylists,
    playlistTracks,
    selectedPlaylistId,
    startAuth,
    logout,
    getUserPlaylists,
    getPlaylistTracks,
  };
};

export default useSpotifyAuth;
