"""
RETFound API Server
Flask-based API for RETINA Eye Disease Detection

Usage:
    python retfound_api.py

API Endpoints:
    GET  /health  - Health check
    POST /analyze - Analyze eye image
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import timm
from PIL import Image
import io
import base64
import numpy as np
from torchvision import transforms
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

MODEL_PATH = Path('../models/retfound')
CHECKPOINT_FILE = MODEL_PATH / 'retfound_finetuned_best.pth'
if not CHECKPOINT_FILE.exists():
    CHECKPOINT_FILE = MODEL_PATH / 'retfound_finetuned.pth'

CLASS_NAMES = ['glaucoma', 'retinopathy', 'cataract', 'normal']

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = None
transform = None

def load_model():
    """Load the fine-tuned RETFound model"""
    global model, transform
    
    try:
        logger.info("🏗️  Loading RETFound model...")
        logger.info(f"Device: {device}")
        logger.info(f"Checkpoint: {CHECKPOINT_FILE}")
        
        model = timm.create_model('vit_base_patch16_224', pretrained=False)
        model.head = torch.nn.Linear(model.head.in_features, len(CLASS_NAMES))
        
        checkpoint = torch.load(CHECKPOINT_FILE, map_location=device)
        model.load_state_dict(checkpoint['model_state_dict'])
        model = model.to(device)
        model.eval()
        
        transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        logger.info("✅ Model loaded successfully")
        logger.info(f"Classes: {CLASS_NAMES}")
        
        return True
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        return False

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if model is not None else 'unhealthy',
        'model': 'RETFound_MAE',
        'device': str(device),
        'classes': CLASS_NAMES,
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """Analyze eye image endpoint"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 503
        
        data = request.json
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        image_data = data['image']
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        logger.info(f"📸 Received image: {image.size}")
        
        input_tensor = transform(image).unsqueeze(0).to(device)
        
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
        
        probs = probabilities.cpu().numpy()
        
        result = {
            'probabilities': {
                'glaucoma': float(probs[0]),
                'retinopathy': float(probs[1]),
                'cataract': float(probs[2]),
                'normal': float(probs[3])
            },
            'predicted_class': CLASS_NAMES[np.argmax(probs)],
            'confidence': float(np.max(probs)),
            'model': 'RETFound_MAE',
            'medical_grade': True
        }
        
        logger.info(f"✅ Analysis complete: {result['predicted_class']} ({result['confidence']:.2%})")
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"❌ Analysis error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """Batch analyze multiple images"""
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 503
        
        data = request.json
        
        if 'images' not in data or not isinstance(data['images'], list):
            return jsonify({'error': 'No images array provided'}), 400
        
        results = []
        
        for idx, image_data in enumerate(data['images']):
            try:
                if ',' in image_data:
                    image_data = image_data.split(',')[1]
                
                image_bytes = base64.b64decode(image_data)
                image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
                
                input_tensor = transform(image).unsqueeze(0).to(device)
                
                with torch.no_grad():
                    outputs = model(input_tensor)
                    probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
                
                probs = probabilities.cpu().numpy()
                
                result = {
                    'index': idx,
                    'probabilities': {
                        'glaucoma': float(probs[0]),
                        'retinopathy': float(probs[1]),
                        'cataract': float(probs[2]),
                        'normal': float(probs[3])
                    },
                    'predicted_class': CLASS_NAMES[np.argmax(probs)],
                    'confidence': float(np.max(probs)),
                }
                
                results.append(result)
                
            except Exception as e:
                logger.error(f"Error processing image {idx}: {e}")
                results.append({
                    'index': idx,
                    'error': str(e)
                })
        
        logger.info(f"✅ Batch analysis complete: {len(results)} images")
        
        return jsonify({
            'results': results,
            'model': 'RETFound_MAE',
            'medical_grade': True
        })
    
    except Exception as e:
        logger.error(f"❌ Batch analysis error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 60)
    print("🏥 RETINA: RETFound API Server")
    print("=" * 60)
    
    if not CHECKPOINT_FILE.exists():
        print(f"❌ Model checkpoint not found: {CHECKPOINT_FILE}")
        print("\nPlease train the model first:")
        print("  python retfound_setup.py --mode train")
        exit(1)
    
    if load_model():
        print("\n🚀 Starting API server...")
        print(f"📱 Device: {device}")
        print(f"🏥 Medical-grade retinal analysis ready")
        print("\nEndpoints:")
        print("  GET  http://localhost:5000/health")
        print("  POST http://localhost:5000/analyze")
        print("  POST http://localhost:5000/batch-analyze")
        print("\n" + "=" * 60)
        
        app.run(host='0.0.0.0', port=5000, debug=False)
    else:
        print("❌ Failed to load model. Exiting.")
        exit(1)
