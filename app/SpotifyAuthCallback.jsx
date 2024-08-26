import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import useSpotifyAuth from './useSpotifyAuth';

export default function SpotifyAuthCallback() {
  const navigation = useNavigation();
  const { exchangeCodeForToken } = useSpotifyAuth();

  useEffect(() => {
    const handleRedirect = async (event) => {
      const { path, queryParams } = Linking.parse(event.url);

      if (path === 'spotify-auth-callback' && queryParams.code) {
        try {
          // Note: You'll need to handle passing the codeVerifier here
          // This might involve storing it temporarily or passing it through the navigation
          const success = await exchangeCodeForToken(queryParams.code, /* codeVerifier */);
          if (success) {
            navigation.replace('Home');
          } else {
            throw new Error('Authentication failed');
          }
        } catch (error) {
          console.error('Error during authentication:', error);
          navigation.replace('Login');
        }
      }
    };

    Linking.addEventListener('url', handleRedirect);

    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Processing authentication...</Text>
    </View>
  );
}