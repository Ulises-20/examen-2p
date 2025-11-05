import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api'
import { avatarUrl } from '../utils/avatar'
import './participantes.css'

export default function Participantes() {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('search') || ''

  useEffect(() => {
    setLoading(true)
    const fetchList = async () => {
      try {
        const url = q ? `/listado?q=${encodeURIComponent(q)}` : '/listado'
        const res = await api.get(url)
        setParticipants(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchList()
  }, [q])

  const onSearch = (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const val = form.get('q') || ''
    if (val) setSearchParams({ search: val })
    else setSearchParams({})
  }

  return (
    <div className="container py-3">
      <div className="d-flex align-items-center mb-3">
        <img src="/nuestrastic.png" alt="Nuestrastic" className="list-logo me-3" />
        <h2 className="mb-0">Participantes</h2>
      </div>
      <form onSubmit={onSearch} className="d-flex mb-3">
        <input name="q" defaultValue={q} className="form-control me-2" placeholder="Buscar por nombre..." />
        <button type="submit" className="btn btn-primary">Buscar</button>
      </form>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="row g-3">
          {participants.length === 0 && <p>No se encontró ningún participante.</p>}
          {participants.map((p) => (
            <div className="col-12 col-sm-6 col-md-4" key={p.id}>
              <div className="card h-100">
                <div className="row g-0 align-items-center">
                  <div className="col-auto p-3">
                    <Link to={`/gafete/${p.id}`}>
                      <img
                        src={avatarUrl(p)}
                        alt={`${p.nombre} avatar`}
                        className="rounded-circle"
                        style={{ width: 72, height: 72, objectFit: 'cover' }}
                        onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/6596/6596121.png' }}
                      />
                    </Link>
                  </div>
                  <div className="col">
                    <div className="card-body py-2">
                      <h5 className="card-title mb-1">{p.nombre} {p.apellidos}</h5>
                      <p className="card-text small text-muted mb-1">{p.ocupacion}</p>
                      <a href={`https://twitter.com/${p.twitter}`} target="_blank" rel="noreferrer" className="text-decoration-none">@{p.twitter}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
