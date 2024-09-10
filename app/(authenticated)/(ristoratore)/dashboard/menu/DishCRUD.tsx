'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {Loader2} from "lucide-react";

// Funzioni API reali
const fetchPietanze = async () => {
    const res = await fetch('/api/menu/pietanza');
    if (!res.ok) throw new Error('Errore nel caricamento delle pietanze');
    const data = await res.json();
    return data.data;
};

const fetchCategorie = async () => {
    const res = await fetch('/api/menu/categoria');
    if (!res.ok) throw new Error('Errore nel caricamento delle categorie');
    const data = await res.json();
    return data.data;
};

const createPietanza = async (pietanza) => {
    const res = await fetch('/api/menu/pietanza', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pietanza),
    });
    if (!res.ok) throw new Error('Errore nella creazione della pietanza');
    const data = await res.json();
    return data.data;
};

const updatePietanza = async (id, pietanza) => {
    const res = await fetch(`/api/menu/pietanza/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(pietanza),
    });
    if (!res.ok) throw new Error('Errore nell\'aggiornamento della pietanza');
    const data = await res.json();
    return data.data;
};

const deletePietanza = async (id) => {
    const res = await fetch(`/api/menu/pietanza/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Errore nell\'eliminazione della pietanza');
    return await res.json();
};

export default function PietanzaCRUD() {
    const [pietanze, setPietanze] = useState([])
    const [categorie, setCategorie] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('tutte')
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [currentPietanza, setCurrentPietanza] = useState(null)
    const [formData, setFormData] = useState({
        nome: '',
        descrizione: '',
        prezzo: '',
        etichetta: '',
        categoriaId: '',
    })
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchPietanze(), fetchCategorie()]).then(([pietanzeData, categorieData]) => {
            setPietanze(pietanzeData)
            setCategorie(categorieData)
        }).then(() => setIsLoading(false));
    }, [])

    const filteredPietanze = pietanze.filter(pietanza =>
        pietanza.nome?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'tutte' || pietanza.categoriaId.toString() === selectedCategory)
    )

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleEdit = (pietanza) => {
        setCurrentPietanza(pietanza)
        setFormData({
            nome: pietanza.nome,
            descrizione: pietanza.descrizione,
            prezzo: pietanza.prezzo.toString(),
            etichetta: pietanza.etichetta,
            categoriaId: pietanza.categoriaId.toString(),
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async () => {
        try {
            const updatedPietanza = await updatePietanza(currentPietanza.id, {
                ...formData,
                prezzo: parseFloat(formData.prezzo),
                categoriaId: parseInt(formData.categoriaId),
            })
            setPietanze(pietanze.map(p => p.id === updatedPietanza.id ? updatedPietanza : p))
            setIsEditDialogOpen(false)
            toast({ title: "Pietanza aggiornata con successo", description: `${updatedPietanza.nome} è stata aggiornata.` })
        } catch (error) {
            toast({ title: "Errore", description: "Impossibile aggiornare la pietanza.", variant: "destructive" })
        }
    }

    const handleDelete = async (id) => {
        try {
            await deletePietanza(id)
            setPietanze(pietanze.filter(p => p.id !== id))
            toast({ title: "Pietanza eliminata con successo", description: "La pietanza è stata rimossa." })
        } catch (error) {
            toast({ title: "Errore", description: "Impossibile eliminare la pietanza.", variant: "destructive" })
        }
    }

    const handleCreate = async () => {
        try {
            const newPietanza = await createPietanza({
                ...formData,
                prezzo: parseFloat(formData.prezzo),
                categoriaId: parseInt(formData.categoriaId),
            })
            setPietanze([...pietanze, newPietanza])
            setIsCreateDialogOpen(false)
            setFormData({
                nome: '',
                descrizione: '',
                prezzo: '',
                etichetta: '',
                categoriaId: '',
            })
            toast({ title: "Pietanza creata con successo", description: `${newPietanza.nome} è stata aggiunta.` })
        } catch (error) {
            toast({ title: "Errore", description: "Impossibile creare la pietanza.", variant: "destructive" })
        }
    }

    if(isLoading){
        return (
            <div className="flex justify-center items-center h-screen" >
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                    <Input
                        placeholder="Cerca pietanze..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Tutte le categorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tutte">Tutte le categorie</SelectItem>
                            {categorie.map((categoria) => (
                                <SelectItem key={categoria.id} value={categoria.id.toString()}>{categoria.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Crea nuova pietanza</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Crea nuova pietanza</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="nome" className="text-right">
                                    Nome
                                </Label>
                                <Input
                                    id="nome"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="descrizione" className="text-right">
                                    Descrizione
                                </Label>
                                <Textarea
                                    id="descrizione"
                                    name="descrizione"
                                    value={formData.descrizione}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="prezzo" className="text-right">
                                    Prezzo
                                </Label>
                                <Input
                                    id="prezzo"
                                    name="prezzo"
                                    type="number"
                                    value={formData.prezzo}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="etichetta" className="text-right">
                                    Etichetta
                                </Label>
                                <Input
                                    id="etichetta"
                                    name="etichetta"
                                    value={formData.etichetta}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="categoriaId" className="text-right">
                                    Categoria
                                </Label>
                                <Select name="categoriaId" value={formData.categoriaId} onValueChange={(value) => handleInputChange({ target: { name: 'categoriaId', value } })}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Seleziona una categoria" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categorie.map((categoria) => (
                                            <SelectItem key={categoria.id} value={categoria.id.toString()}>{categoria.nome}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                        <TableHead>Descrizione</TableHead>
                        <TableHead>Prezzo</TableHead>
                        <TableHead>Etichetta</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Azioni</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredPietanze.map((pietanza) => (
                        <TableRow key={pietanza.id}>
                            <TableCell>{pietanza.id}</TableCell>
                            <TableCell>{pietanza.nome}</TableCell>
                            <TableCell>{pietanza.descrizione}</TableCell>
                            <TableCell>€{pietanza.prezzo.toFixed(2)}</TableCell>
                            <TableCell>{pietanza.etichetta}</TableCell>
                            <TableCell>{categorie.find(c => c.id === pietanza.categoriaId)?.nome}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(pietanza)}>Modifica</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">Elimina</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Questa azione non può essere annullata. Questa pietanza verrà eliminata permanentemente.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(pietanza.id)}>Elimina</AlertDialogAction>
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifica Pietanza</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-nome" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="edit-nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-descrizione" className="text-right">
                                Descrizione
                            </Label>
                            <Textarea
                                id="edit-descrizione"
                                name="descrizione"
                                value={formData.descrizione}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-prezzo" className="text-right">
                                Prezzo
                            </Label>
                            <Input
                                id="edit-prezzo"
                                name="prezzo"
                                type="number"
                                value={formData.prezzo}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-etichetta" className="text-right">
                                Etichetta
                            </Label>
                            <Input
                                id="edit-etichetta"
                                name="etichetta"
                                value={formData.etichetta}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-categoriaId" className="text-right">
                                Categoria
                            </Label>
                            <Select name="categoriaId" value={formData.categoriaId} onValueChange={(value) => handleInputChange({ target: { name: 'categoriaId', value } })}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleziona una categoria" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categorie.map((categoria) => (
                                        <SelectItem key={categoria.id} value={categoria.id.toString()}>{categoria.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdate}>Modifica</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
