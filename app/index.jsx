// index.jsx
import React, { useEffect, useState } from 'react';
import { StatusBar } from "expo-status-bar";
import { View, Image, TouchableOpacity } from "react-native";
import List from "../assets/icons_ver_2_png/List.png"
import "../constants/styles.css"; // NativeWind Config
import UserModal from './user.jsx'; // Modal Page
import SearchModal from './search';
import useSpotifyAuth from './useSpotifyAuth.jsx';
import { PlayerContext } from './PlayerContext';
import SpotifyPlayback from './SpotifyPlayback';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const { userProfile, loadToken, loadUserProfile } = useSpotifyAuth();

  // Loading Successful Token and related details from Spotify API
  useEffect(() => {
    loadToken();
    loadUserProfile();
  }, []);

  return (
    <>
      <PlayerContext >
        <StatusBar style="light" />
        <SafeAreaView className="relative flex-1 w-full" style={{ background: "radial-gradient(#333333, #000000)" }} >
          <View className="flex-1 pt-[5vh] md:px-[4vw] px-[10vw] z-10">
            <View className="flex-row items-start justify-between">
              <TouchableOpacity onPress={() => setUserModalVisible(true)} className="opacity-100 hover:opacity-50">
                {userProfile && userProfile.images && userProfile.images[0] ? (
                  <Image
                    source={{ uri: userProfile.images[0].url }}
                    className=""
                    style={{ width: 32, height: 32, borderRadius: 16 }}
                  />
                ) : (
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ccc' }} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSearchModalVisible(true)} className="opacity-100 hover:opacity-50">
                <Image source={List} className="" style={{ width: '2rem', height: '2rem' }} />
              </TouchableOpacity>
            </View>
          </View>
          <SpotifyPlayback className="inset-0 z-20 items-end justify-end" />
        </SafeAreaView>
        <SearchModal visible={searchModalVisible} onClose={() => setSearchModalVisible(false)} />
        <UserModal visible={userModalVisible} onClose={() => setUserModalVisible(false)} />
      </PlayerContext>

    </>
  );
}