# API Reference

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently, no authentication is required for local development. In production, add API key authentication.

## Endpoints

### Rooms

#### List Rooms

```http
GET /rooms
```

**Response:**
```json
{
  "rooms": [
    {
      "id": "uuid",
      "name": "My Room",
      "workflowId": "uuid",
      "status": "IDLE",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Room

```http
GET /rooms/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Room",
  "workflowId": "uuid",
  "status": "RUNNING",
  "currentNodeId": "uuid",
  "context": {},
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:01:00Z"
}
```

#### Create Room

```http
POST /rooms
Content-Type: application/json

{
  "name": "My Room",
  "workflowId": "uuid",
  "config": {
    "timeout": 30000,
    "llmProvider": "openai"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Room",
  "workflowId": "uuid",
  "status": "IDLE",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Run Room

```http
POST /rooms/:id/run
```

Queues room execution in background worker.

**Response:**
```json
{
  "jobId": "uuid",
  "message": "Room execution queued"
}
```

#### Get Room Logs

```http
GET /rooms/:id/logs?limit=100&offset=0
```

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "roomId": "uuid",
      "level": "INFO",
      "message": "Transitioning to node: agent_task_1",
      "metadata": {},
      "timestamp": "2024-01-01T00:00:01Z"
    }
  ],
  "total": 1000
}
```

### Workflows

#### List Workflows

```http
GET /workflows
```

**Response:**
```json
{
  "workflows": [
    {
      "id": "uuid",
      "name": "My Workflow",
      "version": 1,
      "initialNodeId": "uuid",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Workflow

```http
GET /workflows/:id
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Workflow",
  "version": 1,
  "initialNodeId": "uuid",
  "nodes": [
    {
      "id": "uuid",
      "type": "START",
      "config": {},
      "transitions": [
        {
          "id": "uuid",
          "targetNodeId": "uuid",
          "condition": null
        }
      ]
    }
  ],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### Create Workflow

```http
POST /workflows
Content-Type: application/json

{
  "name": "My Workflow",
  "nodes": [
    {
      "type": "START",
      "config": {},
      "transitions": [
        {
          "targetNodeId": "end-node-id",
          "condition": null
        }
      ]
    },
    {
      "type": "END",
      "config": {}
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "My Workflow",
  "version": 1,
  "initialNodeId": "uuid",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Tools

#### List Tools

```http
GET /tools
```

**Response:**
```json
{
  "tools": [
    {
      "name": "calculator",
      "description": "Performs mathematical calculations",
      "parameters": {
        "expression": {
          "type": "string",
          "required": true
        }
      }
    }
  ]
}
```

#### Invoke Tool

```http
POST /tools/:name/invoke
Content-Type: application/json

{
  "input": {
    "expression": "2 + 2"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": 4
  }
}
```

## Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Error Response Format

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Validation failed",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  }
}
```

## Rate Limiting

In production, implement rate limiting:
- 100 requests per minute per IP
- 1000 requests per hour per IP

## Webhooks

Configure webhook URLs to receive room execution events:

```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://example.com/webhook",
  "events": ["room.completed", "room.failed"]
}
```

**Webhook Payload:**
```json
{
  "event": "room.completed",
  "roomId": "uuid",
  "timestamp": "2024-01-01T00:01:00Z",
  "data": {
    "status": "COMPLETED",
    "duration": 5000
  }
}
```

## SDK Usage

### JavaScript/TypeScript

```typescript
import { OpenRoomsClient } from '@openrooms/sdk';

const client = new OpenRoomsClient({
  baseUrl: 'http://localhost:3001',
  apiKey: 'your-api-key' // Production only
});

// Create room
const room = await client.rooms.create({
  name: 'My Room',
  workflowId: 'workflow-id'
});

// Run room
await client.rooms.run(room.id);

// Get logs
const logs = await client.rooms.logs(room.id);
```

### Python

```python
from openrooms import Client

client = Client(
    base_url="http://localhost:3001",
    api_key="your-api-key"  # Production only
)

# Create room
room = client.rooms.create(
    name="My Room",
    workflow_id="workflow-id"
)

# Run room
client.rooms.run(room.id)

# Get logs
logs = client.rooms.logs(room.id)
```
