# IntaSend Webhook Processing & Subscription Activation Implementation

## Overview
This implementation provides complete end-to-end webhook processing for IntaSend payment notifications and automatic subscription activation.

## Implementation Details

### 1. Database Schema Changes
- **Added `IntaSendWebhookEvent` model** for audit trail persistence
- **Updated `Transaction` model** with `billingCycle` field for proper subscription activation
- **Removed `LIFETIME` from `BillingCycle` enum** - only MONTHLY and YEARLY supported

### 2. Enhanced Payment Service (`payment.service.ts`)

#### Payment Initiation
- Creates transaction record with `invoice_id` mapping (`providerRef`)
- Stores billing cycle information for subscription activation
- Maps payment link ID to transaction for webhook lookup

#### Webhook Processing (`handleWebhook`)
1. **Persist webhook for audit** - Immediately stores raw payload and signature
2. **Verify signature** - Uses IntaSend secret to validate webhook authenticity  
3. **Fetch transaction** - Looks up transaction by `invoice_id` mapping
4. **Update transaction status** - Maps IntaSend status to internal status
5. **Activate subscription** - For COMPLETED/PAID status, calls `subscriptionService.activateSubscription`
6. **Mark as processed** - Updates webhook event with processing timestamp

#### Status Mapping
- `COMPLETED` or `PAID` → `COMPLETED` (triggers subscription activation)
- `FAILED` → `FAILED`
- `CANCELLED` → `CANCELLED`
- All others → `PENDING`

### 3. Enhanced Subscription Controller (`subscription.controller.ts`)

#### Webhook Endpoint (`POST /v1/subscription/intasend/webhook`)
- **Quick HTTP 200 response** - Returns immediately with `{ status: 'received' }`
- **Asynchronous processing** - Uses `setImmediate` for background processing
- **Signature validation** - Checks for `x-intasend-signature` header
- **Error resilience** - Logs errors but doesn't throw to prevent retry loops

### 4. Comprehensive Testing

#### Payment Service Tests (`payment.service.spec.ts`)
- Payment initiation with billing cycle storage
- Webhook processing with signature verification
- Transaction status updates and subscription activation
- Audit trail persistence
- Error handling for invalid signatures and missing transactions
- Support for both COMPLETED and PAID statuses

#### Controller Integration Tests (`subscription.controller.spec.ts`)
- Webhook endpoint with mocked signatures
- Asynchronous processing validation
- Error handling without HTTP errors
- Missing signature graceful handling
- Performance testing (quick response times)

## Key Features

### ✅ Signature Verification
- Uses `x-intasend-signature` header
- HMAC-SHA256 verification against webhook secret
- Configurable via `INTASEND_WEBHOOK_SECRET` environment variable

### ✅ Audit Trail
- All webhook events persisted to `intasend_webhook_events` table
- Stores raw payload, signature, and processing status
- Immutable record for compliance and debugging

### ✅ Quick HTTP 200 Response
- Webhook endpoint responds within milliseconds
- Background processing prevents IntaSend timeouts
- Prevents webhook retry loops on processing errors

### ✅ Subscription Activation
- Automatic activation on COMPLETED/PAID status
- Proper billing cycle mapping (MONTHLY/YEARLY)
- Transaction linking for subscription tracking

### ✅ Error Resilience
- Invalid signatures logged but don't cause HTTP errors
- Missing transactions logged but don't cause HTTP errors
- Processing errors logged but don't prevent webhook acknowledgment

## Usage

### Environment Variables Required
```bash
INTASEND_WEBHOOK_SECRET=your_webhook_secret_here
WEBHOOK_BASE_URL=https://yourdomain.com
```

### Webhook URL
```
POST https://yourdomain.com/v1/subscription/intasend/webhook
```

### Expected Webhook Payload
```json
{
  "event": "collection.payment.complete",
  "invoice_id": "invoice_12345",
  "state": "COMPLETED",
  "value": 2999,
  "account": "test_account",
  "api_ref": "sub_plan_user_timestamp"
}
```

### Response
```json
{
  "status": "received"
}
```

## Testing

Run the test suites:
```bash
# Payment service tests
npm test -- payment.service.spec.ts

# Controller integration tests  
npm test -- subscription.controller.spec.ts
```

## Migration

After deploying these changes, run:
```bash
npx prisma db push
# or
npx prisma migrate dev
```

This will apply the database schema changes for the new webhook audit table and billing cycle field.
