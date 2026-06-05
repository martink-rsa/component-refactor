// Registers jest-dom matchers (toBeInTheDocument, etc.) on Vitest's `expect`.
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// With Vitest `globals: false`, Testing Library can't auto-register cleanup,
// so we unmount React trees between tests ourselves to avoid DOM leakage.
afterEach(() => {
  cleanup()
})
