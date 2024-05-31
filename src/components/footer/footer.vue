<template>
  <div class="ws-footer" :style="{ 'z-index': zIndex }">
    <slot></slot>
  </div>
</template>
<script>
export default {
  name: 'WsFooter',
  props: {
    zIndex: {
      type: [Number, String],
      default: 100
    }
  }
}
</script>
<style lang="scss">
.ws-footer {
  position: fixed;
  // 左侧导航栏的距离
  left: 32px;
  bottom: 0;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;

  background: #ffffff;
  box-shadow: 0px 2px 8px 4px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  overflow: hidden;

  button {
    min-width: 160px;
  }
}
</style>
