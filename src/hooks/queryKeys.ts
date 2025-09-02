// Centralized query key factory for better cache management
export const queryKeys = {
  // Products
  products: {
    all: ['products'] as const,
    production: ['products', 'production'] as const,
    external: ['products', 'external'] as const,
    ingredients: ['products', 'ingredients'] as const,
    byType: (type: string) => ['products', 'type', type] as const,
  },
  
  // Production
  production: {
    all: ['production'] as const,
    batches: (location?: string) => ['production', 'batches', location] as const,
    batch: (id: string) => ['production', 'batch', id] as const,
  },
  
  // Chefs
  chefs: {
    all: ['chefs'] as const,
    byLocation: (location?: string) => ['chefs', 'location', location] as const,
  },
  
  // Cleaning Tasks
  cleaning: {
    all: ['cleaning'] as const,
    tasks: (location?: string) => ['cleaning', 'tasks', location] as const,
    completed: (location?: string, startDate?: Date, endDate?: Date) => 
      ['cleaning', 'completed', location, startDate?.toISOString(), endDate?.toISOString()] as const,
  },
  
  // Dispatch
  dispatch: {
    all: ['dispatch'] as const,
    records: (location?: string) => ['dispatch', 'records', location] as const,
    internal: (location?: string) => ['internal-dispatch-records', location] as const,
  },
  
  // Packing Slips
  packingSlips: {
    all: ['packing-slips'] as const,
    byLocation: (location?: string) => ['packing-slips', location] as const,
  },
  
  // Unit Options
  unitOptions: {
    all: ['unit-options'] as const,
    byType: (type: string) => ['unit-options', 'type', type] as const,
  },
  
  // Users & Auth
  users: {
    all: ['users'] as const,
    profiles: ['user-profiles'] as const,
    currentProfile: ['current-user-profile'] as const,
  },
  
  // FAVV Reports
  favv: {
    all: ['favv'] as const,
    completedTasks: (location?: string, startDate?: Date, endDate?: Date) => 
      ['favv', 'completed-tasks', location, startDate?.toISOString(), endDate?.toISOString()] as const,
    packingSlips: (location?: string, startDate?: Date, endDate?: Date) => 
      ['favv', 'packing-slips', location, startDate?.toISOString(), endDate?.toISOString()] as const,
    stockTakes: (location?: string, startDate?: Date, endDate?: Date) => 
      ['favv', 'stock-takes', location, startDate?.toISOString(), endDate?.toISOString()] as const,
  },
} as const;