import { useEffect, useRef } from 'react'

type Props = {
  // test-only hooks; production can ignore these
  getMedia?: () => Promise<MediaStream>
  disableLoop?: boolean
}

export function PhotoCapture({ getMedia, disableLoop }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    let stream: MediaStream | null = null
    let rafId: number | null = null
    let mounted = true

    const start = async () => {
      const s = await (getMedia
        ? getMedia()
        : navigator.mediaDevices.getUserMedia({ video: true }))

      // Unmounted during await? Stop tracks immediately.
      if (!mounted) {
        try { s.getTracks().forEach(t => t.stop()) } catch {}
        return
      }

      stream = s

      const video = videoRef.current
      if (video) {
        try { video.srcObject = stream } catch {}
        // don't await; allow teardown to proceed even if play() stalls
        try { void (video as any).play?.() } catch {}
      }

      if (!disableLoop) {
        const tick = () => {
          if (!mounted) return
          // ... any per-frame work here ...
          rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)
      }
    }

    void start()

    return () => {
      mounted = false
      if (rafId != null) {
        try { cancelAnimationFrame(rafId) } catch {}
        rafId = null
      }

      const video = videoRef.current
      if (video) {
        try { (video as any).pause?.() } catch {}
        try { (video as any).srcObject = null } catch {}
      }

      const s = stream ?? (videoRef.current?.srcObject as MediaStream | null)
      if (s) {
        try { s.getTracks().forEach(t => { try { t.stop() } catch {} }) } catch {}
      }
      stream = null
    }
  }, [getMedia, disableLoop])

  return <video ref={videoRef} playsInline muted data-testid="photo-video" />
}

