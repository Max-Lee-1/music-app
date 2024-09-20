import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { router } from 'expo-router';
import useSpotifyAuth from '../../app/useSpotifyAuth';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('axios');
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      upsert: jest.fn(),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
}));

describe('useSpotifyAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loadToken should set token and expiration if valid', async () => {
    const mockToken = 'valid-token';
    const mockExpiration = Date.now() + 3600000; // 1 hour in the future

    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve(mockToken);
      if (key === 'tokenExpiration') return Promise.resolve(mockExpiration.toString());
      return Promise.resolve(null);
    });

    const { result, waitForNextUpdate } = renderHook(() => useSpotifyAuth());

    await waitForNextUpdate();

    expect(result.current.token).toBe(mockToken);
    expect(result.current.tokenExpiration).toBe(mockExpiration);
  });

  test('loadToken should call logout if token is expired', async () => {
    const mockToken = 'expired-token';
    const mockExpiration = Date.now() - 3600000; // 1 hour in the past

    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'token') return Promise.resolve(mockToken);
      if (key === 'tokenExpiration') return Promise.resolve(mockExpiration.toString());
      return Promise.resolve(null);
    });

    const { result, waitForNextUpdate } = renderHook(() => useSpotifyAuth());

    await waitForNextUpdate();

    expect(result.current.token).toBe(null);
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  test('logout should clear token, expiration, and user data', async () => {
    const { result } = renderHook(() => useSpotifyAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('token');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('tokenExpiration');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('userData');
    expect(result.current.token).toBe(null);
    expect(result.current.tokenExpiration).toBe(null);
    expect(result.current.userProfile).toBe(null);
    expect(router.replace).toHaveBeenCalledWith('/login');
  });

  test('getUserPlaylists should fetch and set user playlists', async () => {
    const mockToken = 'valid-token';
    const mockUserId = 'user123';
    const mockPlaylists = { items: [{ id: 'playlist1' }, { id: 'playlist2' }] };

    AsyncStorage.getItem.mockResolvedValue(mockToken);
    axios.mockResolvedValue({ data: mockPlaylists });

    const { result } = renderHook(() => useSpotifyAuth());
    result.current.userProfile = { id: mockUserId };

    await act(async () => {
      await result.current.getUserPlaylists();
    });

    expect(axios).toHaveBeenCalledWith({
      method: 'get',
      url: `https://api.spotify.com/v1/users/${mockUserId}/playlists`,
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });
    expect(result.current.userPlaylists).toEqual(mockPlaylists);
  });

  test('getPlaylistTracks should fetch and set tracks for a playlist', async () => {
    const mockToken = 'valid-token';
    const mockPlaylistId = 'playlist123';
    const mockTracks = { items: [{ track: { id: 'track1' } }, { track: { id: 'track2' } }] };

    AsyncStorage.getItem.mockResolvedValue(mockToken);
    axios.mockResolvedValue({ data: mockTracks });

    const { result } = renderHook(() => useSpotifyAuth());

    await act(async () => {
      await result.current.getPlaylistTracks(mockPlaylistId);
    });

    expect(axios).toHaveBeenCalledWith({
      method: 'get',
      url: `https://api.spotify.com/v1/playlists/${mockPlaylistId}/tracks`,
      headers: {
        Authorization: `Bearer ${mockToken}`,
      },
    });
    expect(result.current.playlistTracks).toEqual(mockTracks.items.map(item => item.track));
    expect(result.current.selectedPlaylistId).toBe(mockPlaylistId);
  });

  test('loginAndSaveUser should set token, expiration, and user profile', async () => {
    const mockToken = 'new-token';
    const mockProfile = { id: 'user123', email: 'user@example.com' };
    const mockExpiresIn = 3600;

    const { result } = renderHook(() => useSpotifyAuth());

    await act(async () => {
      await result.current.loginAndSaveUser(mockToken, mockProfile, mockExpiresIn);
    });

    expect(result.current.token).toBe(mockToken);
    expect(result.current.userProfile).toEqual(mockProfile);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('tokenExpiration', expect.any(String));
  });

  // Add more tests for other functions as needed
});