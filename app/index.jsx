//index
import React, { useEffect, useState } from 'react';
import { StatusBar } from "expo-status-bar";
import { ImageBackground, Text, View, Image, TouchableOpacity } from "react-native";
import { Link, router } from "expo-router";
import "../constants/styles.css";
import gradientDemo from "../assets/images/gradient-demo.png";
import Setting from "../assets/icons_ver_1_png/setting.png"
import List from "../assets/icons_ver_2_png/List.png"
import Shuffle from "../assets/icons_ver_1_png/Shuffle.png";
import Arrow from "../assets/icons_ver_1_png/Arrows.png";
import Pause from "../assets/icons_ver_1_png/Pause.png";
import Loop from "../assets/icons_ver_1_png/Loop.png";
import SearchModal from './search.jsx';
import UserModal from './user.jsx';
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSpotifyAuth from './useSpotifyAuth.js';
import { PlayerContext } from './PlayerContext';
import SpotifyPlayback from './SpotifyPlayback';
import { SafeAreaView } from 'react-native-safe-area-context';

function App() {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const { token, userProfile, loadToken, loadUserProfile } = useSpotifyAuth();
  console.log("index" + userProfile);
  const [playingTrack, setPlayingTrack] = useState();
  const [trackUri, setTrackUri] = useState(null);

  useEffect(() => {
    loadToken();
    loadUserProfile();
  }, []);

  /**<ImageBackground
          source={gradientDemo}
          style={{ width: '100%', height: '100%' }}
          resizeMode='cover'
        > 
        */
  return (
    <>
      <PlayerContext >
        <StatusBar style="light" />
        <SafeAreaView className="relative flex-1 w-full" style={{ background: "radial-gradient(#333333, #000000)" }} >
          <View className="flex-1 pt-[5vh] px-[4vw] z-10">
            <View className="flex-row items-start justify-between">
              <TouchableOpacity onPress={() => setUserModalVisible(true)}>

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
              <TouchableOpacity onPress={() => setSearchModalVisible(true)}>
                <Image source={List} className="" style={{ width: '2rem', height: '2rem' }} />
              </TouchableOpacity>
            </View>
          </View>
          <SpotifyPlayback className="justify-end items-end inset-0 z-20" />

        </SafeAreaView>


        <SearchModal visible={searchModalVisible} onClose={() => setSearchModalVisible(false)} />
        <UserModal visible={userModalVisible} onClose={() => setUserModalVisible(false)} />
      </PlayerContext>

    </>
  );
}

export default App;