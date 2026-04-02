'use client'
import { useState, useEffect } from 'react'
import { Settings, Star, User, Lock, CreditCard, LogOut, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => { loadUser() }, [])

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const { data } = await supabase.from('profiles').select('*, plans(*)').eq('id', user.id).single()
      setProfile(data)
      setName(data?.full_name || user.user_metadata?.full_name || '')
    }
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('profiles').update({ full_name: name, updated_at: new Date().toISOString() }).eq('id', user.id)
    await supabase.auth.updateUser({ data: { full_name: name } })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) { setPwMsg('Mindestens 8 Zeichen.'); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwMsg(error ? error.message : 'Passwort erfolgreich geändert!')
    setNewPassword('')
    setPwSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 13px', borderRadius: 9, fontSize: 14,
    background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)',
    outline: 'none', fontFamily: 'inherit',
  }
  const isPro = profile?.plan_id === 'pro'
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'
  const planEndsAt = profile?.plan_ends_at

  async function openPortal() {
    const r = await fetch('/api/stripe/portal', { method: 'POST' })
    const d = await r.json()
    if (d.url) window.location.href = d.url
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
        <Settings size={20} color="var(--text2)" />
        <h1 style={{ fontWeight: 900, fontSize: 22 }}>Einstellungen</h1>
      </div>

      {/* 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Profile Card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={14} color="var(--text2)" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Profil</span>
            </div>

            {/* Avatar area */}
            <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                background: 'linear-gradient(135deg, #5b6af6, #a78bfa)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 22, color: '#fff', flexShrink: 0,
              }}>
                {firstName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{name || firstName}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{user?.email}</div>
              </div>
            </div>

            <form onSubmit={saveName} style={{ padding: '0 20px 20px' }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Name</label>
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>E-Mail</label>
                <input style={{ ...inputStyle, opacity: 0.5 }} value={user?.email || ''} disabled />
              </div>
              <button type="submit" disabled={saving} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 9,
                background: saved ? '#22c55e' : '#5b6af6',
                color: '#fff', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 14, fontFamily: 'inherit', transition: 'background .3s',
              }}>
                {saved ? <><Check size={14} /> Gespeichert</> : saving ? 'Speichern…' : 'Profil speichern'}
              </button>
            </form>
          </div>

          {/* Password Card */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={14} color="var(--text2)" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Passwort ändern</span>
            </div>
            <form onSubmit={savePassword} style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Neues Passwort</label>
                <input type="password" style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mindestens 8 Zeichen" minLength={8} />
              </div>
              {pwMsg && (
                <div style={{
                  padding: '9px 13px', borderRadius: 8, fontSize: 13, marginBottom: 14,
                  background: pwMsg.startsWith('Passwort erfolgreich') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${pwMsg.startsWith('Passwort erfolgreich') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  color: pwMsg.startsWith('Passwort erfolgreich') ? '#22c55e' : '#ef4444',
                }}>
                  {pwMsg}
                </div>
              )}
              <button type="submit" disabled={pwSaving} style={{
                padding: '10px 20px', borderRadius: 9,
                background: 'var(--bg)', border: '1px solid var(--border)',
                color: 'var(--text1)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
              }}>
                {pwSaving ? 'Ändern…' : 'Passwort ändern'}
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Plan Card */}
          <div style={{ background: isPro ? 'rgba(91,106,246,0.06)' : 'var(--surface)', border: isPro ? '1px solid rgba(91,106,246,0.3)' : '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: isPro ? '1px solid rgba(91,106,246,0.15)' : '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CreditCard size={14} color="var(--text2)" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Dein Plan</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 14, fontWeight: 800,
                  background: isPro ? 'rgba(91,106,246,0.12)' : 'var(--bg)',
                  border: isPro ? '1px solid rgba(91,106,246,0.3)' : '1px solid var(--border)',
                  color: isPro ? '#a4bbfd' : 'var(--text1)',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {isPro && <Star size={12} fill="#a4bbfd" color="#a4bbfd" />}
                  {isPro ? 'Pro' : 'Free'}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text3)' }}>
                  {isPro ? 'Alle Features freigeschaltet' : 'Basis-Features'}
                </span>
              </div>

              {isPro ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {['Unbegrenzte Websites', 'Blog, Changelog & Support', 'Vollständige Analytics', 'Bis zu 5 Teammitglieder'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                      <Check size={13} color="#22c55e" />
                      {f}
                    </div>
                  ))}
                  {planEndsAt && (
                    <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 12, color: '#f59e0b' }}>
                      Pro läuft bis {new Date(planEndsAt).toLocaleDateString('de-DE')}
                    </div>
                  )}
                  <button onClick={openPortal} style={{
                    marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '10px 20px', borderRadius: 9, border: '1px solid var(--border)',
                    background: 'var(--bg)', color: 'var(--text2)', cursor: 'pointer',
                    fontWeight: 600, fontSize: 13, fontFamily: 'inherit',
                  }}>
                    Abo verwalten →
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
                    {['Bis zu 3 Websites', 'Dashboard & Todos', 'Basic Analytics'].map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text2)' }}>
                        <Check size={13} color="#22c55e" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <a href="/dashboard/upgrade" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '11px 20px', borderRadius: 9,
                    background: 'linear-gradient(135deg, #5b6af6, #4346eb)',
                    color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14,
                    boxShadow: '0 4px 14px rgba(91,106,246,0.3)',
                  }}>
                    <Star size={13} fill="#fff" color="#fff" />
                    Upgrade auf Pro
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={14} color="var(--text2)" />
              <span style={{ fontWeight: 700, fontSize: 14 }}>Account</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text3)' }}>User-ID</span>
                  <span style={{ color: 'var(--text2)', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>{user?.id?.slice(0, 12)}…</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text3)' }}>Erstellt am</span>
                  <span style={{ color: 'var(--text2)', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('de-DE') : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: 'var(--text3)' }}>Plan</span>
                  <span style={{ color: isPro ? '#a4bbfd' : 'var(--text2)', fontWeight: 600, fontSize: 12 }}>{isPro ? 'Pro' : 'Free'}</span>
                </div>
              </div>

              <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>Aus deinem Konto abmelden.</div>
                <button onClick={handleLogout} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 9,
                  border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)',
                  color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit',
                }}>
                  <LogOut size={13} /> Abmelden
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
