'use client';

import { useTheme } from '../contexts/ThemeContext';

export default function TermsPage() {
  const { getThemeClasses } = useTheme();

  return (
    <div className={`min-h-screen ${getThemeClasses('background')}`}>
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-12">
        <div className={`${getThemeClasses('card')} rounded-xl p-8`}>
          <h1 className={`text-4xl font-bold ${getThemeClasses('text.primary')} mb-8`}>
            Terms & Conditions
          </h1>
          
          <div className={`space-y-6 ${getThemeClasses('text.secondary')}`}>
            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                Acceptance of Terms
              </h2>
              <p className="leading-relaxed">
                By accessing and using TAGHAUS, you accept and agree to be bound by the terms and 
                provision of this agreement. If you do not agree to abide by the above, please do not 
                use this service.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                Use License
              </h2>
              <p className="leading-relaxed">
                Permission is granted to temporarily download one copy of TAGHAUS for personal, 
                non-commercial transitory viewing only. This is the grant of a license, not a transfer 
                of title, and under this license you may not modify or copy the materials.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                Disclaimer
              </h2>
              <p className="leading-relaxed">
                The materials on TAGHAUS are provided on an 'as is' basis. TAGHAUS makes no warranties, 
                expressed or implied, and hereby disclaims and negates all other warranties including 
                without limitation, implied warranties or conditions of merchantability, fitness for a 
                particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                Limitations
              </h2>
              <p className="leading-relaxed">
                In no event shall TAGHAUS or its suppliers be liable for any damages (including, without 
                limitation, damages for loss of data or profit, or due to business interruption) arising 
                out of the use or inability to use the materials on TAGHAUS, even if TAGHAUS or an authorized 
                representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className={`text-2xl font-semibold ${getThemeClasses('text.primary')} mb-4`}>
                Governing Law
              </h2>
              <p className="leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of 
                the United States and you irrevocably submit to the exclusive jurisdiction of the courts 
                in that state or location.
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