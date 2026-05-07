'use client'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { WebcamCapture } from '@/components/ui/WebcamCapture'
import { useUIStore } from '@/store/uiStore'

interface NomineeForm {
  name: string
  relation: string
  dob: string
  mobile: string
  identityProof: string
  identityNo: string
  address: string
  accountNo: string
  holderName: string
  bankName: string
  bankBranch: string
  ifsc: string
  guarantor1IdentityProof: string
  guarantor1IdentityNo: string
  guarantor1Name: string
  guarantor1Relation: string
  guarantor1Dob: string
  guarantor1Age?: string
  guarantor1Mobile: string
  guarantor1Address: string
  guarantor1AccountNo: string
  guarantor1HolderName: string
  guarantor1BankName: string
  guarantor1BankBranch: string
  guarantor1Ifsc: string
  guarantor2IdentityProof: string
  guarantor2IdentityNo: string
  guarantor2Name: string
  guarantor2Relation: string
  guarantor2Dob: string
  guarantor2Age?: string
  guarantor2Mobile: string
  guarantor2Address: string
  guarantor2AccountNo: string
  guarantor2HolderName: string
  guarantor2BankName: string
  guarantor2BankBranch: string
  guarantor2Ifsc: string
}

export default function NomineeDetailsPage() {
  const { showToast } = useUIStore()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NomineeForm>()

  const onSubmit = (data: NomineeForm) => {
    showToast('Nominee details saved successfully!', 'success')
    reset()
  }

  return (
    <>
      <PageHeader title="Nominee Details" />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Card title="Nominee Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Nominee Name"
              required
              placeholder="Full name"
              error={errors.name?.message}
              {...register('name', { required: 'Required' })}
            />
            <Input
              label="Relation"
              required
              placeholder="e.g. Father, Mother, Spouse"
              error={errors.relation?.message}
              {...register('relation', { required: 'Required' })}
            />
            <Input
              label="Date of Birth"
              type="date"
              required
              error={errors.dob?.message}
              {...register('dob', { required: 'Required' })}
            />
            <Input
              label="Mobile"
              required
              placeholder="10-digit mobile"
              error={errors.mobile?.message}
              {...register('mobile', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: 'Invalid mobile' } })}
            />
            <Input
              label="Identity Proof"
              required
              placeholder="e.g. Aadhar, PAN"
              error={errors.identityProof?.message}
              {...register('identityProof', { required: 'Required' })}
            />
            <Input
              label="Identity No"
              required
              placeholder="Identity number"
              error={errors.identityNo?.message}
              {...register('identityNo', { required: 'Required' })}
            />
            <div className="sm:col-span-2 lg:col-span-3">
              <Textarea
                label="Address"
                required
                placeholder="Full address"
                error={errors.address?.message}
                {...register('address', { required: 'Required' })}
              />
            </div>
          </div>
        </Card>

        <Card title="Bank Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Account No"
              required
              placeholder="Bank account number"
              error={errors.accountNo?.message}
              {...register('accountNo', { required: 'Required' })}
            />
            <Input
              label="Account Holder Name"
              required
              placeholder="As per bank records"
              error={errors.holderName?.message}
              {...register('holderName', { required: 'Required' })}
            />
            <Input
              label="Bank Name"
              required
              placeholder="e.g. SBI, HDFC"
              error={errors.bankName?.message}
              {...register('bankName', { required: 'Required' })}
            />
            <Input
              label="Branch"
              required
              placeholder="Branch name"
              error={errors.bankBranch?.message}
              {...register('bankBranch', { required: 'Required' })}
            />
            <Input
              label="IFSC Code"
              required
              placeholder="e.g. SBIN0001234"
              error={errors.ifsc?.message}
              {...register('ifsc', { required: 'Required' })}
            />
          </div>
        </Card>

        <Card title="Guarantor 1 Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Identity Proof"
              required
              options={[{ value: 'aadhar', label: 'Aadhar Card' }, { value: 'pan', label: 'PAN Card' }, { value: 'voter', label: 'Voter ID' }]}
              placeholder="Select Identity Proof"
              error={errors.guarantor1IdentityProof?.message}
              {...register('guarantor1IdentityProof', { required: 'Required' })}
            />
            <Input
              label="Identity No"
              required
              placeholder="Identity number"
              error={errors.guarantor1IdentityNo?.message}
              {...register('guarantor1IdentityNo', { required: 'Required' })}
            />
            <Input
              label="Name"
              required
              placeholder="Guarantor's Name"
              error={errors.guarantor1Name?.message}
              {...register('guarantor1Name', { required: 'Required' })}
            />
            <Select
              label="Select Relation"
              required
              options={[
                { value: 'father', label: 'Father' },
                { value: 'mother', label: 'Mother' },
                { value: 'spouse', label: 'Spouse' },
                { value: 'brother', label: 'Brother' },
                { value: 'sister', label: 'Sister' },
                { value: 'friend', label: 'Friend' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select Relation"
              error={errors.guarantor1Relation?.message}
              {...register('guarantor1Relation', { required: 'Required' })}
            />
            <Input
              label="Date of Birth"
              type="date"
              required
              error={errors.guarantor1Dob?.message}
              {...register('guarantor1Dob', { required: 'Required' })}
            />
            <Input
              label="Age"
              type="number"
              required
              placeholder="Age"
              error={errors.guarantor1Age?.message}
              {...register('guarantor1Age', { required: 'Required', min: { value: 18, message: 'Must be 18+' } })}
            />
            <Input
              label="Mobile Number"
              required
              placeholder="10-digit mobile"
              error={errors.guarantor1Mobile?.message}
              {...register('guarantor1Mobile', { required: 'Required', pattern: { value: /^[0-9]{10}$/, message: 'Invalid mobile' } })}
            />
            <div className="sm:col-span-2 lg:col-span-3">
              <Textarea
                label="Address"
                required
                placeholder="Full address"
                error={errors.guarantor1Address?.message}
                {...register('guarantor1Address', { required: 'Required' })}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Update Profile Photo</label>
              <WebcamCapture onCapture={() => {}} />
            </div>
          </div>
        </Card>
        <Card title="Bank Details (Guarantor 1)">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Bank Account Number"
              required
              placeholder="Account number"
              {...register('guarantor1AccountNo', { required: 'Required' })}
            />
            <Input
              label="Account Holder Name"
              required
              placeholder="As per bank records"
              {...register('guarantor1HolderName', { required: 'Required' })}
            />
            <Input
              label="Bank Name"
              required
              placeholder="e.g. SBI, HDFC"
              {...register('guarantor1BankName', { required: 'Required' })}
            />
            <Input
              label="Bank Branch"
              required
              placeholder="Branch name"
              {...register('guarantor1BankBranch', { required: 'Required' })}
            />
            <Input
              label="IFSC Code"
              required
              placeholder="e.g. SBIN0001234"
              {...register('guarantor1Ifsc', { required: 'Required' })}
            />
            <div className="sm:col-span-2 lg:col-span-3 flex flex-col gap-2">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Select Document</label>
              <input type="file" className="block w-full text-sm text-slate-500" />
            </div>
          </div>
        </Card>

        

        <div className="flex gap-3">
          <Button type="submit">Save Nominee Details</Button>
          <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
        </div>
      </form>
    </>
  )
}
