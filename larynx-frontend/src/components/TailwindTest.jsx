import React from 'react'

const TailwindTest = () => {
  return (
    <div className="bg-purple-600 text-white p-4 rounded-lg m-4">
      <h2 className="text-xl font-bold mb-2">Tailwind CSS Test</h2>
      <p className="text-purple-100">
        If you can see this with purple background and white text, Tailwind is working! 🎉
      </p>
      <button className="bg-white text-purple-600 px-4 py-2 rounded mt-2 hover:bg-gray-100 transition-colors">
        Test Button
      </button>
    </div>
  )
}

export default TailwindTest
