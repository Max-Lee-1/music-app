import React, { useEffect } from 'react';
import "../constants/styles.css";
import { Modal, View, Text, Pressable, StyleSheet, Image, FlatList } from 'react-native';
import Delete from "../assets/icons_ver_1_png/Delete.png";
import { Link } from 'expo-router';
import useSpotifyAuth from './useSpotifyAuth.js';


const SearchModal = ({ visible, onClose }) => {

    const { token, userProfile, userPlaylists, loadToken, loadUserProfile, getUserPlaylists } = useSpotifyAuth();

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


    const renderPlaylistItem = ({ item }) => (
        <View style={{ marginBottom: 10 }}>
            {item.images && item.images.length > 0 && (
                <Image
                    style={{ width: 100, height: 100 }}
                    source={{ uri: item.images[0].url }}
                />
            )}
            <Text>{item.name}</Text>
        </View>
    );


    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="w-full h-full backdrop-blur-md">
                <Pressable onPress={onClose} className="pt-[5vh] px-[4vw] items-end justify-start">
                    <Image source={Delete} style={{ width: 32, height: 32 }} />
                </Pressable>

                {userPlaylists.items ? (
                    <FlatList
                        data={userPlaylists.items}
                        renderItem={renderPlaylistItem}
                        keyExtractor={(item) => item.id}
                        className="grid-flow-row "
                    />
                ) : (
                    <Text>No playlists found</Text>
                )}
            </View>
        </Modal>
    );
};

export default SearchModal;