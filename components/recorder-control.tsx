"use client"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export default function RecorderControl() {
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const [chunks, setChunks] = useState<BlobPart[]>([])
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream)
    mediaRecorder.current = mr
    const _chunks: BlobPart[] = []
    mr.ondataavailable = (e) => _chunks.push(e.data)
    mr.onstop = () => {
      const blob = new Blob(_chunks, { type: "audio/webm" })
      setAudioUrl(URL.createObjectURL(blob))
      setChunks([])
    }
    mr.start()
    setRecording(true)
  }
  function stop() {
    mediaRecorder.current?.stop()
    setRecording(false)
  }

  return (
    <div className="grid gap-2">
      <div className="text-xs text-muted-foreground">On-device • Nothing is uploaded</div>
      <div className="flex items-center gap-2">
        {!recording ? (
          <Button onClick={start}>Record</Button>
        ) : (
          <Button variant="secondary" onClick={stop}>
            Stop
          </Button>
        )}
      </div>
      {audioUrl && <audio controls src={audioUrl} className="mt-2" />}
    </div>
  )
}
