Component({
  properties: {
    post: Object
  },
  methods: {
    onTap() {
      const uuid = this.properties.post.uuid;
      this.triggerEvent('tap', { uuid });
    }
  }
});
