'use client'
import { useRef, useState } from 'react'
import { Camera, RotateCcw, Check, Upload, X } from 'lucide-react'
import { Button } from './Button'

interface WebcamCaptureProps { onCapture: (dataUrl: string) => void; current?: string }

export function WebcamCapture({ onCapture, current }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [streaming, setStreaming] = useState(false)
  const [captured, setCaptured] = useState<string | null>(current ?? null)
  const [error, setError] = useState('')

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) { videoRef.current.srcObject = stream; setStreaming(true) }
    } catch { setError('Camera access denied or not available') }
  }

  const capture = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = 200; canvas.height = 200
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0, 200, 200)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setCaptured(dataUrl); onCapture(dataUrl)
    const stream = videoRef.current.srcObject as MediaStream
    stream?.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setCaptured(dataUrl); onCapture(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const remove = () => {
    setCaptured(null); onCapture('')
    const stream = videoRef.current?.srcObject as MediaStream
    stream?.getTracks().forEach(t => t.stop())
    setStreaming(false)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <div className="flex flex-col items-center gap-3">
        <div className="w-32 h-32 rounded-xl overflow-hidden border-2 bg-gradient-to-br from-[#FFF5F2] dark:from-[#2C2C2C] to-white dark:to-[#1A1A1A] flex items-center justify-center" style={{ borderColor: captured ? '#FF6D3D' : '#E8E8E8' }}>
          {captured ? <img src={captured} className="w-full h-full object-cover" alt="Profile" />
            : streaming ? <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            : <Camera size={40} className="text-gray-300 dark:text-gray-600" />}
        </div>
        {error && <p className="text-xs" style={{ color: '#FF5722' }}>{error}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        {!streaming && !captured && (
          <>
            <Button variant="outline" size="sm" onClick={startCamera}><Camera size={14} /> Capture Photo</Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Upload Photo</Button>
          </>
        )}
        {streaming && <Button variant="primary" size="sm" onClick={capture}><Check size={14} /> Capture</Button>}
        {captured && (
          <>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload size={14} /> Change Photo</Button>
            <Button variant="ghost" size="sm" onClick={remove}><X size={14} /> Remove</Button>
          </>
        )}
      </div>
    </div>
  )
}
