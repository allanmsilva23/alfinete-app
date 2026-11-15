import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../src/api/client';
import { clearResetToken, setResetToken } from '../src/auth/passwordResetSession';

const colors = {
  bg: '#FAF8F5', paper: '#FFFDF9', main: '#A0452C', brown: '#8A5A38',
  line: '#EAE0D0', soft: '#A69076', ink: '#493F36', error: '#B34332',
};

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [nextSendAt, setNextSendAt] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (step !== 'codigo') return;
    const tick = () => setSeconds(Math.max(0, Math.ceil((nextSendAt - Date.now()) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [step, nextSendAt]);

  async function requestCode(resend = false) {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Digite um e-mail válido para continuar.');
      return;
    }
    if (busy || (resend && nextSendAt > Date.now())) return;
    setBusy(true);
    setError('');
    setNotice('');
    clearResetToken();
    try {
      await api('/auth/forgot-password', {
        method: 'POST', auth: false, body: { email: normalized },
      });
      Keyboard.dismiss();
      setEmail(normalized);
      setCode('');
      setStep('codigo');
      setNextSendAt(Date.now() + 60_000);
      setNotice(resend ? 'Se sua conta permite recuperação, um novo código será enviado.' :
        'Se sua conta permite recuperação por senha, o código chegará ao seu e-mail.');
    } catch (e) {
      setError(e.message || 'Não foi possível solicitar o código.');
    } finally { setBusy(false); }
  }

  async function verifyCode() {
    if (!/^\d{6}$/.test(code)) {
      setError('Digite os seis números do código recebido.');
      return;
    }
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await api('/auth/verify-reset-otp', {
        method: 'POST', auth: false,
        body: { email: email.trim().toLowerCase(), codigo: code },
      });
      if (!response?.reset_token) throw new Error('Não foi possível confirmar o código.');
      setResetToken(response.reset_token);
      Keyboard.dismiss();
      router.replace('/reset-password');
    } catch (e) {
      setError(e.message || 'Não foi possível validar o código.');
    } finally { setBusy(false); }
  }

  const isCode = step === 'codigo';
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.page}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.back} onPress={() => {
            if (isCode) { setStep('email'); setError(''); setNotice(''); }
            else router.replace('/');
          }} accessibilityRole="button">
            <Feather name="arrow-left" size={18} color={colors.brown} />
            <Text style={styles.backText}>{isCode ? 'Alterar e-mail' : 'Voltar ao login'}</Text>
          </TouchableOpacity>

          <Image source={require('../assets/images/alfineteLogoAndroid.png')} resizeMode="contain" style={styles.logo} />
          <View style={styles.progressRow}>
            <View style={[styles.progress, styles.progressDone]} />
            <View style={[styles.progress, isCode && styles.progressDone]} />
            <View style={styles.progress} />
          </View>
          <Text style={styles.stepText}>{isCode ? 'ETAPA 2 DE 3' : 'ETAPA 1 DE 3'}</Text>
          <Text style={styles.title}>{isCode ? 'Confira seu e-mail' : 'Esqueceu sua senha?'}</Text>
          <Text style={styles.subtitle}>
            {isCode
              ? `Digite o código de 6 dígitos enviado para ${email}. Ele vale por 10 minutos.`
              : 'Informe o e-mail da sua conta. Vamos enviar um código para confirmar que é você.'}
          </Text>

          <View style={styles.card}>
            {!isCode ? <>
              <Text style={styles.label}>E-mail cadastrado</Text>
              <View style={styles.field}>
                <Feather name="mail" size={19} color={colors.soft} />
                <TextInput value={email} onChangeText={setEmail}
                  style={styles.input} placeholder="seuemail@exemplo.com"
                  placeholderTextColor={colors.soft} keyboardType="email-address"
                  autoComplete="email" autoCapitalize="none" autoCorrect={false}
                  returnKeyType="send" onSubmitEditing={() => requestCode()} editable={!busy}/>
              </View>
              <TouchableOpacity onPress={() => requestCode()} style={[styles.button, busy && styles.disabled]} disabled={busy}>
                {busy ? <ActivityIndicator color="#FFF" /> : <>
                  <Text style={styles.buttonText}>Enviar código</Text>
                  <Feather name="arrow-right" size={18} color="#FFF" />
                </>}
              </TouchableOpacity>
            </> : <>
              <Text style={styles.label}>Código de verificação</Text>
              <TextInput
                style={styles.codeInput} value={code}
                onChangeText={v => setCode(v.replace(/\D/g, '').slice(0, 6))}
                keyboardType="number-pad" maxLength={6} autoFocus
                autoComplete="one-time-code" textContentType="oneTimeCode"
                placeholder="000000" placeholderTextColor="#D4C7B9"
                accessibilityLabel="Código de seis dígitos" editable={!busy}/>
              <Text style={styles.hint}>O código só pode ser utilizado uma vez.</Text>
              <TouchableOpacity style={[styles.button, busy && styles.disabled]} disabled={busy} onPress={verifyCode}>
                {busy ? <ActivityIndicator color="#FFF" /> : <>
                  <Text style={styles.buttonText}>Confirmar código</Text>
                  <Feather name="check" color="#FFF" size={19} />
                </>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.resendButton} disabled={busy || seconds > 0} onPress={() => requestCode(true)}>
                <Text style={[styles.resendText, seconds > 0 && { opacity: 0.55 }]}>
                  {seconds > 0 ? `Reenviar código em ${seconds}s` : 'Não recebeu? Reenviar código'}
                </Text>
              </TouchableOpacity>
            </>}
            {!!error && <View style={styles.errorBox}><Feather name="alert-circle" size={16} color={colors.error} /><Text style={styles.errorText}>{error}</Text></View>}
            {!!notice && <View style={styles.infoBox}><Feather name="info" size={16} color={colors.brown} /><Text style={styles.infoText}>{notice}</Text></View>}
          </View>

          <View style={styles.securityRow}>
            <Feather name="shield" size={18} color={colors.brown} />
            <Text style={styles.securityText}>Por segurança, não compartilhamos códigos por telefone ou mensagem. Contas criadas somente com Google devem entrar pelo botão Google.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 46, flexGrow: 1 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, alignSelf: 'flex-start' },
  backText: { color: colors.brown, fontSize: 14, fontWeight: '600' },
  logo: { width: 150, height: 92, alignSelf: 'center', marginTop: 8, marginBottom: 12 },
  progressRow: { flexDirection: 'row', gap: 8, marginTop: 2, marginBottom: 12 },
  progress: { flex: 1, height: 5, borderRadius: 10, backgroundColor: colors.line },
  progressDone: { backgroundColor: colors.main },
  stepText: { color: colors.brown, fontSize: 11, fontWeight: '800', letterSpacing: 1.3, marginBottom: 9 },
  title: { color: colors.main, fontSize: 29, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: colors.brown, fontSize: 15, lineHeight: 23, marginBottom: 22 },
  card: { backgroundColor: colors.paper, padding: 20, borderWidth: 1, borderColor: colors.line, borderRadius: 20 },
  label: { color: colors.brown, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  field: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: colors.line, borderRadius: 13, paddingHorizontal: 14 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.ink },
  codeInput: { textAlign: 'center', color: colors.main, fontSize: 31, letterSpacing: 9, fontWeight: '800', paddingVertical: 13, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: '#FFF' },
  hint: { color: colors.soft, fontSize: 12, textAlign: 'center', marginTop: 10 },
  button: { marginTop: 18, paddingVertical: 15, borderRadius: 14, backgroundColor: colors.main, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, minHeight: 53 },
  buttonText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  disabled: { opacity: 0.6 },
  resendButton: { paddingVertical: 17, alignItems: 'center' },
  resendText: { color: colors.main, fontSize: 13, fontWeight: '700' },
  errorBox: { backgroundColor: '#FBE8E4', borderRadius: 10, marginTop: 15, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  errorText: { color: colors.error, fontSize: 13, flex: 1, lineHeight: 19 },
  infoBox: { backgroundColor: '#F6EEE5', borderRadius: 10, marginTop: 15, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  infoText: { color: colors.brown, fontSize: 13, flex: 1, lineHeight: 19 },
  securityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 22, paddingHorizontal: 4 },
  securityText: { color: colors.soft, flex: 1, lineHeight: 20, fontSize: 12 },
});
