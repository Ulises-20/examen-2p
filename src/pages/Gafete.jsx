import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api'
import { avatarUrl } from '../utils/avatar'
import './gafete.css'

export default function Gafete() {
  const { id } = useParams()
  const [p, setP] = useState(null)
  const [loading, setLoading] = useState(true)
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const f = async () => {
      try {
        const res = await api.get(`/participante/${id}`)
        setP(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    f()
  }, [id])

  if (loading) return <p>Cargando gafete...</p>
  if (!p) return <p>Participante no encontrado.</p>

  return (
    <div className="container py-4">
      <div className="d-flex flex-column align-items-center">
        <div className="gafete-wrapper mb-3">
          <div className={`gafete-card ${flipped ? 'flipped' : ''}`}>
            <div className="gafete-face front">
              <div className="front-top text-center">
                <img src={avatarUrl(p)} alt="avatar" className="avatar-large mb-3" onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png' }} />
                <h3 className="mb-0">{p.nombre} {p.apellidos}</h3>
                <p className="muted mb-0">{p.ocupacion}</p>
              </div>
              <div className="front-bottom mt-3 text-center">
                <p className="mb-1 small">{p.email}</p>
                <p className="mb-0">@{p.twitter}</p>
              </div>
            </div>
            <div className="gafete-face back">
              <div className="back-content p-3">
                <h5 className="mb-2">Información</h5>
                <p className="small text-muted mb-2">ID: {p.id}</p>
                <p className="small mb-2">Ocupación: {p.ocupacion}</p>
                <p className="small mb-2">Email: {p.email}</p>
                <hr />
                <p className="small">Este gafete pertenece al Congreso TICs - Universidad Tecnológica de León.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="btn btn-outline-secondary me-2" onClick={() => setFlipped((s) => !s)}>{flipped ? 'Ver Frente' : 'Ver Reverso'}</button>
          <a className="btn btn-primary" href={`https://twitter.com/${p.twitter}`} target="_blank" rel="noreferrer">Ver en Twitter</a>
        </div>
      </div>
    </div>
  )
}
