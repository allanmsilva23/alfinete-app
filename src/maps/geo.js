/** Funções puras de geografia usadas na tela de mapas. */
function isCoordinate(lat, lon) {
  return lat !== null && lat !== undefined && lon !== null && lon !== undefined &&
    String(lat).trim() !== '' && String(lon).trim() !== '' &&
    Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)) &&
    Math.abs(Number(lat)) <= 90 && Math.abs(Number(lon)) <= 180;
}
function radians(value) { return value * Math.PI / 180; }
function distanceMeters(a, b) {
  const dLat = radians(Number(b.latitude) - Number(a.latitude));
  const dLon = radians(Number(b.longitude) - Number(a.longitude));
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(Number(a.latitude))) * Math.cos(radians(Number(b.latitude))) *
    Math.sin(dLon / 2) ** 2;
  return 12742000 * Math.atan2(Math.sqrt(Math.max(0, h)), Math.sqrt(Math.max(0, 1 - h)));
}
function distanceLabel(meters) {
  if (meters === null || meters === undefined || !Number.isFinite(meters)) return 'Distância indisponível';
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}
function norm(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}
function storesWithCoords(stores, user) {
  return (Array.isArray(stores) ? stores : [])
    .filter(s => isCoordinate(s.latitude, s.longitude))
    .map(s => {
      const latitude = Number(s.latitude);
      const longitude = Number(s.longitude);
      return {
        ...s, latitude, longitude,
        distanceMeters: user ? distanceMeters(user, {latitude, longitude}) : null,
      };
    })
    .sort((a, b) => (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity) ||
      String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR'));
}
function boundsOf(points) {
  if (!points.length) return null;
  return [
    Math.min(...points.map(p => p.longitude)),
    Math.min(...points.map(p => p.latitude)),
    Math.max(...points.map(p => p.longitude)),
    Math.max(...points.map(p => p.latitude)),
  ];
}
module.exports = { isCoordinate, distanceMeters, distanceLabel, norm, storesWithCoords, boundsOf };
