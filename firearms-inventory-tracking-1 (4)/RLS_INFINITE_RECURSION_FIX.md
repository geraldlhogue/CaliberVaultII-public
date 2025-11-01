# RLS Infinite Recursion Fix - October 28, 2024

## Problem
Error: "infinite recursion detected in policy for relation 'user_permissions'"

## Root Cause
The RLS policies on `user_permissions` table were referencing the same table they were protecting, creating a circular dependency.

## Solution Applied

### 1. Simplified user_permissions Policies
- Removed complex policies that checked permissions within permission checks
- Created simple policy: users can view their own permissions (user_id = auth.uid())
- Organization owners can manage permissions via direct organizations table check

### 2. Fixed tier_limits Policies
- Made tier_limits publicly readable (no recursion possible)
- Removed any complex permission checks

## Result
- No more infinite recursion errors
- Tier limits now load correctly
- User permissions accessible without circular dependencies
