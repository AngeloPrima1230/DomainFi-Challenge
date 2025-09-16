'use client';

import { useTheme } from '../contexts/ThemeContext';

export default function PrivacyPage() {
  const { getThemeClasses } = useTheme();

  return (
    <div className={`min-h-screen ${getThemeClasses('background')}`}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-12">
        <div className={`${getThemeClasses('card')} rounded-xl p-8`}>
          <h1 className={`text-4xl font-bold ${getThemeClasses('text.primary')} mb-8`}>
            Privacy Policy
          </h1>
          
          <div className={`space-y-6 ${getThemeClasses('text.secondary')}`}>
            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                Information We Collect
              </h2>
              <p className="leading-relaxed">
                We collect information you provide directly to us, such as when you create an account, 
                use our services, or contact us for support. This may include your wallet address, 
                email address, and any other information you choose to provide.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                How We Use Your Information
              </h2>
              <p className="leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, 
                process transactions, communicate with you, and ensure the security of our platform.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                Information Sharing
              </h2>
              <p className="leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this privacy policy or as required by law.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                Data Security
              </h2>
              <p className="leading-relaxed">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                Contact Us
              </h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at 
                <a href="mailto:privacy@taghaus.com" className={`${getThemeClasses('text.accent')} hover:underline`}>
                  privacy@taghaus.com
                </a>
              </p>
            </section>

            <div className={`pt-6 border-t ${getThemeClasses('text.muted')}/20`}>
              <p className={`text-sm ${getThemeClasses('text.muted')}`}>
                Last updated: September 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}