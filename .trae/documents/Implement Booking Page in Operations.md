## Scope
- Deliver four items only: `booking.service.ts`, `booking.ts`, `booking.js`, and the Booking SQL table.
- Add a Booking Dashboard (like Enquiry Dashboard) with Create Booking flow and Manual Booking flow.

## Database: Booking Table
- Create table `booking` (if missing) aligned with existing insert usage seen in enquiry confirmation route.
- Columns:
  - `id SERIAL PRIMARY KEY`
  - `booking_no VARCHAR(50) UNIQUE NOT NULL` (format `BKG000001`)
  - `booking_type VARCHAR(20)` (`'from_enquiry' | 'manual'`)
  - `enquiry_id INTEGER NULL` (single enquiry when created from one enquiry)
  - `selected_enquiries JSONB NULL` (array of `{id, code}` when multi-select)
  - `customer_id INTEGER NULL`, `customer_name VARCHAR(255)`
  - `mail_id VARCHAR(255)`, `phone_no1 VARCHAR(50)`, `phone_no2 VARCHAR(50)`
  - `company_name VARCHAR(255)`
  - `from_location VARCHAR(255)`, `to_location VARCHAR(255)`
  - `effective_date_from DATE`, `effective_date_to DATE`
  - `department VARCHAR(100)`, `service_type VARCHAR(100)`
  - `status VARCHAR(50)` default `'Open'`
  - `remarks TEXT`
  - `vendor_details JSONB` (selected vendor card snapshot)
  - `line_items JSONB` (frozen enquiry line items)
  - `charges JSONB` (negotiated charges snapshot)
  - `cargo JSONB` (optional cargo list)
  - `carriage_map JSONB` (optional carriage/location mapping)
  - `schedules JSONB` (per service area transit schedule)
  - `company_code VARCHAR(10)`, `branch_code VARCHAR(10)`, `department_code VARCHAR(10)`, `service_type_code VARCHAR(10)`
  - `created_at TIMESTAMP DEFAULT NOW()`, `updated_at TIMESTAMP DEFAULT NOW()`
  - `created_by VARCHAR(100)`, `updated_by VARCHAR(100)`
- Indexes: `booking_no`, `status`, `company_code`, `branch_code`, `department_code`, `service_type_code`.
- Numbering: generate `booking_no` using same pattern as in `enquiry.js` confirm route.

## Server: `booking.js` (Express route)
- Base URL: `/api/booking`.
- Endpoints:
  - `GET /` — list bookings with optional filters (status, search, pagination) for dashboard.
  - `POST /search-enquiries` — return enquiries matching dialog criteria: `department`, `service_type`, `from_location`, `to_location` (reuse normalization rules used in sourcing route); only status in `('Open','Pending','Quoted')`.
  - `POST /` — create booking; body accepts two modes:
    - From enquiries: `{ booking_type: 'from_enquiry', criteria, selected_enquiries: [{id, code}], freeze: true }`.
    - Manual: `{ booking_type: 'manual', general, cargo?, carriage_map?, line_items?, schedules? }`.
  - `GET /:bookingNo` — fetch single booking with snapshots for form display (read-only fields populated from `freeze_snapshot`).
- Behavior on create (from enquiries):
  - Fetch selected enquiries; build `vendor_details`, `line_items`, `charges` from already selected vendor cards per enquiry (when available).
  - Copy general fields: company, from/to, dates, department, service type; set `status='Open'`.
  - Freeze selected values: store into JSONB fields; UI shows read-only.
- Behavior on create (manual):
  - Accept user-entered general + optional structured JSON sections; mark `booking_type='manual'`.

## Client Service: `booking.service.ts` (Angular)
- Methods:
  - `getAll(page=1, limit=10, search='', status='')` — for dashboard table.
  - `searchEnquiries(criteria)` — posts to `/search-enquiries`.
  - `createFromEnquiries(criteria, selectedEnquiries)` — posts to `/` with `booking_type='from_enquiry'`.
  - `createManualBooking(payload)` — posts to `/` with `booking_type='manual'`.
  - `getByNo(bookingNo)` — fetch a booking to fill form.
- Reuse context payload pattern used across services (company/branch/department codes added).

## UI Component: `booking.ts` (Angular page)
- Dashboard section:
  - Table with columns: `Booking No`, `Customer`, `Department`, `Service Type`, `From`, `To`, `Status`, `Date`.
  - Toolbar: `Create Booking`, search, status filter.
- Create Booking dialog:
  - Fields: `Department`, `Service Type`, `From Location`, `To Location`.
  - Action: `Search Enquiries` → multi-select list of matching enquiries (shows `code`, `customer`, `effective dates`, `basis` count).
  - Buttons: `Save` (creates booking from selected enquiries), `Cancel`.
- Manual Booking path:
  - `Create Manual Booking` button or toggle in dialog to skip selection.
  - Opens Booking form directly with editable fields.
- Booking form:
  - General: `Booking no`, `Enquiry Type`, `Company Name`, `From location`, `To location`, `Department`, `Service Type`, `Effective Date From/To`, `Source/Sales person`, `Status`, `Remarks`, `Date`.
  - Cargo: add rows (`cargo_type`, `cargo_name`, `hs_code`).
  - Carriage mapping: rows (`carriage`, `location_type`, `location`).
  - Line items table: `type`, `service_area`, `basis`, `from`, `to`, `sourced vendor`, `basis qty`, `bkg refe valid til`, `status`, `remarks`, `schedule`.
  - Schedule per service area: transit rows (`from_location_type`, `from_location`, `to_location_type`, `to_location`, `vessel/airline`, `voyage/flight`, `ETD`, `ETA`).
  - Read-only behavior: when `booking_type='from_enquiry'`, freeze fields populated from snapshots.
  - Bottom actions: `Save` (POST create), `Cancel` (close/discard).

## Data Flow & Mapping
- Dialog criteria → `booking.service.searchEnquiries` → list `enquiry` rows.
- On multi-select Save → `booking.service.createFromEnquiries` → server composes booking, freezes values.
- On manual Save → `booking.service.createManualBooking`.
- After create → navigate to newly created booking page (`getByNo`) for review.

## Validation & UX
- Required fields in dialog: all four criteria; allow manual path without dialog.
- Prevent save if no enquiries selected in from-enquiry mode.
- Show toasts for success/error; display booking number on success.

## Reuse & Consistency
- UI follows patterns used by `enquiry.ts`: services, context payload, dropdowns for departments/service types/locations using existing endpoints.
- Server-side normalization for text comparisons mirrors sourcing route (trim/case/space-insensitive).
- Booking number generation matches `enquiry.js` confirm route.

## Deliverables
- `booking.service.ts` with methods listed.
- `booking.ts` page implementing dashboard, dialog, form and save/cancel.
- `booking.js` Express router with endpoints and create logic including freeze snapshots.
- SQL to create/alter `booking` table with JSONB columns and indexes.

## Next Step
- On approval, I will implement these four files end-to-end, verify with UI build and sample creates (both from enquiry and manual).