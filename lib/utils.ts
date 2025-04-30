// Client-side utility functions
export function calculateCost(conceptCount: number, imageCount: number) {
  // Approximate costs (may need to be updated as pricing changes)
  const GPT4_MINI_COST_PER_1K_TOKENS = 0.015
  const DALLE3_HD_COST = 0.080 // Updated cost for HD images
  
  // Estimate tokens for concept generation (very rough estimate)
  const estimatedTokens = conceptCount * 500 / 1000 // ~500 tokens per concept, converted to thousands
  const conceptCost = estimatedTokens * GPT4_MINI_COST_PER_1K_TOKENS
  
  // Image generation cost
  const imageCost = imageCount * DALLE3_HD_COST
  
  // Total cost
  const totalCost = conceptCost + imageCost
  
  return {
    conceptCost: conceptCost.toFixed(3),
    imageCost: imageCost.toFixed(3),
    totalCost: totalCost.toFixed(3)
  }
}