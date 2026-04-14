import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function translateError(msg) {
  if (msg.includes('Invalid login') || msg.includes('invalid_credentials')) return 'Email ou senha incorretos.'
  if (msg.includes('already registered') || msg.includes('already been registered')) return 'Este email já está cadastrado.'
  if (msg.includes('Password should be')) return 'A senha deve ter pelo menos 6 caracteres.'
  if (msg.includes('valid email')) return 'Informe um email válido.'
  return 'Ocorreu um erro. Tente novamente.'
}

export function Login() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const switchTab = (t) => { setTab(t); setError(''); setSuccess('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error: authError } = tab === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)

    if (authError) {
      setError(translateError(authError.message))
    } else if (tab === 'register') {
      setSuccess('Conta criada! Verifique seu email para confirmar o cadastro.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-pitch rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Futsal Stats</h1>
          <p className="text-slate-400 text-sm mt-1">Gestão completa do seu time</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-slate-800 border border-slate-700 p-1 mb-6">
          {[{ id: 'login', label: 'Entrar' }, { id: 'register', label: 'Criar conta' }].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
            {tab === 'register' && (
              <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres</p>
            )}
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg px-3 py-2">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full justify-center py-3 text-base"
            disabled={loading}
          >
            {loading ? 'Aguarde...' : tab === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <p className="text-xs text-slate-600 text-center mt-6">
          Seus dados ficam seguros na nuvem e acessíveis em qualquer dispositivo.
        </p>
      </div>
    </div>
  )
}
