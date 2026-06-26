import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/api/auth'
import { useNotifStore } from '@/store/notifStore'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/formatters'
import type { User } from '@/types'

const ROLE_BADGE: Record<string, 'red' | 'blue' | 'yellow' | 'green' | 'purple'> = {
  admin: 'red', analyst: 'blue', operator: 'green', manager: 'purple'
}

export function AdminPage() {
  const [tab, setTab] = useState<'users' | 'logs'>('users')
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'operator' })
  const [showForm, setShowForm] = useState(false)
  const { showToast } = useNotifStore()
  const qc = useQueryClient()

  const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: adminApi.getUsers })
  const { data: logs } = useQuery({ queryKey: ['audit-logs'], queryFn: adminApi.getAuditLogs, enabled: tab === 'logs' })

  const createMutation = useMutation({
    mutationFn: () => adminApi.createUser(newUser),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      showToast('✅ Foydalanuvchi yaratildi', 'success')
      setNewUser({ username: '', email: '', password: '', role: 'operator' })
      setShowForm(false)
    },
    onError: () => showToast('❌ Xato: foydalanuvchi yaratib bo\'lmadi', 'error'),
  })

  const toggleActive = useMutation({
    mutationFn: (user: User) => adminApi.updateUser(user.id, { is_active: !user.is_active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); showToast('✅ Holat yangilandi', 'success') },
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Admin panel</h1>
          <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Foydalanuvchilar va audit loglari</p>
        </div>
        {tab === 'users' && (
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            + Yangi foydalanuvchi
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 16 }}>
        {([['users', '👥 Foydalanuvchilar'], ['logs', '📋 Audit loglari']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{ padding: '8px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${tab === t ? 'var(--accent)' : 'var(--border)'}`, background: tab === t ? 'rgba(59,130,246,.15)' : 'var(--bg3)', color: tab === t ? 'var(--accent)' : 'var(--text2)', borderRadius: t === 'users' ? '7px 0 0 7px' : '0 7px 7px 0' }}
          >{label}</button>
        ))}
      </div>

      {showForm && tab === 'users' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16, animation: 'fadeIn .2s ease' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Yangi foydalanuvchi</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 12 }}>
            {[['username', 'Username', 'text', 'admin'], ['email', 'Email', 'email', 'admin@example.com'], ['password', 'Parol', 'password', '••••••••']].map(([key, label, type, ph]) => (
              <div key={key}>
                <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>{label}</div>
                <input type={type} placeholder={ph} value={(newUser as Record<string, string>)[key]} onChange={(e) => setNewUser({ ...newUser, [key]: e.target.value })} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none' }} />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Rol</div>
              <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 7, fontSize: 12, outline: 'none' }}>
                <option value="operator">Operator</option>
                <option value="analyst">Tahlilchi</option>
                <option value="manager">Menejer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--ok)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>✅ Saqlash</button>
            <button onClick={() => setShowForm(false)} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontSize: 12, cursor: 'pointer' }}>Bekor qilish</button>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Username','Email','Rol','Holat','Yaratilgan','Amal'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--muted)', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u: User) => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(26,39,68,.4)' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600 }}>@{u.username}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--text2)' }}>{u.email}</td>
                  <td style={{ padding: '11px 14px' }}><Badge variant={ROLE_BADGE[u.role] ?? 'gray'}>{u.role}</Badge></td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge variant={u.is_active ? 'green' : 'gray'}>{u.is_active ? 'Faol' : 'Bloklangan'}</Badge>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--muted)' }}>{formatDate(u.created_at)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <button onClick={() => toggleActive.mutate(u)} style={{ padding: '4px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: u.is_active ? 'var(--danger)' : 'var(--ok)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                      {u.is_active ? '🔒 Bloklash' : '🔓 Faollashtirish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'logs' && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Amal','Foydalanuvchi','Entity turi','IP manzil','Vaqt'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: 'var(--muted)', fontWeight: 500, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.6px', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((log: { id: number; action: string; user_id: string; entity_type: string; ip_address: string; created_at: string }) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(26,39,68,.4)' }}>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: 'rgba(59,130,246,.15)', color: 'var(--accent)', fontFamily: 'monospace' }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '11px 14px', color: 'var(--text2)' }}>{log.user_id?.slice(0, 8)}...</td>
                  <td style={{ padding: '11px 14px', color: 'var(--muted)' }}>{log.entity_type}</td>
                  <td style={{ padding: '11px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)' }}>{log.ip_address ?? '127.0.0.1'}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--muted)' }}>{formatDate(log.created_at)}</td>
                </tr>
              ))}
              {(logs ?? []).length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)', fontSize: 12 }}>Hali loglar mavjud emas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
