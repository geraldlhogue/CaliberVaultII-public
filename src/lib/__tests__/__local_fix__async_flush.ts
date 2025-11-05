import { afterEach, afterAll } from 'vitest'

const tick = () => new Promise<void>(r => setTimeout(r, 0))

afterEach(async () => {
  await tick()
})

afterAll(async () => {
  await tick()
})

