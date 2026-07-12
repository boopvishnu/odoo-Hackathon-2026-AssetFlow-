# AssetFlow

**End-to-End Asset Lifecycle Management — Built on Odoo**

> Odoo Hackathon 2026

---

## What is AssetFlow?

AssetFlow is a comprehensive Odoo module that gives organizations a **single source of truth** for every physical asset — from registration to retirement. It automates allocation, shared resource booking, maintenance, transfers, returns, audits, and depreciation with full traceability.

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Asset Registration** | Register assets with barcode/QR, auto-generated codes, and full metadata |
| **Smart Allocation** | Allocate assets to employees/departments with duplicate-allocation blocking |
| **Shared Resource Booking** | Time-slot booking with automatic overlap rejection |
| **Maintenance Workflows** | Request → Approve → Repair → Return cycle with cost tracking |
| **Transfers & Returns** | Approval-based transfer and return flows with condition check-in |
| **Overdue Detection** | Auto-flag overdue returns with escalation notifications |
| **Audit Cycles** | Assign auditors, verify assets, auto-generate discrepancy reports |
| **Depreciation Engine** | Straight-line, declining balance — auto-posted monthly |
| **Analytics Dashboard** | Real-time KPIs, charts, and department breakdowns |
| **Smart Notifications** | Email + in-app alerts for every approval, overdue, and audit event |

---

## User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Organization setup, audit cycles, role assignment, org-wide analytics |
| **Asset Manager** | Register assets, allocate, approve transfers/maintenance/returns |
| **Department Head** | View department assets, approve intra-dept requests, book shared resources |
| **Employee** | View personal assets, book shared resources, raise maintenance/return requests |

---

## Core Workflow

```
Admin sets up org → Asset Manager registers asset (Available)
  → Allocate to employee OR mark as shared bookable resource
  → Employee books shared resources (overlap = auto-reject)
  → Holder raises maintenance request → Approval → Under Maintenance → Repaired
  → Transfer/Return requests with approval chains
  → Periodic audit cycles → Auto-discrepancy detection → Resolution
  → All activity tracked via notifications, logs, and reports
```

---

## Tech Stack

- **Framework:** Odoo 17/18
- **Backend:** Python 3, Odoo ORM, PostgreSQL
- **Frontend:** Odoo XML Views, QWeb Templates, OWL Components
- **Reports:** QWeb PDF Reports
- **Security:** Role-based access, record rules, multi-company isolation

---

## Module Structure

```
assetflow/
├── models/          # ORM models (asset, allocation, booking, maintenance, audit...)
├── views/           # XML views (form, tree, kanban, calendar, dashboard)
├── wizards/         # Bulk import, disposal wizards
├── security/        # Groups, access rights, record rules
├── data/            # Sequences, default data, cron jobs, mail templates
├── controllers/     # QR scanner, portal routes
├── reports/         # PDF report templates
├── static/          # JS (OWL dashboard), CSS, icons
└── tests/           # Unit tests for lifecycle, booking, security, audit
```

---

## Quick Start

```bash
# 1. Copy module to Odoo addons
cp -r assetflow /path/to/odoo/addons/

# 2. Update module list & install
odoo -d mydb -u base --stop-after-init
odoo -d mydb -i assetflow --stop-after-init

# 3. Run
odoo -d mydb --dev=all
```

---

## Team

**Odoo Hackathon 2026 Participants**

---

## License

This project is built for the Odoo Hackathon 2026.
