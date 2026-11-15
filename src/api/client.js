import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetch as expoFetch } from 'expo/fetch';

const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'https://alfinete.alwaysdata.net').replace(/\/$/, '');
const TOKEN_KEY = 'alfinete.session.token';
const USER_KEY = 'alfinete.session.user';
const store = {
  get: k => Platform.OS === 'web' ? AsyncStorage.getItem(k) : SecureStore.getItemAsync(k),
  set: (k,v) => Platform.OS === 'web' ? AsyncStorage.setItem(k,v) : SecureStore.setItemAsync(k,v),
  remove: k => Platform.OS === 'web' ? AsyncStorage.removeItem(k) : SecureStore.deleteItemAsync(k),
};
export const session = {
  token: () => store.get(TOKEN_KEY),
  user: async () => { try { const x = await store.get(USER_KEY); return x ? JSON.parse(x) : null; } catch { return null; } },
  save: async ({token,usuario}) => { if (!token || !usuario) throw new Error('Sessão inválida do servidor.'); await store.set(TOKEN_KEY,token); await store.set(USER_KEY,JSON.stringify(usuario)); },
  clear: async () => { await store.remove(TOKEN_KEY); await store.remove(USER_KEY); },
};
export const safeImageUrl = value => {
  if(typeof value!=='string'||!value.trim())return null;
  if(value.startsWith('https://')||value.startsWith('http://'))return value.replace(/^http:\/\/alfinete\.alwaysdata\.net/,'https://alfinete.alwaysdata.net');
  return value.startsWith('/uploads/') ? baseUrl+value : null;
};
export async function api(path,{method='GET',body,headers:extraHeaders={},auth=true}={}) {
  const headers={...extraHeaders};
  const isStatusList = method.toUpperCase()==='GET' &&
    (path.startsWith('/solicitacoes/me') || path.startsWith('/painel-brecho/solicitacoes'));
  if(isStatusList) headers['Cache-Control']='no-cache';
  const requestPath=isStatusList ? `${path}${path.includes('?')?'&':'?'}_at=${Date.now()}` : path;
  if(auth){const token=await session.token();if(token)headers.Authorization=`Bearer ${token}`;}
  const isForm=typeof FormData!=='undefined' && body instanceof FormData;
  if(body!==undefined && !isForm)headers['Content-Type']='application/json';
  let response;
  try { response=await expoFetch(`${baseUrl}${requestPath}`,{method,headers,body:isForm?body:body!==undefined?JSON.stringify(body):undefined, ...(isStatusList ? {cache:'no-store'} : {})}); }
  catch(e){ throw new Error('Sem conexão com o Alfinete. Verifique sua internet e tente novamente.'); }
  const text=await response.text();let json;
  try{json=text?JSON.parse(text):{};}catch{throw new Error('O servidor retornou uma resposta inesperada.');}
  if(!response.ok || json.sucesso===false){
    const err=new Error(json.mensagem||`Erro ${response.status} ao comunicar com o servidor.`);
    err.status=response.status;throw err;
  }
  return json.dados!==undefined?json.dados:json;
}
