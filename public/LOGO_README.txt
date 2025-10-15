╔═══════════════════════════════════════════════════════════════════╗
║                 MindBridge Logo Quick Reference                   ║
╚═══════════════════════════════════════════════════════════════════╝

📁 ACTIVE LOGO FILES:
   ├─ mindbridge-logo-gradient-bg.png      → Main logo with gradient background (all uses)
   ├─ mindbridge-logo-gradient-bg-dark.png → Dark mode variant with gradient background
   ├─ favicon.png                          → Browser tab icon
   └─ mindbridge-logo-original.png         → Backup/source file

🎨 LOGO SPECIFICATIONS:
   • Format: PNG with gradient background
   • Size: High resolution, optimized for web
   • Background: Full gradient background
   • Colors: Cyan/Teal gradient theme
   • Dark Mode: Optimized dark variant for better visibility

📍 CURRENT USAGE:
   ✅ Header Navigation      (32×32px)
   ✅ Sidebar Navigation      (32×32px / 40×40px responsive)
   ✅ Login Page             (64×64px)
   ✅ Onboarding Pages       (64×64px)
   ✅ Browser Favicon        (auto-sized)

💡 DESIGN ELEMENTS:
   • Profile silhouette (left side)
   • Flowing wings/hands (symbolizing growth & healing)
   • Circular gradient frame (wholeness & protection)
   • Two stars (hope & inspiration)

🔗 IMPLEMENTATION:
   All references now use gradient background versions with theme detection
   
   Example usage:
   <picture className="h-8 w-8">
     <source srcSet="/mindbridge-logo-gradient-bg-dark.png" media="(prefers-color-scheme: dark)" />
     <img src="/mindbridge-logo-gradient-bg.png" alt="MindBridge Logo" className="h-8 w-8 rounded-md" />
   </picture>

📚 FULL DOCUMENTATION:
   See: LOGO_GUIDE.md and LOGO_UPDATE_SUMMARY.md

═══════════════════════════════════════════════════════════════════
Last Updated: October 14, 2025
Status: ✅ Fully Integrated & Operational
