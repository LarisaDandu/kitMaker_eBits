import { KIT_PROGRESS_STEPS } from '../data/kits'

/** Stats shown in kit overview for each progress step index */
export const KIT_STEP_STATS = [
  { checked: 0, approved: 0, required: 0 },
  { checked: 10, approved: 0, required: 0 },
  { checked: 22, approved: 18, required: 2 },
  { checked: 35, approved: 30, required: 5 },
  { checked: 48, approved: 45, required: 2 },
  { checked: 50, approved: 50, required: 0 },
]

export function getMaxKitProgressStep() {
  return KIT_PROGRESS_STEPS.length - 1
}

export function getStatsForProgressStep(step, totalComponents, totalKits) {
  const preset = KIT_STEP_STATS[Math.min(step, KIT_STEP_STATS.length - 1)]
  return {
    checked: preset.checked,
    approved: preset.approved,
    required: preset.required,
    rejected: preset.required,
    totalComponents,
    totalKits,
  }
}
