<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="container notfound">
    <h1>404</h1>
    <p>This page doesn't exist (anymore).</p>
    <RouterLink to="/" class="btn">Back to catalog</RouterLink>
  </div>
</template>

<style scoped>
.notfound {
  text-align: center;
  padding-top: 4rem;
}
.notfound h1 {
  font-size: 4rem;
  margin: 0;
  color: var(--c-accent);
}
</style>
