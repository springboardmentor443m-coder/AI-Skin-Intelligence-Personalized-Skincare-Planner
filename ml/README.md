# Phase 7 — ML Model (HAM10000 + EfficientNetB0)

> ⚠️ **Educational Project Disclaimer**
> This model is for learning purposes only. It is **not** a medical diagnostic tool.
> Do not use model predictions to make clinical decisions. Consult a qualified dermatologist.

---

## Dataset

**Name:** HAM10000 (Human Against Machine with 10,000 Training Images)
**Source:** Kaggle — `kmader/skin-lesion-analysis-toward-melanoma-detection`
**License:** CC BY-NC 4.0 (non-commercial / educational use)
**Total images:** 10,015 dermatoscopic JPEG images
**Label file:** `HAM10000_metadata.csv`

### Classes (7 total)

| Code | Full Name | Type | Count |
|---|---|---|---|
| `nv` | Melanocytic Nevi | Benign | ~6,705 |
| `mel` | Melanoma | Malignant | ~1,113 |
| `bkl` | Benign Keratosis-like Lesions | Benign | ~1,099 |
| `bcc` | Basal Cell Carcinoma | Malignant | ~514 |
| `akiec` | Actinic Keratoses / Intraepithelial Carcinoma | Pre-malignant | ~327 |
| `df` | Dermatofibroma | Benign | ~115 |
| `vasc` | Vascular Lesions | Benign | ~142 |

> **Note:** The dataset is heavily imbalanced — NV accounts for ~67% of images.
> The training pipeline handles this with weighted cross-entropy loss and WeightedRandomSampler.

---

## Project Structure

```
ml/
├── dataset/
│   └── HAM10000/
│       ├── images/               ← 10,015 JPEG images (git-ignored, ~2.4 GB)
│       └── HAM10000_metadata.csv ← Labels CSV
├── models/
│   ├── efficientnetb0_ham10000.pt ← Trained weights (git-ignored)
│   ├── training_curves.png
│   ├── confusion_matrix.png
│   ├── training_history.json
│   └── test_metrics.json
├── notebooks/
│   └── 01_training.ipynb         ← Google Colab training notebook
├── sample_images/                ← Put test images here
├── src/
│   ├── config.py                 ← All hyperparameters and paths
│   ├── dataset.py                ← PyTorch Dataset + DataLoaders
│   ├── model.py                  ← EfficientNetB0 builder
│   ├── train.py                  ← Training script
│   ├── evaluate.py               ← Test-set evaluation
│   └── predict.py                ← Reusable prediction function
└── requirements.txt              ← ML-specific dependencies
```

---

## Model Architecture

**Base model:** EfficientNetB0 (pretrained on ImageNet, from `torchvision.models`)
**Input:** RGB image, resized to 224×224, normalised with ImageNet mean/std
**Output:** 7-class softmax probabilities

**Modifications:**
- Original `classifier[1]` (`Linear(1280, 1000)`) replaced with `Linear(1280, 7)`
- All other layers initially frozen (Phase 1), top 20% unfrozen (Phase 2)

**Transfer learning strategy:**

| Phase | Epochs | LR | Backbone |
|---|---|---|---|
| 1 — Feature extraction | 5 | 1e-3 | Frozen |
| 2 — Fine-tuning | up to 10 (early stop) | 1e-5 | Top 20% unfrozen |

---

## Preprocessing

```python
# Training (with augmentation)
transforms.Resize(256)
transforms.RandomCrop(224)
transforms.RandomHorizontalFlip(p=0.5)
transforms.RandomVerticalFlip(p=0.5)
transforms.RandomRotation(degrees=20)
transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1)
transforms.ToTensor()
transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])

# Validation / Test / Inference (no augmentation)
transforms.Resize(256)
transforms.CenterCrop(224)
transforms.ToTensor()
transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
```

**Train / Val / Test split:** 70% / 15% / 15% (stratified, `random_seed=42`)

---

## Training (Google Colab — Recommended)

### Prerequisites
1. Free Kaggle account at https://www.kaggle.com
2. Kaggle API key (`kaggle.json`) from Profile → Settings → API

### Steps
1. Open `ml/notebooks/01_training.ipynb` in Google Colab
2. Enable GPU: Runtime → Change runtime type → T4 GPU
3. Run all cells in order
4. Download `efficientnetb0_ham10000.pt` at the end
5. Place it in `ml/models/`

### Expected training time
~45–90 minutes on a free Colab T4 GPU

### Training locally (alternative)

```bash
cd ml/
python -m venv venv
venv\Scripts\activate    # Windows
pip install -r requirements.txt

# Download dataset first (requires kaggle.json configured)
kaggle datasets download -d kmader/skin-lesion-analysis-toward-melanoma-detection \
    -p dataset/HAM10000 --unzip

# Train
python src/train.py

# Evaluate on test set
python src/evaluate.py
```

---

## Evaluation Results

*Fill in after training. Example format:*

| Metric | Value |
|---|---|
| Overall Accuracy | TBD |
| Weighted F1 | TBD |
| Macro F1 | TBD |

*Per-class F1 scores (from `ml/models/test_metrics.json` after training)*

---

## Prediction Usage

### Command line

```bash
cd ml/
python src/predict.py sample_images/your_skin_image.jpg
```

Example output:
```
✅ Prediction Result:
   Class      : nv
   Label      : Melanocytic Nevi
   Confidence : 93.12%

   All class scores:
     nv      : 93.1%  ████████████████████████████
     mel     :  3.2%  █
     bkl     :  2.1%
     ...
```

### Python import (used by FastAPI in Phase 8)

```python
from src.predict import predict_image, predict_top_k

# Single best prediction
result = predict_image("path/to/image.jpg")
# Returns: { "class": "nv", "label": "Melanocytic Nevi", "confidence": 0.9312, "all_scores": {...} }

# Top-3 predictions
top3 = predict_top_k("path/to/image.jpg", k=3)
# Returns: [{"class": "nv", "label": ..., "confidence": 0.93}, ...]
```

---

## Model Location

- **Development:** `ml/models/efficientnetb0_ham10000.pt` (local, git-ignored)
- **Colab:** `/content/ml/models/efficientnetb0_ham10000.pt` (download after training)
- **Production (Phase 8+):** Store in cloud storage (S3, GCS) or FastAPI server's filesystem

The model file is approximately **20–25 MB** — too large for Git (100 MB limit, but discouraged for binaries). Do not commit it.

---

## Known Limitations

1. **Class imbalance:** Despite weighted sampling and loss, minority classes (vasc, df) will have lower recall
2. **Dermatoscopy only:** HAM10000 contains dermatoscope images — not regular phone camera photos. Real-world accuracy on phone photos may be lower
3. **Not clinically validated:** This model has not been validated in a clinical setting
4. **7 classes only:** Many real skin conditions are not represented
5. **Skin tone bias:** HAM10000 has limited diversity in patient skin tones

---

*Phase 7 complete. Phase 8 will connect this model to the FastAPI backend.*
