import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Linking, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function StoreProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter(); 
  
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  
  useEffect(() => {
    fetch(`https://alfinete.alwaysdata.net/brechos/${id}`)
      .then((response) => response.json())
      .then((json) => {
        if (json.sucesso) {
          const dados = json.dados;
          const enderecoFormatado = dados.endereco_completo 
            ? `${dados.endereco_completo.logradouro}, ${dados.endereco_completo.numero} - ${dados.endereco_completo.bairro}`
            : 'Endereço não disponível';

          setStore({
            ...dados,
            name: dados.nome,
            description: dados.descricao,
            address: enderecoFormatado,
            whatsapp: dados.telefone,         // Corrigido: Guarda o WhatsApp
            instagram: dados.link_instagram   // Corrigido: Guarda o Instagram
          });

          if (dados.avaliacoes && dados.avaliacoes.length > 0) {
             setReviews(dados.avaliacoes.map((av, index) => ({
               id: index.toString(),
               name: av.nome_usuario,
               rating: av.nota,
               text: av.comentario
             })));
          }
        }
      })
      .catch((error) => console.error("Erro ao carregar detalhes:", error))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSendReview = () => {
    if (!userComment.trim()) {
      Alert.alert('Ops!', 'Escreva um comentário antes de cravar seu alfinete.');
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      name: 'Você',
      rating: userRating,
      text: userComment
    };

    setReviews([newReview, ...reviews]);
    setUserComment('');
    setUserRating(5);
    
    Alert.alert(
      'Alfinetada enviada com sucesso! 📌',
      'Muito obrigado por contribuir! Sua opinião ficou afiada e já está costurada no mural da comunidade!'
    );
  };

  const openApp = (type) => {
    if (!store) return;

    if (type === 'whatsapp') {
      const numero = store.whatsapp; 
      if (numero) {
        const numeroLimpo = String(numero).replace(/\D/g, ''); 
        const urlFinal = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
        Linking.openURL(`https://wa.me/${urlFinal}`);
      } else {
        Alert.alert('Aviso', 'Este brechó não disponibilizou um contacto de WhatsApp.');
      }
    } else if (type === 'instagram') {
      const insta = store.instagram; 
      if (insta) {
        const url = insta.startsWith('http') 
          ? insta 
          : `https://instagram.com/${insta.replace('@', '')}`;
        Linking.openURL(url);
      } else {
        Alert.alert('Aviso', 'Este brechó não disponibilizou um Instagram.');
      }
    } else if (type === 'maps') {
      if (store.address && store.address !== 'Endereço não disponível') {
        const query = encodeURIComponent(store.address);
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
      } else {
        Alert.alert('Aviso', 'Endereço indisponível para navegação no mapa.');
      }
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.coverContainer}>
        <Image source={{ uri: store?.imagem || 'https://via.placeholder.com/400x250' }} style={styles.coverImage} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#A06D44" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.storeName}>{store?.name}</Text>
          <TouchableOpacity style={styles.heartButton} onPress={() => setIsFavorite(!isFavorite)}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#E15F41" : "#A06D44"} />
          </TouchableOpacity>
        </View>
        <Text style={styles.description}>{store?.description}</Text>

        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="location" size={16} color="#D32F2F" /></View>
            <Text style={styles.infoTitle}>Endereço</Text>
          </View>
          <Text style={styles.infoText}>{store?.address}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="time-outline" size={16} color="#A06D44" /></View>
            <Text style={styles.infoTitle}>Horário de Funcionamento</Text>
          </View>
          <View style={styles.rowBetween}><Text style={styles.infoText}>Terça - Sexta</Text><Text style={styles.infoBoldText}>13h - 17h</Text></View>
          <View style={styles.rowBetween}><Text style={styles.infoText}>Final de semana - Segunda</Text><Text style={styles.infoClosedText}>Fechado</Text></View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.iconBox}><Ionicons name="pricetag-outline" size={16} color="#A06D44" /></View>
            <Text style={styles.infoTitle}>Preço Médio</Text>
          </View>
          <Text style={styles.subText}>Faixa de preço: <Text style={styles.infoBoldText}>R$ 30 - R$ 80</Text></Text>
          <View style={styles.priceBarContainer}>
            <View style={[styles.priceBarActive, { flex: 2 }]} /><View style={[styles.priceBarInactive, { flex: 3 }]} />
          </View>
          <Text style={styles.tinyText}>$$ - Acessível a moderado</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.ruleIconBox}><Ionicons name="checkbox-outline" size={16} color="#FFFFFF" /></View>
            <Text style={styles.infoTitle}>Regras de Avaliação de Roupas</Text>
          </View>
          <Text style={styles.ruleItem}>✓ Peças devem estar limpas e sem manchas visíveis</Text>
          <Text style={styles.ruleItem}>✓ Sem rasgos, furos ou costuras desfeitas</Text>
          <Text style={styles.ruleItem}>✓ Máximo de 5 peças por avaliação</Text>
        </View>

        <TouchableOpacity style={styles.buttonWrapper} onPress={() => openApp('instagram')}>
          <LinearGradient colors={['#D97743', '#E3A642']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
            <Feather name="instagram" size={20} color="#FFF" />
            <Text style={styles.contactButtonText}>  Abrir Instagram</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonWrapper} onPress={() => openApp('whatsapp')}>
          <LinearGradient colors={['#5CE1E6', '#B2F4EC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
            <Ionicons name="logo-whatsapp" size={20} color="#A06D44" />
            <Text style={[styles.contactButtonText, { color: '#A06D44' }]}>  Abrir WhatsApp</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={() => openApp('maps')}>
          <View style={styles.iconBoxOutline}><Feather name="navigation" size={16} color="#A06D44" /></View>
          <Text style={styles.outlineButtonText}>Como Chegar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.buttonWrapper, { marginBottom: 15 }]} 
          onPress={() => router.push({ pathname: `/evaluate/${id}`, params: { storeName: store?.name } })}
        >
          <LinearGradient 
            colors={['#D97743', '#C95E42']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }} 
            style={styles.gradientButton}
          >
            <Feather name="camera" size={20} color="#FFF" style={{ marginRight: 10 }} />
            <Text style={styles.contactButtonText}>Enviar Peça para Avaliação</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={[styles.infoCard, { marginTop: 25, backgroundColor: '#FFF9F0' }]}>
          <Text style={styles.smallSubtitle}>SUA OPINIÃO IMPORTA</Text>
          <Text style={styles.formMainTitle}>Deixe seu alfinete 📍</Text>
          
          <Text style={styles.labelNota}>Sua nota</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                <FontAwesome 
                  name={star <= userRating ? "star" : "star-o"} 
                  size={26} 
                  color="#D4A373" 
                  style={{ marginRight: 8 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.commentInput}
            placeholder="Conte como foi sua experiência..."
            placeholderTextColor="#AAA"
            multiline
            numberOfLines={4}
            value={userComment}
            onChangeText={setUserComment}
          />

          <TouchableOpacity style={styles.buttonWrapper} onPress={handleSendReview}>
            <LinearGradient colors={['#D97743', '#E3A642']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradientButton}>
              <Text style={styles.contactButtonText}>Enviar sua Opinião</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={[styles.smallSubtitle, { marginTop: 20 }]}>COMUNIDADE</Text>
        <Text style={styles.formMainTitle}>Avaliações dos usuários do Alfinete</Text>

        {reviews.map((item) => (
          <View key={item.id} style={styles.infoCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.infoTitle}>{item.name}</Text>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FontAwesome 
                    key={s} 
                    name={s <= item.rating ? "star" : "star-o"} 
                    size={13} 
                    color="#D4A373" 
                  />
                ))}
              </View>
            </View>
            <Text style={styles.infoText}>{item.text}</Text>
          </View>
        ))}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  coverContainer: { position: 'relative' },
  coverImage: { width: '100%', height: 250 },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#FFF', padding: 10, borderRadius: 20 },
  content: { padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeName: { fontSize: 22, fontWeight: 'bold', color: '#A06D44', flex: 1, paddingRight: 10 },
  description: { color: '#888', marginTop: 10, lineHeight: 22, marginBottom: 15 },
  infoCard: { backgroundColor: '#FFFDF9', borderWidth: 1, borderColor: '#EAE0D0', padding: 15, borderRadius: 16, marginBottom: 15 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { backgroundColor: '#FFFFFF', padding: 8, borderRadius: 10, marginRight: 10, borderWidth: 1, borderColor: '#F0EBE1' },
  ruleIconBox: { backgroundColor: '#D4A373', padding: 8, borderRadius: 10, marginRight: 10 },
  infoTitle: { fontWeight: 'bold', color: '#A06D44', fontSize: 15 },
  infoText: { color: '#666', marginTop: 8, fontSize: 13 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  infoBoldText: { fontWeight: 'bold', color: '#A06D44', fontSize: 13 },
  infoClosedText: { color: '#E15F41', fontWeight: 'bold', fontSize: 13 },
  subText: { color: '#666', fontSize: 13, marginTop: 8 },
  tinyText: { color: '#888', fontSize: 11, marginTop: 6 },
  priceBarContainer: { flexDirection: 'row', height: 6, gap: 4, marginTop: 6 },
  priceBarActive: { backgroundColor: '#5CE1E6', borderRadius: 3 },
  priceBarInactive: { backgroundColor: '#E6DFD6', borderRadius: 3 },
  ruleItem: { color: '#666', fontSize: 13, marginTop: 8 },
  buttonWrapper: { marginTop: 15, borderRadius: 25, overflow: 'hidden' },
  gradientButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16 },
  contactButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  outlineButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#D8C5B3', padding: 14, borderRadius: 25, marginTop: 15, marginBottom: 10 },
  iconBoxOutline: { marginRight: 8 },
  outlineButtonText: { color: '#A06D44', fontWeight: 'bold', fontSize: 16 },
  smallSubtitle: { fontSize: 11, fontWeight: '700', color: '#A69076', letterSpacing: 1 },
  formMainTitle: { fontSize: 18, fontWeight: 'bold', color: '#A06D44', marginTop: 2, marginBottom: 10 },
  labelNota: { fontSize: 13, color: '#666', marginBottom: 5 },
  starsRow: { flexDirection: 'row', marginBottom: 12 },
  commentInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EAE0D0', borderRadius: 12, padding: 12, height: 90, textAlignVertical: 'top', color: '#333', fontSize: 14 }
});