import os
import torch
import torch.nn as nn
import torch.optim as optim
from tqdm import tqdm
from collections import Counter
import numpy as np
from dataset import get_dataloaders
from model import SkinModel
import argparse

def train_model(data_dir, num_epochs=10, batch_size=16, learning_rate=0.001, model_name='efficientnet_b0', save_path='best_model.pth'):
    # Determine device (Use GPU if available, else CPU)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    # Load Data
    print(f"Loading data from {data_dir}...")
    train_loader, val_loader, test_loader, class_names = get_dataloaders(data_dir, batch_size=batch_size)
    num_classes = len(class_names)
    print(f"Classes: {class_names}")

    # Initialize Model
    model = SkinModel(num_classes=num_classes, model_name=model_name)
    model = model.to(device)

    # Calculate Class Weights to handle Class Imbalance
    train_dataset = train_loader.dataset
    target_counts = Counter(train_dataset.targets)
    total_samples = sum(target_counts.values())
    
    class_weights = []
    print("\nClass Distribution and Weights:")
    for i in range(num_classes):
        count = target_counts[i]
        weight = total_samples / (num_classes * count)
        class_weights.append(weight)
        print(f" - {class_names[i]}: {count} images (Weight: {weight:.4f})")
        
    class_weights_tensor = torch.tensor(class_weights, dtype=torch.float).to(device)

    # Loss, Optimizer, and Scheduler
    criterion = nn.CrossEntropyLoss(weight=class_weights_tensor)
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='max', factor=0.5, patience=2, verbose=True)

    best_val_accuracy = 0.0

    # Training Loop
    for epoch in range(num_epochs):
        print(f"\nEpoch {epoch+1}/{num_epochs}")
        print("-" * 20)
        
        # Training Phase
        model.train()
        running_loss = 0.0
        running_corrects = 0
        
        train_bar = tqdm(train_loader, desc="Training")
        for inputs, labels in train_bar:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            with torch.set_grad_enabled(True):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)

                loss.backward()
                optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)
            
            # Update progress bar
            train_bar.set_postfix({'loss': loss.item()})

        epoch_loss = running_loss / len(train_loader.dataset)
        epoch_acc = running_corrects.double() / len(train_loader.dataset)
        
        print(f"Train Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}")

        # Validation Phase
        if val_loader:
            model.eval()
            val_running_loss = 0.0
            val_running_corrects = 0
            
            val_bar = tqdm(val_loader, desc="Validating")
            for inputs, labels in val_bar:
                inputs = inputs.to(device)
                labels = labels.to(device)

                with torch.set_grad_enabled(False):
                    outputs = model(inputs)
                    _, preds = torch.max(outputs, 1)
                    loss = criterion(outputs, labels)

                val_running_loss += loss.item() * inputs.size(0)
                val_running_corrects += torch.sum(preds == labels.data)

            val_epoch_loss = val_running_loss / len(val_loader.dataset)
            val_epoch_acc = val_running_corrects.double() / len(val_loader.dataset)

            print(f"Val Loss: {val_epoch_loss:.4f} Acc: {val_epoch_acc:.4f}")

            # Save the best model
            if val_epoch_acc > best_val_accuracy:
                best_val_accuracy = val_epoch_acc
                torch.save(model.state_dict(), save_path)
                print(f"Saved new best model with accuracy {val_epoch_acc:.4f}")
                
            # Step the scheduler based on validation accuracy
            scheduler.step(val_epoch_acc)

    print("Training complete.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Skin Assessment Model")
    parser.add_argument('--data_dir', type=str, required=True, help="Path to the dataset directory (e.g., 'Data sets/Skin type')")
    parser.add_argument('--epochs', type=int, default=5, help="Number of training epochs")
    parser.add_argument('--batch_size', type=int, default=16, help="Batch size (lower it if RAM runs out)")
    parser.add_argument('--save_path', type=str, default='skin_type_model.pth', help="Path to save the best model")
    
    args = parser.parse_args()
    
    train_model(
        data_dir=args.data_dir,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        save_path=args.save_path
    )
