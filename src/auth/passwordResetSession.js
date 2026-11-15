let token = null;

export function setResetToken(value) {
  token = typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) ? value : null;
}
export function getResetToken() {
  return token;
}
export function clearResetToken() {
  token = null;
}
