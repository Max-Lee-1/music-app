// screens/LoginScreen.js
import React from 'react';
import "../constants/styles.css";
import { View, Text, Button, ImageBackground, Pressable } from 'react-native';
import { StatusBar, Link } from "expo-router";
import gradientDemo from "../assets/images/gradient-demo.png";


export default function LoginScreen() {
  return (
    <>
      <ImageBackground
        source={gradientDemo}
        style={{ width: '100%', height: '100%' }}
        resizeMode='cover'
      >
        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="items-center justify-center flex-1 w-1/2 h-screen backdrop-blur-lg">
          <Text className="my-4 text-4xl font-bold text-center text-white">Welcome To NAME</Text>

          <Pressable className="w-[25vw] border h-[5vh] text-black text-center border-white bg-white font-bold justify-center rounded-2xl drop-shadow-lg my-4">Sign in with Spotify</Pressable>
          <Pressable className="w-[25vw] border h-[5vh] text-black text-center border-white bg-white font-bold justify-center rounded-2xl drop-shadow-lg my-4">Sign in with Google</Pressable>
          <Pressable className="w-[25vw] border h-[5vh] text-black text-center border-white bg-white font-bold justify-center rounded-2xl drop-shadow-lg my-4">Sign in with Facebook</Pressable>
          <Pressable className="w-[25vw] border h-[5vh] text-black text-center border-white bg-white font-bold justify-center rounded-2xl drop-shadow-lg my-4">Sign in with Apple</Pressable>



          <Link href="/">
            <Pressable className="items-center justify-center text-lg font-bold text-center text-white">Login</Pressable>
          </Link>
        </View>
      </ImageBackground>
    </>
  );
}