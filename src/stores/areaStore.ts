import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccreditationAreas, getAccreditationArea, createAccreditationArea, updateAccreditationArea } from '@/lib/api'
import type { AccreditationArea } from '@/lib'

export const useAreaStore = defineStore('areas', () => {
  const areas = ref<AccreditationArea[]>([])
  const currentArea = ref<AccreditationArea | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchAreas = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getAccreditationAreas()
      areas.value = data
      currentArea.value = null
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch areas'
      areas.value = []
      currentArea.value = null
    } finally {
      isLoading.value = false
    }
  }

  const fetchArea = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getAccreditationArea(id)
      currentArea.value = data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch area'
      currentArea.value = null
    } finally {
      isLoading.value = false
    }
  }

  const addArea = async (area: Omit<AccreditationArea, 'id'>) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await createAccreditationArea(area)
      areas.value.push(data)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to create area'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const editArea = async (id: string, updates: Partial<AccreditationArea>) => {
    isLoading.value = true
    error.value = null
    try {
      const data = await updateAccreditationArea(id, updates)
      const index = areas.value.findIndex(a => a.id === id)
      if (index !== -1) areas.value[index] = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to update area'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getAreasByStatus = (status: AccreditationArea['status']) => {
    return areas.value.filter(a => a.status === status)
  }

  return {
    areas,
    currentArea,
    isLoading,
    error,
    fetchAreas,
    fetchArea,
    addArea,
    editArea,
    getAreasByStatus
  }
})