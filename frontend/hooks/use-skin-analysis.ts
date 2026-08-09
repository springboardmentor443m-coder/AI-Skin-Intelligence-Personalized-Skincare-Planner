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

export async function uploadImageForAnalysis(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post(
    `/predict`,formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export async function askDermatologist(
  message: string,
  skinType: string,
  recommendations: string[]
) {
  const response = await apiClient.post("/assistant", {
    message,
    skin_type: skinType,
    recommendations,
  })

  return response.data
}
