// SpotifyPlayback.jsx
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

export default function SpotifyPlayback() {
  const { token, checkUserRole, userProfile } = useSpotifyAuth();
  const { currentTrack, isPlaying, togglePlayPause, setIsPlaying, queue } = usePlayer();
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [userRole, setUserRole] = useState(null);
  const audioContext = useRef(null);
  const analyser = useRef(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (token && userProfile) {
        const role = await checkUserRole(userProfile);
        console.log("User role:", role);
        setUserRole(role);
      }
    };
    fetchUserRole();
  }, [token, userProfile]);

  useEffect(() => {
    if (!token) return;

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'React Native Expo Web Player',
        getOAuthToken: cb => { cb(token); },
      });

      setPlayer(player);

      player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
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

  useEffect(() => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      analyser.current.fftSize = 512;
    }

    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (player) {
      player.addListener('player_state_changed', (state) => {
        if (state) {
          setIsPlaying(!state.paused);
          if (state.track_window.current_track.id !== currentTrack?.id) {
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
      <AudioVisualizer
        audioContext={audioContext.current}
        analyser={analyser.current}
        isPlaying={isPlaying}
      />
      {userRole === 'admin' ? (
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
      ) : (
        <View>
          {currentTrack && (
            <Text>Now playing: {currentTrack.name} by {currentTrack.artists[0].name}</Text>
          )}
        </View>
      )}
    </View>
  );
}