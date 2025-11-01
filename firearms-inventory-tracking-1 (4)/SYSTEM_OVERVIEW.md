# Arsenal Command - System Overview

## Executive Summary
Arsenal Command is a comprehensive firearms inventory management system built with React, TypeScript, and Supabase. The application provides enterprise-grade features for tracking firearms, ammunition, optics, suppressors, and accessories with real-time synchronization, offline support, and subscription-based access control.

## Core Technologies
- **Frontend**: React 18+ with TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Real-time + Edge Functions)
- **State Management**: React Context API + React Query
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage for images/documents
- **PWA**: Service Workers for offline functionality

## Key Features

### 1. Inventory Management
- Multi-category support (firearms, optics, ammunition, suppressors, reloading, accessories)
- Category-specific fields and validation
- Barcode scanning and lookup integration
- Image upload and gallery
- Serial number tracking
- Purchase price and current value tracking
- Storage location management

### 2. Subscription System
- **Trial Mode**: 50 free transactions
- **Paid Plans**: Basic ($9.99), Professional ($29.99), Enterprise ($99.99)
- Real-time transaction counting
- Automatic enforcement of limits
- Stripe integration for payments
- Subscription banner with usage tracking

### 3. Advanced Features
- **Real-time Sync**: Live database updates across devices
- **Offline Mode**: Full PWA support with offline data sync
- **Audit Trail**: Complete activity logging
- **Advanced Search**: Fuzzy matching, saved searches
- **Email Notifications**: Configurable alerts and reports
- **Backup & Export**: Multiple formats (CSV, JSON, Excel)
- **Team Collaboration**: Multi-user support with permissions
- **AI Valuation**: OpenAI integration for pricing estimates
- **Mobile Optimization**: Touch-friendly interface

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (PWA)                     │
├─────────────────────────────────────────────────────────────┤
│  Components  │  Hooks  │  Context  │  Utils  │  Types       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Real-time  │  Storage  │  Edge Functions    │
└─────────────────────────────────────────────────────────────┘
