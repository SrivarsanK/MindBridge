"use client"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/components/locale-provider"
import { BookingDialog } from "@/components/booking/booking-dialog"
import {
  UserCircle,
  Calendar,
  Clock,
  Video,
  Phone,
  MessageSquare,
  Shield,
  Award,
  Star,
  Search,
  Filter,
  MapPin,
  Languages,
  GraduationCap,
  Heart,
  Brain,
  Users,
  CheckCircle2,
} from "lucide-react"

interface Professional {
  id: string
  name: string
  title: string
  specializations: string[]
  languages: string[]
  experience: string
  rating: number
  reviews: number
  availability: string
  consultationModes: ("video" | "phone" | "chat")[]
  verified: boolean
  image?: string
}

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: "1",
    name: "Dr. Priya Sharma",
    title: "Clinical Psychologist",
    specializations: ["Anxiety", "Depression", "Stress Management", "Trauma"],
    languages: ["English", "Hindi", "Marathi"],
    experience: "12 years",
    rating: 4.9,
    reviews: 156,
    availability: "Available Today",
    consultationModes: ["video", "phone", "chat"],
    verified: true,
  },
  {
    id: "2",
    name: "Dr. Rajesh Kumar",
    title: "Psychiatrist",
    specializations: ["Bipolar Disorder", "OCD", "ADHD", "Medication Management"],
    languages: ["English", "Hindi", "Bengali"],
    experience: "15 years",
    rating: 4.8,
    reviews: 203,
    availability: "Available Tomorrow",
    consultationModes: ["video", "phone"],
    verified: true,
  },
  {
    id: "3",
    name: "Anjali Desai",
    title: "Licensed Counselor",
    specializations: ["Relationship Issues", "Family Therapy", "Self-Esteem", "Career Counseling"],
    languages: ["English", "Gujarati", "Hindi"],
    experience: "8 years",
    rating: 4.7,
    reviews: 94,
    availability: "Available This Week",
    consultationModes: ["video", "chat"],
    verified: true,
  },
  {
    id: "4",
    name: "Dr. Arjun Patel",
    title: "Clinical Psychologist",
    specializations: ["Academic Stress", "Teen Counseling", "Social Anxiety", "Mindfulness"],
    languages: ["English", "Tamil", "Telugu"],
    experience: "10 years",
    rating: 4.9,
    reviews: 178,
    availability: "Available Today",
    consultationModes: ["video", "phone", "chat"],
    verified: true,
  },
]

export default function ProfessionalSupportPage() {
  const { t } = useLocale()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null)
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)

  const handleBookSession = (professional: Professional) => {
    setSelectedProfessional(professional)
    setBookingDialogOpen(true)
  }

  const specializations = [
    "Anxiety",
    "Depression",
    "Stress Management",
    "Trauma",
    "Relationship Issues",
    "Academic Stress",
  ]

  const filteredProfessionals = MOCK_PROFESSIONALS.filter((prof) => {
    const matchesSearch =
      searchQuery === "" ||
      prof.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prof.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSpecialization =
      !selectedSpecialization ||
      prof.specializations.some((s) => s === selectedSpecialization)

    const matchesMode =
      !selectedMode ||
      prof.consultationModes.includes(selectedMode as "video" | "phone" | "chat")

    return matchesSearch && matchesSpecialization && matchesMode
  })

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <UserCircle className="h-6 w-6 text-primary" />
                {t("professional_support") || "Professional Support"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("professional_support_desc") || "Connect with licensed therapists and counselors"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Info Banner */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">
                  {t("professional_verified") || "All professionals are verified and licensed"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("professional_privacy") ||
                    "Your privacy is protected. All sessions are confidential and secure."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search_professionals") || "Search by name or specialization..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t("filter_by") || "Filter by"}:</span>
            </div>

            {/* Specialization Filter */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedSpecialization === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedSpecialization(null)}
              >
                {t("all_specializations") || "All"}
              </Badge>
              {specializations.map((spec) => (
                <Badge
                  key={spec}
                  variant={selectedSpecialization === spec ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedSpecialization(spec)}
                >
                  {spec}
                </Badge>
              ))}
            </div>

            {/* Mode Filter */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedMode === null ? "default" : "outline"}
                className="cursor-pointer gap-1"
                onClick={() => setSelectedMode(null)}
              >
                {t("all_modes") || "All Modes"}
              </Badge>
              <Badge
                variant={selectedMode === "video" ? "default" : "outline"}
                className="cursor-pointer gap-1"
                onClick={() => setSelectedMode("video")}
              >
                <Video className="h-3 w-3" />
                {t("video_call") || "Video"}
              </Badge>
              <Badge
                variant={selectedMode === "phone" ? "default" : "outline"}
                className="cursor-pointer gap-1"
                onClick={() => setSelectedMode("phone")}
              >
                <Phone className="h-3 w-3" />
                {t("phone_call") || "Phone"}
              </Badge>
              <Badge
                variant={selectedMode === "chat" ? "default" : "outline"}
                className="cursor-pointer gap-1"
                onClick={() => setSelectedMode("chat")}
              >
                <MessageSquare className="h-3 w-3" />
                {t("chat") || "Chat"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Professionals List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {filteredProfessionals.map((prof) => (
            <Card key={prof.id} className="hover:border-primary/50 transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <UserCircle className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{prof.name}</CardTitle>
                        {prof.verified && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <CardDescription className="text-xs">{prof.title}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                {/* Rating and Experience */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{prof.rating}</span>
                    <span className="text-muted-foreground">({prof.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Award className="h-3 w-3" />
                    <span>{prof.experience}</span>
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <p className="text-xs font-medium mb-1.5 flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    {t("specializations") || "Specializations"}:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {prof.specializations.slice(0, 3).map((spec) => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {prof.specializations.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{prof.specializations.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Languages className="h-3 w-3" />
                  <span>{prof.languages.join(", ")}</span>
                </div>

                {/* Availability */}
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="h-3 w-3 text-green-500" />
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {prof.availability}
                  </span>
                </div>

                {/* Consultation Modes */}
                <div className="flex items-center gap-2">
                  {prof.consultationModes.includes("video") && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Video className="h-3 w-3" />
                    </div>
                  )}
                  {prof.consultationModes.includes("phone") && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                    </div>
                  )}
                  {prof.consultationModes.includes("chat") && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1 h-9 text-sm" 
                    size="sm"
                    onClick={() => handleBookSession(prof)}
                  >
                    <Calendar className="h-3 w-3 mr-1.5" />
                    {t("book_session") || "Book Session"}
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 text-sm">
                    {t("view_profile") || "Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredProfessionals.length === 0 && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("no_professionals_found") || "No professionals found matching your criteria"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Why Choose Professional Support */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              {t("why_professional_support") || "Why Choose Professional Support?"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t("licensed_verified") || "Licensed & Verified"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("licensed_verified_desc") ||
                      "All professionals are licensed and background-verified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t("confidential_secure") || "Confidential & Secure"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("confidential_secure_desc") ||
                      "End-to-end encrypted sessions with complete privacy"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t("flexible_scheduling") || "Flexible Scheduling"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("flexible_scheduling_desc") ||
                      "Book sessions at your convenience, 24/7 availability"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    {t("multilingual_support") || "Multilingual Support"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("multilingual_support_desc") ||
                      "Get help in your preferred language"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Dialog */}
      {selectedProfessional && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={setBookingDialogOpen}
          professional={selectedProfessional}
        />
      )}
    </div>
  )
}
