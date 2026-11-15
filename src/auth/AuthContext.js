import React,{createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import {api,session} from '../api/client';
import {googleIdToken} from './firebase';
const AuthContext=createContext(null);
export function AuthProvider({children}){
  const [user,setUser]=useState(null),[ready,setReady]=useState(false);
  const apply=useCallback(async data=>{
    if(data?.pendente)return data;
    await session.save(data);setUser(data.usuario);return data;
  },[]);
  const logout=useCallback(async()=>{await session.clear();setUser(null);},[]);
  const refreshUser=useCallback(async()=>{
    if(!await session.token())return null;
    const data=await api('/auth/me');
    if(data?.usuario){setUser(data.usuario);await session.save({token:await session.token(),usuario:data.usuario});}
    return data?.usuario;
  },[]);
  useEffect(()=>{let alive=true;(async()=>{try{
    const token=await session.token();if(token){const data=await api('/auth/me');if(alive)setUser(data.usuario);}
  }catch(e){if(e.status===401||e.status===403){await session.clear();if(alive)setUser(null);}else{const cached=await session.user();if(alive)setUser(cached);}}
    finally{if(alive)setReady(true);}})();return()=>{alive=false;};},[]);
  const login=useCallback(async(email,senha)=>apply(await api('/auth/login',{method:'POST',body:{email,senha},auth:false})),[apply]);
  const register=useCallback(async(fields)=>apply(await api('/auth/register',{method:'POST',body:fields,auth:false})),[apply]);
  const google=useCallback(async(modo,tipo_conta,aceitou_termos=false)=>{
    const idToken=await googleIdToken();
    return apply(await api('/auth/google',{method:'POST',body:{idToken,modo,tipo_conta,aceitou_termos},auth:false}));
  },[apply]);
  const value=useMemo(()=>({user,ready,login,register,google,logout,refreshUser}),[user,ready,login,register,google,logout,refreshUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(){const ctx=useContext(AuthContext);if(!ctx)throw new Error('Use AuthProvider em app/_layout.js.');return ctx;}
