import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, Circle, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motionPresets, motionStagger } from '@/lib/motion';
import { learningPaths, type LearningPath, type LessonItem } from '@/data/learningPaths';

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function LearningPathPage() {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [completedLessons] = useState<Set<string>>(new Set());

  if (!selectedPath) {
    // Path selector view
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
        <motion.div {...motionPresets.fadeIn}>
          <h1 className="text-2xl font-bold tracking-tight">
            {isZh ? '学习路径' : 'Learning Paths'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isZh ? '选择一条路径，系统化提升你的英语能力' : 'Choose a path to systematically improve your English'}
          </p>
        </motion.div>

        <div className="grid gap-4">
          {learningPaths.map((path, idx) => (
            <motion.div key={path.id} {...motionStagger(idx)}>
              <Card
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedPath(path)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-3xl">{path.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">
                      {isZh ? path.titleZh : path.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {isZh ? path.descriptionZh : path.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs rounded px-1.5 py-0.5 ${DIFFICULTY_COLORS[path.difficulty]}`}>
                        {path.difficulty}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {path.totalLessons} {isZh ? '课' : 'lessons'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Path detail view — map-style visualization
  const totalLessons = selectedPath.totalLessons;
  const doneCount = selectedPath.stages.reduce(
    (sum, s) => sum + s.units.reduce(
      (u, unit) => u + unit.lessons.filter((l) => completedLessons.has(l.id)).length, 0,
    ), 0,
  );
  const progressPercent = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  const lessonTypeIcon: Record<LessonItem['type'], string> = {
    vocabulary: '📖',
    grammar: '📝',
    practice: '🎯',
    conversation: '💬',
    review: '🔄',
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <motion.div {...motionPresets.fadeIn}>
        <Button variant="ghost" size="sm" onClick={() => setSelectedPath(null)}>
          ← {isZh ? '返回路径列表' : 'Back to paths'}
        </Button>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-2xl">{selectedPath.icon}</span>
          <div>
            <h1 className="text-xl font-bold">
              {isZh ? selectedPath.titleZh : selectedPath.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isZh ? selectedPath.descriptionZh : selectedPath.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Progress value={progressPercent} className="flex-1" />
          <span className="text-xs text-muted-foreground">{doneCount}/{totalLessons}</span>
        </div>
      </motion.div>

      {/* Stages & units — vertical map */}
      {selectedPath.stages.map((stage, stageIdx) => (
        <div key={stage.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-primary">
              {isZh ? stage.titleZh : stage.title}
            </h2>
          </div>

          {stage.units.map((unit) => (
            <Card key={unit.id}>
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-sm">
                  {isZh ? unit.titleZh : unit.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 pb-3">
                {unit.lessons.map((lesson) => {
                  const done = completedLessons.has(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-sm">{lessonTypeIcon[lesson.type]}</span>
                      <span className={`text-sm flex-1 ${done ? 'line-through text-muted-foreground' : ''}`}>
                        {isZh ? lesson.titleZh : lesson.title}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {lesson.estimatedMinutes}m
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
