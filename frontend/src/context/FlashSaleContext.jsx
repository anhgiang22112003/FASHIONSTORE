import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import apiUser from '@/service/api'

const FlashSaleContext = createContext({})

export const useFlashSale = () => useContext(FlashSaleContext)

const shallowEqual = (a, b) => {
  if (a === b) return true
  if (!a || !b) return false
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const k of aKeys) if (a[k] !== b[k]) return false
  return true
}

export const FlashSaleProvider = ({ children }) => {
  const [map, setMap] = useState({})
  const [endTime, setEndTime] = useState(null)
  const [version, setVersion] = useState(0)
  const mapRef = useRef({})

  const fetchMap = useCallback(async () => {
    try {
      const res = await apiUser.get('/flash-sales/active-map')
      const data = res.data || {}
      const mapStr = JSON.stringify(data)
      // Only update if actually changed
      if (mapStr !== mapRef.current._snap) {
        mapRef.current._snap = mapStr
        setMap(data)
        const times = Object.values(data).map(v => v.endTime).filter(Boolean).map(t => new Date(t).getTime())
        setEndTime(times.length ? Math.max(...times) : null)
        setVersion(v => v + 1)
      }
    } catch { /* keep current state */ }
  }, [])

  useEffect(() => { fetchMap(); const id = setInterval(fetchMap, 60_000); return () => clearInterval(id) }, [fetchMap])

  const getFlashInfo = useCallback((productId) => {
    const pid = productId != null ? String(productId) : ''
    return map[pid] || null
  }, [map])

  const value = useMemo(() => ({ map, endTime, version, getFlashInfo, refresh: fetchMap }), [map, endTime, version, getFlashInfo, fetchMap])

  return <FlashSaleContext.Provider value={value}>{children}</FlashSaleContext.Provider>
}

export default FlashSaleContext
