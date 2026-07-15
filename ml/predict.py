import torch
from torchvision import transforms
from PIL import Image
from model import SkinModel
import json

def load_model(model_path, num_classes, model_name='efficientnet_b0'):
    model = SkinModel(num_classes=num_classes, model_name=model_name)
    
    # Map location ensures we can load a model trained on GPU onto a CPU if needed
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()
    return model

def predict_image(image_path, model, class_names):
    # Standard transformations for validation/testing
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]
    
    transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean, std)
    ])

    image = Image.open(image_path).convert("RGB")
    image_tensor = transform(image).unsqueeze(0) # Add batch dimension

    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        
        # Get top prediction
        confidence, predicted_idx = torch.max(probabilities, 1)
        predicted_class = class_names[predicted_idx.item()]
        
        return {
            "prediction": predicted_class,
            "confidence": round(confidence.item(), 4),
            "all_probabilities": {class_names[i]: round(prob.item(), 4) for i, prob in enumerate(probabilities[0])}
        }

def analyze_skin(image_path, type_model_path, concern_model_path):
    import os
    
    # Define classes exactly as they appear in the training folders (alphabetical)
    type_classes = ['Combination', 'Dry', 'Normal', 'Oily', 'Sensitive']
    concern_classes = ['Normal', 'Redness', 'dark spots', 'inflammatory acne', 'non inflammatory acne black heads', 
                       'non inflammatory acne white heads', 'pigmentation', 'pores', 'wrinkles']
    
    results = {}
    
    if os.path.exists(type_model_path):
        type_model = load_model(type_model_path, num_classes=len(type_classes))
        results["skin_type"] = predict_image(image_path, type_model, type_classes)
    else:
        results["skin_type"] = {"error": f"Model {type_model_path} not found"}
        
    if os.path.exists(concern_model_path):
        concern_model = load_model(concern_model_path, num_classes=len(concern_classes))
        results["skin_concerns"] = predict_image(image_path, concern_model, concern_classes)
    else:
        results["skin_concerns"] = {"error": f"Model {concern_model_path} not found"}
        
    return results

if __name__ == "__main__":
    import sys
    # Quick test if arguments are provided
    if len(sys.argv) > 1:
        img_path = sys.argv[1]
        
        type_model_file = 'skin_type_model.pth'
        concern_model_file = 'skin_concern_model.pth'
        
        print(f"Analyzing image: {img_path}")
        final_analysis = analyze_skin(img_path, type_model_file, concern_model_file)
        print(json.dumps(final_analysis, indent=2))
    else:
        print("Usage: python predict.py <path_to_image>")
