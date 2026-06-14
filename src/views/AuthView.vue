<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const mode = ref<'signin' | 'signup'>('signin')
const email = ref('')
const password = ref('')
const displayName = ref('')
const error = ref<string | null>(null)
const info = ref<string | null>(null)
const loading = ref(false)

async function submit(): Promise<void> {
  error.value = null
  info.value = null
  loading.value = true
  try {
    if (mode.value === 'signup') {
      await auth.signUp(email.value, password.value, displayName.value)
      info.value = 'Account created. Check your inbox if email confirmation is enabled, then sign in.'
      mode.value = 'signin'
    } else {
      await auth.signIn(email.value, password.value)
      router.push('/library')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Something went wrong.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container auth">
    <div class="card">
      <h1>{{ mode === 'signin' ? 'Sign in' : 'Create account' }}</h1>
      <p class="card__sub">Access your library from anywhere.</p>

      <p v-if="!auth.enabled" class="alert alert--warn">
        Authentication isn't configured on this deployment.
      </p>

      <form @submit.prevent="submit">
        <label v-if="mode === 'signup'" class="field">
          <span>Display name</span>
          <input
            v-model="displayName"
            type="text"
            autocomplete="nickname"
            maxlength="30"
            placeholder="Shown on your public reviews"
            required
          />
        </label>
        <label class="field">
          <span>Email</span>
          <input v-model="email" type="email" autocomplete="email" required />
        </label>
        <label class="field">
          <span>Password</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            minlength="6"
            required
          />
        </label>

        <p v-if="error" class="alert alert--error">{{ error }}</p>
        <p v-if="info" class="alert alert--info">{{ info }}</p>

        <button class="btn" type="submit" :disabled="loading || !auth.enabled">
          {{ loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up' }}
        </button>
      </form>

      <p class="switch">
        <template v-if="mode === 'signin'">
          No account?
          <button type="button" class="link" @click="mode = 'signup'">Create one</button>
        </template>
        <template v-else>
          Already registered?
          <button type="button" class="link" @click="mode = 'signin'">Sign in</button>
        </template>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth {
  max-width: 420px;
}
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 0.8rem;
  padding: 1.75rem;
  margin-top: 2rem;
}
.card h1 {
  margin: 0 0 0.25rem;
}
.card__sub {
  color: var(--c-text-muted);
  margin: 0 0 1.25rem;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: var(--c-text-muted);
}
.field input {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 0.45rem;
  color: var(--c-text);
  padding: 0.6rem;
  font: inherit;
}
.btn {
  justify-content: center;
}
.alert {
  margin: 0;
  font-size: 0.85rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.45rem;
}
.alert--error {
  background: rgba(220, 38, 38, 0.12);
  color: #dc2626;
}
.alert--info {
  background: var(--c-accent-soft);
  color: var(--c-accent);
}
.alert--warn {
  background: rgba(180, 83, 9, 0.14);
  color: #b45309;
}
.switch {
  margin: 1.25rem 0 0;
  font-size: 0.9rem;
  color: var(--c-text-muted);
}
.link {
  background: none;
  border: none;
  color: var(--c-accent);
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-decoration: underline;
}
</style>
