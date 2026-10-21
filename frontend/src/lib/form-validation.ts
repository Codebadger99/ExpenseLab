export function getFormValidationError(form: HTMLFormElement): string | null {
  const invalidField = Array.from(form.elements).find(
    (element): element is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
      (element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement) &&
      !element.validity.valid,
  )
  if (!invalidField) return null
  invalidField.focus()
  return invalidField.validationMessage || "Please check this field and try again."
}
