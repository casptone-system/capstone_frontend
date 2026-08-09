import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getColleges, getCollege, createCollege, updateCollege, deleteCollege } from '@/lib/api'
import type { College } from '@/lib'

export const useCollegeStore = defineStore('colleges', () => {
  const colleges = ref<College[]>([])
  const currentCollege = ref<College | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchColleges = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getColleges()
      colleges.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch colleges'
    } finally {
      isLoading.value = false
    }
  }

  const fetchCollege = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getCollege(id)
      currentCollege.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch college'
    } finally {
      isLoading.value = false
    }
  }

  const addCollege = async (college: Omit<College, 'id'>) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await createCollege(college)
      colleges.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to create college'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const editCollege = async (id: string, updates: Partial<College>) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await updateCollege(id, updates)
      const index = colleges.value.findIndex((c: College) => c.id === id)
      if (index !== -1) colleges.value[index] = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to update college'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeCollege = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      await deleteCollege(id)
      colleges.value = colleges.value.filter((c: College) => c.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete college'
    } finally {
      isLoading.value = false
    }
  }

  return {
    colleges,
    currentCollege,
    isLoading,
    error,
    fetchColleges,
    fetchCollege,
    addCollege,
    editCollege,
    removeCollege
  }
})
