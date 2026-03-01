import { invokeEdgeFunction } from './aiGateway';

export interface GenerateTrackUnitRequest {
  track: 'daily_communication' | 'workplace_english' | 'travel_survival' | 'exam_boost';
  targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: string;
  itemCount?: number;
}

export interface ValidateContentRequest {
  jobId?: string;
  content: Record<string, unknown>;
}

export const generateTrackUnit = async (payload: GenerateTrackUnitRequest) => {
  return invokeEdgeFunction<{
    jobId?: string;
    track: Record<string, unknown>;
    unit: Record<string, unknown>;
    items: Array<Record<string, unknown>>;
    provider?: string;
  }>('ai-generate-track-unit', payload);
};

export const validateGeneratedContent = async (payload: ValidateContentRequest) => {
  return invokeEdgeFunction<{
    isValid: boolean;
    confidence: number;
    issues: Array<{ code: string; severity: string; message: string }>;
    provider?: string;
  }>('ai-validate-content', payload);
};
