import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Participantes from './pages/Participantes'
import Registro from './pages/Registro'
import Gafete from './pages/Gafete'

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <Link to="/" className="brand">
          <img src="/logo_utl_2025.png" alt="UTL" className="brand-logo" />
          <span className="brand-text">Congreso TICs</span>
        </Link>
        <nav>
          <Link to="/participantes">Participantes</Link>
          <Link to="/registro">Registro</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/participantes" element={<Participantes />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/gafete/:id" element={<Gafete />} />
        </Routes>
      </main>
      <footer className="app-footer">© Universidad Tecnológica de León - Congreso TICs</footer>
    </div>
  )
}

export default App
