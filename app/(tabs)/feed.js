// ================= TODO: ALAN =================
  // 1. Apague a importação do `storeMocks` no topo do arquivo.
  // 2. Crie um estado: const [brechos, setBrechos] = useState([]);
  // 3. Faça um fetch (GET /brechos/filtros) dentro de um useEffect e salve no setBrechos.
  // 4. Na FlatList lá embaixo, troque a propriedade `data={storeMocks}` por `data={brechos}`.
  // 5. Adicione um ActivityIndicator (Loading) para quando a requisição estiver rodando.
  // ==============================================

import React, { useState } from "react";
import { FlatList, ScrollView, Text, TextInput, View, TouchableOpacity, SafeAreaView, Image } from "react-native";
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { feedStyles } from "../../components/componetsStyles/feedStyle";
import StoreCard from "../../components/storeCard";
import { storeMocks } from "../../mocks/storesMocks";

/*
    Tela de Feed
    Essa tela exibe em forma de lista os brechós cadastrados no app
*/

export default function MainFeed() {
  const [filtroAtivo, setFiltroAtivo] = useState(null);

  return (
    <SafeAreaView style={feedStyles.safeArea}>
      <View style={feedStyles.container}>
        <View style={feedStyles.header}>
          <Image
            source={require("../../assets/images/alfineteLogoAndroid.png")}
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

        <FlatList
          data={storeMocks}
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
      </View>
    </SafeAreaView>
  );
}