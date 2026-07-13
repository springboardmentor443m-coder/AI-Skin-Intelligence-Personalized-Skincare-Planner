import torch
from dataset import get_dataloaders
from model import SkinModel
from tqdm import tqdm
import argparse
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
import numpy as np

def evaluate_model(data_dir, model_path, num_classes, model_name='efficientnet_b0'):
    # Determine device (Use GPU if available, else CPU)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load Data
    print(f"Loading data from {data_dir}...")
    _, _, test_loader, class_names = get_dataloaders(data_dir, batch_size=16, is_training=False)
    
    if not test_loader:
        print("Error: No Test directory found.")
        return

    # Initialize Model
    model = SkinModel(num_classes=num_classes, model_name=model_name)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()

    all_preds = []
    all_labels = []

    print(f"Evaluating model on {len(test_loader.dataset)} test images...")
    
    test_bar = tqdm(test_loader, desc="Testing")
    for inputs, labels in test_bar:
        inputs = inputs.to(device)
        labels = labels.to(device)

        with torch.set_grad_enabled(False):
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)

        all_preds.extend(preds.cpu().numpy())
        all_labels.extend(labels.cpu().numpy())

    # Calculate metrics
    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)

    accuracy = np.mean(all_preds == all_labels)
    precision = precision_score(all_labels, all_preds, average='weighted', zero_division=0)
    recall = recall_score(all_labels, all_preds, average='weighted', zero_division=0)
    f1 = f1_score(all_labels, all_preds, average='weighted', zero_division=0)
    conf_matrix = confusion_matrix(all_labels, all_preds)

    print("\n--- Final Metrics ---")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    
    print("\n--- Confusion Matrix ---")
    print(class_names)
    print(conf_matrix)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate Skin Assessment Model")
    parser.add_argument('--data_dir', type=str, required=True, help="Path to the dataset directory")
    parser.add_argument('--model_path', type=str, required=True, help="Path to the trained model (.pth)")
    parser.add_argument('--num_classes', type=int, required=True, help="Number of classes")
    
    args = parser.parse_args()
    
    evaluate_model(args.data_dir, args.model_path, args.num_classes)
