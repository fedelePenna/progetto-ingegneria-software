'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

// Funzioni API
const fetchAreas = async () => {
    const response = await fetch('/api/menu/areaCompetenza')
    const data = await response.json()
    if (response.ok) {
        return data.data
    } else {
        throw new Error(data.message || "Errore nel recupero delle aree di competenza.")
    }
}

const createArea = async (nome, ristoranteId) => {
    const response = await fetch('/api/menu/areaCompetenza', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, ristoranteId }),
    })
    const data = await response.json()
    if (response.ok) {
        return data.data
    } else {
        throw new Error(data.message || "Errore nella creazione dell'area di competenza.")
    }
}

const updateArea = async (id, nome, ristoranteId) => {
    const response = await fetch(`/api/menu/areaCompetenza/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, ristoranteId }),
    })
    const data = await response.json()
    if (response.ok) {
        return data.data
    } else {
        throw new Error(data.message || "Errore nell'aggiornamento dell'area di competenza.")
    }
}

const deleteArea = async (id) => {
    const response = await fetch(`/api/menu/areaCompetenza/${id}`, {
        method: 'DELETE',
    })
    const data = await response.json()
    if (response.ok) {
        return data.message
    } else {
        throw new Error(data.message || "Errore nell'eliminazione dell'area di competenza.")
    }
}

export default function AreaCRUD() {
    const [areas, setAreas] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [currentArea, setCurrentArea] = useState(null)
    const [newAreaName, setNewAreaName] = useState('')
    const [ristoranteId] = useState(1) // Fisso per ora, potrebbe essere dinamico
    const { toast } = useToast()

    useEffect(() => {
        fetchAreas()
            .then(setAreas)
            .catch(error => toast({ title: "Errore", description: error.message, variant: "destructive" }))
    }, [])

    const filteredAreas = areas.filter(area =>
        area.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleEdit = (area) => {
        setCurrentArea(area)
        setNewAreaName(area.nome)
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async () => {
        try {
            const updatedArea = await updateArea(currentArea.id, newAreaName, ristoranteId)
            setAreas(areas.map(area => area.id === updatedArea.id ? updatedArea : area))
            setIsEditDialogOpen(false)
            toast({ title: "Area aggiornata con successo", description: `${updatedArea.nome} è stata aggiornata.` })
        } catch (error) {
            toast({ title: "Errore", description: error.message, variant: "destructive" })
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await deleteArea(id)
            setAreas(areas.filter(area => area.id !== id))
            toast({ title: "Area eliminata con successo", description: "L'area è stata rimossa." })
        } catch (error: any) {
            toast({ title: "Errore", description: error.message, variant: "destructive" })
        }
    }

    const handleCreate = async () => {
        try {
            const newArea = await createArea(newAreaName, ristoranteId)
            setAreas([...areas, newArea])
            setIsCreateDialogOpen(false)
            setNewAreaName('')
            toast({ title: "Area creata con successo", description: `${newArea.nome} è stata aggiunta.` })
        } catch (error) {
            toast({ title: "Errore", description: error.message, variant: "destructive" })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Cerca aree..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Crea Nuova Area</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Crea Nuova Area</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nome
                                </Label>
                                <Input
                                    id="name"
                                    value={newAreaName}
                                    onChange={(e) => setNewAreaName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Crea</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Azioni</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredAreas.map((area) => (
                        <TableRow key={area.id}>
                            <TableCell>{area.id}</TableCell>
                            <TableCell>{area.nome}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(area)}>Modifica</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">Elimina</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Questa azione non può essere annullata. Verrà eliminata l'area in modo permanente.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(area.id)}>Elimina</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifica Area</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="edit-name"
                                value={newAreaName}
                                onChange={(e) => setNewAreaName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdate}>Aggiorna</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
