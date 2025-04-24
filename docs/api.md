# Reciply API Documentation

## Overview

The Reciply API provides endpoints for receipt scanning, expense management, and financial insights. This documentation outlines the available endpoints, request/response formats, and authentication requirements.

## Base URL

```
https://api.reciply.com/v1
```

## Authentication

All API requests require an API key sent in the `X-API-Key` header:

```
X-API-Key: your-api-key
```

## Endpoints

### 1. Scan Receipt

Scans a receipt image and extracts relevant information.

**Endpoint:** `POST /scan`

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Receipt image file (JPEG, PNG)

**Response:**
```json
{
  "items": [
    {
      "name": "Product Name",
      "price": 10.99,
      "category": "Food & Dining",
      "date": "2023-11-15T12:00:00Z"
    }
  ],
  "total": 10.99,
  "merchant": "Store Name",
  "date": "2023-11-15T12:00:00Z",
  "confidence": 0.95
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 500: Server error

### 2. Get Expenses

Retrieves expense history with optional date filtering.

**Endpoint:** `GET /expenses`

**Query Parameters:**
- `start_date` (optional): Start date in ISO format
- `end_date` (optional): End date in ISO format
- `category` (optional): Filter by category
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Pagination offset

**Response:**
```json
{
  "expenses": [
    {
      "id": "exp_123",
      "merchant": "Store Name",
      "amount": 10.99,
      "category": "Food & Dining",
      "date": "2023-11-15T12:00:00Z",
      "items": [
        {
          "name": "Product Name",
          "price": 10.99
        }
      ]
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### 3. Get Insights

Generates personalized spending insights.

**Endpoint:** `GET /insights`

**Query Parameters:**
- `period` (optional): Time period (daily, weekly, monthly)
- `categories` (optional): Comma-separated list of categories

**Response:**
```json
{
  "insights": [
    {
      "type": "spending_pattern",
      "description": "Your spending on Food & Dining has increased by 20% this month",
      "suggestion": "Consider setting a budget for dining out",
      "confidence": 0.85
    }
  ],
  "period": "monthly",
  "generated_at": "2023-11-15T12:00:00Z"
}
```

### 4. Budget Management

**Endpoint:** `GET /budgets`

**Response:**
```json
{
  "budgets": [
    {
      "category": "Food & Dining",
      "amount": 500.00,
      "spent": 350.00,
      "remaining": 150.00,
      "period": "monthly"
    }
  ]
}
```

**Endpoint:** `POST /budgets`

**Request:**
```json
{
  "category": "Food & Dining",
  "amount": 500.00,
  "period": "monthly"
}
```

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

Common error codes:
- `INVALID_REQUEST`: Invalid request parameters
- `UNAUTHORIZED`: Missing or invalid API key
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

## Rate Limiting

- 100 requests per minute
- 1000 requests per hour
- Rate limit headers are included in all responses:
  - `X-RateLimit-Limit`
  - `X-RateLimit-Remaining`
  - `X-RateLimit-Reset`

## Webhooks

Reciply supports webhooks for real-time notifications. Configure webhook endpoints in your dashboard to receive events.

**Event Types:**
- `receipt.scanned`
- `expense.created`
- `budget.exceeded`
- `insight.generated`

**Webhook Payload:**
```json
{
  "event": "receipt.scanned",
  "data": {
    "receipt_id": "rec_123",
    "merchant": "Store Name",
    "amount": 10.99,
    "timestamp": "2023-11-15T12:00:00Z"
  }
}
```

## SDKs

Official SDKs are available for:
- Python
- JavaScript/TypeScript
- Java
- Swift

Example usage (Python):
```python
from reciply import ReciplyClient

client = ReciplyClient(api_key="your-api-key")

# Scan a receipt
with open("receipt.jpg", "rb") as f:
    result = client.scan_receipt(f)

# Get expenses
expenses = client.get_expenses(
    start_date="2023-11-01",
    end_date="2023-11-30"
)
```

## Support

For API support, contact:
- Email: api-support@reciply.com
- Documentation: https://docs.reciply.com
- Status Page: https://status.reciply.com 