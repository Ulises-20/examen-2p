import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import './registro.css'

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', apellidos: '', email: '', twitter: '', ocupacion: '', avatar: '' })
  const [accepted, setAccepted] = useState(false)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!accepted) {
      alert('Debe aceptar los términos y condiciones')
      return
    }
    setSaving(true)
    try {
      // send empty avatar if user left it blank -> server/frontend will provide fallback
      await api.post('/registro', { ...form, acepto: accepted })
      navigate('/participantes')
    } catch (err) {
      console.error(err)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container py-3">
      <h2 className="mb-3">Registro de Participante</h2>
      <form onSubmit={onSubmit} className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label">Nombre
            <input name="nombre" value={form.nombre} onChange={onChange} required className="form-control" />
          </label>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Apellidos
            <input name="apellidos" value={form.apellidos} onChange={onChange} required className="form-control" />
          </label>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Email
            <input type="email" name="email" value={form.email} onChange={onChange} required className="form-control" />
          </label>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Usuario en Twitter
            <input name="twitter" value={form.twitter} onChange={onChange} className="form-control" />
          </label>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Ocupación
            <input name="ocupacion" value={form.ocupacion} onChange={onChange} className="form-control" />
          </label>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Avatar (URL)
            <input name="avatar" value={form.avatar} onChange={onChange} placeholder="https://... (opcional)" className="form-control" />
          </label>
        </div>
        <div className="col-12">
          <div className="form-check">
            <input className="form-check-input" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} id="terms" />
            <label className="form-check-label" htmlFor="terms">Acepto términos y condiciones</label>
          </div>
        </div>
        <div className="col-12">
          <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  )
}
