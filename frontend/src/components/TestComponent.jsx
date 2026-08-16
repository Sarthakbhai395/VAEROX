import React from 'react'

const TestComponent = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-500">Tailwind CSS Test</h1>
      <p className="mt-2 text-gray-700">If you can see this text styled with Tailwind CSS, then it's working!</p>
      <div className="mt-4 p-4 bg-green-100 rounded-lg">
        <p className="text-green-800">This box should have a green background.</p>
      </div>
      <button className="mt-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
        This button should be purple
      </button>
    </div>
  )
}

export default TestComponent
