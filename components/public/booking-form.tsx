'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowBigRight, ArrowRight, ArrowRightCircle } from 'lucide-react'

export default function BookingForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    numberOfPersons: 1,
    numberOfChildren: 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleIncrement = (field: keyof typeof formData) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: prevData[field] + 1,
    }))
  }

  const handleDecrement = (field: keyof typeof formData) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: prevData[field] > 0 ? prevData[field] - 1 : 0,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // You can add form submission logic here
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Prenotazione Ristorante</CardTitle>
        <CardDescription>Compila il modulo per prenotare un tavolo.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Nome</Label>
            <Input 
              id="firstName" 
              name="firstName" 
              placeholder="Mario" 
              required 
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Cognome</Label>
            <Input 
              id="lastName" 
              name="lastName" 
              placeholder="Rossi" 
              required 
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Numero di Telefono</Label>
            <Input 
              id="phoneNumber" 
              name="phoneNumber" 
              type="tel" 
              placeholder="+39 333 123 4567" 
              required 
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Indirizzo Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="mario.rossi@example.com" 
              required 
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfPersons">Numero di Persone</Label>
              <div className="flex items-center gap-2">
                <Button type="button" onClick={() => handleDecrement('numberOfPersons')}>-</Button>
                <Input 
                  id="numberOfPersons" 
                  name="numberOfPersons" 
                  type="number" 
                  value={formData.numberOfPersons}
                  readOnly
                  className="text-center w-20"
                />
                <Button type="button" onClick={() => handleIncrement('numberOfPersons')}>+</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numberOfChildren">Numero di Bambini</Label>
              <div className="flex items-center gap-2">
                <Button type="button" onClick={() => handleDecrement('numberOfChildren')}>-</Button>
                <Input 
                  id="numberOfChildren" 
                  name="numberOfChildren" 
                  type="number" 
                  value={formData.numberOfChildren}
                  readOnly
                  className="text-center w-20"
                />
                <Button type="button" onClick={() => handleIncrement('numberOfChildren')}>+</Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Continua 
            <ArrowRightCircle className='h-6 w-6 mx-2' />
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}