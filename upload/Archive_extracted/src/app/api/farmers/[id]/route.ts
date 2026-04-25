import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Fields that exist in the Prisma Farmer model (for safe filtering)
const VALID_FARMER_FIELDS = [
  'tenantId', 'enrollmentDate', 'enrollmentPlace', 'farmerCode', 'isCertified',
  'certificationType', 'yearOfICS', 'cooperative', 'fullName', 'firstName', 'lastName',
  'middleName', 'contactNumber', 'farmerPhoto', 'nationalIdType', 'nationalIdNo',
  'idProofPhoto', 'ekycConsent', 'gender', 'dob', 'age', 'education', 'maritalStatus',
  'guardianName', 'ethnicGroup', 'primaryLanguage', 'yearsOfFarmingExperience', 'email',
  'country', 'province', 'district', 'commune', 'village', 'zipCode', 'latitude', 'longitude',
  'spouseName', 'noOfFamilyMembers', 'childrenBelow18Male', 'childrenBelow18Female',
  'schoolGoingMale', 'schoolGoingFemale', 'housingOwnership', 'houseType',
  'consumerElectronics', 'vehicles', 'smartphoneOwnership', 'solarPanelInstalled',
  'accountType', 'accountNumber', 'bankName', 'branchDetails', 'sortCodeSwift',
  'annualFarmIncome', 'offFarmIncomeSources', 'taxId', 'loanTaken', 'loanTakenFrom',
  'loanAmount', 'loanPurpose', 'loanInterest', 'loanInterestPeriod', 'loanSecurity',
  'loanRepaymentAmt', 'loanRepaymentDate', 'repaymentTrackRecord', 'lifeInsurance',
  'lifeInsProvider', 'lifeInsAmount', 'lifeInsStartDate', 'lifeInsEndDate', 'healthInsurance',
  'healthInsProvider', 'healthInsAmount', 'healthInsStartDate', 'healthInsEndDate',
  'cropInsurance', 'cropInsProvider', 'cropInsCrops', 'cropInsAreaHa',
  'cropInsStartDate', 'cropInsEndDate', 'socialInsurance', 'socialInsProvider',
  'socialInsStartDate', 'socialInsEndDate', 'otherInsuranceDetails', 'farmEquipmentsJson',
  'animalHusbandryJson', 'gapTrainingAttended', 'trainingDate', 'trainingProvider',
  'trainingCertificate', 'creditScore', 'isActive', 'createdBy',
]

// Fields that should be Int (convert empty string to null)
const INT_FIELDS = [
  'noOfFamilyMembers', 'childrenBelow18Male', 'childrenBelow18Female',
  'schoolGoingMale', 'schoolGoingFemale', 'yearsOfFarmingExperience', 'age',
]

// Fields that should be Float (convert empty string to null)
const FLOAT_FIELDS = [
  'latitude', 'longitude', 'annualFarmIncome', 'loanAmount', 'loanInterest',
  'loanRepaymentAmt', 'creditScore', 'lifeInsAmount', 'healthInsAmount',
  'cropInsAreaHa',
]

function cleanFarmerData(data: any) {
  const clean: any = {}

  for (const [key, value] of Object.entries(data)) {
    // Skip invalid/unknown fields
    if (!VALID_FARMER_FIELDS.includes(key)) continue

    // Convert empty strings to null for numeric fields
    if (INT_FIELDS.includes(key)) {
      clean[key] = value === '' || value === undefined || value === null ? null : parseInt(value as string, 10)
      continue
    }
    if (FLOAT_FIELDS.includes(key)) {
      clean[key] = value === '' || value === undefined || value === null ? null : parseFloat(value as string)
      continue
    }

    // Keep other fields as-is
    clean[key] = value
  }

  // Handle date fields
  if (data.dob) clean.dob = new Date(data.dob)
  if (data.loanRepaymentDate) clean.loanRepaymentDate = new Date(data.loanRepaymentDate)
  if (data.lifeInsStartDate) clean.lifeInsStartDate = new Date(data.lifeInsStartDate)
  if (data.lifeInsEndDate) clean.lifeInsEndDate = new Date(data.lifeInsEndDate)
  if (data.healthInsStartDate) clean.healthInsStartDate = new Date(data.healthInsStartDate)
  if (data.healthInsEndDate) clean.healthInsEndDate = new Date(data.healthInsEndDate)
  if (data.cropInsStartDate) clean.cropInsStartDate = new Date(data.cropInsStartDate)
  if (data.cropInsEndDate) clean.cropInsEndDate = new Date(data.cropInsEndDate)
  if (data.socialInsStartDate) clean.socialInsStartDate = new Date(data.socialInsStartDate)
  if (data.socialInsEndDate) clean.socialInsEndDate = new Date(data.socialInsEndDate)
  if (data.trainingDate) clean.trainingDate = new Date(data.trainingDate)

  return clean
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const farmer = await db.farmer.findUnique({
    where: { id },
    include: {
      _count: { select: { farmLands: true, cultivations: true, coffeeInspections: true } },
      farmLands: { include: { _count: { select: { cultivations: true } } } },
      cultivations: { include: { farmLand: true, harvests: true } },
    },
  })
  if (!farmer) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  return NextResponse.json(farmer)
}

export async function PUT(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await _req.json()
    const cleanData = cleanFarmerData(data)

    const farmer = await db.farmer.update({
      where: { id },
      data: cleanData,
    })
    return NextResponse.json(farmer)
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await db.farmer.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
