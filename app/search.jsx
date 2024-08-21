import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import "../constants/styles.css";
import { Modal, View, Text, Pressable, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import Delete from "../assets/icons_ver_1_png/Delete.png";
import { Link } from 'expo-router';
import useSpotifyAuth from './useSpotifyAuth.js';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { usePlayer } from './PlayerContext';
import Pause from "../assets/icons_ver_1_png/Pause.png";
import Play from "../assets/icons_ver_1_png/Play.png";


const Tab = createMaterialTopTabNavigator();

const SearchModal = ({ visible, onClose }) => {
    const { token, userProfile, userPlaylists, playlistTracks, loadToken, loadUserProfile, getUserPlaylists, getPlaylistTracks } = useSpotifyAuth();
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [value, setValue] = useState(2);
    const { playTrack, currentTrack, isPlaying, togglePlayPause, addToQueue, queue, removeFromQueue } = usePlayer();

    const renderTrackItem = ({ item }) => (
        <TouchableOpacity className="flex-row items-center justify-between m-2">
            <Text>{item.name} - {item.artists.map(artist => artist.name).join(', ')}</Text>
            <TouchableOpacity onPress={() => addToQueue(item)} className="px-2 py-1 bg-blue-500 rounded">
                <Text className="text-white">Add to Queue</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    useEffect(() => {
        const loadData = async () => {
            await loadToken();
            await loadUserProfile();
        };
        loadData();
    }, []);

    useEffect(() => {
        if (userProfile && userProfile.id) {
            getUserPlaylists();
        }
    }, [userProfile]);

    const handlePlaylistSelect = async (playlistId) => {
        setSelectedPlaylistId(playlistId);
        await getPlaylistTracks(playlistId);
    };

    const renderPlaylistItem = ({ item }) => (
        <View className="m-4 w-[100px]">
            {item.images && item.images.length > 0 && (
                <TouchableOpacity onPress={() => handlePlaylistSelect(item.id)}>
                    <Image
                        className="rounded-lg"
                        style={{ width: 100, height: 100 }}
                        source={{ uri: item.images[0].url }}
                    />
                </TouchableOpacity>
            )}
            <Text className="font-semibold truncate">{item.name}</Text>
        </View>
    );

    function PlaylistScreen() {
        return (
            <View className="flex-1">
                {selectedPlaylistId && playlistTracks && playlistTracks.length > 0 ? (
                    <FlatList
                        data={playlistTracks}
                        renderItem={renderTrackItem}
                        keyExtractor={(item) => item.id}
                        className="flex-1"
                    />
                ) : (
                    <Text>No tracks to display</Text>
                )}
            </View>
        );
    }

    function QueueScreen() {
        const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();

        const renderQueueItem = ({ item, index }) => (
            <View className="flex-row items-center justify-between m-2">
                <Text>{item.name} - {item.artists.map(artist => artist.name).join(', ')}</Text>
                <View className="flex-row">
                    <TouchableOpacity onPress={() => {
                        if (currentTrack?.id === item.id) {
                            togglePlayPause();
                        } else {
                            console.log("playtrack item index search.jsx line 95")
                            playTrack(item, index);
                        }
                    }} className="mr-2">
                        <Image
                            source={currentTrack?.id === item.id && isPlaying ? Pause : Play}
                            style={{ width: 24, height: 24 }}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeFromQueue(index)}>
                        <Image
                            source={Delete}
                            style={{ width: 24, height: 24 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );

        return (
            <View className="flex-1">
                {queue && queue.length > 0 ? (
                    <FlatList
                        data={queue}
                        renderItem={renderQueueItem}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        className="flex-1"
                    />
                ) : (
                    <Text>Queue is empty</Text>
                )}
            </View>
        );
    }

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="flex-col w-full h-full backdrop-blur-md">
                <Pressable onPress={onClose} className="pt-[5vh] px-[4vw] items-end justify-start w-[100vw]">
                    <Image source={Delete} style={{ width: 32, height: 32 }} />
                </Pressable>
                <View className="flex-row flex-1 m-4">
                    {userPlaylists.items ? (
                        <FlatList
                            data={userPlaylists.items}
                            renderItem={renderPlaylistItem}
                            keyExtractor={(item) => item.id}
                            numColumns={5}
                            className="w-[60%] flex-auto"
                        />
                    ) : (
                        <Text>No playlists found</Text>
                    )}
                    <View className="border-l border-black w-[30%] flex-auto mr-4">
                        <NavigationContainer independent={true}>
                            <Tab.Navigator>
                                <Tab.Screen
                                    name="Queue"
                                    component={QueueScreen}
                                />
                                <Tab.Screen name="Playlist" component={PlaylistScreen} />
                            </Tab.Navigator>
                        </NavigationContainer>


                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SearchModal;