import { apiRequest } from './client';

import type {
  MarketAnalyticsResponse,
} from '../types/market';

export async function getMarketAnalytics(
  token: string,
): Promise<MarketAnalyticsResponse> {
  const response = await apiRequest<{
    success: boolean;
    data: MarketAnalyticsResponse;
  }>(
    '/api/market-analytics/',
    { token },
  );

  return response.data;
}
