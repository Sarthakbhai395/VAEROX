import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Ruler,
  Search,
  RefreshCw,
  User,
  ShoppingBag,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Mail,
  Phone,
  Award,
  AlertCircle
} from 'lucide-react'
import { customFitAPI } from '../../../services/api'
import { formatCurrency } from '../../../utils/format'
import { getProductImageUrl } from '../../../utils/imageUrl'

const TAILORING_STATUSES = [
  'Pending Tailoring',
  'In Tailoring',
  'Quality Check',
  'Completed'
]

const STATUS_BADGE_STYLES = {
  'Pending Tailoring': 'bg-amber-950/60 text-amber-300 border-amber-500/40',
  'In Tailoring': 'bg-sky-950/60 text-sky-300 border-sky-500/40',
  'Quality Check': 'bg-purple-950/60 text-purple-300 border-purple-500/40',
  'Completed': 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
}

const UserCustomFitManager = ({ onCountChange }) => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)
  const [feedback, setFeedback] = useState('')

  const fetchCustomFits = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      else setRefreshing(true)
      setError('')

      const token = localStorage.getItem('token')
      const res = await customFitAPI.getAdminCustomFits(token)
      if (res && res.success) {
        const list = Array.isArray(res.data) ? res.data : []
        setRecords(list)
        if (typeof onCountChange === 'function') {
          onCountChange(list.length)
        }
      } else {
        setError(res?.error || 'Failed to load custom fit orders.')
      }
    } catch (err) {
      setError('Unable to fetch custom fit records from server.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [onCountChange])

  useEffect(() => {
    fetchCustomFits(false)
    const intervalId = setInterval(() => fetchCustomFits(true), 15000)
    return () => clearInterval(intervalId)
  }, [fetchCustomFits])

  const handleStatusChange = async (recordId, newStatus) => {
    try {
      setUpdatingId(recordId)
      const token = localStorage.getItem('token')
      const res = await customFitAPI.updateTailoringStatus(recordId, newStatus, token)
      if (res && res.success && res.data) {
        setRecords((prev) =>
          prev.map((rec) => (rec._id === recordId ? res.data : rec))
        )
        setFeedback(`Tailoring status updated to "${newStatus}"`)
        setTimeout(() => setFeedback(''), 3000)
      } else {
        setError(res?.error || 'Failed to update tailoring status')
      }
    } catch (err) {
      setError('Failed to update tailoring status')
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredRecords = records.filter((rec) => {
    const matchesStatus =
      statusFilter === 'all' || rec.tailoringStatus === statusFilter

    const q = searchQuery.trim().toLowerCase()
    if (!q) return matchesStatus

    return (
      matchesStatus &&
      ((rec.customer?.name || '').toLowerCase().includes(q) ||
        (rec.customer?.email || '').toLowerCase().includes(q) ||
        (rec.customer?.phone || '').toLowerCase().includes(q) ||
        (rec.order?.orderId || '').toLowerCase().includes(q) ||
        (rec.order?.paymentId || '').toLowerCase().includes(q) ||
        (rec.product?.name || '').toLowerCase().includes(q) ||
        (rec.product?.productId || '').toLowerCase().includes(q))
    )
  })

  const pendingCount = records.filter((r) => r.tailoringStatus === 'Pending Tailoring').length
  const inProgressCount = records.filter(
    (r) => r.tailoringStatus === 'In Tailoring' || r.tailoringStatus === 'Quality Check'
  ).length
  const completedCount = records.filter((r) => r.tailoringStatus === 'Completed').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 text-[#E8E0CC]"
    >
      {/* Header Banner */}
      <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-[0.22em] font-serif flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5" />
            BESPOKE ATELIER TAILORING QUEUE
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#FFF5D6] uppercase mt-1">
            User Custom Fit
          </h2>
          <p className="text-xs text-[#A39E93] mt-1 font-light max-w-2xl">
            Verified custom body measurements submitted by customers after confirmed checkout. Each record is linked to its customer, order, and product.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchCustomFits(true)}
          disabled={refreshing}
          className="self-start lg:self-auto px-4 py-2.5 rounded-xl bg-[#121212] border border-[#C9A84C]/40 hover:border-[#C9A84C] text-[#C9A84C] hover:text-[#FFF5D6] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Records
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif block">
            Confirmed Custom Orders
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif mt-1">
            {records.length}
          </p>
          <p className="text-[10px] text-[#A39E93] mt-0.5">Paid & policy accepted</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-serif block">
            Pending Tailoring
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif mt-1">
            {pendingCount}
          </p>
          <p className="text-[10px] text-[#A39E93] mt-0.5">Awaiting pattern cut</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest font-serif block">
            In Tailoring / QC
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif mt-1">
            {inProgressCount}
          </p>
          <p className="text-[10px] text-[#A39E93] mt-0.5">Active atelier work</p>
        </div>

        <div className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-serif block">
            Completed
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#FFF5D6] font-serif mt-1">
            {completedCount}
          </p>
          <p className="text-[10px] text-[#A39E93] mt-0.5">Ready / Dispatched</p>
        </div>
      </div>

      {/* Feedback & Error Alerts */}
      {feedback && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {feedback}
        </div>
      )}

      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Search & Status Filters */}
      <div className="bg-[#0A0A0A] border border-[#26241E] rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-[#C9A84C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer, order ID, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#26241E] rounded-xl text-xs text-[#E8E0CC] focus:outline-none focus:border-[#C9A84C]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['all', ...TAILORING_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#C9A84C] text-black shadow-md'
                  : 'bg-[#121212] text-[#A39E93] border border-[#26241E] hover:border-[#C9A84C]/50 hover:text-[#FFF5D6]'
              }`}
            >
              {st === 'all' ? 'All Records' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Records List */}
      {loading ? (
        <div className="bg-[#0A0A0A] border border-[#26241E] rounded-3xl p-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-3 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-serif text-[#C9A84C] uppercase tracking-widest">
            Loading Custom Fit Records...
          </span>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-[#0A0A0A] border-2 border-dashed border-[#26241E] rounded-3xl p-12 text-center space-y-3">
          <Ruler className="w-12 h-12 text-[#C9A84C]/40 mx-auto" />
          <h3 className="text-base font-serif font-bold text-[#FFF5D6]">
            {records.length === 0
              ? 'No Confirmed Custom Fit Checkouts Yet'
              : 'No Matching Custom Fit Records'}
          </h3>
          <p className="text-xs text-[#A39E93] max-w-md mx-auto leading-relaxed">
            {records.length === 0
              ? 'Customer custom fit measurements appear here only after a customer confirms measurements, accepts the custom fit policy, and completes checkout.'
              : 'Try adjusting your search query or tailoring status filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRecords.map((rec) => {
            const m = rec.measurements || {}
            const cust = rec.customer || {}
            const ord = rec.order || {}
            const prod = rec.product || {}
            const conf = rec.confirmation || {}

            return (
              <motion.div
                key={rec._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0A0A0A] border border-[#26241E] hover:border-[#C9A84C]/50 rounded-3xl p-5 sm:p-6 shadow-2xl transition-all space-y-5"
              >
                {/* Top Meta Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#26241E]">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/50 text-[#C9A84C] text-xs font-extrabold uppercase tracking-wider">
                      ORDER #{ord.orderId}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Confirmed & Policy Accepted
                    </span>
                    <span className="text-[11px] text-[#A39E93] font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C9A84C]" />
                      {ord.orderDate ? new Date(ord.orderDate).toLocaleString() : new Date(rec.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Tailoring Status Controls */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        STATUS_BADGE_STYLES[rec.tailoringStatus] || STATUS_BADGE_STYLES['Pending Tailoring']
                      }`}
                    >
                      {rec.tailoringStatus}
                    </span>

                    <select
                      value={rec.tailoringStatus}
                      disabled={updatingId === rec._id}
                      onChange={(e) => handleStatusChange(rec._id, e.target.value)}
                      className="bg-[#121212] border border-[#26241E] focus:border-[#C9A84C] rounded-xl px-3 py-1.5 text-[11px] font-bold text-[#FFF5D6] focus:outline-none cursor-pointer disabled:opacity-50"
                      aria-label={`Update tailoring status for order ${ord.orderId}`}
                    >
                      {TAILORING_STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Main Grid: Customer + Order + Product */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  {/* 1. Customer Details */}
                  <div className="lg:col-span-4 bg-[#121212] border border-[#26241E] rounded-2xl p-4 space-y-2.5">
                    <h3 className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif flex items-center gap-1.5 border-b border-[#26241E] pb-2">
                      <User className="w-3.5 h-3.5" />
                      Customer Details
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <p className="font-bold text-[#FFF5D6] text-sm">{cust.name || 'N/A'}</p>
                      <p className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{cust.email || 'N/A'}</span>
                      </p>
                      <p className="text-[#E8E0CC] font-mono text-[11px] flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-[#C9A84C] flex-shrink-0" />
                        {cust.phone || 'N/A'}
                      </p>
                      <div className="pt-1 text-[11px] text-[#A39E93] bg-[#0A0A0A] p-2.5 rounded-xl border border-[#26241E] flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed text-[#E8E0CC]/90">
                          {cust.address || 'N/A'}
                          {cust.city ? `, ${cust.city}` : ''}
                          {cust.state ? `, ${cust.state}` : ''}
                          {cust.zipCode ? ` - ${cust.zipCode}` : ''}
                        </span>
                      </div>
                      {cust.userId && (
                        <p className="text-[10px] text-[#A39E93] font-mono pt-1">
                          Customer ID: <span className="text-[#FFF5D6]">{cust.userId._id || cust.userId}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 2. Order Details */}
                  <div className="lg:col-span-4 bg-[#121212] border border-[#26241E] rounded-2xl p-4 space-y-2.5">
                    <h3 className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif flex items-center gap-1.5 border-b border-[#26241E] pb-2">
                      <FileText className="w-3.5 h-3.5" />
                      Order Details
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between gap-2">
                        <span className="text-[#A39E93]">Order ID:</span>
                        <span className="font-mono font-bold text-[#FFF5D6]">{ord.orderId}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#A39E93]">Payment ID:</span>
                        <span className="font-mono font-bold text-emerald-400 truncate max-w-[170px]">{ord.paymentId}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#A39E93]">Payment Status:</span>
                        <span className="font-bold text-emerald-300">{ord.paymentStatus || 'Paid'}</span>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#A39E93]">Order Status:</span>
                        <span className="font-bold text-[#C9A84C]">{ord.orderStatus || 'Processing'}</span>
                      </div>
                      <div className="flex justify-between gap-2 pt-2 border-t border-[#26241E]">
                        <span className="text-[#A39E93]">Order Total:</span>
                        <span className="font-serif font-extrabold text-[#C9A84C] text-sm">
                          {formatCurrency(ord.totalAmount || 0)}
                        </span>
                      </div>
                      {conf.confirmedAt && (
                        <div className="text-[10px] text-[#A39E93] pt-1 font-mono">
                          Confirmed At: <span className="text-[#E8E0CC]">{new Date(conf.confirmedAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Product Details */}
                  <div className="lg:col-span-4 bg-[#121212] border border-[#26241E] rounded-2xl p-4 space-y-2.5">
                    <h3 className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-widest font-serif flex items-center gap-1.5 border-b border-[#26241E] pb-2">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Product Details
                    </h3>
                    <div className="flex items-start gap-3">
                      <img
                        src={getProductImageUrl(prod.image || prod.productRef?.image)}
                        alt={prod.name}
                        className="w-16 h-16 object-cover rounded-xl border border-[#26241E] bg-[#050505] flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=200&q=80'
                        }}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-serif font-bold text-xs text-[#FFF5D6] uppercase leading-snug line-clamp-2">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-[#A39E93] font-mono truncate">
                          ID: {prod.productId}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-[#C9A84C]/15 border border-[#C9A84C]/40 text-[#C9A84C] text-[9px] font-bold uppercase">
                            {prod.tier || 'standard'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#0A0A0A] border border-[#26241E] text-[#E8E0CC] text-[9px] font-bold">
                            Qty: {prod.quantity || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-[#26241E]">
                      <span className="text-[#A39E93]">Line Total:</span>
                      <span className="font-bold text-[#FFF5D6]">
                        {formatCurrency((prod.price || 0) * (prod.quantity || 1))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Customer Custom Measurements Matrix */}
                <div className="bg-gradient-to-br from-[#16130C] via-[#100E0A] to-[#0A0A0A] border border-[#C9A84C]/50 rounded-2xl p-4 sm:p-5 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#26241E]">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#C9A84C]" />
                      <h4 className="text-xs font-serif font-extrabold text-[#FFF5D6] uppercase tracking-widest">
                        Confirmed Custom Body Measurements (Inches)
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#C9A84C] text-black text-[10px] font-extrabold uppercase tracking-wider">
                      Fit: {m.fitPreference || 'Tailored Fit'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { label: 'Chest / Bust', val: m.chest },
                      { label: 'Shoulder Width', val: m.shoulder },
                      { label: 'Waist Size', val: m.waist },
                      { label: 'Thigh Size', val: m.thigh },
                      { label: 'Torso / Length', val: m.torso },
                      { label: 'Hips Size', val: m.hips }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="bg-[#0A0A0A] border border-[#2A261C] rounded-xl p-3 text-center shadow-md"
                      >
                        <span className="text-[9.5px] font-serif text-[#A39E93] uppercase tracking-wider block">
                          {item.label}
                        </span>
                        <span className="text-base sm:text-lg font-mono font-extrabold text-[#FFF5D6] mt-1 block">
                          {item.val}"
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default UserCustomFitManager

