import { usePlayer } from "./PlayerContext";
import SpotifyWebPlayer from "react-spotify-web-playback";
import useSpotifyAuth from "./useSpotifyAuth";

export default function SpotifyPlayback() {
  const { token } = useSpotifyAuth();
  const { currentTrack, isPlaying, togglePlayPause } = usePlayer();

  if (!token) return null;
  return (
    <SpotifyWebPlayer
      token={token}
      showSaveIcon
      uris={currentTrack ? [currentTrack.uri] : []}
      play={isPlaying}
      callback={state => {
        if (!state.isPlaying) togglePlayPause();
      }}
    />
  );
}