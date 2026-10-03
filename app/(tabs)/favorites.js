import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import StoreCard from '../../components/storeCard'; 
import { storeMocks } from '../../mocks/storesMocks';

export default function FavoritesScreen() {
  const [favoriteStores, setFavoriteStores] = useState(storeMocks.slice(0, 2));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.subtitle}>
          {favoriteStores.length} {favoriteStores.length === 1 ? 'brechó guardado' : 'brechós guardados'}
        </Text>
      </View>

      <FlatList
        data={favoriteStores}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <StoreCard
            id={item.id}
            name={item.name}
            address={item.address}
            rating={item.rating}
            tags={item.tags}
            isInitiallyFavorite={true} 
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ainda não guardou nenhum brechó.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5'
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FAF8F5'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A0452C',
  },
  subtitle: {
    fontSize: 14,
    color: '#C7B6A5',
    marginTop: 4
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    color: '#A06D44',
    fontSize: 16,
    textAlign: 'center'
  }
});