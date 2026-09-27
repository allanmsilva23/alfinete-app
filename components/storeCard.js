import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { storeCardStyle } from './componetsStyles/storeCardsStyle';

/*
    Recebendo as informações das lojas em forma de props,
    e vão ser exibidas no componente StoreCard.

*/

export default function StoreCard({ id, name, address, rating, tags }) {
  const router = useRouter();
  // Estado para controlar se está favoritado ou não
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <TouchableOpacity onPress={() => router.push(`/store/${id}`)}>
      <View style={storeCardStyle.cardContainer}>
        
        <View>
          <Image source={{ uri: 'https://via.placeholder.com/300x150' }} style={storeCardStyle.coverImage} />
          
          {/* Botão do Coração com o truque para não abrir o card ao clicar */}
          <TouchableOpacity 
            style={storeCardStyle.heartContainer} 
            onPress={(e) => {
              e.stopPropagation(); // Impede que o clique navegue para o perfil
              setIsFavorite(!isFavorite); // Alterna entre verdadeiro e falso
            }}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? "#E15F41" : "#A06D44"} 
            />
          </TouchableOpacity>
        </View>

        <View style={storeCardStyle.infoContainer}>
          <Text style={storeCardStyle.storeName}>{name}</Text>
          <Text style={storeCardStyle.storeAddress} numberOfLines={1}>{address}</Text>

          <View style={storeCardStyle.ratingContainer}>
            <FontAwesome name="star" size={14} color="#F4B400" style={storeCardStyle.starIcon} />
            <Text style={storeCardStyle.ratingNumber}>{rating}</Text>
            <Text style={storeCardStyle.ratingText}>(312 avaliações)</Text>
          </View>

          <View style={storeCardStyle.tagsContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={storeCardStyle.tagBadge}>
                <Text style={storeCardStyle.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

      </View>
    </TouchableOpacity>
  );
}