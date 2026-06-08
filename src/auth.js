import { ref } from 'vue'

const isAuthenticated = ref(localStorage.getItem('auth') === 'true')
const userRole = ref(localStorage.getItem('role') || '')

const login = (role = 'dean') => {
  isAuthenticated.value = true
  userRole.value = role
  localStorage.setItem('auth', 'true')
  localStorage.setItem('role', role)
}

const logout = () => {
  isAuthenticated.value = false
  userRole.value = ''
  localStorage.removeItem('auth')
  localStorage.removeItem('role')
}

const getUserRole = () => userRole.value

export { isAuthenticated, userRole, getUserRole, login, logout }
