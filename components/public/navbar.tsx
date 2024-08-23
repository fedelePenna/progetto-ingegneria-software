'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

export default function NavBarPublic() {
    const pathname = usePathname()
    

    return (
        <>
        <nav className="flex items-center justify-between p-4 bg-background shadow-sm">
          <div className="flex items-center space-x-4">
            <Tabs value={pathname} >
                    <TabsList>
                        <TabsTrigger value="/">
                        <Link
                        href="/"
                        
                    >
                        Prenota
                    </Link>
                        </TabsTrigger>

                        <TabsTrigger value="/menu">
                        <Link
                        href="/menu"
                        
                    >
                        Menu
                    </Link>
                        </TabsTrigger>
                    </TabsList>

                </Tabs>
          </div>
          <Link href="/dashboard">
            <Button>Login</Button>
          </Link>
        </nav>
        </>
      );
}



