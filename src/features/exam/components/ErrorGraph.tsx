import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { cn } from '@/lib/utils';

export interface ErrorGraphDatum {
  tag: string;
  label: string;
  weight: number;
}

interface ErrorGraphProps {
  analytics: ErrorGraphDatum[];
  activeTag?: string | null;
  onSelectTag?: (tag: string) => void;
}

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#2dd4bf', '#14b8a6', '#22c55e'];

export function ErrorGraph({ analytics, activeTag, onSelectTag }: ErrorGraphProps) {
  if (analytics.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 text-sm text-muted-foreground">
        暂无错因图谱。完成一次写作反馈后，这里会显示你的弱项分布。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={analytics}
              dataKey="weight"
              nameKey="label"
              innerRadius={42}
              outerRadius={74}
              paddingAngle={3}
              onClick={(entry: ErrorGraphDatum) => onSelectTag?.(entry.tag)}
            >
              {analytics.map((entry, index) => (
                <Cell
                  key={entry.tag}
                  fill={COLORS[index % COLORS.length]}
                  stroke={entry.tag === activeTag ? '#ffffff' : 'transparent'}
                  strokeWidth={entry.tag === activeTag ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                borderColor: 'hsl(161 84% 40% / 0.35)',
                background: 'var(--background)',
              }}
              formatter={(value: number, _name: string, payload: { payload?: ErrorGraphDatum }) => {
                const item = payload.payload;
                return [`${value}%`, item?.label || ''];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={analytics}>
            <XAxis dataKey="label" hide />
            <YAxis allowDecimals={false} width={24} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                borderColor: 'hsl(161 84% 40% / 0.35)',
                background: 'var(--background)',
              }}
              formatter={(value: number, _name: string, payload: { payload?: ErrorGraphDatum }) => {
                const item = payload.payload;
                return [`${value}%`, item?.label || ''];
              }}
            />
            <Bar
              dataKey="weight"
              radius={[8, 8, 0, 0]}
              onClick={(entry: ErrorGraphDatum) => onSelectTag?.(entry.tag)}
            >
              {analytics.map((entry, index) => (
                <Cell
                  key={`bar-${entry.tag}`}
                  fill={COLORS[index % COLORS.length]}
                  opacity={activeTag && activeTag !== entry.tag ? 0.55 : 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {analytics.map((item, index) => {
          const active = item.tag === activeTag;
          return (
            <button
              key={item.tag}
              type="button"
              onClick={() => onSelectTag?.(item.tag)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                active
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600'
                  : 'border-border/60 text-muted-foreground hover:border-emerald-500/40 hover:text-foreground',
              )}
            >
              <span className="inline-flex items-center gap-1">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                {item.label} {item.weight}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
