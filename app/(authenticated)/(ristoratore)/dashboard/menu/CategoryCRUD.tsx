'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import {ScrollArea} from "@/components/ui/scroll-area";

// Fetch categorie e aree di competenza tramite API
const fetchCategories = async () => {
    const res = await fetch('/api/menu/categoria?associazione=true');
    if (!res.ok) throw new Error('Errore nel caricamento delle categorie');
    const data = await res.json();
    return data.data;
}


const fetchAreas = async () => {
    const res = await fetch('/api/menu/areaCompetenza');
    if (!res.ok) throw new Error('Errore nel caricamento delle aree di competenza');
    const data = await res.json();
    return data.data;
}

// Crea una nuova categoria tramite API
const createCategory = async (nome, areaIds) => {
    const res = await fetch('/api/menu/categoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
    });

    if (!res.ok) throw new Error('Errore nella creazione della categoria');

    const categoria = await res.json();

    // Associa categoria con aree
    await fetch('/api/menu/associa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoriaId: categoria.data.id, areaCompentenzaIds: areaIds }),
    });

    return categoria.data;
}

// Aggiorna una categoria tramite API
const updateCategory = async (id, nome, areaIds) => {
    const res = await fetch(`/api/menu/categoria/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome }),
    });

    if (!res.ok) throw new Error('Errore nella modifica della categoria');

    const updatedCategoria = await res.json();

    // Associa categoria con aree aggiornate
    await fetch('/api/menu/associa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoriaId: id, areaCompentenzaIds: areaIds }),
    });

    return updatedCategoria.data;
}

// Elimina una categoria tramite API
const deleteCategory = async (id) => {
    const res = await fetch(`/api/menu/categoria/${id}`, {
        method: 'DELETE',
    });

    if (!res.ok) throw new Error('Errore nella cancellazione della categoria');
}

export default function CategoryCRUD() {
    const [categories, setCategories] = useState([]);
    const [areas, setAreas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedAreas, setSelectedAreas] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        Promise.all([fetchCategories(), fetchAreas()])
            .then(([categoriesData, areasData]) => {
                setCategories(categoriesData);
                setAreas(areasData);
            })
            .catch((error) => toast({ title: "Errore", description: error.message, variant: "destructive" }));
    }, []);

    const filteredCategories = categories.filter(category =>
        category.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEdit = (category) => {
        setCurrentCategory(category);
        setNewCategoryName(category.nome);
        setSelectedAreas(category.areas);
        setIsEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const updatedCategory = await updateCategory(currentCategory.id, newCategoryName, selectedAreas);
            setCategories(categories.map(category => category.id === updatedCategory.id ? updatedCategory : category));
            setIsEditDialogOpen(false);
            toast({ title: "Categoria aggiornata con successo", description: `${updatedCategory.nome} è stata aggiornata.` });
        } catch (error) {
            toast({ title: "Errore", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            setCategories(categories.filter(category => category.id !== id));
            toast({ title: "Categoria eliminata con successo", description: "La categoria è stata rimossa." });
        } catch (error) {
            toast({ title: "Errore", description: error.message, variant: "destructive" });
        }
    };

    const handleCreate = async () => {
        try {
            const newCategory = await createCategory(newCategoryName, selectedAreas);
            setCategories([...categories, newCategory]);
            setIsCreateDialogOpen(false);
            setNewCategoryName('');
            setSelectedAreas([]);
            toast({ title: "Categoria creata con successo", description: `${newCategory.nome} è stata aggiunta.` });
        } catch (error) {
            toast({ title: "Errore", description: error.message, variant: "destructive" });
        }
    };

    const toggleAreaSelection = (areaId) => {
        setSelectedAreas(prev =>
            prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Input
                    placeholder="Cerca categorie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Crea Nuova Categoria</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Crea Nuova Categoria</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nome</Label>
                                <Input
                                    id="name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label className="text-right">Aree</Label>
                                <ScrollArea className="h-[200px] col-span-3 rounded-md border p-4">
                                    <div className="space-y-2">
                                        {areas.map((area) => (
                                            <div key={area.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`area-${area.id}`}
                                                    checked={selectedAreas?.includes(area.id) || false} // Controlla se selectedAreas esiste e contiene area.id
                                                    onCheckedChange={() => toggleAreaSelection(area.id)}
                                                />

                                                <Label htmlFor={`area-${area.id}`}>{area.nome}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
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
                        <TableHead>Aree Associate</TableHead>
                        <TableHead>Azioni</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredCategories.map((category) => (
                        <TableRow key={category.id}>
                            <TableCell>{category.id}</TableCell>
                            <TableCell>{category.nome}</TableCell>
                            <TableCell>
                                {areas
                                    .filter(area => category.areas?.includes(area.id)) // Verifica se category.areas esiste
                                    .map(area => area.nome)
                                    .join(', ')}
                            </TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>Modifica</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">Elimina</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Questa azione non può essere annullata. Verrà eliminata la categoria selezionata.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(category.id)}>Elimina</AlertDialogAction>
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
                        <DialogTitle>Modifica Categoria</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="edit-name" className="text-right">Nome</Label>
                            <Input
                                id="edit-name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label className="text-right">Aree</Label>
                            <ScrollArea className="h-[200px] col-span-3 rounded-md border p-4">
                                <div className="space-y-2">
                                    {areas.map((area) => (
                                        <div key={area.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`edit-area-${area.id}`}
                                                checked={selectedAreas.includes(area.id)}
                                                onCheckedChange={() => toggleAreaSelection(area.id)}
                                            />
                                            <Label htmlFor={`edit-area-${area.id}`}>{area.nome}</Label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
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
