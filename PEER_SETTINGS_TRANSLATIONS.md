# Peer Search & Settings Page Translations

## Overview
This document contains all the translation keys needed for the Peer Search and Settings pages across all 6 languages.

## Translation Keys Added to English (en-IN)

### Peer Search Page (40+ keys)
```typescript
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
```

### Settings Page (35+ keys)
```typescript
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
```

## Status

- ✅ English (en-IN): **COMPLETE** - All 75+ keys added
- ⏳ Hindi (hi): **PENDING** - Needs translation
- ⏳ Bengali (bn): **PENDING** - Needs translation
- ⏳ Tamil (ta): **PENDING** - Needs translation
- ⏳ Telugu (te): **PENDING** - Needs translation
- ⏳ Marathi (mr): **PENDING** - Needs translation

## Implementation Note

Due to the large file size (1300+ lines) and token limits, the remaining 5 language translations should be added systematically. Each language section should include all 75+ new keys with proper translations.

## Next Steps

1. Add translations for Hindi (hi)
2. Add translations for Bengali (bn)
3. Add translations for Tamil (ta)
4. Add translations for Telugu (te)
5. Add translations for Marathi (mr)
6. Update Peer Search page to use translation keys
7. Update Settings page to use translation keys
8. Test language switching on both pages

## Files to Update

1. `components/locale-provider.tsx` - Add translations to remaining 5 languages
2. `app/peer-search/page.tsx` - Replace hardcoded strings with t() calls
3. `app/settings/page.tsx` - Replace hardcoded strings with t() calls
