"""
src/train.py — Model Training Script
======================================
Phase 7: ML Pipeline

What this script does:
  1. Loads the HAM10000 dataset (train / val / test splits)
  2. Builds EfficientNetB0 with a 7-class head
  3. Phase 1 — Feature extraction (backbone frozen, 5 epochs)
  4. Phase 2 — Fine-tuning (top layers unfrozen, up to 10 epochs)
  5. Saves the best model checkpoint (lowest validation loss)
  6. Plots training/validation loss and accuracy curves
  7. Saves training history to a JSON file for later analysis

How to run:
  From the ml/ directory:
    python src/train.py

  On Google Colab, use the notebook in ml/notebooks/01_training.ipynb instead.

Output files (after training):
  ml/models/efficientnetb0_ham10000.pt   ← best model weights
  ml/models/training_history.json        ← per-epoch loss/accuracy
  ml/models/training_curves.png          ← loss + accuracy plots
"""

import os
import json
import time
from datetime import datetime

import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import ReduceLROnPlateau

from src.config import (
    MODELS_DIR, MODEL_PATH,
    CLASS_NAMES, NUM_CLASSES,
    BATCH_SIZE, NUM_WORKERS,
    PHASE1_EPOCHS, PHASE1_LR,
    PHASE2_EPOCHS, PHASE2_LR,
    LR_PATIENCE, LR_FACTOR, LR_MIN,
    EARLY_STOP_PATIENCE,
    RANDOM_SEED,
)
from src.dataset import get_dataloaders
from src.model import build_model, freeze_backbone, unfreeze_top_layers, get_device

import matplotlib
matplotlib.use("Agg")   # Non-interactive backend — works on servers and Colab
import matplotlib.pyplot as plt


# ── Reproducibility ───────────────────────────────────────────────────────────
torch.manual_seed(RANDOM_SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(RANDOM_SEED)


# ── Training loop (single epoch) ──────────────────────────────────────────────

def train_one_epoch(model, loader, criterion, optimizer, device):
    """
    Train the model for one epoch.

    Returns:
        avg_loss (float): Mean loss over all batches
        accuracy (float): Fraction of correct predictions (0.0 – 1.0)
    """
    model.train()
    running_loss = 0.0
    correct = 0
    total   = 0

    for batch_idx, (images, labels) in enumerate(loader):
        images = images.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        optimizer.zero_grad()

        outputs = model(images)          # Forward pass → [batch, num_classes]
        loss    = criterion(outputs, labels)

        loss.backward()                  # Compute gradients
        optimizer.step()                 # Update weights

        running_loss += loss.item() * images.size(0)
        _, predicted  = outputs.max(1)
        correct      += predicted.eq(labels).sum().item()
        total        += labels.size(0)

        # Print progress every 20 batches
        if (batch_idx + 1) % 20 == 0:
            print(
                f"  Batch [{batch_idx + 1}/{len(loader)}] "
                f"Loss: {loss.item():.4f}",
                end="\r",
            )

    avg_loss = running_loss / total
    accuracy = correct / total
    return avg_loss, accuracy


# ── Validation / evaluation loop ──────────────────────────────────────────────

@torch.no_grad()
def evaluate(model, loader, criterion, device):
    """
    Evaluate the model on a DataLoader (validation or test set).

    Decorated with @torch.no_grad() to skip gradient computation —
    this halves memory usage and speeds up evaluation.

    Returns:
        avg_loss (float)
        accuracy (float)
    """
    model.eval()
    running_loss = 0.0
    correct = 0
    total   = 0

    for images, labels in loader:
        images = images.to(device, non_blocking=True)
        labels = labels.to(device, non_blocking=True)

        outputs = model(images)
        loss    = criterion(outputs, labels)

        running_loss += loss.item() * images.size(0)
        _, predicted  = outputs.max(1)
        correct      += predicted.eq(labels).sum().item()
        total        += labels.size(0)

    avg_loss = running_loss / total
    accuracy = correct / total
    return avg_loss, accuracy


# ── Save / load checkpoint ─────────────────────────────────────────────────────

def save_checkpoint(model, path: str, metadata: dict = None):
    """
    Save model weights to a .pt file.

    The checkpoint includes:
      - model state_dict (all layer weights)
      - metadata (class names, num_classes, val_accuracy, etc.)
    """
    os.makedirs(os.path.dirname(path), exist_ok=True)
    checkpoint = {
        "model_state_dict": model.state_dict(),
        "class_names":      CLASS_NAMES,
        "num_classes":      NUM_CLASSES,
        "metadata":         metadata or {},
    }
    torch.save(checkpoint, path)
    print(f"  ✓ Model saved → {path}")


# ── Training curves plot ──────────────────────────────────────────────────────

def plot_history(history: dict, save_path: str):
    """Save a 2-panel plot of loss and accuracy curves (train + val)."""
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))

    ax1.plot(history["train_loss"], label="Train loss")
    ax1.plot(history["val_loss"],   label="Val loss")
    ax1.set_xlabel("Epoch")
    ax1.set_ylabel("Loss")
    ax1.set_title("Loss per Epoch")
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    ax2.plot(history["train_acc"], label="Train accuracy")
    ax2.plot(history["val_acc"],   label="Val accuracy")
    ax2.set_xlabel("Epoch")
    ax2.set_ylabel("Accuracy")
    ax2.set_title("Accuracy per Epoch")
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(save_path, dpi=120)
    plt.close()
    print(f"  ✓ Training curves saved → {save_path}")


# ── Main training entry point ─────────────────────────────────────────────────

def train():
    print("=" * 60)
    print("AI Skin Intelligence — Phase 7 Model Training")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    device = get_device()

    # ── Load data ─────────────────────────────────────────────────────────────
    print("\nLoading dataset...")
    train_loader, val_loader, test_loader, class_weights = get_dataloaders(
        batch_size=BATCH_SIZE,
        num_workers=NUM_WORKERS,
    )

    # ── Build model ───────────────────────────────────────────────────────────
    print("\nBuilding EfficientNetB0 model...")
    model = build_model(num_classes=NUM_CLASSES)
    model = model.to(device)

    # ── Weighted loss (handles class imbalance) ───────────────────────────────
    class_weights = class_weights.to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights)

    # ── Training history (for plots and JSON export) ──────────────────────────
    history = {
        "train_loss": [], "val_loss": [],
        "train_acc":  [], "val_acc":  [],
        "phase":      [],
    }

    best_val_loss   = float("inf")
    best_val_acc    = 0.0
    no_improve_epochs = 0

    # ════════════════════════════════════════════════════════════════════════
    # PHASE 1 — Feature Extraction (backbone frozen)
    # ════════════════════════════════════════════════════════════════════════
    print(f"\n{'='*60}")
    print(f"PHASE 1 — Feature Extraction ({PHASE1_EPOCHS} epochs, LR={PHASE1_LR})")
    print("Backbone frozen. Training classification head only.")
    print("=" * 60)

    freeze_backbone(model)
    optimizer = optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=PHASE1_LR,
    )
    scheduler = ReduceLROnPlateau(
        optimizer, mode="min", factor=LR_FACTOR,
        patience=LR_PATIENCE, min_lr=LR_MIN, verbose=True,
    )

    for epoch in range(1, PHASE1_EPOCHS + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss,   val_acc   = evaluate(model, val_loader, criterion, device)
        scheduler.step(val_loss)
        elapsed = time.time() - t0

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["train_acc"].append(train_acc)
        history["val_acc"].append(val_acc)
        history["phase"].append(1)

        print(
            f"\nEpoch {epoch:02d}/{PHASE1_EPOCHS}  [{elapsed:.0f}s]  "
            f"Train: loss={train_loss:.4f} acc={train_acc:.4f}  |  "
            f"Val: loss={val_loss:.4f} acc={val_acc:.4f}"
        )

        # Save checkpoint if this is the best val loss so far
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_val_acc  = val_acc
            no_improve_epochs = 0
            save_checkpoint(
                model, MODEL_PATH,
                metadata={
                    "phase": 1, "epoch": epoch,
                    "val_loss": val_loss, "val_acc": val_acc,
                },
            )
        else:
            no_improve_epochs += 1
            if no_improve_epochs >= EARLY_STOP_PATIENCE:
                print(f"\n  Early stopping after {epoch} Phase-1 epochs (no val improvement).")
                break

    # ════════════════════════════════════════════════════════════════════════
    # PHASE 2 — Fine-tuning (top backbone layers unfrozen)
    # ════════════════════════════════════════════════════════════════════════
    print(f"\n{'='*60}")
    print(f"PHASE 2 — Fine-tuning ({PHASE2_EPOCHS} epochs, LR={PHASE2_LR})")
    print("Unfreezing top 20% of backbone layers.")
    print("=" * 60)

    unfreeze_top_layers(model, fraction=0.2)
    optimizer = optim.Adam(
        filter(lambda p: p.requires_grad, model.parameters()),
        lr=PHASE2_LR,
    )
    scheduler = ReduceLROnPlateau(
        optimizer, mode="min", factor=LR_FACTOR,
        patience=LR_PATIENCE, min_lr=LR_MIN, verbose=True,
    )

    no_improve_epochs = 0

    for epoch in range(1, PHASE2_EPOCHS + 1):
        t0 = time.time()
        train_loss, train_acc = train_one_epoch(model, train_loader, criterion, optimizer, device)
        val_loss,   val_acc   = evaluate(model, val_loader, criterion, device)
        scheduler.step(val_loss)
        elapsed = time.time() - t0

        history["train_loss"].append(train_loss)
        history["val_loss"].append(val_loss)
        history["train_acc"].append(train_acc)
        history["val_acc"].append(val_acc)
        history["phase"].append(2)

        print(
            f"\nEpoch {epoch:02d}/{PHASE2_EPOCHS}  [{elapsed:.0f}s]  "
            f"Train: loss={train_loss:.4f} acc={train_acc:.4f}  |  "
            f"Val: loss={val_loss:.4f} acc={val_acc:.4f}"
        )

        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_val_acc  = val_acc
            no_improve_epochs = 0
            save_checkpoint(
                model, MODEL_PATH,
                metadata={
                    "phase": 2, "epoch": epoch,
                    "val_loss": val_loss, "val_acc": val_acc,
                },
            )
        else:
            no_improve_epochs += 1
            if no_improve_epochs >= EARLY_STOP_PATIENCE:
                print(f"\n  Early stopping after {epoch} Phase-2 epochs (no val improvement).")
                break

    # ── Save training history ─────────────────────────────────────────────────
    history_path = os.path.join(MODELS_DIR, "training_history.json")
    os.makedirs(MODELS_DIR, exist_ok=True)
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)
    print(f"\n  ✓ Training history saved → {history_path}")

    # ── Save training curves ──────────────────────────────────────────────────
    plot_history(history, save_path=os.path.join(MODELS_DIR, "training_curves.png"))

    print(f"\n{'='*60}")
    print(f"Training complete!")
    print(f"  Best val loss     : {best_val_loss:.4f}")
    print(f"  Best val accuracy : {best_val_acc:.4f}  ({best_val_acc*100:.1f}%)")
    print(f"  Model saved at    : {MODEL_PATH}")
    print("=" * 60)
    print("\nNext step: run   python src/evaluate.py   for full test-set metrics.")


if __name__ == "__main__":
    train()
