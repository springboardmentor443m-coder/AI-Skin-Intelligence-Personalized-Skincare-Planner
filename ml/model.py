import torch
import torch.nn as nn
from torchvision import models

class SkinModel(nn.Module):
    def __init__(self, num_classes, model_name='efficientnet_b0', pretrained=True):
        super(SkinModel, self).__init__()
        
        self.model_name = model_name
        
        if model_name == 'efficientnet_b0':
            # Use pre-trained EfficientNet-B0
            weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
            self.base_model = models.efficientnet_b0(weights=weights)
            
            # Get the number of features in the last layer
            in_features = self.base_model.classifier[1].in_features
            
            # Replace the classification head
            self.base_model.classifier[1] = nn.Linear(in_features, num_classes)
            
        elif model_name == 'mobilenet_v3':
            weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
            self.base_model = models.mobilenet_v3_small(weights=weights)
            
            in_features = self.base_model.classifier[3].in_features
            self.base_model.classifier[3] = nn.Linear(in_features, num_classes)
            
        else:
            raise ValueError(f"Model {model_name} not supported.")

    def forward(self, x):
        return self.base_model(x)

if __name__ == "__main__":
    # Quick test
    model = SkinModel(num_classes=5, model_name='efficientnet_b0')
    print("Model loaded successfully.")
    # Dummy input (batch_size, channels, height, width)
    dummy_input = torch.randn(1, 3, 224, 224)
    output = model(dummy_input)
    print(f"Output shape: {output.shape}") # Should be [1, 5]
