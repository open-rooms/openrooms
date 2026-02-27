# API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Currently no authentication. Implement as needed for production.

## Endpoints

### Health Check

#### `GET /api/health`

Check API and dependencies health.

**Response:**
```json
{
  "status": "healthy",
  "redis": "up",
  "database": "up",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Rooms

#### `POST /api/rooms`

Create a new room.

**Request Body:**
```json
{
  "name": "My Room",
  "description": "Optional description",
  "workflowId": "uuid-of-workflow",
  "config": {
    "maxExecutionTime": 300000,
    "maxTokens": 4000,
    "temperature": 0.7
  }
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "My Room",
  "description": "Optional description",
  "status": "IDLE",
  "workflowId": "uuid-of-workflow",
  "currentNodeId": null,
  "config": {...},
  "metadata": {},
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/rooms`

List all rooms.

**Query Parameters:**
- `status`: Filter by status (IDLE, RUNNING, COMPLETED, FAILED)
- `workflowId`: Filter by workflow ID
- `limit`: Max results (default: unlimited)
- `offset`: Pagination offset

**Response:**
```json
{
  "rooms": [...],
  "count": 10
}
```

#### `GET /api/rooms/:id`

Get room details.

**Response:**
```json
{
  "id": "uuid",
  "name": "My Room",
  "status": "IDLE",
  ...
}
```

#### `POST /api/rooms/:id/run`

Execute a room (async).

**Response:**
```json
{
  "message": "Room execution started",
  "roomId": "uuid"
}
```

#### `GET /api/rooms/:id/status`

Get room execution status.

**Response:**
```json
{
  "room": {
    "id": "uuid",
    "status": "RUNNING",
    ...
  },
  "state": {
    "roomId": "uuid",
    "currentNodeId": "node-uuid",
    "status": "RUNNING",
    "variables": {},
    "executionStack": [],
    "startTime": "2024-01-01T00:00:00.000Z",
    "lastUpdateTime": "2024-01-01T00:00:01.000Z"
  }
}
```

#### `GET /api/rooms/:id/logs`

Get room execution logs.

**Query Parameters:**
- `limit`: Max results (default: 100)
- `offset`: Pagination offset
- `level`: Filter by log level (DEBUG, INFO, WARN, ERROR, FATAL)

**Response:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "roomId": "uuid",
      "workflowId": "uuid",
      "nodeId": "uuid",
      "eventType": "NODE_EXECUTED",
      "level": "INFO",
      "message": "Node executed successfully",
      "data": {...},
      "timestamp": "2024-01-01T00:00:00.000Z",
      "duration": 123
    }
  ],
  "count": 1
}
```

#### `POST /api/rooms/:id/pause`

Pause room execution.

**Response:**
```json
{
  "message": "Room paused"
}
```

#### `POST /api/rooms/:id/resume`

Resume room execution.

**Response:**
```json
{
  "message": "Room resumed"
}
```

#### `DELETE /api/rooms/:id`

Delete a room.

**Response:** `204 No Content`

---

### Workflows

#### `POST /api/workflows`

Create a workflow.

**Request Body:**
```json
{
  "name": "My Workflow",
  "description": "Optional description",
  "initialNodeId": "uuid-of-start-node"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "My Workflow",
  "description": "Optional description",
  "version": 1,
  "status": "DRAFT",
  "initialNodeId": "uuid-of-start-node",
  "metadata": {},
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### `GET /api/workflows`

List all workflows.

**Response:**
```json
{
  "workflows": [...],
  "count": 5
}
```

#### `GET /api/workflows/:id`

Get workflow details.

**Response:**
```json
{
  "id": "uuid",
  "name": "My Workflow",
  ...
}
```

#### `GET /api/workflows/:id/nodes`

Get workflow nodes.

**Response:**
```json
{
  "nodes": [
    {
      "id": "uuid",
      "workflowId": "uuid",
      "type": "START",
      "name": "Start",
      "config": {},
      "transitions": [
        {
          "condition": "ALWAYS",
          "targetNodeId": "next-node-uuid"
        }
      ],
      "metadata": {},
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 3
}
```

#### `DELETE /api/workflows/:id`

Delete a workflow.

**Response:** `204 No Content`

---

### Tools

#### `GET /api/tools`

List all registered tools.

**Response:**
```json
{
  "tools": [
    {
      "id": "uuid",
      "name": "calculator",
      "description": "Performs arithmetic calculations",
      "category": "COMPUTATION",
      "version": "1.0.0",
      "parameters": [
        {
          "name": "expression",
          "description": "Mathematical expression",
          "type": "string",
          "required": true
        }
      ],
      "returnType": {...},
      "timeout": 5000,
      "metadata": {}
    }
  ],
  "count": 3
}
```

#### `GET /api/tools/:id`

Get tool details.

**Response:**
```json
{
  "id": "uuid",
  "name": "calculator",
  ...
}
```

---

## Error Responses

All endpoints may return error responses:

```json
{
  "error": "Error name",
  "message": "Detailed error message",
  "statusCode": 400
}
```

Common status codes:
- `400`: Bad Request - Invalid input
- `404`: Not Found - Resource doesn't exist
- `500`: Internal Server Error - Server-side error
- `503`: Service Unavailable - Health check failed

## Data Types

### RoomStatus
- `IDLE`: Room created but not started
- `RUNNING`: Currently executing
- `PAUSED`: Execution paused
- `COMPLETED`: Successfully completed
- `FAILED`: Execution failed
- `CANCELLED`: Execution cancelled

### NodeType
- `START`: Entry point
- `AGENT_TASK`: LLM agent execution
- `TOOL_EXECUTION`: Tool invocation
- `DECISION`: Conditional branching
- `PARALLEL`: Parallel execution
- `WAIT`: Delay execution
- `END`: Exit point

### TransitionCondition
- `ALWAYS`: Always transition
- `SUCCESS`: On successful execution
- `FAILURE`: On execution failure
- `TIMEOUT`: On timeout
- `CONDITION_MET`: Custom condition

### ExecutionEventType
- `ROOM_CREATED`, `ROOM_STARTED`, `ROOM_COMPLETED`, `ROOM_FAILED`
- `NODE_ENTERED`, `NODE_EXECUTED`, `NODE_EXITED`, `NODE_FAILED`
- `TOOL_INVOKED`, `TOOL_COMPLETED`, `TOOL_FAILED`
- `AGENT_INVOKED`, `AGENT_RESPONSE`, `AGENT_ERROR`
- `TRANSITION`, `STATE_UPDATED`, `MEMORY_UPDATED`

### LogLevel
- `DEBUG`: Detailed debugging
- `INFO`: Informational
- `WARN`: Warning
- `ERROR`: Error
- `FATAL`: Critical error

## Rate Limiting

Not currently implemented. Recommended for production:
- 100 requests/minute per IP for room creation
- 10 concurrent room executions per user
- Tool-specific rate limits (see tool definition)
