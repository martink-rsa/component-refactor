The following changes were done:

1. pnpm repo setup with linting, typechecking, test setup and commit/push hooks
2. Abstracted TypeScript types
3. Added Tanstack query and separated the API services
4. Add zustand for state management and refactor to use stores
5. Abstract components to standalone components
6. Add zod schema validation

This makes the codebase far more robust.

From here I would move onto tests and adding Storybook.