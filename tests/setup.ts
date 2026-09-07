// test/setup.ts
//
// Runs once before the test suite. Extends Vitest's `expect` with
// jest-dom matchers (toBeInTheDocument, etc) for any component tests.

import "@testing-library/jest-dom/vitest";