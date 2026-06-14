import { create } from 'zustand'


const useThemeStore = create((set) => ({
    theme: localStorage.getItem('theme')||'coffee',    
    setTheme: (theme) => {
        localStorage.setItem('theme',theme)
        set({ theme })
    }
}))

export default useThemeStore