import React from 'react';
import { View, Text, Image } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { storeCardStyle } from '../components/componetsStyles/storeCardsStyle';

/*
    Recebendo as informações das lojas em forma de props,
    e vão ser exibidas no componente StoreCard.

*/

export default function StoreCard({ name, address, rating, tags }) {
  return (
    <View style={storeCardStyle.cardContainer}>
      
      <View>
        <Image source={{ uri: 'https://via.placeholder.com/300x150' }} style={storeCardStyle.coverImage} />
        <View style={storeCardStyle.heartContainer}>
          <Ionicons name="heart-outline" size={20} color="#A06D44" />
        </View>
      </View>

      <View style={storeCardStyle.infoContainer}>
        <Text style={storeCardStyle.storeName}>{name}</Text>
      
        <Text style={storeCardStyle.storeAddress} numberOfLines={1}>{address}</Text>

        <View style={storeCardStyle.ratingContainer}>
          <FontAwesome name="star" size={14} color="#F4B400" style={storeCardStyle.starIcon} />
          <FontAwesome name="star" size={14} color="#F4B400" style={storeCardStyle.starIcon} />
          <FontAwesome name="star" size={14} color="#F4B400" style={storeCardStyle.starIcon} />
          <FontAwesome name="star" size={14} color="#F4B400" style={storeCardStyle.starIcon} />
          <FontAwesome name="star-half-empty" size={14} color="#E6DFD6" style={storeCardStyle.starIcon} />
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
  );
}