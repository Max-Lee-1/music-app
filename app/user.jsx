//user.jsx
import React, { useEffect, useState } from 'react';
import "../constants/styles.css";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, Pressable, Button, ActivityIndicator } from 'react-native';
import { useRouter, Link, router } from 'expo-router';
import Delete from "../assets/icons_ver_2_png/Delete.png";
import useSpotifyAuth from './useSpotifyAuth.jsx';

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
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="flex-column md:w-1/3 w-2/3 mt-4 ml-8 md:p-5 p-2 pt-4 rounded-lg max-h-[50vh] backdrop-blur-md">
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                    <>
                        <View className="flex-row items-start justify-between">
                            {userProfile && userProfile.images && userProfile.images[0] ? (
                                <TouchableOpacity onPress={onClose} className="order-1 opacity-100 hover:opacity-50">
                                    <Image
                                        source={{ uri: userProfile.images[0].url }}
                                        className="self-center"
                                        style={{ width: 32, height: 32, borderRadius: 16 }}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={onClose} className="order-1 opacity-100 hover:opacity-50">
                                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#ccc' }} onPress={onClose} />
                                </TouchableOpacity>
                            )}
                            <Text className="self-center order-2 pl-4 text-xl font-bold" style={{ color: "#F2F2F2" }}>
                                Hi, {userProfile && userProfile.display_name ? userProfile.display_name : 'User'}!
                            </Text>
                            <TouchableOpacity onPress={onClose} className="items-end order-3 opacity-100 hover:opacity-50">
                                <Image source={Delete} style={{ width: '1.75rem', height: '1.75rem' }} />
                            </TouchableOpacity>


                        </View>
                        <span className='h-10' />
                        <View className="flex-row items-end self-end" >
                            <TouchableOpacity onPress={logout} className='p-2 text-red-600 rounded-lg opacity-100 hover:opacity-50' style={{ backgroundColor: "#222222" }}>Logout</TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
};

export default UserModal;