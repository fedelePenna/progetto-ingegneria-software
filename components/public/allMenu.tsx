"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AreaCompentenza } from "@prisma/client"
import { ArrowRight } from "lucide-react"

export default function AllAreaCompetenza() {
  const [areaInfo, setAreaInfo] = useState<AreaCompentenza[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAreaInfo = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/menu/areaCompetenza")
        const data = await response.json()
        if (response.status === 200) {
          setAreaInfo(data.data)
        } else {
          console.error("Error fetching area info:", data.message)
        }
      } catch (error) {
        console.error("Error fetching area info:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAreaInfo()
  }, [])

  return (
    <section className="grid gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 flex justify-center">
      {isLoading
        ? [...Array(2)].map((_, index) => (
            <Card
              key={index}
              className="group overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <CardContent className="flex flex-col gap-4 p-6">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))
        : areaInfo?.length > 0 ? (
            areaInfo.map((area) => (
              <Card
                key={area.id}
                className="group overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 "
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between ">
                    <h3 className="text-lg font-semibold min-w-36">{area.nome}</h3>
                    <Link href={`/menu/${area.id}`}>
                      <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary">
                        <ArrowRight className="w-5 h-5" />
                        <span className="sr-only">View {area.nome}</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center col-span-full">No areas found.</div>
          )
      }
    </section>
  )
}
