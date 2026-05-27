// Base44 SDK client — used only for data (Cards, Expenses)
// Authentication is handled by our own custom AuthContext, NOT Base44
import { createClient } from '@base44/sdk';

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID,
  appBaseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL,
  // requiresAuth is false so Base44 never redirects to its own login page
  requiresAuth: false,
});
