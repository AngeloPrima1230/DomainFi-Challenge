'use client';

import { useTheme } from '../contexts/ThemeContext';

export default function TeamPage() {
  const { getThemeClasses } = useTheme();

  const teamMembers = [
    {
      name: "Bizkit",
      role: "Full Stack Developer",
      bio: "Experienced developer with expertise in both frontend and backend technologies. Passionate about building scalable Web3 applications and decentralized solutions.",
    },
    {
      name: "Joseph",
      role: "Project Manager",
      bio: "Strategic leader focused on project coordination and team management. Ensures smooth development processes and timely delivery of high-quality products.",
    },
    {
      name: "devAngel",
      role: "Frontend Developer",
      bio: "Creative frontend specialist dedicated to crafting beautiful and intuitive user interfaces. Committed to delivering exceptional user experiences in the Web3 space.",
    }
  ];

  return (
    <div className={`min-h-screen ${getThemeClasses('background')}`}>
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-12">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold ${getThemeClasses('text.primary')} mb-4`}>
            Our Team
          </h1>
          <p className={`text-xl ${getThemeClasses('text.secondary')} max-w-3xl mx-auto`}>
            Meet the passionate individuals building the future of decentralized domain ownership
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className={`${getThemeClasses('card')} rounded-xl p-6`}>
              <div className="flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-full ${getThemeClasses('button.secondary')} flex items-center justify-center mb-4`}>
                  <span className={`text-2xl font-bold ${getThemeClasses('text.primary')}`}>
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className={`text-xl font-semibold ${getThemeClasses('text.primary')} mb-2`}>
                  {member.name}
                </h3>
                <p className={`text-sm font-medium ${getThemeClasses('text.accent')} mb-3`}>
                  {member.role}
                </p>
                <p className={`text-sm ${getThemeClasses('text.secondary')} leading-relaxed`}>
                  {member.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}