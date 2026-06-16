import '@testing-library/jest-dom/vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Supabase client
vi.mock('@/lib/supabase', () => {
  const actual = vi.importActual('@supabase/supabase-js');
  return {
    supabase: {
      auth: {
        onAuthStateChange: vi.fn(),
        getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        then: vi.fn((cb) => cb({ data: [], error: null })),
      })),
      rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  };
});
