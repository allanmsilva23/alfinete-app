import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { fetch } from 'expo/fetch';
import { File } from 'expo-file-system';

export default function AvaliacaoPecaScreen() {
  const router = useRouter();

  const params = useLocalSearchParams();

  const id = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const storeName = Array.isArray(params.storeName)
    ? params.storeName[0]
    : params.storeName;

  const [categoria, setCategoria] = useState('Camisa');
  const [marca, setMarca] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [descricao, setDescricao] = useState('');

  const [temManchas, setTemManchas] = useState(false);
  const [temRasgos, setTemRasgos] = useState(false);

  const [fotoFrente, setFotoFrente] = useState(null);
  const [fotoVerso, setFotoVerso] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const [pecasAdicionadas, setPecasAdicionadas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoriasDisponiveis = [
    'Camisa',
    'Calça',
    'Vestido',
    'Jaqueta',
    'Blusa',
    'Sapato',
    'Bolsa',
    'Acessório',
  ];

  // =========================================================
  // SELECIONAR IMAGEM
  // =========================================================

  const pickImage = async (lado) => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso às fotos para selecionar uma imagem.'
        );

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 4],
        quality: 0.7,
      });

      if (result.canceled) {
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        Alert.alert(
          'Erro',
          'Não foi possível obter a imagem selecionada.'
        );

        return;
      }

      console.log('Imagem selecionada:', {
        uri: asset.uri,
        fileName: asset.fileName,
        mimeType: asset.mimeType,
        fileSize: asset.fileSize,
      });

      if (lado === 'frente') {
        setFotoFrente(asset);
      } else {
        setFotoVerso(asset);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);

      Alert.alert(
        'Erro',
        'Não foi possível selecionar a imagem.'
      );
    }
  };

  // =========================================================
  // ADICIONAR PEÇA À SACOLA
  // =========================================================

  const handleAdicionarPeca = () => {
    if (!fotoFrente) {
      Alert.alert(
        'Falta a foto!',
        'Por favor, adicione pelo menos a foto da frente da peça.'
      );

      return;
    }

    const novaPeca = {
      id: Date.now().toString(),

      categoria,

      marca: marca.trim() || 'Sem marca',

      tamanho: tamanho.trim() || 'N/A',

      descricao: descricao.trim(),

      temManchas,

      temRasgos,

      fotoFrente,

      fotoVerso,
    };

    setPecasAdicionadas((prev) => [
      novaPeca,
      ...prev,
    ]);

    // Limpa o formulário
    setCategoria('Camisa');
    setMarca('');
    setTamanho('');
    setDescricao('');

    setTemManchas(false);
    setTemRasgos(false);

    setFotoFrente(null);
    setFotoVerso(null);
  };

  // =========================================================
  // ENVIAR TODAS AS PEÇAS
  // =========================================================

  const handleEnviarTudo = async () => {
    if (pecasAdicionadas.length === 0) {
      Alert.alert(
        'Nenhuma peça',
        'Adicione pelo menos uma peça antes de enviar.'
      );

      return;
    }

    if (!id) {
      Alert.alert(
        'Erro',
        'Não foi possível identificar o brechó.'
      );

      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      for (const peca of pecasAdicionadas) {
        const formData = new FormData();

        // =====================================================
        // CAMPOS DE TEXTO
        // =====================================================

        formData.append(
          'usuario_id',
          '1'
        );

        formData.append(
          'brecho_id',
          String(id)
        );

        formData.append(
          'categoria_peca',
          String(peca.categoria)
        );

        formData.append(
          'marca',
          String(peca.marca)
        );

        formData.append(
          'tamanho',
          String(peca.tamanho)
        );

        formData.append(
          'possui_manchas',
          peca.temManchas
            ? 'true'
            : 'false'
        );

        formData.append(
          'possui_rasgos',
          peca.temRasgos
            ? 'true'
            : 'false'
        );

        formData.append(
          'descricao',
          String(peca.descricao || '')
        );

        // =====================================================
        // FOTO DA FRENTE
        // =====================================================

        if (!peca.fotoFrente?.uri) {
          throw new Error(
            'A peça não possui foto da frente.'
          );
        }

        const arquivoFrente = new File(
          peca.fotoFrente.uri
        );

        console.log(
          'Arquivo frente:',
          arquivoFrente.uri,
          arquivoFrente.name,
          arquivoFrente.type
        );

        formData.append(
          'fotoFrente',
          arquivoFrente
        );

        // =====================================================
        // FOTO DO VERSO - OPCIONAL
        // =====================================================

        if (peca.fotoVerso?.uri) {
          const arquivoVerso = new File(
            peca.fotoVerso.uri
          );

          console.log(
            'Arquivo verso:',
            arquivoVerso.uri,
            arquivoVerso.name,
            arquivoVerso.type
          );

          formData.append(
            'fotoVerso',
            arquivoVerso
          );
        }

        // =====================================================
        // ENVIO
        // =====================================================

        console.log(
          'Enviando peça:',
          peca.categoria
        );

        const resposta = await fetch(
          'https://alfinete.alwaysdata.net/solicitacoes',
          {
            method: 'POST',
            body: formData,
          }
        );

        const textoResposta = await resposta.text();

        console.log(
          'Status da API:',
          resposta.status
        );

        console.log(
          'Resposta da API:',
          textoResposta
        );

        if (!resposta.ok) {
          throw new Error(
            `Servidor retornou ${resposta.status}: ${textoResposta}`
          );
        }
      }

      const quantidade =
        pecasAdicionadas.length;

      // Limpa depois de tudo ser enviado
      setPecasAdicionadas([]);

      Alert.alert(
        'Sucesso! 🎉',
        `Você enviou ${quantidade} peça(s) para avaliação!\n\nO brechó ${
          storeName || ''
        } entrará em contato pelo chat em breve.`,
        [
          {
            text: 'Voltar ao Brechó',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error(
        'ERRO NO ENVIO:',
        error
      );

      Alert.alert(
        'Erro ao enviar',
        error?.message ||
          'Ocorreu um erro ao enviar as peças para o servidor.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // INTERFACE
  // =========================================================

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather
            name="arrow-left"
            size={24}
            color="#A06D44"
          />
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.mainTitle}>
            Avaliação de Peça
          </Text>

          <Text style={styles.subTitle}>
            Para: {storeName || 'Brechó'}
          </Text>
        </View>
      </View>

      {/* SACOLA */}

      {pecasAdicionadas.length > 0 && (
        <View style={styles.sacolaContainer}>
          <Text style={styles.labelDark}>
            Prontas para envio (
            {pecasAdicionadas.length})
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              marginTop: 10,
            }}
          >
            {pecasAdicionadas.map(
              (peca) => (
                <View
                  key={peca.id}
                  style={
                    styles.pecaMiniCard
                  }
                >
                  <Feather
                    name="check-circle"
                    size={16}
                    color="#65E3C1"
                  />

                  <Text
                    style={
                      styles.pecaMiniText
                    }
                  >
                    {peca.categoria} (
                    {peca.tamanho})
                  </Text>
                </View>
              )
            )}
          </ScrollView>

          <TouchableOpacity
            style={[
              styles.submitAllButton,
              isSubmitting &&
                styles.buttonDisabled,
            ]}
            onPress={handleEnviarTudo}
            disabled={isSubmitting}
          >
            <Text
              style={
                styles.submitAllButtonText
              }
            >
              {isSubmitting
                ? 'Enviando...'
                : 'Finalizar e Enviar Tudo'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FORMULÁRIO */}

      <View style={styles.formContainer}>
        {/* CATEGORIA */}

        <View style={{ zIndex: 10 }}>
          <Text style={styles.label}>
            Categoria
          </Text>

          <TouchableOpacity
            style={styles.dropdownInput}
            onPress={() =>
              setShowDropdown(
                !showDropdown
              )
            }
          >
            <Text style={styles.inputText}>
              {categoria}
            </Text>

            <Feather
              name={
                showDropdown
                  ? 'chevron-up'
                  : 'chevron-down'
              }
              size={20}
              color="#D8C5B3"
            />
          </TouchableOpacity>

          {showDropdown && (
            <View
              style={styles.dropdownMenu}
            >
              {categoriasDisponiveis.map(
                (item) => (
                  <TouchableOpacity
                    key={item}
                    style={
                      styles.dropdownItem
                    }
                    onPress={() => {
                      setCategoria(item);
                      setShowDropdown(
                        false
                      );
                    }}
                  >
                    <Text
                      style={
                        styles.inputText
                      }
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}
        </View>

        {/* MARCA E TAMANHO */}

        <View style={styles.row}>
          <View
            style={styles.halfInput}
          >
            <Text style={styles.label}>
              Marca
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: Zara"
              placeholderTextColor="#C7B6A5"
              value={marca}
              onChangeText={setMarca}
            />
          </View>

          <View
            style={styles.halfInput}
          >
            <Text style={styles.label}>
              Tamanho
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Ex: M"
              placeholderTextColor="#C7B6A5"
              value={tamanho}
              onChangeText={setTamanho}
            />
          </View>
        </View>

        {/* AVARIAS */}

        <View
          style={
            styles.avariasContainer
          }
        >
          <Text
            style={styles.labelDark}
          >
            A peça possui avarias?
          </Text>

          <View
            style={styles.checkboxRow}
          >
            <TouchableOpacity
              style={
                styles.checkboxWrapper
              }
              onPress={() =>
                setTemManchas(
                  !temManchas
                )
              }
            >
              <Feather
                name={
                  temManchas
                    ? 'check-square'
                    : 'square'
                }
                size={20}
                color="#D8C5B3"
              />

              <Text
                style={
                  styles.checkboxText
                }
              >
                Manchas
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.checkboxWrapper
              }
              onPress={() =>
                setTemRasgos(
                  !temRasgos
                )
              }
            >
              <Feather
                name={
                  temRasgos
                    ? 'check-square'
                    : 'square'
                }
                size={20}
                color="#D8C5B3"
              />

              <Text
                style={
                  styles.checkboxText
                }
              >
                Rasgos
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DESCRIÇÃO */}

        <Text style={styles.label}>
          Descrição
        </Text>

        <TextInput
          style={styles.textArea}
          placeholder="História ou detalhes da peça"
          placeholderTextColor="#C7B6A5"
          multiline
          numberOfLines={4}
          value={descricao}
          onChangeText={setDescricao}
        />

        {/* FOTOS */}

        <View
          style={styles.photoSection}
        >
          <Text
            style={styles.labelDark}
          >
            Fotos da Peça (Máx. 2)
          </Text>

          <View
            style={styles.photoRow}
          >
            {/* FRENTE */}

            <TouchableOpacity
              style={styles.photoBox}
              onPress={() =>
                pickImage('frente')
              }
            >
              {fotoFrente ? (
                <Image
                  source={{
                    uri: fotoFrente.uri,
                  }}
                  style={
                    styles.previewImage
                  }
                />
              ) : (
                <>
                  <View
                    style={
                      styles.photoIconCircle
                    }
                  >
                    <Feather
                      name="camera"
                      size={24}
                      color="#FFF"
                    />
                  </View>

                  <Text
                    style={
                      styles.photoText
                    }
                  >
                    Frente
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* VERSO */}

            <TouchableOpacity
              style={styles.photoBox}
              onPress={() =>
                pickImage('verso')
              }
            >
              {fotoVerso ? (
                <Image
                  source={{
                    uri: fotoVerso.uri,
                  }}
                  style={
                    styles.previewImage
                  }
                />
              ) : (
                <>
                  <View
                    style={
                      styles.photoIconCircle
                    }
                  >
                    <Feather
                      name="camera"
                      size={24}
                      color="#FFF"
                    />
                  </View>

                  <Text
                    style={
                      styles.photoText
                    }
                  >
                    Verso
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ADICIONAR */}

        <TouchableOpacity
          style={styles.addButton}
          onPress={
            handleAdicionarPeca
          }
        >
          <Feather
            name="plus"
            size={20}
            color="#C95E42"
            style={{
              marginRight: 8,
            }}
          />

          <Text
            style={
              styles.addButtonText
            }
          >
            Adicionar Peça à Sacola
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// =========================================================
// ESTILOS
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FAF8F5',
  },

  backButton: {
    backgroundColor: '#FFFDF9',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EAE0D0',
  },

  headerTitles: {
    marginLeft: 15,
    flex: 1,
  },

  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A06D44',
  },

  subTitle: {
    fontSize: 13,
    color: '#C7B6A5',
    marginTop: 2,
  },

  formContainer: {
    padding: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A06D44',
    marginBottom: 8,
  },

  labelDark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8A5A38',
    marginBottom: 12,
  },

  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#D8C5B3',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },

  inputText: {
    flex: 1,
    color: '#8A5A38',
    fontSize: 15,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  halfInput: {
    width: '48%',
  },

  input: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#D8C5B3',
    borderRadius: 12,
    padding: 16,
    color: '#8A5A38',
    fontSize: 15,
  },

  avariasContainer: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#EAE0D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  checkboxRow: {
    flexDirection: 'row',
    gap: 20,
  },

  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderWidth: 1,
    borderColor: '#EAE0D0',
    padding: 12,
    borderRadius: 12,
    flex: 1,
  },

  checkboxText: {
    marginLeft: 10,
    color: '#8A5A38',
    fontSize: 14,
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
    marginBottom: 25,
  },

  photoSection: {
    borderWidth: 1,
    borderColor: '#D8C5B3',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    backgroundColor: '#FFFDF9',
  },

  photoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  photoBox: {
    width: '48%',
    height: 130,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#EAE0D0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  photoIconCircle: {
    backgroundColor: '#D97743',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  photoText: {
    color: '#D97743',
    fontWeight: '600',
    fontSize: 14,
  },

  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF8F5',
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
    fontWeight: '600',
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
    fontSize: 16,
  },

  buttonDisabled: {
    opacity: 0.6,
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
    fontSize: 16,
  },
});