"use client"
import { createContext, useContext, useMemo, useState, ReactNode } from "react"

type Locale = "en-IN" | "hi" | "bn" | "ta" | "te" | "mr"
type Dict = Record<string, string>

const dictionaries: Record<Locale, Dict> = {
  "en-IN": {
    // Landing Page
    hero_title: "Clinically-grounded support. Private by design.",
    hero_sub: "MindBridge supports students with on-device AI. No data leaves your device.",
    cta_start: "Start privately",
    cta_privacy: "How your data stays on‑device",
    go_to_dashboard: "Go to Dashboard",
    learn_more: "Learn More",
    private_secure: "Private & Secure",
    always_available: "Always Available",
    encrypted: "Encrypted",
    privacy_first: "Privacy-First Mental Wellness",
    cta_wellness_title: "Start Your Wellness Journey Today",
    cta_wellness_subtitle: "Join thousands of students who trust MindBridge for their mental wellness",
    trust_ondevice: "On-device processing",
    trust_federated: "Federated learning (opt-in)",
    trust_encryption: "End-to-end encryption",
    trust_247: "24/7 crisis escalation",
    
    // Landing Page Features
    feature_ai_title: "AI Companion",
    feature_ai_desc: "Compassionate support powered by advanced AI, available 24/7",
    feature_dream_title: "Dream Analysis",
    feature_dream_desc: "Understand your emotional patterns through dream interpretation",
    feature_peer_title: "Peer Support",
    feature_peer_desc: "Connect anonymously with others who understand what you're going through",
    feature_relief_title: "Quick Relief",
    feature_relief_desc: "Instant access to breathing exercises and grounding techniques",
    
    // Login
    login_title: "Sign in or continue as guest",
    login_guest: "Continue as Guest (anonymous)",
    
    // Navigation
    onboarding: "Onboarding",
    dashboard: "Dashboard",
    peer_search: "Find Peers",
    peer_chat: "Peer Chat",
    settings: "Settings",
    nav_dashboard_desc: "Your wellness home",
    nav_peer_search_desc: "Find peer connections",
    nav_settings_desc: "Privacy & preferences",
    privacy_first_nav: "Privacy First",
    privacy_desc_nav: "All data is encrypted and anonymous",
    
    // Dashboard
    welcome_back: "Welcome back",
    welcome_subtitle: "Your personal wellness sanctuary",
    streak: "Streak",
    days_active: "Days active",
    insights: "Insights",
    insights_generated: "Generated",
    
    // Mood States
    feeling_calm: "Feeling calm",
    feeling_anxious: "Feeling anxious",
    feeling_low: "Feeling low",
    feeling_lonely: "Feeling lonely",
    feeling_crisis: "In crisis mode",
    
    mood_calm: "Calm",
    mood_anxious: "Anxious",
    mood_low: "Low",
    mood_lonely: "Lonely",
    mood_neutral: "Neutral",
    mood_stressed: "Stressed",
    mood_sad: "Sad",
    mood_hopeful: "Hopeful",
    mood_confused: "Confused",
    
    // Mood Messages
    mood_msg_anxious_title: "Take a breath",
    mood_msg_anxious_sub: "We're here with you, one step at a time",
    mood_msg_low_title: "You're doing great",
    mood_msg_low_sub: "Small steps still move you forward",
    mood_msg_lonely_title: "You're not alone",
    mood_msg_lonely_sub: "This space is here for you",
    mood_msg_crisis_title: "Help is available",
    mood_msg_crisis_sub: "You don't have to face this alone",
    
    // Mood Indicator
    mood_space_balanced: "Your space is balanced and neutral",
    mood_space_breathing: "Your space has extra breathing room",
    mood_space_softer: "Your space is softer and warmer",
    mood_space_welcoming: "Your space feels more welcoming",
    mood_space_focused: "Your space is clear and focused",
    
    // Daily Check-in
    daily_checkin: "Daily Check-in",
    how_feeling_today: "How are you feeling?",
    save_checkin: "Save Check-in",
    checkin_saved: "Check-in saved!",
    
    // AI Companion
    ai_companion: "AI Companion",
    ai_companion_desc: "Chat with your supportive AI companion",
    ai_greeting: "Hello! I'm your AI companion. How can I support you today?",
    ai_error: "I'm sorry, I'm having trouble responding right now. Please try again.",
    start_chat: "Start Chat",
    type_message: "Type your message...",
    send: "Send",
    
    // Dream Analysis
    dream_analysis: "Dream Analysis",
    dream_analysis_desc: "Understand your dreams with AI insights",
    dream_title: "Dream Interpretation",
    dream_subtitle: "Track emotional patterns in your dreams",
    tell_dream: "Tell me about your dream",
    analyze_dream: "Analyze Dream",
    analyzing: "Analyzing...",
    dream_placeholder: "Describe your dream in detail...",
    dream_empty_title: "No dreams yet",
    dream_empty_desc: "Start tracking your dreams to discover emotional patterns",
    valence_label: "Emotional Valence",
    arousal_label: "Intensity",
    recent_dreams: "Recent Dreams",
    
    // Peer Matching
    peer_matching: "Peer Matching",
    peer_matching_desc: "Connect with someone who understands",
    peer_title: "Find a Peer",
    peer_subtitle: "Anonymous & encrypted connections",
    enable_peer: "Enable Peer Matching",
    peer_disabled: "Enable peer matching in privacy settings to connect",
    online_users: "users online",
    select_mood: "Select your mood",
    loneliness_level: "Loneliness Level",
    find_peer: "Find a Peer Connection",
    searching_peer: "Searching for a peer...",
    matched: "Matched!",
    active_chats: "Active Chats",
    end_chat: "End Chat",
    no_matches: "No active matches",
    waiting_match: "Waiting for a match...",
    
    // Insights
    insights_card: "Personal Insights",
    insights_desc: "Your wellness patterns",
    insights_empty: "Check in daily to unlock personalized insights about your wellness journey",
    insight_mood_pattern: "Mood Pattern",
    insight_activity_streak: "Activity Streak",
    dismiss: "Dismiss",
    
    // Micro Interventions / Quick Relief
    micro_interventions: "Quick Relief",
    micro_interventions_desc: "Instant wellness exercises",
    relief_breathing: "60s Breathing",
    relief_grounding: "Grounding 5-4-3-2-1",
    relief_reflection: "Brief Reflection",
    duration_1min: "1 min",
    duration_2min: "2 min",
    duration_3min: "3 min",
    take_moment: "Take a moment anytime you need",
    
    // Peer Search Page
    find_peer_title: "Find a Peer",
    peer_anonymous_encrypted: "Anonymous & encrypted connections",
    online: "Online",
    searching_status: "Searching",
    community_status: "Community Status",
    realtime_availability: "Real-time peer availability",
    users_online: "Users Online",
    in_search_queue: "In Search Queue",
    privacy_protected: "Your Privacy is Protected",
    privacy_protected_desc: "All conversations are encrypted end-to-end. Your identity remains anonymous. Connections are based on mood compatibility and shared interests.",
    how_feeling: "How are you feeling?",
    select_mood_desc: "Select your current mood to find compatible peers",
    connection_need_level: "Connection Need Level",
    connection_need_desc: "How much do you need to connect right now? (1-10)",
    just_browsing: "Just browsing",
    really_need_someone: "Really need someone",
    interests_title: "Your Interests",
    interests_desc: "Select interests to find like-minded peers",
    search_interests: "Search interests...",
    selected: "selected",
    no_interests_match: "No interests match your search",
    matching_tips: "Matching Tips",
    tip_honest: "Be honest about your mood",
    tip_honest_desc: "Authentic connections start with honesty",
    tip_interests: "Share multiple interests",
    tip_interests_desc: "More interests = better matches",
    tip_available: "Stay available for a few minutes",
    tip_available_desc: "Matching usually takes 30-60 seconds",
    active_matches_title: "Active Matches",
    you_are_chatting: "You're currently chatting with",
    chat_now: "Chat Now",
    no_active_matches: "No active matches",
    start_search: "Start a search to find your first peer connection",
    select_mood_first: "Please select your current mood",
    select_interest_first: "Please select at least one interest",
    no_matches_found: "No matches found. Please try again later.",
    failed_peer_match: "Failed to request peer match. Please try again.",
    find_peer_connection: "Find a Peer Connection",
    
    // Settings Page
    settings_page_title: "Settings",
    settings_page_subtitle: "Manage your privacy and preferences",
    privacy_settings: "Privacy Settings",
    privacy_settings_desc: "Control what data you share",
    peer_matching_setting: "Anonymous Peer Matching",
    peer_matching_setting_desc: "Allow connections with anonymous peers for support",
    dream_analysis_setting: "Dream Analysis",
    dream_analysis_setting_desc: "Enable AI-powered dream pattern analysis",
    emotional_patterns_setting: "Share Emotional Patterns (Federated)",
    emotional_patterns_setting_desc: "Contribute to improving AI models while staying anonymous",
    data_management: "Data Management",
    data_management_desc: "Control your data retention",
    data_retention: "Data Retention Period",
    data_retention_desc: "How long to keep your wellness data",
    days: "days",
    year: "year",
    note: "Note",
    retention_30: "30 days (Minimal)",
    retention_60: "60 days (Balanced)",
    retention_90: "90 days (Recommended)",
    retention_180: "180 days (Extended)",
    privacy_info: "Privacy Information",
    privacy_info_desc: "How we protect your data",
    privacy_point_1: "End-to-end encryption for all peer chats",
    privacy_point_2: "On-device processing for sensitive data",
    privacy_point_3: "Anonymous identifiers - no personal info linked",
    privacy_point_4: "Federated learning (opt-in only)",
    privacy_point_5: "Auto-deletion after retention period",
    data_actions: "Data Actions",
    data_actions_desc: "Manage your data",
    export_data: "Export My Data",
    export_data_desc: "Download all your wellness data",
    delete_data: "Delete All My Data",
    delete_data_desc: "Permanently remove all data (cannot be undone)",
    save_changes: "Save Changes",
    reset_defaults: "Reset to Defaults",
    saving: "Saving...",
    save_success: "Settings saved successfully!",
    save_error: "Failed to save settings",
    loading_settings: "Loading your settings...",
    no_changes: "No changes to save",
    unsaved_changes: "You have unsaved changes",
    
    // Account & Settings Additional Keys
    account_information: "Account Information",
    account_details_status: "Your account details and status",
    account_type: "Account Type",
    account_status: "Account Status",
    anonymous: "Anonymous",
    registered: "Registered",
    role: "Role",
    timezone: "Timezone",
    show: "Show",
    hide: "Hide",
    search_text: "Search",
    anonymous_peer: "Anonymous Peer",
    messages: "messages",
    percent_match: "% match",
    online_text: "Online",
    searching_text: "Searching",
    
    // Interest Options (18 interests)
    interest_music: "Music",
    interest_reading: "Reading",
    interest_gaming: "Gaming",
    interest_sports: "Sports",
    interest_art: "Art",
    interest_coding: "Coding",
    interest_movies: "Movies",
    interest_travel: "Travel",
    interest_cooking: "Cooking",
    interest_photography: "Photography",
    interest_fitness: "Fitness",
    interest_meditation: "Meditation",
    interest_writing: "Writing",
    interest_dancing: "Dancing",
    interest_nature: "Nature",
    interest_science: "Science",
    interest_fashion: "Fashion",
    interest_volunteering: "Volunteering",
    
    // Safety Tips
    safety_first: "Safety First",
    safety_no_personal_info: "Never share personal information",
    safety_report_behavior: "Report inappropriate behavior",
    safety_end_anytime: "You can end conversations anytime",
    safety_crisis_support: "Crisis support available 24/7",
    
    // Additional Peer Search Keys (legacy/duplicate cleanup)
    peer_search_desc: "Connect anonymously with peers who understand",
    not_lonely: "Not lonely",
    very_lonely: "Very lonely",
    preferred_language: "Preferred language",
    english: "English",
    hindi: "Hindi",
    bengali: "Bengali",
    tamil: "Tamil",
    telugu: "Telugu",
    marathi: "Marathi",
    find_connection: "Find a Peer Connection",
    searching: "Searching...",
    select_interests: "Select interests",
    
    // User Profile Bio
    your_profile: "Your Profile",
    profile_description: "Share a bit about yourself to help others connect with you",
    bio_label: "Bio",
    bio_placeholder: "e.g., I enjoy reading and gaming. Looking for someone to talk about daily life and share experiences...",
    bio_tip: "💡 Be genuine! Avoid sharing personal details like full name, address, or contact info.",
    save_profile: "Save Profile",
    bio_saved: "Bio saved successfully!",
    bio_save_failed: "Failed to save bio",
    
    // Interests
    interest_academics: "Academics",
    interest_relationships: "Relationships",
    interest_family: "Family",
    interest_career: "Career",
    interest_health: "Health",
    interest_social: "Social Anxiety",
    
    // Settings
    settings_title: "Settings",
    profile: "Profile",
    privacy: "Privacy & Security",
    notifications: "Notifications",
    language: "Language",
    appearance: "Appearance",
    about: "About",
    logout: "Logout",
    
    // Emergency
    emergency_support: "Emergency Support",
    crisis_helpline: "Crisis Helpline",
    call_helpline: "Call 14416",
    need_help: "Need immediate help?",
    
    // Common Actions
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    back: "Back",
    next: "Next",
    continue: "Continue",
    submit: "Submit",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Footer
    privacy_policy: "Privacy Policy",
    terms_service: "Terms of Service",
    contact: "Contact Us",
    
    // Data Privacy Notice
    privacy_notice: "🔒 Crisis-aware features surface support gently. No personal data is uploaded. All processing happens on your device.",
  },
  hi: {
    // Landing Page
    hero_title: "नैदानिक आधारित सहायता। निजी डिज़ाइन।",
    hero_sub: "माइंडब्रिज ऑन-डिवाइस AI के साथ छात्रों का समर्थन करता है। कोई डेटा आपके डिवाइस को नहीं छोड़ता।",
    cta_start: "निजी तौर पर शुरू करें",
    cta_privacy: "आपका डेटा डिवाइस पर कैसे रहता है",
    go_to_dashboard: "डैशबोर्ड पर जाएं",
    learn_more: "अधिक जानें",
    private_secure: "निजी और सुरक्षित",
    always_available: "हमेशा उपलब्ध",
    encrypted: "एन्क्रिप्टेड",
    privacy_first: "गोपनीयता-प्रथम मानसिक स्वास्थ्य",
    cta_wellness_title: "आज अपनी स्वास्थ्य यात्रा शुरू करें",
    cta_wellness_subtitle: "हजारों छात्रों से जुड़ें जो अपने मानसिक स्वास्थ्य के लिए माइंडब्रिज पर भरोसा करते हैं",
    trust_ondevice: "ऑन-डिवाइस प्रोसेसिंग",
    trust_federated: "फेडरेटेड लर्निंग (विकल्प)",
    trust_encryption: "एंड-टू-एंड एन्क्रिप्शन",
    trust_247: "24/7 संकट प्रबंधन",
    
    // Landing Page Features
    feature_ai_title: "AI साथी",
    feature_ai_desc: "उन्नत AI द्वारा संचालित दयालु सहायता, 24/7 उपलब्ध",
    feature_dream_title: "स्वप्न विश्लेषण",
    feature_dream_desc: "स्वप्न व्याख्या के माध्यम से अपने भावनात्मक पैटर्न को समझें",
    feature_peer_title: "साथी सहायता",
    feature_peer_desc: "गुमनाम रूप से उन लोगों से जुड़ें जो समझते हैं कि आप क्या अनुभव कर रहे हैं",
    feature_relief_title: "त्वरित राहत",
    feature_relief_desc: "श्वास व्यायाम और ग्राउंडिंग तकनीकों तक तत्काल पहुंच",
    
    // Login
    login_title: "साइन इन करें या अतिथि के रूप में जारी रखें",
    login_guest: "अतिथि के रूप में जारी रखें (गुमनाम)",
    
    // Navigation
    onboarding: "ऑनबोर्डिंग",
    dashboard: "डैशबोर्ड",
    peer_search: "साथी खोजें",
    peer_chat: "साथी चैट",
    settings: "सेटिंग्स",
    nav_dashboard_desc: "आपका कल्याण घर",
    nav_peer_search_desc: "साथी कनेक्शन खोजें",
    nav_settings_desc: "गोपनीयता और प्राथमिकताएं",
    privacy_first_nav: "गोपनीयता प्रथम",
    privacy_desc_nav: "सभी डेटा एन्क्रिप्टेड और गुमनाम है",
    
    // Dashboard
    welcome_back: "वापसी पर स्वागत है",
    welcome_subtitle: "आपका व्यक्तिगत कल्याण स्थान",
    streak: "लगातार दिन",
    days_active: "सक्रिय दिन",
    insights: "अंतर्दृष्टि",
    insights_generated: "उत्पन्न",
    
    // Mood States
    feeling_calm: "शांत महसूस कर रहे हैं",
    feeling_anxious: "चिंतित महसूस कर रहे हैं",
    feeling_low: "उदास महसूस कर रहे हैं",
    feeling_lonely: "अकेला महसूस कर रहे हैं",
    feeling_crisis: "संकट मोड में",
    
    mood_calm: "शांत",
    mood_anxious: "चिंतित",
    mood_low: "उदास",
    mood_lonely: "अकेला",
    mood_neutral: "सामान्य",
    mood_stressed: "तनावग्रस्त",
    mood_sad: "दुखी",
    mood_hopeful: "आशावान",
    mood_confused: "भ्रमित",
    
    // Mood Messages
    mood_msg_anxious_title: "गहरी सांस लें",
    mood_msg_anxious_sub: "हम आपके साथ हैं, एक कदम एक बार में",
    mood_msg_low_title: "आप बहुत अच्छा कर रहे हैं",
    mood_msg_low_sub: "छोटे कदम भी आपको आगे बढ़ाते हैं",
    mood_msg_lonely_title: "आप अकेले नहीं हैं",
    mood_msg_lonely_sub: "यह स्थान आपके लिए है",
    mood_msg_crisis_title: "मदद उपलब्ध है",
    mood_msg_crisis_sub: "आपको अकेले इसका सामना नहीं करना है",
    
    // Mood Indicator
    mood_space_balanced: "आपका स्थान संतुलित और तटस्थ है",
    mood_space_breathing: "आपके स्थान में अतिरिक्त सांस लेने की जगह है",
    mood_space_softer: "आपका स्थान नरम और गर्म है",
    mood_space_welcoming: "आपका स्थान अधिक स्वागत योग्य लगता है",
    mood_space_focused: "आपका स्थान स्पष्ट और केंद्रित है",
    
    // Daily Check-in
    daily_checkin: "दैनिक जांच",
    how_feeling_today: "आप कैसा महसूस कर रहे हैं?",
    save_checkin: "जांच सहेजें",
    checkin_saved: "जांच सहेजी गई!",
    
    // AI Companion
    ai_companion: "AI साथी",
    ai_companion_desc: "अपने सहायक AI साथी के साथ चैट करें",
    ai_greeting: "नमस्ते! मैं आपका AI साथी हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
    ai_error: "क्षमा करें, मुझे अभी जवाब देने में परेशानी हो रही है। कृपया पुनः प्रयास करें।",
    start_chat: "चैट शुरू करें",
    type_message: "अपना संदेश टाइप करें...",
    send: "भेजें",
    
    // Dream Analysis
    dream_analysis: "स्वप्न विश्लेषण",
    dream_analysis_desc: "AI अंतर्दृष्टि के साथ अपने सपनों को समझें",
    dream_title: "स्वप्न व्याख्या",
    dream_subtitle: "अपने सपनों में भावनात्मक पैटर्न ट्रैक करें",
    tell_dream: "मुझे अपने सपने के बारे में बताएं",
    analyze_dream: "स्वप्न का विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    dream_placeholder: "अपने सपने का विस्तार से वर्णन करें...",
    dream_empty_title: "अभी तक कोई सपने नहीं",
    dream_empty_desc: "भावनात्मक पैटर्न खोजने के लिए अपने सपनों को ट्रैक करना शुरू करें",
    valence_label: "भावनात्मक संतुलन",
    arousal_label: "तीव्रता",
    recent_dreams: "हाल के सपने",
    
    // Peer Matching
    peer_matching: "साथी मिलान",
    peer_matching_desc: "किसी ऐसे व्यक्ति से जुड़ें जो समझता हो",
    peer_title: "साथी खोजें",
    peer_subtitle: "गुमनाम और एन्क्रिप्टेड कनेक्शन",
    enable_peer: "साथी मिलान सक्षम करें",
    peer_disabled: "कनेक्ट करने के लिए गोपनीयता सेटिंग्स में साथी मिलान सक्षम करें",
    online_users: "ऑनलाइन",
    select_mood: "अपना मूड चुनें",
    loneliness_level: "अकेलापन स्तर",
    find_peer: "साथी कनेक्शन खोजें",
    searching_peer: "साथी खोजा जा रहा है...",
    matched: "मिलान हुआ!",
    active_chats: "सक्रिय चैट",
    end_chat: "चैट समाप्त करें",
    no_matches: "कोई सक्रिय मिलान नहीं",
    waiting_match: "मिलान की प्रतीक्षा में...",
    
    // Peer Search - Additional Keys
    account_information: "खाता जानकारी",
    account_details_status: "आपका खाता विवरण और स्थिति",
    account_type: "खाता प्रकार",
    account_status: "खाता स्थिति",
    anonymous: "गुमनाम",
    registered: "पंजीकृत",
    role: "भूमिका",
    timezone: "समयक्षेत्र",
    show: "दिखाएं",
    hide: "छुपाएं",
    search_text: "खोज",
    anonymous_peer: "गुमनाम साथी",
    messages: "संदेश",
    percent_match: "% मेल",
    online_text: "ऑनलाइन",
    searching_text: "खोजा जा रहा है",
    
    // Interest Options (18 interests)
    interest_music: "संगीत",
    interest_reading: "पढ़ना",
    interest_gaming: "गेमिंग",
    interest_sports: "खेल",
    interest_art: "कला",
    interest_coding: "कोडिंग",
    interest_movies: "फ़िल्में",
    interest_travel: "यात्रा",
    interest_cooking: "खाना पकाना",
    interest_photography: "फोटोग्राफी",
    interest_fitness: "फिटनेस",
    interest_meditation: "ध्यान",
    interest_writing: "लेखन",
    interest_dancing: "नृत्य",
    interest_nature: "प्रकृति",
    interest_science: "विज्ञान",
    interest_fashion: "फैशन",
    interest_volunteering: "स्वयंसेवा",
    
    // Safety Tips
    safety_first: "सुरक्षा पहले",
    safety_no_personal_info: "कभी भी व्यक्तिगत जानकारी साझा न करें",
    safety_report_behavior: "अनुचित व्यवहार की रिपोर्ट करें",
    safety_end_anytime: "आप कभी भी बातचीत समाप्त कर सकते हैं",
    safety_crisis_support: "संकट सहायता 24/7 उपलब्ध",
    
    // Insights
    insights_card: "व्यक्तिगत अंतर्दृष्टि",
    insights_desc: "आपके कल्याण पैटर्न",
    insights_empty: "अपनी कल्याण यात्रा के बारे में व्यक्तिगत अंतर्दृष्टि अनलॉक करने के लिए रोज़ाना चेक इन करें",
    insight_mood_pattern: "मूड पैटर्न",
    insight_activity_streak: "गतिविधि श्रृंखला",
    dismiss: "खारिज करें",
    
    // Micro Interventions / Quick Relief
    micro_interventions: "त्वरित राहत",
    micro_interventions_desc: "तत्काल कल्याण व्यायाम",
    relief_breathing: "60 सेकंड श्वास",
    relief_grounding: "ग्राउंडिंग 5-4-3-2-1",
    relief_reflection: "संक्षिप्त चिंतन",
    duration_1min: "1 मिनट",
    duration_2min: "2 मिनट",
    duration_3min: "3 मिनट",
    take_moment: "जब भी ज़रूरत हो एक पल लें",
    
    // Peer Search
    find_peer_connection: "साथी कनेक्शन खोजें",
    peer_search_desc: "उन साथियों के साथ गुमनाम रूप से जुड़ें जो समझते हैं",
    not_lonely: "अकेला नहीं",
    very_lonely: "बहुत अकेला",
    preferred_language: "पसंदीदा भाषा",
    english: "अंग्रेज़ी",
    hindi: "हिंदी",
    bengali: "बंगाली",
    tamil: "तमिल",
    telugu: "तेलुगु",
    marathi: "मराठी",
    find_connection: "साथी कनेक्शन खोजें",
    searching: "खोज रहे हैं...",
    select_interests: "रुचियां चुनें",
    
    // Interests
    interest_academics: "शैक्षणिक",
    interest_relationships: "संबंध",
    interest_family: "परिवार",
    interest_career: "करियर",
    interest_health: "स्वास्थ्य",
    interest_social: "सामाजिक चिंता",
    
    // Settings
    settings_title: "सेटिंग्स",
    profile: "प्रोफ़ाइल",
    privacy: "गोपनीयता और सुरक्षा",
    notifications: "सूचनाएं",
    language: "भाषा",
    appearance: "रूप",
    about: "के बारे में",
    logout: "लॉग आउट",
    
    // Emergency
    emergency_support: "आपातकालीन सहायता",
    crisis_helpline: "संकट हेल्पलाइन",
    call_helpline: "14416 पर कॉल करें",
    need_help: "तत्काल मदद चाहिए?",
    
    // Common Actions
    save: "सहेजें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    close: "बंद करें",
    back: "वापस",
    next: "अगला",
    continue: "जारी रखें",
    submit: "जमा करें",
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    
    // Footer
    privacy_policy: "गोपनीयता नीति",
    terms_service: "सेवा की शर्तें",
    contact: "हमसे संपर्क करें",
    
    // Data Privacy Notice
    privacy_notice: "🔒 संकट-जागरूक सुविधाएं धीरे से सहायता प्रदान करती हैं। कोई व्यक्तिगत डेटा अपलोड नहीं किया जाता है। सभी प्रसंस्करण आपके डिवाइस पर होता है।",
  },
  bn: {
    // Landing Page
    hero_title: "ক্লিনিক্যালি-ভিত্তিক সহায়তা। ব্যক্তিগত ডিজাইন।",
    hero_sub: "মাইন্ডব্রিজ অন-ডিভাইস AI সহ শিক্ষার্থীদের সমর্থন করে। কোনও ডেটা আপনার ডিভাইস ছাড়ে না।",
    cta_start: "ব্যক্তিগতভাবে শুরু করুন",
    cta_privacy: "আপনার ডেটা ডিভাইসে কীভাবে থাকে",
    go_to_dashboard: "ড্যাশবোর্ডে যান",
    learn_more: "আরও জানুন",
    private_secure: "ব্যক্তিগত এবং সুরক্ষিত",
    always_available: "সর্বদা উপলব্ধ",
    encrypted: "এনক্রিপ্টেড",
    privacy_first: "গোপনীয়তা-প্রথম মানসিক স্বাস্থ্য",
    cta_wellness_title: "আজই আপনার সুস্থতার যাত্রা শুরু করুন",
    cta_wellness_subtitle: "হাজার হাজার শিক্ষার্থীর সাথে যোগ দিন যারা তাদের মানসিক সুস্থতার জন্য মাইন্ডব্রিজ বিশ্বাস করে",
    trust_ondevice: "অন-ডিভাইস প্রসেসিং",
    trust_federated: "ফেডারেটেড লার্নিং (বিকল্প)",
    trust_encryption: "এন্ড-টু-এন্ড এনক্রিপশন",
    trust_247: "24/7 সংকট পরিচালনা",
    
    // Landing Page Features
    feature_ai_title: "AI সঙ্গী",
    feature_ai_desc: "উন্নত AI দ্বারা চালিত সহানুভূতিশীল সহায়তা, 24/7 উপলব্ধ",
    feature_dream_title: "স্বপ্ন বিশ্লেষণ",
    feature_dream_desc: "স্বপ্ন ব্যাখ্যার মাধ্যমে আপনার মানসিক প্যাটার্ন বুঝুন",
    feature_peer_title: "সঙ্গী সহায়তা",
    feature_peer_desc: "বেনামীভাবে এমন লোকদের সাথে সংযোগ করুন যারা বোঝে আপনি কী অনুভব করছেন",
    feature_relief_title: "দ্রুত ত্রাণ",
    feature_relief_desc: "শ্বাস ব্যায়াম এবং গ্রাউন্ডিং কৌশলগুলিতে তাৎক্ষণিক অ্যাক্সেস",
    
    // Login
    login_title: "সাইন ইন করুন বা অতিথি হিসাবে চালিয়ে যান",
    login_guest: "অতিথি হিসাবে চালিয়ে যান (বেনামী)",
    
    // Navigation
    onboarding: "অনবোর্ডিং",
    dashboard: "ড্যাশবোর্ড",
    peer_search: "সঙ্গী খুঁজুন",
    peer_chat: "সঙ্গী চ্যাট",
    settings: "সেটিংস",
    nav_dashboard_desc: "আপনার সুস্থতার বাড়ি",
    nav_peer_search_desc: "সঙ্গী সংযোগ খুঁজুন",
    nav_settings_desc: "গোপনীয়তা এবং পছন্দ",
    privacy_first_nav: "গোপনীয়তা প্রথম",
    privacy_desc_nav: "সমস্ত ডেটা এনক্রিপ্ট করা এবং বেনামী",
    
    // Dashboard
    welcome_back: "ফিরে আসার স্বাগতম",
    welcome_subtitle: "আপনার ব্যক্তিগত সুস্থতা অভয়ারণ্য",
    streak: "ধারাবাহিক দিন",
    days_active: "সক্রিয় দিন",
    insights: "অন্তর্দৃষ্টি",
    insights_generated: "উত্পন্ন",
    
    // Mood States
    feeling_calm: "শান্ত অনুভব করছি",
    feeling_anxious: "উদ্বিগ্ন অনুভব করছি",
    feeling_low: "নিম্ন অনুভব করছি",
    feeling_lonely: "একা অনুভব করছি",
    feeling_crisis: "সংকটে আছি",
    mood_calm: "শান্ত",
    mood_anxious: "উদ্বিগ্ন",
    mood_low: "নিম্ন",
    mood_lonely: "একা",
    
    // Mood Messages
    mood_msg_anxious_title: "একটি দীর্ঘ নিঃশ্বাস নিন",
    mood_msg_anxious_sub: "আমরা আপনার সাথে আছি, একবারে এক ধাপ",
    mood_msg_low_title: "আপনি দুর্দান্ত করছেন",
    mood_msg_low_sub: "ছোট পদক্ষেপ এখনও আপনাকে এগিয়ে নিয়ে যায়",
    mood_msg_lonely_title: "আপনি একা নন",
    mood_msg_lonely_sub: "সমর্থন এবং সংযোগ আপনার জন্য এখানে",
    mood_msg_crisis_title: "আমরা এখানে আছি",
    mood_msg_crisis_sub: "আপনার নিরাপত্তা আমাদের অগ্রাধিকার",
    
    // Mood Indicator
    mood_space_balanced: "আপনার স্থান ভারসাম্যপূর্ণ",
    mood_space_breathing: "আপনার স্থানে অতিরিক্ত শ্বাস প্রশ্বাসের জায়গা আছে",
    mood_space_gentle: "আপনার স্থান নরম এবং উষ্ণ",
    mood_space_supportive: "আপনার স্থান সহায়ক এবং সংযুক্ত",
    mood_space_safe: "আপনার স্থান নিরাপদ এবং সুরক্ষিত",
    
    // Daily Check-in
    daily_checkin: "দৈনিক চেক-ইন",
    how_feeling_today: "আজ আপনি কেমন অনুভব করছেন?",
    save_checkin: "চেক-ইন সংরক্ষণ করুন",
    checkin_saved: "চেক-ইন সংরক্ষিত হয়েছে!",
    
    // AI Companion
    ai_companion: "এআই সঙ্গী",
    ai_companion_desc: "আপনার সহায়ক এআই সঙ্গীর সাথে চ্যাট করুন",
    ai_greeting: "হ্যালো! আমি আপনার এআই সঙ্গী। আজ আমি আপনাকে কীভাবে সহায়তা করতে পারি?",
    ai_error: "দুঃখিত, আমার এখন উত্তর দিতে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    start_chat: "চ্যাট শুরু করুন",
    type_message: "আপনার বার্তা টাইপ করুন...",
    send: "পাঠান",
    
    // Dream Analysis
    dream_analysis: "স্বপ্ন বিশ্লেষণ",
    dream_analysis_desc: "এআই অন্তর্দৃষ্টি দিয়ে আপনার স্বপ্ন বুঝুন",
    dream_title: "স্বপ্ন ব্যাখ্যা",
    dream_subtitle: "আপনার স্বপ্নে মানসিক প্যাটার্ন ট্র্যাক করুন",
    tell_dream: "আমাকে আপনার স্বপ্নের কথা বলুন",
    analyze_dream: "স্বপ্ন বিশ্লেষণ করুন",
    analyzing: "বিশ্লেষণ হচ্ছে...",
    dream_placeholder: "আপনার স্বপ্নের বিস্তারিত বর্ণনা করুন...",
    dream_empty_title: "এখনও কোনও স্বপ্ন নেই",
    dream_empty_desc: "মানসিক প্যাটার্ন আবিষ্কার করতে আপনার স্বপ্ন ট্র্যাক করা শুরু করুন",
    valence_label: "মানসিক ভারসাম্য",
    arousal_label: "তীব্রতা",
    recent_dreams: "সাম্প্রতিক স্বপ্ন",
    
    // Peer Matching
    peer_matching: "সঙ্গী মিলান",
    peer_matching_desc: "এমন কারও সাথে সংযোগ করুন যে বোঝে",
    peer_title: "সঙ্গী খুঁজুন",
    peer_subtitle: "বেনামী এবং এনক্রিপ্ট করা সংযোগ",
    enable_peer: "সঙ্গী মিলান সক্ষম করুন",
    peer_disabled: "সংযোগ করতে গোপনীয়তা সেটিংসে সঙ্গী মিলান সক্ষম করুন",
    online_users: "অনলাইন",
    select_mood: "আপনার মুড নির্বাচন করুন",
    loneliness_level: "একাকীত্বের স্তর",
    find_peer: "সঙ্গী সংযোগ খুঁজুন",
    searching_peer: "সঙ্গী খোঁজা হচ্ছে...",
    matched: "মিল হয়েছে!",
    active_chats: "সক্রিয় চ্যাট",
    end_chat: "চ্যাট শেষ করুন",
    no_matches: "কোনও সক্রিয় মিল নেই",
    waiting_match: "মিলের জন্য অপেক্ষা করছি...",
    
    // Peer Search - Additional Keys
    account_information: "অ্যাকাউন্ট তথ্য",
    account_details_status: "আপনার অ্যাকাউন্ট বিবরণ এবং অবস্থা",
    account_type: "অ্যাকাউন্ট প্রকার",
    account_status: "অ্যাকাউন্ট অবস্থা",
    anonymous: "বেনামী",
    registered: "নিবন্ধিত",
    role: "ভূমিকা",
    timezone: "সময় অঞ্চল",
    show: "দেখান",
    hide: "লুকান",
    search_text: "অনুসন্ধান",
    anonymous_peer: "বেনামী সঙ্গী",
    messages: "বার্তা",
    percent_match: "% মিল",
    online_text: "অনলাইন",
    searching_text: "খোঁজা হচ্ছে",
    
    // Interest Options (18 interests)
    interest_music: "সঙ্গীত",
    interest_reading: "পড়া",
    interest_gaming: "গেমিং",
    interest_sports: "খেলাধুলা",
    interest_art: "শিল্প",
    interest_coding: "কোডিং",
    interest_movies: "চলচ্চিত্র",
    interest_travel: "ভ্রমণ",
    interest_cooking: "রান্না",
    interest_photography: "ফটোগ্রাফি",
    interest_fitness: "ফিটনেস",
    interest_meditation: "ধ্যান",
    interest_writing: "লেখা",
    interest_dancing: "নাচ",
    interest_nature: "প্রকৃতি",
    interest_science: "বিজ্ঞান",
    interest_fashion: "ফ্যাশন",
    interest_volunteering: "স্বেচ্ছাসেবা",
    
    // Safety Tips
    safety_first: "নিরাপত্তা প্রথম",
    safety_no_personal_info: "কখনও ব্যক্তিগত তথ্য শেয়ার করবেন না",
    safety_report_behavior: "অনুপযুক্ত আচরণ রিপোর্ট করুন",
    safety_end_anytime: "আপনি যেকোনো সময় কথোপকথন শেষ করতে পারেন",
    safety_crisis_support: "সংকট সহায়তা 24/7 উপলব্ধ",
    
    // Insights
    insights_card: "ব্যক্তিগত অন্তর্দৃষ্টি",
    insights_desc: "আপনার সুস্থতার প্যাটার্ন",
    insights_empty: "আপনার সুস্থতার যাত্রা সম্পর্কে ব্যক্তিগত অন্তর্দৃষ্টি আনলক করতে প্রতিদিন চেক ইন করুন",
    insight_mood_pattern: "মুড প্যাটার্ন",
    insight_activity_streak: "কার্যকলাপ ধারা",
    dismiss: "বাতিল করুন",
    
    // Micro Interventions / Quick Relief
    micro_interventions: "দ্রুত ত্রাণ",
    micro_interventions_desc: "তাৎক্ষণিক সুস্থতা ব্যায়াম",
    relief_breathing: "60 সেকেন্ড শ্বাস",
    relief_grounding: "গ্রাউন্ডিং 5-4-3-2-1",
    relief_reflection: "সংক্ষিপ্ত প্রতিফলন",
    duration_1min: "1 মিনিট",
    duration_2min: "2 মিনিট",
    duration_3min: "3 মিনিট",
    take_moment: "যখনই প্রয়োজন একটি মুহূর্ত নিন",
    
    // Peer Search
    find_peer_connection: "একটি সহকর্মী সংযোগ খুঁজুন",
    peer_search_desc: "একটি সহায়ক সমপ্রদায়ের সাথে সংযুক্ত হন।",
    not_lonely: "একা নই",
    very_lonely: "খুব একা",
    preferred_language: "পছন্দের ভাষা",
    english: "ইংরেজি",
    hindi: "হিন্দি",
    bengali: "বাংলা",
    tamil: "তামিল",
    telugu: "তেলুগু",
    marathi: "মারাঠি",
    find_connection: "সংযোগ খুঁজুন",
    searching: "অনুসন্ধান করা হচ্ছে...",
    
    // Interests
    interest_academics: "একাডেমিক",
    interest_relationships: "সম্পর্ক",
    interest_family: "পরিবার",
    interest_career: "ক্যারিয়ার",
    interest_health: "স্বাস্থ্য",
    interest_social: "সামাজিক উদ্বেগ",
    
    // Settings
    settings_title: "সেটিংস",
    profile: "প্রোফাইল",
    privacy: "গোপনীয়তা এবং নিরাপত্তা",
    notifications: "বিজ্ঞপ্তি",
    language: "ভাষা",
    appearance: "চেহারা",
    about: "সম্পর্কে",
    logout: "লগ আউট",
    
    // Emergency
    emergency_support: "জরুরি সহায়তা",
    crisis_helpline: "সংকট হেল্পলাইন",
    call_helpline: "14416 এ কল করুন",
    need_help: "অবিলম্বে সাহায্য প্রয়োজন?",
    
    // Common Actions
    save: "সংরক্ষণ করুন",
    cancel: "বাতিল করুন",
    edit: "সম্পাদনা করুন",
    delete: "মুছে ফেলুন",
    close: "বন্ধ করুন",
    back: "ফিরে যান",
    next: "পরবর্তী",
    continue: "চালিয়ে যান",
    submit: "জমা দিন",
    loading: "লোড হচ্ছে...",
    error: "ত্রুটি",
    success: "সফলতা",
    
    // Footer
    privacy_policy: "গোপনীয়তা নীতি",
    terms_service: "সেবা পাবার শর্ত",
    contact: "আমাদের সাথে যোগাযোগ করুন",
    
    // Data Privacy Notice
    privacy_notice: "🔒 সংকট-সচেতন বৈশিষ্ট্যগুলি মৃদুভাবে সহায়তা প্রদান করে। কোনও ব্যক্তিগত ডেটা আপলোড করা হয় না। সমস্ত প্রক্রিয়াকরণ আপনার ডিভাইসে ঘটে।",
  },
  ta: {
    // Landing Page
    hero_title: "மருத்துவ அடிப்படையிலான ஆதரவு. தனிப்பட்ட வடிவமைப்பு.",
    hero_sub: "மைண்ட்பிரிட்ஜ் ஆன்-டிவைஸ் AI மூலம் மாணவர்களை ஆதரிக்கிறது. உங்கள் சாதனத்தை விட்டு எந்த தரவும் வெளியேறாது.",
    cta_start: "தனிப்பட்ட முறையில் தொடங்கவும்",
    cta_privacy: "உங்கள் தரவு சாதனத்தில் எவ்வாறு இருக்கிறது",
    go_to_dashboard: "டாஷ்போர்டுக்குச் செல்லவும்",
    learn_more: "மேலும் அறிக",
    private_secure: "தனிப்பட்ட மற்றும் பாதுகாப்பான",
    always_available: "எப்போதும் கிடைக்கும்",
    encrypted: "குறியாக்கம்",
    privacy_first: "தனியுரிமை-முதல் மன ஆரோக்கியம்",
    cta_wellness_title: "இன்றே உங்கள் நல்வாழ்வு பயணத்தைத் தொடங்குங்கள்",
    cta_wellness_subtitle: "மைண்ட்பிரிட்ஜை மன நல்வாழ்வுக்கு நம்பும் ஆயிரக்கணக்கான மாணவர்களுடன் சேரவும்",
    trust_ondevice: "ஆன்-டிவைஸ் செயலாக்கம்",
    trust_federated: "ஃபெடரேட்டட் கற்றல் (விருப்பம்)",
    trust_encryption: "எண்ட்-டு-எண்ட் குறியாக்கம்",
    trust_247: "24/7 நெருக்கடி மேலாண்மை",
    
    // Landing Page Features
    feature_ai_title: "AI துணை",
    feature_ai_desc: "மேம்பட்ட AI மூலம் இயங்கும் கருணையான ஆதரவு, 24/7 கிடைக்கும்",
    feature_dream_title: "கனவு பகுப்பாய்வு",
    feature_dream_desc: "கனவு விளக்கத்தின் மூலம் உங்கள் உணர்ச்சி முறைகளை புரிந்து கொள்ளுங்கள்",
    feature_peer_title: "சக ஆதரவு",
    feature_peer_desc: "நீங்கள் என்ன அனுபவிக்கிறீர்கள் என்பதை புரிந்துகொள்ளும் மற்றவர்களுடன் அநாமதேயமாக இணையுங்கள்",
    feature_relief_title: "விரைவு நிவாரணம்",
    feature_relief_desc: "சுவாசப் பயிற்சிகள் மற்றும் அடித்தள நுட்பங்களுக்கு உடனடி அணுகல்",
    
    // Login
    login_title: "உள்நுழைய அல்லது விருந்தினராக தொடர",
    login_guest: "விருந்தினராக தொடரவும் (அநாமதேயம்)",
    
    // Navigation
    onboarding: "ஆன்போர்டிங்",
    dashboard: "டாஷ்போர்டு",
    peer_search: "சகர்களைக் கண்டறியவும்",
    peer_chat: "சக அரட்டை",
    settings: "அமைப்புகள்",
    nav_dashboard_desc: "உங்கள் நல்வாழ்வு இல்லம்",
    nav_peer_search_desc: "சக இணைப்புகளைக் கண்டறியவும்",
    nav_settings_desc: "தனியுரிமை மற்றும் விருப்பத்தேர்வுகள்",
    privacy_first_nav: "தனியுரிமை முதலில்",
    privacy_desc_nav: "அனைத்து தரவும் குறியாக்கம் மற்றும் அநாமதேயம்",
    
    // Dashboard
    welcome_back: "மீண்டும் வரவேற்கிறோம்",
    welcome_subtitle: "உங்கள் தனிப்பட்ட நல்வாழ்வு சரணாலயம்",
    streak: "தொடர்ச்சியான நாட்கள்",
    days_active: "செயலில் உள்ள நாட்கள்",
    insights: "நுண்ணறிவு",
    insights_generated: "உருவாக்கப்பட்டது",
    
    // Mood States
    feeling_calm: "அமைதியாக உணர்கிறேன்",
    feeling_anxious: "கவலையுடன் உணர்கிறேன்",
    feeling_low: "தாழ்வாக உணர்கிறேன்",
    feeling_lonely: "தனிமையாக உணர்கிறேன்",
    feeling_crisis: "நெருக்கடியில் இருக்கிறேன்",
    mood_calm: "அமைதி",
    mood_anxious: "கவலை",
    mood_low: "தாழ்வு",
    mood_lonely: "தனிமை",
    
    // Mood Messages
    mood_msg_anxious_title: "ஆழமாக மூச்சு விடுங்கள்",
    mood_msg_anxious_sub: "நாங்கள் உங்களுடன் இருக்கிறோம், ஒரு நேரத்தில் ஒரு படி",
    mood_msg_low_title: "நீங்கள் நன்றாக செய்கிறீர்கள்",
    mood_msg_low_sub: "சிறிய படிகள் இன்னும் உங்களை முன்னேற்றுகின்றன",
    mood_msg_lonely_title: "நீங்கள் தனியாக இல்லை",
    mood_msg_lonely_sub: "ஆதரவும் இணைப்பும் உங்களுக்காக இங்கே உள்ளது",
    mood_msg_crisis_title: "நாங்கள் இங்கே இருக்கிறோம்",
    mood_msg_crisis_sub: "உங்கள் பாதுகாப்பு எங்கள் முன்னுரிமை",
    
    // Mood Indicator
    mood_space_balanced: "உங்கள் இடம் சமநிலையில் உள்ளது",
    mood_space_breathing: "உங்கள் இடத்தில் கூடுதல் சுவாச அறை உள்ளது",
    mood_space_gentle: "உங்கள் இடம் மென்மையாகவும் சூடாகவும் உள்ளது",
    mood_space_supportive: "உங்கள் இடம் ஆதரவாகவும் இணைக்கப்பட்டதாகவும் உள்ளது",
    mood_space_safe: "உங்கள் இடம் பாதுகாப்பானது மற்றும் பாதுகாக்கப்பட்டது",
    
    // Daily Check-in
    daily_checkin: "தினசரி சரிபார்ப்பு",
    how_feeling_today: "இன்று நீங்கள் எப்படி உணர்கிறீர்கள்?",
    save_checkin: "சரிபார்ப்பைச் சேமிக்கவும்",
    checkin_saved: "சரிபார்ப்பு சேமிக்கப்பட்டது!",
    
    // AI Companion
    ai_companion: "AI துணைவன்",
    ai_companion_desc: "உங்கள் ஆதரவு AI துணையுடன் அரட்டையடிக்கவும்",
    ai_greeting: "வணக்கம்! நான் உங்கள் AI துணை. இன்று நான் உங்களுக்கு எப்படி ஆதரவளிக்க முடியும்?",
    ai_error: "மன்னிக்கவும், இப்போது பதிலளிப்பதில் எனக்கு சிக்கல் உள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
    start_chat: "அரட்டையைத் தொடங்கவும்",
    type_message: "உங்கள் செய்தியை தட்டச்சு செய்யவும்...",
    send: "அனுப்பவும்",
    
    // Dream Analysis
    dream_analysis: "கனவு பகுப்பாய்வு",
    dream_analysis_desc: "AI நுண்ணறிவுடன் உங்கள் கனவுகளை புரிந்துகொள்ளுங்கள்",
    dream_title: "கனவு விளக்கம்",
    dream_subtitle: "உங்கள் கனவுகளில் உணர்ச்சி முறைகளை கண்காணிக்கவும்",
    tell_dream: "உங்கள் கனவைப் பற்றி என்னிடம் கூறுங்கள்",
    analyze_dream: "கனவை பகுப்பாய்வு செய்யவும்",
    analyzing: "பகுப்பாய்வு செய்யப்படுகிறது...",
    dream_placeholder: "உங்கள் கனவை விரிவாக விவரிக்கவும்...",
    dream_empty_title: "இன்னும் கனவுகள் இல்லை",
    dream_empty_desc: "உணர்ச்சி முறைகளைக் கண்டறிய உங்கள் கனவுகளைக் கண்காணிக்கத் தொடங்குங்கள்",
    valence_label: "உணர்ச்சி சமநிலை",
    arousal_label: "தீவிரம்",
    recent_dreams: "சமீபத்திய கனவுகள்",
    
    // Peer Matching
    peer_matching: "சகா பொருத்தம்",
    peer_matching_desc: "புரிந்துகொள்ளும் ஒருவருடன் இணைக்கவும்",
    peer_title: "சகர்களைக் கண்டறியவும்",
    peer_subtitle: "அநாமதேய மற்றும் குறியாக்கப்பட்ட இணைப்புகள்",
    enable_peer: "சக பொருத்தத்தை இயக்கவும்",
    peer_disabled: "இணைக்க தனியுரிமை அமைப்புகளில் சக பொருத்தத்தை இயக்கவும்",
    online_users: "ஆன்லைனில்",
    select_mood: "உங்கள் மனநிலையைத் தேர்ந்தெடுக்கவும்",
    loneliness_level: "தனிமை நிலை",
    find_peer: "சக இணைப்பைக் கண்டறியவும்",
    searching_peer: "சகர் தேடப்படுகிறது...",
    matched: "பொருத்தம் ஆனது!",
    active_chats: "செயலில் உள்ள அரட்டைகள்",
    end_chat: "அரட்டையை முடிக்கவும்",
    no_matches: "செயலில் உள்ள பொருத்தங்கள் இல்லை",
    waiting_match: "பொருத்தத்திற்காக காத்திருக்கிறது...",
    
    // Peer Search - Additional Keys
    account_information: "கணக்கு தகவல்",
    account_details_status: "உங்கள் கணக்கு விவரங்கள் மற்றும் நிலை",
    account_type: "கணக்கு வகை",
    account_status: "கணக்கு நிலை",
    anonymous: "அநாமதேயம்",
    registered: "பதிவு செய்யப்பட்டது",
    role: "பங்கு",
    timezone: "நேர மண்டலம்",
    show: "காட்டு",
    hide: "மறை",
    search_text: "தேடல்",
    anonymous_peer: "அநாமதேய சக",
    messages: "செய்திகள்",
    percent_match: "% பொருத்தம்",
    online_text: "ஆன்லைன்",
    searching_text: "தேடுகிறது",
    
    // Interest Options (18 interests)
    interest_music: "இசை",
    interest_reading: "வாசிப்பு",
    interest_gaming: "விளையாட்டு",
    interest_sports: "விளையாட்டுகள்",
    interest_art: "கலை",
    interest_coding: "குறியீடு",
    interest_movies: "திரைப்படங்கள்",
    interest_travel: "பயணம்",
    interest_cooking: "சமையல்",
    interest_photography: "புகைப்படம்",
    interest_fitness: "உடற்பயிற்சி",
    interest_meditation: "தியானம்",
    interest_writing: "எழுத்து",
    interest_dancing: "நடனம்",
    interest_nature: "இயற்கை",
    interest_science: "அறிவியல்",
    interest_fashion: "ஃபேஷன்",
    interest_volunteering: "தன்னார்வம்",
    
    // Safety Tips
    safety_first: "பாதுகாப்பு முதலில்",
    safety_no_personal_info: "ஒருபோதும் தனிப்பட்ட தகவலைப் பகிராதீர்கள்",
    safety_report_behavior: "பொருத்தமற்ற நடத்தையை அறிவிக்கவும்",
    safety_end_anytime: "நீங்கள் எந்த நேரத்திலும் உரையாடலை முடிக்கலாம்",
    safety_crisis_support: "நெருக்கடி ஆதரவு 24/7 கிடைக்கிறது",
    
    // Insights
    insights_card: "தனிப்பட்ட நுண்ணறிவுகள்",
    insights_desc: "உங்கள் நல்வாழ்வு முறைகள்",
    insights_empty: "உங்கள் நல்வாழ்வு பயணம் பற்றிய தனிப்பட்ட நுண்ணறிவுகளை திறக்க தினசரி சரிபார்க்கவும்",
    insight_mood_pattern: "மனநிலை முறை",
    insight_activity_streak: "செயல்பாட்டு தொடர்",
    dismiss: "நிராகரிக்கவும்",
    
    // Micro Interventions / Quick Relief
    micro_interventions: "விரைவு நிவாரணம்",
    micro_interventions_desc: "உடனடி நல்வாழ்வு பயிற்சிகள்",
    relief_breathing: "60 வினாடி சுவாசம்",
    relief_grounding: "அடித்தளம் 5-4-3-2-1",
    relief_reflection: "சுருக்கமான சிந்தனை",
    duration_1min: "1 நிமிடம்",
    duration_2min: "2 நிமிடங்கள்",
    duration_3min: "3 நிமிடங்கள்",
    take_moment: "தேவைப்படும்போதெல்லாம் ஒரு கணம் எடுக்கவும்",
    
    // Peer Search
    find_peer_connection: "ஒரு சகா இணைப்பைக் கண்டுபிடிக்கவும்",
    peer_search_desc: "ஆதரவான சமூகத்துடன் இணைக்கவும்.",
    not_lonely: "தனிமையாக இல்லை",
    very_lonely: "மிகவும் தனிமை",
    preferred_language: "விருப்பமான மொழி",
    english: "ஆங்கிலம்",
    hindi: "இந்தி",
    bengali: "வங்காளம்",
    tamil: "தமிழ்",
    telugu: "தெலுங்கு",
    marathi: "மராத்தி",
    find_connection: "இணைப்பைக் கண்டுபிடிக்கவும்",
    searching: "தேடுகிறது...",
    
    // Interests
    interest_academics: "கல்வி",
    interest_relationships: "உறவுகள்",
    interest_family: "குடும்பம்",
    interest_career: "தொழில்",
    interest_health: "ஆரோக்கியம்",
    interest_social: "சமூக கவலை",
    
    // Settings
    settings_title: "அமைப்புகள்",
    profile: "சுயவிவரம்",
    privacy: "தனியுரிமை மற்றும் பாதுகாப்பு",
    notifications: "அறிவிப்புகள்",
    language: "மொழி",
    appearance: "தோற்றம்",
    about: "பற்றி",
    logout: "வெளியேறு",
    
    // Emergency
    emergency_support: "அவசர ஆதரவு",
    crisis_helpline: "நெருக்கடி உதவி எண்",
    call_helpline: "14416 ஐ அழைக்கவும்",
    need_help: "உடனடி உதவி தேவையா?",
    
    // Common Actions
    save: "சேமிக்கவும்",
    cancel: "ரத்து செய்யவும்",
    edit: "திருத்தவும்",
    delete: "நீக்கவும்",
    close: "மூடவும்",
    back: "பின்னால்",
    next: "அடுத்து",
    continue: "தொடரவும்",
    submit: "சமர்ப்பிக்கவும்",
    loading: "ஏற்றுகிறது...",
    error: "பிழை",
    success: "வெற்றி",
    
    // Footer
    privacy_policy: "தனியுரிமை கொள்கை",
    terms_service: "சேவை விதிமுறைகள்",
    contact: "எங்களை தொடர்பு கொள்ளவும்",
    
    // Data Privacy Notice
    privacy_notice: "🔒 நெருக்கடி-விழிப்புணர்வு அம்சங்கள் மெதுவாக ஆதரவை வழங்குகின்றன. எந்த தனிப்பட்ட தரவும் பதிவேற்றப்படவில்லை. அனைத்து செயலாக்கமும் உங்கள் சாதனத்தில் நடக்கிறது.",
  },
  te: {
    // Landing Page
    hero_title: "క్లినికల్-గ్రౌండెడ్ మద్దతు. ప్రైవేట్ డిజైన్.",
    hero_sub: "మైండ్‌బ్రిడ్జ్ ఆన్-డివైస్ AI తో విద్యార్థులకు మద్దతు ఇస్తుంది. మీ పరికరాన్ని విడిచి ఏ డేటా వెళ్ళదు.",
    cta_start: "ప్రైవేట్‌గా ప్రారంభించండి",
    cta_privacy: "మీ డేటా పరికరంలో ఎలా ఉంటుంది",
    go_to_dashboard: "డాష్‌బోర్డ్‌కు వెళ్లండి",
    learn_more: "మరింత తెలుసుకోండి",
    private_secure: "ప్రైవేట్ మరియు సురక్షితం",
    always_available: "ఎల్లప్పుడూ అందుబాటులో ఉంది",
    encrypted: "ఎన్క్రిప్ట్ చేయబడింది",
    privacy_first: "గోప్యత-మొదటి మానసిక ఆరోగ్యం",
    cta_wellness_title: "ఈరోజే మీ శ్రేయస్సు ప్రయాణాన్ని ప్రారంభించండి",
    cta_wellness_subtitle: "వారి మానసిక శ్రేయస్సు కోసం మైండ్‌బ్రిడ్జ్‌ను విశ్వసించే వేలాది విద్యార్థులతో చేరండి",
    trust_ondevice: "ఆన్-డివైస్ ప్రాసెసింగ్",
    trust_federated: "ఫెడరేటెడ్ లెర్నింగ్ (ఎంపిక)",
    trust_encryption: "ఎండ్-టు-ఎండ్ ఎన్క్రిప్షన్",
    trust_247: "24/7 సంక్షోభ నిర్వహణ",
    
    // Landing Page Features
    feature_ai_title: "AI సహాయకుడు",
    feature_ai_desc: "అధునాతన AI ద్వారా శక్తివంతమైన దయగల మద్దతు, 24/7 అందుబాటులో",
    feature_dream_title: "స్వప్న విశ్లేషణ",
    feature_dream_desc: "స్వప్న వివరణ ద్వారా మీ భావోద్వేగ నమూనాలను అర్థం చేసుకోండి",
    feature_peer_title: "తోటి మద్దతు",
    feature_peer_desc: "మీరు ఏమి అనుభవిస్తున్నారో అర్థం చేసుకునే ఇతరులతో అజ్ఞాతంగా కనెక్ట్ అవ్వండి",
    feature_relief_title: "త్వరిత ఉపశమనం",
    feature_relief_desc: "శ్వాస వ్యాయామాలు మరియు గ్రౌండింగ్ పద్ధతులకు తక్షణ యాక్సెస్",
    
    // Login
    login_title: "సైన్ ఇన్ చేయండి లేదా అతిథిగా కొనసాగించండి",
    login_guest: "అతిథిగా కొనసాగించండి (అజ్ఞాతం)",
    
    // Navigation
    onboarding: "ఆన్‌బోర్డింగ్",
    dashboard: "డాష్‌బోర్డ్",
    peer_search: "తోటివారిని కనుగొనండి",
    peer_chat: "తోటి చాట్",
    settings: "సెట్టింగ్‌లు",
    nav_dashboard_desc: "మీ శ్రేయస్సు నివాసం",
    nav_peer_search_desc: "తోటి కనెక్షన్‌లను కనుగొనండి",
    nav_settings_desc: "గోప్యత మరియు ప్రాధాన్యతలు",
    privacy_first_nav: "గోప్యత మొదటి",
    privacy_desc_nav: "అన్ని డేటా ఎన్క్రిప్ట్ చేయబడింది మరియు అజ్ఞాతం",
    
    // Dashboard
    welcome_back: "తిరిగి స్వాగతం",
    welcome_subtitle: "మీ వ్యక్తిగత సంక్షేమ అభయారణ్యం",
    streak: "వరుస రోజులు",
    days_active: "క్రియాశీల రోజులు",
    insights: "అంతర్దృష్టులు",
    insights_generated: "ఉత్పత్తి చేయబడింది",
    
    // Mood States
    feeling_calm: "ప్రశాంతంగా అనిపిస్తోంది",
    feeling_anxious: "ఆందోళనగా అనిపిస్తోంది",
    feeling_low: "తక్కువగా అనిపిస్తోంది",
    feeling_lonely: "ఒంటరిగా అనిపిస్తోంది",
    feeling_crisis: "సంక్షోభంలో ఉన్నాను",
    mood_calm: "ప్రశాంతత",
    mood_anxious: "ఆందోళన",
    mood_low: "తక్కువ",
    mood_lonely: "ఒంటరితనం",
    
    // Mood Messages
    mood_msg_anxious_title: "లోతైన శ్వాస తీసుకోండి",
    mood_msg_anxious_sub: "మేము మీతో ఉన్నాము, ఒక సమయంలో ఒక దశ",
    mood_msg_low_title: "మీరు గొప్పగా చేస్తున్నారు",
    mood_msg_low_sub: "చిన్న అడుగులు ఇప్పటికీ మిమ్మల్ని ముందుకు తీసుకువెళ్తాయి",
    mood_msg_lonely_title: "మీరు ఒంటరి కాదు",
    mood_msg_lonely_sub: "మద్దతు మరియు కనెక్షన్ మీ కోసం ఇక్కడ ఉన్నాయి",
    mood_msg_crisis_title: "మేము ఇక్కడ ఉన్నాము",
    mood_msg_crisis_sub: "మీ భద్రత మా ప్రాధాన్యత",
    
    // Mood Indicator
    mood_space_balanced: "మీ స్థలం సమతుల్యంగా ఉంది",
    mood_space_breathing: "మీ స్థలంలో అదనపు శ్వాస గది ఉంది",
    mood_space_gentle: "మీ స్థలం సున్నితంగా మరియు వెచ్చగా ఉంది",
    mood_space_supportive: "మీ స్థలం మద్దతుగా మరియు కనెక్ట్ చేయబడింది",
    mood_space_safe: "మీ స్థలం సురక్షితంగా మరియు రక్షించబడింది",
    
    // Daily Check-in
    daily_checkin: "రోజువారీ చెక్-ఇన్",
    how_feeling_today: "ఈరోజు మీకు ఎలా అనిపిస్తోంది?",
    save_checkin: "చెక్-ఇన్ సేవ్ చేయండి",
    checkin_saved: "చెక్-ఇన్ సేవ్ చేయబడింది!",
    
    // AI Companion
    ai_companion: "AI సహచరుడు",
    ai_companion_desc: "మీ సహాయక AI సహచరుడితో చాట్ చేయండి",
    ai_greeting: "నమస్కారం! నేను మీ AI సహచరుడిని. ఈరోజు నేను మీకు ఎలా సహాయపడగలను?",
    ai_error: "క్షమించండి, ఇప్పుడు ప్రతిస్పందించడంలో నాకు సమస్య ఉంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
    start_chat: "చాట్ ప్రారంభించండి",
    type_message: "మీ సందేశాన్ని టైప్ చేయండి...",
    send: "పంపండి",
    
    // Dream Analysis
    dream_analysis: "కల విశ్లేషణ",
    dream_analysis_desc: "AI అంతర్దృష్టితో మీ కలలను అర్థం చేసుకోండి",
    dream_title: "కల వివరణ",
    dream_subtitle: "మీ కలలలో భావోద్వేగ నమూనాలను ట్రాక్ చేయండి",
    tell_dream: "మీ కల గురించి నాకు చెప్పండి",
    analyze_dream: "కలను విశ్లేషించండి",
    analyzing: "విశ్లేషించబడుతోంది...",
    dream_placeholder: "మీ కలను వివరంగా వివరించండి...",
    dream_empty_title: "ఇంకా కలలు లేవు",
    dream_empty_desc: "భావోద్వేగ నమూనాలను కనుగొనడానికి మీ కలలను ట్రాక్ చేయడం ప్రారంభించండి",
    valence_label: "భావోద్వేగ సమతుల్యత",
    arousal_label: "తీవ్రత",
    recent_dreams: "ఇటీవలి కలలు",
    
    // Peer Matching
    peer_matching: "సహచర మ్యాచింగ్",
    peer_matching_desc: "అర్థం చేసుకునే వారితో కనెక్ట్ అవ్వండి",
    peer_title: "తోటివారిని కనుగొనండి",
    peer_subtitle: "అజ్ఞాత మరియు ఎన్క్రిప్ట్ చేసిన కనెక్షన్‌లు",
    enable_peer: "తోటి మ్యాచింగ్ ప్రారంభించండి",
    peer_disabled: "కనెక్ట్ అవ్వడానికి గోప్యత సెట్టింగ్‌లలో తోటి మ్యాచింగ్ ప్రారంభించండి",
    online_users: "ఆన్‌లైన్",
    select_mood: "మీ మూడ్ ఎంచుకోండి",
    loneliness_level: "ఒంటరితనం స్థాయి",
    find_peer: "తోటి కనెక్షన్ కనుగొనండి",
    searching_peer: "తోటివారు శోధించబడుతున్నారు...",
    matched: "మ్యాచ్ అయ్యింది!",
    active_chats: "క్రియాశీల చాట్‌లు",
    end_chat: "చాట్ ముగించండి",
    no_matches: "క్రియాశీల మ్యాచ్‌లు లేవు",
    waiting_match: "మ్యాచ్ కోసం వేచి ఉంది...",
    
    // Peer Search - Additional Keys
    account_information: "ఖాతా సమాచారం",
    account_details_status: "మీ ఖాతా వివరాలు మరియు స్థితి",
    account_type: "ఖాతా రకం",
    account_status: "ఖాతా స్థితి",
    anonymous: "అజ్ఞాతం",
    registered: "నమోదు చేయబడింది",
    role: "పాత్ర",
    timezone: "సమయ మండలం",
    show: "చూపించు",
    hide: "దాచు",
    search_text: "శోధన",
    anonymous_peer: "అజ్ఞాత తోటి",
    messages: "సందేశాలు",
    percent_match: "% మ్యాచ్",
    online_text: "ఆన్‌లైన్",
    searching_text: "శోధిస్తోంది",
    
    // Interest Options (18 interests)
    interest_music: "సంగీతం",
    interest_reading: "చదవడం",
    interest_gaming: "గేమింగ్",
    interest_sports: "క్రీడలు",
    interest_art: "కళ",
    interest_coding: "కోడింగ్",
    interest_movies: "చలనచిత్రాలు",
    interest_travel: "ప్రయాణం",
    interest_cooking: "వంట",
    interest_photography: "ఫోటోగ్రఫీ",
    interest_fitness: "ఫిట్‌నెస్",
    interest_meditation: "ధ్యానం",
    interest_writing: "రాయడం",
    interest_dancing: "నృత్యం",
    interest_nature: "ప్రకృతి",
    interest_science: "శాస్త్రం",
    interest_fashion: "ఫ్యాషన్",
    interest_volunteering: "స్వచ్ఛంద సేవ",
    
    // Safety Tips
    safety_first: "భద్రత మొదట",
    safety_no_personal_info: "వ్యక్తిగత సమాచారాన్ని ఎప్పుడూ భాగస్వామ్యం చేయవద్దు",
    safety_report_behavior: "తగని ప్రవర్తనను నివేదించండి",
    safety_end_anytime: "మీరు ఎప్పుడైనా సంభాషణలను ముగించవచ్చు",
    safety_crisis_support: "సంక్షోభ మద్దతు 24/7 అందుబాటులో ఉంది",
    
    // Insights
    insights_card: "వ్యక్తిగత అంతర్దృష్టులు",
    insights_desc: "మీ శ్రేయస్సు నమూనాలు",
    insights_empty: "మీ శ్రేయస్సు ప్రయాణం గురించి వ్యక్తిగత అంతర్దృష్టులను అన్‌లాక్ చేయడానికి ప్రతిరోజూ చెక్ ఇన్ చేయండి",
    insight_mood_pattern: "మూడ్ నమూనా",
    insight_activity_streak: "కార్యాచరణ స్ట్రీక్",
    dismiss: "తోసిపుచ్చు",
    
    // Micro Interventions / Quick Relief
    micro_interventions: "త్వరిత ఉపశమనం",
    micro_interventions_desc: "తక్షణ శ్రేయస్సు వ్యాయామాలు",
    relief_breathing: "60 సెకన్ల శ్వాస",
    relief_grounding: "గ్రౌండింగ్ 5-4-3-2-1",
    relief_reflection: "సంక్షిప్త ప్రతిబింబం",
    duration_1min: "1 నిమిషం",
    duration_2min: "2 నిమిషాలు",
    duration_3min: "3 నిమిషాలు",
    take_moment: "మీకు అవసరమైనప్పుడు ఒక క్షణం తీసుకోండి",
    
    // Peer Search
    find_peer_connection: "ఒక సహచర కనెక్షన్‌ను కనుగొనండి",
    peer_search_desc: "మద్దతు ఇచ్చే సమాజంతో కనెక్ట్ చేయండి.",
    not_lonely: "ఒంటరి కాదు",
    very_lonely: "చాలా ఒంటరి",
    preferred_language: "ప్రాధాన్య భాష",
    english: "ఆంగ్లం",
    hindi: "హిందీ",
    bengali: "బెంగాలీ",
    tamil: "తమిళం",
    telugu: "తెలుగు",
    marathi: "మరాఠీ",
    find_connection: "కనెక్షన్‌ని కనుగొనండి",
    searching: "శోధిస్తోంది...",
    
    // Interests
    interest_academics: "విద్యాపరమైన",
    interest_relationships: "సంబంధాలు",
    interest_family: "కుటుంబం",
    interest_career: "కెరీర్",
    interest_health: "ఆరోగ్యం",
    interest_social: "సామాజిక ఆందోళన",
    
    // Settings
    settings_title: "సెట్టింగ్‌లు",
    profile: "ప్రొఫైల్",
    privacy: "గోప్యత మరియు భద్రత",
    notifications: "నోటిఫికేషన్‌లు",
    language: "భాష",
    appearance: "రూపం",
    about: "గురించి",
    logout: "లాగ్అవుట్",
    
    // Emergency
    emergency_support: "అత్యవసర మద్దతు",
    crisis_helpline: "సంక్షోభ హెల్ప్‌లైన్",
    call_helpline: "14416కి కాల్ చేయండి",
    need_help: "తక్షణ సహాయం అవసరమా?",
    
    // Common Actions
    save: "సేవ్ చేయండి",
    cancel: "రద్దు చేయండి",
    edit: "సవరించండి",
    delete: "తొలగించండి",
    close: "మూసివేయండి",
    back: "వెనుకకు",
    next: "తదుపరి",
    continue: "కొనసాగించండి",
    submit: "సమర్పించండి",
    loading: "లోడ్ అవుతోంది...",
    error: "లోపం",
    success: "విజయం",
    
    // Footer
    privacy_policy: "గోప్యతా విధానం",
    terms_service: "సేవా నిబంధనలు",
    contact: "మమ్మల్ని సంప్రదించండి",
    
    // Data Privacy Notice
    privacy_notice: "🔒 సంక్షోభ-అవగాహన లక్షణాలు మెత్తగా మద్దతును అందిస్తాయి. వ్యక్తిగత డేటా అప్‌లోడ్ చేయబడదు. అన్ని ప్రాసెసింగ్ మీ పరికరంలో జరుగుతుంది.",
  },
  mr: {
    // Landing Page
    hero_title: "क्लिनिकली-आधारित समर्थन. खाजगी डिझाइन.",
    hero_sub: "माइंडब्रिज ऑन-डिव्हाइस AI सह विद्यार्थ्यांना समर्थन देते. तुमचे डिव्हाइस सोडून कोणताही डेटा जात नाही.",
    cta_start: "खाजगीरित्या सुरू करा",
    cta_privacy: "तुमचा डेटा डिव्हाइसवर कसा राहतो",
    go_to_dashboard: "डॅशबोर्डवर जा",
    learn_more: "अधिक जाणून घ्या",
    private_secure: "खाजगी आणि सुरक्षित",
    always_available: "नेहमी उपलब्ध",
    encrypted: "एन्क्रिप्टेड",
    privacy_first: "गोपनीयता-प्रथम मानसिक आरोग्य",
    cta_wellness_title: "आज तुमचा आरोग्य प्रवास सुरू करा",
    cta_wellness_subtitle: "त्यांच्या मानसिक आरोग्यासाठी माइंडब्रिजवर विश्वास ठेवणाऱ्या हजारो विद्यार्थ्यांमध्ये सामील व्हा",
    trust_ondevice: "ऑन-डिव्हाइस प्रोसेसिंग",
    trust_federated: "फेडरेटेड लर्निंग (पर्याय)",
    trust_encryption: "एंड-टू-एंड एन्क्रिप्शन",
    trust_247: "24/7 संकट व्यवस्थापन",
    
    // Landing Page Features
    feature_ai_title: "AI साथी",
    feature_ai_desc: "प्रगत AI द्वारे समर्थित दयाळू समर्थन, 24/7 उपलब्ध",
    feature_dream_title: "स्वप्न विश्लेषण",
    feature_dream_desc: "स्वप्नाच्या व्याख्येद्वारे तुमचे भावनिक नमुने समजून घ्या",
    feature_peer_title: "सहकारी समर्थन",
    feature_peer_desc: "तुम्ही काय अनुभवत आहात ते समजणाऱ्या इतरांशी निनावीपणे कनेक्ट व्हा",
    feature_relief_title: "जलद आराम",
    feature_relief_desc: "श्वास व्यायाम आणि ग्राउंडिंग तंत्रांसाठी त्वरित प्रवेश",
    
    // Login
    login_title: "साइन इन करा किंवा अतिथी म्हणून सुरू ठेवा",
    login_guest: "अतिथी म्हणून सुरू ठेवा (निनावी)",
    
    // Navigation
    onboarding: "ऑनबोर्डिंग",
    dashboard: "डॅशबोर्ड",
    peer_search: "सहकारी शोधा",
    peer_chat: "सहकारी चॅट",
    settings: "सेटिंग्ज",
    nav_dashboard_desc: "तुमचे आरोग्य घर",
    nav_peer_search_desc: "सहकारी कनेक्शन शोधा",
    nav_settings_desc: "गोपनीयता आणि प्राधान्ये",
    privacy_first_nav: "गोपनीयता प्रथम",
    privacy_desc_nav: "सर्व डेटा एन्क्रिप्टेड आणि निनावी आहे",
    
    // Dashboard
    welcome_back: "पुन्हा स्वागत आहे",
    welcome_subtitle: "तुमचे वैयक्तिक कल्याण अभयारण्य",
    streak: "सलग दिवस",
    days_active: "सक्रिय दिवस",
    insights: "अंतर्दृष्टी",
    insights_generated: "व्युत्पन्न",
    
    // Mood States
    feeling_calm: "शांत वाटत आहे",
    feeling_anxious: "चिंताग्रस्त वाटत आहे",
    feeling_low: "खालच्या मनोदशेत वाटत आहे",
    feeling_lonely: "एकटे वाटत आहे",
    feeling_crisis: "संकटात आहे",
    mood_calm: "शांत",
    mood_anxious: "चिंताग्रस्त",
    mood_low: "खालची मनोदशा",
    mood_lonely: "एकटेपणा",
    
    // Mood Messages
    mood_msg_anxious_title: "खोल श्वास घ्या",
    mood_msg_anxious_sub: "आम्ही तुमच्यासोबत आहोत, एका वेळी एक पाऊल",
    mood_msg_low_title: "तुम्ही चांगले करत आहात",
    mood_msg_low_sub: "लहान पावले तुम्हाला पुढे नेतात",
    mood_msg_lonely_title: "तुम्ही एकटे नाही",
    mood_msg_lonely_sub: "समर्थन आणि कनेक्शन तुमच्यासाठी येथे आहे",
    mood_msg_crisis_title: "आम्ही येथे आहोत",
    mood_msg_crisis_sub: "तुमची सुरक्षा आमची प्राथमिकता आहे",
    
    // Mood Indicator
    mood_space_balanced: "तुमची जागा संतुलित आहे",
    mood_space_breathing: "तुमच्या जागेत अतिरिक्त श्वासोच्छवासाची खोली आहे",
    mood_space_gentle: "तुमची जागा मऊ आणि उबदार आहे",
    mood_space_supportive: "तुमची जागा सहायक आणि जोडलेली आहे",
    mood_space_safe: "तुमची जागा सुरक्षित आणि संरक्षित आहे",
    
    // Daily Check-in
    daily_checkin: "दैनिक चेक-इन",
    how_feeling_today: "आज तुम्हाला कसे वाटते आहे?",
    save_checkin: "चेक-इन सेव्ह करा",
    checkin_saved: "चेक-इन सेव्ह झाले!",
    
    // AI Companion
    ai_companion: "AI साथी",
    ai_companion_desc: "आरोग्यसाठी AI चॅटबॉट",
    ai_greeting: "नमस्कार! मी तुमचा AI साथी आहे. मी आज तुम्हाला कशी मदत करू शकतो?",
    ai_error: "मला माफ करा, मला आत्ता प्रतिसाद देण्यास समस्या येत आहे. कृपया पुन्हा प्रयत्न करा.",
    start_chat: "चॅट सुरू करा",
    type_message: "संदेश टाइप करा...",
    send: "पाठवा",
    
    // Dream Analysis
    dream_analysis: "स्वप्न विश्लेषण",
    dream_analysis_desc: "तुमचे भावनिक नमुने समजून घ्या",
    dream_title: "स्वप्न व्याख्या",
    dream_subtitle: "आपल्या भावनिक नमुने समजून घ्या",
    tell_dream: "आपले स्वप्न सांगा",
    analyzing: "विश्लेषण करत आहे...",
    analyze_dream: "विश्लेषण करा",
    dream_placeholder: "तुम्ही काय स्वप्न पाहिले ते लिहा... तुमची भावना आणि तपशीलांचा समावेश करा जे तुम्हाला आठवतात.",
    dream_empty_title: "अद्याप कोणतेही स्वप्न नाही",
    dream_empty_desc: "तुमचे भावनिक नमुने ट्रॅक करण्यासाठी आणि अंतर्दृष्टी मिळवण्यासाठी स्वप्न जर्नल सुरू करा.",
    valence_label: "भावनिक स्वर",
    arousal_label: "तीव्रता",
    recent_dreams: "अलीकडील स्वप्ने",
    
    // Peer Matching
    peer_matching: "सहकारी जुळणी",
    peer_matching_desc: "निनावी आणि एन्क्रिप्टेड कनेक्शन",
    peer_title: "सहकारी जुळणी",
    peer_subtitle: "निनावी आणि एन्क्रिप्टेड कनेक्शन",
    enable_peer: "जुळणी सक्षम करा",
    peer_disabled: "18 वर्षे आणि त्यावरील वयासाठी उपलब्ध",
    online_users: "ऑनलाइन",
    quick_match: "त्वरित जुळणी",
    find_peer: "सहकारी शोधा",
    searching_peer: "जुळत आहे",
    matched: "जुळले",
    active_chats: "सक्रिय जुळण्या",
    end_chat: "चॅट संपवा",
    no_matches: "सक्रिय जुळण्या नाहीत",
    waiting_match: "जुळणीची प्रतीक्षा करत आहे...",
    
    // Peer Search - Additional Keys
    account_information: "खाते माहिती",
    account_details_status: "तुमचे खाते तपशील आणि स्थिती",
    account_type: "खाते प्रकार",
    account_status: "खाते स्थिती",
    anonymous: "निनावी",
    registered: "नोंदणीकृत",
    role: "भूमिका",
    timezone: "वेळ क्षेत्र",
    show: "दाखवा",
    hide: "लपवा",
    search_text: "शोध",
    anonymous_peer: "निनावी सहकारी",
    messages: "संदेश",
    percent_match: "% जुळणी",
    online_text: "ऑनलाइन",
    searching_text: "शोधत आहे",
    
    // Interest Options (18 interests)
    interest_music: "संगीत",
    interest_reading: "वाचन",
    interest_gaming: "गेमिंग",
    interest_sports: "खेळ",
    interest_art: "कला",
    interest_coding: "कोडिंग",
    interest_movies: "चित्रपट",
    interest_travel: "प्रवास",
    interest_cooking: "स्वयंपाक",
    interest_photography: "छायाचित्रण",
    interest_fitness: "फिटनेस",
    interest_meditation: "ध्यान",
    interest_writing: "लेखन",
    interest_dancing: "नृत्य",
    interest_nature: "निसर्ग",
    interest_science: "विज्ञान",
    interest_fashion: "फॅशन",
    interest_volunteering: "स्वयंसेवा",
    
    // Safety Tips
    safety_first: "सुरक्षा प्रथम",
    safety_no_personal_info: "वैयक्तिक माहिती कधीही शेअर करू नका",
    safety_report_behavior: "अयोग्य वर्तनाची तक्रार करा",
    safety_end_anytime: "तुम्ही कधीही संभाषण संपवू शकता",
    safety_crisis_support: "संकट समर्थन 24/7 उपलब्ध",
    
    // Insights
    insights_card: "वैयक्तिक अंतर्दृष्टी",
    insights_desc: "तुमचे आरोग्य नमुने",
    insights_empty: "अंतर्दृष्टी अनलॉक करण्यासाठी दररोज चेक इन करा आणि इतर वैशिष्ट्यांशी संवाद साधा.",
    insight_mood_pattern: "मूड पॅटर्न",
    insight_activity_streak: "क्रियाकलाप स्ट्रीक",
    view_insights: "अंतर्दृष्टी पहा",
    dismiss: "डिसमिस करा",
    
    // Micro Interventions (Quick Relief)
    micro_interventions: "जलद आराम",
    micro_interventions_desc: "त्वरित आरोग्य व्यायाम",
    relief_breathing: "60-सेकंद श्वास",
    relief_grounding: "ग्राउंडिंग 5-4-3-2-1",
    relief_reflection: "मार्गदर्शित प्रतिबिंब",
    duration_1min: "1 मिनिट",
    duration_2min: "2 मिनिटे",
    duration_3min: "3 मिनिटे",
    start_exercise: "व्यायाम सुरू करा",
    take_moment: "आपल्यासाठी एक क्षण घ्या",
    
    // Interests
    interest_academics: "शैक्षणिक",
    interest_relationships: "संबंध",
    interest_family: "कुटुंब",
    interest_career: "करिअर",
    interest_health: "आरोग्य",
    interest_social: "सामाजिक चिंता",
    
    // Settings
    settings_title: "सेटिंग्ज",
    profile: "प्रोफाइल",
    privacy: "गोपनीयता आणि सुरक्षा",
    notifications: "सूचना",
    language: "भाषा",
    appearance: "दिसणे",
    about: "बद्दल",
    logout: "लॉग आउट",
    
    // Emergency
    emergency_support: "आणीबाणी समर्थन",
    crisis_helpline: "संकट हेल्पलाइन",
    call_helpline: "14416 वर कॉल करा",
    need_help: "त्वरित मदत हवी आहे?",
    
    // Common Actions
    save: "सेव्ह करा",
    cancel: "रद्द करा",
    edit: "संपादित करा",
    delete: "हटवा",
    close: "बंद करा",
    back: "मागे",
    next: "पुढे",
    continue: "सुरू ठेवा",
    submit: "सबमिट करा",
    loading: "लोड होत आहे...",
    error: "त्रुटी",
    success: "यश",
    
    // Footer
    privacy_policy: "गोपनीयता धोरण",
    terms_service: "सेवा अटी",
    contact: "आम्हाला संपर्क करा",
    
    // Data Privacy Notice
    privacy_notice: "🔒 संकट-जागरूक वैशिष्ट्ये हळूवारपणे समर्थन देतात. कोणताही वैयक्तिक डेटा अपलोड केला जात नाही. सर्व प्रक्रिया तुमच्या डिव्हाइसवर होते.",
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
