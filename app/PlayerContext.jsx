import { createContext, useState, useContext } from "react";

const Player = createContext();

const PlayerContext = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playTrack = (track) => {
        setCurrentTrack(track);
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
        <Player.Provider value={{ currentTrack, isPlaying, playTrack, pauseTrack, togglePlayPause }}>
            {children}
        </Player.Provider>
    );
};

export { PlayerContext, Player };
export const usePlayer = () => useContext(Player);