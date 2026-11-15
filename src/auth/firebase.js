import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence, GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
const app=getApps().length?getApp():initializeApp(config);
let firebaseAuth;
try {firebaseAuth=Platform.OS==='web'?getAuth(app):initializeAuth(app,{persistence:getReactNativePersistence(AsyncStorage)});}
catch(e){if(e.code==='auth/already-initialized')firebaseAuth=getAuth(app);else throw e;}
export async function googleIdToken() {
  if(Platform.OS==='web')throw new Error('O login Google nativo requer Android ou iOS.');
  const webClientId=process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if(!webClientId)throw new Error('Configure EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.');
  const {GoogleSignin}=require('@react-native-google-signin/google-signin');
  GoogleSignin.configure({webClientId});
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog:true});
  const result=await GoogleSignin.signIn();
  const googleToken=result?.data?.idToken||result?.idToken||(await GoogleSignin.getTokens()).idToken;
  if(!googleToken)throw new Error('Não foi possível obter o token da conta Google.');
  const credential=GoogleAuthProvider.credential(googleToken);
  const authResult=await signInWithCredential(firebaseAuth,credential);
  const token=await authResult.user.getIdToken(true);
  await signOut(firebaseAuth);
  return token;
}