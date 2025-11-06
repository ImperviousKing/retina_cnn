# RETINA: CNN-Based Eye Disease Detection

## Overview
This app uses a Convolutional Neural Network (CNN) to detect three types of eye diseases:
- **Glaucoma** - Optic nerve damage
- **Diabetic Retinopathy** - Retinal blood vessel damage  
- **Cataract** - Lens clouding

Plus detection of **Normal** healthy eyes.

## CNN Model Architecture

### Input
- Image Size: 224x224x3 (RGB)
- Preprocessing: Normalization (pixel values / 255)

### Model Structure
```
Conv2D(32) → BatchNorm → MaxPool → Dropout(0.25)
Conv2D(64) → BatchNorm → MaxPool → Dropout(0.25)
Conv2D(128) → BatchNorm → MaxPool → Dropout(0.25)
Conv2D(256) → BatchNorm → MaxPool → Dropout(0.25)
Flatten → Dense(512) → BatchNorm → Dropout(0.5)
Dense(256) → BatchNorm → Dropout(0.5)
Dense(4, softmax)
```

### Output
- 4 classes with probability scores (0-1):
  - Glaucoma probability
  - Diabetic Retinopathy probability
  - Cataract probability
  - Normal probability

## Dataset Structure

Place your 700MB dataset in this structure:

```
datasets/
├── glaucoma/
│   ├── glaucoma_001.jpg
│   ├── glaucoma_002.jpg
│   └── ... (more glaucoma images)
├── diabetic_retinopathy/
│   ├── dr_001.jpg
│   ├── dr_002.jpg
│   └── ... (more DR images)
├── cataract/
│   ├── cataract_001.jpg
│   ├── cataract_002.jpg
│   └── ... (more cataract images)
└── normal/
    ├── normal_001.jpg
    ├── normal_002.jpg
    └── ... (more healthy eye images)
```

### Image Requirements
- **Format**: JPG, JPEG, or PNG
- **Minimum Size**: 224x224 pixels
- **Recommended**: 512x512 or higher
- **Quality**: Clear fundus or slit-lamp images
- **Balance**: Try to have similar numbers of images per class

## Training Your Model

### Prerequisites
```bash
pip install tensorflow tensorflowjs numpy pillow matplotlib
```

### Training Script
Use the provided Python script in `utils/training-python-guide.ts` to:
1. Load and augment your dataset
2. Train the CNN model
3. Convert to TensorFlow.js format
4. Save for deployment

### Training Process
1. **Data Augmentation**: Rotation, flipping, zoom, shift
2. **Validation Split**: 80% training, 20% validation
3. **Epochs**: 50 (with early stopping)
4. **Optimizer**: Adam (lr=0.0001)
5. **Loss**: Categorical Crossentropy
6. **Metrics**: Accuracy, AUC

### Expected Performance
- **Training Accuracy**: >90%
- **Validation Accuracy**: >85%
- **AUC Score**: >0.90

## Model Deployment

### For Mobile (iOS/Android)
1. Train model and get `model.json` + weight files
2. Connect device to computer
3. Copy model files to:
   ```
   <App Documents>/models/eye_disease_cnn/
   ├── model.json
   ├── group1-shard1of*.bin
   └── ... (weight files)
   ```

### For Web
1. Place model files in `public/models/eye_disease_cnn/`
2. Ensure files are accessible via HTTP

### Model Location
The app automatically checks:
- **Mobile**: `{documentDirectory}/models/eye_disease_cnn/model.json`
- **Web**: `models/eye_disease_cnn/model.json`

## Using the App

### Detection Flow
1. **Select Disease Type**: Choose what to detect
2. **Capture Image**: Take photo or upload from gallery
3. **CNN Analysis**: Model processes image
4. **View Results**: See confidence scores for all 4 classes

### Offline Functionality
✅ **Fully Offline** - Once model is loaded:
- No internet required
- All inference on-device
- Fast predictions (~1-2 seconds)
- Complete privacy (data never leaves device)

### Training Mode
Upload images to improve accuracy:
1. Go to Training section
2. Select disease category
3. Upload validated images
4. Images are saved for future model retraining

## Model Files

### Required Files
- `model.json` - Model architecture and metadata
- `group1-shard*.bin` - Model weights (multiple files)

### File Sizes
- model.json: ~50-100KB
- Weight files: ~10-50MB total
- Total model size: ~20-60MB

## Technical Details

### TensorFlow.js
- **Backend**: WebGL (web), CPU (mobile fallback)
- **Inference Time**: 1-2 seconds
- **Memory Usage**: ~200MB during inference

### Image Preprocessing
1. Read image from URI
2. Convert to base64 (mobile) or blob (web)
3. Decode to pixel array
4. Resize to 224x224
5. Normalize (divide by 255)
6. Add batch dimension (1, 224, 224, 3)

### Prediction Process
1. Load model (one-time, cached)
2. Preprocess image
3. Run inference
4. Extract probabilities
5. Determine predicted class (argmax)
6. Return all 4 probabilities

## Improving Accuracy

### More Training Data
- Collect more images per class
- Ensure data quality
- Balance classes evenly

### Data Augmentation
- Rotation, flips, zooms
- Brightness/contrast adjustments
- Gaussian noise

### Transfer Learning
Consider using pre-trained models:
- MobileNetV2
- EfficientNet
- ResNet50

### Hyperparameter Tuning
- Adjust learning rate
- Increase/decrease model complexity
- Modify dropout rates
- Change batch size

## Troubleshooting

### Model Not Loading
- ✅ Check file paths are correct
- ✅ Ensure model.json and weights exist
- ✅ Verify file permissions
- ✅ Check console logs for errors

### Low Accuracy
- ✅ Increase dataset size
- ✅ Add more augmentation
- ✅ Train for more epochs
- ✅ Use transfer learning

### Slow Inference
- ✅ Reduce image size (224x224 is optimal)
- ✅ Use WebGL backend (web)
- ✅ Ensure GPU acceleration enabled

### Memory Issues
- ✅ Dispose tensors after use
- ✅ Reduce batch size
- ✅ Use smaller model architecture

## Future Enhancements

### Planned Features
- [ ] Model quantization for smaller size
- [ ] Ensemble predictions (multiple models)
- [ ] Attention maps visualization
- [ ] Confidence thresholding
- [ ] Multi-disease detection in single image

### Advanced Training
- [ ] K-fold cross-validation
- [ ] Class weighting for imbalanced data
- [ ] Learning rate scheduling
- [ ] Model pruning

## Support

For issues or questions:
1. Check console logs in app
2. Verify model files exist
3. Ensure dataset is properly formatted
4. Review training script output

## License

This CNN implementation is for educational and research purposes.
Consult medical professionals for actual diagnosis.

---

**Remember**: This app is a screening tool, not a diagnostic device.
Always consult qualified healthcare professionals for medical decisions.
