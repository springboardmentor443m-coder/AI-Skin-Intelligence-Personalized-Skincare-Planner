export interface User {
  id: string
  email: string
  name: string

  age?: number | null
  gender?: string | null
  skin_type?: string | null
  budget?: string | null
  skin_goals?: string | null
  additional_details?: string | null

  created_at: string
  updated_at: string
}

export interface SkinAnalysisResult {
  id: string
  user_id: string
  image_url: string
  timestamp: string
  skin_type: string
  conditions: string[]
  severity_scores: Record<string, number>
  confidence: number
  recommendations: SkinRecommendation[]
}

export interface SkinRecommendation {
  id: string
  category: string
  product_type: string
  priority: 'high' | 'medium' | 'low'
  description: string
  ingredients: string[]
  estimated_duration: string
}

export interface SkinHistory {
  id: string
  user_id: string
  date: string
  skin_conditions: string[]
  moisture_level: number
  oil_level: number
  sensitivity: number
  notes: string
}

export interface AnalyticsData {
  total_analyses: number
  most_common_condition: string
  improvement_trend: number
  consistency_score: number
  monthly_data: {
    date: string
    count: number
    primary_condition: string
  }[]
}

export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  user_id: string
  messages: AssistantMessage[]
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface PredictionResponse {
  success: boolean
  analysis: SkinAnalysisResult
  message: string
}
