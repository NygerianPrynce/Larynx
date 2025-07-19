// File: pages/InventoryStandalone.jsx
import React from 'react'
import InventoryPage from './InventoryPage'
import Navbar from '../components/Navbar'
/*
const InventoryStandalone = () => {
  return (
    
    <>
    <Navbar />
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Manage Your Inventory</h2>
      <InventoryPage embedded={false} showNavbar={true} />

    </div>
    </>
    
  )
}
*/
const InventoryStandalone = () => {
  return (
    <>
      <Navbar />
      <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
        <h2>Manage Your Inventory</h2>
        {<InventoryPage embedded={false} showNavbar={true} /> }
      </div>
    </>
  )
}
export default InventoryStandalone
