<template>
  <div class="sound_item" @click="start">
    <img :src="soundIcon()" class="sound_icon" alt="" />
    {{ `${message.duration}"` }}
  </div>
</template>

<script>
import { reactive, onDeactivated } from "vue";
export default {
  props: {
    message: Object,
    isSelf: Boolean,
  },
  setup(props, context) {
    let soundTimer = null;
    const data = reactive({
      playing: false,
      state: 3,
    });
    function start() {
      if (!data.playing) {
        context.attrs.onPlaySound({
          play: play,
          stop: stop,
          message: props.message,
        });
      } else {
        context.attrs.onStopSound();
      }
    }
    function soundIcon() {
      return require(`@/assets/img/sound_${props.isSelf ? "right" : "left"}_${
        data.state
      }.png`);
    }
    function play() {
      data.playing = true;
      data.state = 1;
      clearInterval(soundTimer);
      soundTimer = setInterval(() => {
        if (data.state < 3) {
          data.state += 1;
        } else {
          data.state = 1;
        }
      }, 500);
    }
    // play();
    function stop() {
      data.playing = false;
      clearInterval(soundTimer);
      data.state = 3;
    }
    onDeactivated(() => {
      if (data.playing) {
        stop();
        context.attrs.onStopSound();
      }
    });
    return {
      start,
      soundIcon,
      data,
    };
  },
};
</script>

<style scoped>
.sound_icon {
  width: 20px;
  height: 20px;
  vertical-align: middle;
}
</style>