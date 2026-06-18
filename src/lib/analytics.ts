/**
 * Analytics utility for Google Analytics 4 (GA4).
 * 
 * Set NEXT_PUBLIC_GA_MEASUREMENT_ID in your environment variables.
 * The GA script is loaded in layout.tsx only when this env var is present.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-7L9ZL7DF1M";

/** Track a custom event */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("event", eventName, params);
}

/** Track a page view (called automatically by GA4 but useful for SPA navigation) */
export function trackPageView(url: string) {
  if (typeof window === "undefined" || !window.gtag || !GA_ID) return;
  window.gtag("config", GA_ID, { page_path: url });
}

/** Track form submissions */
export function trackFormSubmit(formName: string) {
  trackEvent("form_submit", { form_name: formName });
}

/** Track user actions */
export function trackAction(action: string, category: string, label?: string) {
  trackEvent(action, { event_category: category, event_label: label ?? "" });
}

/** Track errors */
export function trackError(error: string, fatal = false) {
  trackEvent("exception", { description: error, fatal });
}

export { GA_ID };
