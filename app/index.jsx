import { StatusBar } from "expo-status-bar";
import { ImageBackground, Text, View } from "react-native";
import "../constants/styles.css";
import gradientDemo from "../assets/images/gradient-demo.png";

export default function App() {
  return (
    <ImageBackground
      source={gradientDemo}
      style={{ width: '100%', height: '100%' }}
      resizeMode='cover'
    >
      <View className="w-screen h-screen">
        
      </View>
    </ImageBackground>
  );
}
