# 搜索功能改进技术方案

## 1. 搜索历史记录功能

### 技术实现要点
- **存储方案**: 使用 AsyncStorage 持久化存储搜索历史
- **数据结构**: 
  ```typescript
  interface SearchHistory {
    keyword: string;
    timestamp: number;
    count: number; // 搜索次数
  }
  ```
- **功能细节**:
  - 最多保存 20 条历史记录
  - 支持删除单条/清空所有历史
  - 按时间倒序展示
  - 相同关键词更新时间戳和计数
- **UI组件**:
  - 历史记录列表组件
  - 单条记录支持点击搜索、长按删除
  - 清空历史按钮

### 具体任务
- [ ] 创建 `useSearchHistory` Hook
- [ ] 实现 AsyncStorage 读写逻辑
- [ ] 设计历史记录 UI 组件
- [ ] 添加删除/清空功能
- [ ] 处理历史记录去重和排序

## 2. 搜索建议/自动补全

### 技术实现要点
- **API接口**: 新增 `/api/posts/suggestions?q={query}` 端点
- **防抖处理**: 使用 lodash.debounce，延迟 300ms
- **数据缓存**: 使用 Map 缓存最近的建议结果
- **显示逻辑**:
  - 输入 2 个字符后触发
  - 最多显示 10 条建议
  - 支持键盘导航选择

### 具体任务
- [ ] 后端实现搜索建议 API
- [ ] 前端集成 lodash.debounce
- [ ] 创建 `useSearchSuggestions` Hook
- [ ] 实现下拉建议列表组件
- [ ] 添加键盘导航支持
- [ ] 实现建议结果缓存机制

## 3. 搜索筛选功能

### 技术实现要点
- **筛选维度**:
  ```typescript
  interface SearchFilters {
    timeRange: 'day' | 'week' | 'month' | 'year' | 'all';
    sortBy: 'relevance' | 'time' | 'popularity';
    postType: 'all' | 'text' | 'image' | 'video';
    author?: string;
  }
  ```
- **UI设计**:
  - 底部弹出式筛选面板
  - 筛选条件标签显示
  - 快捷筛选按钮

### 具体任务
- [ ] 设计筛选数据模型
- [ ] 创建筛选面板组件
- [ ] 实现筛选状态管理
- [ ] 修改 API 调用支持筛选参数
- [ ] 添加筛选条件标签展示
- [ ] 实现筛选重置功能

## 4. 空状态优化

### 技术实现要点
- **场景区分**:
  - 初始状态（未搜索）
  - 搜索中状态
  - 无结果状态
  - 网络错误状态
- **UI元素**:
  - 插画/图标
  - 友好文案提示
  - 推荐热门内容
  - 重试按钮（错误时）

### 具体任务
- [ ] 设计空状态插画/图标
- [ ] 创建 EmptyState 组件
- [ ] 实现不同场景的状态判断
- [ ] 添加热门推荐展示
- [ ] 优化错误提示文案

## 5. 分页加载

### 技术实现要点
- **实现方式**: FlatList 的 onEndReached
- **分页参数**:
  ```typescript
  interface Pagination {
    page: number;
    size: number;
    hasMore: boolean;
    total: number;
  }
  ```
- **加载状态**: 底部 loading 指示器
- **性能优化**: 
  - 使用 getItemLayout 优化滚动
  - 实现图片懒加载

### 具体任务
- [ ] 修改 API 支持分页参数
- [ ] 实现 `usePagination` Hook
- [ ] 添加底部加载指示器
- [ ] 处理加载更多逻辑
- [ ] 优化列表滚动性能
- [ ] 添加回到顶部按钮

## 6. 搜索防抖动

### 技术实现要点
- **防抖延迟**: 500ms
- **实现方案**: 
  ```typescript
  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 500),
    []
  );
  ```
- **取消机制**: 组件卸载时取消未完成请求

### 具体任务
- [ ] 安装 lodash.debounce
- [ ] 实现防抖搜索函数
- [ ] 添加请求取消逻辑
- [ ] 优化输入体验
- [ ] 添加 loading 状态管理

## 7. 搜索结果缓存

### 技术实现要点
- **缓存策略**: LRU (Least Recently Used)
- **缓存时长**: 5 分钟
- **存储方式**: 内存缓存 + AsyncStorage
- **缓存键**: `search:${keyword}:${filters}`

### 具体任务
- [ ] 实现 LRU 缓存类
- [ ] 创建 `useSearchCache` Hook
- [ ] 设置缓存过期机制
- [ ] 实现缓存命中判断
- [ ] 添加缓存清理功能

## 8. 多类型搜索

### 技术实现要点
- **搜索类型**: 
  - 帖子搜索
  - 用户搜索
  - 标签搜索
- **Tab 切换**: 使用 Tab 组件切换搜索类型
- **独立接口**: 每种类型对应不同 API

### 具体任务
- [ ] 设计 Tab 切换 UI
- [ ] 实现不同类型的搜索接口
- [ ] 创建对应的结果展示组件
- [ ] 统一搜索状态管理
- [ ] 处理类型切换时的数据清理

## 9. 关键词高亮

### 技术实现要点
- **实现方式**: 
  ```typescript
  const highlightText = (text: string, keyword: string) => {
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === keyword.toLowerCase() 
        ? <Text key={i} style={styles.highlight}>{part}</Text>
        : part
    );
  };
  ```
- **样式**: 背景色或文字颜色高亮

### 具体任务
- [ ] 创建文本高亮工具函数
- [ ] 实现 HighlightText 组件
- [ ] 处理多关键词高亮
- [ ] 优化高亮性能
- [ ] 添加高亮样式配置

## 10. UI 交互优化

### 技术实现要点
- **清空按钮**: 输入框右侧 X 按钮
- **骨架屏**: 使用 react-native-skeleton-placeholder
- **下拉刷新**: RefreshControl 组件
- **搜索动画**: 使用 Animated API

### 具体任务
- [ ] 添加输入框清空按钮
- [ ] 实现骨架屏组件
- [ ] 集成下拉刷新
- [ ] 添加搜索过渡动画
- [ ] 优化触摸反馈
- [ ] 实现振动反馈

## 11. 语音搜索

### 技术实现要点
- **语音识别**: react-native-voice
- **权限处理**: 麦克风权限申请
- **UI交互**: 
  - 语音输入按钮
  - 录音波形动画
  - 识别结果实时展示

### 具体任务
- [ ] 集成 react-native-voice
- [ ] 实现权限申请流程
- [ ] 创建语音输入 UI
- [ ] 添加录音状态管理
- [ ] 实现语音转文字
- [ ] 处理识别错误

## 12. 搜索排序

### 技术实现要点
- **排序选项**:
  - 相关度排序（默认）
  - 时间排序（最新/最早）
  - 热度排序（点赞数/浏览量）
- **UI设计**: 下拉选择或分段控制器

### 具体任务
- [ ] 设计排序选择 UI
- [ ] 修改 API 支持排序参数
- [ ] 实现排序状态管理
- [ ] 添加排序切换动画
- [ ] 保存用户排序偏好

## 实施优先级

### 第一阶段（核心功能）
1. 搜索防抖动
2. 分页加载
3. 空状态优化
4. 搜索历史记录

### 第二阶段（体验优化）
5. 搜索建议/自动补全
6. 搜索结果缓存
7. UI 交互优化
8. 关键词高亮

### 第三阶段（高级功能）
9. 搜索筛选功能
10. 多类型搜索
11. 搜索排序
12. 语音搜索

## 性能指标

- 搜索响应时间 < 500ms
- 首屏加载时间 < 1s
- 列表滚动 FPS > 55
- 内存占用 < 100MB
- 缓存命中率 > 60%

## 测试要点

- 单元测试：工具函数、Hooks
- 集成测试：API 调用、状态管理
- UI 测试：组件渲染、交互响应
- 性能测试：大数据量滚动、内存泄漏
- 兼容性测试：iOS/Android 平台差异