import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ data: null, error: null }),
        download: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
  },
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Search: () => null,
  Filter: () => null,
  Download: () => null,
  Upload: () => null,
  Plus: () => null,
  X: () => null,
  Check: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null,
  AlertCircle: () => null,
  Info: () => null,
}))
