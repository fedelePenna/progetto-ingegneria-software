'use client'

import React, { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
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

interface Prenotazione {
  id: number
  copertiAdulti: number
  copertiBambini: number
  data: string
  allergie?: string
  numeroPasseggini?: number
  numeroSeggiolini?: number
  occasioneVisita?: string
  nomeCliente: string
  cognomeCliente: string
  telefono: number
  email: string
}

export default function PrenotazioneCRUD() {
  const [prenotazioni, setPrenotazioni] = useState<Prenotazione[]>([])
  const [clienti, setClienti] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState<Date>()
  const [currentPrenotazione, setCurrentPrenotazione] = useState<Prenotazione>()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Omit<Prenotazione, 'id'>>({
    copertiAdulti: 0,
    copertiBambini: 0,
    data: '',
    allergie: '',
    numeroPasseggini: 0,
    numeroSeggiolini: 0,
    occasioneVisita: '',
    nomeCliente: '',
    cognomeCliente: '',
    telefono: 0,
    email: '',
  })

  const { toast } = useToast()

  useEffect(() => {
    //fetchClienti().then(setClienti).catch(error => toast({ title: "Errore", description: error.message, variant: "destructive" })).then(() => setLoading(false));
    fetchPrenotazioni()
  }, [])
  

  const fetchClienti = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cliente')
      if (!response.ok) throw new Error('Errore nel recupero dei clienti.')
      const data = await response.json()
      setClienti(data.data)
      return data.data
    } catch (err) {
      setError('Error fetching clienti')
    } finally {
      setLoading(false)
    }
    }

  const fetchPrenotazioni = async () => {
    try {
      setLoading(true);
  
      // Prima recupera le prenotazioni
      const responsePrenotazioni = await fetch('/api/prenotazione');
      if (!responsePrenotazioni.ok) throw new Error('Failed to fetch prenotazioni');
      const dataPrenotazioni = await responsePrenotazioni.json();
      const prenotazioniRecuperate = dataPrenotazioni.data; // Array di prenotazioni
    
      //dato che React non aggiorna subito lo STATO dei suoi componenti, è necessario fare in questo modo
      const clienti = await fetchClienti()
  
      // Associa i dettagli del cliente a ogni prenotazione
      const prenotazioniConDettagliCliente = prenotazioniRecuperate.map((prenotazione) => {
        const cliente = clienti.find(c => c.id === prenotazione.clienteId);

        return {
          ...prenotazione,
          nomeCliente: cliente?.nome || '',
          cognomeCliente: cliente?.cognome || '',
          telefono: cliente?.telefono || '',
          email: cliente?.email || '',
        };
      });

      setPrenotazioni(prenotazioniConDettagliCliente); // Imposta le prenotazioni con i dettagli del cliente
    } catch (err) {
      setError('Error fetching prenotazioni');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrenotazioni = prenotazioni?.filter(prenotazione =>
    searchTerm ? prenotazione.data.includes(searchTerm.toString()) : true
  );

  //const clientePrenotazione = clienti.filter(cliente => (cliente.email == currentPrenotazione?.email)).at(0);
  //const clientePrenotazione = clienti.filter(cliente => (cliente.email == formData.email)).at(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: name === 'data' ? value : Number(value) || value }))
  }

  const createPrenotazione = async ( prenotazioneToCreate : Prenotazione ) => {
    const cliente = clienti.find(c => (
        (c.nome.toLowerCase() === prenotazioneToCreate.nomeCliente.toLowerCase()) && 
        (c.cognome.toLowerCase() === prenotazioneToCreate.cognomeCliente.toLowerCase()) && 
        (c.telefono.toString() == prenotazioneToCreate.telefono.toString()) && 
        (c.email === prenotazioneToCreate.email)
        ));
    const response = await fetch('/api/prenotazione', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            copertiAdulti: prenotazioneToCreate.copertiAdulti,
            copertiBambini: prenotazioneToCreate.copertiBambini,
            data: new Date(prenotazioneToCreate.data),
            allergie: prenotazioneToCreate.allergie || '',
            numeroPasseggini: prenotazioneToCreate.numeroPasseggini || 0,
            numeroSeggiolini: prenotazioneToCreate.numeroSeggiolini || 0,
            occasioneVisita: prenotazioneToCreate.occasioneVisita || '',
            clienteId: cliente?.id,
        }),
    })
    if (!response.ok) {
      throw new Error("Errore nella creazione della prenotazione.")
    }
    const data = await response.json();
    return data.data;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newPrenotazione = await createPrenotazione({
        copertiAdulti: formData.copertiAdulti,
        copertiBambini: formData.copertiBambini,
        data: formData.data,
        allergie: formData.allergie || '',
        numeroPasseggini: formData.numeroPasseggini || 0,
        numeroSeggiolini: formData.numeroSeggiolini || 0,
        occasioneVisita: formData.occasioneVisita || '',
        nomeCliente: formData.nomeCliente,
        cognomeCliente: formData.cognomeCliente,
        telefono: formData.telefono,
        email: formData.email,
      });
      setPrenotazioni([...prenotazioni, newPrenotazione])

      await fetchPrenotazioni()
      setEditingId(null)
      setFormData({
          copertiAdulti: 0,
          copertiBambini: 0,
          data: '',
          allergie: '',
          numeroPasseggini: 0,
          numeroSeggiolini: 0,
          occasioneVisita: '',
          nomeCliente: '',
          cognomeCliente: '',
          telefono: 0,
          email: '',
      })
      setIsCreateDialogOpen(false)
      toast({ title: "Prenotazione creata con successo", description: `${newPrenotazione.id} è stato aggiunta.` })
    } catch (err) {
      toast({ title: "Errore", description: "Impossibile creare la prenotazione.", variant: "destructive" })
    }
  }

const updatePrenotazione = async ( id: number, prenotazioneToUpdate : Prenotazione ) => {
    const cliente = clienti.find(c => (
        (c.nome.toLowerCase() === prenotazioneToUpdate.nomeCliente.toLowerCase()) && 
        (c.cognome.toLowerCase() === prenotazioneToUpdate.cognomeCliente.toLowerCase()) && 
        (c.telefono.toString() == prenotazioneToUpdate.telefono.toString()) && 
        (c.email === prenotazioneToUpdate.email)
        ));
    const response = await fetch(`/api/prenotazione/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            copertiAdulti: prenotazioneToUpdate.copertiAdulti,
            copertiBambini: prenotazioneToUpdate.copertiBambini,
            data: new Date(prenotazioneToUpdate.data),
            allergie: prenotazioneToUpdate.allergie || '',
            numeroPasseggini: prenotazioneToUpdate.numeroPasseggini || 0,
            numeroSeggiolini: prenotazioneToUpdate.numeroSeggiolini || 0,
            occasioneVisita: prenotazioneToUpdate.occasioneVisita || '',
            clienteId: cliente?.id,
        })
    })
    //console.log(await response.json())
    if (!response.ok) {
      throw new Error("Errore nell\'aggiornamento della prenotazione.")
    }
    const data = await response.json();
    return data.data;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updatedPrenotazione = await updatePrenotazione(editingId, {
        copertiAdulti: formData.copertiAdulti,
        copertiBambini: formData.copertiBambini,
        data: formData.data,
        allergie: formData.allergie || '',
        numeroPasseggini: formData.numeroPasseggini || 0,
        numeroSeggiolini: formData.numeroSeggiolini || 0,
        occasioneVisita: formData.occasioneVisita || '',
        nomeCliente: formData.nomeCliente,
        cognomeCliente: formData.cognomeCliente,
        telefono: formData.telefono,
        email: formData.email,
      });
      console.log(updatedPrenotazione.id)
      setPrenotazioni(prenotazioni.map(p => p.id === updatedPrenotazione.id ? updatedPrenotazione : p))

      await fetchPrenotazioni()
      setEditingId(null)
      setFormData({
          copertiAdulti: 0,
          copertiBambini: 0,
          data: '',
          allergie: '',
          numeroPasseggini: 0,
          numeroSeggiolini: 0,
          occasioneVisita: '',
          nomeCliente: '',
          cognomeCliente: '',
          telefono: 0,
          email: '',
      })
      setIsEditDialogOpen(false)
      toast({ title: "Prenotazione aggiornata con successo", description: `La prenotazione ${updatedPrenotazione.id} è stata aggiornata.` })
    } catch (err) {
      toast({ title: "Errore", description: "Impossibile aggiornare la prenotazione.", variant: "destructive" })
    }
  }

  const handleEdit = (prenotazione: Prenotazione) => {
    setCurrentPrenotazione(prenotazione)
    setEditingId(prenotazione.id)
    setFormData({
      copertiAdulti: prenotazione.copertiAdulti,
      copertiBambini: prenotazione.copertiBambini,
      data: format(parseISO(prenotazione.data), "yyyy-MM-dd'T'HH:mm"),
      //data: prenotazione.data,
      allergie: prenotazione.allergie || '',
      numeroPasseggini: prenotazione.numeroPasseggini || 0,
      numeroSeggiolini: prenotazione.numeroSeggiolini || 0,
      occasioneVisita: prenotazione.occasioneVisita || '',
      nomeCliente: prenotazione.nomeCliente,
      cognomeCliente: prenotazione.cognomeCliente,
      telefono: prenotazione.telefono,
      email: prenotazione.email,
    })
    setIsEditDialogOpen(true)
  }

  const deletePrenotazione = async (id: number) => {
    const res = await fetch(`/api/prenotazione/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Errore nell\'eliminazione della prenotazione');
    return await res.json();
};

const handleDelete = async (id: number) => {
    try {
        await deletePrenotazione(id)
        setPrenotazioni(prenotazioni.filter(p => p.id !== id))

        await fetchPrenotazioni()
        toast({ title: "Prenotazione eliminata con successo", description: `La prenotazione ${id} è stata rimossa.` })
    } catch (error) {
        toast({ title: "Errore", description: "Impossibile eliminare la prenotazione.", variant: "destructive" })
    }
}

/*
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this prenotazione?')) return
    try {
      const response = await fetch(`/api/prenotazione/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete prenotazione')
      await fetchPrenotazioni()
    } catch (err) {
      setError('Error deleting prenotazione')
    }
  }
*/
  if(loading){
    return (
        <div className="flex justify-center items-center h-screen" >
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  if (error) return <div>Error: {error}</div>

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div className="flex space-x-2">
            <Input
                    placeholder="Cerca prenotazione..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                <Button>Crea nuova prenotazione</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Crea nuova prenotazione</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nomeCliente" className="text-right">
                                Nome Cliente
                            </Label>
                            <Input
                                type="text"
                                id="nomeCliente"
                                name="nomeCliente"
                                value={formData.nomeCliente}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cognomeCliente" className="text-right">
                                Cognome Cliente
                            </Label>
                            <Input
                                type="text"
                                id="cognomeCliente"
                                name="cognomeCliente"
                                value={formData.cognomeCliente}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="telefono" className="text-right">
                                Telefono
                            </Label>
                            <Input
                                type="number"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                E-mail
                            </Label>
                            <Input
                                type="text"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="copertiAdulti" className="text-right">
                                Coperti Adulti
                            </Label>
                            <Input
                                type="number"
                                id="copertiAdulti"
                                name="copertiAdulti"
                                value={formData.copertiAdulti}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="copertiBambini" className="text-right">
                                Coperti Bambini
                            </Label>
                            <Input
                                type="number"
                                id="copertiBambini"
                                name="copertiBambini"
                                value={formData.copertiBambini}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="data" className="text-right">
                                Data
                            </Label>
                            <Input
                                type="datetime-local"
                                id="data"
                                name="data"
                                value={formData.data}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="allergie" className="text-right">
                                Allergie
                            </Label>
                            <Input
                                type="text"
                                id="allergie"
                                name="allergie"
                                value={formData.allergie}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="numeroPasseggini" className="text-right">
                                Numero Passeggini
                            </Label>
                            <Input
                                type="number"
                                id="numeroPasseggini"
                                name="numeroPasseggini"
                                value={formData.numeroPasseggini}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="numeroSeggiolini" className="text-right">
                                Numero Seggiolini
                            </Label>
                            <Input
                                type="number"
                                id="numeroSeggiolini"
                                name="numeroSeggiolini"
                                value={formData.numeroSeggiolini}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="occasioneVisita" className="text-right">
                                Occasione Visita
                            </Label>
                            <Input
                                type="text"
                                id="occasioneVisita"
                                name="occasioneVisita"
                                value={formData.occasioneVisita}
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
                    <TableHead>NomeCliente</TableHead>
                    <TableHead>CognomeCliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CopertiAdulti</TableHead>
                    <TableHead>CopertiBambini</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Allergie</TableHead>
                    <TableHead>NumeroPasseggini</TableHead>
                    <TableHead>NumeroSeggiolini</TableHead>
                    <TableHead>OccasioneVisita</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredPrenotazioni?.map((prenotazione) => (
                    <TableRow key={prenotazione.id}>
                        <TableCell>{prenotazione.nomeCliente}</TableCell>
                        <TableCell>{prenotazione.cognomeCliente}</TableCell>
                        <TableCell>{prenotazione.email}</TableCell>
                        <TableCell>{prenotazione.copertiAdulti}</TableCell>
                        <TableCell>{prenotazione.copertiBambini}</TableCell>
                        <TableCell>{new Date(prenotazione.data).toLocaleDateString('it-IT', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                })}</TableCell>
                        <TableCell>{prenotazione.allergie}</TableCell>
                        <TableCell>{prenotazione.numeroPasseggini}</TableCell>
                        <TableCell>{prenotazione.numeroSeggiolini}</TableCell>
                        <TableCell>{prenotazione.occasioneVisita}</TableCell>
                        <TableCell>
                            <div className="flex space-x-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(prenotazione)}>Modifica</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">Elimina</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Questa azione non può essere annullata. Questa prenotazione verrà eliminata permanentemente.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(prenotazione.id)}>Elimina</AlertDialogAction>
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
                    <DialogTitle>Modifica Prenotazione</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nomeCliente" className="text-right">
                                Nome Cliente
                            </Label>
                            <Input
                                type="text"
                                id="nomeCliente"
                                name="nomeCliente"
                                value={formData.nomeCliente}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cognomeCliente" className="text-right">
                                Cognome Cliente
                            </Label>
                            <Input
                                type="text"
                                id="cognomeCliente"
                                name="cognomeCliente"
                                value={formData.cognomeCliente}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="telefono" className="text-right">
                                Telefono
                            </Label>
                            <Input
                                type="number"
                                id="telefono"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                E-mail
                            </Label>
                            <Input
                                type="text"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="copertiAdulti" className="text-right">
                                Coperti Adulti
                            </Label>
                            <Input
                                type="number"
                                id="copertiAdulti"
                                name="copertiAdulti"
                                value={formData.copertiAdulti}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="copertiBambini" className="text-right">
                                Coperti Bambini
                            </Label>
                            <Input
                                type="number"
                                id="copertiBambini"
                                name="copertiBambini"
                                value={formData.copertiBambini}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="data" className="text-right">
                                Data
                            </Label>
                            <Input
                                type="datetime-local"
                                id="data"
                                name="data"
                                value={formData.data}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="allergie" className="text-right">
                                Allergie
                            </Label>
                            <Input
                                type="text"
                                id="allergie"
                                name="allergie"
                                value={formData.allergie}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="numeroPasseggini" className="text-right">
                                Numero Passeggini
                            </Label>
                            <Input
                                type="number"
                                id="numeroPasseggini"
                                name="numeroPasseggini"
                                value={formData.numeroPasseggini}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="numeroSeggiolini" className="text-right">
                                Numero Seggiolini
                            </Label>
                            <Input
                                type="number"
                                id="numeroSeggiolini"
                                name="numeroSeggiolini"
                                value={formData.numeroSeggiolini}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="occasioneVisita" className="text-right">
                                Occasione Visita
                            </Label>
                            <Input
                                type="text"
                                id="occasioneVisita"
                                name="occasioneVisita"
                                value={formData.occasioneVisita}
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