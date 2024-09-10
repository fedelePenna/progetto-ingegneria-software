'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AreaCRUD from "@/app/(authenticated)/(ristoratore)/dashboard/menu/AreaCRUD";
import CategoryCRUD from "@/app/(authenticated)/(ristoratore)/dashboard/menu/CategoryCRUD";
import PietanzaCRUD from "@/app/(authenticated)/(ristoratore)/dashboard/menu/DishCRUD";



export default function CRUDTabs() {
    const [activeTab, setActiveTab] = useState("area-competenza")

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Gestione Menu</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Modifica il menù</CardTitle>
                    <CardDescription>Gestisci aree di competenza, categorie e pietanze.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="area-competenza">Area Competenza</TabsTrigger>
                            <TabsTrigger value="dishes">Pietanze</TabsTrigger>
                            <TabsTrigger value="categories">Categorie</TabsTrigger>
                        </TabsList>
                        <div className="mt-6">
                            <TabsContent value="area-competenza">
                                <AreaCRUD />
                            </TabsContent>
                            <TabsContent value="dishes">
                                <PietanzaCRUD />
                            </TabsContent>
                            <TabsContent value="categories">
                                <CategoryCRUD />
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}