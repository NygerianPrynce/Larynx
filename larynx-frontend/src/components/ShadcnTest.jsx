import React from 'react'
import { Button } from '@/components/ui/button'

const ShadcnTest = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">shadcn/ui Components Test</h2>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Button Variants:</h3>
        
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Button Sizes:</h3>
        
        <div className="flex flex-wrap gap-4 items-center">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-700">
          If you can see styled buttons with hover effects, shadcn/ui is working! 🎉
        </p>
      </div>
    </div>
  )
}

export default ShadcnTest
