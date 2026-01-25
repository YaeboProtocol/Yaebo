# Securely Tradable Debts (STD) MVP Specification

## Overview
A platform for tokenizing high-margin manufacturing debt, enabling crypto investors to fund manufacturers and earn real-world yields. MVP focuses on onboarding, diligence, DAO voting, and a mock marketplace.

---

## Roles & Authentication
- **Manufacturer**: Google login
- **Diligence Firm**: Google login (one account)
- **DAO**: Google login (anyone can view proposals); connect wallet to get DAO permissions (create proposals, vote)
- **Investor**: Google login or Wallet connect

---

## User Flows

### Manufacturer
- Onboard via form (see Data Model)
- Upload required docs (PDFs/images)
- Submit application (status: Submitted)
- Dashboard: see application & status (Submitted, Under Review, Needs More Info, Accepted, Rejected)
- If "Needs More Info": can upload more docs, reply to firm comments (flat thread)

### Diligence Firm
- Dashboard: view all applications
- View full application, docs, comments
- Change status (Under Review, Needs More Info, Accepted, Rejected)
- Add comments/files (visible to DAO/manufacturer)
- Create proposal for DAO after acceptance (set lot size, share price, max per investor)
- Mock analytics: # applications, funding rate, avg approval time

### DAO
- Forum dashboard: everyone can view all proposals
- Only DAO members (wallet connected) can create proposals and vote
- Dashboard: see proposals, vote on lot size/share price/max per investor (anonymous, 1 week poll)
- Flat comments on proposals
- After poll, decide on unfunded proposals (refund, extend, partial funding, etc.)

### Investor
- Browse marketplace (see proposals, lots, funding progress)
- Buy lots (milestone = fully funded)
- Dashboard: see investments, status, claimable returns

---

## Data Model (Supabase)

### Manufacturer Application
- Company Info: name, Stellar pubkey, contact, website
- SME Info: name, reg #, jurisdiction, address, website
- Docs: incorporation cert, tax cert, audited financials, business plan, KYC, use-of-proceeds, risk report (PDF/image)
- Inspection: date, inspector name/license, geo, audit report, site photos
- Research: research paper, summary, key metrics, risk score, projections
- Investment Terms: lot price, total lots, max per investor, min period, expected return, use-of-funds breakdown
- Status: enum
- Comments: flat thread, file uploads

### Proposal
- Linked to research
- Proposal summary (what's being funded, amount, profit share, lot size, price, min/max per investor, period)
- Poll options (lot size, share price, max per investor)
- DAO votes (anonymous)
- Comments (flat)
- Status: voting, closed, marketplace

### Marketplace
- Proposals with status=marketplace
- Lots available, lots sold, funding progress (Supabase real-time)

### Investment
- Investor, proposal, lots owned
- Claimable returns (mocked vault, proportional to lots)

### Notifications
- Mock emails logged in dashboard (Notifications tab)

---

## Architecture
- **Frontend**: Next.js, Tailwind, shadcn/ui, Inter V font, responsive (desktop-first)
- **Backend/API**: Next.js API routes
- **Database**: Supabase (Postgres)
- **File Storage**: Supabase Storage (fallback: uploadthing)
- **Real-time**: Supabase real-time for marketplace
- **No smart contracts/payments**: All logic mocked

---

## Data Handling
- All onboarding data stored in DB
- File uploads: PDFs/images, basic type/size checks, stored in Supabase Storage
- No virus scanning or advanced validation
- Vault/unit sales/returns: all mocked, numbers in DB
- No KYC, open market for investors
- No analytics for investors, only for diligence firm (mocked)
- No onboarding/help screens, English only
- Placeholders for branding/assets, Inter V font

---

## Error Handling
- User-friendly error messages for failed uploads, form errors, and API failures
- Fallback to uploadthing if Supabase Storage fails
- Statuses and actions validated server-side
- All critical actions (status changes, purchases) require confirmation modals
- No audit logging for MVP

---

## Out of Scope for MVP
- Real payments/tokenization/smart contracts
- KYC/AML
- Third-party integrations
- Legal/disclaimer screens
- Audit logging
- Analytics for investors
- Multi-user firm accounts
- DAO onboarding interface
- Post-funding updates from manufacturers

---

## Notes
- All logic after DAO approval is mocked
- All notifications are mock emails, logged in dashboard
- Use placeholder avatars/images, Inter V font
- Desktop-first, but responsive

---

**Ready for dev.** 