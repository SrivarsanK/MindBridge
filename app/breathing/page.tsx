"use client"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useRouter } from "next/navigation"
import {
  Wind,
  Heart,
  Brain,
  Moon,
  Zap,
  Waves,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Timer,
  Target,
  Activity,
  Clock,
} from "lucide-react"
import styles from "./breathing.module.css"

interface BreathingExercise {
  id: string
  name: string
  description: string
  duration: number // in seconds
  icon: any
  benefits: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  pattern: {
    inhale: number
    hold1?: number
    exhale: number
    hold2?: number
  }
  color: string
  bgGradient: string
}

const breathingExercises: BreathingExercise[] = [
  {
    id: "box-breathing",
    name: "Box Breathing",
    description: "Also called 4-4-4-4 breathing. Used by Navy SEALs to stay calm under pressure.",
    duration: 240, // 4 minutes
    icon: Target,
    benefits: ["Reduces stress", "Improves focus", "Lowers blood pressure", "Enhances emotional control"],
    difficulty: "Beginner",
    pattern: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    color: "blue",
    bgGradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "4-7-8",
    name: "4-7-8 Breathing",
    description: "Dr. Weil's relaxation breath. Perfect for falling asleep or managing cravings.",
    duration: 180, // 3 minutes
    icon: Moon,
    benefits: ["Promotes sleep", "Reduces anxiety", "Manages cravings", "Calms nervous system"],
    difficulty: "Beginner",
    pattern: { inhale: 4, hold1: 7, exhale: 8 },
    color: "purple",
    bgGradient: "from-purple-500 to-pink-500",
  },
  {
    id: "wim-hof",
    name: "Wim Hof Method",
    description: "Powerful breathing technique for energy, focus, and stress reduction.",
    duration: 300, // 5 minutes
    icon: Zap,
    benefits: ["Boosts energy", "Strengthens immunity", "Reduces stress", "Increases willpower"],
    difficulty: "Advanced",
    pattern: { inhale: 2, exhale: 1 },
    color: "orange",
    bgGradient: "from-orange-500 to-red-500",
  },
  {
    id: "coherent",
    name: "Coherent Breathing",
    description: "5-5 breathing for heart-brain coherence. Balances body and mind.",
    duration: 300, // 5 minutes
    icon: Heart,
    benefits: ["Heart rate variability", "Emotional balance", "Reduces depression", "Improves resilience"],
    difficulty: "Beginner",
    pattern: { inhale: 5, exhale: 5 },
    color: "red",
    bgGradient: "from-red-500 to-rose-500",
  },
  {
    id: "alternate-nostril",
    name: "Alternate Nostril",
    description: "Nadi Shodhana from yoga. Balances left and right brain hemispheres.",
    duration: 360, // 6 minutes
    icon: Brain,
    benefits: ["Balances hemispheres", "Reduces anxiety", "Clears mind", "Improves concentration"],
    difficulty: "Intermediate",
    pattern: { inhale: 4, hold1: 4, exhale: 4 },
    color: "green",
    bgGradient: "from-green-500 to-emerald-500",
  },
  {
    id: "ocean-breath",
    name: "Ocean Breath (Ujjayi)",
    description: "Calming breath that sounds like ocean waves. Great for grounding.",
    duration: 300, // 5 minutes
    icon: Waves,
    benefits: ["Deep relaxation", "Grounding", "Releases tension", "Warms body"],
    difficulty: "Intermediate",
    pattern: { inhale: 4, exhale: 6 },
    color: "cyan",
    bgGradient: "from-cyan-500 to-teal-500",
  },
]

export default function BreathingExercisesPage() {
  const router = useRouter()
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise | null>(null)
  const [showTimeDialog, setShowTimeDialog] = useState(false)
  const [pendingExercise, setPendingExercise] = useState<BreathingExercise | null>(null)
  const [selectedDuration, setSelectedDuration] = useState(300) // Default 5 minutes
  const [customMinutes, setCustomMinutes] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<"inhale" | "hold1" | "exhale" | "hold2">("inhale")
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0)
  const [totalTimeLeft, setTotalTimeLeft] = useState(0)
  const [breathCount, setBreathCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Initialize audio context
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Play sound
  const playSound = (frequency: number, duration: number) => {
    if (!soundEnabled || !audioContextRef.current) return
    
    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    
    oscillator.frequency.value = frequency
    oscillator.type = "sine"
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration)
    
    oscillator.start()
    oscillator.stop(audioContextRef.current.currentTime + duration)
  }

  // Get next phase
  const getNextPhase = (current: typeof currentPhase, pattern: BreathingExercise["pattern"]) => {
    if (current === "inhale") return pattern.hold1 ? "hold1" : "exhale"
    if (current === "hold1") return "exhale"
    if (current === "exhale") return pattern.hold2 ? "hold2" : "inhale"
    return "inhale"
  }

  // Start exercise with time selection
  const handleExerciseSelect = (exercise: BreathingExercise) => {
    setPendingExercise(exercise)
    setSelectedDuration(exercise.duration) // Set default duration
    setCustomMinutes("")
    setShowCustomInput(false)
    setShowTimeDialog(true)
  }

  // Handle custom time input
  const handleCustomTimeClick = () => {
    setShowCustomInput(true)
    setSelectedDuration(0) // Clear preset selection
  }

  // Apply custom time
  const applyCustomTime = () => {
    const minutes = parseInt(customMinutes)
    if (minutes && minutes > 0 && minutes <= 60) {
      setSelectedDuration(minutes * 60)
    }
  }

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    const minutes = value[0]
    setCustomMinutes(minutes.toString())
    setSelectedDuration(minutes * 60)
  }

  // Start exercise with selected duration
  const startExercise = () => {
    if (!pendingExercise) return
    
    // Validate duration
    if (selectedDuration <= 0) {
      return // Don't start if no valid duration selected
    }
    
    const exerciseWithCustomDuration = { ...pendingExercise, duration: selectedDuration }
    setSelectedExercise(exerciseWithCustomDuration)
    setShowTimeDialog(false)
    setIsPlaying(true)
    setCurrentPhase("inhale")
    setPhaseTimeLeft(exerciseWithCustomDuration.pattern.inhale)
    setTotalTimeLeft(selectedDuration)
    setBreathCount(0)
    
    // Play start sound
    playSound(440, 0.2)
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!selectedExercise) return
    
    if (isPlaying) {
      setIsPlaying(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    } else {
      setIsPlaying(true)
      playSound(440, 0.2)
    }
  }

  // Reset exercise
  const resetExercise = () => {
    if (!selectedExercise) return
    
    setIsPlaying(false)
    setCurrentPhase("inhale")
    setPhaseTimeLeft(selectedExercise.pattern.inhale)
    setTotalTimeLeft(selectedExercise.duration)
    setBreathCount(0)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  // End exercise
  const endExercise = () => {
    setSelectedExercise(null)
    setIsPlaying(false)
    setCurrentPhase("inhale")
    setPhaseTimeLeft(0)
    setTotalTimeLeft(0)
    setBreathCount(0)
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }

  // Timer logic
  useEffect(() => {
    if (!isPlaying || !selectedExercise) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setPhaseTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhase = getNextPhase(currentPhase, selectedExercise.pattern)
          setCurrentPhase(nextPhase)
          
          // Play sound for phase change
          if (nextPhase === "inhale") {
            playSound(523, 0.15) // Higher pitch for inhale
            setBreathCount((c) => c + 1)
          } else if (nextPhase === "exhale") {
            playSound(392, 0.15) // Lower pitch for exhale
          }
          
          // Get duration for next phase
          const phaseDurations = {
            inhale: selectedExercise.pattern.inhale,
            hold1: selectedExercise.pattern.hold1 || 0,
            exhale: selectedExercise.pattern.exhale,
            hold2: selectedExercise.pattern.hold2 || 0,
          }
          
          return phaseDurations[nextPhase]
        }
        return prev - 1
      })
      
      setTotalTimeLeft((prev) => {
        if (prev <= 1) {
          // Exercise completed
          setIsPlaying(false)
          playSound(660, 0.5) // Completion sound
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, selectedExercise, currentPhase, soundEnabled])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Get phase instruction
  const getPhaseInstruction = () => {
    if (!selectedExercise) return ""
    
    switch (currentPhase) {
      case "inhale":
        return "Breathe In"
      case "hold1":
        return "Hold"
      case "exhale":
        return "Breathe Out"
      case "hold2":
        return "Hold"
      default:
        return ""
    }
  }

  // Get scale for bubble animation
  const getCircleScale = () => {
    if (!selectedExercise) return 1
    
    const phaseDurations = {
      inhale: selectedExercise.pattern.inhale,
      hold1: selectedExercise.pattern.hold1 || 0,
      exhale: selectedExercise.pattern.exhale,
      hold2: selectedExercise.pattern.hold2 || 0,
    }
    
    const totalPhaseDuration = phaseDurations[currentPhase]
    const progress = 1 - (phaseTimeLeft / totalPhaseDuration)
    
    if (currentPhase === "inhale") {
      // Smooth bubble expansion with ease-out
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      return 0.7 + easeProgress * 0.6 // Grow from 0.7 to 1.3
    } else if (currentPhase === "exhale") {
      // Smooth bubble deflation with ease-in
      const easeProgress = Math.pow(progress, 3)
      return 1.3 - easeProgress * 0.6 // Shrink from 1.3 to 0.7
    } else {
      // Hold at inflated or deflated state with subtle pulse
      const baseScale = currentPhase === "hold1" ? 1.3 : 0.7
      const pulse = Math.sin(Date.now() / 500) * 0.02 // Subtle breathing effect
      return baseScale + pulse
    }
  }

  if (selectedExercise) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        {/* Header */}
        <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={endExercise}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <h1 className="text-lg sm:text-xl font-semibold truncate mx-4">{selectedExercise.name}</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Main Exercise Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          {/* Stats Bar */}
          <div className="flex items-center gap-4 sm:gap-6 mb-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span className="text-sm font-medium">{formatTime(totalTimeLeft)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Activity className="h-4 w-4" />
              <span className="text-sm font-medium">{breathCount} breaths</span>
            </div>
          </div>

          {/* Breathing Bubble Container */}
          <div className="relative mb-8 sm:mb-12 w-full max-w-[350px] aspect-square flex items-center justify-center">
            {/* Outer glow rings */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/10 animate-pulse" />
            <div className="absolute -inset-2.5 rounded-full border border-primary/5" />
            
            {/* Main bubble */}
            <div
              className={`${styles.breathingBubble} absolute rounded-full bg-gradient-to-br ${selectedExercise.bgGradient} flex items-center justify-center overflow-hidden shadow-2xl`}
              style={{
                transform: `scale(${getCircleScale()})`,
              }}
            >
              {/* Bubble shine effect */}
              <div className={styles.bubbleShine} />
              
              {/* Content */}
              <div className="text-center text-white relative z-10">
                <div className="text-5xl sm:text-6xl font-bold mb-2 drop-shadow-lg">{phaseTimeLeft}</div>
                <div className="text-xl sm:text-2xl font-medium tracking-wide drop-shadow-md">{getPhaseInstruction()}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
            <Button
              size="lg"
              variant="outline"
              onClick={resetExercise}
              className="rounded-full h-14 w-14 sm:h-16 sm:w-16 p-0 flex items-center justify-center"
              aria-label="Reset exercise"
            >
              <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            
            <Button
              size="lg"
              onClick={togglePlayPause}
              className={`rounded-full h-20 w-20 sm:h-24 sm:w-24 p-0 flex items-center justify-center bg-gradient-to-br ${selectedExercise.bgGradient} hover:opacity-90 text-white shadow-2xl transition-all hover:scale-105`}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-8 w-8 sm:h-10 sm:w-10" /> : <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-0.5" />}
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={endExercise}
              className="rounded-full h-14 w-14 sm:h-16 sm:w-16 p-0 flex items-center justify-center"
              aria-label="End exercise"
            >
              <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>

          {/* Pattern Info */}
          <div className="text-center text-muted-foreground text-xs sm:text-sm px-4">
            <p>
              {selectedExercise.pattern.inhale}s inhale
              {selectedExercise.pattern.hold1 && ` • ${selectedExercise.pattern.hold1}s hold`}
              {` • ${selectedExercise.pattern.exhale}s exhale`}
              {selectedExercise.pattern.hold2 && ` • ${selectedExercise.pattern.hold2}s hold`}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg flex-shrink-0">
              <Wind className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Breathing Exercises</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Science-backed techniques for calm and clarity</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base">Reduces Stress</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Controlled breathing activates your parasympathetic nervous system, reducing cortisol and anxiety.
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="h-5 w-5 text-green-500 flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base">Improves Focus</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Oxygen-rich blood flow to your brain enhances concentration, memory, and mental clarity.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-purple-500 flex-shrink-0" />
                <h3 className="font-semibold text-sm sm:text-base">Boosts Recovery</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Deep breathing helps manage cravings, reduces withdrawal symptoms, and strengthens willpower.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {breathingExercises.map((exercise) => {
            const Icon = exercise.icon
            return (
              <Card
                key={exercise.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-primary/10 hover:border-primary/30 overflow-hidden flex flex-col"
                onClick={() => handleExerciseSelect(exercise)}
              >
                <div className={`h-2 bg-gradient-to-r ${exercise.bgGradient}`} />
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br ${exercise.bgGradient} shadow-md flex-shrink-0`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {exercise.difficulty}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-lg sm:text-xl mb-2">{exercise.name}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm leading-relaxed">
                    {exercise.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    {/* Benefits */}
                    <div className="space-y-1.5 min-h-[72px]">
                      {exercise.benefits.slice(0, 3).map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${exercise.bgGradient} flex-shrink-0`} />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Start Button */}
                  <Button
                    className={`w-full mt-4 bg-gradient-to-r ${exercise.bgGradient} hover:opacity-90 text-white text-sm`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleExerciseSelect(exercise)
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Exercise
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Tips Section */}
        <Card className="mt-6 sm:mt-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Target className="h-5 w-5 text-primary flex-shrink-0" />
              Tips for Effective Breathing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Before You Start</h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                  <li>• Find a quiet, comfortable place</li>
                  <li>• Sit or lie down with good posture</li>
                  <li>• Loosen tight clothing</li>
                  <li>• Set aside distractions</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">During Practice</h4>
                <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                  <li>• Breathe through your nose when possible</li>
                  <li>• Focus on your breath, not thoughts</li>
                  <li>• Don't force it - stay relaxed</li>
                  <li>• Practice daily for best results</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Selection Dialog */}
        <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Choose Exercise Duration
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {pendingExercise && `How long would you like to practice ${pendingExercise.name}?`}
              </DialogDescription>
            </DialogHeader>
            
            {/* Preset Durations */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-4">
              {[3, 5, 10, 15, 20, 30].map((minutes) => (
                <Button
                  key={minutes}
                  variant={selectedDuration === minutes * 60 && !showCustomInput ? "default" : "outline"}
                  className={`h-16 sm:h-20 flex flex-col items-center justify-center gap-1 sm:gap-2 ${
                    selectedDuration === minutes * 60 && !showCustomInput
                      ? `bg-gradient-to-r ${pendingExercise?.bgGradient} text-white border-0` 
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedDuration(minutes * 60)
                    setShowCustomInput(false)
                    setCustomMinutes("")
                  }}
                >
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-base sm:text-lg font-semibold">{minutes} min</span>
                </Button>
              ))}
            </div>

            {/* Custom Time Section */}
            <div className="mt-4 space-y-3">
              {!showCustomInput ? (
                <Button
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center gap-2"
                  onClick={handleCustomTimeClick}
                >
                  <Timer className="h-4 w-4" />
                  <span>Custom Duration</span>
                </Button>
              ) : (
                <div className="space-y-4 p-4 border rounded-lg bg-card">
                  <div className="space-y-2">
                    <Label htmlFor="custom-slider" className="text-sm font-medium">
                      Choose custom duration (1-60 minutes)
                    </Label>
                    
                    {/* Large Display */}
                    <div className="flex items-center justify-center py-4">
                      <div className="text-center">
                        <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          {customMinutes || "1"}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          minute{(customMinutes && parseInt(customMinutes) !== 1) ? "s" : ""}
                        </div>
                      </div>
                    </div>

                    {/* Slider */}
                    <div className="space-y-2">
                      <Slider
                        id="custom-slider"
                        min={1}
                        max={60}
                        step={1}
                        value={[parseInt(customMinutes) || 1]}
                        onValueChange={handleSliderChange}
                        className={`w-full ${pendingExercise?.bgGradient ? '[&_[role=slider]]:border-primary' : ''}`}
                      />
                      
                      {/* Min/Max Labels */}
                      <div className="flex justify-between text-xs text-muted-foreground px-1">
                        <span>1 min</span>
                        <span>60 min</span>
                      </div>
                    </div>
                  </div>

                  {/* Number Input (optional for precise entry) */}
                  <div className="flex gap-2">
                    <Input
                      id="custom-minutes"
                      type="number"
                      min="1"
                      max="60"
                      placeholder="Or type..."
                      value={customMinutes}
                      onChange={(e) => {
                        const val = e.target.value
                        setCustomMinutes(val)
                        const num = parseInt(val)
                        if (num >= 1 && num <= 60) {
                          setSelectedDuration(num * 60)
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          applyCustomTime()
                        }
                      }}
                      className="flex-1"
                    />
                  </div>

                  {/* Confirmation Message */}
                  {selectedDuration > 0 && customMinutes && (
                    <div className="text-sm font-medium text-center py-2 px-3 rounded-md bg-primary/10 text-primary">
                      ✓ {selectedDuration / 60} minute{selectedDuration !== 60 ? "s" : ""} selected
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowTimeDialog(false)
                  setPendingExercise(null)
                  setCustomMinutes("")
                  setShowCustomInput(false)
                }}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 bg-gradient-to-r ${pendingExercise?.bgGradient} text-white`}
                onClick={startExercise}
                disabled={selectedDuration <= 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
