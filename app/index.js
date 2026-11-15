
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loginStyles } from '../components/componetsStyles/loginStyle';
import { useAuth } from '../src/auth/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const {login, google, user, ready} = useAuth();
  const [loading, setLoading] = useState(false);
  const next = u => u?.tipo_conta === 'admin' ? '/admin' : u?.tipo_conta === 'brecho' ? '/painel-brecho' : '/feed';
  React.useEffect(() => { if(ready && user) router.replace(next(user)); }, [ready,user?.id]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if(!email.trim() || !password) return Alert.alert('Atenção','Informe e-mail e senha.');
    try{setLoading(true);const data=await login(email.trim(),password);router.replace(next(data.usuario));}
    catch(e){Alert.alert('Não foi possível entrar',e.message);}
    finally{setLoading(false);}
  };
  const handleGoogleLogin = async () => {
    try{setLoading(true);const data=await google('login');router.replace(next(data.usuario));}
    catch(e){Alert.alert('Login com Google',e.message);}
    finally{setLoading(false);}
  };

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
          loginStyles.container,
          { flex: 1 },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={loginStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Logo */}
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
          <TouchableOpacity
            style={loginStyles.googleButton}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Image
              source={{
                uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
              }}
              style={loginStyles.googleIcon}
            />

            <Text style={loginStyles.googleButtonText}>
              Entrar com Google
            </Text>
          </TouchableOpacity>

          {/* Divisor */}
          <View style={loginStyles.dividerContainer}>
            <View style={loginStyles.dividerLine} />

            <Text style={loginStyles.dividerText}>
              ou
            </Text>

            <View style={loginStyles.dividerLine} />
          </View>

          {/* E-mail */}
          <View style={loginStyles.inputGroup}>
            <Text style={loginStyles.label}>
              Email
            </Text>

            <View style={loginStyles.inputWrapper}>
              <Feather
                name="mail"
                size={18}
                color="#D8C5B3"
                style={loginStyles.inputIcon}
              />

              <TextInput
                style={loginStyles.input}
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
          <View style={loginStyles.inputGroup}>
            <Text style={loginStyles.label}>
              Senha
            </Text>

            <View style={loginStyles.inputWrapper}>
              <Feather
                name="lock"
                size={18}
                color="#D8C5B3"
                style={loginStyles.inputIcon}
              />

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
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={18}
                  color="#D8C5B3"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Esqueceu a senha */}
          <TouchableOpacity onPress={() => router.push('/forgot-password')}>
            <Text style={loginStyles.forgotPasswordText}>
              Esqueceu a senha?
            </Text>
          </TouchableOpacity>

          {/* Entrar */}
          <TouchableOpacity
            style={loginStyles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={loginStyles.loginButtonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          {/* Cadastro */}
          <View style={loginStyles.registerContainer}>
            <Text style={loginStyles.registerText}>
              Não tem cadastro?
            </Text>

            <TouchableOpacity
              onPress={() => router.push('/register')}
            >
              <Text style={loginStyles.registerLink}>
                Fazer cadastro
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}