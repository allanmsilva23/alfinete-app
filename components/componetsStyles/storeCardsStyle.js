import { StyleSheet } from 'react-native';

/*
    Estilização do componente StoreCard

*/

export const storeCardStyle = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  coverImage: {
    width: '100%',
    height: 160,
  },
  infoContainer: {
    padding: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  storeAddress: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  tagBadge: {
    backgroundColor: '#F3EFEA',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E6DFD6',
  },
  tagText: {
    fontSize: 12,
    color: '#A06D44',
    fontWeight: '500',
  },
  heartContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  starIcon: {
    marginRight: 2,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginLeft: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 4,
  }
});