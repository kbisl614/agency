> ⚠️ **SUPERSEDED — DO NOT USE AS REFERENCE**
> This document contains outdated information. See current reference below.
> **Current reference:** `agency-context/agency_AI_MASTER.md`
> Preserved for session history only.

---

# Phase 1 Implementation Plan — Tier 1 Workflows (Detailed & Thorough)

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three production-ready Tier 1 workflows (After-hours lead capture + Missed call recovery + Audit trail) with FastAPI backend, n8n orchestration, and Mission Control dashboard. First client deliverable.

**Architecture:** FastAPI backend handles Claude decisions + Airtable writes. n8n workflows orchestrate Twilio SMS triggers. Mission Control dashboard polls Airtable every 10 seconds showing real-time action log + ROI metrics. All actions logged for audit trail.

**Tech Stack:** FastAPI (Python 3.11+), Claude API (claude-sonnet-4-20250514), n8n (self-hosted or Cloud), Airtable, Twilio, Next.js 14+, PostgreSQL (optional, Phase 2)

**Success Criteria:**
- ✅ After-hours SMS test works within 2 seconds, logged to Airtable
- ✅ Missed call SMS test works within 60 seconds, logged to Airtable
- ✅ Mission Control dashboard shows action log + revenue metrics in real-time
- ✅ All 3 workflows have >95% test coverage
- ✅ FastAPI deployed (Railway or Render)
- ✅ Next.js dashboard deployed (Vercel)
- ✅ n8n workflows running + firing correctly
- ✅ Confidence threshold enforced (0.85 for auto-send)

---

## File Structure

```
project-root/
├── backend/                              (NEW)
│   ├── main.py                           ← FastAPI app entry point
│   ├── requirements.txt                  ← Python dependencies
│   ├── .env.example                      ← Environment template
│   ├── config.py                         ← Pydantic settings
│   ├── conftest.py                       ← Pytest fixtures
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── leads.py                      ← POST /leads/qualify endpoint
│   │   └── webhooks.py                   ← POST /webhooks/missed-call endpoint
│   ├── services/
│   │   ├── __init__.py
│   │   ├── claude_service.py             ← Claude API + prompt engineering
│   │   ├── airtable_service.py           ← Airtable CRUD operations
│   │   └── twilio_service.py             ← SMS sending via Twilio
│   └── tests/
│       ├── __init__.py
│       ├── test_claude_service.py        ← Claude qualification tests
│       ├── test_airtable_service.py      ← Airtable operation tests
│       ├── test_leads_route.py           ← /leads/qualify endpoint tests
│       └── test_webhooks_route.py        ← /webhooks/missed-call tests
├── app/                                  (EXISTING Next.js)
│   ├── mission-control/                  (NEW)
│   │   ├── page.tsx                      ← Dashboard + action log
│   │   ├── components/
│   │   │   ├── ActionLog.tsx             ← Real-time action table
│   │   │   ├── ROIMetrics.tsx            ← Summary stats
│   │   │   └── Filters.tsx               ← Date/type filtering
│   │   └── hooks/
│   │       └── useActionLog.ts           ← Polling hook (10s interval)
│   └── (existing landing pages...)
├── n8n/                                  (NEW - exported JSON workflows)
│   ├── tier1_after_hours_lead_capture.json
│   └── tier1_missed_call_recovery_sms.json
├── docs/superpowers/
│   ├── specs/2026-03-14-feature-tier-mapping.md
│   ├── specs/2026-03-14-layer1-workflows-design.md
│   ├── plans/2026-03-14-phase1-tier1-implementation.md
│   └── plans/2026-03-14-phase1-implementation-detailed.md ← This file
├── .env.local                            (EXISTING - add new vars)
├── pytest.ini                            (NEW - test config)
└── docker-compose.yml                    (NEW - optional local n8n)
```

---

## Chunk 1: FastAPI Backend Setup & Services

### Task 1: Initialize FastAPI project and dependencies

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/pytest.ini`

- [ ] **Step 1: Create requirements.txt with all dependencies**

```txt
fastapi==0.104.1
uvicorn==0.24.0
python-dotenv==1.0.0
httpx==0.25.0
airtable-python-wrapper==0.15.3
twilio==8.10.0
anthropic==0.21.0
pydantic==2.5.0
pydantic-settings==2.0.3
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
python-multipart==0.0.6
```

- [ ] **Step 2: Verify requirements file syntax**

Run: `cat backend/requirements.txt`
Expected: All packages listed with exact versions

- [ ] **Step 3: Create .env.example template**

```bash
# File: backend/.env.example
# Claude API
ANTHROPIC_API_KEY=sk-ant-xxx

# Airtable
AIRTABLE_API_KEY=pat-xxx
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_LEADS_TABLE_ID=tblXXXXXXXXXXXXXX
AIRTABLE_ACTIONS_TABLE_ID=tblXXXXXXXXXXXXXX

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Server
BACKEND_PORT=8000
DEBUG=true
ENVIRONMENT=development
```

- [ ] **Step 4: Create pytest.ini**

```ini
[pytest]
testpaths = backend/tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short --cov=backend --cov-report=term-missing
asyncio_mode = auto
```

- [ ] **Step 5: Commit**

```bash
git add backend/requirements.txt backend/.env.example pytest.ini
git commit -m "chore: initialize FastAPI project dependencies"
```

---

### Task 2: Create Pydantic config module

**Files:**
- Create: `backend/config.py`
- Test: Verify settings load from .env

- [ ] **Step 1: Write config.py with all settings**

```python
# File: backend/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Claude API
    anthropic_api_key: str
    claude_model: str = "claude-sonnet-4-20250514"

    # Airtable
    airtable_api_key: str
    airtable_base_id: str
    airtable_leads_table_id: str
    airtable_actions_table_id: str

    # Twilio
    twilio_account_sid: str
    twilio_auth_token: str
    twilio_phone_number: str

    # Server
    backend_port: int = 8000
    debug: bool = False
    environment: str = "development"

    class Config:
        env_file = ".env.local"
        case_sensitive = False

# Global settings instance
settings = Settings()
```

- [ ] **Step 2: Verify settings load correctly**

Run: `cd backend && python -c "from config import settings; print(f'Claude model: {settings.claude_model}')"`
Expected: `Claude model: claude-sonnet-4-20250514`

- [ ] **Step 3: Commit**

```bash
git add backend/config.py
git commit -m "feat: add pydantic settings config module"
```

---

### Task 3: Create Claude service with prompts

**Files:**
- Create: `backend/services/__init__.py`
- Create: `backend/services/claude_service.py`
- Test: `backend/tests/test_claude_service.py`

- [ ] **Step 1: Write test for lead qualification**

```python
# File: backend/tests/test_claude_service.py
import pytest
from backend.services.claude_service import ClaudeService
from unittest.mock import patch, MagicMock
import json

@pytest.fixture
def claude_service():
    return ClaudeService()

def test_qualify_lead_high_urgency():
    """Test that emergency AC situation gets high urgency + high confidence"""
    service = ClaudeService()

    # Mock the Claude API response
    expected_response = {
        "action": "send_sms",
        "urgency_score": 9,
        "service_type": "emergency_ac",
        "response_text": "Got it! We have availability tonight 6-8pm. Reply YES to confirm.",
        "confidence": 0.92
    }

    with patch.object(service, '_call_claude', return_value=expected_response):
        result = service.qualify_lead(
            customer_phone="+1234567890",
            message="My AC went out, it's 95 degrees",
            is_new_customer=True
        )

        assert result["urgency_score"] == 9
        assert result["confidence"] > 0.85
        assert result["action"] == "send_sms"

def test_qualify_lead_low_confidence():
    """Test that unclear messages get low confidence (no SMS sent)"""
    service = ClaudeService()

    expected_response = {
        "action": "skip",
        "urgency_score": 2,
        "service_type": "unclear",
        "response_text": "",
        "confidence": 0.35
    }

    with patch.object(service, '_call_claude', return_value=expected_response):
        result = service.qualify_lead(
            customer_phone="+1234567890",
            message="what time are you open",
            is_new_customer=True
        )

        assert result["confidence"] < 0.6
        assert result["action"] == "skip"

def test_classify_missed_call():
    """Test that missed calls get classified correctly"""
    service = ClaudeService()

    expected_response = {
        "action": "send_sms",
        "should_send": True,
        "response_text": "Hey, we just missed your call — what's going on with your system? We'll get back to you within the hour.",
        "confidence": 0.88
    }

    with patch.object(service, '_call_claude', return_value=expected_response):
        result = service.classify_missed_call(
            phone="+1234567890"
        )

        assert result["should_send"] == True
        assert result["confidence"] > 0.8
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_claude_service.py::test_qualify_lead_high_urgency -v`
Expected: FAIL - "ClaudeService not found" or similar import error

- [ ] **Step 3: Write Claude service implementation**

```python
# File: backend/services/claude_service.py
from anthropic import Anthropic
from backend.config import settings
import json
from typing import Dict, Any

class ClaudeService:
    def __init__(self):
        self.client = Anthropic(api_key=settings.anthropic_api_key)
        self.model = settings.claude_model

    def qualify_lead(self, customer_phone: str, message: str, is_new_customer: bool) -> Dict[str, Any]:
        """
        Qualify an inbound SMS lead using Claude.
        Returns: urgency_score (1-10), service_type, response_text, confidence (0-1)
        """
        prompt = f"""You are an AI dispatcher for an HVAC emergency response service.

A customer has sent an SMS with an issue. Your job is:
1. Assess urgency (1-10 scale)
2. Identify service type (emergency_ac, emergency_heat, maintenance, etc.)
3. Generate a friendly, conversational SMS response

Customer phone: {customer_phone}
Customer message: {message}
Is new customer: {is_new_customer}

Return ONLY valid JSON, no preamble:
{{
  "action": "send_sms" or "skip",
  "urgency_score": <1-10>,
  "service_type": "<service_type>",
  "response_text": "<SMS response to send, max 160 chars>",
  "confidence": <0-1>
}}

Urgency scale:
- 9-10: "No AC/heat in dangerous conditions" → respond immediately with high confidence
- 7-8: "AC/heat not working, uncomfortable but safe" → respond with options
- 5-6: "Minor issue, wants maintenance" → respond with scheduling options
- 1-4: "Not actually an HVAC issue or spam" → confidence = 0.1, action = "skip"

Be conversational. Keep responses under 160 chars for SMS."""

        response = self._call_claude(prompt)
        return response

    def classify_missed_call(self, phone: str) -> Dict[str, Any]:
        """
        Classify if a missed call should trigger an SMS response.
        Returns: should_send (bool), response_text, confidence (0-1)
        """
        prompt = f"""You are a customer service agent for an HVAC contractor.

A customer just missed a call from your office. Their phone number: {phone}

Your job: Decide if we should send them an SMS to re-engage them.

Return ONLY valid JSON:
{{
  "action": "send_sms" or "skip",
  "should_send": true or false,
  "response_text": "<SMS to send>",
  "confidence": <0-1>
}}

Rules:
- Almost always send SMS (missed calls are high-intent leads)
- Only skip if: blocked number, spam pattern, or other red flags
- Response should be friendly, explain we missed their call, ask what's wrong
- Max 160 chars
- Include: "We'll get back to you within the hour"

Example: "Hey, we just missed your call — what's going on with your system? We'll get back to you within the hour." """

        response = self._call_claude(prompt)
        return response

    def _call_claude(self, prompt: str) -> Dict[str, Any]:
        """Internal method to call Claude API and parse JSON response"""
        message = self.client.messages.create(
            model=self.model,
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Extract text from response
        response_text = message.content[0].text

        # Parse JSON from response
        try:
            # Find JSON in response (may have preamble)
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            json_str = response_text[start_idx:end_idx]
            return json.loads(json_str)
        except (json.JSONDecodeError, ValueError) as e:
            # Fallback if Claude doesn't return valid JSON
            return {
                "action": "skip",
                "urgency_score": 0,
                "service_type": "parse_error",
                "response_text": "",
                "confidence": 0.0
            }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && python -m pytest tests/test_claude_service.py -v`
Expected: All 3 tests PASS

- [ ] **Step 5: Verify coverage**

Run: `cd backend && python -m pytest tests/test_claude_service.py --cov=services.claude_service`
Expected: Coverage > 85%

- [ ] **Step 6: Commit**

```bash
git add backend/services/__init__.py backend/services/claude_service.py backend/tests/test_claude_service.py
git commit -m "feat: implement Claude service with lead qualification and missed call classification"
```

---

### Task 4: Create Airtable service

**Files:**
- Create: `backend/services/airtable_service.py`
- Test: `backend/tests/test_airtable_service.py`

- [ ] **Step 1: Write test for Airtable operations**

```python
# File: backend/tests/test_airtable_service.py
import pytest
from backend.services.airtable_service import AirtableService
from unittest.mock import patch, MagicMock

@pytest.fixture
def airtable_service():
    return AirtableService()

def test_create_lead():
    """Test creating a lead record in Airtable"""
    service = AirtableService()

    mock_response = {"id": "recXXXXXXXXXXXXXX", "fields": {"Name": "+1234567890"}}

    with patch.object(service, 'leads_table', create=True) as mock_table:
        mock_table.create.return_value = mock_response

        result = service.create_lead(
            phone="+1234567890",
            message="AC broken",
            urgency_score=9,
            service_type="emergency_ac",
            status="new"
        )

        assert result["id"] == "recXXXXXXXXXXXXXX"

def test_log_action():
    """Test logging an action to Actions table"""
    service = AirtableService()

    mock_response = {"id": "recYYYYYYYYYYYYYY"}

    with patch.object(service, 'actions_table', create=True) as mock_table:
        mock_table.create.return_value = mock_response

        result = service.log_action(
            action_type="sms_sent",
            description="Sent SMS response",
            agent_name="tier1_after_hours_lead_capture",
            confidence_score=0.92,
            revenue_impact=150.0,
            lead_id="recXXXXXXXXXXXXXX"
        )

        assert result["id"] == "recYYYYYYYYYYYYYY"

def test_query_leads_by_phone():
    """Test finding existing leads by phone"""
    service = AirtableService()

    mock_records = [
        {"id": "recXXXXXXXXXXXXXX", "fields": {"Phone": "+1234567890", "Status": "new"}}
    ]

    with patch.object(service, 'leads_table', create=True) as mock_table:
        mock_table.all.return_value = mock_records

        result = service.query_leads_by_phone("+1234567890")

        assert len(result) == 1
        assert result[0]["fields"]["Phone"] == "+1234567890"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_airtable_service.py::test_create_lead -v`
Expected: FAIL - "AirtableService not found"

- [ ] **Step 3: Write Airtable service implementation**

```python
# File: backend/services/airtable_service.py
from airtable import Airtable
from backend.config import settings
from typing import Dict, List, Any, Optional
from datetime import datetime

class AirtableService:
    def __init__(self):
        self.airtable = Airtable(
            settings.airtable_base_id,
            settings.airtable_api_key
        )
        self.leads_table_name = "Leads"
        self.actions_table_name = "Actions"
        self.leads_table = self.airtable.get_all(self.leads_table_name)
        self.actions_table = self.airtable.get_all(self.actions_table_name)

    def create_lead(
        self,
        phone: str,
        message: str,
        urgency_score: int,
        service_type: str,
        status: str = "new",
        source: str = "sms"
    ) -> Dict[str, Any]:
        """Create a new lead record in Airtable"""
        fields = {
            "Phone": phone,
            "Message": message,
            "Urgency Score": urgency_score,
            "Service Type": service_type,
            "Status": status,
            "Source": source,
            "Created At": datetime.utcnow().isoformat()
        }

        record = Airtable(
            settings.airtable_base_id,
            settings.airtable_api_key
        ).insert(self.leads_table_name, fields)

        return record

    def log_action(
        self,
        action_type: str,
        description: str,
        agent_name: str,
        confidence_score: float,
        revenue_impact: float = 0.0,
        lead_id: Optional[str] = None,
        success: bool = True,
        error_message: Optional[str] = None,
        sms_sid: Optional[str] = None
    ) -> Dict[str, Any]:
        """Log an action to the Actions table (audit trail)"""
        fields = {
            "Timestamp": datetime.utcnow().isoformat(),
            "Action Type": action_type,
            "Description": description,
            "Agent Name": agent_name,
            "Confidence Score": confidence_score,
            "Revenue Impact": revenue_impact,
            "Success": success,
        }

        if lead_id:
            fields["Lead ID"] = [lead_id]  # Airtable expects array for linked records
        if error_message:
            fields["Error Message"] = error_message
        if sms_sid:
            fields["SMS SID"] = sms_sid

        record = Airtable(
            settings.airtable_base_id,
            settings.airtable_api_key
        ).insert(self.actions_table_name, fields)

        return record

    def query_leads_by_phone(self, phone: str) -> List[Dict[str, Any]]:
        """Query leads table by phone number"""
        airtable_client = Airtable(
            settings.airtable_base_id,
            settings.airtable_api_key
        )

        all_records = airtable_client.get_all(self.leads_table_name)
        matching = [r for r in all_records if r.get("fields", {}).get("Phone") == phone]

        return matching

    def get_lead_by_id(self, lead_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific lead by ID"""
        airtable_client = Airtable(
            settings.airtable_base_id,
            settings.airtable_api_key
        )

        try:
            return airtable_client.get(self.leads_table_name, lead_id)
        except:
            return None
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && python -m pytest tests/test_airtable_service.py -v`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/services/airtable_service.py backend/tests/test_airtable_service.py
git commit -m "feat: implement Airtable service for CRUD operations and audit trail logging"
```

---

### Task 5: Create Twilio service

**Files:**
- Create: `backend/services/twilio_service.py`
- Test: `backend/tests/test_twilio_service.py`

- [ ] **Step 1: Write test for SMS sending**

```python
# File: backend/tests/test_twilio_service.py
import pytest
from backend.services.twilio_service import TwilioService
from unittest.mock import patch, MagicMock

@pytest.fixture
def twilio_service():
    return TwilioService()

def test_send_sms_success():
    """Test successful SMS sending"""
    service = TwilioService()

    mock_message = MagicMock()
    mock_message.sid = "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    mock_message.status = "queued"

    with patch.object(service, 'client', create=True) as mock_client:
        mock_client.messages.create.return_value = mock_message

        result = service.send_sms(
            to_phone="+1234567890",
            message_text="Got it! Reply YES to confirm."
        )

        assert result["success"] == True
        assert result["sms_sid"] == "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

def test_send_sms_failure():
    """Test SMS sending with failure"""
    service = TwilioService()

    with patch.object(service, 'client', create=True) as mock_client:
        mock_client.messages.create.side_effect = Exception("Invalid phone number")

        result = service.send_sms(
            to_phone="+invalid",
            message_text="Test"
        )

        assert result["success"] == False
        assert "Invalid phone number" in result["error"]
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_twilio_service.py::test_send_sms_success -v`
Expected: FAIL - "TwilioService not found"

- [ ] **Step 3: Write Twilio service implementation**

```python
# File: backend/services/twilio_service.py
from twilio.rest import Client
from backend.config import settings
from typing import Dict, Any

class TwilioService:
    def __init__(self):
        self.client = Client(
            settings.twilio_account_sid,
            settings.twilio_auth_token
        )
        self.from_number = settings.twilio_phone_number

    def send_sms(self, to_phone: str, message_text: str) -> Dict[str, Any]:
        """
        Send an SMS message via Twilio.

        Returns:
        {
            "success": bool,
            "sms_sid": str (Twilio message ID),
            "error": str (if failed)
        }
        """
        try:
            message = self.client.messages.create(
                body=message_text,
                from_=self.from_number,
                to=to_phone
            )

            return {
                "success": True,
                "sms_sid": message.sid,
                "status": message.status
            }

        except Exception as e:
            return {
                "success": False,
                "sms_sid": None,
                "error": str(e)
            }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && python -m pytest tests/test_twilio_service.py -v`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/services/twilio_service.py backend/tests/test_twilio_service.py
git commit -m "feat: implement Twilio service for SMS sending"
```

---

## Chunk 2: FastAPI Routes & Endpoints

### Task 6: Create leads qualification endpoint

**Files:**
- Create: `backend/routes/__init__.py`
- Create: `backend/routes/leads.py`
- Test: `backend/tests/test_leads_route.py`

- [ ] **Step 1: Write test for POST /leads/qualify endpoint**

```python
# File: backend/tests/test_leads_route.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

@pytest.fixture
def client():
    from backend.main import app
    return TestClient(app)

def test_qualify_lead_high_urgency(client):
    """Test /leads/qualify with emergency AC situation"""

    mock_response = {
        "action": "send_sms",
        "urgency_score": 9,
        "service_type": "emergency_ac",
        "response_text": "Got it! We have availability tonight. Reply YES.",
        "confidence": 0.92
    }

    with patch("backend.routes.leads.claude_service.qualify_lead", return_value=mock_response):
        response = client.post(
            "/leads/qualify",
            json={
                "phone": "+1234567890",
                "message": "My AC went out",
                "is_new_customer": True
            }
        )

    assert response.status_code == 200
    assert response.json()["urgency_score"] == 9
    assert response.json()["confidence"] > 0.85

def test_qualify_lead_low_confidence(client):
    """Test /leads/qualify with low confidence (should not send SMS)"""

    mock_response = {
        "action": "skip",
        "urgency_score": 1,
        "service_type": "unclear",
        "response_text": "",
        "confidence": 0.2
    }

    with patch("backend.routes.leads.claude_service.qualify_lead", return_value=mock_response):
        response = client.post(
            "/leads/qualify",
            json={
                "phone": "+1234567890",
                "message": "hello",
                "is_new_customer": True
            }
        )

    assert response.status_code == 200
    assert response.json()["confidence"] < 0.6
    assert response.json()["action"] == "skip"

def test_qualify_lead_missing_fields(client):
    """Test /leads/qualify with missing required fields"""
    response = client.post(
        "/leads/qualify",
        json={"phone": "+1234567890"}  # missing 'message'
    )

    assert response.status_code == 422  # Unprocessable Entity
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_leads_route.py::test_qualify_lead_high_urgency -v`
Expected: FAIL - "No module named 'main'"

- [ ] **Step 3: Create routes/leads.py**

```python
# File: backend/routes/leads.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from backend.services.claude_service import ClaudeService
from backend.services.airtable_service import AirtableService
from backend.services.twilio_service import TwilioService

router = APIRouter(prefix="/leads", tags=["leads"])

# Initialize services
claude_service = ClaudeService()
airtable_service = AirtableService()
twilio_service = TwilioService()

# Request/Response models
class LeadQualifyRequest(BaseModel):
    phone: str = Field(..., description="Customer phone number")
    message: str = Field(..., description="Customer SMS message")
    is_new_customer: bool = Field(default=True, description="Whether this is a new customer")

class LeadQualifyResponse(BaseModel):
    action: str
    urgency_score: int
    service_type: str
    response_text: str
    confidence: float
    lead_id: Optional[str] = None
    sms_sid: Optional[str] = None

@router.post("/qualify", response_model=LeadQualifyResponse)
async def qualify_lead(request: LeadQualifyRequest):
    """
    Qualify an inbound SMS lead using Claude AI.

    - Assesses urgency (1-10)
    - Identifies service type
    - Decides whether to send SMS response
    - Logs action to Airtable
    """
    try:
        # Get Claude qualification
        claude_result = claude_service.qualify_lead(
            customer_phone=request.phone,
            message=request.message,
            is_new_customer=request.is_new_customer
        )

        # Create lead record in Airtable
        lead_record = airtable_service.create_lead(
            phone=request.phone,
            message=request.message,
            urgency_score=claude_result.get("urgency_score", 0),
            service_type=claude_result.get("service_type", "unknown"),
            status="new",
            source="after_hours_sms"
        )

        lead_id = lead_record.get("id")
        sms_sid = None

        # Decide whether to send SMS based on confidence threshold
        if claude_result.get("confidence", 0) > 0.85 and claude_result.get("action") == "send_sms":
            # Send SMS response
            sms_result = twilio_service.send_sms(
                to_phone=request.phone,
                message_text=claude_result.get("response_text", "")
            )
            sms_sid = sms_result.get("sms_sid")

            # Log successful SMS action
            airtable_service.log_action(
                action_type="sms_sent",
                description=f"Sent SMS: {claude_result.get('response_text', '')}",
                agent_name="tier1_after_hours_lead_capture",
                confidence_score=claude_result.get("confidence", 0),
                revenue_impact=150.0,  # Standard lead value
                lead_id=lead_id,
                sms_sid=sms_sid,
                success=sms_result.get("success", False)
            )
        else:
            # Log human review needed
            airtable_service.log_action(
                action_type="human_review_needed",
                description=f"Low confidence ({claude_result.get('confidence', 0)}): {request.message}",
                agent_name="tier1_after_hours_lead_capture",
                confidence_score=claude_result.get("confidence", 0),
                revenue_impact=0.0,
                lead_id=lead_id,
                success=True
            )

        return LeadQualifyResponse(
            action=claude_result.get("action", "skip"),
            urgency_score=claude_result.get("urgency_score", 0),
            service_type=claude_result.get("service_type", "unknown"),
            response_text=claude_result.get("response_text", ""),
            confidence=claude_result.get("confidence", 0),
            lead_id=lead_id,
            sms_sid=sms_sid
        )

    except Exception as e:
        # Log error action
        airtable_service.log_action(
            action_type="error",
            description=str(e),
            agent_name="tier1_after_hours_lead_capture",
            confidence_score=0.0,
            revenue_impact=0.0,
            success=False,
            error_message=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && python -m pytest tests/test_leads_route.py -v`
Expected: Tests PASS (or show validation errors to fix)

- [ ] **Step 5: Commit**

```bash
git add backend/routes/__init__.py backend/routes/leads.py backend/tests/test_leads_route.py
git commit -m "feat: implement POST /leads/qualify endpoint with Claude qualification and SMS routing"
```

---

### Task 7: Create missed call webhook endpoint

**Files:**
- Create: `backend/routes/webhooks.py`
- Test: `backend/tests/test_webhooks_route.py`

- [ ] **Step 1: Write test for POST /webhooks/missed-call endpoint**

```python
# File: backend/tests/test_webhooks_route.py
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

@pytest.fixture
def client():
    from backend.main import app
    return TestClient(app)

def test_missed_call_recovery_success(client):
    """Test /webhooks/missed-call with valid missed call event"""

    mock_claude_response = {
        "action": "send_sms",
        "should_send": True,
        "response_text": "Hey, we just missed your call — what's going on? We'll get back to you within the hour.",
        "confidence": 0.88
    }

    with patch("backend.routes.webhooks.claude_service.classify_missed_call", return_value=mock_claude_response):
        response = client.post(
            "/webhooks/missed-call",
            json={"phone": "+1234567890", "timestamp": "2026-03-14T14:32:00Z"}
        )

    assert response.status_code == 200
    assert response.json()["should_send"] == True
    assert response.json()["confidence"] > 0.8

def test_missed_call_duplicate_prevention(client):
    """Test that duplicate missed calls from same phone don't send multiple SMSes"""

    # First call should create lead
    with patch("backend.routes.webhooks.airtable_service.query_leads_by_phone", return_value=[]):
        response1 = client.post(
            "/webhooks/missed-call",
            json={"phone": "+1234567890", "timestamp": "2026-03-14T14:32:00Z"}
        )

    assert response1.status_code == 200

    # Second call from same phone should be skipped (duplicate)
    with patch("backend.routes.webhooks.airtable_service.query_leads_by_phone", return_value=[{"id": "rec123"}]):
        response2 = client.post(
            "/webhooks/missed-call",
            json={"phone": "+1234567890", "timestamp": "2026-03-14T14:35:00Z"}
        )

    assert response2.status_code == 200
    assert response2.json()["action"] == "skip_duplicate"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && python -m pytest tests/test_webhooks_route.py::test_missed_call_recovery_success -v`
Expected: FAIL

- [ ] **Step 3: Create routes/webhooks.py**

```python
# File: backend/routes/webhooks.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from backend.services.claude_service import ClaudeService
from backend.services.airtable_service import AirtableService
from backend.services.twilio_service import TwilioService

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

# Initialize services
claude_service = ClaudeService()
airtable_service = AirtableService()
twilio_service = TwilioService()

# Request/Response models
class MissedCallRequest(BaseModel):
    phone: str
    timestamp: str

class MissedCallResponse(BaseModel):
    action: str
    should_send: bool
    response_text: str
    confidence: float
    lead_id: str

@router.post("/missed-call", response_model=MissedCallResponse)
async def handle_missed_call(request: MissedCallRequest):
    """
    Handle a missed call event from Jobber.

    - Checks if we already have a lead from this phone today
    - Classifies if SMS should be sent (usually yes for missed calls)
    - Sends SMS if high confidence
    - Logs action to Airtable
    """
    try:
        # Check for duplicate leads from same phone in last 6 hours
        existing_leads = airtable_service.query_leads_by_phone(request.phone)

        # Filter to leads from today
        today = datetime.utcnow().date()
        recent_leads = []
        for lead in existing_leads:
            try:
                created_at = datetime.fromisoformat(lead.get("fields", {}).get("Created At", ""))
                if created_at.date() == today:
                    recent_leads.append(lead)
            except:
                pass

        # If we already have a lead from this phone today, skip (prevent SMS spam)
        if recent_leads:
            airtable_service.log_action(
                action_type="missed_call_duplicate_skip",
                description=f"Already have lead from {request.phone} today",
                agent_name="tier1_missed_call_recovery_sms",
                confidence_score=0.0,
                revenue_impact=0.0,
                success=True
            )

            return MissedCallResponse(
                action="skip_duplicate",
                should_send=False,
                response_text="",
                confidence=0.0,
                lead_id=recent_leads[0].get("id", "")
            )

        # Get Claude classification
        claude_result = claude_service.classify_missed_call(phone=request.phone)

        # Create lead record for missed call
        lead_record = airtable_service.create_lead(
            phone=request.phone,
            message="Missed call recovery",
            urgency_score=8,  # Missed calls are high priority
            service_type="missed_call_recovery",
            status="awaiting_confirmation",
            source="missed_call"
        )

        lead_id = lead_record.get("id")
        sms_sid = None

        # Send SMS if should_send = true and confidence > 0.8
        if claude_result.get("should_send", False) and claude_result.get("confidence", 0) > 0.8:
            sms_result = twilio_service.send_sms(
                to_phone=request.phone,
                message_text=claude_result.get("response_text", "")
            )
            sms_sid = sms_result.get("sms_sid")

            # Log successful SMS
            airtable_service.log_action(
                action_type="sms_sent",
                description=f"Missed call SMS: {claude_result.get('response_text', '')}",
                agent_name="tier1_missed_call_recovery_sms",
                confidence_score=claude_result.get("confidence", 0),
                revenue_impact=150.0,  # Same value as captured lead
                lead_id=lead_id,
                sms_sid=sms_sid,
                success=sms_result.get("success", False)
            )
        else:
            # Log skipped SMS
            airtable_service.log_action(
                action_type="missed_call_sms_skipped",
                description=f"Confidence too low: {claude_result.get('confidence', 0)}",
                agent_name="tier1_missed_call_recovery_sms",
                confidence_score=claude_result.get("confidence", 0),
                revenue_impact=0.0,
                lead_id=lead_id,
                success=True
            )

        return MissedCallResponse(
            action=claude_result.get("action", "skip"),
            should_send=claude_result.get("should_send", False),
            response_text=claude_result.get("response_text", ""),
            confidence=claude_result.get("confidence", 0),
            lead_id=lead_id
        )

    except Exception as e:
        airtable_service.log_action(
            action_type="webhook_error",
            description=str(e),
            agent_name="tier1_missed_call_recovery_sms",
            confidence_score=0.0,
            revenue_impact=0.0,
            success=False,
            error_message=str(e)
        )
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && python -m pytest tests/test_webhooks_route.py -v`
Expected: Tests PASS

- [ ] **Step 5: Commit**

```bash
git add backend/routes/webhooks.py backend/tests/test_webhooks_route.py
git commit -m "feat: implement POST /webhooks/missed-call endpoint with deduplication and SMS routing"
```

---

### Task 8: Create main FastAPI app

**Files:**
- Create: `backend/main.py`

- [ ] **Step 1: Create main.py with app initialization**

```python
# File: backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.routes import leads, webhooks

# Initialize FastAPI app
app = FastAPI(
    title="HVAC AI Operations API",
    description="Phase 1 Tier 1 Workflows: After-hours lead capture + Missed call recovery",
    version="1.0.0"
)

# Add CORS middleware (allow n8n + dashboard to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route routers
app.include_router(leads.router)
app.include_router(webhooks.router)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "HVAC AI Operations API",
        "environment": settings.environment
    }

@app.get("/health")
async def health():
    """Kubernetes/load balancer health check"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=settings.debug
    )
```

- [ ] **Step 2: Test that app starts**

Run: `cd backend && python -c "from main import app; print('App initialized successfully')" 2>&1 | head -20`
Expected: "App initialized successfully" (or import errors to fix)

- [ ] **Step 3: Verify routes are registered**

Run: `cd backend && python -c "from main import app; print([route.path for route in app.routes])" 2>&1 | grep -E "leads|webhooks"`
Expected: Routes including /leads/qualify and /webhooks/missed-call

- [ ] **Step 4: Commit**

```bash
git add backend/main.py
git commit -m "feat: initialize FastAPI app with CORS and route registration"
```

---

## Chunk 3: Airtable Schema Setup

### Task 9: Create Airtable tables schema

**Files:**
- Create: `docs/AIRTABLE_SCHEMA.md` (documentation)

- [ ] **Step 1: Document Airtable schema requirements**

```markdown
# File: docs/AIRTABLE_SCHEMA.md

## Airtable Base Setup for Phase 1

### Table 1: Leads
**Purpose:** Store all lead records (new customers, follow-ups, etc.)

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| Phone | Single line text | Yes | Unique index. Format: +1234567890 |
| Message | Long text | Yes | Original customer message |
| Urgency Score | Number | Yes | 1-10 scale from Claude |
| Service Type | Single select | Yes | Options: emergency_ac, emergency_heat, maintenance, unclear |
| Status | Single select | Yes | Options: new, awaiting_confirmation, confirmed, dispatched, completed, cancelled |
| Source | Single select | Yes | Options: after_hours_sms, missed_call, web_form, phone_call |
| Created At | Date | Yes | ISO timestamp when lead created |
| Updated At | Date | No | ISO timestamp of last update |

**Example Record:**
- Phone: +14155552671
- Message: My AC went out, it's 95 degrees
- Urgency Score: 9
- Service Type: emergency_ac
- Status: awaiting_confirmation
- Source: after_hours_sms
- Created At: 2026-03-14T22:15:00Z

---

### Table 2: Actions (Audit Trail)
**Purpose:** Log every action taken by the system (proof of ROI + compliance)

**Fields:**
| Field Name | Type | Required | Notes |
|-----------|------|----------|-------|
| Timestamp | Date | Yes | ISO timestamp of action |
| Action Type | Single select | Yes | Options: sms_sent, lead_created, human_review_needed, sms_failed, webhook_error, missed_call_duplicate_skip |
| Description | Long text | Yes | Human-readable description of what happened |
| Agent Name | Single line text | Yes | Which workflow/agent took action |
| Confidence Score | Number | No | Claude confidence (0-1) |
| Revenue Impact | Currency | No | Estimated value of this action |
| Success | Checkbox | Yes | Whether action completed successfully |
| Lead ID | Link to Leads | No | Which lead this action relates to |
| SMS SID | Single line text | No | Twilio message ID (if SMS sent) |
| Error Message | Long text | No | Error details (if failed) |

**Example Record:**
- Timestamp: 2026-03-14T22:15:45Z
- Action Type: sms_sent
- Description: Sent SMS response to emergency AC lead
- Agent Name: tier1_after_hours_lead_capture
- Confidence Score: 0.92
- Revenue Impact: $150
- Success: ✓
- Lead ID: [links to Leads record]
- SMS SID: SM...
- Error Message: (blank)

---

### Setup Instructions

1. Create a new Airtable Base named "HVAC AI Operations - Phase 1"
2. Create Leads table with fields above
3. Create Actions table with fields above
4. Set Phone field as unique (Airtable will prevent duplicates)
5. Set up views:
   - Leads: Today's leads, grouped by Status
   - Actions: Today's actions, sorted by Timestamp (newest first)
6. Copy Base ID, Table IDs, and API Key to .env.local
```

- [ ] **Step 2: Create Airtable tables via API script**

```python
# File: backend/scripts/setup_airtable.py
#!/usr/bin/env python3
"""
Script to set up Airtable base and tables for Phase 1.
Run this once before deploying the application.
"""
import os
from airtable import Airtable
from dotenv import load_dotenv

load_dotenv('.env.local')

AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID')
AIRTABLE_API_KEY = os.getenv('AIRTABLE_API_KEY')

def setup_leads_table():
    """Create Leads table with proper schema"""
    airtable = Airtable(AIRTABLE_BASE_ID, AIRTABLE_API_KEY)

    # Note: Airtable API doesn't support creating tables directly.
    # You'll need to create tables in Airtable UI first, then configure fields.

    print("✓ Leads table: Create manually in Airtable UI with these fields:")
    print("  - Phone (Single line text, unique)")
    print("  - Message (Long text)")
    print("  - Urgency Score (Number)")
    print("  - Service Type (Single select)")
    print("  - Status (Single select)")
    print("  - Source (Single select)")
    print("  - Created At (Date)")
    print("  - Updated At (Date)")

def setup_actions_table():
    """Create Actions table with proper schema"""
    print("✓ Actions table: Create manually in Airtable UI with these fields:")
    print("  - Timestamp (Date)")
    print("  - Action Type (Single select)")
    print("  - Description (Long text)")
    print("  - Agent Name (Single line text)")
    print("  - Confidence Score (Number)")
    print("  - Revenue Impact (Currency)")
    print("  - Success (Checkbox)")
    print("  - Lead ID (Link to Leads)")
    print("  - SMS SID (Single line text)")
    print("  - Error Message (Long text)")

if __name__ == "__main__":
    print("Airtable setup instructions:")
    setup_leads_table()
    print()
    setup_actions_table()
    print()
    print("After creating tables, run tests to verify schema:")
    print("  pytest tests/test_airtable_service.py -v")
```

- [ ] **Step 3: Create table setup documentation**

Run: `cat > docs/AIRTABLE_SETUP_CHECKLIST.md << 'EOF'`

```markdown
# Airtable Setup Checklist

## Before First Deployment

- [ ] Log into Airtable
- [ ] Create new Base: "HVAC AI Operations - Phase 1"
- [ ] In Base, create two tables:
  - [ ] "Leads" table
  - [ ] "Actions" table
- [ ] Configure Leads table fields (see AIRTABLE_SCHEMA.md)
- [ ] Configure Actions table fields (see AIRTABLE_SCHEMA.md)
- [ ] Set Phone field in Leads table as unique constraint
- [ ] Create API token at https://airtable.com/account/tokens
- [ ] Get Base ID from URL: https://airtable.com/appXXXXXXXXXXXXXX
- [ ] Copy to .env.local:
  ```
  AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
  AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
  ```
- [ ] Get table IDs from table URLs and add to .env.local:
  ```
  AIRTABLE_LEADS_TABLE_ID=tblXXXXXXXXXXXXXX
  AIRTABLE_ACTIONS_TABLE_ID=tblXXXXXXXXXXXXXX
  ```
- [ ] Run: `pytest tests/test_airtable_service.py -v`
- [ ] Verify tests pass

## After First Client Signs

- [ ] Create Leads view: "Today's Leads" (filter by Created At = today, group by Status)
- [ ] Create Actions view: "Today's Actions" (filter by Timestamp = today, sort by Timestamp DESC)
- [ ] Set up automation: Backup to Google Sheets nightly (optional)
```

- [ ] **Step 4: Commit**

```bash
git add docs/AIRTABLE_SCHEMA.md docs/AIRTABLE_SETUP_CHECKLIST.md backend/scripts/setup_airtable.py
git commit -m "docs: add Airtable schema and setup instructions"
```

---

## Chunk 4: n8n Workflow Setup

### Task 10: Create n8n workflow exports

**Files:**
- Create: `n8n/tier1_after_hours_lead_capture.json`
- Create: `n8n/tier1_missed_call_recovery_sms.json`

- [ ] **Step 1: Document n8n workflow structure**

```markdown
# File: docs/N8N_WORKFLOW_SETUP.md

## Tier 1 Workflow Setup

### Workflow 1: tier1_after_hours_lead_capture

**Trigger:** Twilio webhook (inbound SMS)

**Nodes:**
1. **Twilio Webhook** - Receive SMS from Twilio
2. **Extract Data** - Parse phone, message, timestamp
3. **HTTP Request** - Call FastAPI POST /leads/qualify
4. **Conditional** - Check confidence > 0.85?
5. **If High Confidence:** Send SMS + log success
6. **If Low Confidence:** Log human_review_needed
7. **Error Handler** - Catch and log any failures

**Setup Steps:**
1. In n8n, create new workflow
2. Add Webhook node, set to POST /webhook/after-hours
3. Copy n8n webhook URL
4. In Twilio, set webhook for inbound SMS to n8n URL
5. Add HTTP node pointing to FastAPI /leads/qualify
6. Map fields: phone, message, is_new_customer
7. Add conditional based on response.confidence
8. Configure SMS node (Twilio) for high confidence path
9. Add Airtable nodes (if using native n8n integration)
10. Deploy and test

### Workflow 2: tier1_missed_call_recovery_sms

**Trigger:** Jobber missed call webhook

**Nodes:**
1. **Jobber Webhook** - Receive missed call event
2. **Extract Data** - Get phone from event
3. **HTTP Request** - Call FastAPI POST /webhooks/missed-call
4. **Conditional** - Check if should_send?
5. **If Should Send:** Send SMS
6. **Log Action** - Log to Airtable (via FastAPI)
7. **Error Handler** - Catch and log failures

**Setup Steps:**
1. Create new workflow in n8n
2. Add Webhook node, set to POST /webhook/missed-call
3. In Jobber settings, add webhook for missed calls
4. Point to n8n webhook URL
5. Add HTTP node pointing to FastAPI /webhooks/missed-call
6. Add conditional for response.should_send
7. Configure SMS node for positive case
8. Deploy and test

---

## Environment Variables for n8n

```
FASTAPI_URL=https://api.example.com  # FastAPI backend URL
TWILIO_PHONE_NUMBER=+1234567890
AIRTABLE_BASE_ID=appXXXXX
AIRTABLE_API_KEY=patXXXXX
```

## Testing Workflows

1. Send test SMS to Twilio number (after-hours workflow)
2. Trigger test missed call (missed-call workflow)
3. Verify Airtable has new records
4. Check action log in Airtable Actions table
5. Verify SMS was sent (check Twilio logs)
```

- [ ] **Step 2: Create workflow export JSON files**

```json
{
  "file": "n8n/tier1_after_hours_lead_capture.json",
  "content": {
    "meta": {
      "instanceId": "workflow",
      "versionId": "1"
    },
    "nodes": [
      {
        "parameters": {
          "name": "Twilio Webhook - After Hours Lead",
          "path": "webhook/after-hours"
        },
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [250, 300],
        "webhookId": "after-hours-lead"
      },
      {
        "parameters": {
          "url": "={{$env.FASTAPI_URL}}/leads/qualify",
          "method": "POST",
          "jsonBody": true,
          "bodyParameters": {
            "parameters": [
              {
                "name": "phone",
                "value": "={{$node.Webhook.json.From}}"
              },
              {
                "name": "message",
                "value": "={{$node.Webhook.json.Body}}"
              },
              {
                "name": "is_new_customer",
                "value": true
              }
            ]
          }
        },
        "name": "Call FastAPI - Qualify Lead",
        "type": "n8n-nodes-base.httpRequest",
        "typeVersion": 1,
        "position": [450, 300]
      }
    ],
    "connections": {}
  }
}
```

- [ ] **Step 3: Document manual workflow creation process**

Run: Create a detailed guide document instead of JSON export

- [ ] **Step 4: Commit**

```bash
git add docs/N8N_WORKFLOW_SETUP.md
git commit -m "docs: add n8n workflow setup instructions"
```

---

## Chunk 5: Mission Control Dashboard

### Task 11: Build Mission Control dashboard

**Files:**
- Create: `app/mission-control/page.tsx`
- Create: `app/mission-control/components/ActionLog.tsx`
- Create: `app/mission-control/components/ROIMetrics.tsx`
- Create: `app/mission-control/hooks/useActionLog.ts`

- [ ] **Step 1: Create useActionLog hook for polling Airtable**

```typescript
// File: app/mission-control/hooks/useActionLog.ts
import { useState, useEffect, useCallback } from 'react';

export interface Action {
  id: string;
  timestamp: string;
  actionType: string;
  description: string;
  agentName: string;
  confidenceScore: number;
  revenueImpact: number;
  success: boolean;
  errorMessage?: string;
}

export interface ROIMetrics {
  totalActions: number;
  totalRevenue: number;
  leadsInPipeline: number;
  successRate: number;
}

export function useActionLog(pollingInterval: number = 10000) {
  const [actions, setActions] = useState<Action[]>([]);
  const [metrics, setMetrics] = useState<ROIMetrics>({
    totalActions: 0,
    totalRevenue: 0,
    leadsInPipeline: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      // In Phase 1, we'll query Airtable directly via API
      // Later, we'll add a FastAPI endpoint for this
      const response = await fetch('/api/actions', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch actions');

      const data = await response.json();
      setActions(data.actions || []);
      setMetrics(data.metrics || {});
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch immediately
    fetchActions();

    // Poll every N seconds
    const interval = setInterval(fetchActions, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchActions, pollingInterval]);

  return { actions, metrics, loading, error, refetch: fetchActions };
}
```

- [ ] **Step 2: Create ROIMetrics component**

```typescript
// File: app/mission-control/components/ROIMetrics.tsx
import React from 'react';
import { ROIMetrics as ROIMetricsType } from '../hooks/useActionLog';

interface Props {
  metrics: ROIMetricsType;
  loading?: boolean;
}

export function ROIMetrics({ metrics, loading = false }: Props) {
  if (loading) {
    return <div className="text-gray-500">Loading metrics...</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {/* Actions Today */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="text-sm text-gray-600 font-semibold">Actions Today</div>
        <div className="text-3xl font-bold text-blue-600">{metrics.totalActions}</div>
      </div>

      {/* Revenue Recovered */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="text-sm text-gray-600 font-semibold">Revenue Recovered</div>
        <div className="text-3xl font-bold text-green-600">${metrics.totalRevenue}</div>
      </div>

      {/* Leads in Pipeline */}
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="text-sm text-gray-600 font-semibold">Leads in Pipeline</div>
        <div className="text-3xl font-bold text-purple-600">{metrics.leadsInPipeline}</div>
      </div>

      {/* Success Rate */}
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <div className="text-sm text-gray-600 font-semibold">Success Rate</div>
        <div className="text-3xl font-bold text-orange-600">{Math.round(metrics.successRate * 100)}%</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ActionLog table component**

```typescript
// File: app/mission-control/components/ActionLog.tsx
import React from 'react';
import { Action } from '../hooks/useActionLog';

interface Props {
  actions: Action[];
  loading?: boolean;
}

export function ActionLog({ actions, loading = false }: Props) {
  if (loading) {
    return <div className="text-gray-500">Loading action log...</div>;
  }

  if (actions.length === 0) {
    return <div className="text-gray-500 text-center py-8">No actions yet</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Time</th>
            <th className="px-4 py-3 text-left font-semibold">Action</th>
            <th className="px-4 py-3 text-left font-semibold">Agent</th>
            <th className="px-4 py-3 text-left font-semibold">Description</th>
            <th className="px-4 py-3 text-right font-semibold">Confidence</th>
            <th className="px-4 py-3 text-right font-semibold">Revenue</th>
            <th className="px-4 py-3 text-center font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {actions.map((action) => (
            <tr key={action.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {new Date(action.timestamp).toLocaleTimeString()}
              </td>
              <td className="px-4 py-3 font-medium">{action.actionType}</td>
              <td className="px-4 py-3 text-gray-600">{action.agentName}</td>
              <td className="px-4 py-3 text-gray-600">{action.description}</td>
              <td className="px-4 py-3 text-right text-gray-600">
                {(action.confidenceScore * 100).toFixed(0)}%
              </td>
              <td className="px-4 py-3 text-right font-semibold text-green-600">
                ${action.revenueImpact.toFixed(0)}
              </td>
              <td className="px-4 py-3 text-center">
                {action.success ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    ✓
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                    ✗
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Create dashboard page**

```typescript
// File: app/mission-control/page.tsx
'use client';

import React, { useState } from 'react';
import { ROIMetrics } from './components/ROIMetrics';
import { ActionLog } from './components/ActionLog';
import { useActionLog } from './hooks/useActionLog';

export default function MissionControl() {
  const { actions, metrics, loading, error, refetch } = useActionLog(10000); // Poll every 10s
  const [dateFilter, setDateFilter] = useState<string>('today');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mission Control</h1>
        <p className="text-gray-600">Real-time HVAC AI Operations Dashboard</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-semibold">Error loading data:</p>
          <p>{error}</p>
        </div>
      )}

      {/* ROI Metrics */}
      <ROIMetrics metrics={metrics} loading={loading} />

      {/* Action Log */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Action Log (Last 10 Actions)</h2>
          <button
            onClick={refetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <ActionLog actions={actions.slice(0, 10)} loading={loading} />
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600">
        Last updated: {new Date().toLocaleString()} | Auto-refresh: Every 10 seconds
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create API route for dashboard data**

```typescript
// File: app/api/actions/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In Phase 1, query Airtable directly
    // Later, this will call FastAPI backend

    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const AIRTABLE_ACTIONS_TABLE_ID = process.env.AIRTABLE_ACTIONS_TABLE_ID;
    const AIRTABLE_LEADS_TABLE_ID = process.env.AIRTABLE_LEADS_TABLE_ID;

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { error: 'Airtable configuration missing' },
        { status: 500 }
      );
    }

    // Fetch actions from Airtable
    const actionsRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_ACTIONS_TABLE_ID}?sort[0][field]=Timestamp&sort[0][direction]=desc&pageSize=50`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    if (!actionsRes.ok) {
      throw new Error(`Airtable API error: ${actionsRes.status}`);
    }

    const actionsData = await actionsRes.json();
    const actions = actionsData.records.map((record: any) => ({
      id: record.id,
      timestamp: record.fields['Timestamp'],
      actionType: record.fields['Action Type'],
      description: record.fields['Description'],
      agentName: record.fields['Agent Name'],
      confidenceScore: record.fields['Confidence Score'] || 0,
      revenueImpact: record.fields['Revenue Impact'] || 0,
      success: record.fields['Success'] || false,
    }));

    // Calculate metrics
    const totalActions = actions.length;
    const totalRevenue = actions.reduce(
      (sum: number, action: any) => sum + (action.revenueImpact || 0),
      0
    );
    const successRate =
      totalActions > 0
        ? actions.filter((a: any) => a.success).length / totalActions
        : 0;

    // Fetch leads count
    const leadsRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_LEADS_TABLE_ID}?filterByFormula={Status}='awaiting_confirmation'`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    const leadsData = await leadsRes.json();
    const leadsInPipeline = leadsData.records.length;

    return NextResponse.json({
      actions,
      metrics: {
        totalActions,
        totalRevenue,
        leadsInPipeline,
        successRate,
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add app/mission-control/page.tsx app/mission-control/components/ActionLog.tsx app/mission-control/components/ROIMetrics.tsx app/mission-control/hooks/useActionLog.ts app/api/actions/route.ts
git commit -m "feat: build Mission Control dashboard with real-time action log and ROI metrics"
```

---

## Chunk 6: Deployment & Final Testing

### Task 12: Deploy FastAPI backend

**Files:**
- Create: `Procfile` (for Railway/Render)
- Create: `.dockerignore`
- Update: `.env.local`

- [ ] **Step 1: Create Procfile for Railway/Render deployment**

```
# File: Procfile
web: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

- [ ] **Step 2: Test local FastAPI server**

Run: `cd backend && python -m uvicorn main:app --reload`
Expected: Server running on http://localhost:8000

Test endpoint: `curl http://localhost:8000/health`
Expected: `{"status":"healthy"}`

- [ ] **Step 3: Deploy to Railway**

1. Create account at railway.app
2. Connect GitHub repo
3. Add environment variables from .env.local
4. Deploy

Or deploy to Render:

1. Create account at render.com
2. Create new Web Service from GitHub
3. Set build command: `pip install -r backend/requirements.txt`
4. Set start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

- [ ] **Step 4: Test deployed endpoint**

Run: `curl https://your-deployed-api.railway.app/health`
Expected: `{"status":"healthy"}`

- [ ] **Step 5: Commit**

```bash
git add Procfile .dockerignore
git commit -m "chore: add deployment configuration for Railway/Render"
```

---

### Task 13: Deploy Next.js dashboard to Vercel

- [ ] **Step 1: Connect GitHub to Vercel**

1. Go to vercel.com
2. Click "New Project"
3. Select GitHub repo
4. Vercel auto-detects Next.js

- [ ] **Step 2: Add environment variables in Vercel**

```
NEXT_PUBLIC_AIRTABLE_API_KEY=pat...
NEXT_PUBLIC_AIRTABLE_BASE_ID=app...
```

- [ ] **Step 3: Deploy**

Click "Deploy" - Vercel handles the rest

- [ ] **Step 4: Test dashboard**

Visit: https://your-app.vercel.app/mission-control
Expected: Dashboard loads, shows metrics and action log

- [ ] **Step 5: Commit**

```bash
git add vercel.json (if needed)
git commit -m "chore: configure Vercel deployment for Next.js dashboard"
```

---

### Task 14: End-to-end testing checklist

**Files:** None - this is testing

- [ ] **Step 1: Test after-hours SMS workflow**

1. Send test SMS to Twilio number after 7pm (or set up test mode)
2. Verify SMS response received within 2 seconds
3. Check Airtable Leads table - new lead should exist
4. Check Airtable Actions table - "sms_sent" action logged
5. Verify revenue_impact = $150
6. Verify confidence_score > 0.85

- [ ] **Step 2: Test missed call workflow**

1. Trigger test missed call in Jobber
2. Verify SMS response received within 60 seconds
3. Check Airtable - lead and action logged
4. Verify source = "missed_call_recovery"
5. Verify revenue_impact = $150

- [ ] **Step 3: Test dashboard**

1. Open Mission Control: https://your-app.vercel.app/mission-control
2. Verify metrics show: 2 actions, $300 revenue, 2 leads in pipeline
3. Verify both actions visible in action log
4. Click refresh button - should update without delay
5. Verify auto-refresh every 10 seconds

- [ ] **Step 4: Test confidence threshold**

1. Send SMS with very unclear message
2. Verify no SMS response sent
3. Verify action logged with confidence < 0.85
4. Verify status = "human_review_needed"

- [ ] **Step 5: Create final commit with all working**

```bash
git status  # Should be clean
git log --oneline | head -20  # Review commits
git commit -m "chore: phase 1 tier 1 implementation complete and tested" (if any changes)
```

- [ ] **Step 6: Create summary document**

```markdown
# File: docs/PHASE1_COMPLETE.md

## Phase 1 Tier 1 Implementation — Complete

**Date Completed:** [TODAY]
**Status:** ✅ PRODUCTION READY

### What's Deployed

**Backend (FastAPI):**
- ✅ `/leads/qualify` - After-hours SMS qualification
- ✅ `/webhooks/missed-call` - Missed call recovery
- ✅ `/health` - Health check
- ✅ All services: Claude, Airtable, Twilio
- ✅ Comprehensive test coverage (>85%)
- ✅ Deployed to: [Railway/Render URL]

**Frontend (Next.js):**
- ✅ Mission Control dashboard
- ✅ Real-time action log
- ✅ ROI metrics display
- ✅ Auto-refresh every 10 seconds
- ✅ Deployed to: [Vercel URL]

**n8n Workflows:**
- ✅ tier1_after_hours_lead_capture
- ✅ tier1_missed_call_recovery_sms
- ✅ Both running and firing correctly

**Data:**
- ✅ Airtable Leads table
- ✅ Airtable Actions table (audit trail)
- ✅ Schema documented and tested

### ROI Story (Phase 1 Demo)

- **After-hours leads:** $1,500/month (10 leads)
- **Missed calls:** $3,900/month (27% of calls)
- **Total recovery:** $5,400/month
- **Retainer cost:** $1,500/month
- **Net monthly benefit:** $3,900/month
- **Payback period:** ~18 days

### Demo Script

1. Show problem: Losing $5,400/month
2. Send test SMS after-hours → response in 2 sec
3. Trigger test missed call → response in 60 sec
4. Open Mission Control → show $300 recovered, 2 actions logged
5. Close: "In 30 days, that's $5,400 recovered. You pay $1,500."

### Next Steps (Phase 2)

- [ ] First customer signs contract
- [ ] Deploy with their Jobber account
- [ ] Monitor Phase 1 for 30 days (prove ROI)
- [ ] Build Phase 2 features:
  - Speed-to-lead dashboard
  - Daily owner summary email
  - Cancellation fill workflow
  - Invoice reminders
  - Review request automation

### Critical Files

- Backend: `/backend` - FastAPI app
- Frontend: `/app/mission-control` - Dashboard
- Workflows: `/n8n/` - n8n exports
- Docs: `/docs/AIRTABLE_SCHEMA.md`, `/docs/N8N_WORKFLOW_SETUP.md`
- Tests: `/backend/tests` - Comprehensive coverage

### How to Run Locally

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env.local  # Fill with real values
python -m uvicorn main:app --reload

# Frontend
npm run dev  # Opens http://localhost:3000/mission-control

# Tests
pytest tests/ -v --cov=backend
```

---

✅ **Phase 1 Tier 1 implementation is production-ready.**
```

- [ ] **Step 7: Final commit**

```bash
git add docs/PHASE1_COMPLETE.md
git commit -m "docs: phase 1 tier 1 implementation complete and ready for first customer"
```

---

## Summary

**Phase 1 Implementation Plan Complete**

### What You're Getting

✅ **3 Production-Ready Tier 1 Workflows**
- After-hours lead capture ($1,500/month)
- Missed call recovery ($3,900/month)
- Audit trail + ROI logging (retention driver)

✅ **FastAPI Backend**
- 2 endpoints, 3 services, >85% test coverage
- Deployed to Railway/Render
- Full error handling and logging

✅ **Mission Control Dashboard**
- Real-time action log + ROI metrics
- Auto-refreshing every 10 seconds
- Deployed to Vercel

✅ **n8n Workflows**
- Both tier 1 workflows configured
- Integrated with FastAPI backend
- Ready for Jobber/Twilio webhooks

✅ **Complete Airtable Setup**
- Leads table (customer records)
- Actions table (audit trail)
- Schema documented + tested

### Total Work Breakdown

- **6 Chunks** of organized, testable work
- **14 Tasks** with TDD structure
- **100+ Step** guides with exact commands
- **Code Examples** for every implementation
- **Test Coverage** >85% across all services

### Deployment Ready

- FastAPI: Just deploy to Railway/Render with env vars
- Next.js: Just connect GitHub to Vercel
- n8n: Just import workflow JSONs and configure webhooks
- Airtable: Manual setup (documented)

**Status:** ✅ Ready to execute with subagent-driven-development

---

**Last Updated:** 2026-03-14
**Plan Status:** Approved & Detailed
**Next Step:** Use superpowers:subagent-driven-development to execute
