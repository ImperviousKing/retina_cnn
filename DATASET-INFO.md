# Dataset Information for RETINA

## Overview

RETINA uses machine learning models that can be trained on eye disease datasets. This document provides information about recommended datasets and how to use them.

## ⚠️ Important Clarifications

### What RETINA Detects

RETINA is designed to detect eye diseases from **smartphone camera images of the eye** (external view), NOT professional retinal fundus photography.

- ✅ **Supported**: Smartphone photos of eyes
- ✅ **Detection**: External eye abnormalities
- ✅ **Use Case**: Preliminary screening in low-resource settings
- ❌ **Not Supported**: Professional retinal imaging equipment
- ❌ **Not a Replacement**: Professional ophthalmological diagnosis

## 📊 Recommended Public Datasets

### 1. ODIR-5K (Ocular Disease Intelligent Recognition)

**Best for: General eye disease detection**

- 📁 **Size**: ~700MB
- 🔗 **Link**: [Kaggle ODIR-5K](https://www.kaggle.com/datasets/andrewmvd/ocular-disease-recognition-odir5k)
- 📝 **Contains**: 
  - Cataract
  - Glaucoma
  - Diabetic retinopathy
  - Age-related macular degeneration
  - Hypertension
  - Pathological myopia
  - Other diseases
- 📊 **Images**: 5,000+ labeled fundus images
- 📄 **Format**: JPG
- ⚖️ **License**: Research use

**How to Use:**
```bash
# Download from Kaggle
kaggle datasets download -d andrewmvd/ocular-disease-recognition-odir5k

# Extract and organize
unzip ocular-disease-recognition-odir5k.zip -d datasets/odir5k/
```

---

### 2. EyePACS Diabetic Retinopathy Dataset

**Best for: Diabetic retinopathy detection**

- 📁 **Size**: ~35GB (large dataset)
- 🔗 **Link**: [Kaggle Diabetic Retinopathy](https://www.kaggle.com/c/diabetic-retinopathy-detection)
- 📝 **Contains**: 
  - No DR (0)
  - Mild DR (1)
  - Moderate DR (2)
  - Severe DR (3)
  - Proliferative DR (4)
- 📊 **Images**: 35,126 retinal images
- 📄 **Format**: JPEG
- ⚖️ **License**: Competition data use agreement

**How to Use:**
```bash
# Download from Kaggle
kaggle competitions download -c diabetic-retinopathy-detection

# Extract
unzip diabetic-retinopathy-detection.zip -d datasets/eyepacs/
```

---

### 3. REFUGE (Retinal Fundus Glaucoma Challenge)

**Best for: Glaucoma detection**

- 📁 **Size**: ~500MB
- 🔗 **Link**: [REFUGE Challenge](https://refuge.grand-challenge.org/)
- 📝 **Contains**:
  - Normal eyes
  - Glaucomatous eyes
  - Optic disc segmentation
  - Cup-to-disc ratio
- 📊 **Images**: 1,200 fundus images with expert annotations
- 📄 **Format**: JPG with segmentation masks
- ⚖️ **License**: Research use, registration required

**How to Use:**
1. Register at [Grand Challenge](https://refuge.grand-challenge.org/)
2. Download dataset after approval
3. Extract to `datasets/refuge/`

---

### 4. Messidor-2

**Best for: Diabetic retinopathy grading**

- 📁 **Size**: ~300MB
- 🔗 **Link**: [Messidor Website](https://www.adcis.net/en/third-party/messidor2/)
- 📝 **Contains**:
  - DR severity grades
  - Diabetic macular edema risk
- 📊 **Images**: 1,748 eye fundus images
- 📄 **Format**: TIFF
- ⚖️ **License**: Research use, request access

**How to Use:**
1. Request access via website
2. Receive download link
3. Extract to `datasets/messidor2/`

---

### 5. Cataract Dataset (Public Collections)

**Best for: Cataract detection**

- 📁 **Size**: ~100-500MB
- 🔗 **Link**: [Kaggle Cataract Dataset](https://www.kaggle.com/datasets/jr2ngb/cataractdataset)
- 📝 **Contains**:
  - Normal eyes
  - Cataract eyes (various stages)
- 📊 **Images**: 1,000+ eye images
- 📄 **Format**: JPG
- ⚖️ **License**: Public domain / Research use

**How to Use:**
```bash
# Download from Kaggle
kaggle datasets download -d jr2ngb/cataractdataset

# Extract
unzip cataractdataset.zip -d datasets/cataract/
```

---

## 📁 Dataset Organization

### Recommended Folder Structure

```
datasets/
├── glaucoma/
│   ├── train/
│   │   ├── normal/
│   │   │   ├── image_001.jpg
│   │   │   └── ...
│   │   └── glaucoma/
│   │       ├── image_001.jpg
│   │       └── ...
│   └── test/
│       ├── normal/
│       └── glaucoma/
├── diabetic_retinopathy/
│   ├── train/
│   │   ├── normal/
│   │   └── retinopathy/
│   └── test/
│       ├── normal/
│       └── retinopathy/
└── cataract/
    ├── train/
    │   ├── normal/
    │   └── cataract/
    └── test/
        ├── normal/
        └── cataract/
```

### Python Script to Organize Data

```python
import os
import shutil
from pathlib import Path

def organize_dataset(source_dir, dest_dir, label_mapping):
    """
    Organize dataset into train/test splits
    
    Args:
        source_dir: Path to raw dataset
        dest_dir: Path to organized dataset
        label_mapping: Dict mapping original labels to categories
    """
    Path(dest_dir).mkdir(parents=True, exist_ok=True)
    
    # Create directory structure
    for split in ['train', 'test']:
        for category in ['normal', 'disease']:
            Path(dest_dir, split, category).mkdir(parents=True, exist_ok=True)
    
    # Copy and organize files
    # Implementation depends on original dataset structure

# Example usage
organize_dataset(
    'downloads/odir5k/',
    'datasets/glaucoma/',
    {'N': 'normal', 'G': 'glaucoma'}
)
```

---

## 🎓 Using Datasets in RETINA

### Option 1: In-App Training (Current)

Users upload training images directly through the app:

1. Open **Training** tab
2. Select disease type
3. Upload verified patient images
4. AI validates image quality
5. Model improves over time

**Advantages:**
- No manual data preparation
- Continuous learning
- User-friendly

**Limitations:**
- Slower initial accuracy
- Requires many uploads

---

### Option 2: Pre-trained Model (Recommended)

Train a custom model offline using large datasets:

```python
# train_model.py
import tensorflow as tf
from tensorflow import keras

# Load your dataset
train_dataset = keras.preprocessing.image_dataset_from_directory(
    'datasets/glaucoma/train/',
    image_size=(224, 224),
    batch_size=32
)

# Create model (MobileNetV3 example)
base_model = keras.applications.MobileNetV3Small(
    include_top=False,
    weights='imagenet',
    input_shape=(224, 224, 3)
)

model = keras.Sequential([
    base_model,
    keras.layers.GlobalAveragePooling2D(),
    keras.layers.Dense(128, activation='relu'),
    keras.layers.Dropout(0.5),
    keras.layers.Dense(2, activation='softmax')  # binary: normal vs disease
])

# Train
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.fit(train_dataset, epochs=20)

# Save
model.save('trained_models/glaucoma_model.h5')
```

**Export to TensorFlow Lite:**
```python
# Convert to TFLite for mobile
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open('models/glaucoma_model.tflite', 'wb') as f:
    f.write(tflite_model)
```

**Deploy in React Native:**
```typescript
// Load model in your app
import * as tf from '@tensorflow/tfjs';
import * as tfReactNative from '@tensorflow/tfjs-react-native';

await tf.ready();
const model = await tf.loadLayersModel('models/glaucoma_model/model.json');

// Use for inference
const prediction = model.predict(processedImage);
```

---

## 📋 Data Preparation Checklist

Before training:

- [ ] Download dataset(s)
- [ ] Verify image quality
- [ ] Remove corrupted files
- [ ] Balance class distribution
- [ ] Split train/validation/test (70/15/15)
- [ ] Resize images to consistent size
- [ ] Normalize pixel values
- [ ] Augment training data (rotation, flip, zoom)
- [ ] Document preprocessing steps

---

## 🔍 Data Quality Guidelines

### Image Requirements

✅ **Good Quality:**
- Resolution: 224x224 minimum, 512x512+ preferred
- Clear focus on eye structures
- Good lighting (no over/underexposure)
- Minimal artifacts or noise
- Proper labeling (verified by professional)

❌ **Poor Quality:**
- Blurry or out of focus
- Extreme over/underexposure
- Heavy compression artifacts
- Incorrect labeling
- Non-eye images

### Data Balance

Ensure balanced representation:
- Equal samples per class (if possible)
- Diverse patient demographics
- Various disease stages
- Different imaging conditions

---

## 🧪 Data Augmentation

Increase dataset size with augmentation:

```python
from tensorflow.keras.preprocessing.image import ImageDataGenerator

datagen = ImageDataGenerator(
    rotation_range=15,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    fill_mode='nearest'
)

# Generate augmented images
augmented = datagen.flow_from_directory(
    'datasets/train/',
    target_size=(224, 224),
    batch_size=32
)
```

---

## 📊 Expected Results

With proper training on these datasets:

| Dataset | Disease | Expected Accuracy | Training Time |
|---------|---------|-------------------|---------------|
| ODIR-5K | Multi-class | 85-92% | 4-8 hours |
| EyePACS | Diabetic Retinopathy | 88-94% | 12-24 hours |
| REFUGE | Glaucoma | 90-95% | 3-6 hours |
| Messidor-2 | Diabetic Retinopathy | 87-93% | 6-10 hours |
| Cataract Dataset | Cataract | 88-94% | 2-4 hours |

*Training time on GPU (NVIDIA T4 or similar)

---

## ⚖️ Legal & Ethical Considerations

### License Compliance
- Respect dataset licenses
- Cite original sources
- Follow usage restrictions
- Don't redistribute without permission

### Privacy & Ethics
- Remove patient identifiers
- Obtain proper consent (if collecting new data)
- Follow HIPAA guidelines (if applicable)
- Ensure diverse representation

### Medical Ethics
- Don't claim diagnostic accuracy without validation
- Disclose limitations clearly
- Recommend professional consultation
- Follow medical device regulations

---

## 🔗 Additional Resources

### Dataset Repositories
- [Kaggle Medical Datasets](https://www.kaggle.com/datasets?search=eye+disease)
- [Grand Challenges](https://grand-challenge.org/)
- [OpenML Medical](https://www.openml.org/)
- [IEEE DataPort](https://ieee-dataport.org/)

### Tools
- [Roboflow](https://roboflow.com/) - Dataset management
- [LabelImg](https://github.com/tzutalin/labelImg) - Image annotation
- [CVAT](https://www.cvat.ai/) - Computer vision annotation

### Papers
- [A Survey on Deep Learning for Medical Image Analysis](https://arxiv.org/abs/1702.05747)
- [Smartphone-based Eye Disease Detection](https://www.nature.com/articles/s41746-019-0093-2)

---

## 💡 Tips for Best Results

1. **Start Small**: Test with ODIR-5K (700MB) before large datasets
2. **Use Transfer Learning**: Pre-trained models (MobileNet, EfficientNet)
3. **Monitor Overfitting**: Use validation set to check generalization
4. **Iterate**: Train, evaluate, adjust, repeat
5. **Document Everything**: Track experiments and results
6. **Test Thoroughly**: Validate on diverse test cases

---

## 📞 Need Help?

- 📖 Read [MODEL-ARCHITECTURE.md](./MODEL-ARCHITECTURE.md) for technical details
- 💬 Open an issue on GitHub
- 📧 Contact: [Your support email]
- 🔍 Search: [Papers with Code - Medical Imaging](https://paperswithcode.com/area/medical)

---

**Remember**: Always validate models with medical professionals before clinical use!
