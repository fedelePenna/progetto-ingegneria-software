'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ClienteCRUD from '@/app/(authenticated)/(ristoratore)/dashboard/clienti/ClienteCRUD';

export default function CRUDTabs() {
    return (<ClienteCRUD/>)
}
