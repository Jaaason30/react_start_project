// src/constants/api.ts

import { Platform } from 'react-native';

export const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8080'
  : 'http://localhost:8080';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',

  // 当前用户接口（JWT）
  USER_ME: '/api/user/me',
  USER_ME_UPDATE: '/api/user/me',
  USER_ME_FOLLOWERS: '/api/user/me/followers',
  USER_ME_FOLLOWING: '/api/user/me/following',

  // 其它用户接口（shortId）
  USER_BY_SHORT_ID: '/api/user/profile/short',      // + '/{shortId}'
  USER_FOLLOW: '/api/user/follow',                  // + '/{shortId}' (POST/DELETE)
  USER_FOLLOWERS_BY_SHORT_ID: '/api/user',          // + '/{shortId}/followers'
  USER_FOLLOWING_BY_SHORT_ID: '/api/user',          // + '/{shortId}/following'

  // 帖子
  POSTS_FEED: '/api/posts/feed',
  POSTS_ME: '/api/posts/me',
  POSTS_BY_AUTHOR: '/api/posts/user/:authorUuid',   // + '?page=…&size=…' （使用 UUID）
  POST_DETAIL: '/api/posts',                        // GET '/api/posts/{uuid}'
  POST_REACTIONS: '/api/posts/:uuid/reactions',
  POST_COMMENTS: '/api/posts/:uuid/comments',

  // 搜索
  POSTS_SEARCH: '/api/posts/search',                 // GET '/api/posts/search?kw=…&shortId=…'

  // 标签
  TAGS_HOT: '/api/tags/hot',                         // GET '/api/tags/hot?limit=…'

  // 评论
  COMMENT_LIKES: '/api/comments/:id/likes',
  COMMENT_REPLIES: '/api/comments/:id/replies',
  COMMENT_DELETE: '/api/comments/:id',
} as const;
