'use client'
import { useEffect, useRef, useState } from 'react'
import { Camera, Check, Upload, X } from 'lucide-react'
import { Button } from './Button'

interface WebcamCaptureProps { onCapture: (dataUrl: string) => void; current?: string }

const resizeImage = (source: CanvasImageSource, width: number, height: number) => {
  const canvas = document.createElement('canvas')
  const maxSize = 480
  const scale = Math.min(1, maxSize / Math.max(width, height))
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  canvas.getContext('2d')!.drawImage(source, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.72)
}

export function WebcamCapture({ onCapture, current }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [captured, setCaptured] = useState<string | null>(current ?? null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => setError('Unable to start camera preview'))
    }
  }, [stream, streaming])

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(t => t.stop())
    }
  }, [stream])

  const startCamera = async () => {
    setError('')
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      setStreaming(true)
    } catch { setError('Camera access denied or not available') }
  }

  const capture = () => {
    if (!videoRef.current) return
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) {
      setError('Camera is still loading. Please try again in a moment.')
      return
    }
    const dataUrl = resizeImage(videoRef.current, videoRef.current.videoWidth, videoRef.current.videoHeight)
    setCaptured(dataUrl); onCapture(dataUrl)
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setStreaming(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const image = new Image()
      image.onload = () => {
        const dataUrl = resizeImage(image, image.naturalWidth, image.naturalHeight)
        setCaptured(dataUrl); onCapture(dataUrl)
      }
      image.onerror = () => setError('Unable to read selected image')
      image.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const remove = () => {
    setCaptured(null); onCapture('')
    stream?.getTracks().forEach(t => t.stop())
    setStream(null)
    setStreaming(false)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <div className="flex flex-col items-center gap-3">
        <div className="w-32 h-32 rounded-xl overflow-hidden border-2 bg-gradient-to-br from-[#FFF5F2] dark:from-[var(--card)] to-white dark:to-[var(--surface)] flex items-center justify-center" style={{ borderColor: captured ? 'var(--accent)' : 'var(--border)' }}>
          {captured ? <img src={captured} className="w-full h-full object-cover" alt="Profile" />
            : streaming ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            : <Camera size={40} className="text-gray-300 dark:text-gray-600" />}
        </div>
        {error && <p className="text-xs" style={{ color: '#831C91' }}>{error}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        {!streaming && !captured && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={startCamera}><Camera size={14} /> Capture Photo</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload Photo</Button>
          </>
        )}
        {streaming && <Button type="button" variant="primary" size="sm" onClick={capture}><Check size={14} /> Capture</Button>}
        {captured && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Change Photo</Button>
            <Button type="button" variant="ghost" size="sm" onClick={remove}><X size={14} /> Remove</Button>
          </>
        )}
      </div>
    </div>
  )
}
