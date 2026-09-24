# ELITE E-COMMERCE & AUDIO PRODUCT SEO STANDARD

Whenever building or modifying product pages, category hubs, or metadata:

1. **Title Tag Optimization (Strict 55–60 Chars)**:
   - Free Items: `[Name] - Free [Type] Download ([Brand]) | Producer Toy`
   - Paid Items: `[Name] by [Brand] - [Type] Download | Producer Toy`
   - Never allow titles to exceed 60 characters or duplicate brand names.

2. **Strict HTML Cleaning for Meta Descriptions**:
   - Always strip HTML tags and decode entities before slicing.
   - Clamp description to 155–160 characters.
   - End with a high-intent CTA (`Instant direct download • 100% royalty-free • FL Studio & Ableton ready`).

3. **Google Merchant Digital Compliance (JSON-LD)**:
   - Non-physical/digital goods MUST use:
     `returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted'` with `merchantReturnDays: 0`.
   - Never use physical return policies (`ReturnByMail`) for digital downloads.
   - Provide zero-day handling/transit time in `OfferShippingDetails`.

4. **Multi-Rich Snippet SERP Real Estate**:
   - In addition to `Product` / `SoftwareApplication`, always inject server-rendered `FAQPage` schema on product pages.
   - When product contains YouTube demo/trailer, inject `VideoObject` schema (`thumbnailUrl`, `embedUrl`, `uploadDate`).
   - When audio preview is available, inject `AudioObject` schema.

5. **Visible Semantic Navigation**:
   - Every `BreadcrumbList` schema MUST have a matching accessible DOM `<nav aria-label="Breadcrumb">` on the page.

6. **AI Search (LLM-SEO) & Crawl Budget**:
   - Maintain `public/llms.txt` adhering to the llms.txt standard.
   - In `robots.ts`, explicitly allow AI crawlers (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`).
   - Block duplicate parameter URLs (`/*?sort=*`, `/*?filter=*`, `/*?brand=*`) to preserve crawl budget.
