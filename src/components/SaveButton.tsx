'use client'

import { Save, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import { useFormContext } from 'react-hook-form'

const SaveButton = () => {
  const { formState } = useFormContext()

  return (
    <Button
      type="submit"
      variant="save"
      className="w-fit cursor-pointer flex items-center gap-2"
      size="lg"
      disabled={formState.isSubmitting}
    >
      {formState.isSubmitting ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Save className="h-5 w-5" />
      )}
      Save
    </Button>
  )
}

export default SaveButton
