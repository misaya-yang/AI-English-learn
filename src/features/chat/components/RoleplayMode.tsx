import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Circle, Clock, Star, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motionPresets } from '@/lib/motion';
import { ScenarioSelector } from './ScenarioSelector';
import {
  type RoleplayScenario,
  type ScenarioSession,
  DIFFICULTY_LABELS,
} from '@/data/roleplayScenarios';

interface RoleplayModeProps {
  /** Called when user selects a scenario → parent should set system prompt and enter roleplay chat */
  onStartScenario: (scenario: RoleplayScenario) => void;
  /** Called when user exits roleplay mode */
  onExit: () => void;
  /** Current active scenario (null = selector view) */
  activeScenario: RoleplayScenario | null;
  /** Completed objective IDs for the current session */
  completedObjectives: string[];
  /** Message count in current session */
  messageCount: number;
  /** Session score (null if not yet scored) */
  sessionScore: number | null;
}

export function RoleplayMode({
  onStartScenario,
  onExit,
  activeScenario,
  completedObjectives,
  messageCount,
  sessionScore,
}: RoleplayModeProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';

  // If no active scenario, show selector
  if (!activeScenario) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">
              {isZh ? '角色扮演练习' : 'Roleplay Practice'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isZh ? '选择一个场景开始对话练习' : 'Choose a scenario to start practicing'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onExit}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {isZh ? '返回' : 'Back'}
          </Button>
        </div>
        <ScenarioSelector onSelect={onStartScenario} />
      </div>
    );
  }

  // Active scenario: show progress sidebar
  const objectivesDone = completedObjectives.length;
  const objectivesTotal = activeScenario.objectives.length;
  const progressPercent = objectivesTotal > 0 ? Math.round((objectivesDone / objectivesTotal) * 100) : 0;
  const allDone = objectivesDone === objectivesTotal;

  return (
    <motion.div {...motionPresets.fadeIn} className="space-y-3 p-3">
      {/* Scenario header */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeScenario.icon}</span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm leading-tight">
                {isZh ? activeScenario.titleZh : activeScenario.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px]">
                  {isZh
                    ? DIFFICULTY_LABELS[activeScenario.difficulty].labelZh
                    : DIFFICULTY_LABELS[activeScenario.difficulty].label}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{activeScenario.estimatedMinutes} min
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          {/* Objectives */}
          <div className="space-y-1.5 mt-2">
            <p className="text-xs font-medium text-muted-foreground">
              {isZh ? '任务目标' : 'Objectives'}
            </p>
            {activeScenario.objectives.map((obj) => {
              const done = completedObjectives.includes(obj.id);
              return (
                <div
                  key={obj.id}
                  className="flex items-center gap-2 text-xs"
                >
                  {done ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  )}
                  <span className={done ? 'line-through text-muted-foreground' : ''}>
                    {isZh ? obj.descriptionZh : obj.description}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <Progress value={progressPercent} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-1">
              {objectivesDone}/{objectivesTotal} {isZh ? '已完成' : 'completed'}
            </p>
          </div>

          {/* Key phrases */}
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {isZh ? '关键短语' : 'Key Phrases'}
            </p>
            <div className="flex flex-wrap gap-1">
              {activeScenario.keyPhrases.map((phrase) => (
                <Badge key={phrase} variant="secondary" className="text-[10px]">
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>

          {/* Score (when all objectives done) */}
          <AnimatePresence>
            {allDone && sessionScore !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 rounded-lg bg-primary/5 p-3 text-center"
              >
                <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-lg font-bold">{sessionScore}/100</p>
                <p className="text-xs text-muted-foreground">
                  {isZh ? '场景完成！' : 'Scenario Complete!'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exit button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3"
            onClick={onExit}
          >
            {allDone
              ? (isZh ? '选择新场景' : 'Choose New Scenario')
              : (isZh ? '退出场景' : 'Exit Scenario')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
