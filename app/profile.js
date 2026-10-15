import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { profileStyles } from '../components/componetsStyles/profileStyle';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  
  // Estados para controlar a edição
  const [userName, setUserName] = useState('Marina Souza');
  const [profileImage, setProfileImage] = useState('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300');
  const nameInputRef = useRef(null);

  const handleLogout = () => {
    // TODO: ALAN - Inserir lógica de signOut do Firebase aqui
    router.replace('/'); 
  };

  // Lógica para abrir a galeria e mudar a foto no Front-end
  const handleEditImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // TODO: ALAN - Pegar essa URI, fazer upload pro Firebase Storage e atualizar no perfil do usuário
    }
  };

  const handleEditNameClick = () => {
    // Foca no input de texto automaticamente ao clicar no lápis
    nameInputRef.current?.focus();
  };

  const handleSaveName = () => {
    // Essa função roda quando o usuário clica em "Concluído" no teclado ou clica fora do campo
    // TODO: ALAN - Fazer o update no banco de dados com a variável `userName`
    console.log("Nome atualizado para:", userName);
  };

  return (
    <ScrollView style={profileStyles.container} showsVerticalScrollIndicator={false}>
      
      {/* Cabeçalho */}
      <View style={profileStyles.header}>
        <TouchableOpacity style={profileStyles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#A06D44" />
        </TouchableOpacity>
        <Text style={profileStyles.headerTitle}>Meu Perfil</Text>
        <View style={profileStyles.emptyBox} />
      </View>

      {/* Secção da Foto e Nome Editável */}
      <View style={profileStyles.profileSection}>
        
        <View style={profileStyles.avatarContainer}>
          <Image source={{ uri: profileImage }} style={profileStyles.avatar} />
          <TouchableOpacity style={profileStyles.editAvatarButton} onPress={handleEditImage}>
            <Feather name="camera" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Nome Editável */}
        <View style={profileStyles.nameContainer}>
          <TextInput
            ref={nameInputRef}
            style={profileStyles.nameInput}
            value={userName}
            onChangeText={setUserName}
            onBlur={handleSaveName}
            returnKeyType="done"
          />
          <TouchableOpacity onPress={handleEditNameClick} style={profileStyles.editNameIcon}>
            <Feather name="edit-2" size={16} color="#C7B6A5" />
          </TouchableOpacity>
        </View>
        
        {/* Username gerado dinamicamente com base no nome para testar o visual */}
        <Text style={profileStyles.userHandle}>@{userName.toLowerCase().replace(/\s/g, '')}</Text>
      </View>

      {/* Estatísticas */}
      <View style={profileStyles.statsContainer}>
        <View style={profileStyles.statBox}>
          <Text style={profileStyles.statNumber}>14</Text>
          <Text style={profileStyles.statLabel}>Peças Enviadas</Text>
        </View>
        <View style={profileStyles.statBox}>
          <Text style={profileStyles.statNumber}>5</Text>
          <Text style={profileStyles.statLabel}>Favoritos</Text>
        </View>
        <View style={profileStyles.statBoxLast}>
          <Text style={profileStyles.statNumber}>8</Text>
          <Text style={profileStyles.statLabel}>Alfinetadas</Text>
        </View>
      </View>

      {/* Botão de Sair */}
      <View style={profileStyles.logoutContainer}>
        <TouchableOpacity style={profileStyles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#E15F41" />
          <Text style={profileStyles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}