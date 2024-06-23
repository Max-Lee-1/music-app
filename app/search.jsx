import React from 'react';
import "../constants/styles.css";
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Delete from "../assets/icons_ver_1_png/Delete.png";

const SearchModal = ({ visible, onClose }) => {
    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.25)' }} className="flex-1 backdrop-blur-md">
                <View className="">
                    <TouchableOpacity onPress={onClose} className="pt-[5vh] px-[4vw] items-end justify-start ">
                        <Image source={Delete} style={{ width: '2rem', height: '2rem' }} />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default SearchModal;
