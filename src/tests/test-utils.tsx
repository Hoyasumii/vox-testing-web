import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { vi } from 'vitest'
import { ToastProvider } from '../contexts/ToastContext'
import { AuthProvider, AuthContext } from '../contexts/AuthContext'
import { ThemeProvider } from '../contexts/ThemeContext'

interface TestUser {
  id: string;
  name: string;
  email: string;
  type: 'DOCTOR' | 'PATIENT';
}

interface TestAuthProviderProps {
  children: React.ReactNode;
  mockUser?: TestUser;
}

// Mock do AuthProvider para testes
function TestAuthProvider({ children, mockUser }: TestAuthProviderProps) {
  if (mockUser) {
    // Simula um usuário autenticado
    const mockAuthValue = {
      user: mockUser,
      token: 'mock-token',
      signIn: vi.fn(),
      signOut: vi.fn(),
      loading: false
    };
    
    return (
      <AuthContext.Provider value={mockAuthValue}>
        <div data-testid="auth-provider" data-user-type={mockUser.type}>
          {children}
        </div>
      </AuthContext.Provider>
    );
  }
  
  // Usa o AuthProvider real para casos sem mock
  return <AuthProvider>{children}</AuthProvider>;
}

// Provider que engloba todos os contextos necessários para testes
function AllProviders({ 
  children, 
  mockUser 
}: { 
  children: React.ReactNode;
  mockUser?: TestUser;
}) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <TestAuthProvider mockUser={mockUser}>
          {children}
        </TestAuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}

// Função customizada de render que inclui todos os providers
export function renderWithProviders(
  ui: ReactElement, 
  options: { mockUser?: TestUser } = {}
) {
  const { mockUser, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders mockUser={mockUser}>
        {children}
      </AllProviders>
    ),
    ...renderOptions
  })
}

// Helper para criar usuários mock
export const createMockUser = (type: 'DOCTOR' | 'PATIENT' = 'PATIENT'): TestUser => ({
  id: type === 'DOCTOR' ? 'doctor-1' : 'patient-1',
  name: type === 'DOCTOR' ? 'Dr. Test' : 'Patient Test',
  email: type === 'DOCTOR' ? 'doctor@test.com' : 'patient@test.com',
  type,
});

// Re-exporta tudo do testing-library
export * from '@testing-library/react'
