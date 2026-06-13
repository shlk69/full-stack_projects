import React from 'react'
import useAuthUser from '../hooks/useAuthUser'
import { useLocation } from 'react-router'
import { Link } from 'react-router'
import { BellIcon, HomeIcon, UsersIcon } from 'lucide-react'

const Sidebar = () => {
    const { authUser } = useAuthUser()
    const location = useLocation()
    const currentPath = location.pathname
  return (
    <aside className="w-64 bg-base-200 border-r border-base-300   lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
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
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/" ? "btn-active" : ""
          }`}>
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/friends" ? "btn-active" : ""
          }`}>
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${
            currentPath === "/notifications" ? "btn-active" : ""
          }`}>
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>
      </nav>
    </aside>
  );

}

export default Sidebar