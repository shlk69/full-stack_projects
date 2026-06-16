import { useLocation } from 'react-router'
import useAuthUser from '../hooks/useAuthUser'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '../lib/api'
import { Link } from 'react-router'
import { BellIcon, LogOutIcon } from 'lucide-react'
import ThemeSelector from './ThemeSelector.jsx'
const Navbar = () => {
    const { authUser } = useAuthUser()
    const location = useLocation()
    const isChatPage = location.pathname?.startsWith('/chat')

    const queryClient = useQueryClient()
    const { mutate:logoutMutation} = useMutation({
        mutationFn: logout,
        onSuccess:()=> queryClient.invalidateQueries({queryKey:['authUser']})
    })
    

   

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Outer wrapper handles the far-left and far-right distribution */}
        <div className="flex items-center justify-between w-full">
          {/* LEFT SIDE BLOCK */}
          <div>
            {isChatPage && (
              <Link to="/" className="flex items-center gap-2.5">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <img
                    src="/hero.png"
                    alt="logo"
                    className="size-20 object-contain"
                  />
                </div>
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  echoCHAT
                </span>
              </Link>
            )}
          </div>

          {/* RIGHT SIDE BLOCK - This wrapper groups all actions together */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <BellIcon className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>

            <ThemeSelector />

            <div className="avatar flex items-center">
              <div className="w-9 rounded-full">
                <img
                  src={authUser?.profilePic}
                  alt="User Avatar"
                  rel="noreferrer"
                />
              </div>
            </div>

            <button
              className="btn btn-ghost btn-circle"
              onClick={logoutMutation}>
              <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

}

export default Navbar