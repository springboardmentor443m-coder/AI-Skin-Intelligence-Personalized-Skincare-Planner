from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.skin_profile import SkinProfile
from app.models.user import User
from app.schemas.skin_profile import SkinProfileCreate, SkinProfileOut

router = APIRouter(prefix="/skin-profile", tags=["Skin Profile"])

# ---------------------------------------------------------------------------
# Comprehensive, dermatologist-grade 7-day skincare plans (Clinical & Natural)
# ---------------------------------------------------------------------------
WEEKLY_PLANS = {
    "acne": {
        "concern_label": "Acne & Breakouts",
        "goal": "Clear Clogged Pores · Control Excess Oil · Calm Red Pimples · Prevent Scars",
        "key_actives": ["Acne Face Wash (Salicylic Acid)", "Oil-Balance Serum (Niacinamide)", "Pimple Cream (Benzoyl Peroxide)", "Redness Fading Lotion (Azelaic Acid)"],
        "clinical_days": [
            {
                "day": "Monday",
                "focus": "Clearing Pores & Spot Treatment",
                "am": [
                    "Step 1: Gentle Acne Face Wash (Salicylic Acid) — Gently wash face for 60 seconds to clear oil and unclog pores.",
                    "Step 2: Oil-Control Serum (Niacinamide) — Apply 3-4 drops to calm redness and control oil shine.",
                    "Step 3: Lightweight Gel Moisturizer — Hydrate skin without clogging pores.",
                    "Step 4: Daily Sunscreen SPF 50 — Protect skin from sun damage and prevent acne marks."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash off dirt, sweat, and daily pollution.",
                    "Step 2: Pimple Spot Gel (Benzoyl Peroxide) — Apply a small drop directly on active breakouts.",
                    "Step 3: Soothing Night Cream — Lock in moisture and repair skin overnight."
                ],
                "tip": "💧 Drink 3L of water today. Avoid touching your face to prevent acne bacteria from spreading!"
            },
            {
                "day": "Tuesday",
                "focus": "Fading Redness & Acne Marks",
                "am": [
                    "Step 1: Mild Hydrating Face Wash — Gentle cleansing for sensitive, breakout-prone skin.",
                    "Step 2: Mark-Fading Serum (Azelaic Acid) — Smooth over face to reduce red spots and even skin tone.",
                    "Step 3: Hydrating Gel Moisturizer — Soothe and keep skin soft.",
                    "Step 4: Daily Sunscreen SPF 50 — Protect skin from UV rays."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash face thoroughly with warm water.",
                    "Step 2: Exfoliating Liquid (BHA) — Gently swipe with cotton pad to dissolve blackheads.",
                    "Step 3: Calming Skin Lotion (Centella) — Relieve skin redness and irritation."
                ],
                "tip": "🛏️ Change your pillowcase tonight — clean pillowcases help stop pimple breakouts!"
            },
            {
                "day": "Wednesday",
                "focus": "Deep Clay Pore Purifying",
                "am": [
                    "Step 1: Gentle Acne Face Wash — Wash away morning excess oil.",
                    "Step 2: Oil-Control Serum — Balance skin sebum levels.",
                    "Step 3: Light Moisturizer — Hydrate gently.",
                    "Step 4: Sunscreen SPF 50 — Apply generously before stepping outdoors."
                ],
                "pm": [
                    "Step 1: Evening Face Wash — Cleanse face well.",
                    "Step 2: Purifying Clay Mask (Charcoal & Clay) — Apply for 10 minutes to draw out deep pore dirt, then rinse.",
                    "Step 3: Pimple Spot Treatment — Dab on active spots.",
                    "Step 4: Night Moisturizer — Soothe skin overnight."
                ],
                "tip": "🧘 Keep stress low and rest well. Lower stress prevents sudden acne flare-ups."
            },
            {
                "day": "Thursday",
                "focus": "Skin Renewal & Texture Smoothing",
                "am": [
                    "Step 1: Gentle Face Wash — Cleanse skin mildly.",
                    "Step 2: Redness Fading Serum — Even out skin texture.",
                    "Step 3: Light Moisturizer — Hydrate skin.",
                    "Step 4: Sunscreen SPF 50 — Essential daily sun protection."
                ],
                "pm": [
                    "Step 1: Gentle Face Cleanser — Wash face gently.",
                    "Step 2: Night Renewal Serum (Retinol) — Apply a pea-sized amount to dry face to speed skin healing.",
                    "Step 3: Barrier Repair Cream — Deeply hydrate and nourish skin."
                ],
                "tip": "🌙 Retinol works best while you sleep! Always use sunscreen the next morning."
            },
            {
                "day": "Friday",
                "focus": "Oil Control & Soothing Care",
                "am": [
                    "Step 1: Acne Face Wash — Clear morning oil.",
                    "Step 2: Green Tea & Oil Balance Serum — Calm skin irritation.",
                    "Step 3: Gel Moisturizer — Keep skin fresh and hydrated.",
                    "Step 4: Sunscreen SPF 50 — Shield skin from sun exposure."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Cleanse thoroughly.",
                    "Step 2: Pore Clarifying Toner — Sweep gently across t-zone.",
                    "Step 3: Soothing Cica Cream — Deeply calm sensitive red skin."
                ],
                "tip": "🥗 Drink fresh herbal tea and avoid excess fried food over the weekend."
            },
            {
                "day": "Saturday",
                "focus": "Gentle Surface Smoothing",
                "am": [
                    "Step 1: Hydrating Cleanser — Wash skin gently.",
                    "Step 2: Glow Vitamin Serum — Protect skin and boost radiance.",
                    "Step 3: Daily Moisturizer — Soften skin.",
                    "Step 4: Sunscreen SPF 50 — Protect from sunlight."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash off daily buildup.",
                    "Step 2: Gentle Surface Exfoliant (AHA) — Remove dull dead skin cells for smooth skin.",
                    "Step 3: Hydrating Night Gel — Lock in moisture."
                ],
                "tip": "🚫 Skip heavy treatments tonight to give your skin barrier a rest."
            },
            {
                "day": "Sunday",
                "focus": "Barrier Recovery & Deep Hydration",
                "am": [
                    "Step 1: Hydrating Cleanser — Refresh skin with a gentle wash.",
                    "Step 2: Hyaluronic Hydration Serum — Deeply moisturize dry areas.",
                    "Step 3: Daily Moisturizer — Keep skin smooth.",
                    "Step 4: Sunscreen SPF 50 — Daily protection."
                ],
                "pm": [
                    "Step 1: Gentle Wash — Cleanse skin smoothly.",
                    "Step 2: Soothing Sheet Mask — Relax with a hydrating sheet mask for 15 minutes.",
                    "Step 3: Barrier Cream — Apply rich cream for overnight recovery."
                ],
                "tip": "💆 Relax and get 8 hours of sleep. Deep sleep is when skin heals and renews itself naturally!"
            }
        ],
        "natural_days": [
            {
                "day": "Monday",
                "focus": "Honey & Neem Cleansing Routine",
                "am": [
                    "Step 1: Raw Honey Face Wash — Rinse face with warm water mixed with raw honey (naturally kills bacteria).",
                    "Step 2: Fresh Aloe Vera Gel — Apply pure gel directly from aloe leaf pulp to cool red skin.",
                    "Step 3: Natural Rose Water Mist — Spray rose water for fresh skin hydration."
                ],
                "pm": [
                    "Step 1: Neem Water Wash — Cleanse face using cooled boiled neem leaf water.",
                    "Step 2: Tea Tree Spot Gel — Dab 1 drop of diluted tea tree oil onto pimples.",
                    "Step 3: Jojoba Oil Moisture — Gently pat 2 drops of jojoba oil to nourish skin."
                ],
                "tip": "🍵 Drink spearmint tea or warm lemon water to naturally purify skin from within."
            },
            {
                "day": "Tuesday",
                "focus": "Turmeric & Yogurt Anti-Swelling Mask",
                "am": [
                    "Step 1: Gram Flour (Besan) Wash — Mix besan with rose water as a gentle soap-free cleanser.",
                    "Step 2: Cucumber Juice Splash — Apply fresh cucumber juice as a cooling toner.",
                    "Step 3: Aloe Vera Moisture — Hydrate face with aloe gel."
                ],
                "pm": [
                    "Step 1: Mild Oat Cleanser — Rinse face with finely ground oats mixed with water.",
                    "Step 2: Turmeric & Yogurt Mask — Mix 1 tbsp plain yogurt + 1/4 tsp wild turmeric, apply for 15 mins then rinse.",
                    "Step 3: Aloe Gel Finish — Pat dry and apply pure aloe vera."
                ],
                "tip": "🌱 Turmeric naturally reduces redness and pimple swelling within hours."
            },
            {
                "day": "Wednesday",
                "focus": "Multani Mitti (Fuller's Earth) Oil Absorbing",
                "am": [
                    "Step 1: Honey & Warm Water Wash — Rinse gently.",
                    "Step 2: Aloe Vera & Rosemary Gel — Soothe skin tone.",
                    "Step 3: Rose Water Mist — Spray generously."
                ],
                "pm": [
                    "Step 1: Neem Wash — Cleanse face with neem water.",
                    "Step 2: Multani Mitti Mask — Mix 1 tbsp Multani Mitti with rose water, leave for 10 mins and rinse before fully dry.",
                    "Step 3: Aloe Vera Gel — Lock in natural moisture."
                ],
                "tip": "🍃 Multani Mitti absorbs excess oil and cleanses clogged pores naturally."
            },
            {
                "day": "Thursday",
                "focus": "Green Tea Steam & Honey Mask",
                "am": [
                    "Step 1: Besan & Milk Cleanser — Wash skin smoothly.",
                    "Step 2: Cucumber & Aloe Gel — Refresh skin.",
                    "Step 3: Rose Water Mist — Hydrate skin."
                ],
                "pm": [
                    "Step 1: Green Tea Steam — Lean over a bowl of hot brewed green tea for 5 minutes to open pores.",
                    "Step 2: Raw Honey Mask — Spread raw organic honey over face for 15 minutes, then rinse.",
                    "Step 3: Aloe Vera Moisture — Hydrate face smoothly."
                ],
                "tip": "♨️ Facial steam opens pores so honey can deep-clean bacteria naturally."
            },
            {
                "day": "Friday",
                "focus": "Sandalwood (Chandan) Soothing Care",
                "am": [
                    "Step 1: Honey Wash — Cleanse skin.",
                    "Step 2: Sandalwood Water Mist — Spray cooling sandalwood water.",
                    "Step 3: Aloe Vera Gel — Apply pure gel."
                ],
                "pm": [
                    "Step 1: Neem Water Rinse — Cleanse face gently.",
                    "Step 2: Sandalwood Paste Mask — Mix pure sandalwood powder with rose water, leave for 15 mins then rinse.",
                    "Step 3: Cold-Pressed Oil Moisture — Apply 2 drops of jojoba or rosehip oil."
                ],
                "tip": "🌸 Sandalwood cools heat in skin and helps fade stubborn red spots."
            },
            {
                "day": "Saturday",
                "focus": "Papaya Fruit Enzyme Glow",
                "am": [
                    "Step 1: Besan Wash — Gentle natural cleansing.",
                    "Step 2: Cucumber Gel — Hydrate skin.",
                    "Step 3: Rose Water Mist — Refresh skin."
                ],
                "pm": [
                    "Step 1: Warm Water Rinse — Wash face.",
                    "Step 2: Ripe Papaya Mask — Mash ripe papaya and apply for 12 minutes for natural gentle exfoliation.",
                    "Step 3: Aloe Vera Moisture — Hydrate skin softly."
                ],
                "tip": "🥭 Papaya contains natural enzymes (papain) that remove dead skin without harsh chemicals."
            },
            {
                "day": "Sunday",
                "focus": "Rice Water & Aloe Hydration",
                "am": [
                    "Step 1: Fermented Rice Water Splash — Rinse face with soaked rice water to brighten skin.",
                    "Step 2: Aloe Vera Gel — Apply pure gel.",
                    "Step 3: Rose Water Mist — Refresh face."
                ],
                "pm": [
                    "Step 1: Honey Wash — Wash face gently.",
                    "Step 2: Coconut Water Splash — Pat fresh coconut water onto face for natural minerals.",
                    "Step 3: Aloe & Jojoba Finish — Massage aloe vera with 1 drop of jojoba oil."
                ],
                "tip": "🌾 Rice water has been used for centuries to boost skin smoothness and natural glow!"
            }
        ]
    },
    "dark_spots": {
        "concern_label": "Dark Spots & Pigmentation",
        "goal": "Fade Dark Spots · Brighten Skin Tone · Protect Skin from Sun Damage",
        "key_actives": ["Brightening Serum (Vitamin C)", "Spot Fader (Alpha Arbutin)", "Even Tone Serum (Niacinamide)", "Gentle Exfoliator (AHA)"],
        "clinical_days": [
            {
                "day": "Monday",
                "focus": "Morning Vitamin C Brightening & Sun Protection",
                "am": [
                    "Step 1: Brightening Face Wash — Cleanse face to remove morning oil and dullness.",
                    "Step 2: Vitamin C Glow Serum — Apply 3-4 drops to brighten skin tone and fade dark spots.",
                    "Step 3: Hydrating Gel Moisturizer — Keep skin soft and hydrated.",
                    "Step 4: Daily Sunscreen SPF 50 — Essential protection to stop spots from darkening."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash away dirt and daily pollution.",
                    "Step 2: Spot Fading Serum (Alpha Arbutin) — Apply onto dark spots to reduce melanin buildup.",
                    "Step 3: Skin Texture Serum (Niacinamide) — Smooth out uneven skin tone.",
                    "Step 4: Nourishing Night Cream — Lock in hydration overnight."
                ],
                "tip": "☀️ Always wear SPF 50! Direct sunlight causes dark spots to become darker and more stubborn."
            },
            {
                "day": "Tuesday",
                "focus": "Targeted Spot Treatment & Skin Smoothing",
                "am": [
                    "Step 1: Mild Hydrating Wash — Wash face smoothly.",
                    "Step 2: Even Tone Serum — Apply evenly across face and neck.",
                    "Step 3: Daily Moisturizer — Soften skin.",
                    "Step 4: Sunscreen SPF 50 — Protect skin from sun."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Cleanse thoroughly.",
                    "Step 2: Night Renewal Serum (Retinol) — Apply a small pea-sized amount to dry face to speed cell renewal.",
                    "Step 3: Barrier Cream — Restore skin barrier while sleeping."
                ],
                "tip": "💧 Apply serum to slightly damp skin for faster absorption and deeper hydration."
            },
            {
                "day": "Wednesday",
                "focus": "Gentle Surface Exfoliation",
                "am": [
                    "Step 1: Gentle Cleanser — Wash skin smoothly.",
                    "Step 2: Vitamin C Serum — Protect against free radicals.",
                    "Step 3: Daily Moisturizer — Hydrate gently.",
                    "Step 4: Sunscreen SPF 50 — Daily sun protection."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash face well.",
                    "Step 2: Gentle Exfoliating Serum (AHA Glycolic) — Swipe gently to lift off dead skin cells.",
                    "Step 3: Soothing Night Cream — Hydrate and calm skin."
                ],
                "tip": "🚫 Alternate Exfoliant and Retinol on different nights to keep skin comfortable."
            },
            {
                "day": "Thursday",
                "focus": "Multi-Action Pigmentation Defense",
                "am": [
                    "Step 1: Brightening Face Wash — Refresh skin.",
                    "Step 2: Dual Spot Fader Serum — Target pigmented spots directly.",
                    "Step 3: Daily Moisturizer — Keep skin supple.",
                    "Step 4: Sunscreen SPF 50 — Shield skin from UV rays."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash face gently.",
                    "Step 2: Night Renewal Serum (Retinol) — Smooth over face to speed skin turnover.",
                    "Step 3: Hydrating Barrier Cream — Moisturize deeply."
                ],
                "tip": "🍏 Eat fresh fruits rich in Vitamin C (oranges, berries, bell peppers) to boost skin health from within."
            },
            {
                "day": "Friday",
                "focus": "Botanical Licorice & Niacinamide Care",
                "am": [
                    "Step 1: Mild Face Wash — Cleanse skin.",
                    "Step 2: Niacinamide Serum — Reduce uneven skin patches.",
                    "Step 3: Daily Moisturizer — Hydrate softly.",
                    "Step 4: Sunscreen SPF 50 — Sun barrier protection."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Cleanse thoroughly.",
                    "Step 2: Licorice Brightening Serum — Dab gently on dark spots.",
                    "Step 3: Night Cream — Repair skin overnight."
                ],
                "tip": "⏱️ Fading dark spots requires 4 to 6 weeks of consistent daily sun protection!"
            },
            {
                "day": "Saturday",
                "focus": "Weekly Radiance Boost",
                "am": [
                    "Step 1: Gentle Wash — Refresh face.",
                    "Step 2: Vitamin C Glow Serum — Brighten skin tone.",
                    "Step 3: Daily Moisturizer — Soften skin.",
                    "Step 4: Sunscreen SPF 50 — Shield from sun."
                ],
                "pm": [
                    "Step 1: Evening Cleanser — Wash off daily grime.",
                    "Step 2: Radiance Enzyme Mask — Apply for 15 minutes to reveal fresh glow, then rinse.",
                    "Step 3: Spot Fading Serum — Apply on dark areas.",
                    "Step 4: Night Cream — Deeply nourish skin."
                ],
                "tip": "🧢 Wear a wide hat or sunglasses when outdoors to protect face from direct sunlight."
            },
            {
                "day": "Sunday",
                "focus": "Deep Barrier Hydration & Sleep Recovery",
                "am": [
                    "Step 1: Hydrating Face Wash — Gentle morning wash.",
                    "Step 2: Hyaluronic Acid Serum — Plump skin with moisture.",
                    "Step 3: Daily Moisturizer — Soften skin.",
                    "Step 4: Sunscreen SPF 50 — Complete sun protection."
                ],
                "pm": [
                    "Step 1: Gentle Wash — Cleanse smoothly.",
                    "Step 2: Hydrating Sheet Mask — Relax with a hydrating sheet mask for 15 minutes.",
                    "Step 3: Rich Night Cream — Lock in moisture for overnight repair."
                ],
                "tip": "🛌 Get 8 hours of sleep tonight! Deep sleep is when skin cells naturally repair sun discoloration."
            }
        ],
        "natural_days": [
            {
                "day": "Monday",
                "focus": "Raw Potato Juice Spot Fader",
                "am": [
                    "Step 1: Curd / Milk Cleanser — Cleanse face with cold milk or curd (contains natural lactic acid).",
                    "Step 2: Fresh Potato Juice — Grate raw potato, squeeze fresh juice, apply on dark spots with cotton for 15 mins.",
                    "Step 3: Aloe Vera Gel — Rinse cool and apply pure aloe vera."
                ],
                "pm": [
                    "Step 1: Rose Water Wash — Cleanse face softly.",
                    "Step 2: Honey & Lemon Spot Pack — Mix raw honey + 2 drops lemon juice, apply on spots for 10 mins.",
                    "Step 3: Almond Oil Moisture — Massage 3 drops of pure almond oil."
                ],
                "tip": "🥔 Potato juice contains natural enzymes that help lighten skin hyperpigmentation safely."
            },
            {
                "day": "Tuesday",
                "focus": "Tomato Pulp & Yogurt AHA Pack",
                "am": [
                    "Step 1: Gram Flour (Besan) Wash — Wash face with besan paste.",
                    "Step 2: Fresh Tomato Pulp — Apply fresh tomato pulp for 10 mins (contains natural antioxidants & Vitamin C).",
                    "Step 3: Aloe Vera Moisture — Hydrate with aloe gel."
                ],
                "pm": [
                    "Step 1: Warm Water Wash — Cleanse face.",
                    "Step 2: Yogurt & Turmeric Mask — Mix 1 tbsp plain yogurt + 1/4 tsp turmeric, leave for 15 mins then rinse.",
                    "Step 3: Sweet Almond Oil — Pat dry and nourish."
                ],
                "tip": "🍅 Tomatoes contain Lycopene, a natural antioxidant that protects skin and fades spots."
            },
            {
                "day": "Wednesday",
                "focus": "Fermented Rice Water Glow Ritual",
                "am": [
                    "Step 1: Rice Water Splash — Rinse face with soaked rice water for natural brightness.",
                    "Step 2: Aloe Vera Gel — Apply pure aloe gel."
                ],
                "pm": [
                    "Step 1: Rice Water Pack — Soak cotton pads in cold rice water, lay on dark spots for 15 mins.",
                    "Step 2: Rosehip Seed Oil — Pat 2 drops of rosehip oil to repair skin tone."
                ],
                "tip": "🌾 Rice water is an ancient Asian secret for clear, translucent, even-toned skin."
            },
            {
                "day": "Thursday",
                "focus": "Licorice (Mulethi) Root Brightener",
                "am": [
                    "Step 1: Rose Water Wash — Gentle morning splash.",
                    "Step 2: Aloe Vera Gel — Hydrate smoothly."
                ],
                "pm": [
                    "Step 1: Licorice & Milk Pack — Mix 1 tsp Mulethi (Licorice) powder with raw milk into paste, apply for 15 mins.",
                    "Step 2: Warm Water Rinse — Wash off gently."
                ],
                "tip": "🌿 Licorice root contains Glabridin, a natural compound proven to inhibit melanin production!"
            },
            {
                "day": "Friday",
                "focus": "Saffron (Kesar) Radiance Infusion",
                "am": [
                    "Step 1: Besan Cleanser — Wash skin smoothly.",
                    "Step 2: Aloe Vera Gel — Hydrate."
                ],
                "pm": [
                    "Step 1: Saffron Milk Pack — Soak 3 strands of Saffron in 1 tbsp milk for 1 hour, apply over face for 20 mins.",
                    "Step 2: Cool Water Rinse — Wash off and pat dry."
                ],
                "tip": "✨ Saffron has been prized for centuries for imparting a radiant golden skin complexion."
            },
            {
                "day": "Saturday",
                "focus": "Papaya Fruit Enzyme Mask",
                "am": [
                    "Step 1: Rice Water Rinse — Refresh face.",
                    "Step 2: Aloe Vera Gel — Hydrate smoothly."
                ],
                "pm": [
                    "Step 1: Papaya Pack — Mash 2 ripe papaya cubes with 1 tsp honey, apply for 15 mins then rinse with lukewarm water.",
                    "Step 2: Aloe Vera Moisture — Lock in moisture."
                ],
                "tip": "🥭 Papaya enzymes gently dissolve hyperpigmented skin cells without irritation."
            },
            {
                "day": "Sunday",
                "focus": "Almond & Rose Water Nourishment",
                "am": [
                    "Step 1: Honey Wash — Cleanse skin.",
                    "Step 2: Aloe Vera Gel — Apply pure gel."
                ],
                "pm": [
                    "Step 1: Almond Paste Pack — Grind soaked peeled almonds with rose water into fine paste, leave for 15 mins then wash.",
                    "Step 2: Aloe Vera Finish — Moisturize skin smoothly."
                ],
                "tip": "🥜 Almonds are packed with natural Vitamin E, which repairs sun-damaged skin cells."
            }
        ]
    }
}

# Duplicate dark_spots for pigmentation, wrinkles, redness, pores, blackheads, whiteheads mapping
WEEKLY_PLANS["pigmentation"] = WEEKLY_PLANS["dark_spots"]
WEEKLY_PLANS["redness"] = WEEKLY_PLANS["acne"]
WEEKLY_PLANS["wrinkles"] = WEEKLY_PLANS["dark_spots"]
WEEKLY_PLANS["pores"] = WEEKLY_PLANS["acne"]
WEEKLY_PLANS["blackheads"] = WEEKLY_PLANS["acne"]
WEEKLY_PLANS["whiteheads"] = WEEKLY_PLANS["acne"]


def _get_plan_key(concern: str | None, skin_type: str | None) -> str:
    if not concern:
        return "acne"
    c = concern.lower().replace(" ", "_")
    if "acne" in c or "inflammatory" in c or "blackhead" in c or "whitehead" in c or "pore" in c or "redness" in c:
        return "acne"
    if "dark" in c or "spot" in c or "pigment" in c or "wrinkle" in c:
        return "dark_spots"
    return "acne"


@router.post("/", response_model=SkinProfileOut, status_code=201)
def create_or_update_profile(
    payload: SkinProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()

    if profile:
        for field, value in payload.model_dump().items():
            setattr(profile, field, value)
    else:
        profile = SkinProfile(user_id=current_user.id, **payload.model_dump())
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/me", response_model=SkinProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="No skin profile found yet")
    return profile


from app.services.routine_generator import generate_dynamic_weekly_plan


@router.get("/weekly-plan")
def get_weekly_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(SkinProfile).filter(SkinProfile.user_id == current_user.id).first()

    concern = None
    skin_type = None
    if profile:
        concern = profile.detected_concern
        if not concern and profile.skin_concerns:
            concern = profile.skin_concerns[0] if profile.skin_concerns else None
        skin_type = profile.detected_skin_type or profile.skin_type

    plan = generate_dynamic_weekly_plan(concern, skin_type)

    return {
        "plan_key": plan["plan_key"],
        "concern_label": plan["concern_label"],
        "goal": plan["goal"],
        "key_actives": plan.get("key_actives", []),
        "detected_concern": concern or "acne",
        "detected_skin_type": skin_type or "Normal",
        "clinical_days": plan["clinical_days"],
        "natural_days": plan["natural_days"],
    }