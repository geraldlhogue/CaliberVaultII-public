# Pricing Tier Implementation Plan

## Current Status: ⚠️ INFRASTRUCTURE READY, ENFORCEMENT MISSING

### What Exists ✅
- `subscriptions` table with proper structure
- Stripe integration (create-checkout-session, stripe-webhook functions)
- PricingPlans UI component
- useSubscription hook (checks subscription status)
- SubscriptionBanner component
- SubscriptionGuard component (placeholder logic)

### What's Missing ⚠️
- Feature gating based on plan type
- Item count limits per tier
- Premium feature restrictions
- Tier-specific UI elements

---

## Pricing Tiers (From Previous Analysis)

### 🆓 FREE TIER
**Price**: $0/month  
**Limits**:
- 50 items max
- Basic inventory tracking
- 1 location
- CSV export only
- Community support

### 💼 BASIC TIER ($9.99/month)
**Features**:
- 500 items
- 5 locations
- Barcode scanning
- PDF reports
- Email support
- Basic analytics

### 🚀 PRO TIER ($29.99/month)
**Features**:
- Unlimited items
- Unlimited locations
- AI valuation
- Advanced analytics
- Cloud storage sync
- Priority support
- Team collaboration (3 users)

### 🏢 ENTERPRISE TIER ($99.99/month)
**Features**:
- Everything in Pro
- Unlimited team members
- API access
- Custom integrations
- Dedicated support
- White-label options
- SLA guarantee

---

## Implementation Tasks

### Phase 1: Feature Gating Logic (4 hours)

**Create**: `src/lib/featureGating.ts`
```typescript
export const TIER_LIMITS = {
  free: { items: 50, locations: 1, users: 1 },
  basic: { items: 500, locations: 5, users: 1 },
  pro: { items: Infinity, locations: Infinity, users: 3 },
  enterprise: { items: Infinity, locations: Infinity, users: Infinity }
};

export const TIER_FEATURES = {
  free: ['inventory', 'csv_export'],
  basic: ['inventory', 'barcode', 'pdf_reports', 'analytics_basic'],
  pro: ['all_basic', 'ai_valuation', 'cloud_sync', 'team', 'advanced_analytics'],
  enterprise: ['all_pro', 'api_access', 'white_label', 'sla']
};
```

### Phase 2: Update useSubscription Hook (2 hours)

Add methods:
- `canAccessFeature(feature: string): boolean`
- `getRemainingItems(): number`
- `canAddItem(): boolean`
- `canAddLocation(): boolean`
- `canInviteUser(): boolean`

### Phase 3: Enforce Limits in Components (6 hours)

**Files to Update**:
1. `AddItemModal.tsx` - Check item limit before adding
2. `LocationManager.tsx` - Check location limit
3. `TeamManagement.tsx` - Check user limit
4. `AIValuationModal.tsx` - Check pro/enterprise tier
5. `CloudStorageManager.tsx` - Check pro/enterprise tier
6. `AdvancedAnalytics.tsx` - Check tier for advanced features

### Phase 4: Update UI Components (3 hours)

1. Show tier badges on restricted features
2. Add upgrade prompts when limits reached
3. Display remaining items/locations in dashboard
4. Show "Upgrade to Pro" CTAs strategically

---

## Estimated Total Time: 15 hours

## Revenue Impact
- Convert 10% of free users to Basic: $9.99 × users
- Convert 5% to Pro: $29.99 × users
- Convert 1% to Enterprise: $99.99 × users
