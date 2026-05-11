import React, { useEffect } from 'react'
import { useCart } from '../context/CartContext'

const CartNotification = () => {
  const { notification, hideNotification } = useCart()

  // Add null check for notification
  if (!notification) {
    return null;
  }

  useEffect(() => {
    if (notification && notification.show) {
      const timer = setTimeout(() => {
        hideNotification()
      }, 3000) // Hide after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [notification, hideNotification])

  if (!notification.show) {
    return null
  }

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600'
      case 'error':
        return 'bg-red-500 text-white border-red-600'
      case 'info':
        return 'bg-blue-500 text-white border-blue-600'
      default:
        return 'bg-green-500 text-white border-green-600'
    }
  }

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
          </svg>
        )
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${getNotificationStyles()} px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 border`}>
        {getNotificationIcon()}
        <span className="font-medium">{notification.message}</span>
        <button 
          onClick={hideNotification}
          className="ml-2 hover:opacity-70"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CartNotification