/**
 * Example: Sleep Tracker with Local Storage
 * All sleep data stored locally on device
 */

'use client'

import { useState } from 'react'
import { useSleepTracking } from '@/lib/use-local-storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Moon, TrendingUp, Calendar } from 'lucide-react'

// Simple ID generator
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export default function LocalSleepTracker() {
  const { sleepEntries, saveSleepEntry, getStats, loading, error } = useSleepTracking(30)
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [bedtime, setBedtime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState<any>(null)

  const calculateDuration = (bedtime: string, wakeTime: string): number => {
    const [bedHour, bedMin] = bedtime.split(':').map(Number)
    const [wakeHour, wakeMin] = wakeTime.split(':').map(Number)
    
    let bedMinutes = bedHour * 60 + bedMin
    let wakeMinutes = wakeHour * 60 + wakeMin
    
    // If wake time is earlier than bed time, add 24 hours
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60
    }
    
    const durationMinutes = wakeMinutes - bedMinutes
    return durationMinutes / 60 // Convert to hours
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const duration = calculateDuration(bedtime, wakeTime)
      
      await saveSleepEntry({
        id: generateId(),
        date,
        bedtime,
        wakeTime,
        duration,
        quality,
        notes,
        createdAt: Date.now(),
      })

      // Reset form
      setNotes('')
      alert('Sleep entry saved locally!')
      
      // Reload stats
      loadStats()
    } catch (err) {
      console.error('Failed to save sleep entry:', err)
      alert('Failed to save sleep entry')
    } finally {
      setIsSaving(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await getStats(30)
      setStats(data)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }

  // Load stats on mount
  useState(() => {
    if (!loading) {
      loadStats()
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading sleep data: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Moon className="h-6 w-6" />
          Sleep Tracker (Local Storage)
        </h1>
        <div className="text-sm text-muted-foreground">
          💾 All data stored locally
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageDuration.toFixed(1)}h
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageQuality.toFixed(1)}/5
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalEntries}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Sleep Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bedtime">Bedtime</Label>
              <Input
                id="bedtime"
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wakeTime">Wake Time</Label>
              <Input
                id="wakeTime"
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quality">Sleep Quality: {quality}/5</Label>
            <Input
              id="quality"
              type="range"
              min="1"
              max="5"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any notes about your sleep..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Save Sleep Entry
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Sleep Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sleepEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No sleep entries yet. Add your first entry above!
            </p>
          ) : (
            <div className="space-y-3">
              {sleepEntries.slice(0, 7).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <div className="font-medium">{entry.date}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.bedtime} - {entry.wakeTime} ({entry.duration.toFixed(1)}h)
                    </div>
                    {entry.notes && (
                      <div className="text-xs text-muted-foreground italic mt-1">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-primary">
                      {entry.quality}
                    </div>
                    <div className="text-xs text-muted-foreground">/5</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
