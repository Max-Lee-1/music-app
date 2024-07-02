const createExpoWebpackConfigAsync = require("@expo/webpack-config");

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  config.resolve.alias["react-native"] = "react-native-web";
  config.resolve.alias[
    "react-native-web/dist/vendor/react-native/emitter/EventEmitter"
  ] = "react-native-web/dist/exports/EventEmitter";
  return config;
};
