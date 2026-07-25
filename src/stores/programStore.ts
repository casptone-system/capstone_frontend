import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getPrograms, getProgram, createProgram, updateProgram, deleteProgram } from '@/lib/api'
import type { Program } from '@/types'

export const useProgramStore = defineStore('programs', () => {
  const programs = ref<Program[]>([])
  const currentProgram = ref<Program | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchPrograms = async () => {
    isLoading.value = true
    error.value = null
    try {
      try {
        const data = await getPrograms()
        programs.value = data
      } catch (apiError) {
        console.warn('Supabase fetch failed, using mock data:', apiError)
        setMockPrograms()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch programs'
      setMockPrograms()
    } finally {
      isLoading.value = false
    }
  }

  const setMockPrograms = () => {
    programs.value = [
      { id: '1', name: 'Bachelor of Science in Computer Science', code: 'BSCS', chair: 'Dr. John Smith', accreditationStatus: 'compliant', complianceScore: 92 },
      { id: '2', name: 'Bachelor of Science in Engineering', code: 'BSEng', chair: 'Dr. Maria Cruz', accreditationStatus: 'at-risk', complianceScore: 68 },
      { id: '3', name: 'Bachelor of Science in Nursing', code: 'BSN', chair: 'Dr. Ana Santos', accreditationStatus: 'compliant', complianceScore: 88 },
      { id: '4', name: 'Bachelor of Business Administration', code: 'BBA', chair: 'Dr. Robert Lim', accreditationStatus: 'non-compliant', complianceScore: 45 },
      { id: '5', name: 'Bachelor of Arts in Education', code: 'BAEd', chair: 'Dr. Sarah Reyes', accreditationStatus: 'compliant', complianceScore: 95 }
    ]
  }

  const fetchProgram = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      try {
        const data = await getProgram(id)
        currentProgram.value = data
      } catch {
        currentProgram.value = programs.value.find(p => p.id === id) || null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch program'
    } finally {
      isLoading.value = false
    }
  }

  const addProgram = async (program: Omit<Program, 'id'>) => {
    isLoading.value = true
    error.value = null
    try {
      try {
        const data = await createProgram(program)
        programs.value.push(data)
        return data
      } catch {
        const mockProgram: Program = {
          id: Date.now().toString(),
          ...program
        }
        programs.value.push(mockProgram)
        return mockProgram
      }
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
      try {
        const data = await updateProgram(id, updates)
        const index = programs.value.findIndex(p => p.id === id)
        if (index !== -1) programs.value[index] = data
        return data
      } catch {
        const index = programs.value.findIndex(p => p.id === id)
        if (index !== -1) {
          programs.value[index] = { ...programs.value[index], ...updates }
        }
        return programs.value[index]
      }
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
      try {
        await deleteProgram(id)
      } catch {
        console.warn('Supabase delete failed, removing locally')
      }
      programs.value = programs.value.filter(p => p.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete program'
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