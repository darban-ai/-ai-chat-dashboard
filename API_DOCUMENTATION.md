# Client Instructions API Documentation

## Base URL
```
https://hbao5egnck.execute-api.us-east-1.amazonaws.com/production
```

## Authentication
Currently no authentication required. (TODO: Add authentication layer)

---

## Endpoints

### GET `/client-configs/{client_id}/instructions`

Retrieve instructions for a specific client.

#### Request

**Method:** `GET`

**URL Parameters:**
- `client_id` (string, required) - The unique client identifier (e.g., `cid-83f1d585a5e842249c1fd1f177c2dfac`)

**Headers:**
```
Content-Type: application/json
```

#### Response

**Status Code:** `200 OK`

**Response Body:**
```json
{
  "client_id": "cid-83f1d585a5e842249c1fd1f177c2dfac",
  "client_name": "homespice-com.myshopify.com",
  "instructions": {
    "about": {
      "heading": "About the Business",
      "content": "Business description in markdown format..."
    },
    "tone": {
      "heading": "Tone & Brand Voice",
      "content": "Tone guidelines in markdown format..."
    },
    "response_style": {
      "heading": "Response Style",
      "content": "Response style guidelines in markdown format..."
    },
    "restrictions": {
      "heading": "Restrictions & Language Rules",
      "content": "Restriction rules in markdown format..."
    },
    "contact_info": {
      "heading": "Contact Information",
      "content": {
        "email": "sales@example.com",
        "phone": "+1 800 000 0000"
      }
    },
    "custom_instructions": {
      "heading": "Custom Instructions",
      "content": "Custom instructions in markdown format..."
    }
  },
  "defaults": {
    "about": { ... },
    "tone": { ... },
    "response_style": { ... },
    "restrictions": { ... },
    "contact_info": { ... },
    "custom_instructions": { ... }
  },
  "last_updated": "2025-10-25T09:47:29.084924+00:00",
  "updated_by": "system"
}
```

#### Example Request

```bash
curl https://hbao5egnck.execute-api.us-east-1.amazonaws.com/production/client-configs/cid-83f1d585a5e842249c1fd1f177c2dfac/instructions
```

```javascript
// JavaScript/Fetch
const response = await fetch(
  'https://hbao5egnck.execute-api.us-east-1.amazonaws.com/production/client-configs/cid-83f1d585a5e842249c1fd1f177c2dfac/instructions'
);
const data = await response.json();
```

---

### POST `/client-configs/{client_id}/instructions`

Update instructions for a specific client.

#### Request

**Method:** `POST`

**URL Parameters:**
- `client_id` (string, required) - The unique client identifier

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "instructions": {
    "about": {
      "heading": "About the Business",
      "content": "Updated business description..."
    },
    "tone": {
      "heading": "Tone & Brand Voice",
      "content": "Updated tone guidelines..."
    },
    "response_style": {
      "heading": "Response Style",
      "content": "Updated response style..."
    },
    "restrictions": {
      "heading": "Restrictions & Language Rules",
      "content": "Updated restrictions..."
    },
    "contact_info": {
      "heading": "Contact Information",
      "content": {
        "email": "updated@example.com",
        "phone": "+1 800 111 2222"
      }
    },
    "custom_instructions": {
      "heading": "Custom Instructions",
      "content": "Updated custom instructions..."
    }
  }
}
```

#### Response

**Status Code:** `200 OK`

**Response Body:**
Same format as GET response with updated values.

#### Example Request

```bash
curl -X POST \
  https://hbao5egnck.execute-api.us-east-1.amazonaws.com/production/client-configs/cid-83f1d585a5e842249c1fd1f177c2dfac/instructions \
  -H "Content-Type: application/json" \
  -d '{
    "instructions": {
      "about": {
        "heading": "About the Business",
        "content": "Updated content..."
      },
      ...
    }
  }'
```

```javascript
// JavaScript/Fetch
const response = await fetch(
  'https://hbao5egnck.execute-api.us-east-1.amazonaws.com/production/client-configs/cid-83f1d585a5e842249c1fd1f177c2dfac/instructions',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      instructions: {
        about: {
          heading: 'About the Business',
          content: 'Updated content...'
        },
        // ... other categories
      }
    })
  }
);
const data = await response.json();
```

---

## Data Schema

### Instruction Categories

All 6 categories are **required** in POST requests:

1. **about** - Business description and background
2. **tone** - Brand voice and communication style
3. **response_style** - Response formatting preferences
4. **restrictions** - What NOT to disclose and language rules
5. **contact_info** - Customer service contact details
6. **custom_instructions** - Engagement rules, escalation logic

### Field Structure

Each category has:
- `heading` (string) - Display heading for the UI
- `content` (string or object) - The actual content

**Special Case - contact_info:**
- `content` is an **object** with `email` and `phone` fields
- All other categories have `content` as a **markdown string**

### Content Formatting

- All text content supports **GitHub-flavored Markdown**
- `contact_info.content` is the only structured object
- Empty/null client fields automatically fall back to defaults

---

## Error Responses

### 400 Bad Request
Invalid request body or missing required fields.

```json
{
  "error": "Invalid request body: Missing required category: about"
}
```

### 404 Not Found
Client ID does not exist.

```json
{
  "error": "Client not found"
}
```

### 500 Internal Server Error
Database or server error.

```json
{
  "error": "Internal server error"
}
```

---

## UI Display Guidelines

### Show Client vs Default Values

Display pattern for each category:
```
┌─────────────────────────────────────────────────────┐
│ About the Business                                  │
├─────────────────────────────────────────────────────┤
│ Client:   [Client-specific content or "Using       │
│            default"]                                │
│ Default:  [Default content]                        │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- If client field is empty/null → show "Using default" and highlight the default value
- Show both client and default side-by-side for easy comparison
- Render markdown for all text content
- Special handling for `contact_info.content` (display email/phone fields)

### Contact Information Display

The `contact_info.content` object should be displayed as structured fields:

**Client Instructions:**
```
Email: [input field]
Phone: [input field]
```

**Defaults** (from API response, note the markdown format):
```
**Email:** sales@homespicedecor.com
**Phone:** +1 770 934 4224
```

---

## Notes

- Defaults are **read-only** (system-wide fallbacks)
- Client instructions can be **edited per client**
- Empty client fields automatically **fall back to defaults** in the backend
- The backend updates both the JSON and compiled text formats automatically
- `last_updated` and `updated_by` are informational only (not editable)

---

## Sample Payload Files

Complete sample payloads are available in `technical-docs/api_samples/`:
- `get_response_sample.json` - Full GET response example
- `post_request_sample.json` - POST request body template
- `full_sample.json` - Complete example with real data
- `schema_reference.json` - Technical schema reference
