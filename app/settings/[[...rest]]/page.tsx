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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserProfile } from "@clerk/nextjs"
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
  Calendar,
  Settings as SettingsIcon,
  UserCog
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
  const [bio, setBio] = useState("")

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
      setBio(currentProfile.bio || "")
      
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
    bio !== (currentProfile.bio || "") ||
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
        bio: bio || undefined,
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
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t("settings_page_title")}</h1>
              <p className="text-muted-foreground">{t("settings_page_subtitle")}</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-6">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Account
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[600px] flex items-start justify-center">
                  <UserProfile
                    appearance={{
                      baseTheme: undefined,
                      variables: {
                        colorPrimary: 'hsl(var(--primary))',
                        colorBackground: 'hsl(var(--card))',
                        colorInputBackground: 'hsl(var(--background))',
                        colorInputText: 'hsl(var(--foreground))',
                        colorText: 'hsl(var(--foreground))',
                        colorTextSecondary: 'hsl(var(--muted-foreground))',
                        borderRadius: '0.75rem',
                      },
                      elements: {
                        card: 'shadow-xl border border-primary/20 bg-card/95 backdrop-blur-xl w-full',
                        headerTitle: 'text-foreground font-semibold text-center',
                        headerSubtitle: 'text-muted-foreground text-center',
                        formButtonPrimary: 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 w-full justify-center',
                        formButtonReset: 'bg-muted hover:bg-muted/80 text-muted-foreground w-full justify-center',
                        footerActionLink: 'text-primary hover:text-primary/80 text-center block',
                        profileSectionTitle: 'text-foreground font-medium text-center',
                        profileSectionTitleText: 'text-foreground text-center',
                        profileSectionContent: 'space-y-4 w-full',
                        formFieldInput: 'border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary w-full',
                        formFieldLabel: 'text-foreground font-medium text-left w-full',
                        formFieldHintText: 'text-muted-foreground text-sm text-left',
                        alert: 'border-border bg-card text-foreground w-full',
                        alertText: 'text-foreground text-center',
                        badge: 'bg-primary/10 text-primary border-primary/20',
                        userPreview: 'w-full flex items-center justify-center',
                        userPreviewAvatarContainer: 'flex justify-center',
                        userPreviewTextContainer: 'hidden',
                        userPreviewSecondaryIdentifier: 'hidden',
                        navbar: 'border-border bg-card/50 backdrop-blur-sm w-full',
                        navbarButton: 'text-foreground hover:text-primary hover:bg-primary/10 flex-1 justify-center',
                        navbarButtonIcon: 'flex-shrink-0',
                        organizationSwitcherTrigger: 'w-full justify-center',
                        organizationSwitcherTriggerIcon: 'flex-shrink-0',
                        organizationProfilePage: 'w-full max-w-none',
                        userButtonPopoverCard: 'w-full',
                        userButtonPopoverActions: 'w-full space-y-2',
                        userButtonPopoverActionButton: 'w-full justify-start',
                        userButtonPopoverActionButtonText: 'text-left',
                        userButtonPopoverActionButtonIcon: 'flex-shrink-0',
                        userButtonPopoverFooter: 'w-full',
                        impersonationFab: 'fixed bottom-4 right-4',
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Settings
                  </CardTitle>
                  <CardDescription>
                    Control your privacy and data sharing preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Peer Matching</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow anonymous peer-to-peer connections for support
                        </p>
                      </div>
                      <Switch
                        checked={allowPeerMatching}
                        onCheckedChange={setAllowPeerMatching}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Pattern Analysis</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable AI analysis of your conversation patterns
                        </p>
                      </div>
                      <Switch
                        checked={allowDreamAnalysis}
                        onCheckedChange={setAllowDreamAnalysis}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base font-medium">Emotional Pattern Sharing</Label>
                        <p className="text-sm text-muted-foreground">
                          Share anonymized emotional patterns for research
                        </p>
                      </div>
                      <Switch
                        checked={shareEmotionalPatterns}
                        onCheckedChange={setShareEmotionalPatterns}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-medium">Data Retention</Label>
                      <p className="text-sm text-muted-foreground">
                        How long to keep your conversation data
                      </p>
                      <Select value={dataRetentionDays.toString()} onValueChange={(value) => setDataRetentionDays(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="90">90 days</SelectItem>
                          <SelectItem value="180">6 months</SelectItem>
                          <SelectItem value="365">1 year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSaving || !hasChanges}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResetToDefaults}
                      disabled={isSaving}
                    >
                      Reset to Defaults
                    </Button>
                  </div>

                  {saveStatus === "success" && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Settings saved successfully!</span>
                    </div>
                  )}

                  {saveStatus === "error" && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{errorMessage || "Failed to save settings"}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <CardDescription>
                    Update your profile details for better peer matching
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Your age"
                        min="18"
                        max="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell others a bit about yourself..."
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      Keep it anonymous - avoid sharing personal details like full name, address, or contact info.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSaving || !hasChanges}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>

                  {saveStatus === "success" && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Profile updated successfully!</span>
                    </div>
                  )}

                  {saveStatus === "error" && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{errorMessage || "Failed to update profile"}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
