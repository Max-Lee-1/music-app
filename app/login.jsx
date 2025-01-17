// login.jsx
import React, { useEffect, useState } from 'react';
import "../constants/styles.css";
import { View, Text, Button, ImageBackground, Pressable } from 'react-native';
import { StatusBar, Link, Redirect, router } from "expo-router";
import gradientDemo from "../assets/images/gradient-demo.png";
import * as AuthSession from 'expo-auth-session';
import * as AppAuth from "expo-app-auth";
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { makeRedirectUri, useAuthRequest, exchangeCodeAsync } from 'expo-auth-session';
import * as Random from 'expo-random';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useSpotifyAuth from './useSpotifyAuth.jsx';


// ensures  any open web browser session is properly closed 
// and that the authentication flow is completed correctly when the user is redirected back to the app.
WebBrowser.maybeCompleteAuthSession();

const clientId = '990510f4dd5f44e399690dfcde5b5828';
// const redirectUri = "http://localhost:8081/spotify-auth-callback"; //Local
export const redirectUri = `${AuthSession.makeRedirectUri({ useProxy: true })}/spotify-auth-callback`;
const scopes = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-read-recently-played',
  'user-top-read',
  'playlist-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-read-playback-state',
  'user-modify-playback-state',
  'streaming',
  'user-read-currently-playing',];
//const CLIENT_SECRET = '44a44a6cf15f49aaba908f71fdd6bb33';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

export default function LoginScreen() {
  const [userData, setUserData] = useState(null);
  const { loadToken, loadUserProfile, fetchAndSaveUserProfile, loginAndSaveUser, checkUserRole } = useSpotifyAuth();
  const [request, response, promptAsync] = useAuthRequest(
    {
      responseType: 'code',
      clientId,
      scopes,
      usePKCE: true,
      redirectUri,
    },
    discovery
  );

  useEffect(() => {
    console.log("RedirectURI: " + redirectUri);
    const initializeAuth = async () => {
      console.log("Initiate Auth");
      await loadToken();
      await loadUserProfile();
      await checkExistingUser();

    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (response?.type === 'success') {
      console.log("Success");
      const { code } = response.params;
      console.log("Response.params " + code)
      exchangeCodeForToken(code);
    }
  }, [response]);


  // Getting and saving access token
  async function exchangeCodeForToken(code) {
    try {
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId,
          code,
          redirectUri,
          extraParams: {
            code_verifier: request?.codeVerifier,
          },
        },
        discovery
      );

      if (tokenResult.accessToken) {
        await AsyncStorage.setItem('token', tokenResult.accessToken);
        const userData = await fetchAndSaveUserProfile(tokenResult.accessToken);

        if (userData) {
          await loginAndSaveUser(tokenResult.accessToken, userData, tokenResult.expiresIn);
          checkUserRole(userData);
          router.replace('/');
        } else {
          console.error('Failed to fetch user data');
        }
      } else {
        console.error('No access token received');
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
    }
  }

  async function fetchAndSaveUser(accessToken) {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      console.log("Data: " + data)
      setUserData(data);
      await AsyncStorage.setItem("userData", JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async function checkExistingUser() {
    console.log("Initiate check user exist");

    const storedToken = await AsyncStorage.getItem('token');
    const storedUserData = await AsyncStorage.getItem('userData');

    if (storedToken && storedUserData) {
      const userData = JSON.parse(storedUserData);
      const userRole = await checkUserRole(userData.id);
      if (userRole) {
        // User exists, perform auto-login
        await loginAndSaveUser(storedToken, userData);
        router.replace('/');
      }
    }
  }

  return (
    <>
      <ImageBackground
        source={gradientDemo}
        style={{ width: '100%', height: '100%' }}
        resizeMode='cover'
      >
        <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="items-center justify-center flex-1 w-full h-screen lg:w-1/2 backdrop-blur-lg">
          <Text className="mx-4 my-4 text-4xl font-bold text-center text-white">Welcome To Technify</Text>

          <Pressable
            onPress={() => promptAsync()}
            disabled={!request}
            className="md:w-[25vw] sm:w-[35vw] w-[45vw] border h-[5vh] text-black text-center border-white bg-white font-bold justify-center rounded-2xl drop-shadow-lg my-4 opacity-100 hover:opacity-90">
            Sign in with Spotify</Pressable>

        </View>
      </ImageBackground>
    </>
  );
  /**{userProfile && (
            <Pressable
              className="w-[25vw] border h-[5vh] text-black text-center border-white bg-white font-bold justify-center rounded-2xl drop-shadow-lg my-4">
              Sign in as {userProfile.display_name || 'User'}
            </Pressable>
          )}
          <Pressable className="w-[25vw] border h-[5vh] text-black text-center border-white bg-white font-bold justify-center rounded-2xl drop-shadow-lg my-4">Sign in with Google</Pressable>
          <Pressable className="w-[25vw] border h-[5vh] text-black text-center border-white bg-white font-bold justify-center rounded-2xl drop-shadow-lg my-4">Sign in with Facebook</Pressable>
          <Pressable className="w-[25vw] border h-[5vh] text-black text-center border-white bg-white font-bold justify-center rounded-2xl drop-shadow-lg my-4">Sign in with Apple</Pressable> */
}