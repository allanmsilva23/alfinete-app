import {api} from './client';
export const listFavorites=()=>api('/favoritos');
export async function isFavorite(id){const data=await api(`/favoritos/${id}`);return data.favorito===true;}
export const addFavorite=id=>api(`/favoritos/${id}`,{method:'PUT'});
export const removeFavorite=id=>api(`/favoritos/${id}`,{method:'DELETE'});