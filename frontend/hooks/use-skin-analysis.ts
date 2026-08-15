import useSWR from 'swr'
import { apiClient } from '@/lib/api'
import { SkinAnalysisResult, PredictionResponse } from '@/lib/types'

const fetcher = (url: string) => apiClient.get(url).then((res) => res.data)

export function useSkinAnalysis(analysisId?: string) {
  const { data, error, isLoading } = useSWR(
    analysisId ? `/api/analyses/${analysisId}` : null,
    fetcher
  )

  return {
    analysis: data as SkinAnalysisResult | undefined,
    isLoading,
    error,
  }
}

export function useLatestAnalysis() {
  const { data, error, isLoading } = useSWR('/api/analyses/latest', fetcher)

  return {
    analysis: data as SkinAnalysisResult | undefined,
    isLoading,
    error,
  }
}

export function useAnalysisHistory() {
  const { data, error, isLoading, mutate } = useSWR('/history', fetcher)

  return {
    history: (data as SkinAnalysisResult[]) || [],
    isLoading,
    error,
    mutate,
  }
}

export async function uploadImageForAnalysis(
  file: File,
  profile?: {
    age?: number | null
    gender?: string | null
    skin_type?: string | null
    budget?: string | null
    skin_goals?: string[] | null
    additional_details?: string | null
  }
) {
  const formData = new FormData()

  formData.append('file', file)

  if (profile?.age !== undefined && profile.age !== null) {
    formData.append('age', String(profile.age))
  }

  if (profile?.gender) {
    formData.append('gender', profile.gender)
  }

  if (profile?.skin_type) {
    formData.append('skin_type', profile.skin_type)
  }

  if (profile?.budget) {
    formData.append('budget', profile.budget)
  }

  if (profile?.skin_goals?.length) {
    formData.append('skin_goals', JSON.stringify(profile.skin_goals))
  }

  if (profile?.additional_details) {
    formData.append('additional_details', profile.additional_details)
  }

  const response = await apiClient.post('/predict', formData)

  return response.data
}

export async function askDermatologist(
  message: string,
  skinType: string,
  recommendations: string[],
  weeklyPlan?: Record<string, any>
) {
  const response = await apiClient.post("/assistant", {
    message,
    skin_type: skinType,
    recommendations,
    weekly_plan: weeklyPlan,
  })

  return response.data
}