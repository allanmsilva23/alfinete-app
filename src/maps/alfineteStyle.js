/**
 * Estiliza o basemap verdadeiro do OpenFreeMap para lembrar o Figma do Alfinete.
 * Usa o estilo oficial para obter fontes, sprites, tile sources e labels corretos;
 * não inventa ruas, não desenha um grid artificial e não utiliza Google Maps SDK.
 * Se o JSON não puder ser lido/convertido, o componente usa a URL original.
 */
const BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const STYLE_URL = BASE_STYLE_URL;
const P = {
  ground: '#E9EEE3', park: '#D3E3C4', water: '#D9E9E3',
  building: '#F2EDE2', buildingBorder: '#DFD7C8',
  street: '#FFFFFF', streetBorder: '#E1DDD4', text: '#998F82',
};
function absoluteUrl(raw) {
  if (!raw || typeof raw !== 'string') return raw;
  if (/^(https?:|data:|mapbox:|asset:)/i.test(raw)) return raw;
  if (raw.startsWith('//')) return `https:${raw}`;
  if (raw.startsWith('/')) return `https://tiles.openfreemap.org${raw}`;
  return `${BASE_STYLE_URL}/${raw.replace(/^\.\//, '')}`;
}
function recolor(layer) {
  if (!layer || !layer.type) return layer;
  const id = String(layer.id || '').toLowerCase();
  const source = String(layer['source-layer'] || '').toLowerCase();
  const name = `${id} ${source}`;
  const copy = { ...layer, paint: { ...(layer.paint || {}) } };
  const park = /park|garden|green|wood|forest|grass|recreation|nature|landcover/.test(name);
  const water = /water|river|lake|sea|ocean/.test(name);
  const building = /building/.test(name);
  const road = /road|street|transport|highway|bridge|tunnel|path|motorway|trunk/.test(name);
  if (layer.type === 'background') copy.paint['background-color'] = P.ground;
  if (layer.type === 'fill') {
    if (water) copy.paint['fill-color'] = P.water;
    else if (park) copy.paint['fill-color'] = P.park;
    else if (building) {
      copy.paint['fill-color'] = P.building;
      copy.paint['fill-outline-color'] = P.buildingBorder;
    } else if (/landuse|landcover|land/.test(name)) copy.paint['fill-color'] = P.ground;
  }
  if (layer.type === 'line') {
    if (road) copy.paint['line-color'] = /casing|outline|border/.test(id) ? P.streetBorder : P.street;
    else if (water) copy.paint['line-color'] = P.water;
    else if (/boundary|admin/.test(name)) copy.paint['line-color'] = P.streetBorder;
  }
  if (layer.type === 'symbol' && layer.layout && layer.layout['text-field'] !== undefined) {
    copy.paint['text-color'] = P.text;
    copy.paint['text-halo-color'] = '#F8F7F0';
    copy.paint['text-halo-width'] = 1.1;
    if (/poi|housenumber/.test(name)) copy.layout = { ...layer.layout, visibility: 'none' };
  }
  return copy;
}
async function loadAlfineteStyle() {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 7000) : null;
  try {
    const response = await fetch(STYLE_URL, controller ? { signal: controller.signal } : undefined);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const style = await response.json();
    if (!style || !Array.isArray(style.layers) || !style.sources) throw new Error('Estilo OpenFreeMap inválido');
    const sources = {};
    for (const [key, value] of Object.entries(style.sources)) {
      const source = { ...value };
      if (source.url) source.url = absoluteUrl(source.url);
      if (Array.isArray(source.tiles)) source.tiles = source.tiles.map(absoluteUrl);
      sources[key] = source;
    }
    return {
      ...style,
      ...(style.glyphs ? { glyphs: absoluteUrl(style.glyphs) } : {}),
      ...(style.sprite ? { sprite: absoluteUrl(style.sprite) } : {}),
      sources,
      layers: style.layers.map(recolor),
    };
  } finally { if (timer) clearTimeout(timer); }
}
module.exports = { BASE_STYLE_URL, loadAlfineteStyle, recolor, absoluteUrl };
