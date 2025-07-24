const { request } = require('../../../utils/request');

Page({
  data: {
    post: null,
    comments: [],
    loading: true
  },

  onLoad(options) {
    this.uuid = options.uuid;
    this.fetchDetail();
    this.fetchComments();
  },

  fetchDetail() {
    request({ url: `/api/posts/${this.uuid}`, method: 'GET' })
      .then(res => {
        this.setData({ post: res, loading: false });
      })
      .catch(() => {
        this.setData({ loading: false });
      });
  },

  fetchComments() {
    request({ url: `/api/posts/${this.uuid}/comments`, method: 'GET' })
      .then(res => {
        const list = res.content || res.records || [];
        this.setData({ comments: list });
      });
  }
});
