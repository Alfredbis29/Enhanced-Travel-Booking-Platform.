import { useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@/store'
import { useToast } from '@/hooks/use-toast'

// Check for inactivity every 5 minutes
const CHECK_INTERVAL = 5 * 60 * 1000

// Throttle activity updates to avoid excessive state updates (1 minute)
const ACTIVITY_THROTTLE = 60 * 1000

/**
 * Hook to track user activity and automatically log out after 12 hours of inactivity.
 * Should be used in the root App component.
 */
export function useActivityTracker() {
  const { isAuthenticated, updateActivity, checkInactivity } = useAuthStore()
  const { toast } = useToast()
  const lastUpdateRef = useRef<number>(0)

  // Throttled activity update
  const handleActivity = useCallback(() => {
    const now = Date.now()
    if (now - lastUpdateRef.current >= ACTIVITY_THROTTLE) {
      lastUpdateRef.current = now
      updateActivity()
    }
  }, [updateActivity])

  // Check for inactivity and show toast if logged out
  const performInactivityCheck = useCallback(() => {
    const wasLoggedOut = checkInactivity()
    if (wasLoggedOut) {
      toast({
        title: 'Session Expired',
        description: 'You have been logged out due to 12 hours of inactivity.',
        variant: 'destructive',
      })
    }
  }, [checkInactivity, toast])

  useEffect(() => {
    if (!isAuthenticated) return

    // Activity events to track
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'wheel',
    ]

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    // Initial activity update
    updateActivity()

    // Set up periodic inactivity check
    const intervalId = setInterval(performInactivityCheck, CHECK_INTERVAL)

    // Also check immediately on mount (in case user was inactive while app was closed)
    performInactivityCheck()

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
      clearInterval(intervalId)
    }
  }, [isAuthenticated, handleActivity, updateActivity, performInactivityCheck])
}

export default useActivityTracker

