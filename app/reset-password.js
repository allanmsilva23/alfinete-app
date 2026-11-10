import React, { useState } from 'react';
import {
  ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../src/api/client';
import { clearResetToken, getResetToken } from '../src/auth/passwordResetSession';

const colors = {
  bg: '#FAF8F5', paper: '#FFFDF9', main: '#A0452C', brown: '#8A5A38',
  line: '#EAE0D0', soft: '#A69076', ink: '#493F36', error: '#B34332',
};

export default function ResetPassword() {
  const router = useRouter();
  const [token] = useState(() => getResetToken());
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function save() {
    if (busy) return;
    if (password.length < 8) { setError('Sua senha precisa ter pelo menos 8 caracteres.'); return; }
    if (password !== confirm) { setError('As senhas não coincidem. Confira os dois campos.'); return; }
    if (!token) { setError('Sua confirmação expirou. Solicite outro código.'); return; }
    setError('');
    setBusy(true);
    try {
      await api('/auth/reset-password', {
        method: 'POST', auth: false,
        body: { reset_token: token, nova_senha: password, confirmar_senha: confirm },
      });
      clearResetToken();
      setPassword('');
      setConfirm('');
      Keyboard.dismiss();
      setDone(true);
    } catch (e) { setError(e.message || 'Não foi possível alterar a senha.'); }
    finally { setBusy(false); }
  }

  const passwordField = (label, value, setter, show, toggle) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <Feather name="lock" color={colors.soft} size={19} />
        <TextInput
          value={value} onChangeText={setter} style={styles.input}
          secureTextEntry={!show} autoCapitalize="none" autoCorrect={false}
          placeholder="Digite sua senha" placeholderTextColor={colors.soft}
          autoComplete="new-password" editable={!busy}
        />
        <TouchableOpacity accessibilityRole="button" onPress={toggle} style={{ padding: 7 }}>
          <Feather name={show ? 'eye-off' : 'eye'} size={19} color={colors.brown} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.page} edges={['top','bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => {
            clearResetToken();
            router.replace(done ? '/' : '/forgot-password');
          }}>
            <Feather name="arrow-left" size={18} color={colors.brown} />
            <Text style={styles.backText}>{done ? 'Voltar ao login' : 'Voltar à recuperação'}</Text>
          </TouchableOpacity>
          <Image source={require('../assets/images/alfineteLogoAndroid.png')} style={styles.logo} resizeMode="contain" />

          {done ? <>
            <View style={styles.successCircle}><Feather name="check" size={34} color="#278455" /></View>
            <Text style={[styles.title,{ textAlign:'center' }]}>Senha alterada!</Text>
            <Text style={[styles.subtitle,{ textAlign:'center' }]}>Sua conta está pronta para um novo começo. Entre com seu e-mail e a nova senha.</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}><Text style={styles.buttonText}>Ir para o login</Text><Feather name="arrow-right" size={19} color="#FFF" /></TouchableOpacity>
          </> : !token ? <>
            <Text style={styles.title}>Confirmação expirada</Text>
            <Text style={styles.subtitle}>Para proteger sua conta, confirme um novo código recebido por e-mail.</Text>
            <TouchableOpacity style={styles.button} onPress={() => router.replace('/forgot-password')}><Text style={styles.buttonText}>Solicitar novo código</Text></TouchableOpacity>
          </> : <>
            <View style={styles.progressRow}><View style={styles.progressDone}/><View style={styles.progressDone}/><View style={styles.progressDone}/></View>
            <Text style={styles.stepText}>ETAPA 3 DE 3</Text>
            <Text style={styles.title}>Crie sua nova senha</Text>
            <Text style={styles.subtitle}>Seu e-mail foi confirmado! Escolha uma senha segura e digite-a duas vezes para evitar erros.</Text>
            <View style={styles.card}>
              {passwordField('Nova senha', password, setPassword, showPassword, () => setShowPassword(v => !v))}
              {passwordField('Confirmar nova senha', confirm, setConfirm, showConfirm, () => setShowConfirm(v => !v))}
              <View style={styles.hintRow}><Feather name="shield" size={17} color={colors.brown}/><Text style={styles.hint}>Use pelo menos 8 caracteres. Não reutilize senhas de outras contas.</Text></View>
              {!!error && <View style={styles.errorBox}><Feather name="alert-circle" color={colors.error} size={17}/><Text style={styles.errorText}>{error}</Text></View>}
              <TouchableOpacity style={[styles.button, busy && { opacity: 0.6 }]} onPress={save} disabled={busy}>
                {busy ? <ActivityIndicator color="#FFF"/> : <><Text style={styles.buttonText}>Salvar nova senha</Text><Feather name="check" color="#FFF" size={19}/></>}
              </TouchableOpacity>
            </View>
          </>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 50, flexGrow: 1 },
  back: { flexDirection: 'row', gap: 8, paddingVertical: 10, alignItems: 'center', alignSelf: 'flex-start' },
  backText: { color: colors.brown, fontSize: 14, fontWeight: '600' },
  logo: { width: 150, height: 92, alignSelf: 'center', marginTop: 8, marginBottom: 12 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  progressDone: { flex: 1, height: 5, borderRadius: 8, backgroundColor: colors.main },
  stepText: { color: colors.brown, fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginBottom: 9 },
  title: { fontSize: 29, color: colors.main, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.brown, lineHeight: 23, marginBottom: 22 },
  card: { padding: 20, borderRadius: 20, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  label: { color: colors.brown, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  field: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, borderRadius: 13, backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.line },
  input: { flex: 1, color: colors.ink, fontSize: 15, paddingVertical: 13, paddingLeft: 9 },
  hintRow: { flexDirection: 'row', gap: 9, alignItems: 'flex-start', marginBottom: 4 },
  hint: { fontSize: 12, color: colors.soft, lineHeight: 19, flex: 1 },
  errorBox: { backgroundColor: '#FBE8E4', flexDirection: 'row', gap: 8, padding: 12, borderRadius: 10, marginTop: 14 },
  errorText: { color: colors.error, fontSize: 13, flex: 1, lineHeight: 19 },
  button: { marginTop: 20, paddingHorizontal: 18, minHeight: 52, flexDirection:'row', gap:9, alignItems:'center',justifyContent:'center',borderRadius:14,backgroundColor:colors.main },
  buttonText: { color:'#FFF', fontSize:15, fontWeight:'800' },
  disabled: { opacity:.6 },
  successCircle: { alignSelf:'center', width:86, height:86, borderRadius:43, backgroundColor:'#E2F5EA', justifyContent:'center', alignItems:'center', marginVertical:18 },
});
