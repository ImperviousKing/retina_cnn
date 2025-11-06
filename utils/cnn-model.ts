import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { DiseaseType } from '@/types/disease';

const getModelPath = () => {
  if (Platform.OS === 'web') {
    return 'models/eye_disease_cnn/';
  }
  const docDir = (FileSystem as any).documentDirectory || '';
  return `${docDir}models/eye_disease_cnn/`;
};

const MODEL_FILE = 'model.json';

export interface CNNPrediction {
  disease: DiseaseType | 'normal';
  confidence: number;
  probabilities: {
    glaucoma: number;
    retinopathy: number;
    cataract: number;
    normal: number;
  };
}

let model: tf.LayersModel | null = null;
let isModelLoaded = false;

export async function initializeTensorFlow(): Promise<void> {
  try {
    console.log('[CNN] Initializing TensorFlow.js...');
    await tf.ready();
    console.log('[CNN] TensorFlow.js backend:', tf.getBackend());
    console.log('[CNN] TensorFlow.js initialized successfully');
  } catch (error) {
    console.error('[CNN] Failed to initialize TensorFlow:', error);
    throw error;
  }
}

export async function loadCNNModel(): Promise<boolean> {
  try {
    if (isModelLoaded && model) {
      console.log('[CNN] Model already loaded');
      return true;
    }

    const MODEL_PATH = getModelPath();
    console.log('[CNN] Loading CNN model from:', MODEL_PATH);
    
    const modelJsonPath = MODEL_PATH + MODEL_FILE;
    const modelExists = await FileSystem.getInfoAsync(modelJsonPath);
    
    if (!modelExists.exists) {
      console.warn('[CNN] Model not found at:', modelJsonPath);
      console.warn('[CNN] Please place your trained model files in:', MODEL_PATH);
      console.warn('[CNN] Required files: model.json, weights.bin (or group1-shard1of*.bin)');
      return false;
    }

    model = await tf.loadLayersModel(`file://${modelJsonPath}`);
    isModelLoaded = true;
    
    console.log('[CNN] Model loaded successfully');
    console.log('[CNN] Model input shape:', model.inputs[0].shape);
    console.log('[CNN] Model output shape:', model.outputs[0].shape);
    
    return true;
  } catch (error) {
    console.error('[CNN] Failed to load model:', error);
    return false;
  }
}

export async function preprocessImage(imageUri: string): Promise<tf.Tensor3D> {
  try {
    console.log('[CNN] Preprocessing image:', imageUri);
    
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64' as any,
    });
    
    const imageData = `data:image/jpeg;base64,${base64}`;
    
    const imageTensor = await new Promise<tf.Tensor3D>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const tensor = tf.browser.fromPixels(img);
          const resized = tf.image.resizeBilinear(tensor, [224, 224]) as tf.Tensor3D;
          const normalized = resized.div(255.0) as tf.Tensor3D;
          
          tensor.dispose();
          resized.dispose();
          
          resolve(normalized);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = imageData;
    });
    
    console.log('[CNN] Image preprocessed, shape:', imageTensor.shape);
    return imageTensor;
  } catch (error) {
    console.error('[CNN] Failed to preprocess image:', error);
    throw error;
  }
}

export async function predictDisease(imageUri: string): Promise<CNNPrediction> {
  try {
    console.log('[CNN] Starting disease prediction...');
    
    if (!isModelLoaded || !model) {
      console.warn('[CNN] Model not loaded, attempting to load...');
      const loaded = await loadCNNModel();
      if (!loaded) {
        throw new Error('CNN model not available. Please ensure the model is properly trained and placed in the models directory.');
      }
    }

    const preprocessedImage = await preprocessImage(imageUri);
    const batchedImage = preprocessedImage.expandDims(0);
    
    console.log('[CNN] Running inference...');
    const predictions = model!.predict(batchedImage) as tf.Tensor;
    const probabilitiesArray = await predictions.data();
    
    preprocessedImage.dispose();
    batchedImage.dispose();
    predictions.dispose();
    
    const probabilities = {
      glaucoma: probabilitiesArray[0],
      retinopathy: probabilitiesArray[1],
      cataract: probabilitiesArray[2],
      normal: probabilitiesArray[3],
    };
    
    console.log('[CNN] Prediction probabilities:', probabilities);
    
    const maxProb = Math.max(...Object.values(probabilities));
    let predictedClass: DiseaseType | 'normal' = 'normal';
    
    if (probabilities.glaucoma === maxProb) {
      predictedClass = 'glaucoma';
    } else if (probabilities.retinopathy === maxProb) {
      predictedClass = 'retinopathy';
    } else if (probabilities.cataract === maxProb) {
      predictedClass = 'cataract';
    }
    
    return {
      disease: predictedClass,
      confidence: maxProb,
      probabilities,
    };
  } catch (error) {
    console.error('[CNN] Prediction failed:', error);
    throw error;
  }
}

export async function checkModelExists(): Promise<boolean> {
  try {
    const MODEL_PATH = getModelPath();
    const modelJsonPath = MODEL_PATH + MODEL_FILE;
    const info = await FileSystem.getInfoAsync(modelJsonPath);
    return info.exists;
  } catch {
    return false;
  }
}

export async function getModelInfo(): Promise<{
  exists: boolean;
  path: string;
  inputShape: (number | null)[] | null;
  outputShape: (number | null)[] | null;
}> {
  const exists = await checkModelExists();
  const MODEL_PATH = getModelPath();
  
  return {
    exists,
    path: MODEL_PATH,
    inputShape: model?.inputs[0].shape ?? null,
    outputShape: model?.outputs[0].shape ?? null,
  };
}

export function disposeModel(): void {
  if (model) {
    console.log('[CNN] Disposing model...');
    model.dispose();
    model = null;
    isModelLoaded = false;
  }
}
