import React, { createContext, useState, useContext } from "react";
import useSpotifyAuth from "./useSpotifyAuth";

const Player = createContext();

const PlayerContext = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const { token } = useSpotifyAuth();

    const playTrack = (track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const pauseTrack = () => {
        setIsPlaying(false);
    };

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <Player.Provider value={{
            currentTrack,
            isPlaying,
            playTrack,
            pauseTrack,
            togglePlayPause,
            setIsPlaying,
            token
        }}>
            {children}
        </Player.Provider>
    );
};

export { PlayerContext, Player };
export const usePlayer = () => useContext(Player);