import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PixarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 via-blue-200 to-purple-300 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-24 h-24 bg-yellow-300 rounded-full opacity-60 animate-pulse blur-sm"></div>
        <div className="absolute bottom-24 right-24 w-20 h-20 bg-pink-300 rounded-full opacity-60 animate-bounce blur-sm"></div>
        <div className="absolute top-1/3 right-16 w-16 h-16 bg-green-300 rounded-full opacity-60 animate-ping blur-sm"></div>
      </div>

      {/* Main Container - Pixar 3D Style */}
      <div className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-8 max-w-lg w-full transform perspective-1000 hover:rotate-x-1 hover:rotate-y-1 transition-transform duration-500">
        
        {/* Header with 3D Gradient */}
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 px-6 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-transform mb-4">
            <h1 className="text-3xl font-bold text-white drop-shadow-md">
              🎯 NKV Portal
            </h1>
          </div>
          <p className="text-gray-600">
            Veterinary Control Number System
          </p>
        </div>

        {/* Pixar Character - 3D Style */}
        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40">
            {/* Character Body */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-28 h-28 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full shadow-2xl border-4 border-white">
              {/* Eyes */}
              <div className="absolute top-8 left-5 w-3 h-3 bg-gray-800 rounded-full"></div>
              <div className="absolute top-8 right-5 w-3 h-3 bg-gray-800 rounded-full"></div>
              {/* Smile */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-6 h-1.5 bg-gray-800 rounded-full"></div>
            </div>
            
            {/* Hat */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg">
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-yellow-400 rounded-full"></div>
            </div>

            {/* Arms */}
            <div className="absolute top-16 -left-2 w-4 h-8 bg-blue-500 rounded-full transform rotate-12 shadow-md"></div>
            <div className="absolute top-16 -right-2 w-4 h-8 bg-blue-500 rounded-full transform -rotate-12 shadow-md"></div>
          </div>
        </div>

        {/* Action Buttons - Pixar Style */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-xl text-center shadow-xl transform hover:scale-110 hover:-rotate-2 transition-all">
            <div className="text-3xl mb-1">🚀</div>
            <p className="text-white font-bold text-sm">Start</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-400 to-violet-500 p-4 rounded-xl text-center shadow-xl transform hover:scale-110 hover:rotate-2 transition-all">
            <div className="text-3xl mb-1">📊</div>
            <p className="text-white font-bold text-sm">Status</p>
          </div>
        </div>

        {/* Main Buttons */}
        <div className="flex gap-3 justify-center">
          <Link href="/register">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              Register
            </Button>
          </Link>
          
          <Link href="/login">
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              Login
            </Button>
          </Link>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute -top-6 -right-6 w-10 h-10 bg-yellow-400 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-pink-400 rounded-full animate-pulse opacity-70"></div>
      </div>
    </div>
  )
}