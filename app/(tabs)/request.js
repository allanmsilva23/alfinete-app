import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, LayoutAnimation, UIManager, Platform, Linking, Modal, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { api, safeImageUrl } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthContext';
import { useFocusEffect, useRouter } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) UIManager.setLayoutAnimationEnabledExperimental(true);
const normalizedStatus = value => {
  const v = String(value || 'pendente').toLowerCase();
  return ['aprovado', 'recusado', 'pendente'].includes(v) ? v : 'pendente';
};
function groupRequests(rows) {
  const groups = new Map();
  for (const row of rows) {
    const key = row.lote_id ? `lote:${row.lote_id}` : `solicitacao:${row.id}`;
    if (!groups.has(key)) groups.set(key, { id: key, storeName: row.nome_brecho, date: new Date(row.data_envio).toLocaleDateString('pt-BR'), phone: row.telefone, storeImage: safeImageUrl(row.imagem_brecho), items: [] });
    groups.get(key).items.push({ id: String(row.id), category: row.categoria_peca, status: normalizedStatus(row.status), reason: row.motivo_recusa, image: safeImageUrl(row.foto_frente_url), backImage: safeImageUrl(row.foto_verso_url) });
  }
  return [...groups.values()].map(group => {
    const statuses = group.items.map(item => item.status);
    group.overallStatus = statuses.every(s => s === 'aprovado') ? 'aprovado'
      : statuses.every(s => s === 'recusado') ? 'recusado'
      : statuses.some(s => s !== 'pendente') ? 'parcial'
      : 'pendente';
    group.hasApproved = statuses.includes('aprovado');
    return group;
  });
}
const getStatusConfig = status => {
  switch (status) {
    case 'aprovado': return { bg: '#48C79A', text: 'Aprovado - Agende sua entrega', icon: 'check-circle' };
    case 'pendente': return { bg: '#D4A373', text: 'Pendente', icon: 'clock' };
    case 'recusado': return { bg: '#C95E42', text: 'Recusado', icon: 'x-circle' };
    case 'parcial': return { bg: '#D4A373', text: 'Peças com decisões diferentes', icon: 'alert-circle' };
    default: return { bg: '#999', text: 'Desconhecido', icon: 'help-circle' };
  }
};
const RequestCard = ({ request, onImageClick }) => {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setExpanded(!expanded); };
  const openWhatsApp = async () => {
    const phone = String(request.phone || '').replace(/\D/g, '');
    if (!phone) return Alert.alert('Indisponível', 'Este brechó ainda não cadastrou telefone.');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent('Olá! Gostaria de agendar a entrega das minhas peças aprovadas.')}`;
    try { await Linking.openURL(url); } catch (_) { Alert.alert('Erro', 'Não foi possível abrir o WhatsApp.'); }
  };
  const config = getStatusConfig(request.overallStatus);
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.cardHeader} onPress={toggleExpand} activeOpacity={0.7}>
        {request.storeImage ? <Image source={{ uri: request.storeImage }} style={styles.storeImage} /> : <View style={[styles.storeImage, { backgroundColor: '#EAE0D0' }]} />}
        <View style={styles.cardInfo}>
          <Text style={styles.storeName}>{request.storeName}</Text>
          <Text style={styles.dateText}>Enviado em {request.date}</Text>
          <View style={[styles.badge, { backgroundColor: config.bg }]}><Text style={styles.badgeText}>{config.text}</Text></View>
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#A06D44" style={styles.expandIcon} />
      </TouchableOpacity>
      {expanded && <View style={styles.expandedArea}>
        <Text style={styles.expandedTitle}>Detalhes da Avaliação:</Text>
        {request.items.map(item => {
          const itemConfig = getStatusConfig(item.status);
          return <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemHeader}>
              <Feather name={itemConfig.icon} size={16} color={itemConfig.bg} />
              <TouchableOpacity disabled={!item.image} onPress={() => onImageClick(item.image)}>
                {item.image ? <Image source={{ uri: item.image }} style={styles.itemThumbnail} /> : <View style={styles.itemThumbnail} />}
              </TouchableOpacity>
               <View style={{flex:1}}>
                <Text style={styles.itemName}>{item.category}</Text>
                 <Text style={{fontSize:12,fontWeight:'700',color:itemConfig.bg,marginTop:3}}>
                   {item.status==='aprovado'?'Aprovada':item.status==='recusado'?'Recusada':'Pendente'}
                 </Text>
               </View>
              {item.backImage && <TouchableOpacity onPress={() => onImageClick(item.backImage)}><Text style={{ fontSize: 11, color: '#A06D44', marginLeft: 8 }}>Ver verso</Text></TouchableOpacity>}
            </View>
            {item.status === 'recusado' && !!item.reason && <View style={styles.reasonBox}><Text style={styles.reasonText}><Text style={styles.reasonBold}>Justificativa: </Text>{item.reason}</Text></View>}
          </View>;
        })}
        {request.hasApproved && <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <Ionicons name="logo-whatsapp" size={20} color="#FFF" /><Text style={styles.whatsappButtonText}>Agendar via WhatsApp</Text>
        </TouchableOpacity>}
      </View>}
    </View>
  );
};
export default function RequestsScreen() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [requests, setRequests] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const load = useCallback(async () => {
    try { setRefreshing(true); const rows = await api('/solicitacoes/me'); setRequests(groupRequests(rows)); }
    catch (error) { Alert.alert('Erro ao carregar solicitações', error.message); }
    finally { setRefreshing(false); }
  }, [user?.id]);
  useFocusEffect(useCallback(() => {
    if (!ready) return;
    if (!user) router.replace('/');
    else load();
  }, [ready, user?.id, load]));
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>Minhas Solicitações</Text><Text style={styles.subtitle}>Acompanhe o status das suas peças enviadas</Text></View>
      <FlatList data={requests} keyExtractor={item => item.id} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        renderItem={({ item }) => <RequestCard request={item} onImageClick={uri => { if (uri) { setSelectedImage(uri); setModalVisible(true); } }} />}
        ListEmptyComponent={<Text style={{ color: '#A06D44', textAlign: 'center', padding: 25 }}>{refreshing ? 'Carregando...' : 'Você ainda não enviou nenhuma peça.'}</Text>}
      />
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}><Feather name="x" size={30} color="#FFF" /></TouchableOpacity>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />}
        </View>
      </Modal>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    paddingTop: 20, // Ajustado já que removemos o botão gigante
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#A0452C',
  },
  subtitle: {
    fontSize: 14,
    color: '#A69076',
    marginTop: 4,
    marginBottom: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EAE0D0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8A5A38',
  },
  dateText: {
    fontSize: 12,
    color: '#A69076',
    marginTop: 2,
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  expandIcon: {
    marginLeft: 10,
  },
  expandedArea: {
    backgroundColor: '#FFFDF9',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#EAE0D0',
  },
  expandedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8A5A38',
    marginBottom: 10,
  },
  itemRow: {
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemThumbnail: {
    width: 36,
    height: 36,
    borderRadius: 6,
    marginHorizontal: 10,
    backgroundColor: '#EAE0D0',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  reasonBox: {
    backgroundColor: '#FAF3E8',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
    marginLeft: 26, 
  },
  reasonText: {
    fontSize: 12,
    color: '#8A5A38',
  },
  reasonBold: {
    fontWeight: 'bold',
  },
  whatsappButton: {
    backgroundColor: '#65E3C1', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
  },
  whatsappButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  /* Estilos do Modal de Imagem */
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  }
});