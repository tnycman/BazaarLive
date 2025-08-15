# Phase 1: Install Missing Dependencies

## Required Packages

Run these commands to install missing dependencies:

```bash
# Core missing dependencies
npm install openai sharp aws-sdk node-fetch

# Type definitions for missing packages
npm install --save-dev @types/node-fetch @types/sharp @types/aws-sdk

# Replit-specific packages (if using Replit)
npm install @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-cartographer

# Additional visualization package
npm install rollup-plugin-visualizer

# Alternative: If you don't need certain packages, you can mock them
# Create empty mock files or update the code to not use these dependencies
```

## Optional: Mock Approach (if you don't need these services)

If you don't actually need these services in production, you can create mock implementations:

### 1. Mock OpenAI Service
Create `server/services/mocks/MockOpenAIService.ts`:
```typescript
export default class MockOpenAI {
  embeddings = {
    create: async () => ({
      data: [{ embedding: new Array(1536).fill(0) }]
    })
  };
}
```

### 2. Mock Sharp Service
Create `server/services/mocks/MockSharpService.ts`:
```typescript
export default function mockSharp() {
  return {
    resize: () => ({ toBuffer: async () => Buffer.from('') }),
    jpeg: () => ({ toBuffer: async () => Buffer.from('') })
  };
}
```

### 3. Update imports to use mocks
In your service files, use conditional imports:
```typescript
const OpenAI = process.env.NODE_ENV === 'production' 
  ? (await import('openai')).default
  : (await import('./mocks/MockOpenAIService')).default;
```

