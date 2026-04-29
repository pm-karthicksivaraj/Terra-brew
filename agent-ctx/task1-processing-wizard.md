# Task 1: Processing Multi-Step Wizard Page

## Summary
Created a comprehensive 7-step processing wizard page for the Metrang Coffee E2E Traceability Platform.

## Files Created
- `/home/z/my-project/src/app/processing/wizard/page.tsx` (1246 lines) - The main wizard page component

## Files Modified
- `/home/z/my-project/src/app/api/processing/route.ts` - Updated POST handler to support nested `processingStages` creation with tenantId propagation
- `/home/z/my-project/src/components/layout/dashboard-shell.tsx` - Added `wizard` entry to breadcrumb map

## Wizard Steps
1. **Reception & Sorting** (Phân loại & Làm sạch) - Job order info + sorting fields
2. **Pulping & Fermentation** (Bóc vỏ & Lên men) - Pulping method, fermentation details
3. **Washing** (Rửa) - Washing method, water source, cycles
4. **Drying** (Sấy) - Drying method, moisture levels, temperature/humidity
5. **Hulling & Polishing** (Bóc lụa & Đánh bóng) - Hulling method, output weight, screen size
6. **Grading & Sorting** (Phân loại & Xếp hạng) - Grade, cup score, defect count
7. **QC & Packaging** (QC & Đóng gói) - QC approval, packaging type, lot number
8. **Summary Review** (Step 8 - review before submission)

## Key Features
- Horizontal stepper with numbered circles and connecting lines (desktop)
- Compact progress bar stepper (mobile)
- Active step highlighted with coffee-600 gradient + ring
- Completed steps with green checkmark
- Card layout for each step's form fields
- Summary review on the last step before final submission
- Vietnamese/English toggle (lang state)
- Coffee-themed styling (coffee-600, coffee-800 gradients, rounded-xl)
- Loading state while submitting
- Responsive design with mobile-first approach
- Step navigation: Next/Back buttons
- Go-back-to-edit from summary
- Progress bar showing overall completion

## API Integration
The wizard POSTs to `/api/processing` with a single request that includes:
- Job order fields (jobOrderId, processingDate, batchIdInput, processingMethod, etc.)
- Nested `processingStages.create` array with 7 stage records
- Each stage automatically gets tenantId from the API handler

## Lint Status
- All new/modified files pass ESLint with no errors
