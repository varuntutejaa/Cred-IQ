import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookMarked, Plus, Trash2, X, CheckCircle, Zap, Star, FolderOpen } from 'lucide-react'
import toast from 'react-hot-toast'

const INITIAL_LISTS = [
  {
    id: 1,
    name: 'Frontend Leads',
    color: '#6366f1',
    candidates: [
      { id: 1, name: 'Varun T.',  handle: 'varun-dev', trust: 87, builder: 94, color: '#6366f1', verified: true  },
      { id: 2, name: 'Priya S.',  handle: 'priya-dev', trust: 79, builder: 81, color: '#10b981', verified: true  },
    ],
  },
  {
    id: 2,
    name: 'Backend Engineers',
    color: '#f59e0b',
    candidates: [
      { id: 3, name: 'Arjun M.', handle: 'arjunm',    trust: 91, builder: 88, color: '#f59e0b', verified: true  },
      { id: 4, name: 'Rohan K.', handle: 'rohanK',    trust: 83, builder: 85, color: '#06b6d4', verified: true  },
      { id: 5, name: 'Dev P.',   handle: 'devpatel',  trust: 92, builder: 91, color: '#f97316', verified: true  },
    ],
  },
  {
    id: 3,
    name: 'ML / AI Pool',
    color: '#ec4899',
    candidates: [
      { id: 6, name: 'Sneha R.', handle: 'snehadev',  trust: 74, builder: 72, color: '#ec4899', verified: false },
    ],
  },
]

const LIST_COLORS = ['#6366f1','#8b5cf6','#f59e0b','#10b981','#06b6d4','#ec4899','#f97316']

export default function Shortlists() {
  const [lists,        setLists]      = useState(INITIAL_LISTS)
  const [activeList,   setActiveList] = useState(1)
  const [showNewForm,  setNewForm]    = useState(false)
  const [newName,      setNewName]    = useState('')

  const current = lists.find((l) => l.id === activeList)

  const createList = () => {
    if (!newName.trim()) return
    const id = Date.now()
    setLists((prev) => [...prev, { id, name: newName.trim(), color: LIST_COLORS[lists.length % LIST_COLORS.length], candidates: [] }])
    setActiveList(id)
    setNewName('')
    setNewForm(false)
    toast.success(`Created "${newName.trim()}"`)
  }

  const deleteList = (id) => {
    setLists((prev) => prev.filter((l) => l.id !== id))
    if (activeList === id) setActiveList(lists[0]?.id)
    toast.success('List deleted')
  }

  const removeCandidate = (cid) => {
    setLists((prev) => prev.map((l) => l.id === activeList ? { ...l, candidates: l.candidates.filter((c) => c.id !== cid) } : l))
    toast.success('Removed from shortlist')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><BookMarked size={20} className="text-yellow-400" /> Shortlists</h1>
          <p className="text-sm text-dark-300 mt-1">Organise candidates into custom shortlists</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setNewForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-brand-500 text-white font-semibold rounded-xl px-4 py-2.5 text-sm shadow-glow"
        >
          <Plus size={14} /> New List
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* List sidebar */}
        <div className="space-y-1.5">
          {lists.map((l) => (
            <button key={l.id} onClick={() => setActiveList(l.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${activeList === l.id ? 'bg-white/8 border border-white/12' : 'hover:bg-white/4 border border-transparent'}`}
            >
              <FolderOpen size={14} style={{ color: l.color }} className="shrink-0" />
              <span className="text-sm font-medium text-white flex-1 truncate">{l.name}</span>
              <span className="text-[10px] text-dark-500 shrink-0">{l.candidates.length}</span>
            </button>
          ))}

          {/* New list form */}
          <AnimatePresence>
            {showNewForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="glass rounded-xl p-2.5 border border-white/8 mt-1">
                  <input type="text" placeholder="List name..." value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createList()}
                    autoFocus className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-dark-500 focus:outline-none focus:border-brand-500/60 transition-all"
                  />
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={createList} className="flex-1 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 text-xs font-medium hover:bg-brand-500/30 transition-all">Create</button>
                    <button onClick={() => setNewForm(false)} className="p-1.5 rounded-lg hover:bg-white/5 text-dark-400 hover:text-white transition-all"><X size={12} /></button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* List content */}
        <div className="lg:col-span-3">
          {current ? (
            <div className="glass-card gradient-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: current.color + '20' }}>
                    <BookMarked size={15} style={{ color: current.color }} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">{current.name}</h2>
                    <p className="text-[10px] text-dark-400">{current.candidates.length} candidates</p>
                  </div>
                </div>
                <button onClick={() => deleteList(current.id)} className="p-2 rounded-xl hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>

              {current.candidates.length === 0 ? (
                <div className="text-center py-12">
                  <BookMarked size={32} className="mx-auto text-dark-600 mb-2" />
                  <p className="text-sm text-dark-400">No candidates in this list yet</p>
                  <p className="text-xs text-dark-500 mt-1">Add candidates from Search or Quick Verify</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {current.candidates.map((c, i) => (
                      <motion.div key={c.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 glass rounded-xl border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0" style={{ background: c.color + '25', color: c.color }}>
                          {c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-white">{c.name}</p>
                            {c.verified && <CheckCircle size={11} className="text-emerald-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] font-mono" style={{ color: c.color }}>@{c.handle}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                          <div className="text-center">
                            <p className="text-sm font-black" style={{ color: c.color }}>{c.trust}</p>
                            <p className="text-[9px] text-dark-500">Trust</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-emerald-400">{c.builder}%</p>
                            <p className="text-[9px] text-dark-500">Builder</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button className="p-2 rounded-xl glass border border-white/8 text-dark-400 hover:text-brand-300 hover:border-brand-500/25 transition-all">
                            <Zap size={12} />
                          </button>
                          <button onClick={() => removeCandidate(c.id)} className="p-2 rounded-xl glass border border-white/8 text-dark-400 hover:text-red-400 hover:border-red-500/25 transition-all">
                            <X size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card gradient-border text-center py-16">
              <Star size={36} className="mx-auto text-dark-600 mb-3" />
              <p className="text-sm text-dark-400">Select or create a shortlist</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
