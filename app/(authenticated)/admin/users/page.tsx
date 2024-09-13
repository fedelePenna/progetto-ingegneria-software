'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// Definizione del tipo User
interface User {
    id: number;
    username: string;
    password: string;
    ruolo: 'RISTORATORE';
    statoAttivo: boolean;
    nome?: string;
    cognome?: string;
}

export default function GestioneRistoratori() {
    const [users, setUsers] = useState<User[]>([]);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState<Partial<User>>({});
    const { toast } = useToast();

    useEffect(() => {
        // Chiamata API per ottenere tutti gli utenti
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                setUsers(data.data); // Si aspetta che i dati siano in `data.data`
            } catch (error) {
                console.error('Errore nel caricamento degli utenti:', error);
            }
        };

        fetchUsers();
    }, []);

    // Funzione per attivare/disattivare lo stato dell'utente
    const handleToggleStatus = async (id: number) => {
        const user = users.find(u => u.id === id);
        if (user) {
            const updatedUser = { ...user, statoAttivo: !user.statoAttivo };
            try {
                await fetch(`/api/users/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedUser),
                });
                setUsers(users.map(u => (u.id === id ? updatedUser : u)));
                toast({
                    title: "Stato aggiornato",
                    description: `L'utente ${id} è stato aggiornato.`,
                });
            } catch (error) {
                console.error('Errore nel cambio di stato:', error);
            }
        }
    };

    // Funzione per modificare un utente
    const handleEditUser = (user: User) => {
        setCurrentUser(user);
        setIsEditDialogOpen(true);
    };

    // Funzione per aggiornare un utente esistente
    const handleUpdateUser = async () => {
        if (currentUser) {
            try {
                await fetch(`/api/users/${currentUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(currentUser),
                });
                setUsers(users.map(user => (user.id === currentUser.id ? currentUser : user)));
                setIsEditDialogOpen(false);
                toast({
                    title: "Utente aggiornato",
                    description: `L'utente ${currentUser.username} è stato aggiornato.`,
                });
            } catch (error) {
                console.error('Errore durante l\'aggiornamento:', error);
            }
        }
    };

    // Funzione per creare un nuovo utente
    const handleCreateUser = async () => {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...newUser,
                    ruolo: 'RISTORATORE',
                    statoAttivo: true,
                }),
            });
            const newUserWithId = await response.json();
            setUsers([...users, newUserWithId.data]);
            setIsCreateDialogOpen(false);
            setNewUser({});
            toast({
                title: "Utente creato",
                description: `Il nuovo utente ${newUser.username} è stato creato.`,
            });
        } catch (error) {
            console.error('Errore durante la creazione:', error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Gestione Utenti Ristoratori</h1>

            <Button onClick={() => setIsCreateDialogOpen(true)} className="mb-4">
                Crea Nuovo Utente
            </Button>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Stato Attivo</TableHead>
                        <TableHead>Azioni</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.username}</TableCell>
                            <TableCell>
                                <Switch
                                    checked={user.statoAttivo}
                                    onCheckedChange={() => handleToggleStatus(user.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" onClick={() => handleEditUser(user)}>
                                    Modifica
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Dialog per modificare un utente */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifica Utente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right">
                                Username
                            </Label>
                            <Input
                                id="username"
                                value={currentUser?.username || ''}
                                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, username: e.target.value } : null)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nome" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="nome"
                                value={currentUser?.nome || ''}
                                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, nome: e.target.value } : null)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="cognome" className="text-right">
                                Cognome
                            </Label>
                            <Input
                                id="cognome"
                                value={currentUser?.cognome || ''}
                                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, cognome: e.target.value } : null)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdateUser}>Salva Modifiche</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog per creare un nuovo utente */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Crea Nuovo Utente</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-username" className="text-right">
                                Username
                            </Label>
                            <Input
                                id="new-username"
                                value={newUser.username || ''}
                                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-password" className="text-right">
                                Password
                            </Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newUser.password || ''}
                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-nome" className="text-right">
                                Nome
                            </Label>
                            <Input
                                id="new-nome"
                                value={newUser.nome || ''}
                                onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-cognome" className="text-right">
                                Cognome
                            </Label>
                            <Input
                                id="new-cognome"
                                value={newUser.cognome || ''}
                                onChange={(e) => setNewUser({ ...newUser, cognome: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateUser}>Crea Utente</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
