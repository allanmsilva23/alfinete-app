import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { registerStyles } from '../components/componetsStyles/registerStyle';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [accountType, setAccountType] = useState('cliente'); 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleRegister = () => {
    if (!acceptedTerms) {
      alert("Você precisa aceitar os termos de uso!");
      return;
    }
    // TODO: ALAN - Criar usuário com email/senha e salvar o `accountType` no banco
    router.replace('/feed');
  };

  const handleGoogleRegister = () => {
    if (!acceptedTerms) {
      alert("Você precisa aceitar os termos de uso antes de usar o Google!");
      return;
    }
    // TODO: ALAN - Autenticar com Google e salvar o `accountType` no banco
    router.replace('/feed');
  };

  return (
    <KeyboardAvoidingView style={registerStyles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={registerStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Logo */}
        <View style={registerStyles.logoContainer}>
          <Image source={require('../assets/images/alfineteLogoAndroid.png')} style={registerStyles.logo} resizeMode="contain" />
        </View>

        {/* 1º PASSO: SELETOR DINÂMICO NO TOPO */}
        <View style={registerStyles.selectorContainer}>
          <TouchableOpacity 
            style={[registerStyles.selectorButton, accountType === 'cliente' && registerStyles.selectorButtonActive]}
            onPress={() => setAccountType('cliente')}
          >
            <Text style={[registerStyles.selectorText, accountType === 'cliente' && registerStyles.selectorTextActive]}>Sou Cliente</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[registerStyles.selectorButton, accountType === 'brecho' && registerStyles.selectorButtonActive]}
            onPress={() => setAccountType('brecho')}
          >
            <Text style={[registerStyles.selectorText, accountType === 'brecho' && registerStyles.selectorTextActive]}>Sou Brechó</Text>
          </TouchableOpacity>
        </View>

        {/* 2º PASSO: BOTÃO GOOGLE DINÂMICO */}
        <TouchableOpacity style={registerStyles.googleButton} onPress={handleGoogleRegister}>
          <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={registerStyles.googleIcon} />
          <Text style={registerStyles.googleButtonText}>
            {accountType === 'cliente' ? 'Cadastrar Cliente com Google' : 'Cadastrar Brechó com Google'}
          </Text>
        </TouchableOpacity>

        <View style={registerStyles.dividerContainer}>
          <View style={registerStyles.dividerLine} />
          <Text style={registerStyles.dividerText}>ou digite seus dados</Text>
          <View style={registerStyles.dividerLine} />
        </View>

        {/* 3º PASSO: FORMULÁRIO MANUAL */}
        <View style={registerStyles.inputGroup}>
          <Text style={registerStyles.label}>
            {accountType === 'cliente' ? 'Nome' : 'Nome do Brechó'}
          </Text>
          <View style={registerStyles.inputWrapper}>
            <Feather name={accountType === 'cliente' ? 'user' : 'shopping-bag'} size={18} color="#D8C5B3" style={registerStyles.inputIcon} />
            <TextInput style={registerStyles.input} placeholder={accountType === 'cliente' ? 'Seu nome completo' : 'Nome da sua loja'} placeholderTextColor="#C7B6A5" value={name} onChangeText={setName} />
          </View>
        </View>

        <View style={registerStyles.inputGroup}>
          <Text style={registerStyles.label}>Email</Text>
          <View style={registerStyles.inputWrapper}>
            <Feather name="mail" size={18} color="#D8C5B3" style={registerStyles.inputIcon} />
            <TextInput style={registerStyles.input} placeholder="seuemail@exemplo.com" placeholderTextColor="#C7B6A5" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>
        </View>

        <View style={registerStyles.inputGroup}>
          <Text style={registerStyles.label}>Senha</Text>
          <View style={registerStyles.inputWrapper}>
            <Feather name="lock" size={18} color="#D8C5B3" style={registerStyles.inputIcon} />
            <TextInput style={registerStyles.input} placeholder="Digite sua senha" placeholderTextColor="#C7B6A5" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={registerStyles.eyeIcon}>
              <Feather name={showPassword ? "eye" : "eye-off"} size={18} color="#D8C5B3" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={registerStyles.inputGroup}>
          <Text style={registerStyles.label}>Confirmar Senha</Text>
          <View style={registerStyles.inputWrapper}>
            <Feather name="lock" size={18} color="#D8C5B3" style={registerStyles.inputIcon} />
            <TextInput style={registerStyles.input} placeholder="Confirme sua senha" placeholderTextColor="#C7B6A5" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={registerStyles.eyeIcon}>
              <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={18} color="#D8C5B3" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Termos de Uso */}
        <TouchableOpacity style={registerStyles.termsContainer} onPress={() => setAcceptedTerms(!acceptedTerms)} activeOpacity={0.8}>
          <View style={[registerStyles.checkbox, acceptedTerms && registerStyles.checkboxActive]}>
            {acceptedTerms && <Feather name="circle" size={12} color="#65E3C1" />}
          </View>
          <Text style={registerStyles.termsText}>
            Estou de acordo com os <Text style={registerStyles.termsLink}>Termos de Uso</Text> e as <Text style={registerStyles.termsLink}>Políticas de Privacidade</Text>.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={registerStyles.registerButton} onPress={handleRegister}>
          <Text style={registerStyles.registerButtonText}>Cadastrar</Text>
        </TouchableOpacity>

        <View style={registerStyles.loginContainer}>
          <Text style={registerStyles.loginText}>Já tem cadastro?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={registerStyles.loginLink}>Fazer login</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}