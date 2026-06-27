import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/store/authStore'
import { useLangStore, type Lang } from '@/store/langStore'
import { useT } from '@/lib/i18n'
import { Shield, Eye, EyeOff } from 'lucide-react'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

export function LoginPage() {
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const { login } = useAuthStore()
  const { lang, setLang } = useLangStore()
  const navigate = useNavigate()
  const t = useT()

  const schema = z.object({
    username: z.string().min(1, t('login.username_req')),
    password: z.string().min(1, t('login.password_req')),
  })
  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await login(data.username, data.password)
      navigate('/dashboard')
    } catch {
      setError(t('login.wrong_creds'))
    }
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: '100%',
    background: 'var(--surface)',
    border: `1.5px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 8,
    color: 'var(--text)',
    padding: '10px 14px',
    fontSize: 14,
    fontFamily: 'var(--font-head)',
    outline: 'none',
    transition: 'border-color .15s',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Language switcher top right */}
      <div style={{ position: 'fixed', top: 20, right: 24, display: 'flex', gap: 4 }}>
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            style={{
              fontSize: 11, fontWeight: 700,
              padding: '5px 10px', border: '1px solid var(--border)', borderRadius: 6,
              background: lang === code ? 'var(--primary)' : 'var(--surface)',
              color: lang === code ? '#fff' : 'var(--text2)',
              cursor: 'pointer', letterSpacing: '1px',
              transition: 'all .15s',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'var(--surface)',
        borderRadius: 16,
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)',
        padding: '40px 40px 36px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 6px 20px rgba(78,115,223,0.35)',
          }}>
            <Shield size={28} color="#fff" />
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>CLEARNET</div>
          <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>
            {t('login.subtitle')}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'block', marginBottom: 7,
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.8px', color: 'var(--text2)',
            }}>
              {t('login.username')}
            </label>
            <input
              {...register('username')}
              style={inputStyle(!!errors.username)}
              placeholder="admin"
              autoComplete="username"
              onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--primary)' }}
              onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = errors.username ? 'var(--danger)' : 'var(--border)' }}
            />
            {errors.username && (
              <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 5, fontWeight: 500 }}>
                {errors.username.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block', marginBottom: 7,
              fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '.8px', color: 'var(--text2)',
            }}>
              {t('login.password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                style={{ ...inputStyle(!!errors.password), paddingRight: 44 }}
                placeholder="••••••••"
                autoComplete="current-password"
                onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--primary)' }}
                onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = errors.password ? 'var(--danger)' : 'var(--border)' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: 'var(--text2)', padding: 0, display: 'flex',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 5, fontWeight: 500 }}>
                {errors.password.message}
              </div>
            )}
          </div>

          {error && (
            <div style={{
              fontSize: 13, color: 'var(--danger)', fontWeight: 500,
              padding: '10px 14px', borderRadius: 8,
              background: 'var(--danger-bg)',
              marginBottom: 20,
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '12px',
              border: 'none', borderRadius: 8,
              background: isSubmitting ? 'var(--text2)' : 'var(--primary)',
              color: '#fff',
              fontSize: 14, fontWeight: 700,
              letterSpacing: '.5px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'opacity .15s, background .15s',
              boxShadow: '0 4px 14px rgba(78,115,223,0.35)',
            }}
            onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary2)' }}
            onMouseLeave={(e) => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary)' }}
          >
            {isSubmitting ? t('login.logging_in') : t('login.login')}
          </button>
        </form>

        {/* Footer info */}
        <div style={{
          marginTop: 28, paddingTop: 20, borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'center', gap: 20,
          fontSize: 11, color: 'var(--text2)', fontWeight: 500,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 2.5s infinite' }} />
            SYSTEM: ONLINE
          </span>
          <span>NLP: mBERT v3.2</span>
          <span>CLEARNET v2.0</span>
        </div>
      </div>
    </div>
  )
}
