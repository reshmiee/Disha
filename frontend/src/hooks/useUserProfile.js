import { useState, useEffect } from 'react'
import { user as userApi, getUser } from '../api'

export function useUserProfile() {
  const [userData, setUserData] = useState(getUser())

  useEffect(() => {
    userApi.me()
      .then(data => {
        setUserData(data.user)
        localStorage.setItem('disha_user', JSON.stringify(data.user))
      })
      .catch(() => {})
  }, [])

  return userData
}
