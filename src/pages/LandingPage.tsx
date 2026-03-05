import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Brain,
  Sparkles,
  Zap,
  Trophy,
  MessageCircle,
  BarChart3,
  Check,
  Star,
  Flame,
  Target,
  ChevronRight,
  Globe,
  Moon,
  Sun,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Word Generation',
    titleZh: 'AI 智能单词生成',
    description: 'Personalized daily words based on your level, interests, and learning history.',
    descriptionZh: '根据您的水平、兴趣和学习历史，生成个性化每日单词。',
  },
  {
    icon: Brain,
    title: 'Spaced Repetition System',
    titleZh: '间隔重复系统',
    description: 'Scientifically-proven SRS algorithm to maximize long-term retention.',
    descriptionZh: '经科学验证的 SRS 算法，最大化长期记忆保留。',
  },
  {
    icon: Zap,
    title: 'Interactive Practice Modes',
    titleZh: '互动练习模式',
    description: 'Multiple choice, fill-in-blank, matching, listening, and writing practice.',
    descriptionZh: '选择题、填空、配对、听力和写作练习。',
  },
  {
    icon: Trophy,
    title: 'Gamification & Progress',
    titleZh: '游戏化与进度追踪',
    description: 'XP points, streaks, badges, and detailed analytics to keep you motivated.',
    descriptionZh: '经验值、连续学习、徽章和详细分析，保持学习动力。',
  },
  {
    icon: MessageCircle,
    title: 'AI English Tutor',
    titleZh: 'AI 英语家教',
    description: '24/7 AI tutor to answer questions, explain differences, and provide feedback.',
    descriptionZh: '24/7 AI 家教回答问题、解释差异并提供反馈。',
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    titleZh: '详细分析报告',
    description: 'Track your learning with beautiful charts, retention curves, and activity heatmaps.',
    descriptionZh: '使用精美图表、记忆曲线和活动热图追踪学习进度。',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'University Student',
    avatar: 'SC',
    content: 'VocabDaily AI has transformed my English learning. The AI-generated examples are incredibly natural and helpful!',
    contentZh: 'VocabDaily AI 彻底改变了我的英语学习方式。AI 生成的例句非常自然且实用！',
    rating: 5,
  },
  {
    name: 'David Wang',
    role: 'Software Engineer',
    avatar: 'DW',
    content: 'The spaced repetition system really works. I\'ve retained 90% of the words I\'ve learned!',
    contentZh: '间隔重复系统真的有效。我保留了 90% 学过的单词！',
    rating: 5,
  },
  {
    name: 'Emily Liu',
    role: 'Marketing Manager',
    avatar: 'EL',
    content: 'Perfect for busy professionals. Just 15 minutes a day and I\'ve learned 500+ words in 3 months!',
    contentZh: '非常适合忙碌的专业人士。每天只需 15 分钟，3 个月就学了 500 多个单词！',
    rating: 5,
  },
];

const pricingPlans = [
  {
    name: 'Free',
    nameZh: '免费版',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '10 words per day',
      'Basic review mode',
      'Limited practice quizzes',
      'Community support',
    ],
    cta: 'Get Started Free',
    ctaZh: '免费开始',
    highlighted: false,
  },
  {
    name: 'Pro',
    nameZh: '专业版',
    price: '$9.99',
    period: 'per month',
    description: 'For serious learners',
    features: [
      'Unlimited words per day',
      'Advanced AI feedback',
      'All practice modes',
      'Priority word generation',
      'Export to CSV/Anki',
      'Ad-free experience',
      'Email support',
    ],
    cta: 'Start Pro Trial',
    ctaZh: '开始专业版试用',
    highlighted: true,
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">VocabDaily AI</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <button onClick={() => scrollToSection('features')} className="text-sm hover:text-emerald-600">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-sm hover:text-emerald-600">
                How It Works
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-sm hover:text-emerald-600">
                Pricing
              </button>
              <Link to="/word-of-the-day" className="text-sm hover:text-emerald-600">
                Word of the Day
              </Link>
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link to="/login">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t bg-background"
          >
            <div className="container mx-auto px-4 py-4 space-y-3">
              <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2">
                How It Works
              </button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left py-2">
                Pricing
              </button>
              <Link to="/word-of-the-day" className="block w-full text-left py-2">
                Word of the Day
              </Link>
              <Separator />
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/login">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered Learning
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Master English Words{' '}
                <span className="text-emerald-600">Efficiently</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                The ultimate AI-powered vocabulary learning platform for Chinese-speaking learners.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                专为中文使用者设计的 AI 智能单词学习平台
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                    Start Learning Free
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/word-of-the-day">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    <Globe className="h-4 w-4 mr-2" />
                    Word of the Day
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 mt-8">
                <div className="flex -space-x-2">
                  {['SC', 'DW', 'EL', 'JM'].map((initials) => (
                    <div
                      key={initials}
                      className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-background flex items-center justify-center text-sm font-medium"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-medium">10,000+ learners</p>
                  <p className="text-sm text-muted-foreground">join every month</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
                  alt="Students learning"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Card className="bg-white/95 dark:bg-card/95 backdrop-blur">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Flame className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium">Daily Streak</p>
                          <p className="text-sm text-muted-foreground">You've studied 12 days in a row!</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -top-4 -right-4 bg-white dark:bg-card rounded-lg shadow-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm font-medium">+50 XP today</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground">强大功能</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{feature.titleZh}</p>
                    <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                    <p className="text-xs text-muted-foreground">{feature.descriptionZh}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">如何使用</p>
          </div>

          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Create Your Profile',
                titleZh: '创建个人档案',
                description: 'Set your CEFR level, daily goals, and preferred topics.',
                descriptionZh: '设置您的 CEFR 水平、每日目标和偏好主题。',
              },
              {
                step: '2',
                title: 'Get Daily Words',
                titleZh: '获取每日单词',
                description: 'AI generates personalized words just for you every day.',
                descriptionZh: 'AI 每天为您生成个性化单词。',
              },
              {
                step: '3',
                title: 'Learn & Review',
                titleZh: '学习与复习',
                description: 'Use flashcards, quizzes, and SRS to master vocabulary.',
                descriptionZh: '使用单词卡、测验和 SRS 掌握词汇。',
              },
              {
                step: '4',
                title: 'Track Progress',
                titleZh: '追踪进度',
                description: 'Monitor your growth with detailed analytics and insights.',
                descriptionZh: '通过详细分析和洞察监控您的成长。',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-6"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{item.titleZh}</p>
                  <p className="text-muted-foreground">{item.description}</p>
                  <p className="text-sm text-muted-foreground">{item.descriptionZh}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Learners Say</h2>
            <p className="text-xl text-muted-foreground">学习者怎幺说</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="mb-4">"{testimonial.content}"</p>
                    <p className="text-sm text-muted-foreground mb-4">{testimonial.contentZh}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center font-medium">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-xl text-muted-foreground">简单透明的价格</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  'relative',
                  plan.highlighted && 'border-emerald-500 shadow-lg'
                )}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.nameZh}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={plan.highlighted ? '/register' : '/register'}>
                    <Button
                      className={cn(
                        'w-full',
                        plan.highlighted
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'variant-outline'
                      )}
                      variant={plan.highlighted ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Vocabulary Journey Today</h2>
          <p className="text-xl mb-2">今天开始您的单词学习之旅</p>
          <p className="text-emerald-100 mb-8">
            Join 10,000+ learners who are mastering English with AI-powered personalized learning.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              Get Started Free
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">VocabDaily AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered vocabulary learning for Chinese-speaking English learners.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/word-of-the-day" className="text-muted-foreground hover:text-foreground">Word of the Day</Link></li>
                <li><Link to="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground">Features</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="#" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <Separator className="mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 VocabDaily AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Made with ❤️ for uu</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
