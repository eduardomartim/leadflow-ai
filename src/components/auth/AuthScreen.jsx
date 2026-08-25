import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.js'
import './AuthScreen.css'

const KNOWN_ERRORS = {
  'Invalid login credentials': 'E-mail ou senha inválidos.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
}

function translateError(message) {
  if (KNOWN_ERRORS[message]) return KNOWN_ERRORS[message]
  if (/database error/i.test(message)) {
    return 'Não foi possível concluir seu cadastro. Tente novamente em instantes.'
  }
  return message
}

export default function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isSignUp = mode === 'signup'

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setMessage('')
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

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo">LF</span>
          <h1>LeadFlow AI</h1>
          <p>Gestão inteligente de leads para o seu time.</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={!isSignUp ? 'active' : ''}
            onClick={() => switchMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={isSignUp ? 'active' : ''}
            onClick={() => switchMode('signup')}
          >
            Criar conta
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <label className="auth-field">
              <span>Nome completo</span>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Seu nome completo"
                required
              />
            </label>
          )}

          {isSignUp && (
            <label className="auth-field">
              <span>Nome da empresa</span>
              <input
                type="text"
                autoComplete="organization"
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
                placeholder="Nome da sua empresa"
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@empresa.com"
              required
            />
          </label>

          <label className="auth-field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              minLength={6}
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Aguarde…' : isSignUp ? 'Criar conta' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
