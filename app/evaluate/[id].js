import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { storeMocks } from '../../mocks/storesMocks';

/*

    Tela de formulário de avaliação de peças

*/

export default function EvaluateItem() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const store = storeMocks.find(s => s.id === id);
  const storeName = store ? store.name : 'Brechó Selecionado';

  const [categoria, setCategoria] = useState('Camiseta');
  const [showDropdown, setShowDropdown] = useState(false);
  const categoriasDisponiveis = ['Camiseta', 'Calça', 'Casaco/Jaqueta', 'Vestido', 'Saia', 'Shorts', 'Acessório', 'Outro'];


  const [marca, setMarca] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const [temManchas, setTemManchas] = useState(false);
  const [temRasgos, setTemRasgos] = useState(false);

  const [fotoFrente, setFotoFrente] = useState(null);
  const [fotoVerso, setFotoVerso] = useState(null);

  const [pecasAdicionadas, setPecasAdicionadas] = useState([]);

  const handleAdicionarPeca = () => {
    if (!fotoFrente) {
      Alert.alert('Falta a foto!', 'Por favor, adicione pelo menos a foto da frente da peça.');
      return;
    }

    const novaPeca = {
      id: Date.now().toString(),
      categoria,
      marca: marca || 'Sem marca',
      tamanho: tamanho || 'N/A'
    };
    setPecasAdicionadas([novaPeca, ...pecasAdicionadas]);

    setCategoria('Camiseta');
    setMarca('');
    setTamanho('');
    setDescricao('');
    setTemManchas(false);
    setTemRasgos(false);
    setFotoFrente(null);
    setFotoVerso(null);
  };

  const handleEnviarTudo = async () => {
    if (pecasAdicionadas.length === 0) return;

    // ================= TODO: ALAN =================
    // 1. Mapeie o array `pecasAdicionadas`.
    // 2. Para cada peça, capture a `fotoFrente` e `fotoVerso` (que são caminhos locais do celular).
    // 3. Faça o upload desses arquivos para o Firebase Storage.
    // 4. Recupere a URL pública gerada pelo Firebase.
    // 5. Substitua o caminho local pela URL pública no objeto da peça.
    // 6. Faça o POST para a rota do Back-end enviando o payload completo com as URLs do Firebase.
    // ==============================================

    Alert.alert(
      'Sucesso! 🎉',
      `Você enviou ${pecasAdicionadas.length} peça(s) para avaliação!\n\nO brechó entrará em contato em breve.`,
      [{ text: 'Voltar ao Brechó', onPress: () => router.back() }]
    );
  };

  const pickImage = async (lado) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4], 
      quality: 0.7, 
    });

    if (!result.canceled) {
      if (lado === 'frente') {
        setFotoFrente(result.assets[0].uri);
      } else {
        setFotoVerso(result.assets[0].uri);
      }
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#A06D44" />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.mainTitle}>Avaliação de Peça</Text>
          <Text style={styles.subTitle}>Para: {storeName}</Text>
        </View>
      </View>

      {pecasAdicionadas.length > 0 && (
        <View style={styles.sacolaContainer}>
          <Text style={styles.labelDark}>Prontas para envio ({pecasAdicionadas.length})</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {pecasAdicionadas.map((peca) => (
              <View key={peca.id} style={styles.pecaMiniCard}>
                <Feather name="check-circle" size={16} color="#65E3C1" />
                <Text style={styles.pecaMiniText}>{peca.categoria} ({peca.tamanho})</Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.submitAllButton} onPress={handleEnviarTudo}>
            <Text style={styles.submitAllButtonText}>Finalizar e Enviar Tudo</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.formContainer}>
        
        <View style={{ zIndex: 10 }}> 
          <Text style={styles.label}>Categoria</Text>
          <TouchableOpacity 
            style={styles.dropdownInput} 
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={[styles.inputText, { flex: 1 }]}>{categoria}</Text>
            <Feather name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#D8C5B3" />
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdownMenu}>
              {categoriasDisponiveis.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.dropdownItem} 
                  onPress={() => {
                    setCategoria(item);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.inputText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Marca</Text>
            <TextInput style={styles.input} placeholder="Ex: Zara" placeholderTextColor="#C7B6A5" value={marca} onChangeText={setMarca} />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Tamanho</Text>
            <TextInput style={styles.input} placeholder="Ex: M" placeholderTextColor="#C7B6A5" value={tamanho} onChangeText={setTamanho} />
          </View>
        </View>

        <View style={styles.avariasContainer}>
          <Text style={styles.labelDark}>A peça possui avarias?</Text>
          <View style={styles.checkboxRow}>
            <TouchableOpacity style={styles.checkboxWrapper} onPress={() => setTemManchas(!temManchas)}>
              <Feather name={temManchas ? "check-square" : "square"} size={20} color="#D8C5B3" />
              <Text style={styles.checkboxText}>Manchas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.checkboxWrapper} onPress={() => setTemRasgos(!temRasgos)}>
              <Feather name={temRasgos ? "check-square" : "square"} size={20} color="#D8C5B3" />
              <Text style={styles.checkboxText}>Rasgos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Descrição</Text>
        <TextInput 
          style={styles.textArea} 
          placeholder="História ou detalhes da peça" 
          placeholderTextColor="#C7B6A5" 
          multiline 
          numberOfLines={4}
          value={descricao}
          onChangeText={setDescricao}
        />

        <View style={styles.photoSection}>
          <Text style={styles.labelDark}>Fotos da Peça (Máx. 2)</Text>
          <View style={styles.photoRow}>
            
            <TouchableOpacity style={styles.photoBox} onPress={() => pickImage('frente')}>
              {fotoFrente ? (
                <Image source={{ uri: fotoFrente }} style={styles.previewImage} />
              ) : (
                <>
                  <View style={styles.photoIconCircle}>
                    <Feather name="camera" size={24} color="#FFF" />
                  </View>
                  <Text style={styles.photoText}>Frente</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.photoBox} onPress={() => pickImage('verso')}>
              {fotoVerso ? (
                <Image source={{ uri: fotoVerso }} style={styles.previewImage} />
              ) : (
                <>
                  <View style={styles.photoIconCircle}>
                    <Feather name="camera" size={24} color="#FFF" />
                  </View>
                  <Text style={styles.photoText}>Verso</Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAdicionarPeca}>
          <Feather name="plus" size={20} color="#C95E42" style={{ marginRight: 8 }} />
          <Text style={styles.addButtonText}>Adicionar Peça à Sacola</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FAF8F5'
  },
  backButton: {
    backgroundColor: '#FFFDF9',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAE0D0'
  },
  headerTitles: {
    marginLeft: 15
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A06D44'
  },
  subTitle: {
    fontSize: 13,
    color: '#C7B6A5',
    marginTop: 2
  },
  formContainer: {
    padding: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A06D44',
    marginBottom: 8
  },
  labelDark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8A5A38',
    marginBottom: 12
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#D8C5B3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  inputText: {
    color: '#8A5A38',
    fontSize: 15
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  halfInput: {
    width: '48%'
  },
  input: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#D8C5B3',
    borderRadius: 12,
    padding: 16,
    color: '#8A5A38',
    fontSize: 15
  },
  avariasContainer: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#EAE0D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 20
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE0D0',
    padding: 12,
    borderRadius: 12,
    flex: 1
  },
  checkboxText: {
    marginLeft: 10,
    color: '#8A5A38',
    fontSize: 14
  },
  textArea: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#D8C5B3',
    borderRadius: 12,
    padding: 16,
    height: 120,
    textAlignVertical: 'top',
    color: '#8A5A38',
    fontSize: 15,
    marginBottom: 25
  },
  photoSection: {
    borderWidth: 1,
    borderColor: '#D8C5B3',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    backgroundColor: '#FFFDF9'
  },
  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  photoBox: {
    width: '48%',
    height: 130,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAE0D0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  photoIconCircle: {
    backgroundColor: '#D97743',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  photoText: {
    color: '#D97743',
    fontWeight: '600',
    fontSize: 14
  },
  submitButton: {
    backgroundColor: '#C95E42',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
  dropdownMenu: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#D8C5B3',
    borderRadius: 12,
    marginTop: -15, 
    marginBottom: 20,
    paddingVertical: 5,
    elevation: 3,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF8F5'
  },
  sacolaContainer: {
    backgroundColor: '#FFFDF9',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#EAE0D0',
  },
  pecaMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE0D0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  pecaMiniText: {
    marginLeft: 6,
    color: '#8A5A38',
    fontSize: 13,
    fontWeight: '600'
  },
  submitAllButton: {
    backgroundColor: '#65E3C1',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  submitAllButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16
  },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: '#C95E42',
    padding: 18,
    borderRadius: 12,
    marginBottom: 40,
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#C95E42',
    fontWeight: 'bold',
    fontSize: 16
  }
});