"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useLocale } from "@/components/locale-provider"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Shield, 
  Users, 
  Brain, 
  Moon, 
  Database, 
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Clock,
  User,
  Calendar
} from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { t } = useLocale()
  const currentProfile = useQuery(api.users.getCurrentProfile)
  const updatePrivacy = useMutation(api.users.updatePrivacySettings)
  const updateProfile = useMutation(api.users.createOrUpdateProfile)
  
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Profile information state
  const [displayName, setDisplayName] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState<"male" | "female" | "non-binary" | "prefer-not-to-say" | "other" | "">("")

  // Local state for settings
  const [allowPeerMatching, setAllowPeerMatching] = useState(false)
  const [allowDreamAnalysis, setAllowDreamAnalysis] = useState(true)
  const [shareEmotionalPatterns, setShareEmotionalPatterns] = useState(false)
  const [dataRetentionDays, setDataRetentionDays] = useState(90)

  // Initialize settings from profile
  useEffect(() => {
    if (currentProfile) {
      setDisplayName(currentProfile.displayName || "")
      setAge(currentProfile.age ? String(currentProfile.age) : "")
      setGender(currentProfile.gender || "")
      
      if (currentProfile.privacySettings) {
        setAllowPeerMatching(currentProfile.privacySettings.allowPeerMatching)
        setAllowDreamAnalysis(currentProfile.privacySettings.allowDreamAnalysis)
        setShareEmotionalPatterns(currentProfile.privacySettings.shareEmotionalPatterns)
        setDataRetentionDays(currentProfile.privacySettings.dataRetentionDays)
      }
    }
  }, [currentProfile])

  // Check if settings have changed
  const hasChanges = currentProfile && (
    displayName !== (currentProfile.displayName || "") ||
    age !== (currentProfile.age ? String(currentProfile.age) : "") ||
    gender !== (currentProfile.gender || "") ||
    (currentProfile.privacySettings && (
      allowPeerMatching !== currentProfile.privacySettings.allowPeerMatching ||
      allowDreamAnalysis !== currentProfile.privacySettings.allowDreamAnalysis ||
      shareEmotionalPatterns !== currentProfile.privacySettings.shareEmotionalPatterns ||
      dataRetentionDays !== currentProfile.privacySettings.dataRetentionDays
    ))
  )

  const handleSaveSettings = async () => {
    setIsSaving(true)
    setSaveStatus("saving")
    setErrorMessage("")

    try {
      // Update profile information
      await updateProfile({
        displayName: displayName || undefined,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        timezone: currentProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        privacySettings: {
          allowPeerMatching,
          allowDreamAnalysis,
          shareEmotionalPatterns,
          dataRetentionDays,
        },
      })

      setSaveStatus("success")
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
      setSaveStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to save settings")
      setTimeout(() => {
        setSaveStatus("idle")
      }, 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefaults = () => {
    setAllowPeerMatching(false)
    setAllowDreamAnalysis(true)
    setShareEmotionalPatterns(false)
    setDataRetentionDays(90)
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">{t("loading_settings")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <div className="flex-1 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("settings_page_title")}</h1>
              <p className="text-sm text-muted-foreground">{t("settings_page_subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Save Status Banner */}
        {saveStatus === "success" && (
          <Card className="mb-6 border-green-500/20 bg-green-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  {t("save_success")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {saveStatus === "error" && (
          <Card className="mb-6 border-red-500/20 bg-red-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {t("save_error")}
                  </p>
                  {errorMessage && (
                    <p className="text-xs text-red-600 dark:text-red-500 mt-1">{errorMessage}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card className="mb-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              {t("account_information")}
            </CardTitle>
            <CardDescription>{t("account_details_status")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">{t("account_type")}</p>
                <p className="text-sm font-medium capitalize">
                  {currentProfile.isAnonymous ? t("anonymous") : t("registered")}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">{t("account_status")}</p>
                <p className="text-sm font-medium capitalize">{currentProfile.accountStatus}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">{t("role")}</p>
                <p className="text-sm font-medium capitalize">{currentProfile.role}</p>
              </div>
              <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-1">{t("timezone")}</p>
                <p className="text-sm font-medium">{currentProfile.timezone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="mb-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal details (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </Label>
              <Input 
                id="displayName"
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Your display name"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                This is how you'll appear to others in peer chats
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Age Input */}
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Age
                </Label>
                <Input 
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  placeholder="Your age"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Helps provide age-appropriate support
                </p>
              </div>

              {/* Gender Select */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gender
                </Label>
                <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  We respect all gender identities
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">🔒 Privacy:</span> Your personal information is stored securely and used only to improve your experience.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t("privacy_settings")}
            </CardTitle>
            <CardDescription>{t("privacy_settings_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Peer Matching */}
            <div className="flex items-start justify-between p-4 rounded-xl border-2 border-border bg-card/50 transition-all hover:border-primary/30">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="peer-matching" className="text-sm font-medium cursor-pointer">
                    {t("peer_matching_setting")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("peer_matching_setting_desc")}
                  </p>
                </div>
              </div>
              <Switch
                id="peer-matching"
                checked={allowPeerMatching}
                onCheckedChange={setAllowPeerMatching}
                className="data-[state=checked]:bg-primary shrink-0"
              />
            </div>

            {/* Dream Analysis */}
            <div className="flex items-start justify-between p-4 rounded-xl border-2 border-border bg-card/50 transition-all hover:border-primary/30">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 flex items-center justify-center shrink-0">
                  <Moon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="dream-analysis" className="text-sm font-medium cursor-pointer">
                    {t("dream_analysis_setting")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dream_analysis_setting_desc")}
                  </p>
                </div>
              </div>
              <Switch
                id="dream-analysis"
                checked={allowDreamAnalysis}
                onCheckedChange={setAllowDreamAnalysis}
                className="data-[state=checked]:bg-primary shrink-0"
              />
            </div>

            {/* Emotional Patterns Sharing */}
            <div className="flex items-start justify-between p-4 rounded-xl border-2 border-border bg-card/50 transition-all hover:border-primary/30">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 flex items-center justify-center shrink-0">
                  <Brain className="h-5 w-5 text-pink-500" />
                </div>
                <div className="flex-1">
                  <Label htmlFor="emotional-patterns" className="text-sm font-medium cursor-pointer">
                    {t("emotional_patterns_setting")}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("emotional_patterns_setting_desc")}
                  </p>
                </div>
              </div>
              <Switch
                id="emotional-patterns"
                checked={shareEmotionalPatterns}
                onCheckedChange={setShareEmotionalPatterns}
                className="data-[state=checked]:bg-primary shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              {t("data_management")}
            </CardTitle>
            <CardDescription>{t("data_management_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="retention-slider" className="text-sm font-medium">
                  {t("data_retention")}: {dataRetentionDays} {t("days")}
                </Label>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                id="retention-slider"
                type="range"
                min="7"
                max="365"
                step="1"
                value={dataRetentionDays}
                onChange={(e) => setDataRetentionDays(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Data retention period in days"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>7 {t("days")}</span>
                <span>90 {t("days")}</span>
                <span>180 {t("days")}</span>
                <span>1 {t("year")}</span>
              </div>
              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <strong>{t("note")}:</strong> {t("data_retention_desc")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mb-6 animate-in fade-in slide-in-from-left-4 duration-700 delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              {t("data_actions")}
            </CardTitle>
            <CardDescription>{t("data_actions_desc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4"
                onClick={() => alert("Data export feature coming soon!")}
              >
                <Download className="h-5 w-5 mr-3 shrink-0" />
                <div className="text-left flex-1">
                  <p className="text-sm font-medium">{t("export_data")}</p>
                  <p className="text-xs text-muted-foreground">{t("export_data_desc")}</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start h-auto p-4 border-red-500/20 hover:bg-red-500/5 hover:border-red-500/30"
                onClick={() => alert("Account deletion requires confirmation. Feature coming soon!")}
              >
                <Trash2 className="h-5 w-5 mr-3 text-red-500 shrink-0" />
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{t("delete_data")}</p>
                  <p className="text-xs text-muted-foreground">{t("delete_data_desc")}</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Button
            onClick={handleSaveSettings}
            disabled={!hasChanges || isSaving}
            className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                {t("save_changes")}
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            disabled={isSaving}
            className="sm:w-auto"
          >
            {t("reset_defaults")}
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            disabled={isSaving}
            className="sm:w-auto"
          >
            {t("back")}
          </Button>
        </div>

        {/* Privacy Notice */}
        <Card className="mt-6 border-primary/20 bg-primary/5 animate-in fade-in duration-700 delay-600">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">{t("privacy_info")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("privacy_info_desc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
