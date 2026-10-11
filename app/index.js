import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { loginStyles } from '../components/componetsStyles/loginStyle';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Função provisória para o Front-end: pular direto para o Feed
  const handleLogin = () => {
    // TODO: ALAN - Aqui entrará a lógica de autenticação do Firebase (signInWithEmailAndPassword)
    router.replace('/feed');
  };

  return (
    <KeyboardAvoidingView 
      style={loginStyles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={loginStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Logo */}
        {/* Logo Container com as bolinhas de fundo */}
        <View style={loginStyles.logoContainer}>
          <View style={loginStyles.circleOne} />
          <View style={loginStyles.circleTwo} />
          <View style={loginStyles.circleThree} />

          <Image 
            source={require('../assets/images/alfineteLogoAndroid.png')} 
            style={loginStyles.logo} 
            resizeMode="contain" 
          />
        </View>

        {/* Botão Google */}
        <TouchableOpacity style={loginStyles.googleButton}>
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }}
            style={loginStyles.googleIcon} 
          />
          <Text style={loginStyles.googleButtonText}>Entrar com Google</Text>
        </TouchableOpacity>

        {/* Divisor "ou" */}
        <View style={loginStyles.dividerContainer}>
          <View style={loginStyles.dividerLine} />
          <Text style={loginStyles.dividerText}>ou</Text>
          <View style={loginStyles.dividerLine} />
        </View>

        {/* Campo de Email */}
        <View style={loginStyles.inputGroup}>
          <Text style={loginStyles.label}>Email</Text>
          <View style={loginStyles.inputWrapper}>
            <Feather name="mail" size={18} color="#D8C5B3" style={loginStyles.inputIcon} />
            <TextInput 
              style={loginStyles.input}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#C7B6A5"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        {/* Campo de Senha */}
        <View style={loginStyles.inputGroup}>
          <Text style={loginStyles.label}>Senha</Text>
          <View style={loginStyles.inputWrapper}>
            <Feather name="lock" size={18} color="#D8C5B3" style={loginStyles.inputIcon} />
            <TextInput 
              style={loginStyles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#C7B6A5"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)} 
              style={loginStyles.eyeIcon}
            >
              <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#D8C5B3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Esqueceu a senha */}
        <TouchableOpacity>
          <Text style={loginStyles.forgotPasswordText}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        {/* Botão Entrar */}
        <TouchableOpacity style={loginStyles.loginButton} onPress={handleLogin}>
          <Text style={loginStyles.loginButtonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Fazer Cadastro */}
        <View style={loginStyles.registerContainer}>
          <Text style={loginStyles.registerText}>Não tem cadastro?</Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={loginStyles.registerLink}>Fazer cadastro</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}