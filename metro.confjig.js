const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  "react-native": require.resolve("react-native-web"),
  "react-native-web/dist/vendor/react-native/emitter/EventEmitter":
    require.resolve("react-native-web/dist/exports/EventEmitter"),
};

module.exports = defaultConfig;
