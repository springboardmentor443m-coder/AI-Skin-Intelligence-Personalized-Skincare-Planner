# AI Skin Intelligence & Personalized Skincare Planner

A full-stack skincare intelligence platform: FastAPI backend (SQLite,
simple login/register, real trained CNN for skin-type prediction, rule-based
routine/scoring/ingredient/product engines) + a plain HTML/CSS/JS frontend
with role-based dashboards.

---

## 1. Project structure

```
skinai/
├── backend/                      <- Python / FastAPI - everything runs from here
│   ├── main.py                    <- entrypoint - this is what you run
│   ├── database.py, models.py, schemas.py, auth.py, deps.py
│   ├── seed_data.py               <- creates 4 demo accounts (one per role)
│   ├── build_products_from_csv.py <- regenerates data/products.json from a Sephora-style CSV
│   ├── requirements.txt           <- all Python libraries needed - see step 3
│   ├── skin_intelligence.db       <- SQLite database file, auto-created on first run
│   ├── ml/                        <- the "intelligence" layer, pure Python + your trained model
│   │   ├── skin_type_model.keras  <- YOUR trained MobileNetV2 skin-type classifier
│   │   ├── skin_type_model.py     <- loads/runs the model above
│   │   ├── assessment_engine.py, scoring_engine.py, routine_engine.py,
│   │   │   ingredient_engine.py, product_engine.py
│   ├── routers/                   <- one file per API module
│   ├── data/
│   │   ├── ingredients.json       <- curated ingredient database
│   │   └── products.json          <- 280 real products, built from your Sephora dataset
│   └── uploads/                   <- uploaded assessment photos land here
│
├── frontend/                      <- plain HTML/CSS/JS - no build step, no npm needed
│   ├── index.html                  <- login/register screen + app shell
│   ├── css/styles.css
│   └── js/
│       ├── api.js                  <- talks to the backend
│       └── app.js                  <- all pages/views + routing logic
│
└── README.md                      <- this file
```

**Important:** keep `backend/` and `frontend/` sitting next to each other,
exactly as they are here. The backend serves the frontend directly - you do
NOT run two separate servers or two separate terminals for this project.

---

## 2. What you need installed first

- **Python 3.10 or newer** (check with `python --version` or `python3 --version`)
- That's it. No Node.js, no npm, no separate frontend server - the frontend
  is plain HTML/CSS/JS and FastAPI serves it directly.

---

## 3. Setup (do this once)

Open **one terminal**, and go into the `backend` folder - that is the ONLY
folder you ever run commands from for this project:

```bash
cd skinai/backend
```

Create a virtual environment (keeps this project's libraries separate from
everything else on your machine):

```bash
python -m venv venv
```

Activate it:
```bash
# Mac/Linux:
source venv/bin/activate

# Windows (Command Prompt):
venv\Scripts\activate.bat

# Windows (PowerShell):
venv\Scripts\Activate.ps1
```
You'll know it worked because your terminal prompt now starts with `(venv)`.

Install every library the backend needs, all in one command:
```bash
pip install -r requirements.txt
```

This installs: `fastapi`, `uvicorn` (the server), `sqlalchemy` (database),
`pydantic` (data validation), `bcrypt` (password hashing), `fpdf2` +
`openpyxl` (PDF/Excel report export), `pandas` (product data ETL), and
`tensorflow-cpu` + `numpy` + `Pillow` (to run your trained `.keras` model).
This last group is the biggest download (~500MB) and may take a few minutes.

Create the 4 demo login accounts (one per role) so you have something to
log in with immediately:
```bash
python seed_data.py
```

---

## 4. Running the program

Still in the same terminal, same `backend` folder, same activated `venv`:

```bash
uvicorn main:app --reload --port 8000
```

You'll see:
```
Uvicorn running on http://127.0.0.1:8000
```

Now open your web browser and go to:

### **http://127.0.0.1:8000**

That's it — one terminal, one command, one URL. The frontend and backend
are the same running program; there's no second terminal to open.

To stop the server: go back to the terminal and press `Ctrl+C`.
Next time, you only need to repeat step 4 (activate venv, then
`uvicorn main:app --reload --port 8000`) - steps 1-3 (installing libraries,
seeding demo data) are one-time setup.

---

## 5. Logging in

Use one of the demo accounts created by `seed_data.py`, or register your own
from the app's Register tab.

| Email | Password | Role | Dashboard you'll see |
|---|---|---|---|
| user@demo.com | password123 | user | Full skincare planner |
| consultant@demo.com | password123 | consultant | Client list + detail view |
| dermatologist@demo.com | password123 | dermatologist | Patient list + detail view |
| admin@demo.com | password123 | admin | Platform stats + all users |

As a **user**, try this flow: My Profile (fill it in and save) → Assessment
(run one, optionally upload a face photo to use your trained model) →
Routine (generate) → Products / Ingredients (browse recommendations) →
Progress (see your Skin Health Score) → Reports (download PDF/Excel).

---

## 6. Where your data is stored

Everything lands in one file: `backend/skin_intelligence.db` (SQLite).
Delete it any time to reset the app completely - it's recreated
automatically the next time you start the server (you'll need to re-run
`python seed_data.py` afterward for the demo logins).

Uploaded assessment photos are saved in `backend/uploads/`.

---

## 7. Your trained model & product data - already wired in

- `backend/ml/skin_type_model.keras` is your real trained classifier. It
  loads automatically on server start - check the terminal log for
  `[ml] Loaded trained skin-type model from ...` to confirm.
- **One thing to double check:** `backend/ml/skin_type_model.py` has a
  `CLASS_LABELS` list guessed as alphabetical order (`combination, dry,
  normal, oily, sensitive`) since the label-order file you sent uploaded
  empty. If your training used a different class order, edit that one list.
- `backend/data/products.json` was generated from your Sephora product CSV
  via `backend/build_products_from_csv.py`. Re-run it any time you have an
  updated CSV: `python build_products_from_csv.py /path/to/product_info.csv`

---

## 8. If something goes wrong

- **"command not found: python"** → try `python3` instead of `python` in
  every command above.
- **Port 8000 already in use** → run on a different port:
  `uvicorn main:app --reload --port 8001`, then visit
  `http://127.0.0.1:8001` instead.
- **Browser shows a blank page or old version** → hard-refresh
  (Ctrl+Shift+R / Cmd+Shift+R) - the browser may be caching an old file.
- **`ModuleNotFoundError`** → your virtual environment isn't activated, or
  `pip install -r requirements.txt` didn't finish. Re-run step 3.

---

## 9. What's left to build

- [ ] Docker + docker-compose (for production-style deployment)
- [ ] Confirm `CLASS_LABELS` order in `skin_type_model.py` against your
      actual training folder structure
