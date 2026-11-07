
import React, { useCallback, useState } from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import StoreCard from '../../components/storeCard';
import { listFavorites } from '../../src/api/favorites';
import { useAuth } from '../../src/auth/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';

function parseTags(value) {
  try {
    const result =
      typeof value === 'string'
        ? JSON.parse(value)
        : value;

    return Array.isArray(result)
      ? result.filter(
          (tag) => typeof tag === 'string' && tag.trim()
        )
      : [];
  } catch (error) {
    return [];
  }
}

export default function FavoritesScreen() {
  const router = useRouter();
  const { user, ready } = useAuth();

  const [favoriteStores, setFavoriteStores] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteStores([]);
      return;
    }

    try {
      setLoading(true);

      const favorites = await listFavorites();

      setFavoriteStores(
        Array.isArray(favorites) ? favorites : []
      );
    } catch (error) {
      console.error(
        'Erro ao carregar favoritos:',
        error
      );

      Alert.alert(
        'Erro ao carregar favoritos',
        error.message ||
          'Não foi possível carregar seus brechós favoritos.'
      );
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!ready) {
        return;
      }

      if (!user) {
        setFavoriteStores([]);
        router.replace('/');
        return;
      }

      loadFavorites();
    }, [ready, user?.id, loadFavorites, router])
  );

  const handleFavoriteChange = useCallback(
    (storeId, isFavorite) => {
      if (!isFavorite) {
        setFavoriteStores((previous) =>
          previous.filter(
            (item) => String(item.id) !== String(storeId)
          )
        );
      }
    },
    []
  );

  const renderFavorite = useCallback(
    ({ item }) => {
      const storeId = String(item.id);

      return (
        <StoreCard
          id={storeId}
          name={item.nome || item.name || 'Brechó'}
          address={
            item.endereco_curto ||
            item.address ||
            'Endereço não informado'
          }
          rating={
            item.nota_media != null
              ? Number(item.nota_media)
              : item.rating != null
              ? Number(item.rating)
              : null
          }
          tags={parseTags(item.estilos ?? item.tags)}
          image={
            item.imagem ||
            item.imagem_url ||
            item.image ||
            null
          }
          reviewCount={
            item.total_avaliacoes ??
            item.reviewCount ??
            null
          }
          isInitiallyFavorite={true}
          onFavoriteChange={handleFavoriteChange}
        />
      );
    },
    [handleFavoriteChange]
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading
          ? 'Carregando favoritos...'
          : 'Ainda não guardou nenhum brechó.'}
      </Text>
    </View>
  );

  if (!ready || !user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Favoritos</Text>
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {!ready
              ? 'Carregando...'
              : 'Redirecionando para o login...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Favoritos
        </Text>

        <Text style={styles.subtitle}>
          {favoriteStores.length}{' '}
          {favoriteStores.length === 1
            ? 'brechó guardado'
            : 'brechós guardados'}
        </Text>
      </View>

      <FlatList
        data={favoriteStores}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderFavorite}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadFavorites}
            colors={['#A0452C']}
            tintColor="#A0452C"
          />
        }
        ListEmptyComponent={renderEmpty}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FAF8F5',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A0452C',
  },

  subtitle: {
    fontSize: 14,
    color: '#C7B6A5',
    marginTop: 4,
  },

  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },

  emptyText: {
    color: '#A06D44',
    fontSize: 16,
    textAlign: 'center',
  },
});