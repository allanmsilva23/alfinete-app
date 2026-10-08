import { StyleSheet, Platform, StatusBar } from 'react-native';

/*

    Estilização da tela de Feed, que contém a lista de brechós.

*/

export const feedStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 15,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E6DFD6',
  },
  filtersWrapper: {
    marginBottom: 15,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25, 
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D8C5B3', 
  },
  filterPillActive: {
    backgroundColor: '#65E3C1', 
    borderColor: '#65E3C1',
  },
  filterText: {
    color: '#A06D44',
    fontWeight: '600',
    fontSize: 14,
    marginHorizontal: 6,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    marginBottom: 15,
    alignSelf: 'center',
  }
});