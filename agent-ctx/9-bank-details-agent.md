# Task 9: Bank Details for Farmer Model

## Task
Add bank details fields to the Farmer model in Prisma schema and update the Farmer UI.

## Work Completed

### 1. Prisma Schema
Added 9 bank detail fields to Farmer model after `healthInsurance`:
- bankName, bankBranch, accountType, accountNumber, accountHolderName, sortCodeSwift, mobileMoneyProvider, mobileMoneyNumber, paymentPreference

### 2. Farmer Detail Page (`/src/app/farmers/[id]/page.tsx`)
- Added Building2, Wallet to lucide-react imports
- Added bank fields to FarmerDetailFull interface and MOCK_FARMER
- Added "Bank & Payment Details" card in overview tab after Insurance section
- Uses InfoRow with icons, 2/3 col responsive grid, FadeIn animation

### 3. Farmer Create/Edit Form (`/src/app/farmers/page.tsx`)
- Added Landmark, Building2, CreditCard, Hash, Smartphone, Phone, Wallet, FileText imports
- Added bank fields to Farmer interface, form state, resetForm
- Added "Bank Details" section with inputs and Select dropdowns
- handleSubmit converts empty strings to null for Prisma

### 4. API Route
No changes needed - already uses spread operators for POST/PUT.

### 5. Database
`prisma generate` and `prisma db push` both successful.
