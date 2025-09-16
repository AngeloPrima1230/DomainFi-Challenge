'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Declare grecaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function ContactPage() {
  const { getThemeClasses } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; reset: number } | null>(null);
  const [recaptchaStatus, setRecaptchaStatus] = useState<'idle' | 'testing' | 'working' | 'error'>('idle');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  // Load reCAPTCHA script
  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    
    // Check if site key is available
    if (!siteKey) {
      console.warn('reCAPTCHA site key not found. reCAPTCHA will be disabled.');
      setRecaptchaStatus('error');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.grecaptcha) {
        setRecaptchaStatus('testing');
        // Test reCAPTCHA
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(siteKey, { action: 'test' })
            .then(() => {
              setRecaptchaStatus('working');
              console.log('reCAPTCHA is working!');
            })
            .catch((error: any) => {
              setRecaptchaStatus('error');
              console.error('reCAPTCHA test failed:', error);
            });
        });
      }
    };

    script.onerror = () => {
      setRecaptchaStatus('error');
      console.error('Failed to load reCAPTCHA script');
    };

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (formData.message.trim().length < 10) {
      setToast({
        type: 'error',
        title: 'Message Too Short',
        message: 'Please enter at least 10 characters in your message.'
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Get reCAPTCHA token
      const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
      let recaptchaToken = '';

      if (siteKey && window.grecaptcha) {
        try {
          recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'contact_form' });
        } catch (error) {
          console.warn('reCAPTCHA execution failed, proceeding without verification:', error);
          // Continue without reCAPTCHA token for development
        }
      } else {
        console.warn('reCAPTCHA not available, proceeding without verification');
        // Continue without reCAPTCHA token for development
      }

      const requestBody = {
        ...formData,
        recaptchaToken
      };
      
      console.log('Sending form data:', requestBody);
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      setToast({
        type: 'success',
        title: 'Message received!',
        message: 'We\'ve received your message and will get back to you soon.'
      });

      // Update rate limit info
      if (data.rateLimit) {
        setRateLimitInfo(data.rateLimit);
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        message: ''
      });

    } catch (error: any) {
      console.error('Contact form error:', error);
      
      let errorMessage = 'Failed to send message. Please try again.';
      let errorTitle = 'Error';

      if (error.message.includes('Rate limit')) {
        errorTitle = 'Rate Limit Exceeded';
        errorMessage = 'You\'ve sent too many messages. Please wait a moment before trying again.';
      } else if (error.message.includes('reCAPTCHA')) {
        errorTitle = 'Verification Failed';
        errorMessage = 'reCAPTCHA verification failed. Please try again.';
      }

      setToast({
        type: 'error',
        title: errorTitle,
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${getThemeClasses('background')} flex items-center justify-center py-16 px-4 pt-32`}>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-stretch justify-center min-h-[70vh]">
        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-center mb-8 md:mb-0 md:pr-8 items-center md:items-start text-center md:text-left">
          <div className="mb-6 flex flex-col items-center md:items-start gap-6 w-full">
            <img src="/logo.svg" alt="TagHaus Logo" className="h-12 md:h-16 w-auto mx-auto md:mx-0" />
            <div className="w-full">
              <p className={`uppercase tracking-widest text-xs ${getThemeClasses('text.secondary')} font-semibold mb-2`}>
                We're here to help you
              </p>
              <h1 className={`text-3xl md:text-4xl font-black ${getThemeClasses('text.primary')} mb-4 leading-tight`}>
                Say Hi! <span className="text-blue-600 dark:text-blue-400">and tell us about your ideas.</span>
              </h1>
              <p className={`${getThemeClasses('text.secondary')} mb-6`}>
                Help us improve TagHaus! Share your feedback, suggest new features, or report issues to make our domain marketplace even better.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4 text-base items-center md:items-start">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className={`font-medium ${getThemeClasses('text.primary')}`}>contact@worldofunreal.com</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <a href="https://x.com/tag_haus" target="_blank" rel="noopener" className={`${getThemeClasses('text.secondary')} hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xl`} aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://github.com/worldofunreal/taghaus" target="_blank" rel="noopener" className={`${getThemeClasses('text.secondary')} hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xl`} aria-label="GitHub">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://t.me/taghaus" target="_blank" rel="noopener" className={`${getThemeClasses('text.secondary')} hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-xl`} aria-label="Telegram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className={`${getThemeClasses('card')} rounded-2xl shadow-xl p-8 md:p-12 flex flex-col gap-8 border border-gray-200 dark:border-gray-700 w-full max-w-lg mx-auto`}>
            <div className="text-center md:text-left">
              <h2 className={`text-2xl md:text-3xl font-bold ${getThemeClasses('text.primary')} mb-2`}>Get in touch</h2>
              <p className={`${getThemeClasses('text.secondary')}`}>We'd love to hear from you!</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className={`block text-sm font-medium ${getThemeClasses('text.primary')} mb-2`}>
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${getThemeClasses('input')}`}
                    placeholder="Your name"
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${getThemeClasses('text.primary')} mb-2`}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${getThemeClasses('input')}`}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${getThemeClasses('text.primary')} mb-2`}>
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg ${getThemeClasses('input')}`}
                    placeholder="Your company"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${getThemeClasses('text.primary')} mb-2`}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg ${getThemeClasses('input')}`}
                    placeholder="Tell us about your inquiry... (minimum 10 characters)"
                    required
                    minLength={10}
                  />
                  {formData.message && formData.message.trim().length < 10 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      Message must be at least 10 characters long ({formData.message.trim().length}/10)
                    </p>
                  )}
                </div>
              </div>
              
              {/* Rate limit warning */}
              {rateLimitInfo && rateLimitInfo.remaining <= 1 && (
                <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span>
                      {rateLimitInfo.remaining === 0 
                        ? 'Rate limit reached. Please wait before sending another message.'
                        : `Rate limit: ${rateLimitInfo.remaining} request remaining`
                      }
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full ${getThemeClasses('button.primary')} py-3 rounded-lg font-medium mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Message
                  </>
                )}
              </button>
            </form>
            
            <div className={`text-center text-sm ${getThemeClasses('text.secondary')} mt-2`}>
              We'll get back to you within 5-7 business days.
            </div>
            
            {/* reCAPTCHA Status Indicator */}
            <div className="text-center mt-1">
              {recaptchaStatus === 'idle' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>reCAPTCHA Loading...</span>
                </div>
              )}
              {recaptchaStatus === 'testing' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-full text-xs">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span>Testing reCAPTCHA...</span>
                </div>
              )}
              {recaptchaStatus === 'working' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-xs">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>reCAPTCHA v3 Active</span>
                </div>
              )}
              {recaptchaStatus === 'error' && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>reCAPTCHA Error</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg ${
            toast.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {toast.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{toast.title}</h4>
                <p className="text-sm mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}