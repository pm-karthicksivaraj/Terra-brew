const API_BASE = '/api'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  return res.json()
}

// Modules
export const getModules = () => apiFetch<any[]>('/modules')

// Auth
export const register = (data: any) => apiFetch<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) })
export const login = (data: any) => apiFetch<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) })

// Farmers
export const getFarmers = (moduleId: string) => apiFetch<any[]>(`/farmers?moduleId=${moduleId}`)
export const getFarmer = (id: string) => apiFetch<any>(`/farmers/${id}`)
export const createFarmer = (data: any) => apiFetch<any>('/farmers', { method: 'POST', body: JSON.stringify(data) })
export const updateFarmer = (id: string, data: any) => apiFetch<any>(`/farmers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteFarmer = (id: string) => apiFetch<any>(`/farmers/${id}`, { method: 'DELETE' })

// Farm Lands
export const getFarmLands = (moduleId: string) => apiFetch<any[]>(`/farmlands?moduleId=${moduleId}`)
export const getFarmLand = (id: string) => apiFetch<any>(`/farmlands/${id}`)
export const createFarmLand = (data: any) => apiFetch<any>('/farmlands', { method: 'POST', body: JSON.stringify(data) })
export const updateFarmLand = (id: string, data: any) => apiFetch<any>(`/farmlands/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteFarmLand = (id: string) => apiFetch<any>(`/farmlands/${id}`, { method: 'DELETE' })

// Cultivations
export const getCultivations = (moduleId: string) => apiFetch<any[]>(`/cultivations?moduleId=${moduleId}`)
export const getCultivation = (id: string) => apiFetch<any>(`/cultivations/${id}`)
export const createCultivation = (data: any) => apiFetch<any>('/cultivations', { method: 'POST', body: JSON.stringify(data) })
export const updateCultivation = (id: string, data: any) => apiFetch<any>(`/cultivations/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCultivation = (id: string) => apiFetch<any>(`/cultivations/${id}`, { method: 'DELETE' })

// Coffee Inspections (Unified)
export const getCoffeeInspections = (moduleId: string) => apiFetch<any[]>(`/coffee-inspections?moduleId=${moduleId}`)
export const getCoffeeInspection = (id: string) => apiFetch<any>(`/coffee-inspections/${id}`)
export const createCoffeeInspection = (data: any) => apiFetch<any>('/coffee-inspections', { method: 'POST', body: JSON.stringify(data) })
export const updateCoffeeInspection = (id: string, data: any) => apiFetch<any>(`/coffee-inspections/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCoffeeInspection = (id: string) => apiFetch<any>(`/coffee-inspections/${id}`, { method: 'DELETE' })

// Batches
export const getBatches = (moduleId: string) => apiFetch<any[]>(`/batches?moduleId=${moduleId}`)
export const createBatch = (data: any) => apiFetch<any>('/batches', { method: 'POST', body: JSON.stringify(data) })

// Nurseries
export const getNurseries = (moduleId: string, cultivationId?: string) => {
  const query = cultivationId ? `?moduleId=${moduleId}&cultivationId=${cultivationId}` : `?moduleId=${moduleId}`
  return apiFetch<any[]>(`/nurseries${query}`)
}
export const getNursery = (id: string) => apiFetch<any>(`/nurseries/${id}`)
export const createNursery = (data: any) => apiFetch<any>('/nurseries', { method: 'POST', body: JSON.stringify(data) })
export const updateNursery = (id: string, data: any) => apiFetch<any>(`/nurseries/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteNursery = (id: string) => apiFetch<any>(`/nurseries/${id}`, { method: 'DELETE' })

// Land Preparations
export const getLandPreparations = (moduleId: string, cultivationId?: string) => {
  const query = cultivationId ? `?moduleId=${moduleId}&cultivationId=${cultivationId}` : `?moduleId=${moduleId}`
  return apiFetch<any[]>(`/land-preparations${query}`)
}
export const getLandPreparation = (id: string) => apiFetch<any>(`/land-preparations/${id}`)
export const createLandPreparation = (data: any) => apiFetch<any>('/land-preparations', { method: 'POST', body: JSON.stringify(data) })
export const updateLandPreparation = (id: string, data: any) => apiFetch<any>(`/land-preparations/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteLandPreparation = (id: string) => apiFetch<any>(`/land-preparations/${id}`, { method: 'DELETE' })

// Crop Monitorings
export const getCropMonitorings = (moduleId: string, cultivationId?: string) => {
  const query = cultivationId ? `?moduleId=${moduleId}&cultivationId=${cultivationId}` : `?moduleId=${moduleId}`
  return apiFetch<any[]>(`/crop-monitorings${query}`)
}
export const getCropMonitoring = (id: string) => apiFetch<any>(`/crop-monitorings/${id}`)
export const createCropMonitoring = (data: any) => apiFetch<any>('/crop-monitorings', { method: 'POST', body: JSON.stringify(data) })
export const updateCropMonitoring = (id: string, data: any) => apiFetch<any>(`/crop-monitorings/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCropMonitoring = (id: string) => apiFetch<any>(`/crop-monitorings/${id}`, { method: 'DELETE' })

// Fertilizer Applications
export const getFertilizerApps = (moduleId: string, cultivationId?: string) => {
  const query = cultivationId ? `?moduleId=${moduleId}&cultivationId=${cultivationId}` : `?moduleId=${moduleId}`
  return apiFetch<any[]>(`/fertilizer-apps${query}`)
}
export const getFertilizerApp = (id: string) => apiFetch<any>(`/fertilizer-apps/${id}`)
export const createFertilizerApp = (data: any) => apiFetch<any>('/fertilizer-apps', { method: 'POST', body: JSON.stringify(data) })
export const updateFertilizerApp = (id: string, data: any) => apiFetch<any>(`/fertilizer-apps/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteFertilizerApp = (id: string) => apiFetch<any>(`/fertilizer-apps/${id}`, { method: 'DELETE' })

// Pest & Disease Management
export const getPestDiseaseMgmts = (moduleId: string, cultivationId?: string) => {
  const query = cultivationId ? `?moduleId=${moduleId}&cultivationId=${cultivationId}` : `?moduleId=${moduleId}`
  return apiFetch<any[]>(`/pest-disease-mgmts${query}`)
}
export const getPestDiseaseMgmt = (id: string) => apiFetch<any>(`/pest-disease-mgmts/${id}`)
export const createPestDiseaseMgmt = (data: any) => apiFetch<any>('/pest-disease-mgmts', { method: 'POST', body: JSON.stringify(data) })
export const updatePestDiseaseMgmt = (id: string, data: any) => apiFetch<any>(`/pest-disease-mgmts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deletePestDiseaseMgmt = (id: string) => apiFetch<any>(`/pest-disease-mgmts/${id}`, { method: 'DELETE' })

// Harvest Traceabilities
export const getHarvestTraceabilities = (moduleId: string, cultivationId?: string) => {
  const query = cultivationId ? `?moduleId=${moduleId}&cultivationId=${cultivationId}` : `?moduleId=${moduleId}`
  return apiFetch<any[]>(`/harvest-traceabilities${query}`)
}
export const getHarvestTraceability = (id: string) => apiFetch<any>(`/harvest-traceabilities/${id}`)
export const createHarvestTraceability = (data: any) => apiFetch<any>('/harvest-traceabilities', { method: 'POST', body: JSON.stringify(data) })
export const updateHarvestTraceability = (id: string, data: any) => apiFetch<any>(`/harvest-traceabilities/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteHarvestTraceability = (id: string) => apiFetch<any>(`/harvest-traceabilities/${id}`, { method: 'DELETE' })

// Smart Contracts
export const getSmartContracts = (moduleId: string) => apiFetch<any[]>(`/smart-contracts?moduleId=${moduleId}`)
export const getSmartContract = (id: string) => apiFetch<any>(`/smart-contracts/${id}`)
export const createSmartContract = (data: any) => apiFetch<any>('/smart-contracts', { method: 'POST', body: JSON.stringify(data) })
export const updateSmartContract = (id: string, data: any) => apiFetch<any>(`/smart-contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteSmartContract = (id: string) => apiFetch<any>(`/smart-contracts/${id}`, { method: 'DELETE' })

// Marketplace Listings
export const getMarketplaceListings = (moduleId: string) => apiFetch<any[]>(`/marketplace-listings?moduleId=${moduleId}`)
export const getMarketplaceListing = (id: string) => apiFetch<any>(`/marketplace-listings/${id}`)
export const createMarketplaceListing = (data: any) => apiFetch<any>('/marketplace-listings', { method: 'POST', body: JSON.stringify(data) })
export const updateMarketplaceListing = (id: string, data: any) => apiFetch<any>(`/marketplace-listings/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteMarketplaceListing = (id: string) => apiFetch<any>(`/marketplace-listings/${id}`, { method: 'DELETE' })



// Dashboard
export const getDashboardStats = (moduleId: string) => apiFetch<any>(`/dashboard/stats?moduleId=${moduleId}`)

// Admin Reports
export const getAdminReports = (moduleId: string) => apiFetch<any>(`/reports?moduleId=${moduleId}`)

// Seed
export const seedData = (moduleId: string) => apiFetch<any>('/seed', { method: 'POST', body: JSON.stringify({ moduleId }) })
// Seed Full Flow (7-stage processing + complete traceability)
export const seedFullFlow = (moduleId: string) => apiFetch<any>('/seed-full-flow', { method: 'POST', body: JSON.stringify({ moduleId }) })
// QR Code
export const getQRCode = (data: string) => apiFetch<{ qr: string }>(`/qrcode?data=${encodeURIComponent(data)}`)

// Hash Chain
export const getHashChain = (batchId: string) => apiFetch<any[]>(`/hash-chain?batchId=${batchId}`)
export const verifyHashChain = (batchId: string) => apiFetch<{ valid: boolean; blocks: number; message: string }>(`/hash-chain?batchId=${batchId}&verify=true`)
export const createHashBlock = (data: any) => apiFetch<any>('/hash-chain', { method: 'POST', body: JSON.stringify(data) })

// Coffee Processing
export const getCoffeeProcessing = (moduleId: string) => apiFetch<any[]>(`/coffee-processing?moduleId=${moduleId}`)
export const updateCoffeeProcessing = (id: string, data: any) => apiFetch<any>(`/coffee-processing`, { method: 'POST', body: JSON.stringify({ id, ...data }) })

// Cert Assessments
export const getCertAssessments = (moduleId: string) => apiFetch<any[]>(`/cert-assessments?moduleId=${moduleId}`)
export const getCertAssessment = (id: string) => apiFetch<any>(`/cert-assessments/${id}`)
export const createCertAssessment = (data: any) => apiFetch<any>('/cert-assessments', { method: 'POST', body: JSON.stringify(data) })
export const updateCertAssessment = (id: string, data: any) => apiFetch<any>(`/cert-assessments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCertAssessment = (id: string) => apiFetch<any>(`/cert-assessments/${id}`, { method: 'DELETE' })

// Collection Centres
export const getCollectionCentres = (moduleId: string) => apiFetch<any[]>(`/collection-centres?moduleId=${moduleId}`)
export const createCollectionCentre = (data: any) => apiFetch<any>('/collection-centres', { method: 'POST', body: JSON.stringify(data) })
export const updateCollectionCentre = (id: string, data: any) => apiFetch<any>(`/collection-centres/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCollectionCentre = (id: string) => apiFetch<any>(`/collection-centres/${id}`, { method: 'DELETE' })

// Procurement Records
export const getProcurementRecords = (moduleId: string) => apiFetch<any[]>(`/procurement-records?moduleId=${moduleId}`)
export const createProcurementRecord = (data: any) => apiFetch<any>('/procurement-records', { method: 'POST', body: JSON.stringify(data) })
export const updateProcurementRecord = (id: string, data: any) => apiFetch<any>(`/procurement-records/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteProcurementRecord = (id: string) => apiFetch<any>(`/procurement-records/${id}`, { method: 'DELETE' })

// Procurement Transports
export const getProcurementTransports = (moduleId: string) => apiFetch<any[]>(`/procurement-transports?moduleId=${moduleId}`)
export const createProcurementTransport = (data: any) => apiFetch<any>('/procurement-transports', { method: 'POST', body: JSON.stringify(data) })
export const updateProcurementTransport = (id: string, data: any) => apiFetch<any>(`/procurement-transports/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteProcurementTransport = (id: string) => apiFetch<any>(`/procurement-transports/${id}`, { method: 'DELETE' })

// Processing Job Orders
export const getProcessingJobOrders = (moduleId: string) => apiFetch<any[]>(`/processing-job-orders?moduleId=${moduleId}`)
export const createProcessingJobOrder = (data: any) => apiFetch<any>('/processing-job-orders', { method: 'POST', body: JSON.stringify(data) })
export const updateProcessingJobOrder = (id: string, data: any) => apiFetch<any>(`/processing-job-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteProcessingJobOrder = (id: string) => apiFetch<any>(`/processing-job-orders/${id}`, { method: 'DELETE' })

// Procurement (dedicated module)
export const getProcurements = (moduleId: string) => apiFetch<any[]>(`/procurement-records?moduleId=${moduleId}`)

// Processing Stage Records
export const getProcessingStages = (moduleId: string, stageType: string, batchId?: string) => {
  const query = batchId ? `?moduleId=${moduleId}&stageType=${stageType}&batchId=${batchId}` : `?moduleId=${moduleId}&stageType=${stageType}`
  return apiFetch<any[]>(`/processing-stages${query}`)
}
export const getProcessingStage = (id: string) =>
  apiFetch<any>(`/processing-stages/${id}`)
export const createProcessingStage = (data: any) =>
  apiFetch<any>('/processing-stages', { method: 'POST', body: JSON.stringify(data) })
export const updateProcessingStage = (id: string, data: any) =>
  apiFetch<any>(`/processing-stages/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteProcessingStage = (id: string) =>
  apiFetch<any>(`/processing-stages/${id}`, { method: 'DELETE' })
