import { useNavigate, useParams } from 'react-router'
import AdminHeader from '../../components/admin/AdminHeader'
import CustomerForm from '../../components/universities/CustomerForm'
import { useUniversities } from '../../hooks/useUniversities'
import { cn } from '../../lib/cn'

export default function CustomerFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getUniversity, addUniversity, updateUniversity } = useUniversities()

  const isEdit = Boolean(id)
  const university = isEdit ? getUniversity(id) : null

  if (isEdit && !university) {
    navigate('/admin', { replace: true })
    return null
  }

  const title = isEdit ? 'Edit customer' : 'Create new customer'

  async function handleSubmit(formValues) {
    if (isEdit) {
      await updateUniversity(id, formValues)
    } else {
      await addUniversity(formValues)
    }
    navigate('/admin')
  }

  function handleCancel() {
    navigate('/admin')
  }

  function handleClose() {
    navigate('/admin')
  }

  return (
    <div className={cn('min-h-svh bg-background font-body text-left text-text')}>
      <div
        className={cn(
          'mx-auto box-border max-w-[720px] px-6 py-8 pb-12',
          'max-sm:px-4 max-sm:py-5 max-sm:pb-8',
        )}
      >
        <AdminHeader title={title} />

        <div
          className={cn(
            'relative mt-6 rounded-[20px] bg-background-secondary px-8 py-8',
            'max-sm:rounded-2xl max-sm:px-5 max-sm:py-6',
          )}
        >
          <button
            type="button"
            onClick={handleClose}
            className={cn(
              'absolute top-5 right-5 flex size-9 cursor-pointer items-center justify-center rounded-full border-none bg-transparent font-body text-2xl leading-none text-text transition-opacity hover:opacity-70',
            )}
            aria-label="Close form"
          >
            ×
          </button>

          <CustomerForm
            key={university?.id ?? 'new'}
            initialUniversity={university}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}
