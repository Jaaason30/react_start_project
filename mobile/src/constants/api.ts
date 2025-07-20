// src/constants/api.ts

import { Platform } from 'react-native';

export const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:8080'
  : 'http://localhost:8080';

export const API_ENDPOINTS = {
  // --------- Auth ----------
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',

  // ---- 当前用户接口（JWT） ----
  USER_ME: '/api/user/me',
  USER_ME_UPDATE: '/api/user/me',
  USER_ME_FOLLOWERS: '/api/user/me/followers',
  USER_ME_FOLLOWING: '/api/user/me/following',

  // ---- 用户资料（shortId） ----
  USER_BY_SHORT_ID: '/api/user/profile/short', // + '/{shortId}'
  USER_FOLLOW_SHORT: '/api/user/follow',      // + '/{shortId}' (POST/DELETE)
  USER_FOLLOWERS_BY_SHORT_ID: '/api/user',    // + '/{shortId}/followers'
  USER_FOLLOWING_BY_SHORT_ID: '/api/user',    // + '/{shortId}/following'

  // ---- 帖子 - 当前用户 ----
  POSTS_ME: '/api/posts/me',                  // GET 当前用户的帖子

  // ---- 帖子 - 基本功能 ----
  POSTS_FEED: '/api/posts/feed',              // GET + '?type=USER|OFFICIAL|FOLLOWED'
  POSTS_CREATE: '/api/posts',                 // POST 创建帖子（multipart/form-data）
  POST_DETAIL: '/api/posts',                  // GET '/api/posts/{uuid}'
  POST_UPDATE: '/api/posts',                  // PATCH '/api/posts/{uuid}'
  POST_DELETE: '/api/posts',                  // DELETE '/api/posts/{uuid}'

  // ---- 帖子 - 按作者查询 ----
  POSTS_BY_AUTHOR: '/api/posts/user',         // + '/{authorUuid}' (UUID)
  POSTS_BY_SHORT_ID: '/api/posts/user/short', // + '/{shortId}'

  // ---- 帖子 - 互动 ----
  POST_REACTIONS: '/api/posts/:uuid/reactions',
  POST_COMMENTS: '/api/posts/:uuid/comments',

  // ---- 搜索 ----
  POSTS_SEARCH: '/api/posts/search',          // GET + '?kw=…'

  // ---- 标签 ----
  TAGS_HOT: '/api/tags/hot',                  // GET + '?limit=…'
  POSTS_BY_TAG: '/api/posts/tag',             // GET + '/{tagName}'

  // ---- 评论 ----
  COMMENT_LIKES: '/api/comments/:id/likes',
  COMMENT_REPLIES: '/api/comments/:id/replies',
  COMMENT_DELETE: '/api/comments/:id',
 TEXT_IMAGES_GENERATE:'/api/text-images/generate',
 TEXT_IMAGES_HISTORY: '/api/text-images/history',
} as const;
