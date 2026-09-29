import sys
import os
from datetime import date, timedelta

# Add backend to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app import create_app, db
from app.models import User, Farm, Crop, Expense, Income, Harvest, Activity, Inventory

app = create_app('development')

def seed_database():
    with app.app_context():
        print("🌱 Seeding database...")
        
        # Ensure tables exist
        db.create_all()

        # Check if demo user already exists
        existing_user = User.query.filter_by(email="demo@farmertrack.com").first()
        if existing_user:
            print("⚠️ Demo user already exists. Cleaning up existing seed data...")
            db.session.delete(existing_user)
            db.session.commit()

        # 1. Create Demo User
        user = User(
            name="Ravi Kumar",
            email="demo@farmertrack.com",
            phone="9876543210",
            village="Tenali",
            district="Guntur",
            state="Andhra Pradesh"
        )
        user.set_password("Demo@123")
        db.session.add(user)
        db.session.commit()
        print(f"✅ User created: {user.name} ({user.email})")

        # 2. Create Sample Farms
        farm1 = Farm(
            user_id=user.id,
            farm_name="Sri Lakshmi Farm",
            location="Tenali-Guntur Highway",
            village="Tenali",
            district="Guntur",
            state="Andhra Pradesh",
            total_area=8.0,
            area_unit="acres",
            soil_type="Black Soil",
            irrigation_type="Borewell",
            ownership_type="Owned",
            notes="Primary fertile land dedicated to paddy and chilli production."
        )

        farm2 = Farm(
            user_id=user.id,
            farm_name="Ravi Agricultural Farm",
            location="Amaravati Road",
            village="Mangalagiri",
            district="Guntur",
            state="Andhra Pradesh",
            total_area=12.5,
            area_unit="acres",
            soil_type="Red Sandy Soil",
            irrigation_type="Canal",
            ownership_type="Owned",
            notes="Secondary farm focused on commercial cotton and maize crops."
        )

        db.session.add_all([farm1, farm2])
        db.session.commit()
        print(f"✅ Created 2 farms: {farm1.farm_name}, {farm2.farm_name}")

        # 3. Create Crops
        today = date.today()

        crop1 = Crop(
            farm_id=farm1.id,
            crop_name="Rice",
            crop_variety="BPT 5204 (Samba Mahsuri)",
            season="Kharif",
            sowing_date=today - timedelta(days=70),
            expected_harvest_date=today + timedelta(days=50),
            area=5.0,
            area_unit="acres",
            seed_quantity=25.0,
            seed_unit="kg",
            expected_yield=120.0,
            yield_unit="quintals",
            expected_price=2300.0,
            status="GROWING",
            notes="High yielding paddy crop under borewell irrigation."
        )

        crop2 = Crop(
            farm_id=farm1.id,
            crop_name="Chilli",
            crop_variety="Teja Special",
            season="Rabi",
            sowing_date=today - timedelta(days=40),
            expected_harvest_date=today + timedelta(days=90),
            area=3.0,
            area_unit="acres",
            seed_quantity=2.5,
            seed_unit="kg",
            expected_yield=45.0,
            yield_unit="quintals",
            expected_price=18000.0,
            status="GROWING",
            notes="Commercial red chilli crop requiring intense pest monitoring."
        )

        crop3 = Crop(
            farm_id=farm2.id,
            crop_name="Cotton",
            crop_variety="Bollgard II",
            season="Kharif",
            sowing_date=today - timedelta(days=110),
            expected_harvest_date=today + timedelta(days=10),
            area=7.5,
            area_unit="acres",
            seed_quantity=15.0,
            seed_unit="packets",
            expected_yield=60.0,
            yield_unit="quintals",
            expected_price=7200.0,
            status="HARVEST_READY",
            notes="Ready for first picking round."
        )

        crop4 = Crop(
            farm_id=farm2.id,
            crop_name="Maize",
            crop_variety="Pioneer 3302",
            season="Rabi",
            sowing_date=today + timedelta(days=15),
            expected_harvest_date=today + timedelta(days=120),
            area=5.0,
            area_unit="acres",
            seed_quantity=10.0,
            seed_unit="kg",
            expected_yield=150.0,
            yield_unit="quintals",
            expected_price=2100.0,
            status="PLANNED",
            notes="Planned rotation crop following land tilling."
        )

        db.session.add_all([crop1, crop2, crop3, crop4])
        db.session.commit()
        print("✅ Created 4 crops: Rice, Chilli, Cotton, Maize")

        # 4. Create Expenses
        expenses = [
            # Rice Expenses
            Expense(
                crop_id=crop1.id, category="Seeds", description="BPT Seed bags",
                amount=3500.00, quantity=25, unit="kg", vendor="Sri Rama Seeds",
                payment_method="UPI", expense_date=today - timedelta(days=70), receipt_number="REC-1001"
            ),
            Expense(
                crop_id=crop1.id, category="Land Preparation", description="Tractor ploughing and puddling",
                amount=6000.00, quantity=5, unit="hours", vendor="Rao Tractor Services",
                payment_method="Cash", expense_date=today - timedelta(days=68)
            ),
            Expense(
                crop_id=crop1.id, category="Fertilizer", description="DAP & Urea application",
                amount=8500.00, quantity=10, unit="bags", vendor="Guntur Agri Depot",
                payment_method="UPI", expense_date=today - timedelta(days=45), receipt_number="REC-1045"
            ),
            Expense(
                crop_id=crop1.id, category="Labour", description="Manual transplanting labour charge",
                amount=9500.00, quantity=12, unit="workers", vendor="Local Labour Union",
                payment_method="Cash", expense_date=today - timedelta(days=65)
            ),
            Expense(
                crop_id=crop1.id, category="Pesticide", description="Stem borer control spray",
                amount=3200.00, quantity=3, unit="liters", vendor="Guntur Agri Depot",
                payment_method="Bank Transfer", expense_date=today - timedelta(days=20)
            ),

            # Chilli Expenses
            Expense(
                crop_id=crop2.id, category="Seeds", description="Teja Chilli Hybrid Nursery saplings",
                amount=12000.00, quantity=15000, unit="plants", vendor="Kisan Nursery",
                payment_method="UPI", expense_date=today - timedelta(days=40)
            ),
            Expense(
                crop_id=crop2.id, category="Fertilizers", description="Complex NPK Fertilizer 19-19-19",
                amount=7400.00, quantity=6, unit="bags", vendor="Krishi Kendra",
                payment_method="Cash", expense_date=today - timedelta(days=25)
            ),

            # Cotton Expenses
            Expense(
                crop_id=crop3.id, category="Seeds", description="BT Cotton Seed Packets",
                amount=11250.00, quantity=15, unit="packets", vendor="Lakshmi Traders",
                payment_method="UPI", expense_date=today - timedelta(days=110)
            ),
            Expense(
                crop_id=crop3.id, category="Pesticide", description="Bollworm pesticide spray",
                amount=6800.00, quantity=5, unit="liters", vendor="Lakshmi Traders",
                payment_method="UPI", expense_date=today - timedelta(days=50)
            ),
            Expense(
                crop_id=crop3.id, category="Labour", description="Weeding and inter-cultivation labour",
                amount=8000.00, quantity=10, unit="workers", vendor="Local Labour Group",
                payment_method="Cash", expense_date=today - timedelta(days=30)
            )
        ]

        db.session.add_all(expenses)
        db.session.commit()
        print(f"✅ Created {len(expenses)} detailed expense records.")

        # 5. Create Income Records
        incomes = [
            Income(
                crop_id=crop3.id, buyer_name="Cotton Corporation of India (CCI)",
                quantity=20.0, unit="quintals", price_per_unit=7000.00, total_amount=140000.00,
                sale_date=today - timedelta(days=5), payment_status="Paid", payment_method="Bank Transfer",
                notes="First picking cotton lot sold at MSP rate."
            ),
            Income(
                crop_id=crop1.id, buyer_name="Tenali Rice Traders",
                quantity=15.0, unit="quintals", price_per_unit=2200.00, total_amount=33000.00,
                sale_date=today - timedelta(days=15), payment_status="Paid", payment_method="UPI",
                notes="Early harvest grain sale."
            )
        ]

        db.session.add_all(incomes)
        db.session.commit()
        print(f"✅ Created {len(incomes)} income sales records.")

        # 6. Create Harvest Records
        harvests = [
            Harvest(
                crop_id=crop3.id, harvest_date=today - timedelta(days=7),
                quantity=20.0, unit="quintals", quality="Grade A Long Staple",
                selling_price=7000.00, total_income=140000.00, storage_location="Farm Warehouse Yard 1",
                notes="Bollpicking round 1 successful."
            )
        ]

        db.session.add_all(harvests)
        db.session.commit()
        print("✅ Created harvest records.")

        # 7. Create Activities
        activities = [
            Activity(
                crop_id=crop1.id, title="Apply Second Dose Nitrogen Fertilizer",
                description="Apply Urea and Potash mix evenly across 5 acres of paddy.",
                activity_date=today + timedelta(days=3), priority="HIGH", status="PENDING"
            ),
            Activity(
                crop_id=crop1.id, title="Water Management & Drainage Check",
                description="Maintain 5cm standing water in paddy fields during tillering stage.",
                activity_date=today - timedelta(days=2), priority="MEDIUM", status="COMPLETED"
            ),
            Activity(
                crop_id=crop2.id, title="Prophylactic Pesticide Spray for Thrips",
                description="Spray recommended insecticide to protect young chilli shoots.",
                activity_date=today - timedelta(days=5), priority="HIGH", status="PENDING" # Will be dynamically evaluated as OVERDUE!
            ),
            Activity(
                crop_id=crop3.id, title="Cotton Picking Round 2",
                description="Engage picking crew for second round of mature cotton bolls.",
                activity_date=today + timedelta(days=7), priority="HIGH", status="PENDING"
            )
        ]

        db.session.add_all(activities)
        db.session.commit()
        print(f"✅ Created {len(activities)} farm activity tasks.")

        # 8. Create Inventory Items
        inventory_items = [
            Inventory(
                farm_id=farm1.id, item_name="Urea Fertilizer", category="Fertilizers",
                quantity=4.0, unit="bags", minimum_stock=10.0, purchase_price=300.0,
                supplier="Guntur Agri Depot", purchase_date=today - timedelta(days=60),
                notes="Low stock! Need to replenish before next application."
            ),
            Inventory(
                farm_id=farm1.id, item_name="Coragen Insecticide", category="Pesticides",
                quantity=0.0, unit="bottles", minimum_stock=2.0, purchase_price=1800.0,
                supplier="Krishi Kendra", purchase_date=today - timedelta(days=90),
                notes="Out of stock."
            ),
            Inventory(
                farm_id=farm1.id, item_name="DAP Fertilizer", category="Fertilizers",
                quantity=18.0, unit="bags", minimum_stock=5.0, purchase_price=1350.0,
                supplier="Guntur Agri Depot", purchase_date=today - timedelta(days=30),
                notes="Well stocked."
            ),
            Inventory(
                farm_id=farm2.id, item_name="Knapsack Battery Sprayer", category="Tools",
                quantity=2.0, unit="units", minimum_stock=1.0, purchase_price=3500.0,
                supplier="Apex Farm Equipment", purchase_date=today - timedelta(days=120),
                notes="Good condition."
            ),
            Inventory(
                farm_id=farm2.id, item_name="Bio-Organic Seed Treatment", category="Seeds",
                quantity=5.0, unit="packets", minimum_stock=2.0, purchase_price=450.0,
                supplier="GreenBio Organics", purchase_date=today - timedelta(days=400),
                expiry_date=today - timedelta(days=10),
                notes="Expired stock! Dispose safely."
            )
        ]

        db.session.add_all(inventory_items)
        db.session.commit()
        print(f"✅ Created {len(inventory_items)} inventory items with stock status triggers.")

        print("\n🎉 Database Seeding Complete Successfully!")
        print("--------------------------------------------------")
        print("Demo Credentials:")
        print("Email:    demo@farmertrack.com")
        print("Password: Demo@123")
        print("--------------------------------------------------")

if __name__ == '__main__':
    seed_database()
