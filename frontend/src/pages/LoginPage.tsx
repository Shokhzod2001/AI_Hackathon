import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  username: z.string().min(1, 'Username kiriting'),
  password: z.string().min(1, 'Parol kiriting'),
})
type FormData = z.infer<typeof schema>

export function LoginPage() {
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await login(data.username, data.password)
      navigate('/dashboard')
    } catch {
      setError("Username yoki parol noto'g'ri")
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border2)', borderRadius: 'var(--radius)', padding: 32, width: 380, boxShadow: '0 24px 64px rgba(0,0,0,.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🛡</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>NarkoMonitor</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Monitoring tizimiga kirish</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Username</div>
            <input
              {...register('username')}
              style={{ width: '100%', background: 'var(--bg2)', border: `1px solid ${errors.username ? 'var(--danger)' : 'var(--border)'}`, color: 'var(--text)', padding: '10px 12px', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }}
              placeholder="admin"
              autoComplete="username"
            />
            {errors.username && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errors.username.message}</div>}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.5px', fontWeight: 600 }}>Parol</div>
            <input
              {...register('password')}
              type="password"
              style={{ width: '100%', background: 'var(--bg2)', border: `1px solid ${errors.password ? 'var(--danger)' : 'var(--border)'}`, color: 'var(--text)', padding: '10px 12px', borderRadius: 7, fontSize: 13, outline: 'none', fontFamily: 'var(--font)' }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{errors.password.message}</div>}
          </div>

          {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,.1)', borderRadius: 7 }}>{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '11px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? .7 : 1 }}
          >
            {isSubmitting ? 'Kirish...' : 'Kirish'}
          </button>
        </form>
      </div>
    </div>
  )
}
