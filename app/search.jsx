import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import "../constants/styles.css";
import { Modal, View, Text, Pressable, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import Delete from "../assets/icons_ver_1_png/Delete.png";
import { Link } from 'expo-router';
import useSpotifyAuth from './useSpotifyAuth.js';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const renderTrackItem = ({ item }) => (
    <TouchableOpacity className="m-2">
        <Text>{item.name} - {item.artists.map(artist => artist.name).join(', ')}</Text>
    </TouchableOpacity>
);

const SearchModal = ({ visible, onClose }) => {
    const { token, userProfile, userPlaylists, playlistTracks, loadToken, loadUserProfile, getUserPlaylists, getPlaylistTracks } = useSpotifyAuth();
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [value, setValue] = React.useState(1);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };


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
                {selectedPlaylistId && playlistTracks.length > 0 ? (
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
        return (
            <View>
                <Text>Queue is empty</Text>
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

                        {selectedPlaylistId && (
                            <NavigationContainer independent={true} >
                                <Tab.Navigator >
                                    <Tab.Screen name="Queue" component={QueueScreen} />
                                    <Tab.Screen name="Playlist" component={PlaylistScreen} />
                                </Tab.Navigator>
                            </NavigationContainer>
                        )}

                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default SearchModal;