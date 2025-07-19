// File: pages/Home.jsx
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Home = () => {
  const navigate = useNavigate()
  return (
    <>
    <Navbar />
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Welcome back!</h2>
      <p>What would you like to manage?</p>
      <button onClick={() => navigate('/settings')}>⚙️ Settings</button>
      <button onClick={() => navigate('/manage-inventory')}>📦 Inventory</button>
    </div>
    </>
  )
}

export default Home
