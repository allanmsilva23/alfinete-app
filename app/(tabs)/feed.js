import React, { useState, useRef, useEffect } from "react";
import { FlatList, ScrollView, Text, TextInput, View, TouchableOpacity, Image, Animated, ActivityIndicator, Platform } from "react-native";
import { Feather, Ionicons, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { feedStyles } from "../../components/componetsStyles/feedStyle";
import StoreCard from "../../components/storeCard";
import {api,safeImageUrl} from "../../src/api/client";
import {useFocusEffect} from "expo-router";

/*
    Tela de Feed
    Essa tela exibe em forma de lista os brechós cadastrados no app
*/

export default function MainFeed() {
  const router = useRouter();
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
  
  const [brechos, setBrechos] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(React.useCallback(() => {
    let active=true;setLoading(true);
    api('/brechos/filtros',{auth:false}).then(rows=>{if(active){setBrechos((rows||[]).map(loja=>({
      id:String(loja.id),name:loja.nome,address:loja.endereco_curto,
      rating:loja.nota_media!=null?Number(loja.nota_media):null,
      reviewCount:loja.total_avaliacoes,
      tags:Array.isArray(loja.estilos)?loja.estilos:[],
      image:safeImageUrl(loja.imagem),preco:loja.faixa_preco||''
    })));setErro('');}}).catch(e=>{if(active)setErro(e.message);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]));
  const estilos=[...new Set(brechos.flatMap(b=>b.tags))];
  const precos=[...new Set(brechos.map(b=>b.preco).filter(Boolean))];
  const filtered=brechos.filter(b=>b.name.toLowerCase().includes(busca.trim().toLowerCase()) &&
    (!estilo||b.tags.includes(estilo)) && (!preco||b.preco===preco) &&
    (!notaMin||Number(b.rating||0)>=notaMin));
  return (
    <SafeAreaView style={feedStyles.safeArea}>
      <View style={feedStyles.container}>
        <View style={feedStyles.header}>
          
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
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={feedStyles.searchInput}
            placeholder="Buscar brechós..."
            value={busca}
            onChangeText={setBusca}
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

        {filtroAtivo && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{padding:10,gap:8,alignItems:'center'}}>
          <TouchableOpacity onPress={()=>{setEstilo('');setPreco('');setNotaMin(0);setFiltroAtivo(null);}} style={{padding:10,backgroundColor:'#FFFDF9',borderRadius:20}}><Text>Limpar</Text></TouchableOpacity>
          {(filtroAtivo==='estilo'?estilos:filtroAtivo==='preco'?precos:[1,2,3,4,5]).map(item=><TouchableOpacity key={String(item)} style={{backgroundColor:'#FFFDF9',padding:10,borderRadius:20,borderColor:'#EAE0D0',borderWidth:1}}
            onPress={()=>{if(filtroAtivo==='estilo')setEstilo(estilo===item?'':item);else if(filtroAtivo==='preco')setPreco(preco===item?'':item);else setNotaMin(notaMin===item?0:item);setFiltroAtivo(null);}}>
            <Text style={{color:'#8A5A38'}}>{filtroAtivo==='nota'?`${item}+ estrelas`:item}</Text></TouchableOpacity>)}
        </ScrollView>}
        {!!erro&&<Text style={{color:'#C95E42',padding:10}}>{erro}</Text>}
        {/* Lista de brechós reais aprovados */}
        {loading ? (
          <ActivityIndicator size="large" color="#A06D44" style={{ marginTop: 50 }} />
        ) : (
          <Animated.FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={{textAlign:'center',color:'#8A5A38',padding:20}}>Nenhum brechó encontrado.</Text>}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={feedStyles.listContainer}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          renderItem={({ item }) => (
            <StoreCard
              id={item.id}
              name={item.name}
              address={item.address}
              rating={item.rating}
              tags={item.tags}
              image={item.image}
              reviewCount={item.reviewCount}
            />
          )}
        />
        )}
      </View>
    </SafeAreaView>
  );
}