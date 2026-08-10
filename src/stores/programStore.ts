import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPrograms, getProgram, createProgram, updateProgram, deleteProgram } from '@/lib/api'
import type { Program } from '@/lib'

export const useProgramStore = defineStore('programs', () => {
  const programs = ref<Program[]>([])
  const currentProgram = ref<Program | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchPrograms = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getPrograms()
      programs.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch programs'
      programs.value = []
    } finally {
      isLoading.value = false
    }
  }

  const fetchProgram = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getProgram(id)
      currentProgram.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch program'
      currentProgram.value = null
    } finally {
      isLoading.value = false
    }
  }

  const addProgram = async (program: Omit<Program, 'id'>) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await createProgram(program)
      programs.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to create program'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const editProgram = async (id: string, updates: Partial<Program>) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await updateProgram(id, updates)
      const index = programs.value.findIndex(p => p.id === id)
      if (index !== -1) programs.value[index] = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to update program'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeProgram = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await deleteProgram(id)
      programs.value = programs.value.filter(p => p.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete program'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    programs,
    currentProgram,
    isLoading,
    error,
    fetchPrograms,
    fetchProgram,
    addProgram,
    editProgram,
    removeProgram
  }
})