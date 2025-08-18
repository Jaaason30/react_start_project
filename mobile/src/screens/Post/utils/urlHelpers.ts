// 统一媒体/头像 URL 辅助函数

import { BASE_URL } from '../../../constants/api';

/**
 * 将相对 URL 补成绝对 URL。
 * 接受 string | null | undefined；若无值返回 undefined。
 */
export const patchUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
};

/**
 * 为头像 URL 附加版本号参数以击穿缓存。
 * - avatarVersion 允许为 0，因此使用 `!= null` 判断。
 * - 自动根据是否已有 query 参数选择 ? 或 &。
 */
export const patchProfileUrl = (
  url?: string | null,
  avatarVersion?: number
): string | undefined => {
  const u = patchUrl(url);
  if (!u) return undefined;
  if (avatarVersion == null) return u;
  const sep = u.includes('?') ? '&' : '?';
  return `${u}${sep}v=${avatarVersion}`;
};
