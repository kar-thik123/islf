-- Migration: Drop Legacy Log Tables
-- Date: 2026-02-04
-- Purpose: Remove redundant log tables replaced by action_logs

DROP TABLE IF EXISTS auth_logs;
DROP TABLE IF EXISTS master_logs;
DROP TABLE IF EXISTS setup_logs;
