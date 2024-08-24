'use client'

import { useState, useEffect } from 'react'
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Checkbox } from "../ui/checkbox"
import { toast } from "../ui/use-toast"

interface Client {
  id: string
  nome: string
  cognome: string
  telefono: string
  email: string
  dataNascita: string
  consenso: boolean
  ristoranteId: string
}

export default function ClientiComponent() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({
    nome: '',
    cognome: '',
    telefono: '',
    email: '',
    dataNascita: '',
    consenso: false,
    ristoranteId: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/cliente')
      const data = await response.json()
      console.log(data);
      if (data.status === 200) {
        setClients(data.data)
      } else {
        setMessage(data.message)
      }
    } catch (err) {
        setError('Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setNewClient(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dataNascitaISO = newClient.dataNascita ? new Date(newClient.dataNascita) : null;
    console.log(dataNascitaISO);
    try {
      const response = await fetch('/api/cliente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...newClient, dataNascita: dataNascitaISO }),
      })
      const data = await response.json()
      if (data.status === 201) {
        toast({
          title: "Success",
          description: "New client added successfully",
        })
        fetchClients()
        setNewClient({
          nome: '',
          cognome: '',
          telefono: '',
          email: '',
          dataNascita: '',
          consenso: false,
          ristoranteId: ''
        })
      } else {
        throw new Error(data.message || 'Failed to add new client')
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive",
      })
    }
  }

  if (loading) return <div className="text-center p-4">Loading...</div>
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>

  return (
    <div className="container mx-auto p-4 space-y-8">
        {message ? message : <></>}
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Surname</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Consent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.nome}</TableCell>
                  <TableCell>{client.cognome}</TableCell>
                  <TableCell>{client.telefono}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{new Date(client.dataNascita).toLocaleDateString()}</TableCell>
                  <TableCell>{client.consenso ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Client</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">First Name</Label>
                <Input 
                  id="nome" 
                  name="nome" 
                  value={newClient.nome}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cognome">Last Name</Label>
                <Input 
                  id="cognome" 
                  name="cognome" 
                  value={newClient.cognome}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Phone</Label>
                <Input 
                  id="telefono" 
                  name="telefono" 
                  type="tel"
                  value={newClient.telefono}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={newClient.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataNascita">Date of Birth</Label>
                <Input 
                  id="dataNascita" 
                  name="dataNascita" 
                  type="date"
                  value={newClient.dataNascita}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ristoranteId">Restaurant ID</Label>
                <Input 
                  id="ristoranteId" 
                  name="ristoranteId" 
                  value={newClient.ristoranteId}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="consenso" 
                name="consenso"
                checked={newClient.consenso}
                onCheckedChange={(checked) => setNewClient(prev => ({ ...prev, consenso: checked as boolean }))}
              />
              <Label htmlFor="consenso">Consent</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">Add Client</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}