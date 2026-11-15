import React, { useCallback, useRef, useState } from 'react';
import { Alert, View, Text, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { profileStyles } from '../components/componetsStyles/profileStyle';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { api, safeImageUrl } from '../src/api/client';
import { useAuth } from '../src/auth/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, ready, logout, refreshUser } = useAuth();
  const [userName, setUserName] = useState('');
  const [lastSavedName, setLastSavedName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [stats, setStats] = useState({ pecas: 0, favoritos: 0, alfinetadas: 0 });
  const [saving, setSaving] = useState(false);
  const nameInputRef = useRef(null);
  useFocusEffect(useCallback(() => {
    if (!ready) return;
    if (!user) { router.replace('/'); return; }
    let alive = true;
    (async () => {
      try {
        const data = await api('/usuarios/me');
        if (alive) {
          setUserName(data.usuario.nome);
          setLastSavedName(data.usuario.nome);
          setProfileImage(safeImageUrl(data.usuario.foto_url));
          setStats(data.estatisticas);
        }
      } catch (error) { if (alive) Alert.alert('Erro ao carregar perfil', error.message); }
    })();
    return () => { alive = false; };
  }, [ready, user?.id]));

  const handleLogout = async () => { await logout(); router.replace('/'); };
  const handleEditImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (result.canceled || !result.assets?.[0]?.uri) return;
      setSaving(true);
      const formData = new FormData();
      formData.append('foto', new File(result.assets[0].uri));
      const data = await api('/usuarios/me/foto', { method: 'POST', body: formData });
      setProfileImage(safeImageUrl(data.usuario.foto_url));
      await refreshUser();
    } catch (error) { Alert.alert('Erro ao salvar foto', error.message); }
    finally { setSaving(false); }
  };
  const handleSaveName = async () => {
    const value = userName.trim();
    if (!value || value === lastSavedName || saving) return;
    try {
      setSaving(true);
      const data = await api('/usuarios/me', { method: 'PATCH', body: { nome: value } });
      setUserName(data.usuario.nome);
      setLastSavedName(data.usuario.nome);
      await refreshUser();
    } catch (error) { Alert.alert('Erro ao salvar nome', error.message); setUserName(lastSavedName); }
    finally { setSaving(false); }
  };
  const imageSource = profileImage ? { uri: profileImage } : require('../assets/images/alfineteLogoAndroid.png');

  return (
    <ScrollView style={profileStyles.container} showsVerticalScrollIndicator={false}>
      <View style={profileStyles.header}>
        <TouchableOpacity style={profileStyles.backButton} onPress={() => router.back()}><Feather name="arrow-left" size={24} color="#A06D44" /></TouchableOpacity>
        <Text style={profileStyles.headerTitle}>Meu Perfil</Text><View style={profileStyles.emptyBox} />
      </View>
      <View style={profileStyles.profileSection}>
        <View style={profileStyles.avatarContainer}>
          <Image source={imageSource} style={profileStyles.avatar} />
          <TouchableOpacity style={profileStyles.editAvatarButton} onPress={handleEditImage} disabled={saving}>
            <Feather name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={profileStyles.nameContainer}>
          <TextInput ref={nameInputRef} style={profileStyles.nameInput} value={userName} onChangeText={setUserName} onBlur={handleSaveName} onSubmitEditing={handleSaveName} returnKeyType="done" editable={!saving} />
          <TouchableOpacity onPress={() => nameInputRef.current?.focus()} style={profileStyles.editNameIcon}><Feather name="edit-2" size={16} color="#C7B6A5" /></TouchableOpacity>
        </View>
        <Text style={profileStyles.userHandle}>@{userName.toLowerCase().replace(/\s/g, '')}</Text>
      </View>
      <View style={profileStyles.statsContainer}>
        <View style={profileStyles.statBox}><Text style={profileStyles.statNumber}>{stats.pecas}</Text><Text style={profileStyles.statLabel}>Peças Enviadas</Text></View>
        <View style={profileStyles.statBox}><Text style={profileStyles.statNumber}>{stats.favoritos}</Text><Text style={profileStyles.statLabel}>Favoritos</Text></View>
        <View style={profileStyles.statBoxLast}><Text style={profileStyles.statNumber}>{stats.alfinetadas}</Text><Text style={profileStyles.statLabel}>Alfinetadas</Text></View>
      </View>
      {user?.tipo_conta === 'admin' && <TouchableOpacity style={{marginHorizontal:20,padding:16,backgroundColor:'#FFFDF9',borderRadius:15,marginBottom:14}} onPress={()=>router.push('/admin')}>
        <Text style={{color:'#A0452C',fontWeight:'bold'}}>Painel do administrador ›</Text>
      </TouchableOpacity>}
      {user?.tipo_conta === 'brecho' && <TouchableOpacity style={{marginHorizontal:20,padding:16,backgroundColor:'#FFFDF9',borderRadius:15,marginBottom:14}} onPress={()=>router.push('/painel-brecho')}>
        <Text style={{color:'#A0452C',fontWeight:'bold'}}>Gerenciar meu brechó ›</Text>
      </TouchableOpacity>}
      {user?.tipo_conta === 'cliente' && <TouchableOpacity style={{marginHorizontal:20,padding:16,marginBottom:14}} onPress={()=>Alert.alert('Excluir conta','Seu login será desativado. Confirmar?',[
        {text:'Cancelar',style:'cancel'},
        {text:'Excluir',style:'destructive',onPress:async()=>{try{await api('/usuarios/me',{method:'DELETE'});await logout();router.replace('/');}catch(e){Alert.alert('Erro',e.message);}}}
      ])}><Text style={{color:'#C95E42'}}>Excluir minha conta</Text></TouchableOpacity>}
      <View style={profileStyles.logoutContainer}>
        <TouchableOpacity style={profileStyles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#E15F41" /><Text style={profileStyles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}