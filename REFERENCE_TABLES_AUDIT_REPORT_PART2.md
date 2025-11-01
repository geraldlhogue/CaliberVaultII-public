# Reference Tables Audit Report - Part 2

## Additional Reference Tables

### 9. actions ✅ COMPLETE
- **Records**: 12
- **RLS Policies**: 4 (SELECT, INSERT, UPDATE, DELETE)
- **Indexes**: Configured
- **Seed Data**: Semi-Auto, Bolt Action, Lever Action, etc.
- **Note**: Original table name

### 10. firearm_actions ✅ COMPLETE
- **Records**: 8
- **RLS Policies**: Configured
- **Indexes**: Configured
- **Seed Data**: Various firearm action types
- **Note**: Duplicate/alias table - both "actions" and "firearm_actions" exist

### 11. field_of_view_ranges ✅ NEWLY CREATED
- **Records**: 17
- **RLS Policies**: 4 (SELECT, INSERT, UPDATE, DELETE)
- **Indexes**: 3 (magnification, is_active, display_order)
- **Seed Data**: 1x through 25x with FOV ranges
- **Migration**: 023_complete_reference_tables.sql

## Feature Tables Status

### 1. test_quality_scores ✅ ENHANCED
- **Records**: 0 (ready for use)
- **Columns**: 16 (id, user_id, file_path, file_name, scores, feedback, etc.)
- **RLS Policies**: 2 (SELECT, INSERT)
- **Indexes**: 6 NEW (user_id, file_path, overall_score, created_at, pr_number, branch_name)
- **Purpose**: Track test quality metrics over time for CI/CD quality gates

### 2. quality_gate_config ✅ ENHANCED
- **Records**: 0 (ready for use)
- **Columns**: 12 (id, user_id, config_name, min thresholds for each metric)
- **RLS Policies**: 3 (SELECT, INSERT, UPDATE)
- **Indexes**: 3 NEW (user_id, enabled, unique user_id+config_name)
- **Purpose**: Configure quality gate thresholds per user/team

### 3. stock_alert_rules ✅ ENHANCED
- **Records**: 0 (ready for use)
- **Columns**: 14 (id, user_id, item_id, category, thresholds, notifications)
- **RLS Policies**: 1 (ALL operations)
- **Indexes**: 5 NEW (user_id, item_id, category, is_active, location_id)
- **Purpose**: Automated inventory stock level alerts
