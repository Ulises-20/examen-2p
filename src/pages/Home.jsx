import { Link } from 'react-router-dom'
import './home.css'

export default function Home() {
  return (
    <div className="home-landing">
      <div className="hero">
        <div className="hero-logos">
          <img src="/nuestrastic.png" alt="Nuestrastic" className="hero-logo nuestrastic-logo" />
          <img src="/logo_utl_2025.png" alt="UTL" className="hero-logo" />
        </div>
        <h1>Congreso TICs - Universidad Tecnológica de León</h1>
        <p>Bienvenido al sistema de registro de participantes.</p>
        <Link to="/participantes" className="btn">Entrar</Link>
      </div>
    </div>
  )
}
