# API Endpoints Specification

All API endpoints return standard JSON responses:

```json
{
  "success": true,
  "message": "Operation successful message",
  "data": {}
}
```

Error format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": { "field": "Field required" }
}
```

## Authentication APIs
- `POST /api/auth/register`: Create user account
- `POST /api/auth/login`: Authenticate and receive JWT access token
- `POST /api/auth/logout`: Blacklist/logout current user token
- `GET /api/auth/me`: Get current authenticated user details
- `PUT /api/auth/profile`: Update user profile details

## Farm APIs
- `GET /api/farms`: List all farms owned by user
- `POST /api/farms`: Create new farm
- `GET /api/farms/<id>`: Get single farm details
- `PUT /api/farms/<id>`: Update farm
- `DELETE /api/farms/<id>`: Delete farm and associated crops

## Crop APIs
- `GET /api/crops`: List crops (filterable by farm_id, status, season)
- `POST /api/crops`: Create crop for a farm
- `GET /api/crops/<id>`: Get single crop details
- `GET /api/crops/<id>/profitability`: Get financial & ROI metrics for crop
- `PUT /api/crops/<id>`: Update crop
- `DELETE /api/crops/<id>`: Delete crop

## Expense APIs
- `GET /api/expenses`: List expenses (filterable by crop_id, category, vendor, date range)
- `POST /api/expenses`: Record crop expense
- `GET /api/expenses/<id>`: Get expense detail
- `PUT /api/expenses/<id>`: Update expense
- `DELETE /api/expenses/<id>`: Remove expense

## Income APIs
- `GET /api/incomes`: List crop incomes (filterable by crop_id, payment_status, date range)
- `POST /api/incomes`: Record crop sale / income (total_amount auto-calculated on backend)
- `GET /api/incomes/<id>`: Get income detail
- `PUT /api/incomes/<id>`: Update income
- `DELETE /api/incomes/<id>`: Delete income

## Harvest APIs
- `GET /api/harvests`: List harvest records
- `POST /api/harvests`: Record harvest details
- `GET /api/harvests/<id>`: Get harvest detail
- `PUT /api/harvests/<id>`: Update harvest
- `DELETE /api/harvests/<id>`: Delete harvest

## Activity APIs
- `GET /api/activities`: List scheduled activities (auto detects overdue status)
- `POST /api/activities`: Create activity
- `GET /api/activities/<id>`: Get activity detail
- `PUT /api/activities/<id>`: Update activity
- `DELETE /api/activities/<id>`: Delete activity

## Inventory APIs
- `GET /api/inventory`: List farm inventory (with dynamic stock status: AVAILABLE, LOW_STOCK, OUT_OF_STOCK, EXPIRED)
- `POST /api/inventory`: Add inventory item
- `GET /api/inventory/<id>`: Get item detail
- `PUT /api/inventory/<id>`: Update inventory item
- `DELETE /api/inventory/<id>`: Delete inventory item

## Dashboard APIs
- `GET /api/dashboard/summary`: Quick summary statistics cards
- `GET /api/dashboard/monthly-financials`: Monthly breakdown of expenses, income, profit
- `GET /api/dashboard/crop-performance`: Financial performance grouped by crop
- `GET /api/dashboard/expense-categories`: Category distribution of expenses
- `GET /api/dashboard/crop-status`: Status distribution of active/planned/harvested crops

## Report APIs
- `GET /api/reports/crop-profitability`: High level profitability breakdown for export/filtering
- `GET /api/reports/expenses`: Detailed expense logs report
- `GET /api/reports/income`: Detailed sales logs report
- `GET /api/reports/farm-performance`: Aggregated metrics per farm
- `GET /api/reports/monthly-summary`: Monthly summary report
