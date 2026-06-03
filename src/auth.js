import { ref } from 'vue'

const isAuthenticated = ref(localStorage.getItem('auth') === 'true')

const login = () => {
  isAuthenticated.value = true
  localStorage.setItem('auth', 'true')
}

const logout = () => {
  isAuthenticated.value = false
  localStorage.removeItem('auth')
}

export { isAuthenticated, login, logout }
