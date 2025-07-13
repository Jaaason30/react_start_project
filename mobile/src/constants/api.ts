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

  // User
  USER_PROFILE: '/api/user/profile',
  USER_PROFILE_SHORT: '/api/user/profile/short',
  USER_UPDATE: '/api/user/profile',
  USER_FOLLOW: '/api/user/follow',
  USER_FOLLOWERS: '/api/user/followers',
  USER_FOLLOWING: '/api/user/following',

  // Posts
  POSTS_FEED: '/api/posts/feed',
  POST_DETAIL: '/api/posts',                      // GET /api/posts/{uuid}
  POST_REACTIONS: '/api/posts/:uuid/reactions',
  POST_COMMENTS: '/api/posts/:uuid/comments',

  // Search
  POSTS_SEARCH: '/api/posts/search',               // GET /api/posts/search?kw=…&shortId=…
  
  // Tags
  TAGS_HOT: '/api/tags/hot',                       // GET /api/tags/hot?limit=…

  // Comments
  COMMENT_LIKES: '/api/comments/:id/likes',
  COMMENT_REPLIES: '/api/comments/:id/replies',
  COMMENT_DELETE: '/api/comments/:id',

  // Posts by author
  POSTS_BY_AUTHOR: '/api/posts/user/:authorUuid'
} as const;
