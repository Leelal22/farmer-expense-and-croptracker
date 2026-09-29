# Database Documentation

## Tables & Schema Specifications

### `users`
- `id` INTEGER PRIMARY KEY AUTOINCREMENT / SERIAL
- `name` VARCHAR(100) NOT NULL
- `email` VARCHAR(120) UNIQUE NOT NULL (Indexed)
- `password_hash` VARCHAR(255) NOT NULL
- `phone` VARCHAR(20)
- `village` VARCHAR(100)
- `district` VARCHAR(100)
- `state` VARCHAR(100)
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### `farms`
- `id` INTEGER PRIMARY KEY
- `user_id` INTEGER NOT NULL (FK -> users.id ON DELETE CASCADE, Indexed)
- `farm_name` VARCHAR(120) NOT NULL
- `location` VARCHAR(200)
- `village` VARCHAR(100)
- `district` VARCHAR(100)
- `state` VARCHAR(100)
- `total_area` NUMERIC(10, 2) NOT NULL
- `area_unit` VARCHAR(20) DEFAULT 'acres'
- `soil_type` VARCHAR(50)
- `irrigation_type` VARCHAR(50)
- `ownership_type` VARCHAR(50)
- `notes` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### `crops`
- `id` INTEGER PRIMARY KEY
- `farm_id` INTEGER NOT NULL (FK -> farms.id ON DELETE CASCADE, Indexed)
- `crop_name` VARCHAR(100) NOT NULL
- `crop_variety` VARCHAR(100)
- `season` VARCHAR(50)
- `sowing_date` DATE
- `expected_harvest_date` DATE
- `actual_harvest_date` DATE
- `area` NUMERIC(10, 2)
- `area_unit` VARCHAR(20) DEFAULT 'acres'
- `seed_quantity` NUMERIC(10, 2)
- `seed_unit` VARCHAR(20)
- `expected_yield` NUMERIC(10, 2)
- `yield_unit` VARCHAR(20)
- `expected_price` NUMERIC(10, 2)
- `status` VARCHAR(30) DEFAULT 'PLANNED' (Indexed) -- PLANNED, GROWING, HARVEST_READY, HARVESTED, FAILED
- `notes` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### `expenses`
- `id` INTEGER PRIMARY KEY
- `crop_id` INTEGER NOT NULL (FK -> crops.id ON DELETE CASCADE, Indexed)
- `category` VARCHAR(50) NOT NULL (Indexed)
- `description` VARCHAR(255)
- `amount` NUMERIC(12, 2) NOT NULL
- `quantity` NUMERIC(10, 2)
- `unit` VARCHAR(20)
- `vendor` VARCHAR(100)
- `payment_method` VARCHAR(30) DEFAULT 'Cash'
- `expense_date` DATE NOT NULL (Indexed)
- `receipt_number` VARCHAR(50)
- `notes` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### `incomes`
- `id` INTEGER PRIMARY KEY
- `crop_id` INTEGER NOT NULL (FK -> crops.id ON DELETE CASCADE, Indexed)
- `buyer_name` VARCHAR(100)
- `quantity` NUMERIC(10, 2) NOT NULL
- `unit` VARCHAR(20)
- `price_per_unit` NUMERIC(12, 2) NOT NULL
- `total_amount` NUMERIC(12, 2) NOT NULL -- Calculated as (quantity * price_per_unit)
- `sale_date` DATE NOT NULL (Indexed)
- `payment_status` VARCHAR(20) DEFAULT 'Paid' -- Pending, Partial, Paid
- `payment_method` VARCHAR(30) DEFAULT 'Cash'
- `notes` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### `harvests`
- `id` INTEGER PRIMARY KEY
- `crop_id` INTEGER NOT NULL (FK -> crops.id ON DELETE CASCADE, Indexed)
- `harvest_date` DATE NOT NULL
- `quantity` NUMERIC(10, 2) NOT NULL
- `unit` VARCHAR(20)
- `quality` VARCHAR(50)
- `selling_price` NUMERIC(12, 2)
- `total_income` NUMERIC(12, 2)
- `storage_location` VARCHAR(100)
- `notes` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### `activities`
- `id` INTEGER PRIMARY KEY
- `crop_id` INTEGER NOT NULL (FK -> crops.id ON DELETE CASCADE, Indexed)
- `title` VARCHAR(150) NOT NULL
- `description` TEXT
- `activity_date` DATE NOT NULL (Indexed)
- `priority` VARCHAR(20) DEFAULT 'MEDIUM' -- LOW, MEDIUM, HIGH
- `status` VARCHAR(20) DEFAULT 'PENDING' -- PENDING, COMPLETED, OVERDUE
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### `inventory`
- `id` INTEGER PRIMARY KEY
- `farm_id` INTEGER NOT NULL (FK -> farms.id ON DELETE CASCADE, Indexed)
- `item_name` VARCHAR(120) NOT NULL
- `category` VARCHAR(50) NOT NULL -- Seeds, Fertilizers, Pesticides, Tools, Equipment, Other
- `quantity` NUMERIC(10, 2) NOT NULL
- `unit` VARCHAR(20)
- `minimum_stock` NUMERIC(10, 2) DEFAULT 0
- `purchase_price` NUMERIC(12, 2)
- `supplier` VARCHAR(100)
- `purchase_date` DATE
- `expiry_date` DATE
- `notes` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
