# Larynx AI — Project Summary & Strategic Overview

**Purpose:** Detailed summary for long-term outlook, commercial viability, and product/technical decisions.

---

## 1. Executive Summary

**Larynx AI** is an AI-powered email assistant for small businesses that:

- **Integrates with Gmail** via Google OAuth 2.0 and Gmail API.
- **Learns the user’s writing style** from sent emails (tone, vocabulary, formality).
- **Monitors the inbox** for new business emails and can auto-generate reply drafts.
- **Uses business context** (inventory/products, pricing, brand) so drafts include accurate offerings and pricing.
- **Produces drafts in the user’s voice** (GPT-4 + tone profile + brand + format/instructions) and stores them for review; the user sends from Gmail.

**Target user:** Small business owners (e.g. event rental, catering, consultants) who spend a lot of time on repetitive, product/pricing/availability email replies.

**Current state:** Functional end-to-end product (auth, onboarding, inbox monitoring, draft generation, inventory, analytics). No payment/subscription layer; Terms of Service reference “subscription and billing” but there is no Stripe or billing implementation. Production domain: `https://larynxai.com` (CORS configured).

---

## 2. Core Capabilities

### 2.1 Authentication & Identity

- **Google OAuth 2.0** (Authlib): Sign-in with Google; scopes include Gmail read + compose.
- **Session-based auth** (Starlette SessionMiddleware, server-side session, 30-day max age).
- **Token storage:** Access + refresh tokens in Supabase `tokens`; automatic refresh when expired; on refresh failure, monitoring is stopped and `token_status` set to `expired`.
- **User record:** `users` table (email, name, profile_image_url, has_onboarded, signature, brand_summary, email_format_template, email_instructions, is_monitoring, token_status, etc.).

### 2.2 Onboarding (First-Time Setup)

Multi-step flow (frontend: `Onboarding.jsx`, routes under `/onboarding/*`):

1. **Brand context**
   - Option A: Enter website URL → backend scrapes site (`/website-scrape`) and derives brand summary.
   - Option B: Manual form (brand name, business description, target audience, industry, mission, differentiators) → `/upload-brand-summary`.
   - Result stored in `users.brand_summary` (and related brand context).

2. **Writing style (tone profile)**
   - Backend crawls **sent** Gmail messages (Gmail API, label SENT, up to 100).
   - Cleans body (strip quotes, signature, URLs, etc.) via `EmailProcessingService` and Talon.
   - If ≥5 usable emails: NLTK-based analysis (vocabulary, sentence length, politeness, emotional tone) → `analyze_email_batch` → `store_tone_profile` in `tone_profiles.tone_data`.
   - If &lt;5: generic “polite professional” tone profile is stored.

3. **Signature**
   - User configures email signature (rich-text editor, `SigEditor.jsx`) → stored in `users.signature`; appended to generated drafts when not already present.

4. **Email format & instructions (optional)**
   - `email_format_template`: example email structure/style for the model to mimic.
   - `email_instructions`: rules (e.g. “Start with Hello!”, “Always include pricing in first paragraph”) → both stored on `users` and injected into the draft prompt.

5. **Inventory/offerings**
   - User can add products/services (name, price, pricing_type, category) manually or via CSV upload (with validation and error reporting).
   - Stored in `inventory` table per user; used for product-aware draft generation and matching.

6. **Finish onboarding**
   - `POST /finish-onboarding` sets `has_onboarded = true`; user is then routed to app home.

### 2.3 Inbox Monitoring & Auto-Draft Generation

- **Start/stop monitoring:** User toggles monitoring; backend sets `users.is_monitoring` and starts/stops a per-user async polling task.
- **Polling:** Backend checks Gmail for new messages after `account_created_at` (or similar), respects rate limits and uses existing “already seen” logic (`drafts` + `filtered_emails` by `message_id`) to avoid reprocessing.
- **Filtering:** Incoming messages are classified to skip non-business (e.g. newsletters, notifications, billing/payment, shipping). Filtered emails are recorded in `filtered_emails` with reason.
- **Processing:** For each new “business” email:
  - Body is cleaned (strip quoted text, signature, etc.).
  - **Inventory matching:** Regex + fuzzy matching (FuzzyWuzzy, Levenshtein, category keywords) extracts product/service requests from the email and matches them to `inventory` (with threshold and generic vs specific handling).
  - **Draft generation:** Same prompt construction as manual draft: tone profile + brand_summary + email_format_template + email_instructions + inventory context + instructions (e.g. “don’t invent products”, “include pricing when matched”). GPT-4 (`gpt-4o`) generates reply text; signature appended if configured.
  - Draft (and metadata) stored in `drafts`; optionally associated with `message_id` for threading.
- **Startup/shutdown:** On backend startup, monitoring is restored for users with `is_monitoring = true`; on shutdown, tasks are cleared.

So: **automated pipeline from “new business email” → “draft saved and available to user”**, with style and business context applied.

### 2.4 Manual Draft Generation

- **Endpoint:** `POST /generate-draft` with subject + body (e.g. from a single email view).
- **Logic:** Same as above: fetch tone profile, user settings (signature, brand, format template, instructions), inventory, run `InventoryMatcher`, build GPT prompt, call OpenAI, append signature, save to `drafts`, return draft (+ optional matched_inventory).
- **Test endpoints:** `/test-inventory-matching` (see what would be matched for a given email), `/test-prompt-preview` (see full prompt that would be sent to GPT).

### 2.5 Inventory / Offerings

- **CRUD:** Add, update, delete items (name, price, pricing_type, category).
- **CSV upload:** Parsing with column detection (name, price, category, pricing_type variants), validation, duplicate handling, error report (e.g. downloadable CSV of errors).
- **Pricing types:** fixed, per_unit, per_hour, per_day, per_week, per_month, per_project, per_event, per_person, starting_at, custom, flat_rate.
- **Usage:** Inventory is used in draft generation (product extraction + fuzzy match → context string for GPT so replies can include accurate products and pricing).

### 2.6 Analytics & Activity

- **Stored metrics:** e.g. total drafts, drafts this week, estimated hours saved, emails processed (total, today, this week), recent_activity list (draft created, inventory add/edit, etc.).
- **Endpoints:** e.g. `GET /analytics`, `GET /analytics/categories` (category-level stats).
- **Frontend:** Analytics dashboard (e.g. `AnalyticsModern.jsx`) and activity feed on home/settings.

### 2.7 Brand & Website Scraping

- **Scrape:** `GET /website-scrape?url=...` — fetches URL, BeautifulSoup-based extraction, derives brand summary for storage.
- **Manual brand:** `POST /upload-brand-summary` (structured fields) → same `store_brand_context` path as scrape.

### 2.8 User Settings & Profile

- **Settings UI:** e.g. `SettingsDashboardClean.jsx`, `SettingsPageModern.jsx` — profile (name, profile image), signature editor, brand summary, email format template, email instructions, and any monitoring toggle.
- **Backend:** Routes for name, profile image, and any settings stored on `users` or related tables.

### 2.9 Legal & Marketing

- **Landing:** `LandingPage.jsx` — value proposition, use cases (e.g. event rental, catering), FAQ, CTA to Google login.
- **Privacy Policy & Terms of Service:** Static pages; Terms reference “subscription and billing” but no billing is implemented.

---

## 3. Architecture & Tech Stack

### 3.1 Backend (Python)

| Layer | Technology |
|-------|------------|
| API | FastAPI |
| Auth | Google OAuth 2.0 (Authlib), Starlette SessionMiddleware |
| DB | Supabase (PostgreSQL) |
| LLM | OpenAI API (gpt-4o) |
| NLP / style | NLTK (tokenize, POS, stopwords), custom analysis (politeness, emotional tone, sentence length) |
| Text / email | Talon (quotations, signature extraction), BeautifulSoup (HTML→text), regex |
| Matching | FuzzyWuzzy, python-Levenshtein, inflect, regex patterns for product/price/quantity |
| HTTP client | httpx (async) |
| Server | Uvicorn |

**Key modules:**

- `main.py`: FastAPI app, CORS (e.g. `https://larynxai.com`), session config, router includes, startup/shutdown for monitoring.
- `routes/`: `auth_routes`, `emailCrawl_routes`, `draft_routes`, `inbox_routes`, `inventory_routes`, `analytics_routes`, `brand_scrape`.
- `services/`: `email_service` (extract body, clean, signature), `config_service`.
- `functions.py`: token refresh, tone analyze/store/fetch, brand scrape/store, email body cleaning.
- `nltk_processor.py`: tokenization, POS, word lists for tone analysis.
- `config.py`: Supabase client, OAuth, env.

### 3.2 Frontend (React)

| Layer | Technology |
|-------|------------|
| Framework | React 18/19, Vite 7 |
| Routing | React Router 7 |
| UI | Tailwind CSS, Framer Motion, Lucide icons, shadcn-style (e.g. button), custom components |
| Data | Fetch with credentials (session cookies), centralized `ApiService` |
| State | React state + contexts (e.g. `UserContext`, `ApiContext`) |
| Auth guard | `AuthGuard` for protected routes |
| Other | xlsx for CSV/Excel, react-helmet for meta |

**Key areas:**

- `App.jsx`: Route set (landing, login, onboarding, settings, inventory, home, analytics, offerings, legal, error pages, some test routes).
- `services/apiService.js`: Base URL from env, GET/POST/PUT/DELETE, error handling, and convenience methods for user, analytics, inventory, drafts, token status, logout, onboarding finish, website scrape.
- Pages: Landing, Login (landing doubles as login), Onboarding, Settings (dashboard/clean/modern), Home (modern), Analytics (modern), Inventory, Offerings (manage offerings/inventory), SigEditor, Privacy/Terms, Error pages.

### 3.3 Data (Supabase / PostgreSQL)

**Relevant tables (from code):**

- **users:** id, email, name, profile_image_url, has_onboarded, signature, brand_summary, email_format_template, email_instructions, is_monitoring, token_status, token_error_reason, last_token_error, account_created_at, etc.
- **tokens:** user_id, access_token, refresh_token, expires_at.
- **tone_profiles:** user_id, tone_data (JSON).
- **inventory:** user_id, name, price, pricing_type, category, etc.
- **drafts:** user_id, created_at, incoming_subject, incoming_body, draft, message_id (when from inbox), etc.
- **filtered_emails:** user_id, message_id, filter_reason, sender, subject, created_at.
- **analytics:** user_id, total_drafts, drafts_this_week, estimated_hours_saved, emails_processed_*, recent_activity (JSON), updated_at, etc.

**Migrations:** e.g. `supabase_migration.sql` adds `email_format_template` and `email_instructions` to `users`.

---

## 4. Current State: Strengths & Gaps

### 4.1 Strengths

- **End-to-end flow:** Sign-up → onboarding (brand, style, signature, inventory) → monitoring or manual draft generation → drafts with correct voice and business context.
- **Differentiation:** Style learning + inventory-aware replies in one product (not just generic AI replies).
- **Solid backend design:** Clear separation of routes, services, and shared functions; async where it matters; token refresh and failure handling.
- **Rich inventory model:** Multiple pricing types, CSV import, validation, and fuzzy matching for real-world product wording.
- **Production-oriented details:** CORS, session lifetime, startup/shutdown of background tasks, retries and filtering for robustness.

### 4.2 Gaps / Risks

- **No monetization:** No Stripe (or other) billing, no plans, no usage limits. Terms mention subscription but nothing is enforced. Revenue model is undefined.
- **Gmail-only:** No Outlook, Apple Mail, or other providers; limits addressable market and enterprise appeal.
- **Email delivery:** Drafts are created and stored; sending is done by the user in Gmail. No “one-click send” or automated send from Larynx (reduces risk but also convenience).
- **Scalability:** Inbox polling is per-user and in-process; no webhooks (Gmail push), no queue/worker pool. Fine for small user counts; will need rework for large scale.
- **Observability:** Logging is present; no clear APM, tracing, or structured metrics for cost/usage (e.g. OpenAI tokens per user).
- **Testing:** Backend has a `TESTING_GUIDE.md` and test scripts; no evidence of full CI/test suite or E2E tests in the summary.
- **Duplicate/legacy UI:** Multiple similar pages (e.g. Settings vs SettingsModern vs SettingsDashboardClean, multiple Home/Analytics variants) suggest ongoing UI consolidation.
- **Token/API cost:** No per-user or per-tenant cost caps; heavy users could drive unbounded OpenAI cost.
- **Compliance:** No explicit mention of SOC2, GDPR (data export/deletion beyond account delete), or industry-specific compliance.

---

## 5. Commercial Viability

### 5.1 Market Fit

- **Problem:** Small businesses lose time on repetitive, product/pricing/availability emails.
- **Solution:** Automated drafts in the user’s voice with correct product and pricing.
- **Evidence of fit:** Product is built and wired to a real domain; onboarding and monitoring are implemented; inventory and tone are first-class. Good foundation to validate willingness to pay.

### 5.2 Revenue Model (To Be Implemented)

Options to decide:

- **Subscription (SaaS):** Monthly/annual per seat (e.g. Solo / Team / Business). Easiest to align with current “account per user” model.
- **Usage-based:** Per draft or per email processed; requires metering and limits; more complex but can suit very small or very large users.
- **Hybrid:** Base subscription + overage or premium features (e.g. more inventory items, priority support).

**Implementation needs:** Billing provider (e.g. Stripe), plan definitions, usage tracking (if usage-based), enforcement (e.g. block or throttle when unpaid/over limit), and alignment of Terms/Privacy with actual billing.

### 5.3 Unit Economics (Conceptual)

- **Costs:** OpenAI (per token), Supabase, hosting, support. Main variable cost is LLM per draft.
- **Revenue:** Zero until pricing is launched.
- **Next step:** Model cost per draft and per active user, then set price floors (e.g. minimum subscription that covers cost + margin).

### 5.4 Competition & Positioning

- **Generic AI assistants:** Don’t learn your style or tie to your catalog; Larynx’s differentiator is “your voice + your products.”
- **CRM / email tools:** Often broader (sales, sequences); Larynx is narrow (inbound business email → draft). Can position as “focused AI for small business email” or as a feature for a larger suite later.
- **Gmail-only:** Limits TAM to Gmail users; multi-provider would expand market and enterprise appeal.

### 5.5 Go-to-Market Readiness

- **Product:** Functional; needs billing and clear “plan”/limits.
- **Landing & legal:** Present; pricing page and signup flow for paid plans missing.
- **Support & ops:** No in-app support or status page evident; needed for paid customers.
- **Trust:** OAuth and “draft only” (no sending without user action) are good for trust; privacy policy and data handling should be explicit for commercial use.

---

## 6. Long-Term Outlook & Recommendations

### 6.1 Product

- **Short term:** Add billing (Stripe), define 1–2 plans, enforce limits (e.g. drafts/month or “inbox monitoring on/off” by plan). Consolidate duplicate frontend routes/pages where possible.
- **Medium term:** Gmail push (webhooks) or queue-based processing to scale; per-user or per-tenant OpenAI caps and basic usage analytics; optional “one-click send” with clear consent.
- **Long term:** Multi-provider (Outlook, etc.), team/workspace (shared inventory, multiple mailboxes), and/or API/embed for CRM/tools.

### 6.2 Technical

- **Short term:** Harden monitoring (retries, backoff, circuit breaker already partially there); add simple usage/token metrics; document runbook and env for production.
- **Medium term:** Structured logging, error tracking (e.g. Sentry), and cost dashboards; consider moving background work to a queue (e.g. Celery/Redis or cloud queue).
- **Long term:** Consider multi-tenant isolation and compliance (GDPR, SOC2) if targeting larger or regulated customers.

### 6.3 Commercial

- **Short term:** Decide revenue model (subscription vs usage vs hybrid) and implement one; add pricing page and plan selection (or free tier + paid).
- **Medium term:** Basic lifecycle (trial → paid → churn), email (e.g. welcome, usage, billing), and simple in-app or email support.
- **Long term:** Sales/partnerships for SMB or verticals (e.g. event rental, catering), or white-label/embed for platforms.

### 6.4 Strategic Summary

| Dimension | Assessment |
|-----------|------------|
| **Product maturity** | High for an MVP: core loop works, differentiation (style + inventory) is clear. |
| **Technical foundation** | Solid; needs scaling and observability for growth. |
| **Commercial readiness** | Low: no billing or pricing; need to ship monetization to test willingness to pay. |
| **Long-term viability** | Strong if: (1) monetization is added and validated, (2) Gmail-first is either monetized successfully or extended to more providers, (3) unit economics are monitored and kept positive. |

**Bottom line:** Larynx is a credible, differentiated AI email assistant for small business with a working product and a clear path to revenue. The main decision is to commit to a revenue model and implement it (billing + limits + pricing page), then iterate on scale, multi-provider, and team/enterprise features based on traction and cost data.

---

*Document generated from codebase review. Reflects structure and behavior as implemented; business and roadmap items are recommendations, not commitments.*
