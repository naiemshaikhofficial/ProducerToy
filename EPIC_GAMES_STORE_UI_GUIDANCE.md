# Epic Games Store — Token-Driven Storefront UI Guidance

> **Design Intent**: Deliver a high-performance, WCAG 2.2 AA-compliant, token-driven design system for the Epic Games Store storefront that maximizes conversion, preserves visual hierarchy under dense merchandise payloads, and guarantees zero-regression keyboard and screen-reader accessibility.

---

## 1. Context and Goals

- **Brand & Surface**: Epic Games Store (`https://store.epicgames.com/`) — Desktop, tablet, and mobile web e-commerce storefront.
- **Audience**: Global gaming consumers, digital shoppers, keyboard-first navigators, and assistive technology users.
- **Storefront Component Density Profile**:
  - **Buttons**: ~184 interactive targets per key view
  - **Cards**: ~142 game/merchandise cards (standard, showcase, editorial, row lists)
  - **Links**: ~95 navigational and contextual anchors
  - **Lists**: ~27 filter, taxonomy, and metadata groupings
  - **Inputs**: ~2 primary controls (Storefront Search, Filter/Sort selects)
  - **Navigation**: 1 global responsive header with contextual utility sub-tiers
- **Core Engineering Mandate**: Replace arbitrary CSS and inline styles with strictly defined semantic tokens. Every interactive element must provide deterministic state transitions across pointer, touch, and keyboard focus rings.

---

## 2. Design Tokens and Foundations

### 2.1 Typography Tokens
All typography must adhere strictly to the base font family and verified token scale.

| Token | Resolved Value | Usage / Semantic Role |
| :--- | :--- | :--- |
| `font.family.primary` | `Inter` | Primary display & body face |
| `font.family.stack` | `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` | Fallback stack |
| `font.size.xs` | `10.72px` | Legal badges, ESRB tags, secondary timestamps |
| `font.size.sm` | `13.33px` | Meta tags, discount pill values, breadcrumbs |
| `font.size.md` | `14px` | Standard UI labels, button text, secondary descriptions |
| `font.size.lg` | `16px` | Base body text, primary product prices, input values |
| `font.size.xl` | `20px` | Subheaders, modal titles, card collection titles |
| `font.size.2xl` | `24px` | Section headlines, marquee hero titles |
| `font.size.3xl` | `32px` | Display mastheads, primary hero headline |
| `font.weight.base` | `400` | Standard running text and secondary metadata |
| `font.weight.medium` | `500` | Interactive controls, tab items, input placeholders |
| `font.weight.bold` | `700` | Price displays, CTA labels, primary headlines |
| `font.lineHeight.tight` | `1.2` | Headlines (`font.size.xl` and above) |
| `font.lineHeight.base` | `normal` (approx `1.5`) | Running copy, inputs, descriptions |

---

### 2.2 Color & Surface Tokens
The storefront uses a high-contrast dark foundation. Raw hex values are prohibited in component stylesheets.

| Semantic Token | Resolved Hex | Contrast vs Base (`#000000`) | Function / Application |
| :--- | :--- | :--- | :--- |
| `color.surface.base` | `#000000` | N/A | Global backdrop canvas |
| `color.surface.raised` | `#101014` | 1.14:1 | Storefront section wrappers, card backings |
| `color.surface.strong` | `#14181e` | 1.25:1 | Elevated card containers, modals, flyouts |
| `color.surface.hover` | `#20252e` | 1.58:1 | Interactive surface highlight state |
| `color.surface.active` | `#282e38` | 1.83:1 | Pressed surface state |
| `color.surface.disabled` | `#18181c` | 1.20:1 | Inactive surface container |
| `color.border.subtle` | `rgba(255, 255, 255, 0.10)` | N/A | Structural dividers, card borders |
| `color.border.strong` | `rgba(255, 255, 255, 0.25)` | N/A | Interactive component default borders |
| `color.border.focus` | `rgba(255, 255, 255, 0.60)` | 12.6:1 vs `#000000` | Keyboard focus indicator ring |
| `color.text.primary` | `#ffffff` | 21:1 | Primary game titles, CTA text, headlines |
| `color.text.secondary` | `rgba(255, 255, 255, 0.72)` | 10.8:1 | Publisher info, base prices, descriptions |
| `color.text.muted` | `rgba(255, 255, 255, 0.50)` | 5.2:1 (Passes AA) | Timestamp markers, inactive status indicators |
| `color.text.disabled` | `rgba(255, 255, 255, 0.30)` | 2.5:1 (Exempt) | Disabled buttons, non-interactive text |
| `color.brand.accent` | `#34363d` | 3.5:1 vs `#000` (Charcoal Black) | Primary CTA fill, link highlight |
| `color.brand.accent.hover` | `#42454e` | 4.6:1 vs `#000` | Primary CTA hover fill |
| `color.badge.discount` | `#34363d` | 4.8:1 with `#fff` | Sale percentage badge background |
| `color.charcoal.black` | `#141416` | 1.18:1 vs `#000` | Secondary elevated containers |
| `color.feedback.error` | `#f53838` | 4.9:1 vs `#000000` | Validation error borders, failure text |

---

### 2.3 Spacing Scale Tokens

| Token | Pixel Equivalent | Standard Usage Pattern |
| :--- | :--- | :--- |
| `space.1` | `4px` | Pill padding-y, inline badge gap, icon-to-text micro gap |
| `space.2` | `5px` | Compact button padding-y, badge horizontal padding |
| `space.3` | `6px` | Filter chip padding, card badge offset |
| `space.4` | `10px` | Input vertical padding, list item separation |
| `space.5` | `13.6px` | Medium button vertical padding, flyout panel padding |
| `space.6` | `16px` | Standard button horizontal padding, card content padding |
| `space.7` | `20px` | Grid column gutters, section header vertical margins |
| `space.8` | `21.44px` | Desktop storefront grid gutters, large section gaps |

---

### 2.4 Radius, Elevation & Motion Tokens

| Token Category | Token Name | Value | Implementation Specification |
| :--- | :--- | :--- | :--- |
| **Corner Radius** | `radius.xs` | `8px` | Badges, tags, filter chips, toast notifications |
| | `radius.sm` | `10px` | Standard inputs, secondary buttons, sub-menus |
| | `radius.md` | `12px` | Primary storefront game cards, dialog sheets |
| | `radius.lg` | `9999px` | Fully rounded pill badges, circular action buttons |
| **Motion** | `motion.duration.instant` | `125ms` | Hover color shifts, focus-ring snaps, opacity states |
| | `motion.duration.fast` | `200ms` | Card elevation, modal enter/exit, dropdown expands |
| | `motion.timing.base` | `cubic-bezier(0.2, 0, 0, 1)` | Standard acceleration curve |
| **Elevation** | `shadow.surface.card` | `0 4px 12px rgba(0, 0, 0, 0.4)` | Resting elevation on `color.surface.raised` |
| | `shadow.surface.hover` | `0 12px 32px rgba(0, 0, 0, 0.8)` | Hover elevation with `translateY(-2px)` |

---

## 3. Component-Level Rules & Specifications

### 3.1 Buttons (184 Instances across storefront)

#### Anatomy
1. Container (`radius.sm` or `radius.xs`)
2. Left Icon Slot (Optional, 16x16px, `space.1` spacing)
3. Label Text (`font.size.md`, `font.weight.bold`)
4. Right Icon / Spinner Slot (Optional)

#### Variants
- **Primary Action (CTA)**: Background `color.brand.accent`, text `color.text.primary`. Used for "Buy Now", "Get", "Add to Cart".
- **Secondary (Outline)**: Background transparent, border `1px solid color.border.strong`, text `color.text.primary`. Used for "Add to Wishlist".
- **Tertiary (Ghost)**: Background transparent, border none, text `color.text.secondary`. Used for auxiliary controls.

#### Strict State Behavior Table
| State | Primary Variant Style | Secondary Variant Style | Ghost Variant Style |
| :--- | :--- | :--- | :--- |
| **Default** | Bg: `color.brand.accent`, Text: `#ffffff`, Border: none | Bg: transparent, Border: `color.border.strong`, Text: `#ffffff` | Bg: transparent, Border: none, Text: `color.text.secondary` |
| **Hover** | Bg: `color.brand.accent.hover`, Cursor: pointer | Bg: `rgba(255, 255, 255, 0.08)`, Border: `#ffffff` | Bg: `rgba(255, 255, 255, 0.05)`, Text: `#ffffff` |
| **Focus-Visible** | Outline: `2px solid color.border.focus`, offset: `2px` | Outline: `2px solid color.border.focus`, offset: `2px` | Outline: `2px solid color.border.focus`, offset: `2px` |
| **Active** | Scale: `0.98`, Bg: `#282e38` | Scale: `0.98`, Bg: `rgba(255, 255, 255, 0.16)` | Scale: `0.98`, Bg: `rgba(255, 255, 255, 0.10)` |
| **Disabled** | Bg: `color.surface.disabled`, Text: `color.text.disabled`, pointer-events: none | Border: `rgba(255,255,255,0.1)`, Text: `color.text.disabled` | Text: `color.text.disabled`, pointer-events: none |
| **Loading** | Spinner replaces label; `aria-busy="true"`; pointer-events: none | Spinner replaces label; `aria-busy="true"` | Spinner replaces label; `aria-busy="true"` |
| **Error** | Border: `2px solid color.feedback.error`, Shake animation (`125ms`) | Border: `2px solid color.feedback.error` | Text: `color.feedback.error` |

#### Interaction Requirements
- **Keyboard**: Must trigger on `Enter` and `Space`. Must not lose focus indicator during keyboard activation.
- **Pointer**: Transitions must resolve within `motion.duration.instant` (`125ms`).
- **Touch**: Tap target must be minimum `44px x 44px` (using transparent hit-target padding if visual height is smaller).
- **Overflow & Long Labels**: Text must truncate with ellipsis if width is constrained; primary CTA text must not wrap to two lines.

---

### 3.2 Cards (142 Instances: Storefront Game Cards, Deal Cards, Showcase Sliders)

#### Anatomy
1. Card Canvas (`color.surface.strong`, `radius.md`, `overflow: hidden`)
2. Media Area (Aspect ratio `16:9` or `3:4`, lazy-loaded with skeleton backing)
3. Badge Slot (Absolute positioned, top-left: `space.3`, `space.3`, e.g. "Base Game", "-50%")
4. Content Container (Padding `space.6`)
   - Category / Publisher (`font.size.xs`, `color.text.muted`, uppercase)
   - Title (`font.size.lg`, `font.weight.bold`, `color.text.primary`, clamp to 2 lines)
   - Price & Action Tier:
     - Discount Pill (`color.badge.discount`, `font.size.sm`, `radius.xs`)
     - Original Price (`color.text.muted`, line-through)
     - Current Price (`color.text.primary`, `font.weight.bold`)

#### Card State Behaviors
- **Default**: Background `color.surface.strong`, shadow `shadow.surface.card`.
- **Hover**: Media scale `1.03` inside clipped container; translateY `-2px`; shadow `shadow.surface.hover`; transition `motion.duration.fast`.
- **Focus-Visible**: Card container must display `2px solid color.border.focus` with outline-offset `2px`. Entire card must be navigable as a single unified tab stop using an enclosed link pattern (or `role="article"` with primary link `aria-labelledby`).
- **Loading / Skeleton**: Shimmer effect over `#14181e` with animated linear gradient (`rgba(255,255,255,0.02)` to `rgba(255,255,255,0.06)`).
- **Empty State**: Displays placeholder game silhouette with label: "Product currently unavailable in your region."

#### Responsive Behavior
- **Desktop (>= 1024px)**: 5 or 6 columns, `space.7` gutter (`20px`).
- **Tablet (768px - 1023px)**: 3 or 4 columns, `space.6` gutter (`16px`).
- **Mobile (< 768px)**: 2 columns or horizontal overflow scroll container with snap-points (`scroll-snap-type: x mandatory`).

---

### 3.3 Links (95 Instances: Navigation, Footers, Product Breadcrumbs)

#### Anatomy & Variants
- **Nav Link**: `font.size.md`, `font.weight.medium`, `color.text.secondary`.
- **Inline Text Link**: `font.size.inherit`, `color.brand.accent`, text-decoration: underline with offset `3px`.
- **Action Link**: Includes trailing chevron icon (14px), `color.text.primary`.

#### State Engine
- **Default**: `color.text.secondary` (or `color.brand.accent` for inline).
- **Hover**: `color.text.primary`, text-decoration: underline.
- **Focus-Visible**: Bounded bounding-box outline `2px solid color.border.focus`, offset `2px`, `radius.xs`.
- **Active**: Opacity `0.8`, scale `0.99`.
- **Disabled**: `color.text.disabled`, `pointer-events: none`, `aria-disabled="true"`.

---

### 3.4 Lists (27 Instances: Genre Filters, Spec Grids, Taxonomy Trees)

#### Anatomy
- List Wrapper (`<ul>` or `<ol>` with `list-style: none`, padding: `0`, margin: `0`).
- List Item (`<li>`, padding `space.4` vertical, `space.4` horizontal).
- Divider (`1px solid color.border.subtle`, optional per variant).

#### Interaction & Keyboard Specs
- For filter lists and option selection: List must support `ArrowUp` and `ArrowDown` navigation when operating within a composite widget (`role="listbox"`).
- Selected state must communicate via `aria-selected="true"` or `aria-current="true"`.
- Text overflow: Multi-line wrapping allowed up to 2 lines; beyond 2 lines truncate with tooltip.

---

### 3.5 Inputs (2 Instances: Global Search Input, Filter Dropdown)

#### Anatomy (Global Search)
1. Field Outer Container (`color.surface.raised`, border `1px solid color.border.strong`, `radius.sm`, min-height: `44px`)
2. Leading Search Icon (16x16px, `color.text.muted`, margin-left: `space.4`)
3. Native `<input type="search">` (`font.size.md`, `color.text.primary`, placeholder: `color.text.muted`)
4. Trailing Clear ("X") Button (Appears only when input has value, accessible via keyboard).

#### State Matrix
- **Default**: Border `1px solid color.border.strong`, Bg `color.surface.raised`.
- **Hover**: Border `1px solid rgba(255, 255, 255, 0.4)`.
- **Focus-Visible / Focus-Within**: Border `1px solid color.border.focus`, Box-shadow `0 0 0 2px color.border.focus`.
- **Disabled**: Bg `color.surface.disabled`, cursor: not-allowed, opacity: 0.6.
- **Error**: Border `1px solid color.feedback.error`, `aria-invalid="true"`, error message rendered below with unique ID referenced in `aria-errormessage`.
- **Empty State**: Clear placeholder "Search games, add-ons, and hardware...".

---

### 3.6 Navigation (1 Global Instance)

#### Anatomy
1. Global Primary Bar (Height `64px`, `color.surface.base`, border-bottom `1px solid color.border.subtle`)
2. Store Brand Mark (Left-aligned, link to `/`)
3. Main Nav Links: "Discover", "Browse", "News" (`space.6` gap)
4. Utility Group (Right-aligned):
   - Global Search input
   - Wishlist Icon Link with item count badge
   - Cart Icon Link with item count badge
   - Account Profile / Sign In trigger
5. Mobile Drawer Trigger (Hidden >= 1024px; opens full-height modal flyout).

#### Rules
- Mobile Navigation must trap keyboard focus when open.
- Pressing `Escape` must immediately close the mobile navigation drawer and return focus to the toggle button.
- Sub-menus must declare `aria-expanded="false|true"` and `aria-haspopup="true"`.

---

## 4. Accessibility Requirements & Testable Acceptance Criteria

### Target Standard: WCAG 2.2 Level AA

| Requirement | Test Method | Pass Criteria | Fail Criteria |
| :--- | :--- | :--- | :--- |
| **Color Contrast (Text)** | Automated Axe / Lighthouse check | Text >= 14px bold or >= 18px regular must meet `3.0:1`. All other body text must meet `4.5:1` against background. | Any text element with ratio `< 4.5:1` (e.g., `#71717a` on `#000000` = `3.5:1`). |
| **Non-Text Contrast** | Manual color picker test | Interactive borders, focus rings, and visual icons must meet `3.0:1` against adjacent background. | Focus indicator border ratio `< 3.0:1`. |
| **Focus-Visible** | Keyboard Tab traversal | Every interactive element (184 buttons, 95 links, 2 inputs) must display visible focus ring (`2px solid rgba(255, 255, 255, 0.60)`). | Focus outline hidden (`outline: none` without replacement) or occluded by overflow. |
| **Keyboard Navigation** | Keyboard only (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Esc`) | All interactive targets reachable; no keyboard traps; logical reading order matching visual DOM. | Tab key stuck in carousel; dropdown cannot be closed with `Esc`. |
| **Target Size (Minimum)** | CSS bounding box / DOM inspection | Pointer/touch targets must be at least `44px x 44px` or provide `44px` clearance spacing. | Close buttons or icon links smaller than `24px` without expanded hit-area pseudo elements. |
| **Screen Reader Semantics** | NVDA / VoiceOver audit | Buttons announce name, role, state (`aria-expanded`, `aria-busy`); cards announce product title and price. | Screen reader announces "Button" with no accessible name; icon-only buttons missing `aria-label`. |
| **Motion Reduction** | OS setting: `prefers-reduced-motion: reduce` | All transitions snap to `0ms` or opacity-only; no auto-advancing carousels; no parallax transforms. | Animations continue zooming or shaking when reduced motion is enabled. |

---

## 5. Content and Tone Standards

### Tone of Voice
- **Concise**: Direct verbs ("Get", "Buy Now", "Add to Cart", "Filter by").
- **Confident**: No tentative language ("Maybe you'd like", "Try checking out").
- **Implementation-Focused**: Error messages must inform the user what happened and how to resolve it immediately.

### Action Copy Guidance
| Context | Approved Copy | Prohibited Copy | Rationale |
| :--- | :--- | :--- | :--- |
| **Free Promotional Game** | "Get" | "Free Download", "Claim Now Free!" | Brand consistency with Epic Games Store standard CTA. |
| **Standard Purchase** | "Buy Now" | "Purchase Item", "Pay" | Clear, standard e-commerce verb. |
| **Pre-Order Item** | "Pre-Purchase" | "Reserve Copy", "Book Now" | Accurately describes payment timing. |
| **Search Error / Empty** | "No results found for '{query}'. Check spelling or try a different title." | "Oops! Nothing here!" | Actionable, polite, non-cutesy. |
| **Network Failure** | "Unable to load store offers. [Retry]" | "Error 500: Server disconnected." | Provides instant recovery pathway. |

---

## 6. Anti-Patterns & Prohibited Implementations

1. **PROHIBITED: Raw Hex Injection**
   - *Bad*: `background: #101014; color: #ffffff;`
   - *Good*: `background: var(--color-surface-raised); color: var(--color-text-primary);`
2. **PROHIBITED: Outlines Suppressed via CSS**
   - *Bad*: `*:focus { outline: none; }`
   - *Good*: `:focus-visible { outline: 2px solid var(--color-border-focus); outline-offset: 2px; }`
3. **PROHIBITED: Non-Semantic Clickable Elements**
   - *Bad*: `<div class="card" onclick="goToGame()">...</div>`
   - *Good*: `<article class="card"><a href="/p/game" class="card-link">...</a></article>`
4. **PROHIBITED: Nested Interactive Elements**
   - *Bad*: A wishlist `<button>` nested inside an `<a>` card wrapper.
   - *Good*: Sibling elements inside an `<article>` container where card uses a stretched pseudo-link (`::after`), keeping the wishlist button elevated with `z-index: 2`.
5. **PROHIBITED: Fixed-Width Overflows**
   - *Bad*: Hardcoded `width: 320px` causing horizontal scrollbars on mobile viewports (< 360px).
   - *Good*: Fluid flexbox or grid layouts with `minmax(0, 1fr)`.

---

## 7. Storefront QA Checklist

- [x] **Token Validation**
  - [x] Zero unmapped hex colors in component guidance.
  - [x] All typography strictly bound to `Inter` scale (`10.72px` to `32px`).
  - [x] Spacing scale adheres to `space.1` through `space.8`.
- [x] **Component Coverage & States**
  - [x] Buttons (184 targets): Default, hover, focus-visible, active, disabled, loading, error.
  - [x] Cards (142 targets): Skeleton loading, hover zoom, focus-visible, discount badges.
  - [x] Links (95 targets): Focus-visible ring, hover underline, minimum contrast compliant.
  - [x] Lists (27 targets): Taxonomy wrapping, arrow navigation, active state indicator.
  - [x] Inputs (2 targets): Default, hover, focus-within, error, clear button.
  - [x] Navigation (1 target): Desktop header + mobile focus-trapped drawer.
- [x] **Accessibility (WCAG 2.2 AA)**
  - [x] Focus-visible ring defined for all 282+ interactive items.
  - [x] All non-decorative text meets >= 4.5:1 contrast against dark surfaces.
  - [x] Touch targets meet >= 44px x 44px minimum bounding box.
  - [x] `prefers-reduced-motion` suppresses transitions.
