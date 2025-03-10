"use client";

import { Achievement } from "../types";
import { AchievementCard } from "./AchievementCard";

type AchievementsSectionProps = {
  achievements: Achievement[];
};

export function AchievementsSection({ achievements }: AchievementsSectionProps) {
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Achievements</h2>
      
      {unlockedAchievements.length > 0 && (
        <>
          <h3 className="text-lg font-medium mb-3">Unlocked ({unlockedAchievements.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {unlockedAchievements.map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </div>
        </>
      )}
      
      {lockedAchievements.length > 0 && (
        <>
          <h3 className="text-lg font-medium mb-3">Locked ({lockedAchievements.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedAchievements.map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
