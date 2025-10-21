import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de Gestión de Restaurante</h1>
        <p>Sistema de Gestión de Pedidos y Menú</p>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Contador: {count}
          </button>
          <p>
            Edita <code>src/App.jsx</code> y guarda para probar HMR
          </p>
        </div>
        <p className="read-the-docs">
          Haz clic en el logo de Vite para aprender más
        </p>
      </header>
    </div>
  )
}

export default App
