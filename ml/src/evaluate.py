"""
src/evaluate.py — Standalone Test-Set Evaluation
==================================================
Phase 7: ML Pipeline

What this script does:
  Loads the saved best model checkpoint and evaluates it on the
  HELD-OUT test set (never seen during training or validation).

  Reports:
    - Overall accuracy
    - Per-class precision, recall, F1-score
    - Weighted and macro averages
    - Confusion matrix (saved as PNG)

  This is the definitive performance report — not training accuracy,
  which is always optimistically biased.

How to run:
  From the ml/ directory (after training is complete):
    python src/evaluate.py

Output files:
  ml/models/confusion_matrix.png
  ml/models/test_metrics.json
"""

import os
import json

import torch
import torch.nn as nn
import numpy as np
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
)

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns

from src.config import (
    MODEL_PATH, MODELS_DIR,
    CLASS_NAMES, CLASS_LABELS, NUM_CLASSES,
    BATCH_SIZE, NUM_WORKERS,
)
from src.dataset import get_dataloaders
from src.model import build_model, get_device


def load_model(model_path: str, device: torch.device) -> nn.Module:
    """
    Load the best model checkpoint saved during training.

    The checkpoint contains:
      - model_state_dict : the trained weights
      - class_names      : sanity check that classes match
      - metadata         : training info (epoch, val_acc, etc.)
    """
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"\nModel checkpoint not found at: {model_path}\n"
            "Please run training first:  python src/train.py\n"
        )

    checkpoint = torch.load(model_path, map_location=device)

    # Verify the checkpoint was trained for the same classes
    ckpt_classes = checkpoint.get("class_names", [])
    if ckpt_classes and ckpt_classes != CLASS_NAMES:
        raise ValueError(
            f"Class mismatch!\n"
            f"  Checkpoint classes : {ckpt_classes}\n"
            f"  Config classes     : {CLASS_NAMES}\n"
        )

    model = build_model(num_classes=NUM_CLASSES)
    model.load_state_dict(checkpoint["model_state_dict"])
    model = model.to(device)
    model.eval()

    meta = checkpoint.get("metadata", {})
    print(f"Loaded checkpoint — Phase {meta.get('phase', '?')}, "
          f"Epoch {meta.get('epoch', '?')}, "
          f"Val acc: {meta.get('val_acc', 0)*100:.1f}%")

    return model


@torch.no_grad()
def get_predictions(model, loader, device):
    """
    Run the model over the entire DataLoader and collect predictions.

    Returns:
        all_labels (list[int])      : Ground-truth class indices
        all_preds  (list[int])      : Predicted class indices
        all_probs  (list[list[float]]): Softmax probabilities per sample
    """
    all_labels = []
    all_preds  = []
    all_probs  = []

    for images, labels in loader:
        images = images.to(device, non_blocking=True)

        logits  = model(images)                          # Raw scores
        probs   = torch.softmax(logits, dim=1)           # Convert to probabilities
        preds   = probs.argmax(dim=1)                    # Predicted class index

        all_labels.extend(labels.cpu().numpy().tolist())
        all_preds.extend(preds.cpu().numpy().tolist())
        all_probs.extend(probs.cpu().numpy().tolist())

    return all_labels, all_preds, all_probs


def plot_confusion_matrix(y_true, y_pred, class_names, save_path):
    """
    Save a colour-coded confusion matrix heatmap.

    Rows = True class, Columns = Predicted class.
    Diagonal cells (correct predictions) appear in darker blue.
    Off-diagonal cells (errors) appear lighter.
    """
    cm = confusion_matrix(y_true, y_pred)
    cm_normalised = cm.astype(float) / cm.sum(axis=1, keepdims=True)

    fig, axes = plt.subplots(1, 2, figsize=(18, 7))

    # Raw counts
    sns.heatmap(
        cm, annot=True, fmt="d", cmap="Blues",
        xticklabels=class_names, yticklabels=class_names,
        ax=axes[0],
    )
    axes[0].set_title("Confusion Matrix (counts)")
    axes[0].set_xlabel("Predicted")
    axes[0].set_ylabel("True")

    # Normalised (row percentages)
    sns.heatmap(
        cm_normalised, annot=True, fmt=".2f", cmap="Blues",
        xticklabels=class_names, yticklabels=class_names,
        ax=axes[1], vmin=0, vmax=1,
    )
    axes[1].set_title("Confusion Matrix (row-normalised)")
    axes[1].set_xlabel("Predicted")
    axes[1].set_ylabel("True")

    plt.tight_layout()
    plt.savefig(save_path, dpi=120, bbox_inches="tight")
    plt.close()
    print(f"  ✓ Confusion matrix saved → {save_path}")


def evaluate():
    print("=" * 60)
    print("AI Skin Intelligence — Phase 7 Test-Set Evaluation")
    print("=" * 60)

    device = get_device()

    # Load model
    print("\nLoading model...")
    model = load_model(MODEL_PATH, device)

    # Load test set only (we don't need train/val for evaluation)
    print("Loading test dataset...")
    _, _, test_loader, _ = get_dataloaders(
        batch_size=BATCH_SIZE,
        num_workers=NUM_WORKERS,
    )

    # Get predictions
    print(f"\nRunning inference on test set ({len(test_loader.dataset)} images)...")
    y_true, y_pred, y_probs = get_predictions(model, test_loader, device)

    # ── Metrics ──────────────────────────────────────────────────────────────

    overall_acc = accuracy_score(y_true, y_pred)
    report_dict = classification_report(
        y_true, y_pred,
        target_names=CLASS_NAMES,
        output_dict=True,
    )
    report_str = classification_report(
        y_true, y_pred,
        target_names=CLASS_NAMES,
    )

    print(f"\n{'='*60}")
    print("TEST SET RESULTS")
    print("=" * 60)
    print(f"\nOverall Accuracy: {overall_acc*100:.2f}%\n")
    print("Per-class metrics:")
    print(report_str)

    # ── Per-class imbalance note ──────────────────────────────────────────────
    print("Note on metrics:")
    print("  HAM10000 is heavily imbalanced (NV has ~67% of images).")
    print("  'Weighted avg' accounts for class frequency — most meaningful overall.")
    print("  'Macro avg' treats all classes equally — best for detecting bias.")
    print("  Per-class F1 for minority classes (vasc, df) is most important to inspect.")

    # ── Confusion matrix ──────────────────────────────────────────────────────
    cm_path = os.path.join(MODELS_DIR, "confusion_matrix.png")
    os.makedirs(MODELS_DIR, exist_ok=True)
    plot_confusion_matrix(y_true, y_pred, CLASS_NAMES, cm_path)

    # ── Save metrics JSON ─────────────────────────────────────────────────────
    metrics = {
        "overall_accuracy": overall_acc,
        "per_class": {
            cls: {
                "precision": report_dict[cls]["precision"],
                "recall":    report_dict[cls]["recall"],
                "f1_score":  report_dict[cls]["f1-score"],
                "support":   report_dict[cls]["support"],
            }
            for cls in CLASS_NAMES
        },
        "weighted_avg": report_dict["weighted avg"],
        "macro_avg":    report_dict["macro avg"],
    }

    metrics_path = os.path.join(MODELS_DIR, "test_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"\n  ✓ Test metrics saved → {metrics_path}")
    print(f"\nEvaluation complete.")
    print("Next step: test a single image with   python src/predict.py <image_path>")


if __name__ == "__main__":
    evaluate()
