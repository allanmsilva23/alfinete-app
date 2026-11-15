
import React, { useState } from 'react';

import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { registerStyles } from '../components/componetsStyles/registerStyle';
import { useAuth } from '../src/auth/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, google } = useAuth();
  const next = u => u?.tipo_conta === 'admin' ? '/admin' : u?.tipo_conta === 'brecho' ? '/painel-brecho' : '/feed';
  const finish = data => {
    if(data?.pendente){Alert.alert('Cadastro enviado',data.mensagem||'Aguarde aprovação do administrador. Você será avisado por e-mail.',[{text:'Entendi',onPress:()=>router.replace('/')}]);return;}
    router.replace(next(data.usuario));
  };

  const [accountType, setAccountType] = useState('cliente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==================================================
  // CADASTRO CONVENCIONAL
  // ==================================================

  const handleRegister = async () => {
    if (!acceptedTerms) {
      return Alert.alert(
        'Atenção',
        'Você precisa aceitar os termos de uso!'
      );
    }

    if (!name.trim() || !email.trim()) {
      return Alert.alert(
        'Atenção',
        'Preencha nome e e-mail.'
      );
    }

    if (password !== confirmPassword) {
      return Alert.alert(
        'Atenção',
        'As senhas não coincidem.'
      );
    }

    try {
      setLoading(true);

      const result = await register({
        nome: name.trim(),
        email: email.trim(),
        senha: password,
        tipo_conta: accountType,
        aceitou_termos: true,
      });

      finish(result);
    } catch (error) {
      Alert.alert(
        'Erro no cadastro',
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // CADASTRO COM GOOGLE
  // ==================================================

  const handleGoogleRegister = async () => {
    if (!acceptedTerms) {
      return Alert.alert(
        'Atenção',
        'Aceite os termos antes de cadastrar com Google.'
      );
    }

    try {
      setLoading(true);

      const result = await google(
        'cadastro',
        accountType,
        true
      );

      finish(result);
    } catch (error) {
      Alert.alert(
        'Erro no cadastro Google',
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // INTERFACE
  // ==================================================

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#FFFDF9',
      }}
      edges={['bottom', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={[
          registerStyles.container,
          { flex: 1 },
        ]}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          contentContainerStyle={registerStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Logo */}
          <View style={registerStyles.logoContainer}>
            <Image
              source={require('../assets/images/alfineteLogoAndroid.png')}
              style={registerStyles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Seletor de tipo de conta */}
          <View style={registerStyles.selectorContainer}>
            <TouchableOpacity
              style={[
                registerStyles.selectorButton,
                accountType === 'cliente' &&
                  registerStyles.selectorButtonActive,
              ]}
              onPress={() => setAccountType('cliente')}
              disabled={loading}
            >
              <Text
                style={[
                  registerStyles.selectorText,
                  accountType === 'cliente' &&
                    registerStyles.selectorTextActive,
                ]}
              >
                Sou Cliente
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                registerStyles.selectorButton,
                accountType === 'brecho' &&
                  registerStyles.selectorButtonActive,
              ]}
              onPress={() => setAccountType('brecho')}
              disabled={loading}
            >
              <Text
                style={[
                  registerStyles.selectorText,
                  accountType === 'brecho' &&
                    registerStyles.selectorTextActive,
                ]}
              >
                Sou Brechó
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cadastro Google */}
          <TouchableOpacity
            style={registerStyles.googleButton}
            onPress={handleGoogleRegister}
            disabled={loading}
          >
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
              }}
              style={registerStyles.googleIcon}
            />

            <Text style={registerStyles.googleButtonText}>
              {accountType === 'cliente'
                ? 'Cadastrar Cliente com Google'
                : 'Cadastrar Brechó com Google'}
            </Text>
          </TouchableOpacity>

          {/* Divisor */}
          <View style={registerStyles.dividerContainer}>
            <View style={registerStyles.dividerLine} />

            <Text style={registerStyles.dividerText}>
              ou digite seus dados
            </Text>

            <View style={registerStyles.dividerLine} />
          </View>

          {/* Nome */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.label}>
              {accountType === 'cliente'
                ? 'Nome'
                : 'Nome do Brechó'}
            </Text>

            <View style={registerStyles.inputWrapper}>
              <Feather
                name={
                  accountType === 'cliente'
                    ? 'user'
                    : 'shopping-bag'
                }
                size={18}
                color="#D8C5B3"
                style={registerStyles.inputIcon}
              />

              <TextInput
                style={registerStyles.input}
                placeholder={
                  accountType === 'cliente'
                    ? 'Seu nome completo'
                    : 'Nome da sua loja'
                }
                placeholderTextColor="#C7B6A5"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          {/* Email */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.label}>
              Email
            </Text>

            <View style={registerStyles.inputWrapper}>
              <Feather
                name="mail"
                size={18}
                color="#D8C5B3"
                style={registerStyles.inputIcon}
              />

              <TextInput
                style={registerStyles.input}
                placeholder="seuemail@exemplo.com"
                placeholderTextColor="#C7B6A5"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.label}>
              Senha
            </Text>

            <View style={registerStyles.inputWrapper}>
              <Feather
                name="lock"
                size={18}
                color="#D8C5B3"
                style={registerStyles.inputIcon}
              />

              <TextInput
                style={registerStyles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#C7B6A5"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={registerStyles.eyeIcon}
              >
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={18}
                  color="#D8C5B3"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmação de senha */}
          <View style={registerStyles.inputGroup}>
            <Text style={registerStyles.label}>
              Confirmar Senha
            </Text>

            <View style={registerStyles.inputWrapper}>
              <Feather
                name="lock"
                size={18}
                color="#D8C5B3"
                style={registerStyles.inputIcon}
              />

              <TextInput
                style={registerStyles.input}
                placeholder="Confirme sua senha"
                placeholderTextColor="#C7B6A5"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={registerStyles.eyeIcon}
              >
                <Feather
                  name={
                    showConfirmPassword
                      ? 'eye'
                      : 'eye-off'
                  }
                  size={18}
                  color="#D8C5B3"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Termos de uso */}
          <TouchableOpacity
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            disabled={loading}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 18,
              gap: 8,
            }}
          >
            <Feather
              name={
                acceptedTerms
                  ? 'check-square'
                  : 'square'
              }
              size={20}
              color="#A06D44"
            />

            <Text
              style={{
                color: '#8A5A38',
                flex: 1,
              }}
            >
              Li e aceito os termos de uso e a política de privacidade.
            </Text>
          </TouchableOpacity>

          {/* Botão cadastrar */}
          <TouchableOpacity
            style={[
              registerStyles.registerButton,
              loading && { opacity: 0.6 },
            ]}
            disabled={loading}
            onPress={handleRegister}
          >
            <Text style={registerStyles.registerButtonText}>
              {loading
                ? 'Cadastrando...'
                : 'Cadastrar'}
            </Text>
          </TouchableOpacity>

          {/* Fazer login */}
          <View style={registerStyles.loginContainer}>
            <Text style={registerStyles.loginText}>
              Já tem cadastro?
            </Text>

            <TouchableOpacity
              onPress={() => router.replace('/')}
            >
              <Text style={registerStyles.loginLink}>
                Fazer login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}