import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePlayer } from "./PlayerContext";
import useSpotifyAuth from "./useSpotifyAuth";
import axios from 'axios';

export default function SpotifyPlayback() {
  const { token } = useSpotifyAuth();
  const { currentTrack, isPlaying, togglePlayPause, setIsPlaying } = usePlayer();
  const [player, setPlayer] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

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

  const handleTogglePlayPause = async () => {
    if (!player) return;

    try {
      if (isPlaying) {
        await player.pause();
      } else {
        await player.resume();
      }
      togglePlayPause();
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  if (!token) return null;

  return (
    <View>
      <Text>Spotify Player</Text>
      {currentTrack && (
        <Text>Now playing: {currentTrack.name} by {currentTrack.artists[0].name}</Text>
      )}
      <TouchableOpacity onPress={handleTogglePlayPause}>
        <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
      </TouchableOpacity>
    </View>
  );
}