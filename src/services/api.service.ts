/**
 * àjó API Service Factory
 * Uses the real backend by default and can fall back to mock data when explicitly requested.
 */

import { realService } from './real.service';


export const apiService = realService;