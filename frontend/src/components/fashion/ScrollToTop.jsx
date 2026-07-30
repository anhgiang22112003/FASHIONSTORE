import React, { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-36 right-7 z-50 group">
      {/* Tooltip */}
      <div className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-sm text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2 pointer-events-none">
        Lên đầu trang
        <div className="absolute right-[-5px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rotate-45 bg-slate-900"></div>
      </div>

      {/* Button */}
      <button
        onClick={scrollToTop}
        className="p-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-pink-300 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none"
        title="Cuộn lên đầu trang"
        aria-label="Cuộn lên đầu trang"
      >
        <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
      </button>
    </div>
  )
}

export default ScrollToTop
