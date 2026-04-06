import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motionStagger } from '@/lib/motion';
import {
  roleplayScenarios,
  SCENARIO_CATEGORIES,
  DIFFICULTY_LABELS,
  type RoleplayScenario,
  type ScenarioCategory,
  type ScenarioDifficulty,
} from '@/data/roleplayScenarios';

interface ScenarioSelectorProps {
  onSelect: (scenario: RoleplayScenario) => void;
}

export function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ScenarioCategory | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<ScenarioDifficulty | 'all'>('all');

  const filtered = useMemo(() => {
    return roleplayScenarios.filter((s) => {
      if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
      if (difficultyFilter !== 'all' && s.difficulty !== difficultyFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.titleZh.includes(q) ||
          s.keyPhrases.some((p) => p.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [search, categoryFilter, difficultyFilter]);

  const difficultyColor: Record<ScenarioDifficulty, string> = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isZh ? '搜索场景...' : 'Search scenarios...'}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={categoryFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategoryFilter('all')}
        >
          <Filter className="h-3 w-3 mr-1" />
          {isZh ? '全部' : 'All'}
        </Button>
        {SCENARIO_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={categoryFilter === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(cat.id)}
          >
            {isZh ? cat.labelZh : cat.label}
          </Button>
        ))}
      </div>

      {/* Difficulty filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={difficultyFilter === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setDifficultyFilter('all')}
        >
          {isZh ? '全部难度' : 'All Levels'}
        </Button>
        {(Object.entries(DIFFICULTY_LABELS) as [ScenarioDifficulty, { label: string; labelZh: string }][]).map(
          ([key, val]) => (
            <Button
              key={key}
              variant={difficultyFilter === key ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setDifficultyFilter(key)}
            >
              {isZh ? val.labelZh : val.label}
            </Button>
          ),
        )}
      </div>

      {/* Scenario grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((scenario, idx) => (
          <motion.div key={scenario.id} {...motionStagger(idx)}>
            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => onSelect(scenario)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{scenario.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight">
                      {isZh ? scenario.titleZh : scenario.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs rounded px-1.5 py-0.5 ${difficultyColor[scenario.difficulty]}`}>
                        {isZh ? DIFFICULTY_LABELS[scenario.difficulty].labelZh : DIFFICULTY_LABELS[scenario.difficulty].label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ~{scenario.estimatedMinutes} min
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {scenario.objectives.map((obj) => (
                        <Badge key={obj.id} variant="outline" className="text-[10px] px-1.5 py-0">
                          {isZh ? obj.descriptionZh : obj.description}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">
          {isZh ? '没有匹配的场景' : 'No matching scenarios'}
        </p>
      )}
    </div>
  );
}
