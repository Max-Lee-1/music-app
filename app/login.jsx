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
        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="flex-1 w-1/2 h-screen backdrop-blur-lg">
          <Link href="/">
            <Pressable className="items-center justify-center text-lg font-bold text-white">Login</Pressable>
          </Link>
        </View>
      </ImageBackground>
    </>
  );
}