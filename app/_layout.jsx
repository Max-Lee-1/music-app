import React from 'react';
import { StyleSheet } from "react-native";
import { Slot, Stack } from "expo-router";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from "./index";
import Login from "./login";
import SpotifyAuthCallback from "./SpotifyAuthCallback.jsx";

const Stack = createStackNavigator();

export default function RootLayout() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen
          name="SpotifyAuthCallback"
          component={SpotifyAuthCallback}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}