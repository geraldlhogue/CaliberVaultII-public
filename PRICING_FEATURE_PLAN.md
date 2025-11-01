# CaliberVault Pricing & Feature Segmentation Plan

## Overview
CaliberVault offers a freemium model with four tiers designed to serve individual collectors, serious enthusiasts, professionals, and enterprises.

---

## Tier Comparison

| Feature | Free | Pro | Business | Enterprise |
|---------|------|-----|----------|------------|
| **Price** | $0/mo | $9.99/mo | $29.99/mo | Custom |
| **Inventory Items** | 50 | Unlimited | Unlimited | Unlimited |
| **Photo Storage** | 500 MB | 10 GB | 100 GB | Unlimited |
| **Users** | 1 | 1 | 5 | Unlimited |
| **Cloud Backups** | Manual only | Auto (1/day) | Auto (hourly) | Real-time sync |
| **Cloud Providers** | 1 | 3 | All 6 | All 6 + Custom |
| **AI Valuation** | 5/month | 50/month | Unlimited | Unlimited |
| **Barcode Scanning** | ✓ | ✓ | ✓ | ✓ |
| **Batch Operations** | ✗ | ✓ | ✓ | ✓ |
| **Advanced Reports** | Basic | ✓ | ✓ | ✓ |
| **Custom Reports** | ✗ | ✗ | ✓ | ✓ |
| **API Access** | ✗ | ✗ | ✓ | ✓ |
| **Webhooks** | ✗ | ✗ | ✓ | ✓ |
| **Team Collaboration** | ✗ | ✗ | ✓ | ✓ |
| **Role-Based Access** | ✗ | ✗ | ✓ | ✓ |
| **Audit Logs** | 7 days | 30 days | 1 year | Unlimited |
| **Email Support** | ✗ | ✓ | Priority | 24/7 |
| **Phone Support** | ✗ | ✗ | ✗ | ✓ |
| **White Label** | ✗ | ✗ | ✗ | ✓ |
| **Custom Integrations** | ✗ | ✗ | ✗ | ✓ |
| **SLA** | None | 99% | 99.5% | 99.9% |

---

## Detailed Feature Breakdown

### FREE TIER - "Starter"
**Target**: Casual collectors, trying the app

**Included Features**:
- ✓ Up to 50 inventory items
- ✓ 500 MB photo storage
- ✓ Basic barcode scanning
- ✓ Manual CSV import/export
- ✓ 1 cloud storage connection (choose one)
- ✓ Basic reports (inventory list, value summary)
- ✓ Mobile app access
- ✓ 5 AI valuations per month
- ✓ Basic search and filters
- ✓ 7-day audit log retention
- ✓ Community support (forums)

**Limitations**:
- ✗ No automatic backups
- ✗ No batch operations
- ✗ No team features
- ✗ No API access
- ✗ Limited AI valuations

**Conversion Strategy**: Show "Upgrade to Pro" prompts when:
- User reaches 40+ items (80% of limit)
- User attempts batch operations
- User wants more cloud providers
- User needs more AI valuations

---

### PRO TIER - "Enthusiast"
**Target**: Serious collectors, small dealers
**Price**: $9.99/month or $99/year (save 17%)

**Everything in Free, plus**:
- ✓ Unlimited inventory items
- ✓ 10 GB photo storage
- ✓ Automatic daily backups
- ✓ 3 cloud storage providers
- ✓ 50 AI valuations per month
- ✓ Batch operations (bulk edit, delete, export)
- ✓ Advanced search with saved filters
- ✓ Custom categories and fields
- ✓ QR code label printing
- ✓ Advanced reports (trends, analytics)
- ✓ Email notifications
- ✓ 30-day audit log retention
- ✓ Email support (48hr response)
- ✓ Priority feature requests

**Use Cases**:
- Collectors with 50-500 items
- Part-time dealers
- Range officers managing club inventory
- Gunsmiths tracking customer firearms

---

### BUSINESS TIER - "Professional"
**Target**: FFL dealers, ranges, gunsmiths, teams
**Price**: $29.99/month or $299/year (save 17%)

**Everything in Pro, plus**:
- ✓ 100 GB photo storage
- ✓ Automatic hourly backups
- ✓ All 6 cloud storage providers
- ✓ Unlimited AI valuations
- ✓ Up to 5 team members
- ✓ Team collaboration features
- ✓ Role-based access control
- ✓ Custom report builder
- ✓ API access (10,000 calls/month)
- ✓ Webhook integrations
- ✓ Advanced analytics dashboard
- ✓ Compliance document management
- ✓ Insurance integration
- ✓ 1-year audit log retention
- ✓ Priority email support (24hr response)
- ✓ Video call support (scheduled)

**Use Cases**:
- FFL dealers with multiple employees
- Shooting ranges with rental inventory
- Gunsmith shops with customer tracking
- Small security companies
- Auction houses

---

### ENTERPRISE TIER - "Custom"
**Target**: Large dealers, manufacturers, law enforcement
**Price**: Custom (starting at $299/month)

**Everything in Business, plus**:
- ✓ Unlimited photo storage
- ✓ Real-time sync across all devices
- ✓ Unlimited team members
- ✓ Advanced role permissions (custom roles)
- ✓ Unlimited API calls
- ✓ Custom integrations (built for you)
- ✓ White-label option (your branding)
- ✓ Dedicated database instance
- ✓ SSO/SAML authentication
- ✓ Advanced security features
- ✓ Unlimited audit log retention
- ✓ Custom SLA (99.9% uptime)
- ✓ 24/7 phone support
- ✓ Dedicated account manager
- ✓ Custom feature development
- ✓ On-premise deployment option
- ✓ Training and onboarding

**Use Cases**:
- Large FFL dealers (multiple locations)
- Firearms manufacturers
- Law enforcement agencies
- Military armories
- Large security firms
- Museum collections

---

## Pricing Psychology

### Annual Discount
- Monthly: Full price
- Annual: 17% discount (2 months free)
- Encourages commitment and reduces churn

### Pricing Rationale
- **Free**: Loss leader, builds user base
- **Pro ($9.99)**: Below typical SaaS ($15-20), impulse buy territory
- **Business ($29.99)**: Standard B2B SaaS pricing, ROI-focused
- **Enterprise (Custom)**: Value-based pricing, negotiated

### Competitive Analysis
- **Competitors**: $15-50/month for similar features
- **CaliberVault**: More affordable, better features
- **Differentiation**: Specialized for firearms, not generic inventory

---

## Implementation Roadmap

### Phase 1: Infrastructure (Weeks 1-2)
- [ ] Add `subscription_tier` column to users table
- [ ] Create `subscriptions` table (tier, start_date, end_date, status)
- [ ] Implement tier checking middleware
- [ ] Add feature flags system

### Phase 2: Payment Integration (Weeks 3-4)
- [ ] Integrate Stripe (recommended) or Paddle
- [ ] Create checkout flows for each tier
- [ ] Implement subscription management dashboard
- [ ] Add payment webhooks for subscription events
- [ ] Build cancellation/downgrade flows

### Phase 3: Feature Gating (Weeks 5-6)
- [ ] Implement item count limits
- [ ] Implement storage quota checks
- [ ] Gate batch operations
- [ ] Gate API access
- [ ] Gate team features
- [ ] Add upgrade prompts throughout app

### Phase 4: Admin & Analytics (Week 7)
- [ ] Build admin dashboard for subscription management
- [ ] Add MRR/ARR tracking
- [ ] Implement churn analytics
- [ ] Add usage metrics per tier
- [ ] Build customer success tools

### Phase 5: Marketing (Week 8)
- [ ] Create pricing page
- [ ] Build comparison charts
- [ ] Add testimonials
- [ ] Create upgrade email campaigns
- [ ] Launch referral program

---

## Revenue Projections

### Conservative Scenario (Year 1)
- 1,000 Free users (0 revenue)
- 100 Pro users × $9.99 = $999/mo
- 20 Business users × $29.99 = $600/mo
- 2 Enterprise users × $300 = $600/mo
- **Total MRR**: $2,199
- **Total ARR**: $26,388

### Moderate Scenario (Year 1)
- 5,000 Free users
- 500 Pro users × $9.99 = $4,995/mo
- 100 Business users × $29.99 = $2,999/mo
- 10 Enterprise users × $400 = $4,000/mo
- **Total MRR**: $11,994
- **Total ARR**: $143,928

### Optimistic Scenario (Year 1)
- 20,000 Free users
- 2,000 Pro users × $9.99 = $19,980/mo
- 400 Business users × $29.99 = $11,996/mo
- 50 Enterprise users × $500 = $25,000/mo
- **Total MRR**: $56,976
- **Total ARR**: $683,712

---

## Conversion Optimization

### Free → Pro Conversion Tactics
1. **Item limit warning** at 40 items (80%)
2. **Batch operation teaser**: "Upgrade to edit 10 items at once"
3. **AI valuation limit**: "You've used 5/5 valuations this month"
4. **Backup reminder**: "Your data isn't backed up automatically"
5. **Feature discovery**: Show Pro features with lock icons

### Pro → Business Conversion Tactics
1. **Team invitation**: "Add team members with Business"
2. **API access**: "Integrate with your POS system"
3. **Storage warning**: "You're using 8/10 GB"
4. **Advanced reports**: Tease custom report builder
5. **Compliance needs**: "Manage ATF compliance documents"

### Business → Enterprise Conversion Tactics
1. **Scale needs**: "Need more than 5 team members?"
2. **Custom features**: "Request custom integrations"
3. **White label**: "Rebrand CaliberVault for your business"
4. **SLA requirements**: "Need guaranteed uptime?"
5. **Direct outreach**: Sales team contacts high-usage accounts

---

## Retention Strategies

### Prevent Churn
1. **Usage monitoring**: Alert when usage drops 50%
2. **Win-back emails**: Offer discount to return
3. **Exit surveys**: Understand why users leave
4. **Feature education**: Ensure users know all features
5. **Customer success**: Proactive check-ins for Business+

### Increase LTV (Lifetime Value)
1. **Annual upgrades**: Push annual plans (lower churn)
2. **Feature expansion**: Regularly add new features
3. **Community building**: Forums, user groups, events
4. **Integrations**: More integrations = more stickiness
5. **Data lock-in**: More data = harder to leave

---

## Legal & Compliance

### Required Pages
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Refund Policy (30-day money-back guarantee)
- [ ] Subscription Agreement
- [ ] Data Processing Agreement (GDPR)

### Payment Processing
- **Recommended**: Stripe (easiest, best docs)
- **Alternative**: Paddle (handles VAT/tax globally)
- **Avoid**: Building your own (PCI compliance nightmare)

### Tax Considerations
- Sales tax varies by state (Stripe handles this)
- VAT for EU customers (Paddle handles this)
- Consult with accountant for your jurisdiction

---

## Metrics to Track

### Key Metrics
- **MRR** (Monthly Recurring Revenue)
- **ARR** (Annual Recurring Revenue)
- **Churn Rate** (monthly %)
- **LTV** (Lifetime Value per customer)
- **CAC** (Customer Acquisition Cost)
- **LTV:CAC Ratio** (should be 3:1 or higher)

### Conversion Metrics
- Free → Pro conversion rate (target: 5-10%)
- Pro → Business conversion rate (target: 10-15%)
- Free trial → Paid conversion (target: 20-30%)
- Annual vs Monthly split (target: 40% annual)

### Usage Metrics
- Items per user (by tier)
- Storage used (by tier)
- API calls (Business/Enterprise)
- Feature adoption rates
- Active users (DAU/MAU)

---

## Next Steps

1. **Validate pricing**: Survey existing users
2. **Build MVP**: Start with Free + Pro only
3. **Integrate payments**: Stripe checkout
4. **Launch soft**: Beta test with 50 users
5. **Iterate**: Adjust pricing based on data
6. **Scale**: Add Business tier after 100 paid users
7. **Enterprise**: Add when you have 10+ Business customers asking

**Timeline**: 8-12 weeks to full launch
**Investment**: ~$500 (Stripe fees, legal templates)
**Expected ROI**: Break-even at ~30 Pro subscribers
