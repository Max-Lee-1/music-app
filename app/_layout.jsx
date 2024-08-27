import React from 'react';
import { StyleSheet } from "react-native";
import { Slot, Stack, Redirect } from "expo-router";
import useSpotifyAuth from './useSpotifyAuth';
export default function RootLayout() {
  const { token } = useSpotifyAuth();

  return (
    <>
      {token ? (
        <Slot />
      ) : (
        <Redirect href="/login" />
      )}
    </>
  );
};



