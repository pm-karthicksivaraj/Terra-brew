import { create } from 'zustand'

export type ViewName =
  | 'module-select'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'farmers'
  | 'farmer-form'
  | 'farmer-detail'
  | 'farmlands'
  | 'farmland-form'
  | 'cultivations'
  | 'cultivation-form'
  | 'nurseries'
  | 'nursery-form'
  | 'land-preparations'
  | 'land-prep-form'
  | 'crop-monitorings'
  | 'crop-monitoring-form'
  | 'fertilizer-apps'
  | 'fertilizer-app-form'
  | 'pest-disease-mgmts'
  | 'pest-disease-mgmt-form'
  | 'harvest-traceabilities'
  | 'harvest-trace-form'
  | 'smart-contracts'
  | 'smart-contract-form'
  | 'marketplace'
  | 'marketplace-form'
  | 'coffee-inspections'
  | 'coffee-inspection-form'
  | 'batches'
  | 'traceability'
  | 'admin-reports'
  | 'credit-score'
  | 'qr-scan'
  | 'trace-journey'
  | 'qr-label'
  | 'procurement'
  | 'procurement-form'
  | 'cert-assessments'
  | 'cert-assessment-form'
  | 'collection-centres'
  | 'collection-centre-form'
  | 'procurement-records'
  | 'procurement-record-form'
  | 'procurement-transports'
  | 'procurement-transport-form'
  | 'ps-cleaning-washing'
  | 'ps-cleaning-washing-form'
  | 'ps-depulping-fermentation'
  | 'ps-depulping-fermentation-form'
  | 'ps-drying-hulling'
  | 'ps-drying-hulling-form'
  | 'ps-grading-sorting'
  | 'ps-grading-sorting-form'
  | 'ps-roasting-blending'
  | 'ps-roasting-blending-form'
  | 'ps-grinding-packaging'
  | 'ps-grinding-packaging-form'
  | 'ps-quality-control'
  | 'ps-quality-control-form'
  | 'coffee-processing'
  | 'coffee-processing-form'
  | 'processing-job-orders'
  | 'processing-job-order-form'

export interface ModuleItem {
  id: string
  name: string
  slug: string
  description: string
  icon: string
  color: string
  isActive: boolean
}

export interface UserItem {
  id: string
  email: string
  name: string
  role: string
  phone: string | null
  moduleId: string
}

export interface FarmerItem {
  id: string
  moduleId: string
  farmerCode: string | null
  fullName: string
  lastName: string
  contactNumber: string
  farmerPhoto: string | null
  gender: string | null
  dob: string | null
  age: number | null
  education: string | null
  maritalStatus: string | null
  guardianName: string | null
  email: string | null
  country: string | null
  province: string | null
  district: string | null
  commune: string | null
  village: string | null
  zipCode: string | null
  latitude: number | null
  longitude: number | null
  spouseName: string | null
  noOfFamilyMembers: number | null
  childrenBelow18Male: number | null
  childrenBelow18Female: number | null
  schoolGoingMale: number | null
  schoolGoingFemale: number | null
  housingOwnership: string | null
  houseType: string | null
  consumerElectronics: string | null
  vehicles: string | null
  farmEquipmentsJson: string | null
  animalHusbandryJson: string | null
  loanTaken: boolean
  loanTakenFrom: string | null
  loanAmount: number | null
  loanPurpose: string | null
  loanInterest: number | null
  loanInterestPeriod: string | null
  loanSecurity: boolean | null
  loanRepaymentAmt: number | null
  loanRepaymentDate: string | null
  otherInsuranceDetails: string | null
  creditScore: number | null
  isCertified: boolean
  certificationType: string | null
  yearOfICS: string | null
  cooperative: string | null
  enrollmentDate: string
  enrollmentPlace: string | null
  nationalIdType: string | null
  nationalIdNo: string | null
  idProofPhoto: string | null
  isActive: boolean
  createdAt: string
  _count?: { farmLands: number; cultivations: number }
}

export interface FarmLandItem {
  id: string
  moduleId: string
  farmerId: string
  farmName: string
  totalLandHolding: number | null
  latitude: number | null
  longitude: number | null
  farmPhoto: string | null
  landSurveyNo: string | null
  landOwnership: string | null
  approachRoad: string | null
  landTopology: string | null
  landGradient: string | null
  landDocument: string | null
  waterSource: string | null
  powerSource: string | null
  fertilityStatus: string | null
  irrigationSource: string | null
  irrigationType: string | null
  fullTimeWorkers: number | null
  partTimeWorkers: number | null
  seasonalWorkers: number | null
  familyWorkers: number | null
  lastChemicalAppDate: string | null
  conventionalLands: number | null
  fallowPastureLand: number | null
  conventionalCrops: string | null
  estYield: number | null
  conversionCertType: string | null
  currentConversionStatus: string | null
  conversionDate: string | null
  inspectorName: string | null
  qualified: boolean | null
  conversionRemarks: string | null
  soilCollectionDate: string | null
  soilLabTestDate: string | null
  soilResultDate: string | null
  soilReportUpload: string | null
  soilSamplesInfo: string | null
  isActive: boolean
  createdAt: string
  farmer?: FarmerItem
  _count?: { cultivations: number }
}

export interface CultivationItem {
  id: string
  moduleId: string
  farmerId: string
  farmLandId: string
  farmPlotName: string
  cropCategory: string | null
  harvestSeason: string | null
  cultivatedCrop: string | null
  cropVariety: string | null
  cultivationArea: number | null
  sowingDate: string | null
  cropCalendar: string | null
  estYield: string | null
  latitude: number | null
  longitude: number | null
  photo: string | null
  seedSource: string | null
  isSeedTreated: boolean
  seedType: string | null
  seedQuantity: number | null
  seedPrice: number | null
  seedCost: number | null
  sowingType: string | null
  sowingChargeBy: string | null
  sowingCharges: number | null
  sowingCost: number | null
  isActive: boolean
  createdAt: string
  farmer?: FarmerItem
  farmLand?: FarmLandItem
  _count?: { harvests: number }
}

export interface CertificationItem {
  id: string
  moduleId: string
  farmerId: string | null
  certifyingBody: string
  certificateNo: string
  certificateType: string | null
  scope: string | null
  status: string
  issueDate: string | null
  expiryDate: string | null
  createdAt: string
  updatedAt: string
}

export interface InspectionItem {
  id: string
  moduleId: string
  certificationId: string | null
  farmerId: string | null
  inspectorId: string
  inspectionDate: string
  inspectionType: string | null
  status: string
  complianceScore: number | null
  nonConformities: string | null
  correctiveActions: string | null
  recommendations: string | null
  inspectorNotes: string | null
  chemicalFree: boolean | null
  bufferZoneOk: boolean | null
  recordKeepingOk: boolean | null
  soilConservationOk: boolean | null
  waterMgmtOk: boolean | null
  biodiversityOk: boolean | null
  overallResult: string | null
  createdAt: string
  updatedAt: string
  farmer?: FarmerItem
  inspector?: { name: string }
}

export interface BatchItem {
  id: string
  lotCode: string
  harvestId: string
  processingDate: string | null
  millName: string | null
  exportDate: string | null
  exporterName: string | null
  importerName: string | null
  roasterName: string | null
  destination: string | null
  qrCode: string | null
  status: string
  createdAt: string
  updatedAt: string
  harvest?: {
    harvestDate: string | null
    harvestQty: number | null
    unit: string | null
    quality: string | null
    processingMethod: string | null
    cultivation?: {
      farmPlotName: string
      cultivatedCrop: string | null
      farmer?: { fullName: string }
    }
  }
}

export interface DashboardStats {
  totalFarmers: number
  totalFarmLands: number
  totalCultivations: number
  activeCertifications: number
  pendingInspections: number
  totalBatches: number
  avgCreditScore: number
  certifiedFarmers: number
}

interface AppState {
  currentView: ViewName
  selectedModule: ModuleItem | null
  currentUser: UserItem | null
  selectedFarmer: FarmerItem | null
  selectedFarmLand: FarmLandItem | null
  selectedCultivation: CultivationItem | null
  selectedCertification: CertificationItem | null
  selectedInspection: InspectionItem | null
  selectedRecord: any
  selectedBatch: any
  sidebarOpen: boolean
  restricted: boolean
  loading: boolean
  error: string | null
  modules: any[]
  farmers: any[]
  farmLands: any[]
  dashboardStats: any
  isLoading: boolean

  setCurrentView: (view: ViewName) => void
  setSelectedModule: (mod: ModuleItem | null) => void
  setCurrentUser: (user: UserItem | null) => void
  setSelectedFarmer: (farmer: FarmerItem | null) => void
  setSelectedFarmLand: (land: FarmLandItem | null) => void
  setSelectedCultivation: (cultivation: CultivationItem | null) => void
  setSelectedCertification: (cert: CertificationItem | null) => void
  setSelectedInspection: (inspection: InspectionItem | null) => void
  setSelectedRecord: (record: any) => void
  setSelectedBatch: (batch: any) => void
  setRestricted: (val: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setModules: (modules: any[]) => void
  setFarmers: (farmers: any[]) => void
  setFarmLands: (lands: any[]) => void
  setDashboardStats: (stats: any) => void
  setIsLoading: (loading: boolean) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'module-select',
  selectedModule: null,
  currentUser: null,
  selectedFarmer: null,
  selectedFarmLand: null,
  selectedCultivation: null,
  selectedCertification: null,
  selectedInspection: null,
  selectedRecord: null,
  selectedBatch: null,
  sidebarOpen: false,
  restricted: false,
  loading: false,
  error: null,
  modules: [],
  farmers: [],
  farmLands: [],
  dashboardStats: null,
  isLoading: false,

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedModule: (mod) => set({ selectedModule: mod }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setSelectedFarmer: (farmer) => set({ selectedFarmer: farmer }),
  setSelectedFarmLand: (land) => set({ selectedFarmLand: land }),
  setSelectedCultivation: (cultivation) => set({ selectedCultivation: cultivation }),
  setSelectedCertification: (cert) => set({ selectedCertification: cert }),
  setSelectedInspection: (inspection) => set({ selectedInspection: inspection }),
  setSelectedRecord: (record) => set({ selectedRecord: record }),
  setSelectedBatch: (batch) => set({ selectedBatch: batch }),
  setRestricted: (val) => set({ restricted: val }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setModules: (modules) => set({ modules }),
  setFarmers: (farmers) => set({ farmers }),
  setFarmLands: (lands) => set({ farmLands: lands }),
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  logout: () =>
    set({
      currentUser: null,
      selectedModule: null,
      selectedFarmer: null,
      selectedFarmLand: null,
      selectedCultivation: null,
      selectedCertification: null,
      selectedInspection: null,
      selectedRecord: null,
      selectedBatch: null,
      restricted: false,
      currentView: 'module-select',
    }),
}))
