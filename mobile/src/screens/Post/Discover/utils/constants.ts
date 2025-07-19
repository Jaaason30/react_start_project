export const TOP_TABS = ['关注', '推荐'] as const;

export const BOTTOM_TABS = [
  { key: 'heart',  label: '心动', icon: 'heart-outline',      screen: 'Dashboard'     },
  { key: 'chat',   label: '聊天', icon: 'chatbubbles-outline', screen: 'SeatOverview' },
  { key: 'post',   label: '',     icon: '',                    screen: 'PostCreation'  },
  { key: 'square', label: '广场', icon: 'apps-outline',        screen: 'Discover'      },
  { key: 'me',     label: '我的', icon: 'person-outline',      screen: 'PlayerProfile' },
] as const;