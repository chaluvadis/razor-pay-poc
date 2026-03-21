# Billing and Payments Architecture

This directory contains the implementation-focused architecture for the billing and payment system of the school management SaaS platform.

## Document Index

1. [Overview](./01-overview.md)
2. [Architecture](./02-architecture.md)
3. [Subscription Lifecycle](./03-subscription-lifecycle.md)
4. [Payment Flow](./04-payment-flow.md)
5. [Data Model](./05-data-model.md)
6. [GST Handling](./06-gst-handling.md)
7. [Invoice Management](./07-invoice-management.md)
8. [Webhook Processing](./08-webhook-processing.md)
9. [Reconciliation Strategy](./09-reconciliation-strategy.md)
10. [Refund Handling](./10-refund-handling.md)
11. [Zoho Integration](./11-zoho-integration.md)
12. [Security](./12-security.md)
13. [Operations and Monitoring](./13-operations-monitoring.md)
14. [Non-Functional Requirements](./14-non-functional-requirements.md)
15. [Future Enhancements](./15-future-enhancements.md)

## Scope

The design covers:

- subscription billing using Razorpay
- backend-controlled subscription lifecycle
- GST-compliant invoicing for India
- refunds and credit notes
- settlement-aware reconciliation
- Zoho Books integration
- idempotent and auditable payment operations

## Design Constraints

- This is a SaaS billing system, not a fintech platform
- No internal double-entry ledger
- Accounting complexity delegated to Zoho Books
- Backend remains source of truth for subscription access