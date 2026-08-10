from app.core.database import SessionLocal, engine, Base
from app.models.user import User, Profile
from app.models.product import Product
from app.models.tracker import SkinLog
from app.core.security import get_password_hash
from datetime import datetime, timedelta, timezone


def seed_db():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Users
        if not db.query(User).first():
            print("Seeding database with test users for each role...")
            users_data = [
                {"email": "admin@derma.ai", "full_name": "Admin System Manager", "role": "admin"},
                {"email": "doctor@derma.ai", "full_name": "Dr. Sarah Jenkins", "role": "dermatologist"},
                {"email": "advisor@derma.ai", "full_name": "Consultant Marcus Sterling", "role": "consultant"},
                {"email": "patient@derma.ai", "full_name": "Emily Watson", "role": "user"},
            ]
            
            for u in users_data:
                user = User(
                    email=u["email"],
                    hashed_password=get_password_hash("password123"),
                    full_name=u["full_name"],
                    role=u["role"],
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                
                # Initialize dynamic profile parameters
                profile = Profile(
                    user_id=user.id,
                    age=28 if u["role"] == "user" else None,
                    gender="female" if u["role"] == "user" else None,
                    skin_type="dry" if u["role"] == "user" else None,
                    concerns=["acne", "dry_skin"] if u["role"] == "user" else []
                )
                db.add(profile)
                db.commit()
        else:
            print("User records already exist. Skipping user seeding.")

        # 2. Seed Skincare Products
        if not db.query(Product).first():
            print("Seeding skincare product catalog...")
            products_data = [
                # Cleansers
                {
                    "name": "Hydrating Ceramide Milky Cleanser",
                    "brand": "CeraVera",
                    "category": "cleanser",
                    "price": 12.99,
                    "skin_type": "dry",
                    "ingredients": "Water, Glycerin, Ceramide NP, Ceramide AP, Hyaluronic Acid, Cetearyl Alcohol",
                    "rating": 4.7,
                    "description": "Gentle hydrating milk cleanser for dry and sensitive skin barriers."
                },
                {
                    "name": "Salicylic Acid Pore Clarifying Cleanser",
                    "brand": "AcneShield",
                    "category": "cleanser",
                    "price": 9.99,
                    "skin_type": "oily",
                    "ingredients": "Water, Salicylic Acid, Zinc PCA, Cocamidopropyl Betaine, Glycerin, Phenoxyethanol",
                    "rating": 4.5,
                    "description": "Foaming acne cleanser designed to deep clean sebum from pores."
                },
                {
                    "name": "Amino Acid Balancing Gel Cleanser",
                    "brand": "PureSoft",
                    "category": "cleanser",
                    "price": 14.50,
                    "skin_type": "normal",
                    "ingredients": "Water, Sodium Cocoyl Glycinate, Chamomile Extract, Glycerin, Panthenol",
                    "rating": 4.6,
                    "description": "Balanced daily gel cleanser suitable for all skin types."
                },
                # Toners
                {
                    "name": "Milky Soothing Barrier Toner",
                    "brand": "SkinCalm",
                    "category": "toner",
                    "price": 16.00,
                    "skin_type": "sensitive",
                    "ingredients": "Water, Panthenol, Centella Asiatica Extract, Beta-Glucan, Licorice Root Extract",
                    "rating": 4.8,
                    "description": "Calming milky prep toner for sensitive or irritated skin."
                },
                {
                    "name": "Niacinamide Pore Refining Toner",
                    "brand": "SebumControl",
                    "category": "toner",
                    "price": 11.50,
                    "skin_type": "oily",
                    "ingredients": "Water, Niacinamide, Zinc PCA, Witch Hazel, Hyaluronic Acid",
                    "rating": 4.4,
                    "description": "Mattifying pore clarifying toner to control shine."
                },
                {
                    "name": "Hyaluronic Acid Dehydration Mist",
                    "brand": "Hydralock",
                    "category": "toner",
                    "price": 18.00,
                    "skin_type": "dry",
                    "ingredients": "Water, Hyaluronic Acid, Rosewater, Glycerin, Allantoin",
                    "rating": 4.6,
                    "description": "Plumping humectant hydration mist."
                },
                # Serums
                {
                    "name": "Pure Retinol 0.3% Recovery Serum",
                    "brand": "YouthGlow",
                    "category": "serum",
                    "price": 24.99,
                    "skin_type": "normal",
                    "ingredients": "Water, Retinol, Bakuchiol, Tocopherol, Squalane, Glycerin",
                    "rating": 4.5,
                    "description": "Cellular renewal retinol treatment for fine lines and elasticity."
                },
                {
                    "name": "Vitamin C 15% Antioxidant Serum",
                    "brand": "BrightAura",
                    "category": "serum",
                    "price": 29.50,
                    "skin_type": "normal",
                    "ingredients": "Water, L-Ascorbic Acid, Ferulic Acid, Vitamin E, Hyaluronic Acid",
                    "rating": 4.7,
                    "description": "Targeted hyperpigmentation brightening serum."
                },
                {
                    "name": "Niacinamide 10% Zinc 1% Blemish Serum",
                    "brand": "AcneShield",
                    "category": "serum",
                    "price": 8.50,
                    "skin_type": "oily",
                    "ingredients": "Water, Niacinamide, Zinc PCA, Phenoxyethanol, Xanthan Gum",
                    "rating": 4.6,
                    "description": "Highly active serum for breakouts, skin texture, and sebum control."
                },
                {
                    "name": "Centella Cica Calming Serum",
                    "brand": "SkinCalm",
                    "category": "serum",
                    "price": 21.00,
                    "skin_type": "sensitive",
                    "ingredients": "Water, Centella Asiatica Extract, Madecassoside, Panthenol, Glycerin",
                    "rating": 4.8,
                    "description": "Soothes skin redness, inflammation, and compromised barriers."
                },
                # Moisturizers
                {
                    "name": "Barrier Restore Intense Cream",
                    "brand": "CeraVera",
                    "category": "moisturizer",
                    "price": 15.99,
                    "skin_type": "dry",
                    "ingredients": "Water, Squalane, Shea Butter, Ceramide NP, Ceramide AP, Cholesterol",
                    "rating": 4.8,
                    "description": "Deeply moisturizing barrier repair cream for dry and windburned skin."
                },
                {
                    "name": "Oil-Free Hyaluronic Water Gel",
                    "brand": "Hydralock",
                    "category": "moisturizer",
                    "price": 13.50,
                    "skin_type": "oily",
                    "ingredients": "Water, Hyaluronic Acid, Aloe Vera Juice, Centella Extract, Glycerin",
                    "rating": 4.4,
                    "description": "Ultra lightweight water gel that absorbs instantly to a matte finish."
                },
                {
                    "name": "Multi-Peptide Youth Lotion",
                    "brand": "YouthGlow",
                    "category": "moisturizer",
                    "price": 22.00,
                    "skin_type": "normal",
                    "ingredients": "Water, Matrixyl 3000, Copper Peptides, Squalane, Niacinamide",
                    "rating": 4.6,
                    "description": "Firming peptide daily moisturizer."
                },
                # Sunscreens
                {
                    "name": "Mineral Physical Barrier SPF 50",
                    "brand": "SunBlocker",
                    "category": "sunscreen",
                    "price": 19.99,
                    "skin_type": "sensitive",
                    "ingredients": "Zinc Oxide, Titanium Dioxide, Water, Glycerin, Aloe Vera, Vitamin E",
                    "rating": 4.7,
                    "description": "Soothes while providing complete broad-spectrum mineral protection."
                },
                {
                    "name": "Matte Finish Oil-Control SPF 50",
                    "brand": "SunBlocker",
                    "category": "sunscreen",
                    "price": 17.50,
                    "skin_type": "oily",
                    "ingredients": "Water, Organic UV Filters, Silica, Niacinamide, Green Tea",
                    "rating": 4.3,
                    "description": "Non-greasy sunscreen fluid with sebum-control particles."
                }
            ]

            for prod in products_data:
                db_prod = Product(
                    name=prod["name"],
                    brand=prod["brand"],
                    category=prod["category"],
                    price=prod["price"],
                    skin_type=prod["skin_type"],
                    ingredients=prod["ingredients"],
                    rating=prod["rating"],
                    description=prod["description"]
                )
                db.add(db_prod)
            db.commit()
            print("Product catalog seeded successfully!")
        else:
            print("Skincare product catalog already seeded. Skipping product seeding.")

        # 3. Seed Skin Tracker Logs
        if not db.query(SkinLog).first():
            patient = db.query(User).filter(User.email == "patient@derma.ai").first()
            if patient:
                print("Seeding historical skin log entries for Emily Watson...")
                now = datetime.now(timezone.utc)
                for i in range(6, -1, -1):
                    logged_date = now - timedelta(days=i)
                    health_score = 70 + (6 - i) * 3
                    hydration = 45 + (6 - i) * 6
                    sleep = 6 + (6 - i) // 2
                    stress = 7 - (6 - i)
                    
                    log_entry = SkinLog(
                        user_id=patient.id,
                        logged_at=logged_date,
                        health_score=health_score,
                        hydration_level=hydration,
                        sleep_hours=sleep,
                        stress_level=stress,
                        acne_level="moderate" if i > 3 else "mild",
                        dryness_level="severe" if i > 4 else "moderate" if i > 1 else "mild",
                        sensitivity_level="mild",
                        notes=f"Day {6-i} of tracking. Noticeable skin texture improvements. Drinking more water.",
                        photo_url=None
                    )
                    db.add(log_entry)
                db.commit()
                print("Historical skin tracker logs seeded successfully!")
        else:
            print("Skin log records already exist. Skipping tracker seeding.")

        print("Seeding completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
