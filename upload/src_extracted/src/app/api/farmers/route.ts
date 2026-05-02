import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Fields that exist in the Prisma Farmer model
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

const INT_FIELDS = [
  'noOfFamilyMembers', 'childrenBelow18Male', 'childrenBelow18Female',
  'schoolGoingMale', 'schoolGoingFemale', 'yearsOfFarmingExperience', 'age',
]

const FLOAT_FIELDS = [
  'latitude', 'longitude', 'annualFarmIncome', 'loanAmount', 'loanInterest',
  'loanRepaymentAmt', 'creditScore', 'lifeInsAmount', 'healthInsAmount',
  'cropInsAreaHa',
]

function cleanFarmerData(data: any) {
  const clean: any = {}

  for (const [key, value] of Object.entries(data)) {
    if (!VALID_FARMER_FIELDS.includes(key)) continue

    if (INT_FIELDS.includes(key)) {
      clean[key] = value === '' || value === undefined || value === null ? null : parseInt(value as string, 10)
      continue
    }
    if (FLOAT_FIELDS.includes(key)) {
      clean[key] = value === '' || value === undefined || value === null ? null : parseFloat(value as string)
      continue
    }

    clean[key] = value
  }

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const moduleId = searchParams.get('moduleId')
  if (!moduleId) return NextResponse.json({ message: 'moduleId required' }, { status: 400 })
  const farmers = await db.farmer.findMany({
    where: { moduleId, isActive: true },
    include: { _count: { select: { farmLands: true, cultivations: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(farmers)
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    if (!data.moduleId || !data.fullName || !data.lastName || !data.contactNumber) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    const farmerCode = `FRM-${Date.now().toString(36).toUpperCase()}`
    const cleanData = cleanFarmerData(data)
    const farmer = await db.farmer.create({
      data: {
        ...cleanData,
        farmerCode,
      },
    })
    return NextResponse.json(farmer, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ message: e.message }, { status: 500 })
  }
}
