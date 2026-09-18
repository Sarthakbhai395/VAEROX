import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, CheckCircle, ArrowUp, ArrowDown, RefreshCw, HelpCircle, Save, X } from 'lucide-react'
import { getFaqs, saveFaqs, resetFaqsToDefault } from '../../../utils/faqStorage'

export const FAQManager = () => {
  const [faqs, setFaqs] = useState(getFaqs())
  const [editingId, setEditingId] = useState(null)
  const [editQ, setEditQ] = useState('')
  const [editA, setEditA] = useState('')
  const [newQ, setNewQ] = useState('')
  const [newA, setNewA] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const handleUpdate = () => setFaqs(getFaqs())
    window.addEventListener('vaerox_faqs_updated', handleUpdate)
    return () => window.removeEventListener('vaerox_faqs_updated', handleUpdate)
  }, [])

  const notify = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 3000)
  }

  const handleAddFaq = (e) => {
    e.preventDefault()
    if (!newQ.trim() || !newA.trim()) return
    const newItem = {
      id: `faq-${Date.now()}`,
      q: newQ.trim(),
      a: newA.trim()
    }
    const updated = [...faqs, newItem]
    setFaqs(updated)
    saveFaqs(updated)
    setNewQ('')
    setNewA('')
    setShowAddModal(false)
    notify('New FAQ added successfully!')
  }

  const handleStartEdit = (item) => {
    setEditingId(item.id)
    setEditQ(item.q)
    setEditA(item.a)
  }

  const handleSaveEdit = (id) => {
    if (!editQ.trim() || !editA.trim()) return
    const updated = faqs.map((f) => (f.id === id ? { ...f, q: editQ.trim(), a: editA.trim() } : f))
    setFaqs(updated)
    saveFaqs(updated)
    setEditingId(null)
    notify('FAQ updated successfully!')
  }

  const handleDeleteFaq = (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      const updated = faqs.filter((f) => f.id !== id)
      setFaqs(updated)
      saveFaqs(updated)
      notify('FAQ deleted!')
    }
  }

  const handleMove = (index, direction) => {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= faqs.length) return
    const updated = [...faqs]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setFaqs(updated)
    saveFaqs(updated)
    notify('FAQ order updated!')
  }

  const handleResetDefaults = () => {
    if (window.confirm('Reset all FAQs to default list?')) {
      const defaults = resetFaqsToDefault()
      setFaqs(defaults)
      notify('FAQs reset to default!')
    }
  }

  return (
    <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#E8E0CC] space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#26241E] pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest block font-serif">
            DYNAMIC CONTENT MANAGEMENT
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF5D6] uppercase">
            Manage Website FAQs
          </h2>
          <p className="text-[#A39E93] text-xs mt-1 font-light">
            Add, edit, reorder, or delete Frequently Asked Questions displayed on the Homepage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-bold text-black bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] hover:scale-105 px-4 py-2.5 rounded-xl transition duration-200 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus size={16} />
            Add New FAQ
          </button>

          <button
            onClick={handleResetDefaults}
            className="text-xs font-bold text-[#C9A84C] bg-[#C9A84C]/10 border border-[#C9A84C]/30 hover:bg-[#C9A84C]/20 px-3 py-2.5 rounded-xl transition duration-200 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            Reset Defaults
          </button>
        </div>
      </div>

      {msg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle size={16} />
          <span>{msg}</span>
        </motion.div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#121212] border border-[#C9A84C]/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-[#26241E] pb-3">
                <h3 className="font-serif font-bold text-[#FFF5D6] text-lg uppercase">
                  Add New FAQ
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-[#A39E93] hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddFaq} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    required
                    value={newQ}
                    onChange={(e) => setNewQ(e.target.value)}
                    placeholder="Enter question title..."
                    className="w-full px-3.5 py-2.5 text-xs border border-[#26241E] rounded-xl bg-[#0A0A0A] text-[#FFF5D6] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#C9A84C] uppercase tracking-wider mb-1">
                    Answer
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newA}
                    onChange={(e) => setNewA(e.target.value)}
                    placeholder="Enter detailed answer..."
                    className="w-full px-3.5 py-2.5 text-xs border border-[#26241E] rounded-xl bg-[#0A0A0A] text-[#FFF5D6] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-black border border-[#26241E] text-xs font-bold text-[#A39E93] uppercase hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FFF5D6] via-[#C9A84C] to-[#9B782B] text-black font-extrabold text-xs uppercase tracking-wider hover:scale-105 transition-transform"
                  >
                    Save FAQ
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((item, index) => {
          const isEditing = editingId === item.id

          return (
            <div
              key={item.id || index}
              className="bg-[#121212] border border-[#26241E] hover:border-[#C9A84C]/40 rounded-2xl p-5 transition-all shadow-lg space-y-3"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-[#C9A84C] uppercase mb-1">
                      Edit Question
                    </label>
                    <input
                      type="text"
                      value={editQ}
                      onChange={(e) => setEditQ(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#26241E] rounded-xl bg-[#0A0A0A] text-[#FFF5D6] focus:border-[#C9A84C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-[#C9A84C] uppercase mb-1">
                      Edit Answer
                    </label>
                    <textarea
                      rows={3}
                      value={editA}
                      onChange={(e) => setEditA(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#26241E] rounded-xl bg-[#0A0A0A] text-[#FFF5D6] focus:border-[#C9A84C]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg bg-black border border-[#26241E] text-xs font-bold uppercase text-[#A39E93]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="px-4 py-1.5 rounded-lg bg-[#C9A84C] text-black font-extrabold text-xs uppercase flex items-center gap-1"
                    >
                      <Save size={13} />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-[#C9A84C] bg-black px-2 py-0.5 rounded border border-[#26241E]">
                        #{index + 1}
                      </span>
                      <h4 className="font-serif font-bold text-[#FFF5D6] text-sm sm:text-base">
                        {item.q}
                      </h4>
                    </div>
                    <p className="text-xs text-[#A39E93] font-light leading-relaxed pl-8">
                      {item.a}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="p-1.5 rounded-lg bg-black border border-[#26241E] text-[#A39E93] hover:text-[#C9A84C] disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => handleMove(index, 1)}
                      disabled={index === faqs.length - 1}
                      className="p-1.5 rounded-lg bg-black border border-[#26241E] text-[#A39E93] hover:text-[#C9A84C] disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => handleStartEdit(item)}
                      className="p-1.5 rounded-lg bg-black border border-[#26241E] text-[#C9A84C] hover:bg-[#C9A84C]/20 cursor-pointer"
                      title="Edit FAQ"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(item.id)}
                      className="p-1.5 rounded-lg bg-black border border-[#26241E] text-rose-400 hover:bg-rose-950/40 cursor-pointer"
                      title="Delete FAQ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FAQManager
