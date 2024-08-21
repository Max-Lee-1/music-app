//user.jsx
import React, { useEffect, useState } from 'react';
import "../constants/styles.css";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, Pressable, Button, ActivityIndicator } from 'react-native';
import { useRouter, Link, router } from 'expo-router';
import Delete from "../assets/icons_ver_1_png/Delete.png";
import useSpotifyAuth from './useSpotifyAuth.js';

const UserModal = ({ visible, onClose }) => {
    const { logout, userProfile, loadToken, loadUserProfile } = useSpotifyAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeUser = async () => {
            setLoading(true);
            await loadToken();
            await loadUserProfile();
            setLoading(false);
        };
        initializeUser();
    }, []);

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
            id="user"
        >
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="flex-column w-1/3 mt-4 ml-8 p-10 rounded-lg max-h-[50vh] backdrop-blur-md">
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        <View className="flex-row items-start justify-between">
                            <View className="flex-row items-start justify-evenly">
                                {userProfile && userProfile.images && userProfile.images[0] ? (
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
                                <Text className="self-center pl-4 text-xl font-bold">
                                    Hi, {userProfile && userProfile.display_name ? userProfile.display_name : 'User'}!
                                </Text>
                            </View>

                            <TouchableOpacity onPress={onClose} className="items-end self-center">
                                <Image source={Delete} style={{ width: '1.75rem', height: '1.75rem' }} />
                            </TouchableOpacity>
                        </View>
                        <span className='h-10' />
                        <View className="flex-row items-end self-end">
                            <TouchableOpacity onPress={logout} className='p-2 text-red-600 rounded-lg bg-slate-950'>Logout</TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
};

export default UserModal;