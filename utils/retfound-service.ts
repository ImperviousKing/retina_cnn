import { RETFOUND_API } from '@/constants/api-config';
import { DiseaseType } from '@/types/disease';

export interface RETFoundPrediction {
  probabilities: {
    glaucoma: number;
    retinopathy: number;
    cataract: number;
    normal: number;
  };
  predicted_class: DiseaseType | 'normal';
  confidence: number;
  model: string;
  medical_grade: boolean;
}

export async function checkRETFoundAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `${RETFOUND_API.baseUrl}${RETFOUND_API.endpoints.health}`,
      { signal: controller.signal }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    console.log('[RETFound] Health check:', data);
    return data.status === 'healthy';
  } catch (error) {
    console.log('[RETFound] Service unavailable:', error);
    return false;
  }
}

export async function analyzeWithRETFound(
  imageUri: string
): Promise<RETFoundPrediction> {
  try {
    console.log('[RETFound] Preparing image for analysis...');
    
    let base64Image = imageUri;
    if (!imageUri.startsWith('data:image')) {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    console.log('[RETFound] Sending request to API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RETFOUND_API.timeout);
    
    const response = await fetch(
      `${RETFOUND_API.baseUrl}${RETFOUND_API.endpoints.analyze}`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    console.log('[RETFound] Analysis complete');
    console.log('[RETFound] Predicted class:', result.predicted_class);
    console.log('[RETFound] Confidence:', result.confidence);
    
    return result;
  } catch (error) {
    console.error('[RETFound] Analysis failed:', error);
    throw error;
  }
}
