import React, { useEffect, useState } from 'react';
import { StatusBar } from "expo-status-bar";
import { ImageBackground, Text, View, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import "../constants/styles.css";
import gradientDemo from "../assets/images/gradient-demo.png";
import Setting from "../assets/icons_ver_1_png/setting.png"
import List from "../assets/icons_ver_1_png/List.png"
import Shuffle from "../assets/icons_ver_1_png/Shuffle.png";
import Arrow from "../assets/icons_ver_1_png/Arrows.png";
import Pause from "../assets/icons_ver_1_png/Pause.png";
import Loop from "../assets/icons_ver_1_png/Loop.png";
import SearchModal from './search.jsx';
import UserModal from './user.jsx';
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSpotifyAuth from './useSpotifyAuth.js';

export default function App() {
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const { token, userProfile, loadToken, loadUserProfile } = useSpotifyAuth();
  console.log("index" + userProfile);

  return (
    <>
      <StatusBar style="auto" />
      <ImageBackground
        source={gradientDemo}
        style={{ width: '100%', height: '100%' }}
        resizeMode='cover'
      >

        <View className="flex-1 w-full pt-[5vh] px-[4vw]">
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

        <View className="flex-1 justify-end items-end w-full pb-[5vh] px-[4vw]">
          <View className="flex-row items-start justify-between">
            <Image source={Shuffle} className="mr-3" style={{ width: '1.75rem', height: '1.75rem' }} />
            <Image source={Arrow} className="mx-3 rotate-180" style={{ width: '1.75rem', height: '1.75rem' }} />
            <Image source={Pause} className="mx-3" style={{ width: '1.75rem', height: '1.75rem' }} />
            <Image source={Arrow} className="mx-3 " style={{ width: '1.75rem', height: '1.75rem' }} />
            <Image source={Loop} className="ml-3" style={{ width: '1.75rem', height: '1.75rem' }} />
          </View>
        </View>

      </ImageBackground>
      <SearchModal visible={searchModalVisible} onClose={() => setSearchModalVisible(false)} />
      <UserModal visible={userModalVisible} onClose={() => setUserModalVisible(false)} />


    </>
  );
}