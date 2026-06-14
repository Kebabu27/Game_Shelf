<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useLibraryStore } from '@/stores/library'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const library = useLibraryStore()
const { entries } = storeToRefs(library)
const auth = useAuthStore()
const { theme, toggle } = useTheme()

async function logout(): Promise<void> {
  await auth.signOut()
  router.push('/')
}
</script>

<template>
  <header class="topbar">
    <div class="topbar__inner container">
      <RouterLink to="/" class="brand">🎮 GameShelf</RouterLink>
      <nav class="nav">
        <RouterLink to="/">Catalog</RouterLink>
        <RouterLink to="/library">
          Library
          <span v-if="entries.length" class="nav__count">{{ entries.length }}</span>
        </RouterLink>
        <RouterLink to="/reviews">Reviews</RouterLink>
        <RouterLink to="/stats">Stats</RouterLink>
      </nav>

      <div v-if="auth.enabled" class="account">
        <template v-if="auth.isAuthenticated">
          <span class="account__email">{{ auth.email }}</span>
          <button class="account__btn" @click="logout">Sign out</button>
        </template>
        <RouterLink v-else to="/login" class="account__btn">Sign in</RouterLink>
      </div>

      <button class="theme-toggle" :aria-label="`${theme} theme`" @click="toggle">
        {{ theme === 'dark' ? '☀️' : '🌙' }}
      </button>
    </div>
  </header>

  <main>
    <RouterView v-slot="{ Component }">
      <Transition name="page-fade" mode="out-in">
        <KeepAlive include="CatalogView">
          <component :is="Component" />
        </KeepAlive>
      </Transition>
    </RouterView>
  </main>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--c-surface);
  border-bottom: 1px solid var(--c-border);
}
.topbar__inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
.brand {
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  color: var(--c-text);
}
.nav {
  display: flex;
  gap: 1rem;
  margin-right: auto;
}
.nav a {
  color: var(--c-text-muted);
  text-decoration: none;
  font-size: 0.95rem;
}
.nav a.router-link-active {
  color: var(--c-accent);
  font-weight: 600;
}
.nav__count {
  display: inline-block;
  background: var(--c-accent);
  color: #fff;
  border-radius: 999px;
  font-size: 0.7rem;
  padding: 0 0.4rem;
  margin-left: 0.2rem;
}
.account {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.account__email {
  font-size: 0.8rem;
  color: var(--c-text-muted);
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.account__btn {
  background: none;
  border: 1px solid var(--c-border);
  border-radius: 0.4rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  color: var(--c-text);
  text-decoration: none;
  cursor: pointer;
}
.account__btn:hover {
  border-color: var(--c-accent);
  color: var(--c-accent);
}
.theme-toggle {
  background: none;
  border: 1px solid var(--c-border);
  border-radius: 0.4rem;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  font-size: 0.95rem;
}
</style>
