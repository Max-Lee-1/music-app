//user.jsx
import React, { useEffect } from 'react';
import "../constants/styles.css";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, Pressable, Button } from 'react-native';
import { useRouter, Link } from 'expo-router';
import Delete from "../assets/icons_ver_1_png/Delete.png";
import useSpotifyAuth from './useSpotifyAuth.js';


const UserModal = ({ visible, onClose }) => {
    const { logout, userProfile, loadToken, loadUserProfile } = useSpotifyAuth();

    useEffect(() => {
        const initializeUser = async () => {
            await loadToken();
            await loadUserProfile();
        };
        initializeUser();
    }, []);

    if (!userProfile) {
        return null; // or a loading indicator
    }


    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
            id="user"
        >
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="flex-column w-1/3 mt-4 ml-8 p-10 rounded-lg max-h-[50vh] backdrop-blur-md">
                <View className="flex-row items-start justify-between">
                    <View className="flex-row items-start justify-evenly">
                        {userProfile.images && userProfile.images[0] ? (
                            <TouchableOpacity onPress={onClose}>
                                <Image
                                    source={{ uri: userProfile.images[0].url }}
                                    className="self-center"
                                    style={{ width: 32, height: 32, borderRadius: 16 }}
                                />
                            </TouchableOpacity>

                        ) : (
                            <TouchableOpacity onPress={onClose}>
                                <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ccc' }} onPress={onClose} />
                            </TouchableOpacity>

                        )}
                        {userProfile && userProfile.display_name ? (
                            <Text className="self-center pl-4 text-xl font-bold">Hi, {userProfile.display_name || 'User'}!</Text>

                        ) : (
                            <Text className="self-center pl-4 text-xl font-bold">Hi, User!</Text>
                        )}
                    </View>

                    <TouchableOpacity onPress={onClose} className="items-end self-center">
                        <Image source={Delete} style={{ width: '1.75rem', height: '1.75rem' }} />
                    </TouchableOpacity>

                </View>
                <span className='h-10' />
                <View className="flex-row items-end self-end">
                    <TouchableOpacity onPress={logout} className='p-2 text-red-600 rounded-lg bg-slate-950'>Logout</TouchableOpacity>
                </View>

            </View>
        </Modal>
    );
};

export default UserModal;
