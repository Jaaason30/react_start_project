const { request } = require('../../../utils/request');

Page({
  data: {
    posts: [],
    page: 0,
    size: 10,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.loadPosts();
  },

  loadPosts() {
    if (!this.data.hasMore || this.data.loading) return;
    this.setData({ loading: true });
    request({
      url: `/api/posts?page=${this.data.page}&size=${this.data.size}`,
      method: 'GET'
    })
      .then(res => {
        const list = res.content || res.records || [];
        const hasMore = !(res.last || res.isLast);
        this.setData({
          posts: this.data.page === 0 ? list : this.data.posts.concat(list),
          hasMore,
          loading: false
        });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  onPullDownRefresh() {
    this.setData({ page: 0, hasMore: true, posts: [] });
    this.loadPosts();
    wx.stopPullDownRefresh();
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 }, () => this.loadPosts());
    }
  },

  onTapPost(e) {
    const uuid = e.detail.uuid;
    wx.navigateTo({ url: `/pages/square/postDetail/index?uuid=${uuid}` });
  }
});
