import os
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

def get_dataloaders(data_dir, batch_size=32, is_training=True):
    """
    Creates DataLoaders for train, validation, and test sets.
    """
    
    # ImageNet normalization stats
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]

    if is_training:
        train_transforms = transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean, std)
        ])
    else:
        train_transforms = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean, std)
        ])

    val_transforms = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean, std)
    ])

    train_dir = os.path.join(data_dir, 'Train')
    val_dir = os.path.join(data_dir, 'Validation')
    test_dir = os.path.join(data_dir, 'Test')

    # Ensure directories exist
    if not os.path.exists(train_dir):
        raise ValueError(f"Training directory not found at {train_dir}")

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transforms)
    
    # Load validation and test datasets if they exist
    val_dataset = None
    if os.path.exists(val_dir):
        val_dataset = datasets.ImageFolder(val_dir, transform=val_transforms)
        
    test_dataset = None
    if os.path.exists(test_dir):
        test_dataset = datasets.ImageFolder(test_dir, transform=val_transforms)

    # Create DataLoaders
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=0)
    
    val_loader = None
    if val_dataset:
        val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=0)
        
    test_loader = None
    if test_dataset:
        test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False, num_workers=0)

    class_names = train_dataset.classes
    
    return train_loader, val_loader, test_loader, class_names

if __name__ == "__main__":
    # Quick test
    base_dir = r"E:\AI-Skin-Intelligence-Personalized-Skincare-Planner\Data sets\Skin type"
    try:
        tl, vl, testl, classes = get_dataloaders(base_dir)
        print(f"Classes found: {classes}")
        print(f"Number of training batches: {len(tl)}")
    except Exception as e:
        print(f"Error testing dataloader: {e}")
