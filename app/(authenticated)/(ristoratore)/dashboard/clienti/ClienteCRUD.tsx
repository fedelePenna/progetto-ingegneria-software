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
import { Cliente } from '@prisma/client'
import PrenotazioniModal from "@/components/ristoratore/PrenotazioniModal"

//Funzioni API reali
const fetchClienti = async() =>{
    const res = await fetch('/api/cliente');
    if(!res.ok) throw new Error('Errore nel caricamento dei clienti');
    const data = await res.json();
    return data.data;
};



const deleteCliente = async (id) => {
    const res = await fetch(`/api/cliente/${id}`, {
        method: 'DELETE',
    });
    if (res.status !== 200) throw new Error('Errore nell\'eliminazione del cliente');
    return await res.json();
};

export default function ClienteCRUD(){
    const [clienti, setClienti] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [currentCliente, setCurrentCliente] = useState(null)
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        telefono: '',
        email: '',
        dataNascita: null as Date | null,
        consenso: false 
    })
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isPrenotazioniOpen, setIsPrenotazioniOpen] = useState(false)

    const createCliente = async () => {
        const res = await fetch('/api/cliente', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: formData.nome,
                cognome: formData.cognome,
                telefono: formData.telefono.toString(),
                email: formData.email,
                dataNascita: formData.dataNascita,
                consenso: formData.consenso
            }),
        });
        if (!res.ok) throw new Error('Errore nella creazione del cliente');
        const data = await res.json();
        return data.data;
    };
    
    const updateCliente = async (id) => {
        const res = await fetch(`/api/cliente/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: formData.nome,
                cognome: formData.cognome,
                telefono: formData.telefono.toString(),
                email: formData.email,
                dataNascita: formData.dataNascita,
                consenso: formData.consenso
            }),
        });
        if (!res.ok) throw new Error('Errore nell\'aggiornamento del cliente');
        const data = await res.json();
        return data.data;
    };

    useEffect(() => {
        fetchClienti()
            .then(setClienti)
                .catch(error => toast({ title: "Errore", description: error.message, variant: "destructive" })).then(() => setIsLoading(false));
    }, [])

    const filteredClienti = clienti.filter(cliente =>
        cliente?.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleInputChange = (e) => {
        const { name, type, value, checked } = e.target;

        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,  // Gestisce i checkbox separatamente dagli altri tipi di input
        });
    }


    const handleEdit = (cliente) => {
        setCurrentCliente(cliente)
        setFormData({
            nome: cliente.nome,
            cognome: cliente.cognome,
            telefono: cliente.telefono.toString(),
            email: cliente.email,
            dataNascita: cliente.dataNascita ? new Date(cliente.dataNascita.toString()) : null,
            consenso: cliente.consenso
        })
        setIsEditDialogOpen(true)
    }

    const handleUpdate = async () => {
        try {
            const updatedCliente = await updateCliente(currentCliente.id, {
                ...formData,
                telefono: formData.telefono.toString(),
                dataNascita: formData.dataNascita ? new Date(formData.dataNascita.toString()) : null
            })
            console.log(updatedCliente)
            setClienti(clienti.map(c => c.id === updatedCliente.id ? updatedCliente : c))
            setIsEditDialogOpen(false)
            toast({ title: "Cliente aggiornato con successo", description: `${updatedCliente.nome} è stata aggiornato.` })
        } catch (error) {
            toast({ title: "Errore", description: "Impossibile aggiornare il cliente.", variant: "destructive" })
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteCliente(id)
            setClienti(clienti.filter(c => c.id !== id))
            toast({ title: "Cliente eliminato con successo", description: "Il cliente è stato rimosso." })
        } catch (error) {
            toast({ title: "Errore", description: "Impossibile eliminare il cliente.", variant: "destructive" })
        }
    }

    const handleCreate = async () => {
        try {
            const newCliente = await createCliente({
                ...formData,
                telefono: formData.telefono.toString(),
                dataNascita: formData.dataNascita ? new Date(formData.dataNascita.toString()) : null
            })
            setClienti([...clienti, newCliente])
            setIsCreateDialogOpen(false)
            setFormData({
                nome: '',
                cognome: '',
                telefono: '',
                email: '',
                dataNascita: null as Date | null,
                consenso: false
            })
            toast({ title: "Cliente creato con successo", description: `${newCliente.nome} è stato aggiunto.` })
        } catch (error) {
            toast({ title: "Errore", description: "Impossibile creare il cliente.", variant: "destructive" })
        }
    }

    const handleShowPrenotazioni = (clienteId) => {
        // Imposta il cliente corrente
        setCurrentCliente(clienteId);
        setIsPrenotazioniOpen(true);
    }

    const handleModalClose = () => {
        setIsPrenotazioniOpen(false);
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
                        placeholder="Cerca cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Crea nuovo cliente</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Crea nuovo cliente</DialogTitle>
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
                                <Label htmlFor="cognome" className="text-right">
                                    Cognome
                                </Label>
                                <Textarea
                                    id="cognome"
                                    name="cognome"
                                    value={formData.cognome}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="telefono" className="text-right">
                                    Telefono
                                </Label>
                                <Input
                                    id="telefono"
                                    name="telefono"
                                    type="number"
                                    maxLength={10}
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="dataNascita" className="text-right">
                                    Data Nascita
                                </Label>
                                <Input
                                    id="dataNascita"
                                    name="dataNascita"
                                    type="date"
                                    value={formData.dataNascita}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="consenso" className="text-right">
                                    Consenso Privacy
                                </Label>
                                <Input
                                    id="consenso"
                                    name="consenso"
                                    type="checkbox"
                                    checked={formData.consenso}
                                    onChange={handleInputChange}
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
                        <TableHead>Cognome</TableHead>
                        <TableHead>Telefono</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>DataNascita</TableHead>
                        <TableHead>Azioni</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredClienti.map((cliente) => (
                        <TableRow key={cliente.id}>
                            <TableCell>{cliente.id}</TableCell>
                            <TableCell>{cliente.nome}</TableCell>
                            <TableCell>{cliente.cognome}</TableCell>
                            <TableCell>{cliente.telefono}</TableCell>
                            <TableCell>{cliente.email}</TableCell>
                            <TableCell>{cliente.dataNascita}</TableCell>
                            <TableCell>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(cliente)}>Modifica</Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm">Elimina</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Questa azione non può essere annullata. Questo cliente verrà eliminato permanentemente.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(cliente.id)}>Elimina</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <Button variant="outline" size="sm" onClick={() => handleShowPrenotazioni(cliente)}>Vedi Prenotazioni</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Modal per visualizzare le prenotazioni */}
            {isPrenotazioniOpen && (
                <PrenotazioniModal
                    clienteId={currentCliente.id}
                    isOpen={isPrenotazioniOpen}
                    onClose={handleModalClose}
                />
            )}

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifica Cliente</DialogTitle>
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
                                <Label htmlFor="edit-cognome" className="text-right">
                                    Cognome
                                </Label>
                                <Textarea
                                    id="edit-cognome"
                                    name="cognome"
                                    value={formData.cognome}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-telefono" className="text-right">
                                    Telefono
                                </Label>
                                <Input
                                    id="edit-telefono"
                                    name="telefono"
                                    type="number"
                                    maxLength={10}
                                    value={formData.telefono}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="edit-email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-dataNascita" className="text-right">
                                    Data Nascita
                                </Label>
                                <Input
                                    id="edit-dataNascita"
                                    name="dataNascita"
                                    type="date"
                                    value={formData.dataNascita}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-consenso" className="text-right">
                                    Consenso Privacy
                                </Label>
                                <Input
                                    id="edit-consenso"
                                    name="consenso"
                                    type="checkbox"
                                    checked={formData.consenso}
                                    onChange={handleInputChange}
                                    className="col-span-3"
                                />
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
