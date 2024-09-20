// fonts.jsx - relate to tailwind config
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';

export default function App() {
    let [fontsLoaded] = useFonts({
        'Helvetica': require('./assets/fonts/Helvetica.ttf'),
        'Arial': require('./assets/fonts/Arial.ttf'),
    });

    if (!fontsLoaded) {
        return <AppLoading />;
    }

    return (
        <View className="font-sans">
            <Text>Text with Helvetica or Arial</Text>
        </View>
    );
}
