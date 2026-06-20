import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, TrendingUp, AlertTriangle, BookOpen, Lightbulb, ChevronRight, Star, Target } from 'lucide-react'

const MOCK_INSIGHTS = {
  summary: "You're a strong backend-focused full-stack developer with a solid Python/Flask foundation and growing React skills. Your open-source presence is building, but cloud & DevOps remain your largest gap compared to senior roles.",
  strengths: [
    { label: 'Python & Flask',       score: 94, detail: 'Multiple deployed projects, consistent activity, strong evidence chain'       },
    { label: 'Problem Solving',      score: 91, detail: '412 DSA solutions, contest participation, clean algorithmic commits'           },
    { label: 'Full-Stack Projects',  score: 86, detail: '9 live deployments verified, cross-stack skill demonstrated'                  },
    { label: 'Consistency',          score: 88, detail: '847 contributions this year, no 3-week gaps — rare among developers'          },
  ],
  gaps: [
    { label: 'Cloud / AWS',      priority: 'high',   detail: 'Claimed on resume but zero evidence in any repository'                   },
    { label: 'CI/CD Pipelines',  priority: 'high',   detail: 'No GitHub Actions or pipeline configs found across 47 repos'             },
    { label: 'Docker / Containers', priority: 'medium',detail: 'No Dockerfile in any project — limits senior role eligibility'        },
    { label: 'System Design',    priority: 'medium', detail: 'No design doc repositories or architecture write-ups found'              },
    { label: 'Testing',          priority: 'low',    detail: 'Limited unit test coverage detected across projects'                    },
  ],
  learningPath: [
    {
      phase: '1',
      title: 'Close the DevOps Gap',
      duration: '4–6 weeks',
      color: 'red',
      steps: [
        'Add Dockerfile to top 3 projects',
        'Set up GitHub Actions CI pipeline',
        'Deploy one project to AWS EC2',
        'Get AWS Cloud Practitioner cert',
      ],
    },
    {
      phase: '2',
      title: 'Strengthen Cloud Skills',
      duration: '6–8 weeks',
      color: 'yellow',
      steps: [
        'Study AWS Solutions Architect SAA-C03',
        'Deploy Flask app on ECS/Lambda',
        'Set up CloudWatch monitoring',
        'Use S3 for file storage in a project',
      ],
    },
    {
      phase: '3',
      title: 'Senior-Ready Profile',
      duration: '8–12 weeks',
      color: 'green',
      steps: [
        'Add system design notes repo',
        'Contribute to 2 open-source projects',
        'Write a technical blog (dev.to)',
        'Reach 500 GitHub stars total',
      ],
    },
  ],
  suggestedRoles: [
    { title: 'Backend Developer',        match: 94 },
    { title: 'Full Stack Developer',     match: 82 },
    { title: 'Python Engineer',          match: 91 },
    { title: 'Junior DevOps Engineer',   match: 48 },
    { title: 'ML Engineer',              match: 61 },
  ],
}

const PRIORITY = {
  high:   { bg: 'bg-red-500/10 border-red-500/20',     text: 'text-red-400',    badge: 'badge-danger'  },
  medium: { bg: 'bg-yellow-500/10 border-yellow-500/20',text: 'text-yellow-400', badge: 'badge-warning' },
  low:    { bg: 'bg-dark-700 border-white/5',           text: 'text-dark-300',   badge: ''              },
}
const PHASE_COLOR = {
  red:    'bg-red-500/15 border-red-500/25 text-red-400',
  yellow: 'bg-yellow-500/15 border-yellow-500/25 text-yellow-400',
  green:  'bg-emerald-500/15 border-emerald-500/25 text-emerald-400',
}

export default function AIInsights() {
  const [generating, setGenerating] = useState(false)
  const [done, setDone]             = useState(true)
  const [activeTab, setActiveTab]   = useState('strengths')

  const generate = async () => {
    setDone(false)
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 2500))
    setGenerating(false)
    setDone(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="text-purple-400" size={22} /> AI Career Insights
          </h1>
          <p className="text-sm text-dark-300 mt-1">LLM-powered analysis of your complete developer profile</p>
        </div>
        <button onClick={generate} disabled={generating} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-60">
          {generating
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
            : <><Zap size={14} /> Regenerate Insights</>
          }
        </button>
      </div>

      {generating && (
        <div className="glass-card gradient-border space-y-2">
          <p className="text-sm font-semibold text-dark-300">AI is analyzing your profile...</p>
          {['Reading 47 repositories', 'Mapping skill evidence', 'Comparing to 50K+ profiles', 'Generating personalized insights'].map((s, i) => (
            <motion.div key={s} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.5 }}
              className="flex items-center gap-2 text-xs text-dark-300"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />{s}
            </motion.div>
          ))}
        </div>
      )}

      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Summary card */}
          <div className="glass-card gradient-border bg-purple-500/5 border-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb size={17} className="text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">Profile Summary</p>
                <p className="text-sm text-dark-300 leading-relaxed">{MOCK_INSIGHTS.summary}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 glass rounded-xl w-fit">
            {[
              { key: 'strengths', label: 'Strengths',      icon: Star    },
              { key: 'gaps',      label: 'Skill Gaps',     icon: AlertTriangle },
              { key: 'path',      label: 'Learning Path',  icon: BookOpen },
              { key: 'roles',     label: 'Role Match',     icon: Target  },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === key ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-dark-300 hover:text-white'
                }`}
              >
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          {/* Strengths */}
          {activeTab === 'strengths' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {MOCK_INSIGHTS.strengths.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass-card gradient-border bg-emerald-500/3 border-emerald-500/15"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <TrendingUp size={14} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-white text-sm">{s.label}</p>
                        <span className="text-sm font-black text-emerald-400">{s.score}/100</span>
                      </div>
                      <p className="text-xs text-dark-300">{s.detail}</p>
                      <div className="mt-2 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${s.score}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Gaps */}
          {activeTab === 'gaps' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {MOCK_INSIGHTS.gaps.map((g, i) => {
                const p = PRIORITY[g.priority]
                return (
                  <motion.div key={g.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                    className={`glass-card gradient-border border ${p.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={16} className={`${p.text} shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-semibold text-white text-sm">{g.label}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize
                            ${g.priority === 'high' ? 'bg-red-500/15 text-red-300 border border-red-500/25'
                            : g.priority === 'medium' ? 'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25'
                            : 'bg-dark-600 text-dark-300 border border-white/5'}`}
                          >{g.priority} priority</span>
                        </div>
                        <p className="text-xs text-dark-300">{g.detail}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Learning Path */}
          {activeTab === 'path' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {MOCK_INSIGHTS.learningPath.map((phase, i) => {
                const pc = PHASE_COLOR[phase.color]
                return (
                  <motion.div key={phase.phase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className="glass-card gradient-border"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center shrink-0 ${pc}`}>
                        <span className="text-[10px] font-bold">Phase</span>
                        <span className="text-lg font-black leading-none">{phase.phase}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-white">{phase.title}</p>
                          <span className="text-xs text-dark-400">{phase.duration}</span>
                        </div>
                        <div className="space-y-1.5 mt-2">
                          {phase.steps.map((step, si) => (
                            <div key={si} className="flex items-center gap-2 text-xs text-dark-300">
                              <ChevronRight size={12} className="text-brand-400 shrink-0" />
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Role Match */}
          {activeTab === 'roles' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              {MOCK_INSIGHTS.suggestedRoles.map((r, i) => (
                <motion.div key={r.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="glass-card gradient-border flex items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{r.title}</p>
                    <div className="mt-1.5 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${r.match}%` }} transition={{ duration: 0.8, delay: 0.2 + i * 0.08 }}
                        className={`h-full rounded-full ${r.match >= 80 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : r.match >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xl font-black ${r.match >= 80 ? 'text-emerald-400' : r.match >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>{r.match}%</span>
                    <p className="text-[10px] text-dark-400">match</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
