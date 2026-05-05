<template>
  <form @submit.prevent="onSubmit">
    <input v-model="email" placeholder="email" />
    <input v-model="password" type="password" placeholder="password" />
    <button type="submit">Entrar</button>
  </form>
</template>

<script>
export default {
  name: 'LoginForm',
  data() {
    return { email: '', password: '' }
  },
  methods: {
    onSubmit() {
      this.$emit('submit', { email: this.email, password: this.password })
    }
  }
}
</script>
