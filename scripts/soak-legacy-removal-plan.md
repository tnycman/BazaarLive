Legacy removal plan (post-soak)

Candidates to delete after validation period:
- client/src/legacy/pages/marketplace/VerticalPage.tsx
- client/src/legacy/pages/fashion/* (all moved non-enterprise pages)
- client/src/legacy/components/filters/AdvancedSideFilter.tsx
- client/src/legacy/hooks/useSideFilter.ts
- client/src/legacy/services/filtering/SideFilterDataService.ts

Pre-conditions:
- CI green for 1 week
- No imports from legacy/ (lint clean)
- App routing verified to `UniversalCategoryPage`


