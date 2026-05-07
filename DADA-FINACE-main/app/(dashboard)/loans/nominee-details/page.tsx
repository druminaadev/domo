'use client'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
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

        <div className="flex gap-3">
          <Button type="submit">Save Nominee Details</Button>
          <Button type="button" variant="outline" onClick={() => reset()}>Reset</Button>
        </div>
      </form>
    </>
  )
}
