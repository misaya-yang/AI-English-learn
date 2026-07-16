import { motion } from 'framer-motion';
import { BookOpen, ListChecks } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ISSUE_LABELS } from '@/features/exam/constants';
import { ErrorGraph } from '@/features/exam/components/ErrorGraph';
import { EmptyKickoffCard, MiniTrendChart } from '@/features/exam/components/ExamPrepShared';
import type { InsightView } from '@/features/exam/types';
import type { AiFeedback, ContentUnit, FeedbackIssue } from '@/types/examContent';

interface InsightRailProps {
  insightView: InsightView;
  onInsightViewChange: (view: InsightView) => void;
  errorAnalytics: Array<{ tag: string; label: string; weight: number }>;
  activeErrorTag: FeedbackIssue['tag'] | null;
  onSelectErrorTag: (tag: FeedbackIssue['tag']) => void;
  onQuickStart: () => Promise<void>;
  selectedErrorNode: { tag: FeedbackIssue['tag']; count: number } | null;
  feedback: AiFeedback | null;
  isBusy: boolean;
  onGenerateMicroLesson: () => Promise<void>;
  onJumpToVocabulary: () => void;
  microUnit: ContentUnit | null;
  feedbackHistory: AiFeedback[];
  selectedTrackBandTarget: string | null;
  selectedUnitProgress: number;
  thisWeekRuns: number;
  recentHistory: AiFeedback[];
  onRetryFeedback: (item: AiFeedback) => void;
  onViewError: (tag: FeedbackIssue['tag']) => void;
}

export function InsightRail({
  insightView,
  onInsightViewChange,
  errorAnalytics,
  activeErrorTag,
  onSelectErrorTag,
  onQuickStart,
  selectedErrorNode,
  feedback,
  isBusy,
  onGenerateMicroLesson,
  onJumpToVocabulary,
  microUnit,
  feedbackHistory,
  selectedTrackBandTarget,
  selectedUnitProgress,
  thisWeekRuns,
  recentHistory,
  onRetryFeedback,
  onViewError,
}: InsightRailProps) {
  return (
    <motion.aside initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
      <section className="overflow-hidden rounded-xl border border-transparent bg-card/90">
        <Tabs value={insightView} onValueChange={(value) => onInsightViewChange(value as InsightView)} className="gap-0">
          <div className="border-b border-transparent px-4 py-3">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-medium text-muted-foreground/80">数据</p>
                <h2 className="mt-2 text-lg font-semibold">只看这次练习相关的记录</h2>
              </div>
              <TabsList className="liquid-glass-control grid w-full grid-cols-3 rounded-lg p-1">
                <TabsTrigger value="weakness" className="rounded-md">弱项</TabsTrigger>
                <TabsTrigger value="trend" className="rounded-md">走势</TabsTrigger>
                <TabsTrigger value="history" className="rounded-md">历史</TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="px-4 py-3">
            <TabsContent value="weakness" className="mt-0 space-y-4">
              {errorAnalytics.length === 0 ? (
                <EmptyKickoffCard onQuickStart={() => void onQuickStart()} />
              ) : (
                <div className="rounded-lg border border-border/70 bg-background/35 p-4">
                  <ErrorGraph
                    analytics={errorAnalytics}
                    activeTag={activeErrorTag}
                    onSelectTag={(tag) => onSelectErrorTag(tag as FeedbackIssue['tag'])}
                  />
                </div>
              )}

              <div className="rounded-lg border border-border/70 bg-background/35 p-4">
                <p className="text-sm font-semibold">下一步</p>
                {selectedErrorNode ? (
                  <>
                    <div className="mt-3 rounded-md border border-[hsl(var(--accent-exam)/0.28)] bg-[hsl(var(--accent-exam)/0.08)] p-3">
                      <p className="text-sm font-medium text-foreground">优先修复：{ISSUE_LABELS[selectedErrorNode.tag]}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        近期出现 {selectedErrorNode.count} 次。先做一个小练习，再重写一段。
                      </p>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <Button onClick={() => void onGenerateMicroLesson()} disabled={isBusy || !feedback}>
                        <ListChecks className="mr-1.5 h-4 w-4" /> 错题练习
                      </Button>
                      <Button variant="glass" className="rounded-lg" onClick={onJumpToVocabulary}>
                        <BookOpen className="mr-1.5 h-4 w-4" /> 跳转词库补强
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">完成首次反馈后，这里会显示下一组练习。</p>
                )}

                {microUnit && (
                  <div className="mt-4 rounded-md border border-border/60 bg-background/50 p-3">
                    <p className="text-sm font-medium">最新专项讲解</p>
                    <p className="mt-1 text-sm text-foreground">{microUnit.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">预计 {microUnit.estimatedMinutes} 分钟 · {microUnit.cefrLevel}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="trend" className="mt-0 space-y-4">
              <div className="rounded-lg border border-border/70 bg-background/35 p-4">
                <p className="text-sm font-semibold">Band 走势</p>
                <p className="mt-1 text-xs text-muted-foreground">最近 7 次反馈走势</p>
                <div className="mt-4">
                  <MiniTrendChart history={feedbackHistory} />
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-background/35 p-4">
                <p className="text-sm font-semibold">本轮状态</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>当前轨道</span>
                    <span className="font-medium text-foreground">{selectedTrackBandTarget || '未选择'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>当前单元</span>
                    <span className="font-medium text-foreground">{selectedUnitProgress}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>本周完成反馈</span>
                    <span className="font-medium text-foreground">{thisWeekRuns} 次</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-0">
              {recentHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无反馈记录，先完成一次写作评分。</p>
              ) : (
                <div className="space-y-3">
                  {recentHistory.map((item) => {
                    const tags = item.issues.slice(0, 3).map((issue) => ISSUE_LABELS[issue.tag] || issue.tag);
                    return (
                      <div key={item.attemptId} className="rounded-lg border border-border/70 bg-background/35 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                            <p className="mt-1 text-lg font-semibold">Band {item.scores.overallBand.toFixed(1)}</p>
                          </div>
                          <Badge variant="outline" className="rounded-md">{item.provider}</Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                          <span className="rounded-md bg-muted/40 px-2 py-1">题目 {item.scores.taskResponse.toFixed(1)}</span>
                          <span className="rounded-md bg-muted/40 px-2 py-1">连贯 {item.scores.coherenceCohesion.toFixed(1)}</span>
                          <span className="rounded-md bg-muted/40 px-2 py-1">词汇 {item.scores.lexicalResource.toFixed(1)}</span>
                          <span className="rounded-md bg-muted/40 px-2 py-1">语法 {item.scores.grammaticalRangeAccuracy.toFixed(1)}</span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tags.length === 0 ? (
                            <span className="text-xs text-muted-foreground">暂无明显问题</span>
                          ) : (
                            tags.map((tag) => (
                              <span key={`${item.attemptId}-${tag}`} className="rounded-md border border-border/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                                {tag}
                              </span>
                            ))
                          )}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button size="sm" variant="glass" className="rounded-lg" onClick={() => onRetryFeedback(item)}>
                            再练一次
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary"
                            onClick={() => {
                              const firstTag = item.issues[0]?.tag;
                              if (firstTag) {
                                onViewError(firstTag);
                              }
                            }}
                          >
                            查看错因
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </section>
    </motion.aside>
  );
}
