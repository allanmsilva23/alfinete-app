import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, LayoutAnimation, UIManager, Platform, Linking, Modal, SafeAreaView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

// Habilita animações de layout no Android para o efeito "Sanfona"
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// MOCK ATUALIZADO: Sem justificativa geral e com imagens das peças
const requestsMock = [
  {
    id: 'req1',
    storeName: 'Brechó Nunca Sai de Moda',
    date: '05/09/2026',
    overallStatus: 'aprovado',
    phone: '5511999999999',
    items: [
      { id: 'i1', category: 'Vestido', status: 'aprovado', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300' },
      { id: 'i2', category: 'Jaqueta', status: 'recusado', reason: 'A peça possui manchas profundas que não conseguimos restaurar.', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300' }
    ]
  },
  {
    id: 'req2',
    storeName: 'Brechó Amor a Moda',
    date: '12/09/2026',
    overallStatus: 'pendente',
    items: [
      { id: 'i3', category: 'Camiseta', status: 'pendente', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300' },
      { id: 'i4', category: 'Calça Jeans', status: 'pendente', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300' }
    ]
  },
  {
    id: 'req3',
    storeName: 'Brechó Estilo Olivieri',
    date: '01/09/2026',
    overallStatus: 'recusado',
    items: [
      { id: 'i5', category: 'Casaco', status: 'recusado', reason: 'Não estamos aceitando peças de inverno no momento.', image: 'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=300' }
    ]
  }
];

const RequestCard = ({ request, onImageClick }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const openWhatsApp = () => {
    Linking.openURL(`https://wa.me/${request.phone}?text=Olá! Gostaria de agendar a entrega das minhas peças aprovadas.`);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'aprovado': return { bg: '#48C79A', text: 'Aprovado - Agende sua entrega', icon: 'check-circle' };
      case 'pendente': return { bg: '#D4A373', text: 'Pendente', icon: 'clock' };
      case 'recusado': return { bg: '#C95E42', text: 'Recusado', icon: 'x-circle' };
      default: return { bg: '#999', text: 'Desconhecido', icon: 'help-circle' };
    }
  };

  const config = getStatusConfig(request.overallStatus);

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.cardHeader} onPress={toggleExpand} activeOpacity={0.7}>
        <Image source={{ uri: 'https://via.placeholder.com/60' }} style={styles.storeImage} />
        
        <View style={styles.cardInfo}>
          <Text style={styles.storeName}>{request.storeName}</Text>
          <Text style={styles.dateText}>Enviado em {request.date}</Text>
          <View style={[styles.badge, { backgroundColor: config.bg }]}>
            <Text style={styles.badgeText}>{config.text}</Text>
          </View>
        </View>

        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={20} color="#A06D44" style={styles.expandIcon} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedArea}>
          <Text style={styles.expandedTitle}>Detalhes da Avaliação:</Text>
          
          {request.items.map((item) => {
            const itemConfig = getStatusConfig(item.status);
            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemHeader}>
                  <Feather name={itemConfig.icon} size={16} color={itemConfig.bg} />
                  
                  {/* Miniatura da Roupa Clicável */}
                  <TouchableOpacity onPress={() => onImageClick(item.image)}>
                    <Image source={{ uri: item.image }} style={styles.itemThumbnail} />
                  </TouchableOpacity>
                  
                  <Text style={styles.itemName}>{item.category}</Text>
                </View>
                
                {item.status === 'recusado' && (
                  <View style={styles.reasonBox}>
                    <Text style={styles.reasonText}><Text style={styles.reasonBold}>Justificativa:</Text> {item.reason}</Text>
                  </View>
                )}
              </View>
            );
          })}

          {request.overallStatus === 'aprovado' && (
            <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
              <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
              <Text style={styles.whatsappButtonText}>Agendar via WhatsApp</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default function RequestsScreen() {
  // Estados para controlar o visualizador de imagem (Modal)
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpenImage = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Solicitações</Text>
        <Text style={styles.subtitle}>Acompanhe o status das suas peças enviadas</Text>
      </View>

      <FlatList
        data={requestsMock}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <RequestCard request={item} onImageClick={handleOpenImage} />
        )}
      />

      {/* MODAL DO VISUALIZADOR DE FOTOS */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Feather name="x" size={30} color="#FFF" />
          </TouchableOpacity>
          {selectedImage && (
             <Image source={{ uri: selectedImage }} style={styles.fullScreenImage} resizeMode="contain" />
          )}
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