'use client';

import { useTheme } from '../contexts/ThemeContext';
import { useRouter } from 'next/navigation';

export default function Footer() {
  const { getThemeClasses } = useTheme();
  const router = useRouter();

  const handleLinkClick = (path: string) => {
    router.push(path);
  };

  return (
    <footer className={`${getThemeClasses('background')} border-t border-slate-200/30`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/logo.svg" 
                  alt="TAGHAUS Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className={`text-xl font-bold ${getThemeClasses('text.primary')} tracking-tight`}>TAGHAUS</span>
              </div>
            </div>
            <p className={`${getThemeClasses('text.muted')} text-sm leading-relaxed`}>
              A decentralized domain marketplace for Web3 communities
            </p>
            <a 
              href="https://worldofunreal.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`${getThemeClasses('text.muted')} text-xs hover:${getThemeClasses('text.tertiary')} transition-colors`}
            >
              © 2025 World of Unreal LLC
            </a>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h3 className={`${getThemeClasses('text.primary')} font-semibold text-sm mb-3`}>Legal</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleLinkClick('/terms')}
                className={`block text-left ${getThemeClasses('text.muted')} hover:${getThemeClasses('text.primary')} transition-colors text-sm`}
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => handleLinkClick('/privacy')}
                className={`block text-left ${getThemeClasses('text.muted')} hover:${getThemeClasses('text.primary')} transition-colors text-sm`}
              >
                Privacy Policy
              </button>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h3 className={`${getThemeClasses('text.primary')} font-semibold text-sm mb-3`}>Company</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleLinkClick('/team')}
                className={`block text-left ${getThemeClasses('text.muted')} hover:${getThemeClasses('text.primary')} transition-colors text-sm`}
              >
                Team
              </button>
              <button
                onClick={() => handleLinkClick('/contact')}
                className={`block text-left ${getThemeClasses('text.muted')} hover:${getThemeClasses('text.primary')} transition-colors text-sm`}
              >
                Contact
              </button>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-3">
            <h3 className={`${getThemeClasses('text.primary')} font-semibold text-sm mb-3`}>Connect</h3>
            <div className="space-y-2">
              <a
                href="https://x.com/tag_haus"
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-left ${getThemeClasses('text.muted')} hover:${getThemeClasses('text.primary')} transition-colors text-sm`}
              >
                X
              </a>
              <a
                href="https://t.me/taghaus"
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-left ${getThemeClasses('text.muted')} hover:${getThemeClasses('text.primary')} transition-colors text-sm`}
              >
                Telegram
              </a>
              <a
                href="https://medium.com/@taghaus"
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-left ${getThemeClasses('text.muted')} hover:${getThemeClasses('text.primary')} transition-colors text-sm`}
              >
                Medium
              </a>
              <a
                href="https://github.com/worldofunreal/Taghaus"
                target="_blank"
                rel="noopener noreferrer"
                className={`block text-left ${getThemeClasses('text.muted')} hover:${getThemeClasses('text.primary')} transition-colors text-sm`}
              >
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className={`mt-8 pt-6 border-t border-slate-200/30`}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className={`${getThemeClasses('text.muted')} text-xs text-center md:text-left`}>
              <a 
                href="https://doma.xyz/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`${getThemeClasses('text.muted')} hover:${getThemeClasses('text.primary')} transition-colors`}
              >
                Powered by Doma Protocol
              </a>
              {' • '}Discover, Trade, Own Digital Domains
            </p>
            <div className="flex items-center space-x-4">
              <span className={`${getThemeClasses('text.muted')} text-xs`}>
                Built with ❤️ for Web3
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
