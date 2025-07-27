const posts = require('../../../utils/mockPosts');

Page({
  data: {
    posts: []
  },

  onLoad() {
    this.setData({ posts });
  }
});
