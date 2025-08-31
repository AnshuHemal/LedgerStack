import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackUserAction, trackFormSubmission, trackError, trackLogin, trackSignup, trackFeatureUsage } from '../utils/analytics.js';

export const useAnalytics = () => {
  const location = useLocation();

  // Automatically track page views
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  return {
    trackPageView,
    trackUserAction,
    trackFormSubmission,
    trackError,
    trackLogin,
    trackSignup,
    trackFeatureUsage,
  };
};

// Hook for tracking form submissions
export const useFormAnalytics = (formName) => {
  const { trackFormSubmission } = useAnalytics();

  const trackSuccess = () => {
    trackFormSubmission(formName, true);
  };

  const trackFailure = (error) => {
    trackFormSubmission(formName, false);
    trackError('form_error', error.message, { form: formName });
  };

  return { trackSuccess, trackFailure };
};

// Hook for tracking feature usage
export const useFeatureAnalytics = () => {
  const { trackFeatureUsage } = useAnalytics();

  const trackFeature = (feature, details = {}) => {
    trackFeatureUsage(feature, details);
  };

  return { trackFeature };
};
