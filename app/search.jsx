// search.jsx
import React, { useEffect, useState } from 'react';
import { ScrollView, Modal, View, Text, Pressable, Image, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { usePlayer } from './PlayerContext';
import useSpotifyAuth from './useSpotifyAuth.jsx';
import Delete from "../assets/icons_ver_2_png/Delete.png";
import Pause from "../assets/icons_ver_2_png/Pause.png";
import Play from "../assets/icons_ver_2_png/Play.png";

const Tab = createMaterialTopTabNavigator();

const SearchModal = ({ visible, onClose }) => {
    const { token, userProfile, userPlaylists, playlistTracks, loadToken, loadUserProfile, getUserPlaylists, getPlaylistTracks } = useSpotifyAuth();
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const { playTrack, currentTrack, isPlaying, togglePlayPause, addToQueue, queue, removeFromQueue } = usePlayer();

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

    const renderTrackItem = ({ item }) => (
        <TouchableOpacity className="flex flex-row items-center justify-between p-2 px-[2vw] border-b border-gray-700 ">
            <Text className="flex-1 mr-2 font-sans text-white truncate">{item.name} - {item.artists.map(artist => artist.name).join(', ')}</Text>
            <TouchableOpacity onPress={() => addToQueue(item)} className="px-2 py-1 bg-gray-700 rounded opacity-100 hover:opacity-50">
                <Text className="font-sans text-xs text-white">Add</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const renderQueueItem = ({ item, index }) => (
        <View className="flex flex-row items-center justify-between p-3 px-[2vw] border-b border-gray-700">
            <Text className="flex-1 mr-2 font-sans text-white truncate">{item.name} - {item.artists.map(artist => artist.name).join(', ')}</Text>
            <View className="flex flex-row">
                <TouchableOpacity onPress={() => currentTrack?.id === item.id ? togglePlayPause() : playTrack(item, index)} className="items-center mr-2 opacity-100 hover:opacity-50">
                    <Image
                        source={currentTrack?.id === item.id && isPlaying ? Pause : Play}
                        className=""
                        style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromQueue(index)} className="items-center self-center opacity-100 hover:opacity-50">
                    <Image
                        source={Delete}
                        className=""
                        style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    const PlaylistScreen = () => {
        const window = useWindowDimensions();
        const getNumColumns = (width) => {
            if (width >= 1024) return 10; // lg screens
            if (width >= 768) return 6;  // md screens
            if (width >= 640) return 5;  // sm screens
            return 3; // xs screens
        };

        const numColumns = getNumColumns(window.width);

        const calculateBorderRadius = (height) => {
            const radius = Math.round(height * 0.025);
            return Math.max(4, radius);
        };

        const renderPlaylistItem = ({ item }) => {
            const imageSize = window.width / numColumns - 16; // Subtracting padding
            const borderRadius = window.width >= 1024 ? 4 : 2;

            return (
                <View className={`flex-1 m-1 ${numColumns > 2 ? 'max-w-[33%]' : 'max-w-[50%]'} `}>
                    <TouchableOpacity onPress={() => handlePlaylistSelect(item.id)} className="p-2 opacity-100 aspect-square hover:opacity-50">
                        {item.images && item.images.length > 0 && (
                            <Image
                                source={{ uri: item.images[0].url }}
                                style={{
                                    width: imageSize,
                                    height: imageSize,
                                    borderRadius: borderRadius,
                                }}
                            />
                        )}
                    </TouchableOpacity>
                    <Text className="pt-2 font-sans font-medium text-center truncate" style={{ color: "#F2F2F2" }}>{item.name}</Text>
                </View>
            );
        };

        return (
            <View className="flex-1">
                <FlatList
                    data={userPlaylists.items}
                    renderItem={renderPlaylistItem}
                    keyExtractor={(item) => item.id}
                    numColumns={numColumns}
                    key={numColumns}
                    className="flex-1"
                    style={{ backgroundColor: "#111111" }}
                />
            </View>
        );
    };

    const PlaylistContentScreen = () => (
        <View className="flex-1" style={{ backgroundColor: "#111111" }}
        >
            {selectedPlaylistId && playlistTracks && playlistTracks.length > 0 ? (
                <FlatList
                    data={playlistTracks}
                    renderItem={renderTrackItem}
                    keyExtractor={(item) => item.id}
                    className="flex-1"
                    style={{ backgroundColor: "#111111" }}

                />
            ) : (
                <Text className="mt-4 font-sans text-center " style={{ color: "#F2F2F2" }}>Select a playlist to view tracks</Text>
            )}
        </View>
    );

    const QueueScreen = () => (
        <View className="flex-1 px-4" style={{ backgroundColor: "#111111" }}
        >
            {queue && queue.length > 0 ? (
                <FlatList
                    data={queue}
                    renderItem={renderQueueItem}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    className="flex-1"
                    style={{ backgroundColor: "#111111" }}

                />
            ) : (
                <Text className="mt-4 text-center text-white fonts-sans">Queue is empty</Text>
            )}
        </View>
    );

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 backdrop-blur-sm">
                <View className="flex-row justify-end pt-[5vh] md:px-[4vw] px-[10vw]">
                    <TouchableOpacity onPress={onClose} className="opacity-100 hover:opacity-50">
                        <Image source={Delete} style={{ width: '2rem', height: '2rem' }} />
                    </TouchableOpacity>
                </View>
                <NavigationContainer
                    independent={true}>
                    <Tab.Navigator
                        screenOptions={{
                            tabBarStyle: { backgroundColor: 'transparent' },
                            tabBarActiveTintColor: '#F2F2F2',
                            tabBarInactiveTintColor: '#B3B3B3',
                            tabBarIndicatorStyle: { backgroundColor: '#F2F2F2' },
                            tabBarLabelStyle: { fontWeight: 'bold' },
                        }}
                    >
                        <Tab.Screen options={{
                            headerStyle: { backgroundColor: 'transparent' },
                        }} name="Playlists" component={PlaylistScreen} />
                        <Tab.Screen name="Tracks" component={PlaylistContentScreen} />
                        <Tab.Screen name="Queue" component={QueueScreen} />
                    </Tab.Navigator>
                </NavigationContainer>
            </View>
        </Modal>
    );
};

export default SearchModal;