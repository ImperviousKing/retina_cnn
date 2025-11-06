import { DiseaseType } from './disease';

export interface DetectionRecord {
  id: string;
  primaryDisease: DiseaseType;
  detections: {
    disease: DiseaseType;
    confidence: number;
    percentage: number;
  }[];
  imageUri: string;
  timestamp: string;
  details: string;
  synced: boolean;
}

export interface TrainingImageRecord {
  id: string;
  disease: DiseaseType;
  imageUri: string;
  uploadedAt: string;
  validated: boolean;
  validationReason?: string;
  synced: boolean;
}

export interface ModelStats {
  disease: DiseaseType;
  totalTrainingImages: number;
  accuracy: number;
  lastUpdated: string;
}

export interface SyncStatus {
  lastSyncTime: string;
  pendingDetections: number;
  pendingTrainingImages: number;
  syncInProgress: boolean;
}
