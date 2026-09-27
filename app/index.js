import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

/*
    Arquivo temporário para desenvolvimento
    Futuramente será substituido pela tela de Login/Cadastro
*/

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Alfinete (Modo Dev)</Text>
      <Text style={styles.subtitle}>A tela de Login/Cadastro entrará aqui no futuro.</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/feed')} 
      >
        <Text style={styles.buttonText}>Acessar o Feed 🚀</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#A06D44',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#00796B',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  }
});