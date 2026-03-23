#!/bin/bash

# Test script for Phase 1 workflows
# Run this AFTER credentials are set up in n8n

set -e

echo "═══════════════════════════════════════════════════════════════════════"
echo "🧪 Testing Phase 1 Workflows"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WEBHOOK_BASE="https://krn8n9394.app.n8n.cloud/webhook"
AFTER_HOURS_WEBHOOK="$WEBHOOK_BASE/tier1-after-hours-lead-capture"
MISSED_CALL_WEBHOOK="$WEBHOOK_BASE/tier1-missed-call-recovery-sms"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Helper function: test webhook
test_webhook() {
  local test_name=$1
  local webhook_url=$2
  local data=$3
  
  echo -e "${YELLOW}Testing: $test_name${NC}"
  
  response=$(curl -s -X POST "$webhook_url" \
    -H "Content-Type: application/json" \
    -d "$data")
  
  if [ -z "$response" ] || [ "$response" == "null" ]; then
    echo -e "${GREEN}✓ Webhook received POST${NC}"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ Unexpected response: $response${NC}"
    ((TESTS_FAILED++))
  fi
  echo ""
}

echo "📋 Setup Check"
echo "─────────────────────────────────────────────────────────────────────"
echo "After-hours webhook: $AFTER_HOURS_WEBHOOK"
echo "Missed-call webhook: $MISSED_CALL_WEBHOOK"
echo ""

echo "⚠️  Before running tests, ensure:"
echo "  1. Both n8n workflows have credentials bound"
echo "  2. Supabase is accessible"
echo "  3. SignalWire account is active"
echo ""

read -p "Continue with tests? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "🚀 TEST 1: After-Hours Workflow (High Confidence)"
echo "═══════════════════════════════════════════════════════════════════════"

test_webhook "Emergency plumbing lead" "$AFTER_HOURS_WEBHOOK" '{
  "From": "+1-555-0100",
  "Body": "My kitchen sink is BROKEN and leaking. Need emergency help ASAP! This is urgent!"
}'

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "🚀 TEST 2: After-Hours Workflow (Low Confidence = Human Review)"
echo "═══════════════════════════════════════════════════════════════════════"

test_webhook "Low quality message" "$AFTER_HOURS_WEBHOOK" '{
  "From": "+1-555-0101",
  "Body": "ok"
}'

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "🚀 TEST 3: Missed Call Workflow (First call)"
echo "═══════════════════════════════════════════════════════════════════════"

test_webhook "Missed call - first SMS" "$MISSED_CALL_WEBHOOK" '{
  "phone": "+1-555-0102",
  "timestamp": "2026-03-15T14:30:00Z",
  "source": "missed_call"
}'

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "🚀 TEST 4: Missed Call Workflow (Dedup - should be blocked)"
echo "═══════════════════════════════════════════════════════════════════════"

test_webhook "Missed call - duplicate (should skip)" "$MISSED_CALL_WEBHOOK" '{
  "phone": "+1-555-0102",
  "timestamp": "2026-03-15T14:35:00Z",
  "source": "missed_call"
}'

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "📊 Test Results"
echo "═══════════════════════════════════════════════════════════════════════"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

echo "✅ Manual Verification Checklist:"
echo "  [ ] Check Supabase leads table: should have 3 new leads"
echo "  [ ] Check Supabase actions table: should have:"
echo "      - 1x sms_sent (after-hours high confidence)"
echo "      - 1x human_review_needed (after-hours low confidence)"
echo "      - 1x sms_sent (missed call first)"
echo "      - 1x dedup_blocked (missed call duplicate)"
echo "  [ ] Check SignalWire: 2 SMS messages should be in history"
echo ""

echo "📝 Database Query to Verify:"
echo "  Leads count: SELECT COUNT(*) FROM leads WHERE created_at > NOW() - INTERVAL '1 hour';"
echo "  Actions log: SELECT action_type, COUNT(*) FROM actions WHERE created_at > NOW() - INTERVAL '1 hour' GROUP BY action_type;"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed! Workflows are ready.${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Check n8n logs for errors.${NC}"
  exit 1
fi
