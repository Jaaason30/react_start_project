import { BASE_URL } from '../../../constants/api';

export const patchUrl = (url?: string) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${BASE_URL}${url}`;
};

export const patchProfileUrl = (url?: string, avatarVersion?: number) => {
  const u = patchUrl(url);
  return u && avatarVersion ? `${u}?v=${avatarVersion}` : u || undefined;
};