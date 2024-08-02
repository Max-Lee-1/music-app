import { createContext, useState, useContext } from "react";
import useSpotifyAuth from "./useSpotifyAuth";

const Player = createContext();

const PlayerContext = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackUri, setTrackUri] = useState(null);
    const { token } = useSpotifyAuth();

    const playTrack = (track) => {
        setCurrentTrack(track);
        setTrackUri(track.uri);
        setIsPlaying(true);
        // Here you would add logic to actually play the track using Spotify SDK
    };

    const pauseTrack = () => {
        setIsPlaying(false);
        // Here you would add logic to pause the track using Spotify SDK
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            pauseTrack();
        } else if (currentTrack) {
            playTrack(currentTrack);
        }
    };

    return (
        <Player.Provider value={{ currentTrack, isPlaying, playTrack, pauseTrack, togglePlayPause, trackUri, setTrackUri }}>
            {children}
        </Player.Provider>
    );
};

export { PlayerContext, Player };
export const usePlayer = () => useContext(Player);