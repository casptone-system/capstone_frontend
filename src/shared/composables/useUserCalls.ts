import { ref } from 'vue'

type UserContact = {
  name: string
  role: string
}

export function useUserCalls() {
  const activeCall = ref<UserContact | null>(null)
  const callMessage = ref('')

  const callUser = (contact: UserContact) => {
    activeCall.value = contact
    callMessage.value = `Calling ${contact.name} (${contact.role})...`
  }

  const endCall = () => {
    if (!activeCall.value) return
    callMessage.value = `Call ended with ${activeCall.value.name}.`
    activeCall.value = null
    window.setTimeout(() => {
      callMessage.value = ''
    }, 3000)
  }

  return { activeCall, callMessage, callUser, endCall }
}
