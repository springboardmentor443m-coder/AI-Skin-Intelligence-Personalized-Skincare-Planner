import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Dimensions suited for EfficientNetB0 and MobileNetV2
IMG_WIDTH, IMG_HEIGHT = 224, 224
BATCH_SIZE = 8

def get_data_generators(data_dir):
    """
    Creates and returns train and validation data generators with 
    built-in rescaling, formatting, and augmentations.
    """
    train_dir = os.path.join(data_dir, 'train')
    val_dir = os.path.join(data_dir, 'validation')
    
    # 1. Training Augmentation Generator
    train_datagen = ImageDataGenerator(
        rescale=1.0/255.0,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.15,
        zoom_range=0.15,
        horizontal_flip=True,
        fill_mode='nearest'
    )
    
    # 2. Validation Generator (Only rescaling, no augmentation)
    val_datagen = ImageDataGenerator(
        rescale=1.0/255.0
    )
    
    # Check directory existence
    if not os.path.exists(train_dir) or not os.path.exists(val_dir):
        raise FileNotFoundError(
            f"Dataset directories not found. Please ensure training data exists at {train_dir} and {val_dir}."
        )

    # 3. Flow From Directory Loaders
    train_generator = train_datagen.flow_from_directory(
        train_dir,
        target_size=(IMG_WIDTH, IMG_HEIGHT),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=True
    )
    
    val_generator = val_datagen.flow_from_directory(
        val_dir,
        target_size=(IMG_WIDTH, IMG_HEIGHT),
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        shuffle=False
    )
    
    return train_generator, val_generator
