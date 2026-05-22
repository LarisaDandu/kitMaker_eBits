import { useState } from 'react'
import FormField from '../ui/FormField'
import FormInput from '../ui/FormInput'
import Button from '../ui/Button'
import { cn } from '../../lib/cn'
import { generateLoginCode, universityToFormValues } from '../../lib/universityUtils'

export default function CustomerForm({
  initialUniversity,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(() => universityToFormValues(initialUniversity))

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleGenerateLoginCode() {
    updateField('loginCode', generateLoginCode())
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FormField label="School name" htmlFor="school-name">
        <FormInput
          id="school-name"
          name="name"
          placeholder="Type name here..."
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
        />
      </FormField>

      <FormField label="Professor name" htmlFor="professor-name">
        <FormInput
          id="professor-name"
          name="professorName"
          placeholder="Type name here..."
          value={form.professorName}
          onChange={(e) => updateField('professorName', e.target.value)}
          required
        />
      </FormField>

      <FormField label="Email address" htmlFor="email">
        <FormInput
          id="email"
          name="email"
          type="email"
          placeholder="Type valid Email here..."
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          required
        />
      </FormField>

      <FormField label="Phone number" htmlFor="phone">
        <FormInput
          id="phone"
          name="phone"
          type="tel"
          placeholder="Type phone number here..."
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
      </FormField>

      <fieldset className="m-0 flex flex-col gap-2 border-none p-0">
        <legend className="mb-0 font-body text-sm font-medium text-text">Address</legend>
        <FormInput
          id="address-line-1"
          name="addressLine1"
          placeholder="Address line 1"
          value={form.addressLine1}
          onChange={(e) => updateField('addressLine1', e.target.value)}
          aria-label="Address line 1"
        />
        <FormInput
          id="address-line-2"
          name="addressLine2"
          placeholder="Address line 2"
          value={form.addressLine2}
          onChange={(e) => updateField('addressLine2', e.target.value)}
          aria-label="Address line 2"
        />
      </fieldset>

      <FormField label="EAN number" htmlFor="ean">
        <FormInput
          id="ean"
          name="ean"
          placeholder="Type number here..."
          value={form.ean}
          onChange={(e) => updateField('ean', e.target.value)}
        />
      </FormField>

      <FormField label="Generate login code" htmlFor="login-code">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FormInput
            id="login-code"
            name="loginCode"
            placeholder="Generate login code"
            value={form.loginCode}
            onChange={(e) => updateField('loginCode', e.target.value)}
            className="sm:flex-1"
          />
          <Button
            type="button"
            variant="primary"
            onClick={handleGenerateLoginCode}
            className="shrink-0 justify-center"
          >
            Generate login code
          </Button>
        </div>
      </FormField>

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <Button type="submit">Save</Button>
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'cursor-pointer border-none bg-transparent font-body text-sm font-medium text-text underline-offset-2 hover:underline',
          )}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
