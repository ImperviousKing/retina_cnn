"""
RETFound_MAE Setup and Fine-tuning Script
For RETINA Eye Disease Detection App

This script helps you:
1. Set up the RETFound environment
2. Load pre-trained weights
3. Fine-tune on your 700MB dataset
4. Export model for API deployment

Usage:
    python retfound_setup.py --mode setup        # Initial setup
    python retfound_setup.py --mode train        # Train model
    python retfound_setup.py --mode test         # Test model
"""

import os
import sys
import argparse
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, transforms
import timm
from tqdm import tqdm
import json
from pathlib import Path

DATASET_PATH = Path('../datasets')
MODEL_SAVE_PATH = Path('../models/retfound')
RETFOUND_WEIGHTS = MODEL_SAVE_PATH / 'RETFound_cfp_weights.pth'

CLASS_NAMES = ['glaucoma', 'retinopathy', 'cataract', 'normal']

def setup_directories():
    """Create necessary directories"""
    print("📁 Setting up directories...")
    MODEL_SAVE_PATH.mkdir(parents=True, exist_ok=True)
    print(f"✅ Created: {MODEL_SAVE_PATH}")
    
    if not DATASET_PATH.exists():
        print(f"⚠️  Dataset directory not found: {DATASET_PATH}")
        print("Please place your dataset in the following structure:")
        print(f"{DATASET_PATH}/")
        print("  ├── glaucoma/")
        print("  ├── retinopathy/ (or diabetic_retinopathy/)")
        print("  ├── cataract/")
        print("  └── normal/")
        return False
    return True

def check_retfound_weights():
    """Check if RETFound pre-trained weights exist"""
    if not RETFOUND_WEIGHTS.exists():
        print("⚠️  RETFound weights not found!")
        print(f"Expected location: {RETFOUND_WEIGHTS}")
        print("\nTo download RETFound weights:")
        print("1. Visit: https://github.com/openmedlab/RETFound_MAE")
        print("2. Download RETFound_cfp_weights.pth")
        print(f"3. Place it in: {MODEL_SAVE_PATH}")
        return False
    print(f"✅ Found RETFound weights: {RETFOUND_WEIGHTS}")
    return True

def get_data_transforms():
    """Get data augmentation transforms"""
    train_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.RandomCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    return train_transform, val_transform

def load_retfound_model(num_classes=4):
    """Load RETFound base model with pre-trained weights"""
    print("🏗️  Loading RETFound architecture...")
    
    model = timm.create_model('vit_base_patch16_224', pretrained=False)
    
    print("📥 Loading RETFound pre-trained weights...")
    checkpoint = torch.load(RETFOUND_WEIGHTS, map_location='cpu')
    
    if 'model' in checkpoint:
        state_dict = checkpoint['model']
    else:
        state_dict = checkpoint
    
    msg = model.load_state_dict(state_dict, strict=False)
    print(f"✅ Loaded weights. Missing keys: {len(msg.missing_keys)}, Unexpected: {len(msg.unexpected_keys)}")
    
    model.head = nn.Linear(model.head.in_features, num_classes)
    print(f"✅ Modified classification head for {num_classes} classes")
    
    return model

def fine_tune_retfound(
    epochs=20,
    batch_size=32,
    learning_rate=1e-4,
    device='cuda' if torch.cuda.is_available() else 'cpu'
):
    """Fine-tune RETFound on your dataset"""
    
    print("🚀 Starting RETFound Fine-tuning")
    print(f"Device: {device}")
    print(f"Epochs: {epochs}")
    print(f"Batch Size: {batch_size}")
    print(f"Learning Rate: {learning_rate}")
    print("-" * 50)
    
    train_transform, val_transform = get_data_transforms()
    
    print("📚 Loading dataset...")
    full_dataset = datasets.ImageFolder(str(DATASET_PATH), transform=train_transform)
    
    print(f"✅ Total images: {len(full_dataset)}")
    print(f"Classes: {full_dataset.classes}")
    
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_dataset, val_dataset = random_split(full_dataset, [train_size, val_size])
    
    val_dataset.dataset.transform = val_transform
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False, num_workers=4)
    
    print(f"📊 Training samples: {len(train_dataset)}")
    print(f"📊 Validation samples: {len(val_dataset)}")
    
    model = load_retfound_model(num_classes=len(CLASS_NAMES))
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=learning_rate)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    best_val_acc = 0.0
    history = {
        'train_loss': [],
        'train_acc': [],
        'val_loss': [],
        'val_acc': []
    }
    
    for epoch in range(epochs):
        print(f"\n📈 Epoch {epoch+1}/{epochs}")
        
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0
        
        pbar = tqdm(train_loader, desc="Training")
        for images, labels in pbar:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            _, predicted = outputs.max(1)
            train_total += labels.size(0)
            train_correct += predicted.eq(labels).sum().item()
            
            pbar.set_postfix({
                'loss': f"{train_loss/len(pbar):.4f}",
                'acc': f"{100.*train_correct/train_total:.2f}%"
            })
        
        train_acc = 100. * train_correct / train_total
        avg_train_loss = train_loss / len(train_loader)
        
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            pbar = tqdm(val_loader, desc="Validation")
            for images, labels in pbar:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item()
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()
        
        val_acc = 100. * val_correct / val_total
        avg_val_loss = val_loss / len(val_loader)
        
        history['train_loss'].append(avg_train_loss)
        history['train_acc'].append(train_acc)
        history['val_loss'].append(avg_val_loss)
        history['val_acc'].append(val_acc)
        
        print(f"Train Loss: {avg_train_loss:.4f}, Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {avg_val_loss:.4f}, Val Acc: {val_acc:.2f}%")
        
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            save_path = MODEL_SAVE_PATH / 'retfound_finetuned_best.pth'
            torch.save({
                'epoch': epoch,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'val_acc': val_acc,
                'class_names': CLASS_NAMES,
            }, save_path)
            print(f"💾 Saved best model: {save_path} (Val Acc: {val_acc:.2f}%)")
        
        scheduler.step()
    
    final_save_path = MODEL_SAVE_PATH / 'retfound_finetuned.pth'
    torch.save({
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'class_names': CLASS_NAMES,
        'history': history,
    }, final_save_path)
    print(f"\n✅ Training complete!")
    print(f"💾 Final model saved: {final_save_path}")
    print(f"🏆 Best validation accuracy: {best_val_acc:.2f}%")
    
    with open(MODEL_SAVE_PATH / 'training_history.json', 'w') as f:
        json.dump(history, f, indent=2)
    
    return model, history

def test_model():
    """Test the fine-tuned model"""
    print("🧪 Testing RETFound model...")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    model = load_retfound_model(num_classes=len(CLASS_NAMES))
    
    checkpoint_path = MODEL_SAVE_PATH / 'retfound_finetuned_best.pth'
    if not checkpoint_path.exists():
        checkpoint_path = MODEL_SAVE_PATH / 'retfound_finetuned.pth'
    
    if not checkpoint_path.exists():
        print(f"❌ No trained model found at {checkpoint_path}")
        return
    
    checkpoint = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    model = model.to(device)
    model.eval()
    
    print(f"✅ Loaded model from: {checkpoint_path}")
    
    _, val_transform = get_data_transforms()
    test_dataset = datasets.ImageFolder(str(DATASET_PATH), transform=val_transform)
    test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
    
    correct = 0
    total = 0
    class_correct = {i: 0 for i in range(len(CLASS_NAMES))}
    class_total = {i: 0 for i in range(len(CLASS_NAMES))}
    
    with torch.no_grad():
        for images, labels in tqdm(test_loader, desc="Testing"):
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, predicted = outputs.max(1)
            
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
            for i in range(labels.size(0)):
                label = labels[i].item()
                class_total[label] += 1
                if predicted[i] == labels[i]:
                    class_correct[label] += 1
    
    overall_acc = 100. * correct / total
    print(f"\n🎯 Overall Accuracy: {overall_acc:.2f}%")
    print("\nPer-class Accuracy:")
    for i, class_name in enumerate(CLASS_NAMES):
        if class_total[i] > 0:
            class_acc = 100. * class_correct[i] / class_total[i]
            print(f"  {class_name}: {class_acc:.2f}% ({class_correct[i]}/{class_total[i]})")

def main():
    parser = argparse.ArgumentParser(description='RETFound Setup and Training')
    parser.add_argument('--mode', choices=['setup', 'train', 'test'], required=True,
                        help='Operation mode')
    parser.add_argument('--epochs', type=int, default=20, help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size')
    parser.add_argument('--lr', type=float, default=1e-4, help='Learning rate')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🏥 RETINA: RETFound Integration")
    print("=" * 60)
    
    if args.mode == 'setup':
        print("\n🔧 Setup Mode")
        if setup_directories():
            if check_retfound_weights():
                print("\n✅ Setup complete! Ready for training.")
                print("\nNext step:")
                print("  python retfound_setup.py --mode train")
            else:
                print("\n⚠️  Please download RETFound weights first.")
        else:
            print("\n⚠️  Please prepare your dataset first.")
    
    elif args.mode == 'train':
        print("\n🏋️  Training Mode")
        if not setup_directories():
            print("❌ Setup failed. Run setup mode first.")
            return
        if not check_retfound_weights():
            print("❌ RETFound weights not found.")
            return
        
        fine_tune_retfound(
            epochs=args.epochs,
            batch_size=args.batch_size,
            learning_rate=args.lr
        )
    
    elif args.mode == 'test':
        print("\n🧪 Test Mode")
        test_model()

if __name__ == '__main__':
    main()
