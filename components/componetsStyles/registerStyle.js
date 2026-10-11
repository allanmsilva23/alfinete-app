import { StyleSheet } from 'react-native';

export const registerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 50,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
    height: 50, 
  },
  logo: {
    width: 500, 
    height: 100,
    zIndex: 2,
  },
  googleButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAE0D0',
    paddingVertical: 14, borderRadius: 25, marginBottom: 25,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3,
  },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleButtonText: { fontSize: 15, fontWeight: 'bold', color: '#8A5A38' },
  
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#EAE0D0' },
  dividerText: { marginHorizontal: 15, color: '#C7B6A5', fontSize: 14 },

  selectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F5',
    borderRadius: 25,
    padding: 4,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#EAE0D0',
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C7B6A5',
  },
  selectorTextActive: {
    color: '#A06D44',
  },

  inputGroup: { marginBottom: 15 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#A06D44', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9F0',
    borderWidth: 1, borderColor: '#EAE0D0', borderRadius: 12, paddingHorizontal: 15, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: '#8A5A38' },
  eyeIcon: { padding: 5 },
  
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 25,
    paddingRight: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#65E3C1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#FFF',
  },
  termsText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
  termsLink: {
    color: '#C95E42',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  registerButton: { backgroundColor: '#C95E42', paddingVertical: 16, borderRadius: 25, alignItems: 'center', marginBottom: 20 },
  registerButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 5 },
  loginText: { color: '#888888', fontSize: 13 },
  loginLink: { color: '#C95E42', fontSize: 13, fontWeight: 'bold', textDecorationLine: 'underline', marginLeft: 5 }
});