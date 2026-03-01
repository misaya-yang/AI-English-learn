import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAiFeedbackHistory,
  getContentItemsByUnit,
  getContentUnits,
  getEntitlement,
  getErrorGraph,
  getExamTracks,
  getLatestAiFeedback,
  getQuotaSnapshot,
  saveAiFeedbackRecord,
  saveItemAttempt,
} from '@/data/examContent';
import {
  consumeExamFeatureQuota,
  createAttempt,
  generateMicroLessonFromErrors,
  generateSimulationItem,
  gradeIeltsWriting,
} from '@/services/aiExamCoach';
import type { AiFeedback, ContentUnit, ExamItem } from '@/types/examContent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Bot, Crown, Flame, ListChecks, RefreshCw, Sparkles, Target } from 'lucide-react';

export default function ExamPrepPage() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';

  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState(getExamTracks());
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [units, setUnits] = useState<ContentUnit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<ExamItem | null>(null);

  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2');
  const [writingPrompt, setWritingPrompt] = useState('');
  const [writingAnswer, setWritingAnswer] = useState('');
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [simItem, setSimItem] = useState<ExamItem | null>(null);
  const [microUnit, setMicroUnit] = useState<ContentUnit | null>(null);

  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [remainingQuota, setRemainingQuota] = useState({
    aiAdvancedFeedbackPerDay: 0,
    simItemsPerDay: 0,
    microLessonsPerDay: 0,
  });

  const errorGraph = getErrorGraph(userId);
  const feedbackHistory = getAiFeedbackHistory(userId, 5);

  useEffect(() => {
    const initialTracks = getExamTracks();
    setTracks(initialTracks);
    setSelectedTrackId(initialTracks[0]?.id || '');
  }, []);

  useEffect(() => {
    const selectedTrack = tracks.find((track) => track.id === selectedTrackId);
    if (!selectedTrack) {
      setUnits([]);
      setSelectedUnitId('');
      return;
    }

    const filtered = getContentUnits({
      examType: selectedTrack.examType,
      skill: selectedTrack.skill,
      bandTarget: selectedTrack.bandTarget,
    });

    setUnits(filtered);
    setSelectedUnitId((previous) => {
      if (previous && filtered.some((unit) => unit.id === previous)) {
        return previous;
      }
      return filtered[0]?.id || '';
    });
  }, [selectedTrackId, tracks]);

  useEffect(() => {
    const item = getContentItemsByUnit(selectedUnitId)[0] || null;
    setSelectedItem(item);
    if (item) {
      setWritingPrompt(item.prompt);
      setTaskType(item.itemType === 'writing_task_1' ? 'task1' : 'task2');
    }
  }, [selectedUnitId]);

  useEffect(() => {
    const loadPlanState = async () => {
      const entitlement = await getEntitlement(userId);
      const quota = await getQuotaSnapshot(userId);
      setPlan(entitlement.plan);
      setRemainingQuota(quota.remaining);
      setFeedback(getLatestAiFeedback(userId));
    };

    void loadPlanState();
  }, [userId]);

  const refreshQuota = async () => {
    const quota = await getQuotaSnapshot(userId);
    setRemainingQuota(quota.remaining);
  };

  const handleSubmitWriting = async () => {
    if (!selectedItem) {
      toast.error('请选择一个课程单元');
      return;
    }

    if (!writingAnswer.trim()) {
      toast.error('请先输入写作答案');
      return;
    }

    const quotaResult = await consumeExamFeatureQuota(userId, 'aiAdvancedFeedbackPerDay');
    if (!quotaResult.allowed) {
      toast.error('今日高级 AI 反馈次数已用完，请升级 Pro 或明天再试');
      return;
    }

    setLoading(true);
    try {
      const attempt = createAttempt({
        userId,
        itemId: selectedItem.id,
        answer: writingAnswer,
        skill: 'writing',
      });

      saveItemAttempt(attempt);

      const result = await gradeIeltsWriting({
        userId,
        attemptId: attempt.id,
        prompt: writingPrompt,
        answer: writingAnswer,
        taskType,
      });

      saveAiFeedbackRecord(userId, result);
      setFeedback(result);
      await refreshQuota();
      toast.success(`反馈完成，Overall Band ${result.scores.overallBand}`);
    } catch (error) {
      console.error(error);
      toast.error('写作反馈生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSimItem = async () => {
    const quotaResult = await consumeExamFeatureQuota(userId, 'simItemsPerDay');
    if (!quotaResult.allowed) {
      toast.error('今日仿真题配额已用完');
      return;
    }

    setLoading(true);
    try {
      const generated = await generateSimulationItem({
        userId,
        skill: 'writing',
        bandTarget: tracks.find((track) => track.id === selectedTrackId)?.bandTarget || '6.5',
        topic: 'public transport and city planning',
      });
      setSimItem(generated);
      await refreshQuota();
      toast.success('已生成新的 IELTS 仿真题');
    } catch (error) {
      console.error(error);
      toast.error('仿真题生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMicroLesson = async () => {
    const tags = (feedback?.issues || []).map((issue) => issue.tag);
    if (tags.length === 0) {
      toast.info('先完成一次写作反馈，再生成补救微课');
      return;
    }

    const quotaResult = await consumeExamFeatureQuota(userId, 'microLessonsPerDay');
    if (!quotaResult.allowed) {
      toast.error('今日补救微课配额已用完');
      return;
    }

    setLoading(true);
    try {
      const lesson = await generateMicroLessonFromErrors({
        userId,
        errorTags: tags,
        targetLevel: 'B1',
      });

      setMicroUnit(lesson.unit);
      setTracks(getExamTracks());
      await refreshQuota();
      toast.success('已生成错因补救微课');
    } catch (error) {
      console.error(error);
      toast.error('补救微课生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">IELTS Exam Prep</h1>
          <p className="text-muted-foreground">高质量内容 + AI 强反馈教练（会员权益版）</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={plan === 'pro' ? 'bg-emerald-600 text-white' : ''}>
            {plan === 'pro' ? <Crown className="h-3 w-3 mr-1" /> : <BookOpen className="h-3 w-3 mr-1" />}
            Plan: {plan.toUpperCase()}
          </Badge>
          <Badge variant="outline">Feedback left: {remainingQuota.aiAdvancedFeedbackPerDay}</Badge>
          <Badge variant="outline">Sim left: {remainingQuota.simItemsPerDay}</Badge>
          <Badge variant="outline">Micro left: {remainingQuota.microLessonsPerDay}</Badge>
          <Link to="/pricing">
            <Button size="sm" variant="outline">去订阅页</Button>
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Exam Tracks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label>Track</Label>
            <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Select IELTS track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={track.id}>
                    {track.title} ({track.bandTarget})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label className="pt-2 block">Micro Unit</Label>
            <Select value={selectedUnitId} onValueChange={setSelectedUnitId}>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.title} ({unit.estimatedMinutes}m)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedItem && (
              <p className="text-xs text-muted-foreground">
                Source: {selectedItem.source} | License: {selectedItem.license}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Error Graph
            </CardTitle>
          </CardHeader>
          <CardContent>
            {errorGraph.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无错因数据，先完成一次写作反馈。</p>
            ) : (
              <div className="space-y-2">
                {errorGraph.slice(0, 5).map((node) => (
                  <div key={node.tag} className="flex items-center justify-between border rounded p-2">
                    <span className="text-sm">{node.tag}</span>
                    <Badge variant="secondary">{node.count}</Badge>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full mt-3" variant="outline" onClick={handleGenerateMicroLesson} disabled={loading}>
              <Sparkles className="h-4 w-4 mr-2" />
              一键错题转课程
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ListChecks className="h-4 w-4" />
              Simulation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleGenerateSimItem} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              生成仿真题
            </Button>
            {simItem && (
              <div className="mt-3 border rounded p-3 space-y-2">
                <Badge variant="outline">{simItem.itemType}</Badge>
                <p className="text-sm">{simItem.prompt}</p>
                <p className="text-xs text-muted-foreground">{simItem.attribution}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Writing Coach (IELTS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select value={taskType} onValueChange={(value: 'task1' | 'task2') => setTaskType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task1">Task 1</SelectItem>
                  <SelectItem value="task2">Task 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea value={writingPrompt} onChange={(e) => setWritingPrompt(e.target.value)} className="min-h-[90px]" />
          </div>

          <div className="space-y-2">
            <Label>Your Answer</Label>
            <Textarea
              value={writingAnswer}
              onChange={(e) => setWritingAnswer(e.target.value)}
              className="min-h-[180px]"
              placeholder="Write your IELTS response here..."
            />
          </div>

          <Button onClick={handleSubmitWriting} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
            获取结构化评分反馈
          </Button>

          {feedback && (
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Feedback Result</h3>
                <Badge variant="outline">Provider: {feedback.provider}</Badge>
              </div>

              <div className="grid md:grid-cols-5 gap-2">
                <ScoreCell title="Task" value={feedback.scores.taskResponse} />
                <ScoreCell title="Coherence" value={feedback.scores.coherenceCohesion} />
                <ScoreCell title="Lexical" value={feedback.scores.lexicalResource} />
                <ScoreCell title="Grammar" value={feedback.scores.grammaticalRangeAccuracy} />
                <ScoreCell title="Overall" value={feedback.scores.overallBand} highlight />
              </div>

              <div>
                <p className="font-medium mb-2">Issues</p>
                <div className="space-y-2">
                  {feedback.issues.map((issue, index) => (
                    <div key={`${issue.tag}-${index}`} className="border rounded p-2">
                      <p className="text-sm font-medium">[{issue.tag}] {issue.message}</p>
                      <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium mb-2">Rewrite Suggestions</p>
                <ul className="list-disc ml-5 space-y-1">
                  {feedback.rewrites.map((rewrite, index) => (
                    <li key={index} className="text-sm">{rewrite}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedbackHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无历史反馈。</p>
          ) : (
            <div className="space-y-2">
              {feedbackHistory.map((item) => (
                <div key={item.attemptId} className="border rounded p-2 flex items-center justify-between">
                  <span className="text-sm">{new Date(item.createdAt).toLocaleString()}</span>
                  <Badge>Band {item.scores.overallBand}</Badge>
                </div>
              ))}
            </div>
          )}

          {microUnit && (
            <div className="mt-4 border rounded p-3 bg-emerald-50/40 dark:bg-emerald-900/10">
              <p className="font-medium">已生成补救微课：{microUnit.title}</p>
              <p className="text-sm text-muted-foreground">时长 {microUnit.estimatedMinutes} 分钟</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreCell({ title, value, highlight = false }: { title: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded border p-2 text-center ${highlight ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}>
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="text-lg font-semibold">{value.toFixed(1)}</p>
    </div>
  );
}
