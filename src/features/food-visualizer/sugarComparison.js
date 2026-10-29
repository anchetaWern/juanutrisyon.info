// Visualization definitions only; neither changes catalog servings or food nutrients.
export const sugarTeaspoonGrams = 4

export function sugarVisualization(food) {
  const slug = food?.type?.slug
  if (typeof slug !== 'string' || !slug.trim()) return null
  return slug === 'prepared-and-processed' ? 'cola' : 'teaspoons'
}

export function sugarComparison(food, colaState) {
  const mode = sugarVisualization(food)
  if (mode === 'teaspoons') return { mode, status: 'ready', gramsPerUnit: sugarTeaspoonGrams,
    singular: 'teaspoon', plural: 'teaspoons' }
  if (mode === 'cola') return { mode, status: colaState?.status ?? 'idle',
    gramsPerUnit: colaState?.reference?.sugar ?? null, singular: 'glass', plural: 'glasses',
    reference: colaState?.reference, error: colaState?.error }
  return { mode: null, status: 'unavailable', gramsPerUnit: null }
}
