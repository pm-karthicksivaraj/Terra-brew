'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Leaf, LogOut, User, Menu } from 'lucide-react'

export function Header() {
  const { selectedModule, currentUser, logout, setSidebarOpen, sidebarOpen } = useAppStore()

  if (!selectedModule || !currentUser) return null

  const initials = currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-emerald-200 bg-white/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2">
        <Leaf className="h-6 w-6 text-emerald-600" />
        <div>
          <h1 className="text-base font-semibold text-emerald-900 leading-tight">Terra Ecosystem</h1>
          <p className="text-xs text-emerald-600 leading-tight">{selectedModule.name}</p>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:block">
          {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-0.5">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
