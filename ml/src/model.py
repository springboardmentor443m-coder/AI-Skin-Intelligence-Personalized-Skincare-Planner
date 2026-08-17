"""
src/model.py — EfficientNetB0 Model Builder
=============================================
Phase 7: ML Pipeline

What this module does:
  Builds a modified EfficientNetB0 model for 7-class skin lesion classification.

  Transfer learning strategy (two phases):
    Phase 1 — Feature extraction:
      The backbone (all EfficientNetB0 layers) is FROZEN.
      Only the new classification head is trained.
      This is fast and prevents destroying pretrained features.

    Phase 2 — Fine-tuning:
      The last 20% of backbone layers are UNFROZEN.
      The full model is trained with a very small learning rate.
      This lets the model adapt the high-level features to skin images.

Usage:
  from src.model import build_model, freeze_backbone, unfreeze_top_layers

  model = build_model(num_classes=7)
  freeze_backbone(model)           # Phase 1
  unfreeze_top_layers(model, 0.2)  # Phase 2
"""

import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0, EfficientNet_B0_Weights

from src.config import NUM_CLASSES


def build_model(num_classes: int = NUM_CLASSES) -> nn.Module:
    """
    Build an EfficientNetB0 model pretrained on ImageNet,
    with the final classifier replaced for `num_classes` output classes.

    Architecture overview:
      EfficientNetB0 backbone     (pretrained, ~5.3M params)
        └── features (CNN layers)
        └── avgpool
        └── classifier
              └── [0] Dropout(p=0.2)
              └── [1] Linear(1280 → num_classes)   ← THIS is replaced

    The original classifier[1] outputs 1000 classes (ImageNet).
    We replace it with a Linear layer for our 7 HAM10000 classes.

    Args:
        num_classes: Number of output classes (default: 7 for HAM10000)

    Returns:
        nn.Module: The modified EfficientNetB0 model
    """
    # Load the pretrained model with ImageNet weights
    # EfficientNet_B0_Weights.DEFAULT = IMAGENET1K_V1 (most recent stable weights)
    model = efficientnet_b0(weights=EfficientNet_B0_Weights.DEFAULT)

    # Replace the classifier head
    # model.classifier is a Sequential([Dropout, Linear(1280, 1000)])
    # We replace only the Linear layer, keeping the Dropout
    in_features = model.classifier[1].in_features   # 1280 for EfficientNetB0
    model.classifier[1] = nn.Linear(in_features, num_classes)

    return model


def freeze_backbone(model: nn.Module) -> None:
    """
    Freeze all parameters in the EfficientNetB0 backbone (features).
    Only the classifier head will be trained.

    Call this before Phase 1 training.

    Why freeze?
      The backbone has learned to detect edges, textures, and shapes from
      ImageNet. These features transfer well to skin images. Freezing prevents
      us from accidentally overwriting those learned features during the first
      few epochs when the head loss is large.
    """
    for param in model.features.parameters():
        param.requires_grad = False

    # Make sure the classifier head is trainable
    for param in model.classifier.parameters():
        param.requires_grad = True

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total     = sum(p.numel() for p in model.parameters())
    print(f"Backbone frozen. Trainable params: {trainable:,} / {total:,}")


def unfreeze_top_layers(model: nn.Module, fraction: float = 0.2) -> None:
    """
    Unfreeze the top `fraction` of backbone layers for fine-tuning.

    For EfficientNetB0, `model.features` is a Sequential with 9 sub-blocks
    (indices 0–8). With fraction=0.2, the last 2 blocks (7–8) are unfrozen.

    Call this before Phase 2 training, with a small learning rate (1e-5).

    Args:
        model    : The EfficientNetB0 model (after Phase 1 training)
        fraction : Fraction of backbone layers to unfreeze (0.0–1.0)
    """
    backbone_layers = list(model.features.children())
    n_unfreeze = max(1, int(len(backbone_layers) * fraction))
    layers_to_unfreeze = backbone_layers[-n_unfreeze:]

    for layer in layers_to_unfreeze:
        for param in layer.parameters():
            param.requires_grad = True

    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total     = sum(p.numel() for p in model.parameters())
    print(
        f"Unfroze top {n_unfreeze}/{len(backbone_layers)} backbone blocks. "
        f"Trainable params: {trainable:,} / {total:,}"
    )


def get_device() -> torch.device:
    """
    Return the best available device: CUDA GPU > MPS (Apple Silicon) > CPU.

    On Google Colab with a T4 GPU, this returns cuda.
    On CPU-only machines, this returns cpu (training will be slow).
    """
    if torch.cuda.is_available():
        device = torch.device("cuda")
        print(f"Using GPU: {torch.cuda.get_device_name(0)}")
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        device = torch.device("mps")
        print("Using Apple Silicon GPU (MPS)")
    else:
        device = torch.device("cpu")
        print("Warning: No GPU found. Training on CPU will be slow.")
    return device


def count_parameters(model: nn.Module) -> dict:
    """Return total and trainable parameter counts for the model."""
    total     = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return {"total": total, "trainable": trainable, "frozen": total - trainable}


if __name__ == "__main__":
    # Quick sanity check: build model, print summary
    model = build_model()
    params = count_parameters(model)
    print(f"\nEfficientNetB0 ({NUM_CLASSES} classes)")
    print(f"  Total params     : {params['total']:,}")
    print(f"  Trainable params : {params['trainable']:,}")

    # Test forward pass with a dummy input (1 image, 3 channels, 224×224)
    dummy = torch.zeros(1, 3, 224, 224)
    out   = model(dummy)
    print(f"\nForward pass output shape: {out.shape}")   # Expected: [1, 7]
    print("Model build: OK")
