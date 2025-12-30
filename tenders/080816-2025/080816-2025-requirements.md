---
tender_id: "080816-2025"
total_requirements: 27
must_have: 12
should_have: 10
could_have: 5
total_effort_days: 105
generated_date: "2025-12-18"
---

# Technical Requirements Specification

## Requirements Summary

| Priority | Count | Effort (Days) | Description |
|----------|-------|---------------|-------------|
| P0 - Must Have | 12 | 55 | Critical for contract compliance |
| P1 - Should Have | 10 | 35 | Important for quality scoring |
| P2 - Could Have | 5 | 15 | Differentiators and nice-to-haves |
| **Total** | **27** | **105** | |

---

## P0 - Must Have Requirements

### REQ-001: Vehicle Tracking and Fleet Management
- **Priority**: P0 (Must Have)
- **Effort**: 5 days
- **Category**: Fleet Operations
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: None
- **Description**: Real-time GPS tracking of all commercial waste collection vehicles with historical route data, vehicle status monitoring, and fleet performance analytics.

**Acceptance Criteria**:
- [ ] Real-time vehicle location displayed on map interface
- [ ] Historical route playback for any date range
- [ ] Vehicle status indicators (active, idle, off-route)
- [ ] Fleet utilization reports and dashboards
- [ ] Integration with existing telematics hardware

---

### REQ-002: Mobile Working for Field Crews
- **Priority**: P0 (Must Have)
- **Effort**: 8 days
- **Category**: Fleet Operations
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-001
- **Description**: In-cab mobile application for drivers providing collection lists, navigation, job status updates, customer information, and issue reporting.

**Acceptance Criteria**:
- [ ] Mobile app works on Android tablets (industry standard)
- [ ] Offline capability for areas with poor connectivity
- [ ] Collection list with customer details and special instructions
- [ ] One-tap job completion with optional notes
- [ ] Photo capture for issues/contamination evidence
- [ ] Turn-by-turn navigation integration
- [ ] Synchronization within 30 seconds when online

---

### REQ-003: Route Planning and Optimization
- **Priority**: P0 (Must Have)
- **Effort**: 6 days
- **Category**: Fleet Operations
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-001, REQ-002
- **Description**: Dynamic route optimization based on vehicle capacity, time windows, traffic conditions, and service requirements.

**Acceptance Criteria**:
- [ ] Automated route generation based on collection schedule
- [ ] Manual route adjustment capability
- [ ] Multi-constraint optimization (capacity, time, distance)
- [ ] Traffic-aware routing with real-time updates
- [ ] Route efficiency metrics and reporting
- [ ] What-if scenario modeling for route changes

---

### REQ-004: Customer and Contract Management (CRM)
- **Priority**: P0 (Must Have)
- **Effort**: 5 days
- **Category**: Customer Management
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: None
- **Description**: Comprehensive CRM for managing commercial waste customers including contact details, sites, contracts, service history, and communications.

**Acceptance Criteria**:
- [ ] Customer master data with multiple contact roles
- [ ] Multi-site customer support
- [ ] Contract lifecycle management (draft, active, expired)
- [ ] Service history and interaction logging
- [ ] Document attachment and storage
- [ ] Customer communication templates
- [ ] Search and filter across all customer data

---

### REQ-005: Sales Quoting and E-Contracting
- **Priority**: P0 (Must Have)
- **Effort**: 4 days
- **Category**: Customer Management
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: REQ-004
- **Description**: Sales workflow from lead to signed contract with quote generation, approval workflows, and electronic signature capability.

**Acceptance Criteria**:
- [ ] Quote builder with service and pricing configuration
- [ ] Quote approval workflow (tiered by value)
- [ ] Quote versioning and comparison
- [ ] E-signature integration (DocuSign or equivalent)
- [ ] Automated contract generation from accepted quote
- [ ] Quote expiry and follow-up reminders

---

### REQ-006: On-board Dynamic Weighing and Pay-by-Weight
- **Priority**: P0 (Must Have)
- **Effort**: 8 days
- **Category**: Weighing Systems
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-002, REQ-004
- **Description**: Integration with on-board weighing systems for pay-by-weight commercial waste billing with real-time weight capture and invoice generation.

**Acceptance Criteria**:
- [ ] Integration with major weighing equipment (VPG, Loadman, etc.)
- [ ] Real-time weight capture per lift
- [ ] Weight data linked to customer and container
- [ ] Exception handling for outlier weights
- [ ] Weight-based invoice line item generation
- [ ] Weight dispute management workflow
- [ ] Audit trail for all weight data

---

### REQ-007: Weighbridge Operations
- **Priority**: P0 (Must Have)
- **Effort**: 5 days
- **Category**: Weighing Systems
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-004
- **Description**: Transfer station weighbridge management including vehicle registration, gross/tare weighing, waste categorization, and customer billing.

**Acceptance Criteria**:
- [ ] Weighbridge hardware integration
- [ ] Vehicle registration and ANPR capability
- [ ] Gross/tare/net weight calculation
- [ ] Waste type classification (EWC codes)
- [ ] Automatic ticket printing
- [ ] Customer account charging
- [ ] Daily reconciliation reports

---

### REQ-008: Invoicing, Credits, and Cash Processing
- **Priority**: P0 (Must Have)
- **Effort**: 5 days
- **Category**: Financial
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: REQ-004, REQ-006, REQ-007
- **Description**: Automated invoicing from service delivery data with credit note processing, payment allocation, and cash handling for weighbridge.

**Acceptance Criteria**:
- [ ] Automated invoice generation from completed services
- [ ] Multiple billing frequencies (weekly, monthly, ad-hoc)
- [ ] Credit note workflow with approval
- [ ] Payment allocation to invoices
- [ ] Cash handling for weighbridge with till reconciliation
- [ ] Direct Debit integration capability
- [ ] Invoice delivery (email, portal, post)

---

### REQ-009: Oracle Fusion Integration
- **Priority**: P0 (Must Have)
- **Effort**: 10 days
- **Category**: Integration
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-008
- **Description**: Bi-directional integration with Oracle Fusion ERP for financial data including invoices, payments, credit notes, and general ledger postings.

**Acceptance Criteria**:
- [ ] Invoice export to Oracle Fusion Accounts Receivable
- [ ] Payment import from Oracle Fusion
- [ ] Credit note synchronization
- [ ] GL journal creation for revenue recognition
- [ ] Customer master data synchronization
- [ ] Real-time or scheduled sync options
- [ ] Error handling and retry logic
- [ ] Reconciliation reporting between systems

---

### REQ-010: Data Migration
- **Priority**: P0 (Must Have)
- **Effort**: 8 days
- **Category**: Implementation
- **Award Criteria**: Implementation Approach (60%)
- **Dependencies**: REQ-004, REQ-006
- **Description**: Complete migration of customer, contract, service, and financial data from existing AMCS system with data validation and cleansing.

**Acceptance Criteria**:
- [ ] Data extraction from AMCS 7
- [ ] Data mapping and transformation specification
- [ ] Data cleansing and deduplication
- [ ] Migration validation rules and reports
- [ ] Trial migration with comparison reporting
- [ ] Sign-off process for data accuracy
- [ ] Rollback capability

---

### REQ-011: User Training
- **Priority**: P0 (Must Have)
- **Effort**: 4 days
- **Category**: Implementation
- **Award Criteria**: Implementation Approach (60%)
- **Dependencies**: All functional requirements
- **Description**: Comprehensive training program for all user roles including back-office, mobile crews, supervisors, and system administrators.

**Acceptance Criteria**:
- [ ] Role-based training curriculum
- [ ] Train-the-trainer program for sustainability
- [ ] Training materials (guides, videos, quick reference)
- [ ] Hands-on practice environment
- [ ] Training completion tracking
- [ ] Post-training assessment

---

### REQ-012: System Support and Maintenance
- **Priority**: P0 (Must Have)
- **Effort**: 3 days (SLA definition)
- **Category**: Support
- **Award Criteria**: Service & Support (60%)
- **Dependencies**: None
- **Description**: Ongoing system support including help desk, bug fixes, security patches, and system maintenance with defined SLAs.

**Acceptance Criteria**:
- [ ] Help desk available during business hours (minimum 8-5 Mon-Fri)
- [ ] Critical issue response within 4 hours
- [ ] High priority issue response within 8 hours
- [ ] Medium priority issue response within 2 business days
- [ ] Security patches applied within 30 days of release
- [ ] Planned maintenance with 5 business days notice
- [ ] 99.5% uptime SLA (excluding planned maintenance)

---

## P1 - Should Have Requirements

### REQ-013: Container and Asset Management
- **Priority**: P1 (Should Have)
- **Effort**: 4 days
- **Category**: Asset Management
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: REQ-004
- **Description**: Track bins, containers, and other assets including location, condition, service history, and lifecycle management.

**Acceptance Criteria**:
- [ ] Asset register with unique identifiers (barcode/RFID)
- [ ] Asset allocation to customer sites
- [ ] Condition tracking and maintenance scheduling
- [ ] Asset exchange and collection workflows
- [ ] Lost/damaged asset billing
- [ ] Asset utilization reporting

---

### REQ-014: Supplier Management
- **Priority**: P1 (Should Have)
- **Effort**: 3 days
- **Category**: Operations
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: None
- **Description**: Management of subcontractors and suppliers including purchase orders, service delivery tracking, and cost allocation.

**Acceptance Criteria**:
- [ ] Supplier master data management
- [ ] Purchase order creation and approval
- [ ] Delivery/service confirmation
- [ ] Supplier invoice matching
- [ ] Cost allocation to customers/contracts
- [ ] Supplier performance tracking

---

### REQ-015: Financial Management and Ledgering
- **Priority**: P1 (Should Have)
- **Effort**: 4 days
- **Category**: Financial
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: REQ-008, REQ-009
- **Description**: Detailed financial reporting and cost tracking including revenue analysis, cost allocation, profitability reporting, and budget management.

**Acceptance Criteria**:
- [ ] Revenue by customer/route/waste type
- [ ] Cost allocation to services
- [ ] Profitability analysis by customer segment
- [ ] Budget vs actual reporting
- [ ] Aged debtor analysis
- [ ] Financial dashboard with KPIs

---

### REQ-016: Performance Reporting and Analytics
- **Priority**: P1 (Should Have)
- **Effort**: 4 days
- **Category**: Reporting
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: REQ-001, REQ-002, REQ-003, REQ-004
- **Description**: Comprehensive reporting and analytics covering operational, financial, and customer service performance metrics.

**Acceptance Criteria**:
- [ ] Pre-built operational dashboards
- [ ] Collection performance metrics (on-time %, missed collections)
- [ ] Fleet efficiency metrics
- [ ] Customer satisfaction indicators
- [ ] Ad-hoc report builder
- [ ] Scheduled report delivery
- [ ] Export to Excel/PDF

---

### REQ-017: Customer Self-Service Portal
- **Priority**: P1 (Should Have)
- **Effort**: 6 days
- **Category**: Customer Management
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-004, REQ-008
- **Description**: Online portal for commercial waste customers to manage their accounts, view invoices, request services, and report issues.

**Acceptance Criteria**:
- [ ] Secure login with multi-factor authentication
- [ ] Account overview with service summary
- [ ] Invoice viewing and download
- [ ] Payment history
- [ ] Service request submission
- [ ] Collection schedule viewing
- [ ] Issue reporting (missed collection, contamination)
- [ ] Mobile-responsive design

---

### REQ-018: Citizen Access Portal Integration
- **Priority**: P1 (Should Have)
- **Effort**: 5 days
- **Category**: Integration
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-017
- **Description**: Integration with council's corporate citizen access portal for seamless authentication and service access.

**Acceptance Criteria**:
- [ ] Single sign-on (SSO) integration
- [ ] User account linking/provisioning
- [ ] Consistent branding with council portal
- [ ] Service catalog integration
- [ ] Notification integration (portal inbox, email)

---

### REQ-019: Real-time Operational Dashboard
- **Priority**: P1 (Should Have)
- **Effort**: 3 days
- **Category**: Operations
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: REQ-001, REQ-002
- **Description**: Live operational dashboard showing current fleet status, job progress, issues, and alerts for supervisors and managers.

**Acceptance Criteria**:
- [ ] Real-time vehicle positions on map
- [ ] Job completion progress indicators
- [ ] Alert notifications for issues
- [ ] Drill-down to individual vehicles/routes
- [ ] Auto-refresh without page reload
- [ ] Configurable alert thresholds

---

### REQ-020: Regulatory Reporting
- **Priority**: P1 (Should Have)
- **Effort**: 3 days
- **Category**: Reporting
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: REQ-007
- **Description**: Pre-built reports for regulatory compliance including EA/SEPA waste returns, duty of care, and Simpler Recycling compliance.

**Acceptance Criteria**:
- [ ] Quarterly waste returns (EA format)
- [ ] Duty of care waste transfer notes
- [ ] Simpler Recycling compliance reporting
- [ ] EWC code reporting
- [ ] Data export in required formats
- [ ] Audit trail for regulatory submissions

---

### REQ-021: Professional Implementation Services
- **Priority**: P1 (Should Have)
- **Effort**: Included in project
- **Category**: Implementation
- **Award Criteria**: Implementation Approach (60%)
- **Dependencies**: All requirements
- **Description**: Full professional services for implementation including project management, solution design, configuration, testing, and go-live support.

**Acceptance Criteria**:
- [ ] Dedicated project manager
- [ ] Structured implementation methodology
- [ ] Regular steering group meetings
- [ ] RAID log and issue management
- [ ] Go-live readiness assessment
- [ ] Hypercare support period (minimum 4 weeks)

---

### REQ-022: Hardware Provision
- **Priority**: P1 (Should Have)
- **Effort**: 3 days (specification)
- **Category**: Implementation
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-002, REQ-006, REQ-007
- **Description**: Supply and support of hardware for mobile working and weighing including tablets, mounts, weighing equipment integration.

**Acceptance Criteria**:
- [ ] Rugged tablet specification for vehicles
- [ ] Vehicle mounting solutions
- [ ] Weighing equipment compatibility certification
- [ ] Hardware warranty and replacement SLA
- [ ] Spare pool for rapid replacement
- [ ] Hardware refresh roadmap

---

## P2 - Could Have Requirements

### REQ-023: Dynamic Pricing Engine
- **Priority**: P2 (Could Have)
- **Effort**: 4 days
- **Category**: Commercial
- **Award Criteria**: System Functionality (60%)
- **Dependencies**: REQ-005
- **Description**: Advanced pricing capabilities including zone-based pricing, volume discounts, price indexation, and promotional pricing.

**Acceptance Criteria**:
- [ ] Zone-based pricing configuration
- [ ] Tiered volume discounts
- [ ] Annual price index adjustments
- [ ] Promotional pricing with date ranges
- [ ] Price comparison and impact analysis

---

### REQ-024: AI/Machine Learning Route Optimization
- **Priority**: P2 (Could Have)
- **Effort**: 5 days
- **Category**: Fleet Operations
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-003
- **Description**: Machine learning enhanced route optimization that learns from historical patterns to improve efficiency.

**Acceptance Criteria**:
- [ ] Historical pattern analysis
- [ ] Predictive collection timing
- [ ] Continuous route improvement suggestions
- [ ] A/B testing of route changes
- [ ] ML model performance metrics

---

### REQ-025: Carbon Footprint Tracking
- **Priority**: P2 (Could Have)
- **Effort**: 2 days
- **Category**: Reporting
- **Award Criteria**: Social Value (3%)
- **Dependencies**: REQ-001, REQ-016
- **Description**: Track and report carbon emissions from fleet operations with improvement recommendations.

**Acceptance Criteria**:
- [ ] Fleet emissions calculation
- [ ] Emissions by route/vehicle
- [ ] Year-on-year comparison
- [ ] Carbon reduction recommendations
- [ ] Sustainability reporting export

---

### REQ-026: Customer Mobile App
- **Priority**: P2 (Could Have)
- **Effort**: 4 days
- **Category**: Customer Management
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: REQ-017
- **Description**: Native mobile app for commercial waste customers extending portal functionality with push notifications.

**Acceptance Criteria**:
- [ ] iOS and Android native apps
- [ ] Push notifications for collection reminders
- [ ] Quick issue reporting
- [ ] Invoice notifications
- [ ] Offline access to key information

---

### REQ-027: API Platform for Third-Party Integration
- **Priority**: P2 (Could Have)
- **Effort**: 3 days
- **Category**: Integration
- **Award Criteria**: Technical Capability (60%)
- **Dependencies**: None
- **Description**: Open API platform enabling future third-party integrations beyond core requirements.

**Acceptance Criteria**:
- [ ] RESTful API with OpenAPI specification
- [ ] API documentation portal
- [ ] API key management and rate limiting
- [ ] Webhook support for event notifications
- [ ] Sandbox environment for testing

---

## Dependency Map

```
REQ-001 (Vehicle Tracking)
    └── REQ-002 (Mobile Working)
        └── REQ-003 (Route Optimization)
    └── REQ-019 (Real-time Dashboard)

REQ-004 (CRM)
    └── REQ-005 (Quoting/E-Contract)
    └── REQ-006 (Pay-by-Weight) ─── REQ-002
    └── REQ-007 (Weighbridge)
    └── REQ-013 (Asset Management)
    └── REQ-017 (Customer Portal)
        └── REQ-018 (Citizen Portal Integration)
        └── REQ-026 (Mobile App)

REQ-008 (Invoicing)
    └── REQ-009 (Oracle Integration)
    └── REQ-015 (Financial Management)

REQ-010 (Data Migration) ─── REQ-004, REQ-006
REQ-011 (Training) ─── All functional requirements
REQ-012 (Support) ─── None

REQ-016 (Reporting) ─── REQ-001, REQ-002, REQ-003, REQ-004
    └── REQ-020 (Regulatory Reporting) ─── REQ-007
    └── REQ-025 (Carbon Tracking)

REQ-023 (Dynamic Pricing) ─── REQ-005
REQ-024 (ML Optimization) ─── REQ-003
```

---

## Effort Summary by Category

| Category | Requirements | Total Days |
|----------|-------------|------------|
| Fleet Operations | REQ-001, REQ-002, REQ-003, REQ-024 | 24 |
| Customer Management | REQ-004, REQ-005, REQ-017, REQ-026 | 19 |
| Weighing Systems | REQ-006, REQ-007 | 13 |
| Financial | REQ-008, REQ-015, REQ-023 | 13 |
| Integration | REQ-009, REQ-018, REQ-027 | 18 |
| Reporting | REQ-016, REQ-019, REQ-020, REQ-025 | 12 |
| Asset Management | REQ-013 | 4 |
| Operations | REQ-014 | 3 |
| Implementation | REQ-010, REQ-011, REQ-021, REQ-022 | 15 (excl. project) |
| Support | REQ-012 | 3 |
| **Total** | | **105 days** |
