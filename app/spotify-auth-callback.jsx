// app/spotify-auth-callback.js
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import useSpotifyAuth from '../app/useSpotifyAuth';
import { exchangeCodeForToken } from "../utils/spotifyAuth";


export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    // Store token data in a secure httpOnly cookie
    res.setHeader('Set-Cookie', `spotifyToken=${JSON.stringify(tokenData)}; HttpOnly; Secure; SameSite=Strict; Path=/`);
    res.redirect('/dashboard'); // Redirect to your app's main page
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    res.redirect('/login?error=authentication_failed');
  }
}
