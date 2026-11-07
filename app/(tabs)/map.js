import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Linking, Platform, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { api, safeImageUrl } from '../../src/api/client';

// Alfinete: porta da lógica do Flutter PontosColetaPage, não do backend da Ria Green.
const COLORS = {
  terracotta: '#B84D3D', brown: '#8E7756', cream: '#FBF3E7',
  muted: '#A99886', mint: '#6FE7CD', white: '#FFFFFF', ground: '#E9EEE3',
};
const FALLBACK = { latitude: -23.55052, longitude: -46.63331, latitudeDelta: 0.055, longitudeDelta: 0.055 };
const NUMBER = n => Number(n);
const validPoint = (lat, lng) => lat !== null && lat !== undefined && lng !== null && lng !== undefined &&
  Number.isFinite(NUMBER(lat)) && Number.isFinite(NUMBER(lng)) &&
  Math.abs(NUMBER(lat)) <= 90 && Math.abs(NUMBER(lng)) <= 180;
const rad = v => v * Math.PI / 180;
function metersBetween(a, b) {
  const dl = rad(b.latitude - a.latitude);
  const dg = rad(b.longitude - a.longitude);
  const h = Math.sin(dl / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dg / 2) ** 2;
  return 12742000 * Math.asin(Math.min(1, Math.sqrt(Math.max(0, h))));
}
const distanceText = meters => meters == null ? 'Distância indisponível' :
  meters < 1000 ? `${Math.round(meters)} m em linha reta` :
  `${(meters / 1000).toFixed(1).replace('.', ',')} km em linha reta`;
const normalized = str => String(str ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

// Mesmo fluxo robusto do Flutter: permissão -> posição atual com limite -> última posição.
// Não bloqueia o catálogo quando o GPS é negado ou a leitura falha.
async function requestPosition() {
  const enabled = await Location.hasServicesEnabledAsync().catch(() => false);
  const currentPermission = await Location.getForegroundPermissionsAsync();
  const permission = currentPermission.granted ? currentPermission :
    await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) return { coords: null, permission: 'denied' };

  const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000, requiredAccuracy: 2000 }).catch(() => null);
  if (!enabled) {
    return { coords: last?.coords ? { latitude: last.coords.latitude, longitude: last.coords.longitude } : null,
      permission: 'gps-off' };
  }

  // Versões do expo-location podem não aceitar timeout por parâmetro: aplica corrida segura.
  // O timeout resolve o carregamento da interface, sem interromper a chamada nativa.
  const fresh = Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
    .then(value => value?.coords ?? null).catch(() => null);
  const received = await Promise.race([
    fresh,
    new Promise(resolve => setTimeout(() => resolve(null), 10000)),
  ]);
  const source = received || last?.coords;
  return { coords: source ? { latitude: source.latitude, longitude: source.longitude } : null,
    permission: source ? 'granted' : 'unavailable' };
}

function nativeGoogleMapsUrl(store) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${store.latitude},${store.longitude}`)}&travelmode=driving`;
}

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef(null);
  const regionRef = useRef(FALLBACK);
  const mounted = useRef(false);
  const [stores, setStores] = useState([]);
  const [coords, setCoords] = useState(null);
  const [permission, setPermission] = useState('unknown');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(true);
  const [statusText, setStatusText] = useState('Preparando mapa...');
  const [reload, setReload] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [mapTimedOut, setMapTimedOut] = useState(false);

  const loadAll = useCallback(async active => {
    if (!active()) return;
    setBusy(true); setStatusText('Verificando localização...');
    // Diferente do fluxo antigo, aguarda posição antes de classificar brechós.
    let position = { coords: null, permission: 'unavailable' };
    try { position = await requestPosition(); }
    catch (err) { console.warn('[ALFINETE/MAPA] localização:', err?.message); }
    if (!active()) return;
    setCoords(position.coords); setPermission(position.permission);
    setStatusText('Buscando brechós aprovados...');
    try {
      const result = await api('/brechos/mapa', { auth: false });
      if (!active()) return;
      const list = Array.isArray(result) ? result :
        Array.isArray(result?.brechos) ? result.brechos :
        Array.isArray(result?.data) ? result.data : [];
      setStores(list);
      console.log('[ALFINETE/MAPA] brechós recebidos:', list.length);
      setStatusText('');
    } catch (err) {
      if (active()) setStatusText(err?.message || 'Falha ao carregar brechós.');
    } finally {
      if (active()) setBusy(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    let active = true;
    mounted.current = true;
    loadAll(() => active);
    return () => { active = false; mounted.current = false; };
  }, [loadAll, reload]));

  // onMapReady significa criação da view, não recebimento das ruas.
  useEffect(() => {
    if (!mapReady || tilesLoaded) return undefined;
    const t = setTimeout(() => {
      if (mounted.current && !tilesLoaded) {
        setMapTimedOut(true);
        console.warn('[ALFINETE/MAPA] onMapReady sem onMapLoaded: conferir SDK/chave/rede.');
      }
    }, 15000);
    return () => clearTimeout(t);
  }, [mapReady, tilesLoaded]);

  const points = useMemo(() => stores.filter(s => validPoint(s.latitude, s.longitude))
    .map(s => {
      const position = { latitude: NUMBER(s.latitude), longitude: NUMBER(s.longitude) };
      return { ...s, ...position, distanceMeters: coords ? metersBetween(coords, position) : null };
    }).sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity) ||
      String(a.nome ?? '').localeCompare(String(b.nome ?? ''))), [stores, coords]);

  const visible = useMemo(() => {
    const value = normalized(query);
    return value ? points.filter(s => normalized([s.nome, s.endereco_curto, s.bairro, s.cidade, s.estilos].join(' ')).includes(value)) : points;
  }, [query, points]);
  const selected = visible.find(s => String(s.id) === String(selectedId)) || visible[0] || null;

  const moveTo = useCallback((target, delta = 0.018) => {
    if (!target || !mapReady || !mapRef.current) return;
    try {
      mapRef.current.animateToRegion({ latitude: target.latitude, longitude: target.longitude,
        latitudeDelta: delta, longitudeDelta: delta }, 550);
    } catch (err) { console.warn('[ALFINETE/MAPA] animação:', err?.message); }
  }, [mapReady]);

  // Flutter enquadra usuário + estabelecimento mais próximo; aplicamos o mesmo princípio.
  useEffect(() => {
    if (!mapReady || !tilesLoaded || busy || !mapRef.current) return;
    const nearest = visible.slice(0, 4).map(s => ({ latitude: s.latitude, longitude: s.longitude }));
    const bounds = coords ? [coords, ...nearest] : nearest;
    if (bounds.length > 1) {
      try {
        mapRef.current.fitToCoordinates(bounds, { edgePadding: { top: 140, right: 45, bottom: 260, left: 45 }, animated: true });
      } catch (err) { console.warn('[ALFINETE/MAPA] enquadramento:', err?.message); }
    } else if (bounds.length === 1) moveTo(bounds[0], 0.03);
  }, [mapReady, tilesLoaded, busy, coords?.latitude, coords?.longitude, visible, moveTo]);

  const refresh = () => setReload(n => n + 1);
  const recenter = async () => {
    const current = await requestPosition().catch(() => ({ coords: null, permission: 'unavailable' }));
    setPermission(current.permission);
    if (!current.coords) {
      Alert.alert('Localização indisponível', 'Ative o GPS e a permissão de localização. Você ainda pode consultar os brechós.');
      return;
    }
    setCoords(current.coords);
    moveTo(current.coords, 0.024);
  };
  const zoom = factor => {
    const region = regionRef.current;
    moveTo(region, Math.max(0.002, Math.min(0.8, region.latitudeDelta * factor)));
  };
  const openRoute = async store => {
    try { await Linking.openURL(nativeGoogleMapsUrl(store)); }
    catch { Alert.alert('Rota indisponível', 'Não foi possível abrir o Google Maps.'); }
  };
  const openExternalMap = async () => {
    const target = selected || coords;
    const url = target ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${target.latitude},${target.longitude}`)}` :
      'https://www.google.com/maps';
    try { await Linking.openURL(url); } catch { Alert.alert('Erro', 'Não foi possível abrir o mapa externo.'); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.fill}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          mapType="standard"
          initialRegion={FALLBACK}
          showsBuildings={false}
          showsTraffic={false}
          showsMyLocationButton={false}
          showsCompass={false}
          toolbarEnabled={false}
          onMapReady={() => { console.log('[ALFINETE/MAPA] onMapReady'); setMapReady(true); }}
          onMapLoaded={() => { console.log('[ALFINETE/MAPA] onMapLoaded'); setTilesLoaded(true); setMapTimedOut(false); }}
          onRegionChangeComplete={r => { if (r) regionRef.current = r; }}
        >
          {coords && <>
            <Circle center={coords} radius={90} strokeWidth={0} fillColor="rgba(111,231,205,0.22)" />
            <Marker coordinate={coords} anchor={{ x: 0.5, y: 0.5 }} title="Você está aqui">
              <View style={styles.userMarker}><View style={styles.userCenter} /></View>
            </Marker>
          </>}
          {visible.map(store => (
            <Marker key={String(store.id)} coordinate={{ latitude: store.latitude, longitude: store.longitude }}
              anchor={{ x: 0.5, y: 1 }} onPress={() => { setSelectedId(store.id); moveTo(store, 0.018); }}
              title={store.nome ?? 'Brechó'}>
              <View style={styles.pin}><MaterialCommunityIcons name="tshirt-crew" color="white" size={20} /></View>
            </Marker>
          ))}
          {coords && selected && <Polyline
            coordinates={[coords, { latitude: selected.latitude, longitude: selected.longitude }]}
            strokeColor={COLORS.terracotta} strokeWidth={2} lineDashPattern={[9, 7]} />}
        </MapView>

        <View style={styles.searchArea}>
          <View style={styles.searchBox}>
            <Feather name="search" size={21} color="#D8B551" />
            <TextInput style={styles.searchInput} value={query} onChangeText={setQuery}
              placeholder="Buscar brechós..." placeholderTextColor="#BBA994" />
            <TouchableOpacity onPress={query ? () => setQuery('') : refresh} accessibilityLabel={query ? 'Limpar busca' : 'Atualizar'}>
              <Feather name={query ? 'x' : 'refresh-cw'} color={COLORS.brown} size={19} />
            </TouchableOpacity>
          </View>
          {permission !== 'granted' && !busy && <TouchableOpacity style={styles.notice} onPress={recenter}>
            <Feather name="navigation" size={14} color={COLORS.brown} />
            <Text style={styles.noticeText}>Ative a localização para consultar as distâncias.</Text>
          </TouchableOpacity>}
          {!busy && statusText ? <Text style={styles.error}>{statusText}</Text> : null}
          {mapTimedOut && !tilesLoaded && <View style={styles.mapWarning}>
            <Text style={styles.warningTitle}>O Google Maps não carregou as ruas.</Text>
            <Text style={styles.warningText}>O mapa nativo foi iniciado, mas não recebeu os dados cartográficos. Você pode continuar usando a busca e abrir o Google Maps.</Text>
            <TouchableOpacity onPress={openExternalMap} style={styles.warningButton}>
              <Feather name="external-link" size={15} color={COLORS.terracotta} />
              <Text style={styles.warningButtonText}>Abrir no Google Maps</Text>
            </TouchableOpacity>
          </View>}
        </View>

        {busy && <View style={styles.loader}>
          <ActivityIndicator color={COLORS.terracotta} /><Text style={styles.loaderText}>{statusText || 'Carregando...'}</Text>
        </View>}
        {!busy && !visible.length && <View style={styles.empty}>
          <Text style={styles.emptyText}>{query ? 'Nenhum brechó encontrado nessa busca.' :
            stores.length ? 'Nenhum brechó possui coordenadas válidas.' : 'Nenhum brechó disponível.'}</Text>
        </View>}
        <View style={styles.controls}>
          <View style={styles.zoomBox}>
            <TouchableOpacity style={styles.controlButton} onPress={() => zoom(0.6)}><Feather name="plus" size={23} color={COLORS.brown} /></TouchableOpacity>
            <View style={styles.controlDivider} />
            <TouchableOpacity style={styles.controlButton} onPress={() => zoom(1.7)}><Feather name="minus" size={23} color={COLORS.brown} /></TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.controlButton, styles.gps]} onPress={recenter}>
            <Feather name="crosshair" size={23} color={COLORS.terracotta} />
          </TouchableOpacity>
        </View>
        {selected && !busy && <View style={styles.card}>
          <TouchableOpacity style={styles.cardTop} onPress={() => router.push(`/store/${selected.id}`)} activeOpacity={0.8}>
            {safeImageUrl(selected.imagem) ? <Image source={{ uri: safeImageUrl(selected.imagem) }} style={styles.photo} /> :
              <View style={[styles.photo, styles.photoFallback]}><Feather name="shopping-bag" size={22} color="#D8B551" /></View>}
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={2}>{selected.nome}</Text>
              <Text style={styles.details} numberOfLines={2}>{distanceText(selected.distanceMeters)}
                {selected.estilos ? ` · ${selected.estilos}` : ''}</Text>
            </View>
            <Feather name="chevron-right" color={COLORS.brown} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.route} onPress={() => openRoute(selected)}>
            <Feather name="corner-up-right" color="white" size={20} />
            <Text style={styles.routeText}>Traçar rota</Text>
            <Feather name="external-link" color="white" size={18} />
          </TouchableOpacity>
        </View>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.ground }, fill: { flex: 1 },
  searchArea: { position: 'absolute', left: 20, right: 20, top: 18 },
  searchBox: { minHeight: 56, paddingHorizontal: 16, borderWidth: 1, borderColor: '#D8C9B7', borderRadius: 18,
    backgroundColor: COLORS.cream, elevation: 4, flexDirection: 'row', alignItems: 'center' },
  searchInput: { flex: 1, padding: 12, color: COLORS.brown, fontSize: 15 },
  notice: { flexDirection: 'row', alignSelf: 'flex-start', gap: 7, alignItems: 'center', borderRadius: 12,
    backgroundColor: COLORS.white, marginTop: 10, padding: 9, elevation: 2 },
  noticeText: { color: COLORS.brown, fontSize: 12 },
  error: { marginTop: 9, borderRadius: 10, padding: 11, backgroundColor: '#FFF2ED', color: COLORS.terracotta },
  mapWarning: { marginTop: 10, backgroundColor: '#FFFDF9', borderRadius: 14, padding: 12, elevation: 3 },
  warningTitle: { color: COLORS.terracotta, fontWeight: '700', fontSize: 13 },
  warningText: { marginTop: 5, color: COLORS.brown, fontSize: 12, lineHeight: 18 },
  warningButton: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 },
  warningButtonText: { fontSize: 12, color: COLORS.terracotta, fontWeight: '700' },
  pin: { backgroundColor: COLORS.terracotta, borderWidth: 2, borderColor: 'white', borderRadius: 22,
    width: 41, height: 41, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  userMarker: { width: 29, height: 29, borderRadius: 15, borderColor: '#FFF', borderWidth: 3,
    backgroundColor: COLORS.mint, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  userCenter: { height: 9, width: 9, borderRadius: 5, backgroundColor: 'white' },
  loader: { position: 'absolute', top: '44%', alignSelf: 'center', padding: 14, borderRadius: 15,
    flexDirection: 'row', gap: 8, backgroundColor: 'white', elevation: 4 },
  loaderText: { color: COLORS.brown },
  empty: { position: 'absolute', top: '36%', marginHorizontal: 22, alignSelf: 'center', padding: 18,
    backgroundColor: 'white', elevation: 3, borderRadius: 14 },
  emptyText: { color: COLORS.brown, fontSize: 13 },
  controls: { position: 'absolute', right: 17, bottom: 205, gap: 13, alignItems: 'center' },
  zoomBox: { borderRadius: 18, backgroundColor: 'white', elevation: 5 },
  controlButton: { width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  controlDivider: { marginHorizontal: 10, height: 1, backgroundColor: '#EAE0D0' },
  gps: { backgroundColor: 'white', borderRadius: 26, elevation: 5 },
  card: { position: 'absolute', bottom: 15, left: 16, right: 16, borderRadius: 20, padding: 14,
    backgroundColor: 'white', elevation: 8 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photo: { width: 56, height: 56, borderRadius: 12, backgroundColor: COLORS.cream },
  photoFallback: { alignItems: 'center', justifyContent: 'center' },
  name: { color: COLORS.brown, fontSize: 16, fontWeight: '800' },
  details: { color: COLORS.muted, fontSize: 11, marginTop: 5, lineHeight: 15 },
  route: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    backgroundColor: COLORS.terracotta, paddingVertical: 13, marginTop: 12, borderRadius: 12 },
  routeText: { color: 'white', fontSize: 15, fontWeight: '800' },
});
