import { useState, useEffect, useCallback } from 'react'
import api from '../../services/api.js'

const TYPE_LABELS = { purchase: 'Nakup', promotional: 'Promocijski', refund: 'Povračilo' }
const TYPE_COLORS = { purchase: '#60a5fa', promotional: '#a78bfa', refund: '#34d399' }
const STATUS_LABELS = { unused: 'Neporabljen', used: 'Porabljen', expired: 'Potekel' }
const STATUS_COLORS = { unused: '#fab120', used: '#34d399', expired: '#f87171' }

function Badge({ label, color }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, letterSpacing: 1,
      background: color + '22', color,
    }}>{label}</span>
  )
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('sl-SI', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function VouchersTab() {
  const [vouchers, setVouchers] = useState([])
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({ type: '', status: '', denomination: '' })
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // Generate form
  const [genForm, setGenForm] = useState({ quantity: 1, denomination: 25, send_to_email: '' })
  const [genLoading, setGenLoading] = useState(false)
  const [genResult, setGenResult] = useState(null)

  const LIMIT = 30

  const loadVouchers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (filters.type) params.set('type', filters.type)
      if (filters.status) params.set('status', filters.status)
      if (filters.denomination) params.set('denomination', filters.denomination)
      const res = await api.get(`/vouchers/admin/list?${params}`)
      setVouchers(res.data.vouchers)
      setTotal(res.data.total)
    } catch (e) { console.error(e) }
    setLoading(false)
  }, [page, filters])

  const loadStats = useCallback(async () => {
    try {
      const res = await api.get('/vouchers/admin/stats')
      setStats(res.data)
    } catch (e) { console.error(e) }
  }, [])

  useEffect(() => { loadVouchers(); loadStats() }, [loadVouchers, loadStats])

  const handleGenerate = async (e) => {
    e.preventDefault()
    setGenLoading(true)
    setGenResult(null)
    try {
      const res = await api.post('/vouchers/admin/generate', genForm)
      setGenResult(res.data.vouchers)
      loadVouchers()
      loadStats()
    } catch (err) {
      alert(err.response?.data?.error || 'Napaka pri generiranju')
    }
    setGenLoading(false)
  }

  const handleExpire = async (id) => {
    if (!confirm('Razveljavi ta voucher?')) return
    try {
      await api.patch(`/vouchers/admin/${id}/expire`)
      loadVouchers()
      loadStats()
    } catch (err) {
      alert(err.response?.data?.error || 'Napaka')
    }
  }

  const exportCsv = () => {
    const headers = ['Koda', 'Tip', 'Vrednost', 'Status', 'Izdan', 'Poteče', 'Unovčen od', 'Datum unovčitve']
    const rows = vouchers.map(v => [
      v.code,
      TYPE_LABELS[v.type] || v.type,
      `€${parseFloat(v.denomination).toFixed(2)}`,
      STATUS_LABELS[v.status] || v.status,
      fmtDate(v.issued_at),
      fmtDate(v.expires_at),
      v.redeemed_by_user ? `${v.redeemed_by_user.first_name} ${v.redeemed_by_user.last_name}` : '—',
      fmtDate(v.redeemed_at),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `odbito-vouchers-${Date.now()}.csv`; a.click()
  }

  return (
    <div style={{ padding: '0 0 40px' }}>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Skupaj', value: stats.total, color: '#aaa' },
            { label: 'Neporabljeni', value: stats.unused, color: '#fab120' },
            { label: 'Porabljeni', value: stats.used, color: '#34d399' },
            { label: 'Potekli', value: stats.expired, color: '#f87171' },
            { label: 'Vrednost (aktivni)', value: `€${parseFloat(stats.total_outstanding_value || 0).toFixed(2)}`, color: '#60a5fa' },
            { label: 'Unovčena vrednost', value: `€${parseFloat(stats.total_redeemed_value || 0).toFixed(2)}`, color: '#a78bfa' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '12px 18px', minWidth: 120 }}>
              <div style={{ fontSize: 11, color: '#666', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* LEFT: voucher list */}
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={filters.type} onChange={e => { setFilters(f => ({ ...f, type: e.target.value })); setPage(1) }}
              style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '6px 12px', fontSize: 13 }}>
              <option value=''>Vsi tipi</option>
              <option value='purchase'>Nakup</option>
              <option value='promotional'>Promocijski</option>
              <option value='refund'>Povračilo</option>
            </select>
            <select value={filters.status} onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }}
              style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '6px 12px', fontSize: 13 }}>
              <option value=''>Vsi statusi</option>
              <option value='unused'>Neporabljen</option>
              <option value='used'>Porabljen</option>
              <option value='expired'>Potekel</option>
            </select>
            <select value={filters.denomination} onChange={e => { setFilters(f => ({ ...f, denomination: e.target.value })); setPage(1) }}
              style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '6px 12px', fontSize: 13 }}>
              <option value=''>Vse vrednosti</option>
              <option value='15'>€15</option>
              <option value='25'>€25</option>
              <option value='50'>€50</option>
            </select>
            <button onClick={exportCsv} style={{ marginLeft: 'auto', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#aaa', padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}>
              ⬇ CSV
            </button>
          </div>

          {/* Table */}
          <div style={{ background: '#111', borderRadius: 12, border: '1px solid #222', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #222' }}>
                  {['Koda', 'Tip', 'Vrednost', 'Status', 'Izdan', 'Poteče', 'Unovčen od', ''].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#555' }}>Nalagam…</td></tr>
                ) : vouchers.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center', color: '#555' }}>Ni voucherjev</td></tr>
                ) : vouchers.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, color: '#fab120' }}>{v.code}</td>
                    <td style={{ padding: '10px 12px' }}><Badge label={TYPE_LABELS[v.type] || v.type} color={TYPE_COLORS[v.type] || '#aaa'} /></td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#fff' }}>€{parseFloat(v.denomination).toFixed(2)}</td>
                    <td style={{ padding: '10px 12px' }}><Badge label={STATUS_LABELS[v.status] || v.status} color={STATUS_COLORS[v.status] || '#aaa'} /></td>
                    <td style={{ padding: '10px 12px', color: '#666' }}>{fmtDate(v.issued_at)}</td>
                    <td style={{ padding: '10px 12px', color: '#666' }}>{fmtDate(v.expires_at)}</td>
                    <td style={{ padding: '10px 12px', color: '#aaa' }}>
                      {v.redeemed_by_user ? `${v.redeemed_by_user.first_name} ${v.redeemed_by_user.last_name}` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {v.status === 'unused' && (
                        <button onClick={() => handleExpire(v.id)}
                          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, color: '#f87171', padding: '3px 10px', cursor: 'pointer', fontSize: 11 }}>
                          Razveljavi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > LIMIT && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#aaa', padding: '6px 14px', cursor: 'pointer' }}>←</button>
              <span style={{ color: '#666', lineHeight: '34px', fontSize: 13 }}>Stran {page} / {Math.ceil(total / LIMIT)}</span>
              <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)}
                style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#aaa', padding: '6px 14px', cursor: 'pointer' }}>→</button>
            </div>
          )}
        </div>

        {/* RIGHT: generate form */}
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 14, padding: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#fab120', marginBottom: 16 }}>Generiraj promocijske bone</div>
          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Vrednost</label>
              <select value={genForm.denomination} onChange={e => setGenForm(f => ({ ...f, denomination: parseInt(e.target.value) }))}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '8px 12px' }}>
                <option value={15}>€15</option>
                <option value={25}>€25</option>
                <option value={50}>€50</option>
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Količina (max 100)</label>
              <input type='number' min={1} max={100} value={genForm.quantity}
                onChange={e => setGenForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '8px 12px' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#666', marginBottom: 6 }}>Pošlji na email (neobvezno)</label>
              <input type='email' value={genForm.send_to_email} placeholder='stranka@email.com'
                onChange={e => setGenForm(f => ({ ...f, send_to_email: e.target.value }))}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#fff', padding: '8px 12px' }} />
            </div>
            <button type='submit' disabled={genLoading}
              style={{ width: '100%', background: '#fab120', border: 'none', borderRadius: 8, color: '#000', padding: '10px', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {genLoading ? 'Generiram…' : `Generiraj ${genForm.quantity}× €${genForm.denomination}`}
            </button>
          </form>

          {/* Generated results */}
          {genResult && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, color: '#34d399', marginBottom: 10 }}>✅ Generirano {genResult.length} bon{genResult.length !== 1 ? 'ov' : ''}:</div>
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {genResult.map(v => (
                  <div key={v.id} style={{ background: '#1a1a1a', borderRadius: 8, padding: '8px 12px', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#fab120' }}>{v.code}</span>
                    <span style={{ fontSize: 12, color: '#aaa' }}>€{parseFloat(v.denomination).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => {
                const text = genResult.map(v => `${v.code} — €${parseFloat(v.denomination).toFixed(0)}`).join('\n')
                navigator.clipboard.writeText(text)
              }} style={{ marginTop: 8, width: '100%', background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#aaa', padding: '7px', cursor: 'pointer', fontSize: 12 }}>
                📋 Kopiraj vse kode
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
