export default ({ config }) => {
  const otherPlugins = (config.plugins || []).filter(entry => {
    const name = Array.isArray(entry) ? entry[0] : entry;
    return !['@maplibre/maplibre-react-native', 'react-native-maps', 'expo-location'].includes(name);
  });
  return {
    ...config,
    plugins: [
      ...otherPlugins,
      '@maplibre/maplibre-react-native',
      ['expo-location', {
        locationWhenInUsePermission: 'Permita que o Alfinete encontre brechós próximos de você.',
      }],
    ],
  };
};