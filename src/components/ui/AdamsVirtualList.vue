<template>
  <div ref="root" class="adams-virtual" :style="{ height: `${viewportHeight}px` }" @scroll="onScroll">
    <div class="adams-virtual-spacer" :style="{ height: `${totalHeight}px` }">
      <div class="adams-virtual-window" :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="entry in visible"
          :key="entry.index"
          class="adams-virtual-row"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot :item="entry.item" :index="entry.index" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(defineProps<{
  items: T[]
  itemHeight?: number
  maxHeight?: number
  overscan?: number
}>(), {
  itemHeight: 56,
  maxHeight: 360,
  overscan: 4,
})

const root = ref<HTMLElement | null>(null)
const scrollTop = ref(0)
const viewportHeight = computed(() => Math.min(props.maxHeight, Math.max(props.itemHeight, props.items.length * props.itemHeight)))
const totalHeight = computed(() => props.items.length * props.itemHeight)

const startIndex = computed(() =>
  Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - props.overscan),
)
const endIndex = computed(() =>
  Math.min(
    props.items.length,
    Math.ceil((scrollTop.value + viewportHeight.value) / props.itemHeight) + props.overscan,
  ),
)
const offsetY = computed(() => startIndex.value * props.itemHeight)
const visible = computed(() =>
  props.items.slice(startIndex.value, endIndex.value).map((item, i) => ({
    item,
    index: startIndex.value + i,
  })),
)

const onScroll = () => {
  scrollTop.value = root.value?.scrollTop ?? 0
}

onMounted(() => {
  scrollTop.value = root.value?.scrollTop ?? 0
})

onBeforeUnmount(() => {
  root.value = null
})
</script>

<style scoped>
.adams-virtual {
  overflow: auto;
  position: relative;
  width: 100%;
}
.adams-virtual-spacer {
  position: relative;
  width: 100%;
}
.adams-virtual-window {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform;
}
.adams-virtual-row {
  box-sizing: border-box;
}
</style>
