<<<<<<< Updated upstream:app/feed.js
import React, { useState } from "react";
import { FlatList, ScrollView, Text, TextInput, View, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { feedStyles } from "../components/componetsStyles/feedStyle";
import StoreCard from "../components/storeCard";
import { storeMocks } from "../mocks/storesMocks";

/*
    Tela de Feed
    Essa tela exibe em forma de lista os brechós cadastrados no app
*/
=======
import React, { useState, useEffect } from "react";
import { FlatList, ScrollView, Text, TextInput, View, TouchableOpacity, SafeAreaView, Image, ActivityIndicator } from "react-native";
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { feedStyles } from "../../components/componetsStyles/feedStyle";
import StoreCard from "../../components/storeCard";
>>>>>>> Stashed changes:app/(tabs)/feed.js

export default function MainFeed() {
  const [filtroAtivo, setFiltroAtivo] = useState(null);
  
  // 1. Estados para os dados reais e para o loading
  const [brechos, setBrechos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch da listagem de brechós
  useEffect(() => {
    fetch('https://alfinete.alwaysdata.net/brechos/filtros')
      .then((response) => response.json())
      .then((json) => {
        if (json.sucesso) {
          // Mapeando as chaves do Back-end para as props que o StoreCard espera
          const dadosMapeados = json.dados.map((loja) => ({
            id: loja.id.toString(),
            name: loja.nome,
            address: loja.endereco_curto,
            rating: 5.0,
            tags: loja.estilos,
          }));
          setBrechos(dadosMapeados);
        }
      })
      .catch((error) => console.error("Erro ao buscar brechós:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={feedStyles.safeArea}>
      <View style={feedStyles.container}>
        <View style={feedStyles.header}>
          <Image
            source={require("../assets/images/alfineteLogoAndroid.png")}
            style={feedStyles.logo}
            resizeMode="contain"
          />
          <TextInput
            style={feedStyles.searchInput}
            placeholder="Buscar brechós..."
            placeholderTextColor="#888"
          />
        </View>

        <View style={feedStyles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={feedStyles.filtersContainer}
          >
            <TouchableOpacity 
              style={[feedStyles.filterPill, filtroAtivo === 'estilo' && feedStyles.filterPillActive]}
              onPress={() => setFiltroAtivo(filtroAtivo === 'estilo' ? null : 'estilo')}
            >
              <Ionicons name="shirt" size={14} color="#A06D44" />
              <Text style={feedStyles.filterText}>Estilo</Text>
              <Feather name="chevron-down" size={14} color="#A06D44" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[feedStyles.filterPill, filtroAtivo === 'preco' && feedStyles.filterPillActive]}
              onPress={() => setFiltroAtivo(filtroAtivo === 'preco' ? null : 'preco')}
            >
              <Ionicons name="pricetag" size={14} color="#A06D44" />
              <Text style={feedStyles.filterText}>Faixa de Preço</Text>
              <Feather name="chevron-down" size={14} color="#A06D44" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[feedStyles.filterPill, filtroAtivo === 'nota' && feedStyles.filterPillActive]}
              onPress={() => setFiltroAtivo(filtroAtivo === 'nota' ? null : 'nota')}
            >
              <FontAwesome name="star" size={14} color="#A06D44" />
              <Text style={feedStyles.filterText}>Nota</Text>
              <Feather name="chevron-down" size={14} color="#A06D44" />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 3. Indicador de Carregamento ou Lista Real */}
        {loading ? (
          <ActivityIndicator size="large" color="#A06D44" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={brechos}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={feedStyles.listContainer}
            renderItem={({ item }) => (
              <StoreCard
                id={item.id}
                name={item.name}
                address={item.address}
                rating={item.rating}
                tags={item.tags}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}