// API helper for SPA - uses JWT Bearer token from localStorage

const API_BASE = '/api/spa'
const LOGIN_BASE = '/api/login'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('terra_brew_token')
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function apiGet(resource: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString()
  const url = `${API_BASE}?resource=${resource}${qs ? '&' + qs : ''}`
  const res = await fetch(url, { headers: getHeaders() })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'API error')
  return json.data
}

async function apiPost(resource: string, data: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ resource, data }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'API error')
  return json.data
}

async function apiPut(resource: string, id: string, data: any) {
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ resource, id, data }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'API error')
  return json.data
}

async function apiDelete(resource: string, id: string) {
  const res = await fetch(`${API_BASE}?resource=${resource}&id=${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'API error')
  return json.data
}

// Auth
export async function login(email: string, password: string, tenantSlug: string) {
  const res = await fetch(LOGIN_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, tenantSlug }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Login failed')
  localStorage.setItem('terra_brew_token', json.data.token)
  return json.data.user
}

export async function getTenants() {
  const res = await fetch('/api/tenants/list')
  const json = await res.json()
  if (!json.success) throw new Error(json.error)
  return json.data
}

// Dashboard
export const getDashboardStats = () => apiGet('dashboard')

// Farmers
export const getFarmers = (search = '') => apiGet('farmers', { search })
export const getFarmer = (id: string) => apiGet('farmers', { id })
export const createFarmer = (data: any) => apiPost('farmers', data)
export const updateFarmer = (id: string, data: any) => apiPut('farmers', id, data)
export const deleteFarmer = (id: string) => apiDelete('farmers', id)

// Farm Lands
export const getFarmLands = (search = '') => apiGet('farmlands', { search })
export const getFarmLand = (id: string) => apiGet('farmlands', { id })
export const createFarmLand = (data: any) => apiPost('farmlands', data)
export const updateFarmLand = (id: string, data: any) => apiPut('farmlands', id, data)
export const deleteFarmLand = (id: string) => apiDelete('farmlands', id)

// Cultivations
export const getCultivations = (search = '') => apiGet('cultivations', { search })
export const createCultivation = (data: any) => apiPost('cultivations', data)
export const updateCultivation = (id: string, data: any) => apiPut('cultivations', id, data)
export const deleteCultivation = (id: string) => apiDelete('cultivations', id)

// Nurseries
export const getNurseries = (search = '') => apiGet('nurseries', { search })
export const createNursery = (data: any) => apiPost('nurseries', data)
export const updateNursery = (id: string, data: any) => apiPut('nurseries', id, data)
export const deleteNursery = (id: string) => apiDelete('nurseries', id)

// Land Preparations
export const getLandPreparations = (search = '') => apiGet('land-preparations', { search })
export const createLandPreparation = (data: any) => apiPost('land-preparations', data)
export const updateLandPreparation = (id: string, data: any) => apiPut('land-preparations', id, data)
export const deleteLandPreparation = (id: string) => apiDelete('land-preparations', id)

// Crop Monitorings
export const getCropMonitorings = (search = '') => apiGet('crop-monitorings', { search })
export const createCropMonitoring = (data: any) => apiPost('crop-monitorings', data)
export const updateCropMonitoring = (id: string, data: any) => apiPut('crop-monitorings', id, data)
export const deleteCropMonitoring = (id: string) => apiDelete('crop-monitorings', id)

// Fertilizer Applications
export const getFertilizerApps = (search = '') => apiGet('fertilizer-apps', { search })
export const createFertilizerApp = (data: any) => apiPost('fertilizer-apps', data)
export const updateFertilizerApp = (id: string, data: any) => apiPut('fertilizer-apps', id, data)
export const deleteFertilizerApp = (id: string) => apiDelete('fertilizer-apps', id)

// Pest Disease Managements
export const getPestDiseaseMgmts = (search = '') => apiGet('pest-disease-mgmts', { search })
export const createPestDiseaseMgmt = (data: any) => apiPost('pest-disease-mgmts', data)
export const updatePestDiseaseMgmt = (id: string, data: any) => apiPut('pest-disease-mgmts', id, data)
export const deletePestDiseaseMgmt = (id: string) => apiDelete('pest-disease-mgmts', id)

// Harvest Traceabilities
export const getHarvestRecords = (search = '') => apiGet('harvest-traceabilities', { search })
export const createHarvestRecord = (data: any) => apiPost('harvest-traceabilities', data)
export const updateHarvestRecord = (id: string, data: any) => apiPut('harvest-traceabilities', id, data)
export const deleteHarvestRecord = (id: string) => apiDelete('harvest-traceabilities', id)

// Collection Centres
export const getCollectionCentres = (search = '') => apiGet('collection-centres', { search })
export const createCollectionCentre = (data: any) => apiPost('collection-centres', data)
export const updateCollectionCentre = (id: string, data: any) => apiPut('collection-centres', id, data)
export const deleteCollectionCentre = (id: string) => apiDelete('collection-centres', id)

// Procurement Records
export const getProcurementRecords = (search = '') => apiGet('procurement-records', { search })
export const createProcurementRecord = (data: any) => apiPost('procurement-records', data)
export const updateProcurementRecord = (id: string, data: any) => apiPut('procurement-records', id, data)
export const deleteProcurementRecord = (id: string) => apiDelete('procurement-records', id)

// Processing Job Orders
export const getProcessingJobOrders = (search = '') => apiGet('processing-job-orders', { search })
export const createProcessingJobOrder = (data: any) => apiPost('processing-job-orders', data)
export const updateProcessingJobOrder = (id: string, data: any) => apiPut('processing-job-orders', id, data)
export const deleteProcessingJobOrder = (id: string) => apiDelete('processing-job-orders', id)

// Processing Stage Records
export const createProcessingStage = (data: any) => apiPost('processing-stage-records', data)

// Coffee Inspections
export const getCoffeeInspections = (search = '') => apiGet('coffee-inspections', { search })
export const createCoffeeInspection = (data: any) => apiPost('coffee-inspections', data)
export const updateCoffeeInspection = (id: string, data: any) => apiPut('coffee-inspections', id, data)
export const deleteCoffeeInspection = (id: string) => apiDelete('coffee-inspections', id)

// Cert Assessments
export const getCertAssessments = (search = '') => apiGet('cert-assessments', { search })
export const createCertAssessment = (data: any) => apiPost('cert-assessments', data)
export const updateCertAssessment = (id: string, data: any) => apiPut('cert-assessments', id, data)
export const deleteCertAssessment = (id: string) => apiDelete('cert-assessments', id)

// Smart Contracts
export const getSmartContracts = () => apiGet('smart-contracts')
export const createSmartContract = (data: any) => apiPost('smart-contracts', data)
export const updateSmartContract = (id: string, data: any) => apiPut('smart-contracts', id, data)
export const deleteSmartContract = (id: string) => apiDelete('smart-contracts', id)

// Marketplace
export const getMarketplaceListings = () => apiGet('marketplace')
export const createMarketplaceListing = (data: any) => apiPost('marketplace', data)
export const updateMarketplaceListing = (id: string, data: any) => apiPut('marketplace', id, data)
export const deleteMarketplaceListing = (id: string) => apiDelete('marketplace', id)

// EUDR Compliance
export const getEudrCompliances = () => apiGet('eudr-compliance')
export const createEudrCompliance = (data: any) => apiPost('eudr-compliance', data)
export const updateEudrCompliance = (id: string, data: any) => apiPut('eudr-compliance', id, data)
export const deleteEudrCompliance = (id: string) => apiDelete('eudr-compliance', id)

// Deforestation
export const getDeforestationAssessments = () => apiGet('deforestation')
export const createDeforestationAssessment = (data: any) => apiPost('deforestation', data)

// Export Documents
export const getExportDocs = () => apiGet('export-docs')
export const createExportDoc = (data: any) => apiPost('export-docs', data)
export const updateExportDoc = (id: string, data: any) => apiPut('export-docs', id, data)
export const deleteExportDoc = (id: string) => apiDelete('export-docs', id)

// Shipments
export const getShipments = () => apiGet('shipments')
export const createShipment = (data: any) => apiPost('shipments', data)
export const updateShipment = (id: string, data: any) => apiPut('shipments', id, data)
export const deleteShipment = (id: string) => apiDelete('shipments', id)

// Buyers
export const getBuyers = () => apiGet('buyers')
export const createBuyer = (data: any) => apiPost('buyers', data)
export const updateBuyer = (id: string, data: any) => apiPut('buyers', id, data)
export const deleteBuyer = (id: string) => apiDelete('buyers', id)

// Trading Contracts
export const getTradingContracts = () => apiGet('trading-contracts')
export const createTradingContract = (data: any) => apiPost('trading-contracts', data)
export const updateTradingContract = (id: string, data: any) => apiPut('trading-contracts', id, data)
export const deleteTradingContract = (id: string) => apiDelete('trading-contracts', id)

// Dropdown lists
export const getFarmersList = () => apiGet('farmers-list')
export const getFarmLandsList = (farmerId?: string) => apiGet('farmlands-list', farmerId ? { farmerId } : {})
export const getCultivationsList = () => apiGet('cultivations-list')
