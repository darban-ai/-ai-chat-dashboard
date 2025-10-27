# Client Instructions API - Sample JSON Files

This directory contains sample JSON files for the Client Instructions API used by the frontend dashboard to manage AI assistant behavior per client.

## Files

### 1. `full_sample.json`
Complete example showing both client-specific and default instructions with real Homespice Decor data. Use this to understand the full structure.

### 2. `get_response_sample.json`
Example response from `GET /client-configs/{client_id}/instructions` endpoint.

**Includes:**
- `client_id` - Unique client identifier
- `client_name` - Client display name
- `instructions` - Client-specific instructions
- `defaults` - Default fallback instructions
- `last_updated` - Timestamp of last modification
- `updated_by` - User who made the last update

### 3. `post_request_sample.json`
Example request body for `POST /client-configs/{client_id}/instructions` endpoint.

**Only includes:**
- `instructions` - The updated client instructions object

### 4. `schema_reference.json`
Technical schema reference showing field types, descriptions, and validation rules.

## API Endpoints

### GET `/client-configs/{client_id}/instructions`

**Purpose:** Retrieve instructions for a specific client

**Response:** See `get_response_sample.json`

**Status Codes:**
- `200` - Success
- `404` - Client not found
- `500` - Server error

---

### POST `/client-configs/{client_id}/instructions`

**Purpose:** Update instructions for a specific client

**Request Body:** See `post_request_sample.json`

**Response:** Updated instructions object (same format as GET)

**Status Codes:**
- `200` - Successfully updated
- `400` - Invalid request body
- `404` - Client not found
- `500` - Server error

## Instruction Categories

Each instruction category has:
- `heading` - Display name for the UI (e.g., "About the Business")
- `content` - Actual instruction text (markdown) or structured data

### Standard Categories:

1. **about** - Business description, products, services
2. **tone** - Brand voice and communication style
3. **response_style** - Formatting and length preferences
4. **restrictions** - What NOT to disclose + language rules
5. **contact_info** - Customer service contact details (structured: email/phone)
6. **custom_instructions** - Engagement rules, escalation logic, edge cases

## Frontend UI Guidelines

**Display Pattern:**
```
┌─────────────────────────────────────────────────────┐
│ About the Business                                  │
├─────────────────────────────────────────────────────┤
│ Client:   [Client-specific content or "Using       │
│            default"]                                │
│ Default:  [Default content]                        │
└─────────────────────────────────────────────────────┘
```

**Field Behavior:**
- If client field is empty/null → show "Using default" and highlight the default value
- Show both client and default side-by-side for easy comparison
- Markdown rendering for all text content
- Special handling for `contact_info.content` (structured JSON with email/phone)

## Notes

- All text fields support **GitHub-flavored Markdown**
- `contact_info.content` is the **only structured object** (email/phone)
- All other content fields are **free-form markdown strings**
- Defaults are **read-only** in the UI (system-wide fallbacks)
- Client instructions can be **edited per client**
- Empty client fields automatically **fall back to defaults** in the backend

## Example Usage

**Fetching instructions:**
```bash
GET /client-configs/client_123/instructions
```

**Updating instructions:**
```bash
POST /client-configs/client_123/instructions
Content-Type: application/json

{
  "instructions": {
    "about": {
      "heading": "About the Business",
      "content": "Updated content..."
    },
    ...
  }
}
```
