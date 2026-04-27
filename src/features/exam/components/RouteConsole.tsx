import { motion } from 'framer-motion';

import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ContentUnit, ExamTrack } from '@/types/examContent';

interface RouteConsoleProps {
  trackSearch: string;
  onTrackSearchChange: (value: string) => void;
  filteredTracks: ExamTrack[];
  selectedTrackId: string;
  trackProgressMap: Map<string, number>;
  onSelectTrack: (trackId: string) => void;
  unitSearch: string;
  onUnitSearchChange: (value: string) => void;
  filteredUnits: ContentUnit[];
  selectedUnitId: string;
  selectedUnit: ContentUnit | null;
  selectedUnitProgress: number;
  unitProgressMap: Map<string, number>;
  onSelectUnit: (unitId: string) => void;
}

export function RouteConsole({
  trackSearch,
  onTrackSearchChange,
  filteredTracks,
  selectedTrackId,
  trackProgressMap,
  onSelectTrack,
  unitSearch,
  onUnitSearchChange,
  filteredUnits,
  selectedUnitId,
  selectedUnit,
  selectedUnitProgress,
  unitProgressMap,
  onSelectUnit,
}: RouteConsoleProps) {
  return (
    <motion.aside initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <section className="rounded-[24px] border border-border/70 bg-card/90 p-4">
        <div className="space-y-2">
          <p className="text-[11px] tracking-wide text-muted-foreground/80">路线选择</p>
          <h2 className="text-lg font-semibold">选择冲分轨道</h2>
          <p className="text-sm text-muted-foreground">先定 Band 区间和 skill，再决定这轮写作应该站在哪个单元。</p>
        </div>

        <Input
          value={trackSearch}
          onChange={(event) => onTrackSearchChange(event.target.value)}
          placeholder="搜索 Track / Band / Skill"
          className="mt-4 h-10 bg-background/60"
        />

        <ScrollArea className="mt-4 h-[280px]">
          <div className="space-y-2 pr-3">
            {filteredTracks.length === 0 ? (
              <p className="text-sm text-muted-foreground">没有匹配的 Track。</p>
            ) : (
              filteredTracks.map((track) => {
                const active = track.id === selectedTrackId;
                const progress = trackProgressMap.get(track.id) || 0;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => onSelectTrack(track.id)}
                    className={cn(
                      'w-full rounded-2xl border px-3 py-3 text-left transition-colors',
                      active
                        ? 'border-emerald-500/60 bg-emerald-500/[0.12]'
                        : 'border-border/60 bg-background/35 hover:border-emerald-500/30 hover:bg-muted/40',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{track.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{track.bandTarget} · {track.skill}</p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="mt-3 h-1.5 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </section>

      <section className="rounded-[24px] border border-border/70 bg-card/90 p-4">
        <div className="space-y-2">
          <p className="text-[11px] tracking-wide text-muted-foreground/80">练习单元</p>
          <h2 className="text-lg font-semibold">按单元推进，不要一口气全练</h2>
        </div>

        <Input
          value={unitSearch}
          onChange={(event) => onUnitSearchChange(event.target.value)}
          placeholder="搜索单元"
          className="mt-4 h-10 bg-background/60"
        />

        {selectedUnit && (
          <div className="mt-4 rounded-2xl border border-border/70 bg-background/40 p-3">
            <p className="text-sm font-medium">{selectedUnit.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedUnit.cefrLevel} · {selectedUnit.estimatedMinutes} min · {selectedUnitProgress}% 完成
            </p>
          </div>
        )}

        <ScrollArea className="mt-4 h-[260px]">
          <div className="space-y-2 pr-3">
            {filteredUnits.length === 0 ? (
              <p className="text-sm text-muted-foreground">当前 Track 暂无可用单元。</p>
            ) : (
              filteredUnits.map((unit) => {
                const active = unit.id === selectedUnitId;
                const progress = unitProgressMap.get(unit.id) || 0;
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => onSelectUnit(unit.id)}
                    className={cn(
                      'w-full rounded-2xl border px-3 py-3 text-left transition-colors',
                      active
                        ? 'border-emerald-500/60 bg-emerald-500/[0.12]'
                        : 'border-border/60 bg-background/35 hover:border-emerald-500/30 hover:bg-muted/30',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{unit.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{unit.cefrLevel} · {unit.estimatedMinutes} min</p>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="mt-3 h-1.5 [&>[data-slot=progress-indicator]]:bg-emerald-500" />
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </section>
    </motion.aside>
  );
}
