export const getPythonTrainingScript = () => {
  return `
# CNN Training Script for Eye Disease Detection
# Place your 700MB dataset in the structure below and run this script

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os

# Dataset paths
DATASET_DIR = './datasets'  # Place your dataset here
MODEL_OUTPUT_DIR = './models/eye_disease_cnn'

# Create model output directory
os.makedirs(MODEL_OUTPUT_DIR, exist_ok=True)

# Image parameters
IMG_HEIGHT = 224
IMG_WIDTH = 224
BATCH_SIZE = 32
EPOCHS = 50

# Data augmentation for training
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    validation_split=0.2,
    zoom_range=0.2,
    shear_range=0.2
)

# Validation data (no augmentation)
val_datagen = ImageDataGenerator(
    rescale=1./255,
    validation_split=0.2
)

# Load training data
train_generator = train_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training',
    classes=['glaucoma', 'diabetic_retinopathy', 'cataract', 'normal']
)

# Load validation data
validation_generator = val_datagen.flow_from_directory(
    DATASET_DIR,
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation',
    classes=['glaucoma', 'diabetic_retinopathy', 'cataract', 'normal']
)

# Build CNN model
def create_cnn_model():
    model = keras.Sequential([
        # First Convolutional Block
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_HEIGHT, IMG_WIDTH, 3)),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Second Convolutional Block
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Third Convolutional Block
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Fourth Convolutional Block
        layers.Conv2D(256, (3, 3), activation='relu'),
        layers.BatchNormalization(),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),
        
        # Flatten and Dense layers
        layers.Flatten(),
        layers.Dense(512, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.5),
        
        # Output layer (4 classes: glaucoma, retinopathy, cataract, normal)
        layers.Dense(4, activation='softmax')
    ])
    
    return model

# Create model
model = create_cnn_model()

# Compile model
model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.0001),
    loss='categorical_crossentropy',
    metrics=['accuracy', 'AUC']
)

# Print model summary
model.summary()

# Callbacks
callbacks = [
    keras.callbacks.EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True
    ),
    keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=1e-7
    ),
    keras.callbacks.ModelCheckpoint(
        os.path.join(MODEL_OUTPUT_DIR, 'best_model.h5'),
        monitor='val_accuracy',
        save_best_only=True
    )
]

# Train model
print("Starting training...")
history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=callbacks
)

# Save model in TensorFlow.js format
print("Converting model to TensorFlow.js format...")
import tensorflowjs as tfjs

tfjs.converters.save_keras_model(model, MODEL_OUTPUT_DIR)
print(f"Model saved to {MODEL_OUTPUT_DIR}")

# Evaluate model
print("\\nEvaluating model on validation data...")
val_loss, val_accuracy, val_auc = model.evaluate(validation_generator)
print(f"Validation Loss: {val_loss:.4f}")
print(f"Validation Accuracy: {val_accuracy:.4f}")
print(f"Validation AUC: {val_auc:.4f}")

print("\\n=== Training Complete ===")
print(f"Copy the files from '{MODEL_OUTPUT_DIR}' to your mobile app's models directory")
print("The model is now ready to use in your React Native app!")
`.trim();
};

export const getTrainingInstructions = () => {
  return `
CNN MODEL TRAINING GUIDE
========================

STEP 1: Prepare Your Environment
---------------------------------
1. Install Python 3.8+ and pip
2. Install required packages:
   pip install tensorflow tensorflowjs numpy pillow matplotlib

STEP 2: Organize Your Dataset
------------------------------
Create this folder structure with your 700MB of images:

datasets/
├── glaucoma/
│   ├── image001.jpg
│   ├── image002.jpg
│   └── ... (glaucoma eye images)
├── diabetic_retinopathy/
│   ├── image001.jpg
│   ├── image002.jpg
│   └── ... (diabetic retinopathy images)
├── cataract/
│   ├── image001.jpg
│   ├── image002.jpg
│   └── ... (cataract eye images)
└── normal/
    ├── image001.jpg
    ├── image002.jpg
    └── ... (healthy eye images)

STEP 3: Run Training Script
----------------------------
1. Save the Python training script to a file: train_model.py
2. Place your dataset in the 'datasets' folder
3. Run the script:
   python train_model.py

4. Wait for training to complete (this may take several hours)
5. The model will be saved in 'models/eye_disease_cnn/'

STEP 4: Deploy Model to App
----------------------------
On Mobile (iOS/Android):
1. Connect your device to computer
2. Navigate to the app's document directory
3. Copy the entire 'models' folder to:
   <App Document Directory>/models/

On Web:
1. Place the model files in the public/models/ directory
2. Ensure model.json and weight files are accessible

STEP 5: Verify Model
---------------------
1. Open the app
2. Check console logs for "[CNN] Model loaded successfully"
3. If model is not found, verify the file paths
4. Test with a sample image to verify predictions

Training Tips:
--------------
- Ensure balanced dataset (similar number of images per class)
- Use high-quality eye images (at least 224x224 pixels)
- More training data = better accuracy
- Monitor validation accuracy during training
- If accuracy is low, increase epochs or add more data
- Consider using transfer learning (MobileNet, ResNet) for better results

Expected Training Time:
-----------------------
- With GPU: 2-4 hours
- Without GPU: 8-16 hours
- Depends on dataset size and hardware

Model Performance:
------------------
Target metrics:
- Training Accuracy: >90%
- Validation Accuracy: >85%
- AUC Score: >0.90

If metrics are below target:
1. Increase dataset size
2. Add more data augmentation
3. Try transfer learning
4. Adjust learning rate
5. Increase model complexity
  `.trim();
};

export const getRequiredPackages = () => {
  return [
    'tensorflow>=2.10.0',
    'tensorflowjs>=4.0.0',
    'numpy>=1.21.0',
    'pillow>=9.0.0',
    'matplotlib>=3.5.0',
  ];
};

export const getModelArchitecture = () => {
  return {
    inputShape: [224, 224, 3],
    outputClasses: 4,
    classes: ['glaucoma', 'diabetic_retinopathy', 'cataract', 'normal'],
    layers: [
      { type: 'Conv2D', filters: 32, kernelSize: [3, 3], activation: 'relu' },
      { type: 'BatchNormalization' },
      { type: 'MaxPooling2D', poolSize: [2, 2] },
      { type: 'Dropout', rate: 0.25 },
      { type: 'Conv2D', filters: 64, kernelSize: [3, 3], activation: 'relu' },
      { type: 'BatchNormalization' },
      { type: 'MaxPooling2D', poolSize: [2, 2] },
      { type: 'Dropout', rate: 0.25 },
      { type: 'Conv2D', filters: 128, kernelSize: [3, 3], activation: 'relu' },
      { type: 'BatchNormalization' },
      { type: 'MaxPooling2D', poolSize: [2, 2] },
      { type: 'Dropout', rate: 0.25 },
      { type: 'Conv2D', filters: 256, kernelSize: [3, 3], activation: 'relu' },
      { type: 'BatchNormalization' },
      { type: 'MaxPooling2D', poolSize: [2, 2] },
      { type: 'Dropout', rate: 0.25 },
      { type: 'Flatten' },
      { type: 'Dense', units: 512, activation: 'relu' },
      { type: 'BatchNormalization' },
      { type: 'Dropout', rate: 0.5 },
      { type: 'Dense', units: 256, activation: 'relu' },
      { type: 'BatchNormalization' },
      { type: 'Dropout', rate: 0.5 },
      { type: 'Dense', units: 4, activation: 'softmax' },
    ],
    optimizer: 'Adam',
    learningRate: 0.0001,
    loss: 'categorical_crossentropy',
    metrics: ['accuracy', 'AUC'],
  };
};
