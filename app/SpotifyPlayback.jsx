import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { usePlayer } from "./PlayerContext";
import useSpotifyAuth from "./useSpotifyAuth";
import axios from 'axios';
import Shuffle from "../assets/icons_ver_1_png/Shuffle.png";
import Arrow from "../assets/icons_ver_1_png/Arrows.png";
import Pause from "../assets/icons_ver_1_png/Pause.png";
import Play from "../assets/icons_ver_1_png/Play.png";
import Loop from "../assets/icons_ver_1_png/Loop.png";
import AudioVisualizer from './AudioVisualizer';

// Main SpotifyPlayback component
export default function SpotifyPlayback() {
  // Get token from Spotify auth
  const { token } = useSpotifyAuth();

  // Get player state and functions from PlayerContext
  const { currentTrack, isPlaying, togglePlayPause, setIsPlaying, queue, setCurrentTrack } = usePlayer();

  // State variables
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);

  // Audio context and analyser refs
  const audioContext = useRef(null);
  const analyser = useRef(null);

  const currentTrackRef = useRef(currentTrack);



  // 1st useEffect: Initialize Spotify player SDK
  useEffect(() => {
    if (!token) return;
    // Create script tag for Spotify player SDK
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    // Set up player instance
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'React Native Expo Web Player',
        getOAuthToken: cb => { cb(token); },
      });

      setPlayer(player);

      // Add event listeners for player state changes
      player.addListener('ready', ({ device_id }) => {
        console.log('Line 56 SpotifyPlayback - Ready with Device ID', device_id);
        setDeviceId(device_id);

      });

      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      player.addListener('player_state_changed', (state) => {
        if (state) {
          setIsPlaying(!state.paused);
        }
      });

      player.connect();
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [token]);


  // 2nd useEffect: Play track when player is ready
  useEffect(() => {
    if (!player || !currentTrack || !deviceId) return;

    const playTrack = async () => {
      try {
        await axios.put(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          { uris: [currentTrack.uri] },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error playing track:', error);
      }
    };

    playTrack();
  }, [player, currentTrack, deviceId, token]);

  // 3rd useEffect: Set up audio context and analyser
  useEffect(() => {
    console.log("Running 3rd useEffect in SpotifyPlayback.");
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 256; // Increase this for more accurate loudness measurement
      analyser.current.smoothingTimeConstant = 0.4; // Adjust between 0 and 1 for desired smoothing
    }

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // 4th useEffect: Add event listener for player state changes
  useEffect(() => {
    console.log("Running 4th useEffect in SpotifyPlayback.");
    if (player) {
      player.addListener('player_state_changed', (state) => {
        if (state) {
          setIsPlaying(!state.paused);
          if (state.track_window.current_track.id !== currentTrackRef.current?.id) {
            setCurrentTrack(state.track_window.current_track);
          }
        }
      });
    }
  }, [player]);

  const handleTogglePlayPause = async () => {
    if (!player) return;
    try {
      await player.togglePlay();
      togglePlayPause();
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleToggleShuffle = async () => {
    if (!player) return;
    try {
      const newShuffleState = !isShuffling;
      await axios.put(
        `https://api.spotify.com/v1/me/player/shuffle?state=${newShuffleState}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setIsShuffling(newShuffleState);
    } catch (error) {
      console.error('Error toggling shuffle:', error);
    }
  };

  const handlePreviousTrack = async () => {
    if (!player) return;
    try {
      await player.previousTrack();
    } catch (error) {
      console.error('Error skipping to previous track:', error);
    }
  };

  const handleNextTrack = async () => {
    if (!player) return;
    try {
      await player.nextTrack();
    } catch (error) {
      console.error('Error skipping to next track:', error);
    }
  };

  const handleToggleRepeat = async () => {
    if (!player) return;
    try {
      const newRepeatMode = (repeatMode + 1) % 3;
      await axios.put(
        `https://api.spotify.com/v1/me/player/repeat?state=${['off', 'context', 'track'][newRepeatMode]}`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setRepeatMode(newRepeatMode);
    } catch (error) {
      console.error('Error toggling repeat mode:', error);
    }
  };

  if (!token) return null;

  return (
    <View className="flex-1 ">
      <AudioVisualizer id="audioVisualizer" className="items-center justify-center flex-1 h-0"
        audioContext={audioContext.current}
        analyser={analyser.current}
        isPlaying={isPlaying}
      />
      <>
        <View className="flex-1 justify-end items-end w-full pb-[5vh] px-[4vw]">
          <View className="flex-row items-start justify-between">
            <TouchableOpacity className="mr-3" onPress={handleToggleShuffle}>
              <Image source={Shuffle} style={{ width: 28, height: 28, opacity: isShuffling ? 1 : 0.5 }} />
            </TouchableOpacity>
            <TouchableOpacity className="mx-3" onPress={handlePreviousTrack}>
              <Image source={Arrow} style={{ width: 28, height: 28, transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <TouchableOpacity className="mx-3" onPress={handleTogglePlayPause}>
              <Image source={isPlaying ? Pause : Play} style={{ width: 28, height: 28 }} />
            </TouchableOpacity>
            <TouchableOpacity className="mx-3" onPress={handleNextTrack}>
              <Image source={Arrow} style={{ width: 28, height: 28 }} />
            </TouchableOpacity>
            <TouchableOpacity className="ml-3" onPress={handleToggleRepeat}>
              <Image source={Loop} style={{ width: 28, height: 28, opacity: repeatMode === 0 ? 0.5 : 1 }} />
            </TouchableOpacity>
          </View>
        </View>
        <Text>Spotify Player</Text>
        {currentTrack && (
          <Text>Now playing: {currentTrack.name} by {currentTrack.artists[0].name}</Text>
        )}
      </>
    </View>
  );
}