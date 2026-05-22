export const UNIVERSITY_STATUS = {
  REQUIRES_CHANGES: 'requires_changes',
  ACTIVE_ORDER: 'active_order',
  INACTIVE_ORDERS: 'inactive_orders',
}

export const STATUS_LABELS = {
  [UNIVERSITY_STATUS.REQUIRES_CHANGES]: 'Requires Changes',
  [UNIVERSITY_STATUS.ACTIVE_ORDER]: 'Active order',
  [UNIVERSITY_STATUS.INACTIVE_ORDERS]: 'Inactive orders',
}

export const KIT_STATUS_LABELS = {
  [UNIVERSITY_STATUS.REQUIRES_CHANGES]: 'Requires Changes',
  [UNIVERSITY_STATUS.ACTIVE_ORDER]: 'Active',
  [UNIVERSITY_STATUS.INACTIVE_ORDERS]: 'Inactive',
}

export const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: UNIVERSITY_STATUS.REQUIRES_CHANGES, label: STATUS_LABELS[UNIVERSITY_STATUS.REQUIRES_CHANGES] },
  { id: UNIVERSITY_STATUS.ACTIVE_ORDER, label: STATUS_LABELS[UNIVERSITY_STATUS.ACTIVE_ORDER] },
  { id: UNIVERSITY_STATUS.INACTIVE_ORDERS, label: STATUS_LABELS[UNIVERSITY_STATUS.INACTIVE_ORDERS] },
]

const defaultPreviousOrders = [
  { id: 'prev-1', name: '2025 Semester kit', status: UNIVERSITY_STATUS.INACTIVE_ORDERS },
  { id: 'prev-2', name: '2024 Semester kit', status: UNIVERSITY_STATUS.INACTIVE_ORDERS },
]

export const universities = [
  {
    id: 'uni-1',
    name: 'Business school',
    professorName: 'John Teach',
    email: 'jnth@hsnb.dk',
    phone: '22 22 22 22',
    addressLine1: 'Skolevej 34, Viborg, Denmark',
    addressLine2: '',
    ean: '168764865',
    loginCode: 'BUS-A1B2',
    kit: {
      name: '2026 Semester kit',
      quoteId: '55',
      stats: {
        checked: 0,
        totalComponents: 50,
        approved: 0,
        required: 0,
        rejected: 0,
        totalKits: 30,
      },
      pricing: {
        finalUnitPrice: 9000,
        pricePerKit: 100,
        initialEstimatePrice: 9100,
        currency: 'DKK',
      },
      progressStep: 2,
    },
    status: UNIVERSITY_STATUS.ACTIVE_ORDER,
    previousOrders: defaultPreviousOrders,
  },
  {
    id: 'uni-2',
    name: 'An Academy',
    professorName: 'John Teach',
    email: 'jnth@hsnb.dk',
    phone: '22 22 22 22',
    addressLine1: 'Skolevej 34, Viborg, Denmark',
    addressLine2: '',
    ean: '168764865',
    loginCode: 'ACA-C3D4',
    kit: {
      name: '2026 Semester kit',
      quoteId: '42',
      stats: {
        checked: 0,
        totalComponents: 50,
        approved: 0,
        required: 0,
        rejected: 0,
        totalKits: 30,
      },
      pricing: {
        finalUnitPrice: 9000,
        pricePerKit: 100,
        initialEstimatePrice: 9100,
        currency: 'DKK',
      },
      progressStep: 2,
    },
    status: UNIVERSITY_STATUS.ACTIVE_ORDER,
    previousOrders: defaultPreviousOrders,
  },
  {
    id: 'uni-3',
    name: 'Northern Institute',
    professorName: 'Dr. Sofia Holm',
    email: 'sofia.holm@northern.edu',
    phone: '+45 11 22 33 44',
    addressLine1: '8 North Campus Way',
    addressLine2: 'Suite 210',
    ean: '5700000000003',
    loginCode: 'NOR-E5F6',
    kit: {
      name: 'Fall 2025 kit',
      quoteId: '31',
      stats: {
        checked: 10,
        totalComponents: 50,
        approved: 8,
        required: 2,
        rejected: 2,
        totalKits: 15,
      },
      pricing: {
        finalUnitPrice: 5250,
        pricePerKit: 85,
        initialEstimatePrice: 5400,
        currency: 'DKK',
      },
      progressStep: 1,
    },
    status: UNIVERSITY_STATUS.INACTIVE_ORDERS,
    previousOrders: [
      { id: 'prev-3a', name: '2024 Semester kit', status: UNIVERSITY_STATUS.INACTIVE_ORDERS },
    ],
  },
  {
    id: 'uni-4',
    name: 'Coastal University',
    professorName: 'Prof. Erik Madsen',
    email: 'erik.madsen@coastal.edu',
    phone: '+45 55 66 77 88',
    addressLine1: '100 Harbor View',
    addressLine2: 'Marine Hall',
    ean: '5700000000004',
    loginCode: 'COA-G7H8',
    kit: {
      name: '2026 Semester kit',
      quoteId: '67',
      stats: {
        checked: 35,
        totalComponents: 50,
        approved: 30,
        required: 5,
        rejected: 5,
        totalKits: 45,
      },
      pricing: {
        finalUnitPrice: 76325,
        pricePerKit: 120,
        initialEstimatePrice: 78000,
        currency: 'DKK',
      },
      progressStep: 3,
    },
    status: UNIVERSITY_STATUS.REQUIRES_CHANGES,
    previousOrders: defaultPreviousOrders,
  },
  {
    id: 'uni-5',
    name: 'Metro College',
    professorName: 'Dr. Mia Jensen',
    email: 'mia.jensen@metrocollege.edu',
    phone: '+45 44 33 22 11',
    addressLine1: '200 Metro Plaza',
    addressLine2: '',
    ean: '5700000000005',
    loginCode: 'MET-I9J0',
    kit: {
      name: 'Spring 2026 kit',
      quoteId: '18',
      stats: {
        checked: 50,
        totalComponents: 50,
        approved: 50,
        required: 0,
        rejected: 0,
        totalKits: 200,
      },
      pricing: {
        finalUnitPrice: 265000,
        pricePerKit: 95,
        initialEstimatePrice: 268000,
        currency: 'DKK',
      },
      progressStep: 5,
    },
    status: UNIVERSITY_STATUS.ACTIVE_ORDER,
    previousOrders: defaultPreviousOrders,
  },
]
