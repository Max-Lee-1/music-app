import React from 'react';
import "../constants/styles.css";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, Pressable, Button } from 'react-native';
import { useRouter, Link } from 'expo-router';
import Delete from "../assets/icons_ver_1_png/Delete.png";

const UserModal = ({ visible, onClose }) => {

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
            id="user"
        >
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="flex-1 w-1/3 mt-4 ml-8 rounded-lg h-1/3 backdrop-blur-md">
                <View className="">
                    <TouchableOpacity onPress={onClose} className="items-end justify-start px-8 pt-6 ">
                        <Image source={Delete} style={{ width: '1.75rem', height: '1.75rem' }} />
                    </TouchableOpacity>
                    <View className="items-center justify-center w-20">
                        <Link href="/login" className='p-2 text-red-600 rounded-lg bg-slate-950'>Logout</Link>
                    </View>
                </View>

            </View>
        </Modal>
    );
};

export default UserModal;
