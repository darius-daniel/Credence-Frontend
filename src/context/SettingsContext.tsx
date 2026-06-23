import React, { createContext, useContext, useEffect, useState } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'

/** The persisted settings payload (the subset of state written to localStorage). */
interface SettingsPayload {
  themeMode: ThemeMode
  network: string
  addressDisplay: string
  toastsEnabled: boolean
  autoDismiss: string
}

interface SettingsState {
  themeMode: ThemeMode
  network: string
  addressDisplay: string
  toastsEnabled: boolean
  autoDismiss: string
  setThemeMode: (m: ThemeMode) => void
  setNetwork: (n: string) => void
  setAddressDisplay: (s: string) => void
  setToastsEnabled: (b: boolean) => void
  setAutoDismiss: (s: string) => void
  /**
   * Persist settings. Pass an explicit payload to save immediately (avoids the
   * stale-state race when called right after the individual setters); omit it to
   * persist the current context state.
   */
  saveSettings: (next?: SettingsPayload) => void
  cancelSettings: () => void
  hasUnsavedChanges: boolean
}

const STORAGE_KEY = 'credence:settings'

/**
 * Legacy localStorage key the standalone ThemeToggle used to persist the theme.
 * Read once at startup to seed `themeMode`, then removed so theme has a single
 * source of truth under {@link STORAGE_KEY}.
 */
const LEGACY_THEME_KEY = 'theme'

const defaultState: SettingsState = {
  themeMode: 'system',
  network: 'public',
  addressDisplay: 'short',
  toastsEnabled: true,
  autoDismiss: '5s',
  setThemeMode: () => {},
  setNetwork: () => {},
  setAddressDisplay: () => {},
  setToastsEnabled: () => {},
  setAutoDismiss: () => {},
  saveSettings: () => {},
  cancelSettings: () => {},
  hasUnsavedChanges: false,
}

const SettingsContext = createContext<SettingsState>(defaultState)

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Load saved settings from localStorage
  const loadSavedSettings = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  // One-time read of the legacy ThemeToggle 'theme' key, used only to seed
  // themeMode when credence:settings has no theme yet. The orphan key is removed
  // by an effect below once it has been folded into the single source of truth.
  const loadLegacyTheme = (): ThemeMode | null => {
    try {
      const legacy = localStorage.getItem(LEGACY_THEME_KEY)
      return legacy === 'light' || legacy === 'dark' || legacy === 'system' ? legacy : null
    } catch {
      return null
    }
  }

  const savedSettings = loadSavedSettings()

  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // credence:settings is the source of truth; fall back to the legacy 'theme'
    // key (migration), then to the default.
    return (savedSettings?.themeMode as ThemeMode) || loadLegacyTheme() || 'system'
  })

  const [network, setNetwork] = useState<string>(() => {
    return savedSettings?.network || 'public'
  })

  const [addressDisplay, setAddressDisplay] = useState<string>(() => {
    return savedSettings?.addressDisplay || 'short'
  })

  const [toastsEnabled, setToastsEnabled] = useState<boolean>(() => {
    return typeof savedSettings?.toastsEnabled === 'boolean' ? savedSettings.toastsEnabled : true
  })

  const [autoDismiss, setAutoDismiss] = useState<string>(() => {
    return savedSettings?.autoDismiss || '5s'
  })

  // Track the original saved state to detect unsaved changes
  const [originalSettings, setOriginalSettings] = useState(() => ({
    themeMode,
    network,
    addressDisplay,
    toastsEnabled,
    autoDismiss,
  }))

  // Check if there are unsaved changes
  const hasUnsavedChanges =
    themeMode !== originalSettings.themeMode ||
    network !== originalSettings.network ||
    addressDisplay !== originalSettings.addressDisplay ||
    toastsEnabled !== originalSettings.toastsEnabled ||
    autoDismiss !== originalSettings.autoDismiss

  useEffect(() => {
    try {
      const payload = { themeMode, network, addressDisplay, toastsEnabled, autoDismiss }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore
    }
  }, [themeMode, network, addressDisplay, toastsEnabled, autoDismiss])

  // One-time migration: the legacy ThemeToggle persisted theme under a separate
  // 'theme' key. Its value (if any) seeds `themeMode` above and is folded into
  // credence:settings by the persist effect; here we drop the orphan key so the
  // theme has exactly one source of truth.
  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_THEME_KEY)
    } catch {
      // ignore
    }
  }, [])

  // Explicit save function
  const saveSettings = (next?: SettingsPayload) => {
    try {
      const payload = next ?? { themeMode, network, addressDisplay, toastsEnabled, autoDismiss }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      setOriginalSettings(payload)
    } catch {
      // ignore
    }
  }

  // Cancel function - revert to original saved state
  const cancelSettings = () => {
    setThemeMode(originalSettings.themeMode)
    setNetwork(originalSettings.network)
    setAddressDisplay(originalSettings.addressDisplay)
    setToastsEnabled(originalSettings.toastsEnabled)
    setAutoDismiss(originalSettings.autoDismiss)
  }

  // apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return
    const root = window.document.documentElement

    const apply = () => {
      if (themeMode === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.setAttribute('data-theme', isDark ? 'dark' : 'light')
      } else {
        root.setAttribute('data-theme', themeMode)
      }
    }

    apply()

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => apply()
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [themeMode])

  const value: SettingsState = {
    themeMode,
    network,
    addressDisplay,
    toastsEnabled,
    autoDismiss,
    setThemeMode,
    setNetwork,
    setAddressDisplay,
    setToastsEnabled,
    setAutoDismiss,
    saveSettings,
    cancelSettings,
    hasUnsavedChanges,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
