import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

const WEBHOOK_URL = 'https://rcarrillocz.app.n8n.cloud/webhook-test/feb3be7f-79b2-454d-8c06-c704f69efbd0';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface TradeWebhookPayload {
  hsCode: string;
  hsCodeDescription: string;
  tradeType: 'Import' | 'Export';
  timestamp: string;
  requestId: string;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getHSCodeDescription(hsCode: string): Promise<string> {
  const { data, error } = await supabase
    .from('hs_codes')
    .select('hs_code_description')
    .eq('id', hsCode)
    .single();

  if (error) {
    console.error('Error fetching HS code description:', error);
    return 'Description not available';
  }

  return data?.hs_code_description || 'Description not available';
}

async function makeRequest(payload: TradeWebhookPayload, attempt: number = 1): Promise<any> {
  try {
    const response = await axios.post(WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000, // 10 second timeout
    });

    if (response.status !== 200) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response.data;
  } catch (error: any) {
    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAY * attempt); // Exponential backoff
      return makeRequest(payload, attempt + 1);
    }

    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please try again.');
      }
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your internet connection.');
      }
      if (error.response?.status === 400) {
        throw new Error('Invalid request: Please check HTS code format and trade type');
      } else if (error.response?.status === 401) {
        throw new Error('Unauthorized: Authentication failed');
      } else if (error.response?.status === 500) {
        throw new Error('Server error: Failed to process trade data');
      }
    }
    throw new Error('Failed to process trade data: ' + (error.message || 'Unknown error'));
  }
}

export async function processTradeData(hsCode: string, tradeType: 'Import' | 'Export'): Promise<void> {
  // Strict validation for single 10-digit HTS code
  if (typeof hsCode !== 'string' || !/^\d{10}$/.test(hsCode.trim())) {
    throw new Error('Invalid HTS code format. Must be exactly 10 digits.');
  }

  // Validate trade type
  if (tradeType !== 'Import' && tradeType !== 'Export') {
    throw new Error('Invalid trade type. Must be "Import" or "Export".');
  }

  // Get the HS code description
  const hsCodeDescription = await getHSCodeDescription(hsCode.trim());

  // Create webhook payload with single HTS code and description
  const payload: TradeWebhookPayload = {
    hsCode: hsCode.trim(),
    hsCodeDescription,
    tradeType,
    timestamp: new Date().toISOString(),
    requestId: uuidv4()
  };

  return makeRequest(payload);
}