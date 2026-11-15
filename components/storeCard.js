
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { FontAwesome, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { storeCardStyle } from './componetsStyles/storeCardsStyle';
import FavoriteToggle from './FavoriteToggle';

export default function StoreCard({
  id,
  name,
  address,
  rating,
  tags = [],
  image,
  reviewCount,
  isInitiallyFavorite = null,
  onFavoriteChange,
}) {
  const router = useRouter();

  const handleOpenStore = () => {
    router.push(`/store/${id}`);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handleOpenStore}
    >
      <View style={storeCardStyle.cardContainer}>
        <View>
          {image ? (
            <Image source={{uri:image}} style={storeCardStyle.coverImage}/>
          ) : (
            <View style={[storeCardStyle.coverImage,{backgroundColor:'#EFEAE4',alignItems:'center',justifyContent:'center'}]}>
              <Feather name="shopping-bag" size={40} color="#B8A28D"/>
              <Text style={{color:'#A06D44',marginTop:8,fontSize:12}}>Fotos em breve</Text>
            </View>
          )}

          <FavoriteToggle
            storeId={id}
            style={storeCardStyle.heartContainer}
            size={20}
            initialFavorite={isInitiallyFavorite}
            onChange={(favorite) => {
              onFavoriteChange?.(id, favorite);
            }}
          />
        </View>

        <View style={storeCardStyle.infoContainer}>
          <Text style={storeCardStyle.storeName}>
            {name}
          </Text>

          <Text
            style={storeCardStyle.storeAddress}
            numberOfLines={1}
          >
            {address}
          </Text>

          <View style={storeCardStyle.ratingContainer}>
            <FontAwesome
              name="star"
              size={14}
              color="#F4B400"
              style={storeCardStyle.starIcon}
            />

            <Text style={storeCardStyle.ratingNumber}>
              {rating ?? 'N/A'}
            </Text>

            {reviewCount != null && (
              <Text style={storeCardStyle.ratingText}>
                ({reviewCount} avaliações)
              </Text>
            )}
          </View>

          <View style={storeCardStyle.tagsContainer}>
            {tags.map((tag, index) => (
              <View
                key={`${tag}-${index}`}
                style={storeCardStyle.tagBadge}
              >
                <Text style={storeCardStyle.tagText}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}