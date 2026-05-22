import { UNIVERSITY_STATUS } from '../data/universities'

export const EMPTY_CUSTOMER_FORM = {
  name: '',
  professorName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  ean: '',
  loginCode: '',
}

export function generateUniversityId() {
  return `uni-${crypto.randomUUID().slice(0, 8)}`
}

export function generateLoginCode() {
  const segment = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${segment()}-${segment()}`
}

export function createDefaultKit() {
  return {
    name: 'New kit',
    quoteId: String(Math.floor(Math.random() * 80) + 10),
    stats: {
      checked: 0,
      totalComponents: 50,
      approved: 0,
      required: 0,
      rejected: 0,
      totalKits: 0,
    },
    pricing: {
      finalUnitPrice: 0,
      pricePerKit: 0,
      initialEstimatePrice: 0,
      currency: 'DKK',
    },
    progressStep: 0,
  }
}

export function universityToFormValues(university) {
  if (!university) return { ...EMPTY_CUSTOMER_FORM }

  return {
    name: university.name ?? '',
    professorName: university.professorName ?? '',
    email: university.email ?? '',
    phone: university.phone ?? '',
    addressLine1: university.addressLine1 ?? '',
    addressLine2: university.addressLine2 ?? '',
    ean: university.ean ?? '',
    loginCode: university.loginCode ?? '',
  }
}

export function formValuesToUniversity(form, existing) {
  const base = existing ?? {
    id: generateUniversityId(),
    status: UNIVERSITY_STATUS.REQUIRES_CHANGES,
    kit: createDefaultKit(),
    previousOrders: [],
  }

  return {
    ...base,
    name: form.name.trim(),
    professorName: form.professorName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    addressLine1: form.addressLine1.trim(),
    addressLine2: form.addressLine2.trim(),
    ean: form.ean.trim(),
    loginCode: form.loginCode.trim(),
  }
}
