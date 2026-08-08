const API_BASE_URL = "http://127.0.0.1:8000";

export async function generateRecommendation(formData) {
  const response = await fetch(
    `${API_BASE_URL}/recommend`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Recommendation request failed"
    );
  }

  return data;
}