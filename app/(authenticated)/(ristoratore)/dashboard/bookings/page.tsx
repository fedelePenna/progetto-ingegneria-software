'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PrenotazioneCRUD from '@/app/(authenticated)/(ristoratore)/dashboard/bookings/PrenotazioneCRUD';

export default function CRUDTabs() {
    return (<PrenotazioneCRUD/>)
}
