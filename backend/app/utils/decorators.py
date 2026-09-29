from app.models import Farm, Crop, Expense, Income, Harvest, Activity, Inventory

def get_user_farm(farm_id, user_id):
    return Farm.query.filter_by(id=farm_id, user_id=user_id).first()

def get_user_crop(crop_id, user_id):
    return Crop.query.join(Farm).filter(Crop.id == crop_id, Farm.user_id == user_id).first()

def get_user_expense(expense_id, user_id):
    return Expense.query.join(Crop).join(Farm).filter(Expense.id == expense_id, Farm.user_id == user_id).first()

def get_user_income(income_id, user_id):
    return Income.query.join(Crop).join(Farm).filter(Income.id == income_id, Farm.user_id == user_id).first()

def get_user_harvest(harvest_id, user_id):
    return Harvest.query.join(Crop).join(Farm).filter(Harvest.id == harvest_id, Farm.user_id == user_id).first()

def get_user_activity(activity_id, user_id):
    return Activity.query.join(Crop).join(Farm).filter(Activity.id == activity_id, Farm.user_id == user_id).first()

def get_user_inventory(inventory_id, user_id):
    return Inventory.query.join(Farm).filter(Inventory.id == inventory_id, Farm.user_id == user_id).first()
