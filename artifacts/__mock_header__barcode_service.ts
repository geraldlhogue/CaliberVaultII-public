import { vi } from 'vitest'

// Keep the real implementation, but ensure BOTH the named class and the instance
// are exposed correctly to Vitest after any other mocks are applied.
vi.mock('@/services/barcode/BarcodeService', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    BarcodeService: actual.BarcodeService,   // named class (so `new BarcodeService()` works)
    barcodeService: actual.barcodeService    // instance (if tests import it)
  }
})

