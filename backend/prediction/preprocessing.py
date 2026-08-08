
from PIL import Image
from torchvision import transforms

from backend.config import IMAGE_SIZE


# ==============================================================================
# IMAGE TRANSFORM
# ==============================================================================

transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])


# ==============================================================================
# PREPROCESS IMAGE
# ==============================================================================

def preprocess_image(image_path):
    """
    Load an image and convert it into a model-ready tensor.

    Args:
        image_path (str | Path)

    Returns:
        torch.Tensor
    """

    image = Image.open(image_path).convert("RGB")

    image_tensor = transform(image)

    image_tensor = image_tensor.unsqueeze(0)

    return image_tensor