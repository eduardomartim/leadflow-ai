import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import {
  EmailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  ArrowRightIcon,
  UserIcon,
  BuildingIcon,
  AlertIcon,
  RefreshIcon,
} from '../dashboard/icons'
import ShaderBackground from './ShaderBackground'
import leadflowLogo from '../../assets/leadflow-logo.png'
import './AuthScreen.css'

const KNOWN_ERRORS = {
  'Invalid login credentials': 'E-mail ou senha inválidos.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
  'Signups not allowed for this instance': 'Novos cadastros estão temporariamente desativados.',
  'Anonymous sign-ins are disabled': 'O modo demonstração está temporariamente indisponível.',
  'Email rate limit exceeded': 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.',
}

// Some Supabase/GoTrue errors embed dynamic content (the email itself, a
// wait time in seconds, etc.), so an exact match against KNOWN_ERRORS isn't
// possible — these are matched by pattern instead.
const ERROR_PATTERNS = [
  [/database error/i, 'Não foi possível concluir seu cadastro. Tente novamente em instantes.'],
  [/email address .* is invalid|unable to validate email address/i, 'E-mail inválido. Verifique o endereço informado.'],
  [/password should be at least/i, 'A senha deve ter pelo menos 6 caracteres.'],
  [/failed to fetch|network ?error/i, 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.'],
  [/you can only request this after \d+ seconds/i, 'Aguarde alguns instantes antes de tentar novamente.'],
]

function translateError(message) {
  if (KNOWN_ERRORS[message]) return KNOWN_ERRORS[message]

  // Supabase/GoTrue doesn't guarantee consistent casing across versions
  // (e.g. "Email rate limit exceeded" vs "email rate limit exceeded"),
  // so fall back to a case-insensitive lookup before giving up on KNOWN_ERRORS.
  const lowerMessage = String(message).toLowerCase()
  const knownKey = Object.keys(KNOWN_ERRORS).find((key) => key.toLowerCase() === lowerMessage)
  if (knownKey) return KNOWN_ERRORS[knownKey]

  const matched = ERROR_PATTERNS.find(([pattern]) => pattern.test(message))
  return matched ? matched[1] : message
}

/** Pointer-driven 3D tilt is a nice-to-have — skip it entirely for touch devices and reduced motion. */
function supportsTilt() {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return (
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !window.matchMedia('(pointer: coarse)').matches
  )
}

const TILT_ENABLED = supportsTilt()
const TILT_MAX_DEG = 4

export default function AuthScreen() {
  const { signIn, signUp, signInDemo } = useAuth()
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [demoSubmitting, setDemoSubmitting] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const isSignUp = mode === 'signup'

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  function handleCardMouseMove(event) {
    if (!TILT_ENABLED) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = event.clientX - rect.left - rect.width / 2
    const offsetY = event.clientY - rect.top - rect.height / 2
    setTilt({
      x: (-offsetY / (rect.height / 2)) * TILT_MAX_DEG,
      y: (offsetX / (rect.width / 2)) * TILT_MAX_DEG,
    })
  }

  function handleCardMouseLeave() {
    if (!TILT_ENABLED) return
    setTilt({ x: 0, y: 0 })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (isSignUp && fullName.trim().length === 0) {
      setError('Informe seu nome completo.')
      return
    }
    if (isSignUp && companyName.trim().length === 0) {
      setError('Informe o nome da empresa.')
      return
    }

    setSubmitting(true)
    try {
      if (isSignUp) {
        const { error } = await signUp({
          email,
          password,
          fullName: fullName.trim(),
          companyName: companyName.trim(),
        })
        if (error) throw error
        setMessage('Cadastro realizado! Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.')
      } else {
        const { error } = await signIn({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDemo() {
    setError('')
    setMessage('')
    setDemoSubmitting(true)
    try {
      const { error } = await signInDemo()
      if (error) throw error
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setDemoSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <ShaderBackground className="auth-shader-canvas" />
      <div className="auth-shader-veil" aria-hidden="true" />
      <div className="auth-backdrop" aria-hidden="true">
        <div className="auth-noise" />
      </div>

      <div className="auth-card-entrance">
        <div
          className="auth-card-tilt"
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{ transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
        >
          <div className="auth-card">
            <div className="auth-brand">
              <img src={leadflowLogo} alt="LeadFlow AI" className="auth-logo" />
              <h1>{isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}</h1>
              <p>
                {isSignUp
                  ? 'Comece a organizar os leads do seu time no LeadFlow AI.'
                  : 'Entre na sua conta do LeadFlow AI para continuar.'}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              {isSignUp && (
                <label className="auth-field">
                  <span className="auth-field-label">Nome completo</span>
                  <div className="auth-input-wrap">
                    <UserIcon className="auth-input-icon" />
                    <input
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                </label>
              )}

              {isSignUp && (
                <label className="auth-field">
                  <span className="auth-field-label">Nome da empresa</span>
                  <div className="auth-input-wrap">
                    <BuildingIcon className="auth-input-icon" />
                    <input
                      type="text"
                      autoComplete="organization"
                      value={companyName}
                      onChange={(event) => setCompanyName(event.target.value)}
                      placeholder="Nome da sua empresa"
                    />
                  </div>
                </label>
              )}

              <label className="auth-field">
                <span className="auth-field-label">E-mail</span>
                <div className="auth-input-wrap">
                  <EmailIcon className="auth-input-icon" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="voce@empresa.com"
                    required
                  />
                </div>
              </label>

              <label className="auth-field">
                <span className="auth-field-label">Senha</span>
                <div className="auth-input-wrap auth-input-wrap-password">
                  <LockIcon className="auth-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </label>

              {error && (
                <p className="auth-error">
                  <AlertIcon />
                  <span>{error}</span>
                </p>
              )}
              {message && <p className="auth-message">{message}</p>}

              <button type="submit" className="auth-submit" disabled={submitting}>
                {submitting ? (
                  <RefreshIcon className="auth-submit-spinner" />
                ) : (
                  <>
                    {isSignUp ? 'Criar conta' : 'Entrar'}
                    <ArrowRightIcon className="auth-submit-arrow" />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>ou</span>
            </div>

            <button
              type="button"
              className="auth-demo-btn"
              onClick={handleDemo}
              disabled={submitting || demoSubmitting}
            >
              {demoSubmitting ? 'Entrando…' : 'Explorar demonstração'}
            </button>

            <p className="auth-switch">
              {isSignUp ? (
                <>
                  Já tem uma conta?{' '}
                  <button type="button" onClick={() => switchMode('login')}>
                    Entrar
                  </button>
                </>
              ) : (
                <>
                  Não tem uma conta?{' '}
                  <button type="button" onClick={() => switchMode('signup')}>
                    Criar conta
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
