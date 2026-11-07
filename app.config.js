// Arquivo novo na raiz do frontend. Preserva o app.json atual.
// Usar CHAVES DIFERENTES para Android e iOS em producao (restricoes Google Cloud).
export default ({ config }) => {
  const common = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY;
  const androidKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY || common;
  const iosKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_KEY || common;

  return {
    ...config,
    plugins: [
      ...(config.plugins || []).filter(entry => {
        const name = Array.isArray(entry) ? entry[0] : entry;
        return name !== 'react-native-maps' && name !== 'expo-location';
      }),
      ['react-native-maps', {
        androidGoogleMapsApiKey: androidKey,
        iosGoogleMapsApiKey: iosKey,
      }],
      ['expo-location', {
        locationWhenInUsePermission: 'Permita que o Alfinete encontre brechós próximos de você.',
      }],
    ],
  };
};
