<<<<<<< HEAD
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { feedStyles } from '../../components/componetsStyles/feedStyle';
import StoreCard from '../../components/storeCard';
import { api, safeImageUrl } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthContext';
=======
import React, { useState, useRef, useEffect } from "react";
import { FlatList, ScrollView, Text, TextInput, View, TouchableOpacity, Image, Animated, ActivityIndicator, Platform } from "react-native";
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { feedStyles } from "../../components/componetsStyles/feedStyle";
import StoreCard from "../../components/storeCard";
import {api,safeImageUrl} from "../../src/api/client";
import {useFocusEffect} from "expo-router";
>>>>>>> 052f1bad155dd930d3791cc9874b4ec443d31b73

// Categorias existentes no catálogo de estilos do Alfinete.
// Categorias sem brechós associados aparecem desabilitadas.
const CATALOGO_ESTILOS = [
  'Y2K', 'Vintage', 'Streetwear', 'Casual',
  'Básica', 'Elegante', 'Feminina', 'Masculino', 'Clássica', 'Acessórios',
];

const cor = {
  marrom: '#8A5A38', terracota: '#A0452C', creme: '#FFFDF9',
  borda: '#EAE0D0', fundo: '#FAF8F5',
};

const normalizar = valor => String(valor ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('pt-BR')
  .trim();

function transformarEstilos(valor) {
  if (Array.isArray(valor)) {
    return valor.flatMap(transformarEstilos);
  }
  if (valor && typeof valor === 'object') {
    return transformarEstilos(valor.nome ?? valor.label ?? valor.estilo ?? '');
  }
  if (typeof valor !== 'string' || !valor.trim()) return [];

  const texto = valor.trim();
  if (texto.startsWith('[') || texto.startsWith('{')) {
    try { return transformarEstilos(JSON.parse(texto)); } catch { /* segue */ }
  }
  return texto.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
}

function estilosDoBrecho(loja) {
  // Exibe SOMENTE os estilos efetivamente associados no banco de dados.
  const nomes = transformarEstilos(loja.estilos ?? loja.tags ?? loja.estilo);
  return nomes.filter((valor, indice) =>
    normalizar(valor) !== 'null' &&
    nomes.findIndex(outro => normalizar(outro) === normalizar(valor)) === indice);
}

// Faixas pesquisáveis, independentes do texto exibido pelo lojista.
const FAIXAS_PRECO = [
  { id: 'ate50', label: 'Até R$ 50', min: 0, max: 50 },
  { id: '50a100', label: 'R$ 50 a R$ 100', min: 50, max: 100 },
  { id: '100a200', label: 'R$ 100 a R$ 200', min: 100, max: 200 },
  { id: 'acima200', label: 'Acima de R$ 200', min: 200, max: Infinity },
];
const valorNumerico = valor => {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(String(valor).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const dentroDaFaixa = (brecho, faixa) => Boolean(
  faixa && brecho.precoMinimo !== null && brecho.precoMaximo !== null &&
  brecho.precoMaximo >= faixa.min && brecho.precoMinimo <= faixa.max
);

export default function MainFeed() {
  const router = useRouter();
<<<<<<< HEAD
  const { user, ready } = useAuth();
=======
  const insets = useSafeAreaInsets();

  const [filtroAtivo, setFiltroAtivo] = useState(null);
  const [busca,setBusca]=useState('');
  const [estilo,setEstilo]=useState('');
  const [preco,setPreco]=useState('');
  const [notaMin,setNotaMin]=useState(0);
  const [erro,setErro]=useState('');

  const scrollY = useRef(new Animated.Value(0)).current;

  const logoHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [80, 35],
    extrapolate: 'clamp'
  });

  const logoMargin = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [15, 5],
    extrapolate: 'clamp'
  });
  
>>>>>>> 052f1bad155dd930d3791cc9874b4ec443d31b73
  const [brechos, setBrechos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoFalhou, setFotoFalhou] = useState(false);

  const [busca, setBusca] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState(null);
  const [estilo, setEstilo] = useState('');
  const [preco, setPreco] = useState('');
  const [notaMin, setNotaMin] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const logoHeight = scrollY.interpolate({
    inputRange: [0, 100], outputRange: [80, 35], extrapolate: 'clamp',
  });
  const logoMargin = scrollY.interpolate({
    inputRange: [0, 100], outputRange: [15, 5], extrapolate: 'clamp',
  });

  useEffect(() => {
    setFotoPerfil(user?.foto_url || null);
    setFotoFalhou(false);
  }, [user?.id, user?.foto_url]);

  useFocusEffect(useCallback(() => {
    let ativo = true;
    if (!ready || !user?.id) {
      if (ready) { setFotoPerfil(null); setFotoFalhou(false); }
      return () => { ativo = false; };
    }
    api('/usuarios/me').then(dados => {
      if (!ativo) return;
      const usuario = dados?.usuario ?? dados;
      if (usuario && Object.prototype.hasOwnProperty.call(usuario, 'foto_url')) {
        setFotoPerfil(usuario.foto_url || null);
        setFotoFalhou(false);
      }
    }).catch(e => console.warn('[ALFINETE/FEED] Avatar:', e.message));
    return () => { ativo = false; };
  }, [ready, user?.id]));

  useFocusEffect(useCallback(() => {
    let ativo = true;
    setLoading(true);
    api('/brechos/filtros', { auth: false })
      .then(resposta => {
        if (!ativo) return;
        const lista = Array.isArray(resposta) ? resposta
          : Array.isArray(resposta?.dados) ? resposta.dados : [];
        setBrechos(lista.map(loja => ({
          id: String(loja.id),
          name: String(loja.nome || 'Brechó'),
          address: loja.endereco_curto || '',
          rating: loja.nota_media == null ? null : Number(loja.nota_media),
          reviewCount: Number(loja.total_avaliacoes || 0),
          tags: estilosDoBrecho(loja),
          image: safeImageUrl(loja.imagem),
          precoMinimo: valorNumerico(loja.preco_minimo),
          precoMaximo: valorNumerico(loja.preco_maximo),
        })));
        setErro('');
      })
      .catch(e => { if (ativo) setErro(e.message || 'Erro ao carregar brechós.'); })
      .finally(() => { if (ativo) setLoading(false); });
    return () => { ativo = false; };
  }, []));

  const estilos = useMemo(() => {
    const nomes = [...CATALOGO_ESTILOS, ...brechos.flatMap(b => b.tags)];
    return nomes.filter((nome, indice) =>
      nomes.findIndex(outro => normalizar(outro) === normalizar(nome)) === indice);
  }, [brechos]);

  const precos = useMemo(() => FAIXAS_PRECO.map(faixa => ({
    ...faixa,
    quantidade: brechos.filter(b => dentroDaFaixa(b, faixa)).length,
  })), [brechos]);

  const opcoes = filtroAtivo === 'estilo' ? estilos
    : filtroAtivo === 'preco' ? precos : [1, 2, 3, 4, 5];

  const quantosTemEstilo = nome => brechos.filter(b =>
    b.tags.some(tag => normalizar(tag) === normalizar(nome))).length;

  const filtrados = useMemo(() => brechos.filter(b => {
    const texto = normalizar(busca);
    const correspondeBusca = normalizar(b.name).includes(texto);
    const correspondeEstilo = !estilo || b.tags.some(tag =>
      normalizar(tag) === normalizar(estilo));
    const correspondePreco = !preco || dentroDaFaixa(b, FAIXAS_PRECO.find(f => f.id === preco));
    const correspondeNota = !notaMin ||
      (b.rating != null && Number.isFinite(b.rating) && b.rating >= notaMin);
    return correspondeBusca && correspondeEstilo && correspondePreco && correspondeNota;
  }), [brechos, busca, estilo, preco, notaMin]);

  const limparFiltros = () => {
    setEstilo(''); setPreco(''); setNotaMin(0); setFiltroAtivo(null);
  };

  const selecionar = item => {
    if (filtroAtivo === 'estilo') {
      setEstilo(normalizar(estilo) === normalizar(item) ? '' : item);
    } else if (filtroAtivo === 'preco') {
      setPreco(preco === item.id ? '' : item.id);
    } else {
      setNotaMin(notaMin === item ? 0 : item);
    }
    setFiltroAtivo(null);
  };

  const fotoUsuario = safeImageUrl(fotoPerfil || user?.foto_url);
  const fotoVisivel = Boolean(user?.id && fotoUsuario && !fotoFalhou);

  return (
    <SafeAreaView style={feedStyles.safeArea}>
      <View style={feedStyles.container}>
        <View style={feedStyles.header}>
<<<<<<< HEAD
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Animated.Image
              source={require('../../assets/images/alfineteLogoAndroid.png')}
              style={[feedStyles.logo, { height: logoHeight, marginBottom: logoMargin, marginTop: -45 }]}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={() => router.push('/profile')}
              accessibilityLabel="Abrir meu perfil" accessibilityRole="button"
              style={{ marginTop: -30, width: 42, height: 42, borderRadius: 21,
                borderWidth: 1, borderColor: cor.borda, backgroundColor: cor.creme,
                overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
              {fotoVisivel ? (
                <Image key={fotoUsuario} source={{ uri: fotoUsuario }}
                  resizeMode="cover" style={{ width: 42, height: 42, borderRadius: 21 }}
                  onError={() => setFotoFalhou(true)} />
              ) : <Feather name="user" size={20} color="#A06D44" />}
=======
          
          {/* Linha com a Logo e o Botão de Perfil */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            paddingTop: Platform.OS === 'ios' ? insets.top - 15 : 0 
          }}>
            <Animated.Image
              source={require("../../assets/images/alfineteLogoAndroid.png")}
              style={[
                feedStyles.logo,
                {
                  height: logoHeight,
                  marginBottom: logoMargin,
                  marginTop: -45 
                }
              ]}
              resizeMode="contain"
            />

            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={{
                marginTop: -40,
                marginBottom: 10,
                backgroundColor: '#FFFDF9',
                padding: 10,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: '#EAE0D0'
              }}
            >
              <Feather name="user" size={25} color="#A06D44" />
>>>>>>> 052f1bad155dd930d3791cc9874b4ec443d31b73
            </TouchableOpacity>
          </View>
          <TextInput style={feedStyles.searchInput} placeholder="Buscar brechós..."
            placeholderTextColor="#888" value={busca} onChangeText={setBusca} />
        </View>

        <View style={feedStyles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={feedStyles.filtersContainer}>
            <TouchableOpacity onPress={() => setFiltroAtivo(filtroAtivo === 'estilo' ? null : 'estilo')}
              style={[feedStyles.filterPill, filtroAtivo === 'estilo' && feedStyles.filterPillActive]}>
              <Ionicons name="shirt" size={14} color="#A06D44" />
              <Text style={feedStyles.filterText}>Estilo{estilo ? ' • 1' : ''}</Text>
              <Feather name="chevron-down" size={14} color="#A06D44" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFiltroAtivo(filtroAtivo === 'preco' ? null : 'preco')}
              style={[feedStyles.filterPill, filtroAtivo === 'preco' && feedStyles.filterPillActive]}>
              <Ionicons name="pricetag" size={14} color="#A06D44" />
              <Text style={feedStyles.filterText}>Faixa de Preço{preco ? ' • 1' : ''}</Text>
              <Feather name="chevron-down" size={14} color="#A06D44" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFiltroAtivo(filtroAtivo === 'nota' ? null : 'nota')}
              style={[feedStyles.filterPill, filtroAtivo === 'nota' && feedStyles.filterPillActive]}>
              <FontAwesome name="star" size={14} color="#A06D44" />
              <Text style={feedStyles.filterText}>Nota{notaMin ? ` • ${notaMin}+` : ''}</Text>
              <Feather name="chevron-down" size={14} color="#A06D44" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {filtroAtivo !== null && (
          <View style={{ backgroundColor: cor.fundo, paddingBottom: 10 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingHorizontal: 20, minHeight: 48,
                alignItems: 'center', gap: 8 }}>
              <TouchableOpacity onPress={limparFiltros}
                style={{ paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20,
                  backgroundColor: cor.creme, borderColor: cor.borda, borderWidth: 1 }}>
                <Text style={{ color: cor.terracota, fontWeight: '700' }}>Limpar filtros</Text>
              </TouchableOpacity>
              {opcoes.map(item => {
                const indisponivel = filtroAtivo === 'estilo' ? quantosTemEstilo(item) === 0
                  : filtroAtivo === 'preco' ? item.quantidade === 0 : false;
                const marcado = filtroAtivo === 'estilo' ? normalizar(estilo) === normalizar(item)
                  : filtroAtivo === 'preco' ? preco === item.id : notaMin === item;
                return (
                  <TouchableOpacity key={filtroAtivo === 'preco' ? item.id : String(item)} disabled={indisponivel}
                    onPress={() => selecionar(item)}
                    style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20,
                      backgroundColor: marcado ? '#F4E1D9' : cor.creme,
                      borderWidth: 1, borderColor: marcado ? cor.terracota : cor.borda,
                      opacity: indisponivel ? 0.42 : 1 }}>
                    <Text style={{ color: cor.marrom, fontWeight: marcado ? '700' : '500' }}>
                      {filtroAtivo === 'nota' ? `${item}+ estrelas`
                        : filtroAtivo === 'estilo' ? `${item} (${quantosTemEstilo(item)})`
                          : `${item.label} (${item.quantidade})`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {filtroAtivo === 'estilo' && estilos.every(item => quantosTemEstilo(item) === 0) && (
              <Text style={{ paddingHorizontal: 20, paddingTop: 6, color: cor.marrom, fontSize: 12 }}>
                Nenhum brechó possui estilos associados. Cadastre-os para habilitar este filtro.
              </Text>
            )}
            {filtroAtivo === 'preco' && precos.every(item => item.quantidade === 0) && (
              <Text style={{ paddingHorizontal: 20, paddingTop: 6, color: cor.marrom, fontSize: 12 }}>
                Nenhum brechó informou preços mínimo e máximo. Cadastre esses valores no painel do brechó.
              </Text>
            )}
          </View>
        )}

        {!!erro && <Text style={{ color: '#C95E42', padding: 10 }}>{erro}</Text>}
        {loading ? (
          <ActivityIndicator size="large" color="#A06D44" style={{ marginTop: 50 }} />
        ) : (
          <Animated.FlatList
            data={filtrados}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{ textAlign: 'center', color: cor.marrom, padding: 20 }}>
              Nenhum brechó corresponde aos filtros selecionados.
            </Text>}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={feedStyles.listContainer}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            renderItem={({ item }) => <StoreCard
              id={item.id} name={item.name} address={item.address}
              rating={item.rating} tags={item.tags} image={item.image}
              reviewCount={item.reviewCount}
            />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}