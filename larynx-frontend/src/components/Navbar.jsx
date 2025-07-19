// File: components/Navbar.jsx
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'


const Navbar = () => {
    console.log('🔍 Navbar is rendering!')
  const navigate = useNavigate()

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <div>
        <Link to="/home" style={styles.link}>🏠 Home</Link>
        <Link to="/manage-inventory" style={styles.link}>📦 Inventory</Link>
        <Link to="/settings" style={styles.link}>⚙️ Settings</Link>
      </div>
      <button onClick={handleLogout} style={styles.logout}>🚪 Logout</button>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#222',
    color: 'white',
    fontFamily: 'sans-serif'
  },
  link: {
    marginRight: '1.5rem',
    textDecoration: 'none',
    color: 'white',
    fontWeight: 'bold'
  },
  logout: {
    background: '#f44336',
    color: 'white',
    padding: '0.5rem 1rem',
    border: 'none',
    cursor: 'pointer'
  }
}

export default Navbar
