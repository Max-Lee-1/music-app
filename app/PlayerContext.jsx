import React, { createContext, useState, useContext } from "react";
import useSpotifyAuth from "./useSpotifyAuth";
import axios from 'axios';

const Player = createContext();

const PlayerContext = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [queue, setQueue] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
    const { token } = useSpotifyAuth();

    const playTrack = (track, index) => {
        setCurrentTrack(track);
        setCurrentTrackIndex(index);
        setIsPlaying(true);
    };

    const pauseTrack = () => {
        setIsPlaying(false);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const addToQueue = async (track) => {
        //local queue
        setQueue(prevQueue => [...prevQueue, track]);
        if (queue.length === 0 && !currentTrack) {
            playTrack(track, 0);
        }
        //spotify queue
        try {
            await axios.post(
                `https://api.spotify.com/v1/me/player/queue?uri=${track.uri}`,
                {},
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error adding track to Spotify queue:', error);
        }
    };


    const removeFromQueue = (indexToRemove) => {
        setQueue(prevQueue => prevQueue.filter((_, index) => index !== indexToRemove));
        if (indexToRemove < currentTrackIndex) {
            setCurrentTrackIndex(prevIndex => prevIndex - 1);
        }
    };

    const playNext = () => {
        if (currentTrackIndex < queue.length - 1) {
            const nextTrack = queue[currentTrackIndex + 1];
            playTrack(nextTrack, currentTrackIndex + 1);
        } else {
            setCurrentTrack(null);
            setCurrentTrackIndex(-1);
            setIsPlaying(false);
        }
    };

    const playPrevious = () => {
        if (currentTrackIndex > 0) {
            const previousTrack = queue[currentTrackIndex - 1];
            playTrack(previousTrack, currentTrackIndex - 1);
        }
    };

    return (
        <Player.Provider value={{
            currentTrack,
            isPlaying,
            queue,
            currentTrackIndex,
            playTrack,
            pauseTrack,
            togglePlayPause,
            setIsPlaying,
            addToQueue,
            removeFromQueue,
            playNext,
            playPrevious,
            token
        }}>
            {children}
        </Player.Provider>
    );
};

export { PlayerContext, Player };
export const usePlayer = () => useContext(Player);