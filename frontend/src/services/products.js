import apiClient from './api_client';

/** Search the product catalog with optional filters (category, budget, skin type). */
export async function searchProducts(query, filters = {}) {
  const { data } = await apiClient.get('/products/search', { params: { query, ...filters } });
  return data;
}

/** Suitability score (0-100) of a specific product against the user's current profile. */
export async function getSuitabilityScore(productId) {
  const { data } = await apiClient.get(`/products/${productId}/suitability`);
  return data;
}

/** Suggested alternatives when a product scores poorly or is unavailable. */
export async function getAlternatives(productId) {
  const { data } = await apiClient.get(`/products/${productId}/alternatives`);
  return data;
}

/** Check ingredient-level interactions/allergy flags across a list of product IDs. */
export async function checkIngredientInteractions(productIds) {
  const { data } = await apiClient.post('/ingredients/interactions', { product_ids: productIds });
  return data;
}

const productsService = {
  searchProducts,
  getSuitabilityScore,
  getAlternatives,
  checkIngredientInteractions,
};

export default productsService;
