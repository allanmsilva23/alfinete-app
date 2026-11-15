
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  addFavorite,
  removeFavorite,
  isFavorite,
} from '../src/api/favorites';

import { useAuth } from '../src/auth/AuthContext';

export default function FavoriteToggle({
  storeId,
  style,
  size = 20,
  initialFavorite = null,
  onChange,
}) {
  const router = useRouter();
  const { user } = useAuth();

  const [favorite, setFavorite] = useState(
    initialFavorite === true
  );

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Somente clientes podem utilizar os favoritos.
  // Visitantes ainda podem visualizar o botão e
  // receber a opção de entrar na conta.
  const isLoggedIn = Boolean(user);
  const isClient = user?.tipo_conta === 'cliente';
  const canUseFavorites = !isLoggedIn || isClient;

  // ==================================================
  // CONSULTAR SE O BRECHÓ ESTÁ NOS FAVORITOS
  // ==================================================

  useEffect(() => {
    let active = true;

    const loadFavorite = async () => {
      // Impede consultas por brechós e administradores.
      if (!isClient || !storeId) {
        if (active) {
          setFavorite(false);
          setChecking(false);
        }
        return;
      }

      if (initialFavorite !== null) {
        if (active) {
          setFavorite(initialFavorite === true);
          setChecking(false);
        }
        return;
      }

      try {
        setChecking(true);

        const result = await isFavorite(storeId);

        if (active) {
          setFavorite(result === true);
        }
      } catch (error) {
        if (active) {
          console.error(
            'Erro ao consultar favorito:',
            error
          );
        }
      } finally {
        if (active) {
          setChecking(false);
        }
      }
    };

    loadFavorite();

    return () => {
      active = false;
    };
  }, [isClient, user?.id, storeId, initialFavorite]);

  // ==================================================
  // ADICIONAR OU REMOVER FAVORITO
  // ==================================================

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        'Login necessário',
        'Entre na sua conta para adicionar brechós aos favoritos.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Entrar',
            onPress: () => router.push('/'),
          },
        ]
      );
      return;
    }

    // Proteção adicional contra outros perfis.
    if (!isClient) {
      return;
    }

    if (loading || checking || !storeId) {
      return;
    }

    const nextFavorite = !favorite;

    try {
      setLoading(true);

      if (nextFavorite) {
        await addFavorite(storeId);
      } else {
        await removeFavorite(storeId);
      }

      setFavorite(nextFavorite);
      onChange?.(nextFavorite);
    } catch (error) {
      console.error(
        'Erro ao atualizar favorito:',
        error
      );

      Alert.alert(
        'Erro ao atualizar favoritos',
        error.message || 'Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // VISIBILIDADE POR TIPO DE CONTA
  // ==================================================

  // Brechós e administradores não visualizam
  // o botão de favoritos.
  if (!canUseFavorites) {
    return null;
  }

  return (
    <TouchableOpacity
      style={style}
      onPress={handleToggleFavorite}
      disabled={loading || checking}
      accessibilityRole="button"
      accessibilityLabel={
        favorite
          ? 'Remover dos favoritos'
          : 'Adicionar aos favoritos'
      }
      activeOpacity={0.7}
    >
      <Ionicons
        name={favorite ? 'heart' : 'heart-outline'}
        size={size}
        color={
          favorite
            ? '#E15F41'
            : '#A06D44'
        }
      />
    </TouchableOpacity>
  );
}