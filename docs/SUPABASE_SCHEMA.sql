-- ============================================================================
-- SUPABASE SCHEMA SETUP — Agency AI Ops
-- ============================================================================
-- Run this SQL in your Supabase database (SQL Editor)
-- This creates the two core tables needed for Phase 1 workflows
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────
-- LEADS TABLE
-- Stores customer lead data captured from SMS/missed calls
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Contact Info
  phone VARCHAR(20) NOT NULL,
  
  -- Lead Details
  message TEXT,
  urgency_score FLOAT CHECK (urgency_score >= 0 AND urgency_score <= 1),
  service_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new',
  source VARCHAR(50) NOT NULL, -- 'after_hours_sms' or 'missed_call_recovery'
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexing for common queries
  CONSTRAINT valid_phone CHECK (phone ~ '^\+?[0-9]+$')
);

CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_phone_created ON leads(phone, created_at); -- For deduplication queries

-- Enable RLS (Row Level Security) for leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow n8n to read/write to leads table
CREATE POLICY "allow_n8n_leads_all" ON leads
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────────────────
-- ACTIONS TABLE
-- Audit trail: logs all workflow actions (SMS sent, leads created, errors, etc)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Timing
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Action Classification
  action_type VARCHAR(50) NOT NULL, -- 'sms_sent', 'lead_created', 'human_review_needed', 'sms_failed', 'skipped_duplicate'
  description TEXT,
  agent_name VARCHAR(100) NOT NULL, -- 'tier1_after_hours_capture' or 'tier1_missed_call_recovery'
  
  -- Decision Data
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  revenue_impact DECIMAL(10, 2) DEFAULT 0, -- $150 for captured lead, $0 for logs
  
  -- Success/Failure Tracking
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- Foreign Key References
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  sms_sid VARCHAR(100), -- Twilio message SID (for debugging)
  
  -- Indexing for common queries
  CONSTRAINT valid_action_type CHECK (
    action_type IN ('sms_sent', 'lead_created', 'human_review_needed', 'sms_failed', 'skipped_duplicate')
  )
);

CREATE INDEX idx_actions_timestamp ON actions(timestamp);
CREATE INDEX idx_actions_action_type ON actions(action_type);
CREATE INDEX idx_actions_agent_name ON actions(agent_name);
CREATE INDEX idx_actions_lead_id ON actions(lead_id);
CREATE INDEX idx_actions_success ON actions(success);
CREATE INDEX idx_actions_timestamp_desc ON actions(timestamp DESC); -- For recent activity queries

-- Enable RLS for actions
ALTER TABLE actions ENABLE ROW LEVEL SECURITY;

-- Allow n8n to read/write to actions table
CREATE POLICY "allow_n8n_actions_all" ON actions
  FOR ALL USING (TRUE) WITH CHECK (TRUE);

-- ─────────────────────────────────────────────────────────────────────────
-- VIEWS & FUNCTIONS (for analytics)
-- ─────────────────────────────────────────────────────────────────────────

-- View: Daily Revenue Summary
-- Used for "Daily Summary Email" workflow (Phase 2)
CREATE OR REPLACE VIEW daily_revenue_summary AS
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_actions,
  COUNT(CASE WHEN success = TRUE THEN 1 END) as successful_actions,
  COUNT(CASE WHEN action_type = 'sms_sent' THEN 1 END) as sms_sent,
  SUM(revenue_impact) as daily_revenue,
  AVG(confidence_score) as avg_confidence
FROM actions
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- View: Lead Status Summary
-- Quick overview of lead pipeline
CREATE OR REPLACE VIEW lead_status_summary AS
SELECT
  source,
  status,
  COUNT(*) as count,
  AVG(urgency_score) as avg_urgency
FROM leads
GROUP BY source, status
ORDER BY source, count DESC;

-- Function: Mark action as processed
-- Used after successful SMS send to update related lead
CREATE OR REPLACE FUNCTION mark_action_processed(p_action_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE actions
  SET success = TRUE, updated_at = NOW()
  WHERE id = p_action_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────
-- HELPFUL QUERIES FOR TESTING
-- ─────────────────────────────────────────────────────────────────────────

-- Query: Check recent leads
-- SELECT * FROM leads ORDER BY created_at DESC LIMIT 10;

-- Query: Check recent actions
-- SELECT * FROM actions ORDER BY timestamp DESC LIMIT 20;

-- Query: Find duplicate check (for missed call dedup)
-- SELECT * FROM leads WHERE phone = '+1234567890' AND created_at > NOW() - INTERVAL '24 hours';

-- Query: Revenue summary
-- SELECT * FROM daily_revenue_summary LIMIT 7;

-- ============================================================================
-- END SCHEMA SETUP
-- ============================================================================
-- Next steps:
-- 1. Copy all SQL above
-- 2. Go to Supabase → SQL Editor → New Query
-- 3. Paste and Run
-- 4. Verify tables were created (check "Tables" in left sidebar)
-- 5. Copy your SUPABASE_PROJECT_URL and API keys to .env file
-- ============================================================================
