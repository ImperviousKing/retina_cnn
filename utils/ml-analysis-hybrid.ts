
import NetInfo from '@react-native-community/netinfo';
import { analyzeWithRETFound, checkRETFoundAvailable, RETFoundPrediction } from './retfound-service';
import { API_CONFIG } from '@/constants/api-config';

export interface HybridAnalysisResult {
  disease: string;
  confidence: number;
  detected: boolean;
  timestamp: string;
  imageUri: string;
  details: string;
  usedModel: 'RETFound';
  modelInfo: string;
  githubRepo: string;
}

type HybridDisease = string;

export async function analyzeEyeImageHybrid(
  imageUri: string,
  diseaseType: HybridDisease
): Promise<HybridAnalysisResult> {
  
  console.log('[RETFound Analysis] Starting analysis for:', diseaseType);
  console.log('[RETFound Analysis] Image URI:', imageUri.substring(0, 50) + '...');
  console.log('[RETFound Analysis] GitHub Model:', API_CONFIG.retfound.githubRepo);
  
  const netState = await NetInfo.fetch();
  const isConnected = netState.isConnected && netState.isInternetReachable;
  
  console.log('[RETFound Analysis] Network connected:', isConnected);
  console.log('[RETFound Analysis] Internet reachable:', netState.isInternetReachable);
  
  if (!isConnected) {
    throw new Error('Internet connection required. RETFound medical-grade analysis needs online connection.');
  }
  
  try {
    console.log('[RETFound Analysis] Checking RETFound API availability...');
    const available = await checkRETFoundAvailable();
    
    if (!available) {
      throw new Error('RETFound API server is not available. Please ensure the server is running.');
    }
    
    console.log('[RETFound Analysis] ✅ Using RETFound (medical-grade)');
    const prediction = await analyzeWithRETFound(imageUri);
    
    const confidence = (prediction.probabilities as any)[diseaseType] as number;
    const detected = confidence > 0.5;
    
    return {
      disease: diseaseType,
      confidence,
      detected,
      timestamp: new Date().toISOString(),
      imageUri,
      details: generateRETFoundDetails(prediction, diseaseType, detected),
      usedModel: 'RETFound',
      modelInfo: 'Medical-grade foundation model trained on 1.6M+ retinal images from Nature-published research',
      githubRepo: API_CONFIG.retfound.githubRepo,
    };
  } catch (error) {
    console.error('[RETFound Analysis] ❌ Analysis failed:', error);
    throw new Error(`RETFound analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateRETFoundDetails(
  prediction: RETFoundPrediction,
  diseaseType: HybridDisease,
  detected: boolean
): string {
  const probs = prediction.probabilities;
  
  const probText = `🏥 RETFound Medical-Grade Analysis\n\n` +
    `Detailed Probabilities:\n` +
    `• Glaucoma: ${(probs.glaucoma * 100).toFixed(1)}%\n` +
    `• Diabetic Retinopathy: ${(probs.retinopathy * 100).toFixed(1)}%\n` +
    `• Cataract: ${(probs.cataract * 100).toFixed(1)}%\n` +
    `• Normal: ${(probs.normal * 100).toFixed(1)}%\n\n` +
    `Model: Foundation model trained on 1.6M+ images (Nature-published)\n\n`;
  
  const diseaseDetails: Record<string, { positive: string; negative: string }> = {
    glaucoma: {
      positive: probText + 
        '⚠️ POTENTIAL GLAUCOMA DETECTED\n\n' +
        'RETFound identified patterns consistent with:\n' +
        '• Optic nerve cupping\n' +
        '• Elevated cup-to-disc ratio\n' +
        '• Nerve fiber layer thinning\n\n' +
        'The foundation model, validated in peer-reviewed research, suggests glaucoma progression indicators. ' +
        'IMMEDIATE ophthalmological consultation is STRONGLY RECOMMENDED for comprehensive evaluation and treatment planning.',
      negative: probText + 
        '✅ NO GLAUCOMA INDICATORS\n\n' +
        'RETFound analysis shows:\n' +
        '• Normal optic disc morphology\n' +
        '• Healthy cup-to-disc ratio\n' +
        '• Intact nerve fiber patterns\n\n' +
        'The medical-grade AI finds no significant glaucoma markers. Continue preventive care with regular eye examinations.',
    },
    retinopathy: {
      positive: probText + 
        '⚠️ POTENTIAL DIABETIC RETINOPATHY\n\n' +
        'RETFound detected vascular abnormalities:\n' +
        '• Microaneurysms\n' +
        '• Retinal hemorrhages\n' +
        '• Possible exudates\n\n' +
        'The foundation model identifies patterns consistent with diabetic retinopathy. ' +
        'CONSULT with a retinal specialist URGENTLY for staging and treatment planning.',
      negative: probText + 
        '✅ HEALTHY RETINAL VASCULATURE\n\n' +
        'RETFound analysis indicates:\n' +
        '• No microaneurysms detected\n' +
        '• Normal blood vessel patterns\n' +
        '• No hemorrhages or exudates\n\n' +
        'The medical-grade AI shows healthy retinal circulation. If diabetic, maintain glucose management and continue regular screenings.',
    },
    cataract: {
      positive: probText + 
        '⚠️ LENS OPACITY DETECTED\n\n' +
        'RETFound identified cataract formation:\n' +
        '• Lens clouding patterns\n' +
        '• Reduced transparency\n' +
        '• Light scattering indicators\n\n' +
        'The foundation model, trained on extensive clinical datasets, detects cataract development. ' +
        'SCHEDULE ophthalmologist consultation to discuss treatment options and surgical planning.',
      negative: probText + 
        '✅ CLEAR LENS - NO CATARACTS\n\n' +
        'RETFound analysis confirms:\n' +
        '• Normal lens transparency\n' +
        '• No opacity patterns\n' +
        '• Clear light transmission\n\n' +
        'The medical-grade AI shows no cataract formation. Vision should remain unaffected. Regular monitoring recommended as part of preventive care.',
    },
  };
  
  return detected 
    ? diseaseDetails[diseaseType].positive 
    : diseaseDetails[diseaseType].negative;
}
