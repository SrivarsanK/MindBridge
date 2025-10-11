"use client"
import { createContext, useContext, useMemo, useState, ReactNode } from "react"

type Locale = "en-IN" | "hi" | "bn" | "ta" | "te" | "mr"
type Dict = Record<string, string>

const dictionaries: Record<Locale, Dict> = {
  "en-IN": {
    hero_title: "Clinically-grounded support. Private by design.",
    hero_sub: "MindBridge supports students with on-device AI. No data leaves your device.",
    cta_start: "Start privately",
    cta_privacy: "How your data stays on‑device",
    trust_ondevice: "On-device processing",
    trust_federated: "Federated learning (opt-in)",
    trust_encryption: "End-to-end encryption",
    trust_247: "24/7 crisis escalation",
    login_title: "Sign in or continue as guest",
    login_guest: "Continue as Guest (anonymous)",
    onboarding: "Onboarding",
    dashboard: "Dashboard",
  },
  hi: {
    hero_title: "नैदानिक आधारित सहायता। निजी डिज़ाइन।",
    hero_sub: "माइंडब्रिज ऑन-डिवाइस AI के साथ छात्रों का समर्थन करता है। कोई डेटा आपके डिवाइस को नहीं छोड़ता।",
    cta_start: "निजी तौर पर शुरू करें",
    cta_privacy: "आपका डेटा डिवाइस पर कैसे रहता है",
    trust_ondevice: "ऑन-डिवाइस प्रोसेसिंग",
    trust_federated: "फेडरेटेड लर्निंग (विकल्प)",
    trust_encryption: "एंड-टू-एंड एन्क्रिप्शन",
    trust_247: "24/7 संकट प्रबंधन",
    login_title: "साइन इन करें या अतिथि के रूप में जारी रखें",
    login_guest: "अतिथि के रूप में जारी रखें (गुमनाम)",
    onboarding: "ऑनबोर्डिंग",
    dashboard: "डैशबोर्ड",
  },
  bn: {
    hero_title: "ক্লিনিক্যালি-ভিত্তিক সহায়তা। ব্যক্তিগত ডিজাইন।",
    hero_sub: "মাইন্ডব্রিজ অন-ডিভাইস AI সহ শিক্ষার্থীদের সমর্থন করে। কোনও ডেটা আপনার ডিভাইস ছাড়ে না।",
    cta_start: "ব্যক্তিগতভাবে শুরু করুন",
    cta_privacy: "আপনার ডেটা ডিভাইসে কীভাবে থাকে",
    trust_ondevice: "অন-ডিভাইস প্রসেসিং",
    trust_federated: "ফেডারেটেড লার্নিং (বিকল্প)",
    trust_encryption: "এন্ড-টু-এন্ড এনক্রিপশন",
    trust_247: "24/7 সংকট পরিচালনা",
    login_title: "সাইন ইন করুন বা অতিথি হিসাবে চালিয়ে যান",
    login_guest: "অতিথি হিসাবে চালিয়ে যান (বেনামী)",
    onboarding: "অনবোর্ডিং",
    dashboard: "ড্যাশবোর্ড",
  },
  ta: {
    hero_title: "மருத்துவ அடிப்படையிலான ஆதரவு. தனிப்பட்ட வடிவமைப்பு.",
    hero_sub: "மைண்ட்பிரிட்ஜ் ஆன்-டிவைஸ் AI மூலம் மாணவர்களை ஆதரிக்கிறது. உங்கள் சாதனத்தை விட்டு எந்த தரவும் வெளியேறாது.",
    cta_start: "தனிப்பட்ட முறையில் தொடங்கவும்",
    cta_privacy: "உங்கள் தரவு சாதனத்தில் எவ்வாறு இருக்கிறது",
    trust_ondevice: "ஆன்-டிவைஸ் செயலாக்கம்",
    trust_federated: "ஃபெடரேட்டட் கற்றல் (விருப்பம்)",
    trust_encryption: "எண்ட்-டு-எண்ட் குறியாக்கம்",
    trust_247: "24/7 நெருக்கடி மேலாண்மை",
    login_title: "உள்நுழைய அல்லது விருந்தினராக தொடர",
    login_guest: "விருந்தினராக தொடரவும் (அநாமதேயம்)",
    onboarding: "ஆன்போர்டிங்",
    dashboard: "டாஷ்போர்டு",
  },
  te: {
    hero_title: "క్లినికల్-గ్రౌండెడ్ మద్దతు. ప్రైవేట్ డిజైన్.",
    hero_sub: "మైండ్‌బ్రిడ్జ్ ఆన్-డివైస్ AI తో విద్యార్థులకు మద్దతు ఇస్తుంది. మీ పరికరాన్ని విడిచి ఏ డేటా వెళ్ళదు.",
    cta_start: "ప్రైవేట్‌గా ప్రారంభించండి",
    cta_privacy: "మీ డేటా పరికరంలో ఎలా ఉంటుంది",
    trust_ondevice: "ఆన్-డివైస్ ప్రాసెసింగ్",
    trust_federated: "ఫెడరేటెడ్ లెర్నింగ్ (ఎంపిక)",
    trust_encryption: "ఎండ్-టు-ఎండ్ ఎన్క్రిప్షన్",
    trust_247: "24/7 సంక్షోభ నిర్వహణ",
    login_title: "సైన్ ఇన్ చేయండి లేదా అతిథిగా కొనసాగించండి",
    login_guest: "అతిథిగా కొనసాగించండి (అజ్ఞాతం)",
    onboarding: "ఆన్‌బోర్డింగ్",
    dashboard: "డాష్‌బోర్డ్",
  },
  mr: {
    hero_title: "क्लिनिकली-आधारित समर्थन. खाजगी डिझाइन.",
    hero_sub: "माइंडब्रिज ऑन-डिव्हाइस AI सह विद्यार्थ्यांना समर्थन देते. तुमचे डिव्हाइस सोडून कोणताही डेटा जात नाही.",
    cta_start: "खाजगीरित्या सुरू करा",
    cta_privacy: "तुमचा डेटा डिव्हाइसवर कसा राहतो",
    trust_ondevice: "ऑन-डिव्हाइस प्रोसेसिंग",
    trust_federated: "फेडरेटेड लर्निंग (पर्याय)",
    trust_encryption: "एंड-टू-एंड एन्क्रिप्शन",
    trust_247: "24/7 संकट व्यवस्थापन",
    login_title: "साइन इन करा किंवा अतिथी म्हणून सुरू ठेवा",
    login_guest: "अतिथी म्हणून सुरू ठेवा (निनावी)",
    onboarding: "ऑनबोर्डिंग",
    dashboard: "डॅशबोर्ड",
  },
}

const LocaleCtx = createContext<{
  locale: Locale
  t: (key: string) => string
  setLocale: (l: Locale) => void
} | null>(null)

export function LocaleProvider({ 
  children, 
  defaultLocale = "en-IN" as Locale 
}: { 
  children: ReactNode
  defaultLocale?: Locale 
}) {
  const [locale, setLocale] = useState<Locale>(defaultLocale)
  const t = useMemo(() => {
    const dict = dictionaries[locale] || {}
    console.log("Current locale:", locale, "Dictionary keys:", Object.keys(dict).length)
    return (key: string) => {
      const translated = dict[key] ?? dictionaries["en-IN"][key] ?? key
      console.log(`Translating "${key}" in ${locale}:`, translated)
      return translated
    }
  }, [locale])

  return <LocaleCtx.Provider value={{ locale, t, setLocale }}>{children}</LocaleCtx.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleCtx)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}
