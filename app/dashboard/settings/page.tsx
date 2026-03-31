'use client'
import { useState, useEffect } from 'react'
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
    setPwMsg(error ? error.message : '✓ Passwort geändert!')
    setNewPassword('')
    setPwSaving(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 13px', borderRadius: 9, fontSize: 14, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text1)', outline: 'none', fontFamily: 'inherit' }
  const isPro = profile?.plan_id === 'pro'

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
      <h1 style={{ fontWeight: 900, fontSize: 22, marginBottom: 28 }}>⚙️ Einstellungen</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>

        {/* Plan Info */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Dein Plan</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: isPro ? '#a4bbfd' : 'var(--text1)' }}>
                {isPro ? '⭐ Pro' : 'Free'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>
                {isPro ? 'Alle Features freigeschaltet' : 'Bis zu 3 Websites · Basic Features'}
              </div>
            </div>
            {!isPro && (
              <a href="/dashboard/upgrade" style={{ padding: '10px 20px', borderRadius: 9, background: 'linear-gradient(135deg, #5b6af6, #4346eb)', color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 14px rgba(91,106,246,0.3)' }}>
                Upgrade →
              </a>
            )}
          </div>
        </div>

        {/* Profile */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Profil</h2>
          <form onSubmit={saveName}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Name</label>
              <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>E-Mail</label>
              <input style={{ ...inputStyle, opacity: 0.5 }} value={user?.email || ''} disabled />
            </div>
            <button type="submit" disabled={saving} style={{ padding: '10px 24px', borderRadius: 9, background: saved ? '#22c55e' : '#5b6af6', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit', transition: 'background .3s' }}>
              {saved ? '✓ Gespeichert' : saving ? 'Speichern…' : 'Profil speichern'}
            </button>
          </form>
        </div>

        {/* Password */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 16, marginBottom: 16 }}>Passwort ändern</h2>
          <form onSubmit={savePassword}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 6 }}>Neues Passwort</label>
              <input type="password" style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mindestens 8 Zeichen" minLength={8} />
            </div>
            {pwMsg && <div style={{ fontSize: 13, color: pwMsg.startsWith('✓') ? '#22c55e' : '#ef4444', marginBottom: 14 }}>{pwMsg}</div>}
            <button type="submit" disabled={pwSaving} style={{ padding: '10px 24px', borderRadius: 9, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text1)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
              {pwSaving ? 'Ändern…' : 'Passwort ändern'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 16, marginBottom: 6, color: '#ef4444' }}>Abmelden</h2>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Aus deinem Konto abmelden.</p>
          <button onClick={handleLogout} style={{ padding: '10px 24px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
            Abmelden
          </button>
        </div>

      </div>
    </div>
  )
}
