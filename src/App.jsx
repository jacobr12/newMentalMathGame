import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Practice from './pages/Practice'
import Stats from './pages/Stats'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/stats" element={<Stats />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
