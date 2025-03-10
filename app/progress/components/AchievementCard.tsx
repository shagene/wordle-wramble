"use client";

import { Achievement } from "../types";

type AchievementCardProps = {
  achievement: Achievement;
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  return (
    <div 
      className={`p-4 rounded-lg shadow-md ${achievement.color} ${
        achievement.unlocked ? 'opacity-100' : 'opacity-50'
      } transition-all duration-300 hover:scale-105 flex flex-col h-full`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{achievement.icon}</span>
        <div>
          <h3 className="font-bold">{achievement.title}</h3>
          <p className="text-sm">{achievement.description}</p>
        </div>
      </div>
      <div className="mt-auto pt-3 text-right">
        {achievement.unlocked ? (
          <span className="text-sm font-medium">Unlocked! 🎉</span>
        ) : (
          <span className="text-sm font-medium">
            {achievement.progress || 0}/{achievement.threshold}
          </span>
        )}
      </div>
    </div>
  );
}
