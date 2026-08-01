import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAccreditationAreas, getAccreditationArea, createAccreditationArea, updateAccreditationArea } from '@/lib/api'
import type { AccreditationArea } from '@/types'

export const useAreaStore = defineStore('areas', () => {
  const areas = ref<AccreditationArea[]>([])
  const currentArea = ref<AccreditationArea | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchAreas = async () => {
    isLoading.value = true
    error.value = null
    try {
      try {
        const data = await getAccreditationAreas()
        areas.value = data
      } catch (apiError) {
        console.warn('Backend fetch failed, using mock data:', apiError)
        setMockAreas()
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch areas'
      setMockAreas()
    } finally {
      isLoading.value = false
    }
  }

  const setMockAreas = () => {
    areas.value = [
      { id: '1', name: 'Student Learning Outcomes', code: 'SLO-001', description: 'Assessment of student learning outcomes across all programs', assignedTo: [], status: 'in-progress', dueDate: '2026-03-15' },
      { id: '2', name: 'Faculty Development', code: 'FD-002', description: 'Faculty qualifications, development programs, and performance evaluation', assignedTo: [], status: 'in-progress', dueDate: '2026-04-01' },
      { id: '3', name: 'Curriculum Design', code: 'CD-003', description: 'Curriculum relevance, industry alignment, and continuous improvement', assignedTo: [], status: 'not-started', dueDate: '2026-05-01' },
      { id: '4', name: 'Research Output', code: 'RO-004', description: 'Faculty and student research publications and citations', assignedTo: [], status: 'completed', dueDate: '2025-12-15' },
      { id: '5', name: 'Community Engagement', code: 'CE-005', description: 'Extension programs and community outreach activities', assignedTo: [], status: 'in-progress', dueDate: '2026-06-01' },
      { id: '6', name: 'Library Resources', code: 'LR-006', description: 'Library facilities, resources, and information access', assignedTo: [], status: 'not-started', dueDate: '2026-07-01' },
      { id: '7', name: 'Laboratory Facilities', code: 'LF-007', description: 'Laboratory equipment, safety standards, and utilization', assignedTo: [], status: 'submitted', dueDate: '2026-02-01' },
      { id: '8', name: 'Student Services', code: 'SS-008', description: 'Student support services, guidance, and extracurricular activities', assignedTo: [], status: 'in-progress', dueDate: '2026-08-01' }
    ]
  }

  const fetchArea = async (id: string) => {
    isLoading.value = true
    error.value = null
    try {
      try {
        const data = await getAccreditationArea(id)
        currentArea.value = data
      } catch {
        currentArea.value = areas.value.find(a => a.id === id) || null
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch area'
    } finally {
      isLoading.value = false
    }
  }

  const addArea = async (area: Omit<AccreditationArea, 'id'>) => {
    isLoading.value = true
    error.value = null
    try {
      try {
        const data = await createAccreditationArea(area)
        areas.value.push(data)
        return data
      } catch {
        const mockArea: AccreditationArea = {
          id: Date.now().toString(),
          ...area
        }
        areas.value.push(mockArea)
        return mockArea
      }
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
      try {
        const data = await updateAccreditationArea(id, updates)
        const index = areas.value.findIndex(a => a.id === id)
        if (index !== -1) areas.value[index] = data
        return data
      } catch {
        const index = areas.value.findIndex(a => a.id === id)
        if (index !== -1) {
          areas.value[index] = { ...areas.value[index], ...updates }
        }
        return areas.value[index]
      }
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