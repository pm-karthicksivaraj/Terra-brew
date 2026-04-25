/**
 * Generic payload sanitizer for Prisma API routes.
 *
 * Problem: HTML form inputs always produce strings. When a user leaves a number
 * field empty, the form sends "" (empty string) instead of null. Prisma rejects
 * empty strings for Int/Float/DateTime fields.
 *
 * Solution: This module provides utilities to clean form data before passing
 * it to Prisma create/update calls.
 */

/**
 * Removes keys with empty string values from the payload.
 * This is the simplest sanitizer — just drop empty values so Prisma uses defaults.
 *
 * Usage: db.model.create({ data: stripEmpty(data) })
 */
export function stripEmpty(data: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === '') continue
    clean[key] = value
  }
  return clean
}

/**
 * Converts specified fields from strings to numbers.
 * Empty strings become null.
 *
 * Usage: db.model.create({ data: stripEmpty(convertNumbers(data, ['age', 'weight'])) })
 */
export function convertNumbers(data: Record<string, any>, fields: string[]): Record<string, any> {
  const result = { ...data }
  for (const field of fields) {
    if (result[field] === '' || result[field] === undefined || result[field] === null) {
      result[field] = null
    } else if (typeof result[field] === 'string') {
      const n = Number(result[field])
      result[field] = isNaN(n) ? null : n
    }
  }
  return result
}

/**
 * Converts specified fields from strings to Date objects.
 * Empty/missing values are deleted from the payload.
 *
 * Usage: db.model.create({ data: stripEmpty(convertDates(data, ['sowingDate', 'harvestDate'])) })
 */
export function convertDates(data: Record<string, any>, fields: string[]): Record<string, any> {
  const result = { ...data }
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string') {
      result[field] = new Date(result[field])
    } else if (!result[field] || result[field] === '') {
      delete result[field]
    }
  }
  return result
}

/**
 * All-in-one sanitizer: strips empty strings, converts numbers and dates.
 *
 * @param data - Raw form data
 * @param numericFields - Field names that should be numbers
 * @param dateFields - Field names that should be Date objects
 */
export function cleanPayload(
  data: Record<string, any>,
  numericFields: string[] = [],
  dateFields: string[] = [],
): Record<string, any> {
  let result = stripEmpty(data)
  result = convertNumbers(result, numericFields)
  result = convertDates(result, dateFields)
  return result
}
