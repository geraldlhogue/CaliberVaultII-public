import { vi, beforeAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

const activeStreams: MediaStream[] = []

beforeAll(() => {
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: {
      getUserMedia: vi.fn(async () => {
        const stream = new MediaStream()
        const fakeTrack: any = { kind: 'video', stop: vi.fn() }
        // @ts-ignore
        stream.addTrack?.(fakeTrack)
        activeStreams.push(stream)
        return stream
      })
    }
  })

  vi.spyOn(HTMLVideoElement.prototype, 'play').mockResolvedValue()

  // Resolve RAF on microtask — prevents pending timers hanging the worker
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) => {
    Promise.resolve().then(() => cb(performance.now()))
    return 0 as unknown as number
  }
})

afterEach(() => {
  activeStreams.forEach(s => s.getTracks().forEach(t => t.stop?.()))
  activeStreams.length = 0
  cleanup()
})

