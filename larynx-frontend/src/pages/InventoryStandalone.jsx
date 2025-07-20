// File: pages/InventoryStandalone.jsx
import React from 'react'
import InventoryPage from './InventoryPage'
import Navbar from '../components/Navbar'

const InventoryStandalone = () => {
  return (
    <>
        {<InventoryPage embedded={false} showNavbar={true} /> }
    </>
  )
}
export default InventoryStandalone
