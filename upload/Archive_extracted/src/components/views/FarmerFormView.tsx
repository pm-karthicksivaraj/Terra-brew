'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { createFarmer, updateFarmer, getFarmer } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Toaster, toast } from 'sonner'
import { Save, ArrowLeft, Loader2 } from 'lucide-react'

export function FarmerFormView() {
  const { selectedModule, selectedFarmer, setCurrentView, setSelectedFarmer, setFarmers, farmers, setIsLoading, isLoading } = useAppStore()
  const isEdit = !!selectedFarmer?.id

  const [form, setForm] = useState({
    enrollmentDate: new Date().toISOString().slice(0, 10),
    enrollmentPlace: '',
    isCertified: false,
    certificationType: '',
    yearOfICS: '',
    cooperative: '',
    fullName: '',
    lastName: '',
    contactNumber: '',
    nationalIdType: '',
    nationalIdNo: '',
    gender: '',
    dob: '',
    education: '',
    maritalStatus: '',
    guardianName: '',
    email: '',
    country: '',
    province: '',
    district: '',
    commune: '',
    village: '',
    zipCode: '',
    spouseName: '',
    noOfFamilyMembers: '',
    childrenBelow18Male: '',
    childrenBelow18Female: '',
    schoolGoingMale: '',
    schoolGoingFemale: '',
    housingOwnership: '',
    houseType: '',
    consumerElectronics: '',
    vehicles: '',
    farmEquipments: '',
    animalHusbandry: '',
    loanTaken: false,
    loanTakenFrom: '',
    loanAmount: '',
    loanPurpose: '',
    loanInterest: '',
    loanInterestPeriod: '',
    loanSecurity: false,
    loanRepaymentAmt: '',
    loanRepaymentDate: '',
    insuranceInfo: '',
    creditScore: '',
  })

  useEffect(() => {
    if (selectedFarmer?.id) {
      const f = selectedFarmer
      setForm({
        enrollmentDate: f.enrollmentDate?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        enrollmentPlace: f.enrollmentPlace || '',
        isCertified: f.isCertified || false,
        certificationType: f.certificationType || '',
        yearOfICS: f.yearOfICS || '',
        cooperative: f.cooperative || '',
        fullName: f.fullName || '',
        lastName: f.lastName || '',
        contactNumber: f.contactNumber || '',
        nationalIdType: f.nationalIdType || '',
        nationalIdNo: f.nationalIdNo || '',
        gender: f.gender || '',
        dob: f.dob?.slice(0, 10) || '',
        education: f.education || '',
        maritalStatus: f.maritalStatus || '',
        guardianName: f.guardianName || '',
        email: f.email || '',
        country: f.country || '',
        province: f.province || '',
        district: f.district || '',
        commune: f.commune || '',
        village: f.village || '',
        zipCode: f.zipCode || '',
        spouseName: f.spouseName || '',
        noOfFamilyMembers: f.noOfFamilyMembers?.toString() || '',
        childrenBelow18Male: f.childrenBelow18Male?.toString() || '',
        childrenBelow18Female: f.childrenBelow18Female?.toString() || '',
        schoolGoingMale: f.schoolGoingMale?.toString() || '',
        schoolGoingFemale: f.schoolGoingFemale?.toString() || '',
        housingOwnership: f.housingOwnership || '',
        houseType: f.houseType || '',
        consumerElectronics: f.consumerElectronics || '',
        vehicles: f.vehicles || '',
        farmEquipments: f.farmEquipmentsJson || '',
        animalHusbandry: f.animalHusbandryJson || '',
        loanTaken: f.loanTaken || false,
        loanTakenFrom: f.loanTakenFrom || '',
        loanAmount: f.loanAmount?.toString() || '',
        loanPurpose: f.loanPurpose || '',
        loanInterest: f.loanInterest?.toString() || '',
        loanInterestPeriod: f.loanInterestPeriod || '',
        loanSecurity: f.loanSecurity || false,
        loanRepaymentAmt: f.loanRepaymentAmt?.toString() || '',
        loanRepaymentDate: f.loanRepaymentDate?.slice(0, 10) || '',
        insuranceInfo: f.otherInsuranceDetails || '',
        creditScore: f.creditScore?.toString() || '',
      })
    }
  }, [selectedFarmer])

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.fullName || !form.contactNumber) {
      toast.error('Full name and contact number are required')
      return
    }

    setIsLoading(true)
    try {
      const data: any = {
        ...form,
        // Map UI field names to schema field names
        farmEquipmentsJson: form.farmEquipments || null,
        animalHusbandryJson: form.animalHusbandry || null,
        otherInsuranceDetails: form.insuranceInfo || null,
        // Remove UI-only field names that don't exist in schema
        farmEquipments: undefined,
        animalHusbandry: undefined,
        insuranceInfo: undefined,
        noOfFamilyMembers: form.noOfFamilyMembers ? parseInt(form.noOfFamilyMembers) : null,
        childrenBelow18Male: form.childrenBelow18Male ? parseInt(form.childrenBelow18Male) : null,
        childrenBelow18Female: form.childrenBelow18Female ? parseInt(form.childrenBelow18Female) : null,
        schoolGoingMale: form.schoolGoingMale ? parseInt(form.schoolGoingMale) : null,
        schoolGoingFemale: form.schoolGoingFemale ? parseInt(form.schoolGoingFemale) : null,
        loanAmount: form.loanAmount ? parseFloat(form.loanAmount) : null,
        loanInterest: form.loanInterest ? parseFloat(form.loanInterest) : null,
        loanRepaymentAmt: form.loanRepaymentAmt ? parseFloat(form.loanRepaymentAmt) : null,
        creditScore: form.creditScore ? parseFloat(form.creditScore) : null,
        loanRepaymentDate: form.loanRepaymentDate || null,
        dob: form.dob || null,
        enrollmentDate: form.enrollmentDate ? new Date(form.enrollmentDate).toISOString() : new Date().toISOString(),
      }

      let result
      if (isEdit && selectedFarmer?.id) {
        result = await updateFarmer(selectedFarmer.id, data)
        setFarmers(farmers.map((f) => (f.id === result.id ? result : f)))
        toast.success('Farmer updated successfully')
      } else {
        result = await createFarmer({ ...data, moduleId: selectedModule!.id })
        setFarmers([result, ...farmers])
        toast.success('Farmer created successfully')
      }

      setSelectedFarmer(null)
      setCurrentView('farmers')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save farmer')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => {
          setSelectedFarmer(null)
          setCurrentView('farmers')
        }}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Farmer' : 'Add New Farmer'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEdit ? `Editing ${selectedFarmer?.fullName}` : 'Register a new farmer in the system'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Registration Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Registration Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Enrollment Date</Label>
              <Input type="date" value={form.enrollmentDate} onChange={(e) => handleChange('enrollmentDate', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Enrollment Place</Label>
              <Input value={form.enrollmentPlace} onChange={(e) => handleChange('enrollmentPlace', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Cooperative</Label>
              <Input value={form.cooperative} onChange={(e) => handleChange('cooperative', e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isCertified} onCheckedChange={(v) => handleChange('isCertified', v)} />
              <Label className="text-xs">Is Certified</Label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Certification Type</Label>
              <Select value={form.certificationType} onValueChange={(v) => handleChange('certificationType', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Organic">Organic</SelectItem>
                  <SelectItem value="Fairtrade">Fairtrade</SelectItem>
                  <SelectItem value="Rainforest Alliance">Rainforest Alliance</SelectItem>
                  <SelectItem value="UTZ">UTZ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Year of ICS</Label>
              <Input value={form.yearOfICS} onChange={(e) => handleChange('yearOfICS', e.target.value)} placeholder="2024" />
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name *</Label>
              <Input value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name</Label>
              <Input value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contact Number *</Label>
              <Input value={form.contactNumber} onChange={(e) => handleChange('contactNumber', e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">National ID Type</Label>
              <Select value={form.nationalIdType} onValueChange={(v) => handleChange('nationalIdType', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="National ID">National ID</SelectItem>
                  <SelectItem value="Passport">Passport</SelectItem>
                  <SelectItem value="Driver License">Driver License</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">National ID No</Label>
              <Input value={form.nationalIdNo} onChange={(e) => handleChange('nationalIdNo', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Gender</Label>
              <Select value={form.gender} onValueChange={(v) => handleChange('gender', v)}>
                <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date of Birth</Label>
              <Input type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Education</Label>
              <Select value={form.education} onValueChange={(v) => handleChange('education', v)}>
                <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Secondary">Secondary</SelectItem>
                  <SelectItem value="University">University</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Marital Status</Label>
              <Select value={form.maritalStatus} onValueChange={(v) => handleChange('maritalStatus', v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Guardian Name</Label>
              <Input value={form.guardianName} onChange={(e) => handleChange('guardianName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Contact & Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Country</Label>
              <Input value={form.country} onChange={(e) => handleChange('country', e.target.value)} placeholder="Rwanda" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Province</Label>
              <Select value={form.province} onValueChange={(v) => handleChange('province', v)}>
                <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Northern Province">Northern Province</SelectItem>
                  <SelectItem value="Southern Province">Southern Province</SelectItem>
                  <SelectItem value="Eastern Province">Eastern Province</SelectItem>
                  <SelectItem value="Western Province">Western Province</SelectItem>
                  <SelectItem value="Kigali City">Kigali City</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">District</Label>
              <Input value={form.district} onChange={(e) => handleChange('district', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Commune / Sector</Label>
              <Input value={form.commune} onChange={(e) => handleChange('commune', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Village / Cell</Label>
              <Input value={form.village} onChange={(e) => handleChange('village', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Zip Code</Label>
              <Input value={form.zipCode} onChange={(e) => handleChange('zipCode', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Family Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Family Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Spouse Name</Label>
              <Input value={form.spouseName} onChange={(e) => handleChange('spouseName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">No. of Family Members</Label>
              <Input type="number" value={form.noOfFamilyMembers} onChange={(e) => handleChange('noOfFamilyMembers', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Children Below 18 (Male)</Label>
              <Input type="number" value={form.childrenBelow18Male} onChange={(e) => handleChange('childrenBelow18Male', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Children Below 18 (Female)</Label>
              <Input type="number" value={form.childrenBelow18Female} onChange={(e) => handleChange('childrenBelow18Female', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">School Going (Male)</Label>
              <Input type="number" value={form.schoolGoingMale} onChange={(e) => handleChange('schoolGoingMale', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">School Going (Female)</Label>
              <Input type="number" value={form.schoolGoingFemale} onChange={(e) => handleChange('schoolGoingFemale', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Asset Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Asset Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Housing Ownership</Label>
              <Select value={form.housingOwnership} onValueChange={(v) => handleChange('housingOwnership', v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owned">Owned</SelectItem>
                  <SelectItem value="Rented">Rented</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">House Type</Label>
              <Input value={form.houseType} onChange={(e) => handleChange('houseType', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Consumer Electronics</Label>
              <Textarea value={form.consumerElectronics} onChange={(e) => handleChange('consumerElectronics', e.target.value)} rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Vehicles</Label>
              <Textarea value={form.vehicles} onChange={(e) => handleChange('vehicles', e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Farm Equipment & Animals */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Farm Equipment & Animal Husbandry</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Farm Equipment (JSON or list)</Label>
              <Textarea value={form.farmEquipments} onChange={(e) => handleChange('farmEquipments', e.target.value)} rows={3} placeholder='[{"name": "Tractor", "qty": 1}]' />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Animal Husbandry (JSON or list)</Label>
              <Textarea value={form.animalHusbandry} onChange={(e) => handleChange('animalHusbandry', e.target.value)} rows={3} placeholder='[{"type": "Cow", "count": 2}]' />
            </div>
          </CardContent>
        </Card>

        {/* Finance Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Loan & Finance</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <Switch checked={form.loanTaken} onCheckedChange={(v) => handleChange('loanTaken', v)} />
              <Label className="text-xs">Loan Taken</Label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Loan Taken From</Label>
              <Input value={form.loanTakenFrom} onChange={(e) => handleChange('loanTakenFrom', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Loan Amount</Label>
              <Input type="number" value={form.loanAmount} onChange={(e) => handleChange('loanAmount', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Loan Purpose</Label>
              <Input value={form.loanPurpose} onChange={(e) => handleChange('loanPurpose', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Interest Rate (%)</Label>
              <Input type="number" step="0.1" value={form.loanInterest} onChange={(e) => handleChange('loanInterest', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Interest Period</Label>
              <Input value={form.loanInterestPeriod} onChange={(e) => handleChange('loanInterestPeriod', e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.loanSecurity} onCheckedChange={(v) => handleChange('loanSecurity', v)} />
              <Label className="text-xs">Has Security</Label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Repayment Amount</Label>
              <Input type="number" value={form.loanRepaymentAmt} onChange={(e) => handleChange('loanRepaymentAmt', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Repayment Date</Label>
              <Input type="date" value={form.loanRepaymentDate} onChange={(e) => handleChange('loanRepaymentDate', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Insurance */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-emerald-800">Insurance & Credit Score</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Insurance Information</Label>
              <Textarea value={form.insuranceInfo} onChange={(e) => handleChange('insuranceInfo', e.target.value)} rows={3} placeholder="Life, Health, Crop, Social insurance details" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Credit Score (0-100)</Label>
              <Input type="number" min="0" max="100" value={form.creditScore} onChange={(e) => handleChange('creditScore', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => {
            setSelectedFarmer(null)
            setCurrentView('farmers')
          }}>
            Cancel
          </Button>
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isEdit ? 'Update Farmer' : 'Save Farmer'}
          </Button>
        </div>
      </form>
    </div>
  )
}
