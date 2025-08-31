import { track } from '@vercel/analytics';

// Custom analytics tracking functions
export const trackEvent = (eventName, properties = {}) => {
  try {
    track(eventName, properties);
    console.log(`Analytics event tracked: ${eventName}`, properties);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Predefined event tracking functions
export const trackPageView = (pageName) => {
  trackEvent('page_view', { page: pageName });
};

export const trackUserAction = (action, details = {}) => {
  trackEvent('user_action', { action, ...details });
};

export const trackFormSubmission = (formName, success = true) => {
  trackEvent('form_submission', { form: formName, success });
};

export const trackError = (errorType, errorMessage, context = {}) => {
  trackEvent('error', { type: errorType, message: errorMessage, ...context });
};

export const trackLogin = (method = 'email') => {
  trackEvent('login', { method });
};

export const trackSignup = (method = 'email') => {
  trackEvent('signup', { method });
};

export const trackFeatureUsage = (feature, details = {}) => {
  trackEvent('feature_usage', { feature, ...details });
};

// Export the track function for direct use
export { track };
