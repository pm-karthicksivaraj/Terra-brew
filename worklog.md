---
Task ID: 1
Agent: Main Agent
Task: Apply comprehensive SEO audit to Terra Brew landing page

Work Log:
- Verified seed script fix was already applied (lines 191-217 properly destructure key/farmerCode)
- Verified coffee brown ColorHunt theme already applied in globals.css
- Verified Space Mono font already configured in layout.tsx
- Updated layout.tsx metadata: SEO-optimized title, description with high-traffic keywords, expanded keywords array, openGraph with image/canonical URL, Twitter card, robots with googleBot, alternates/canonical
- Added JSON-LD structured data (SoftwareApplication schema) to layout.tsx head
- Added FAQPage JSON-LD schema with 5 EUDR/coffee traceability questions for "People Also Ask" targeting
- Rewrote landing-page.tsx with all 14 SEO text updates from audit:
  - Badge: "#1 Coffee Traceability & EUDR Compliance Software"
  - H1: "Coffee Traceability Software — Farm to Cup | EUDR Compliant"
  - Hero subheading with "coffee supply chain management" and "EUDR compliant" keywords
  - Features section: "Coffee Supply Chain Software Features"
  - All 8 feature card headings SEO-optimized (e.g. "Farm-to-Cup Coffee Traceability Software", "EUDR Compliance Software & Due Diligence Automation")
  - Stakeholder section: "Coffee Supply Chain Software for Every Stakeholder"
  - All 4 stakeholder headings SEO-optimized with keyword-rich titles
  - Security section: "Enterprise-Grade Coffee Supply Chain Data Security"
  - Architecture section: "Multi-Entity Coffee Supply Chain Architecture"
  - CTA: "Ready to Digitize Your Coffee Supply Chain with EUDR-Compliant Traceability?"
  - Footer: "Coffee Traceability Software · EUDR Compliance Platform · Blockchain Supply Chain · Farm to Cup"
- Added new Global Reach section with country-specific SEO keywords (Vietnam, Brazil, Ethiopia, Kenya)
- Added interactive FAQ section with 5 questions targeting featured snippet rankings
- Enhanced all description paragraphs with keyword density and depth
- Updated robots.txt with sitemap reference and disallow rules for internal pages
- Created sitemap.ts with dynamic sitemap generation (8 URLs including future SEO landing pages)
- TypeScript compilation passes with no errors
- Dev server starts cleanly with no errors

Stage Summary:
- All 14 SEO text updates from audit applied to landing page
- 2 new sections added: Global Reach (country-specific keywords) and FAQ (People Also Ask targeting)
- Full JSON-LD structured data added (SoftwareApplication + FAQPage schemas)
- Metadata fully optimized: title, description, keywords, OpenGraph, Twitter, canonical URL, robots
- robots.txt and sitemap.ts added for crawlability
- All changes compile cleanly, dev server starts without errors
