"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {format, addDays, startOfDay, isSameDay} from 'date-fns';
import { Plus, Minus } from 'lucide-react';

export default function ReservationForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    adults: 1,
    children: 0,
    date: null as Date | null,
    time: '',
    allergies: '',
    strollers: 0,
    highChairs: 0,
    dateOfBirth: null as Date | null,
    marketingConsent: false,
  });
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);  // Per mostrare messaggi di errore
  const { toast } = useToast();

  // Funzione per gestire l'upsert del cliente
  const createOrUpdateClient = async () => {
    const response = await fetch("/api/cliente", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: formData.firstName,
        cognome: formData.lastName,
        telefono: formData.phone,
        email: formData.email,
        dataNascita: formData.dateOfBirth,
        consenso: formData.marketingConsent,
        ristoranteId: 1, // Aggiungi l'ID ristorante corretto
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setFormData(prev => ({ ...prev, clienteId: data.data.id }));
      return true;
    } else {
      toast({ title: "Errore", description: "Errore nella creazione del cliente.", variant: "destructive" });
      return false;
    }
  };

  // Funzione per richiedere la disponibilità
  const checkAvailability = async () => {
    const response = await fetch("/api/prenotazione/avaibility", {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        adults: formData.adults,
        children: formData.children,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      const dates = data.availableDates.map(dateObj => ({
        date: new Date(dateObj.date), // Assicurati di convertire le stringhe in Date
        times: dateObj.times,
      }));
      setAvailableDates(dates);
      return true;
    } else {
      toast({ title: "Errore", description: data.message, variant: "destructive" });
      return false;
    }
  };



  const handleNextStep = async () => {
    if (step === 1) {
      setIsLoading(true);
      const clientCreated = await createOrUpdateClient();
      if (clientCreated) {
        const availabilityChecked = await checkAvailability();
        if (availabilityChecked) {
          setStep(2);
        }
      }
      setIsLoading(false);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  const fetchAvailableTimes = async (date: Date, adults: number, children: number) => {
    try {
      const response = await fetch('/api/prenotazione/avaibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date.toISOString().split('T')[0],  // Invia la data in formato ISO (solo data, senza ora)
          adults,
          children,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch available times');
      }

      const data = await response.json();
      return data.availableTimes;  // Restituiamo solo gli orari disponibili
    } catch (error) {
      console.error('Error fetching available times:', error);
      return [];
    }
  };

  // Seleziona una data e richiede gli orari disponibili
  const handleDateSelect = async (date: Date | undefined) => {
    if (date) {
      console.log(date)
      setIsLoading(true);
      setFormData(prev => ({ ...prev, date }));
      try {
        // Cerca l'orario disponibile per la data selezionata
        const selectedDate = availableDates.find(d =>
            new Date(d.date).toISOString().split('T')[0] === date.toISOString().split('T')[0]
        );
        if (selectedDate) {
          setAvailableTimes(selectedDate.times);
        } else {
          setAvailableTimes([]); // Nessun orario disponibile per la data selezionata
        }
      } catch (error) {
        toast({ title: "Errore", description: "Impossibile ottenere gli orari disponibili.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };




  // Funzione per inviare la prenotazione finale
  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);  // Resetta l'errore prima del nuovo tentativo

    try {
      if (!formData.date || !formData.time) {
        setError("Seleziona una data e un orario.");
        setIsLoading(false);
        return;
      }

      // Estrai la data selezionata e l'orario scelto
      const selectedDate = formData.date; // Data selezionata dall'utente
      const selectedTime = formData.time; // Orario scelto dall'utente, es. "13:00"

      // Combina la data e l'orario in un unico oggetto Date
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const reservationDate = new Date(selectedDate); // Copia della data
      reservationDate.setHours(hours, minutes, 0, 0); // Imposta l'orario sulla data

      console.log("Data inviata con orario: ", reservationDate.toISOString());

      const response = await fetch('/api/prenotazione', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          copertiAdulti: formData.adults,
          copertiBambini: formData.children,
          data: reservationDate.toISOString(), // Data con orario combinato
          allergie: formData.allergies,
          numeroPasseggini: formData.strollers,
          numeroSeggiolini: formData.highChairs,
          clienteId: 1, // Qui dovresti sostituire con l'id del cliente ottenuto dal primo step
          tavoloId: 1, // Dovresti ottenere il tavoloId dal backend
        }),
      });

      const result = await response.json();

      if (result.status !== 200) {
        // Se c'è stato un errore, impostiamo il messaggio di errore da mostrare all'utente
        setError(result.error || "Errore nella prenotazione.");
        return;
      }

      if (result.status === 200) {
        setIsBookingComplete(true);
      } else {
        toast({ title: "Errore", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      setError("Errore durante la prenotazione. Riprova.");
    } finally {
      setIsLoading(false);
    }
  };


  const isStep1Valid = formData.firstName && formData.lastName && formData.phone && formData.email && formData.adults > 0;

  if (isBookingComplete) {
    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Prenotazione Confermata!</h2>
          <p className="mb-6">Grazie per la tua prenotazione. Ti aspettiamo!</p>
          <Button onClick={() => window.location.href = '/menu'}>Visualizza il Menu</Button>
        </div>
    );
  }

  return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Prenotazione Tavolo</h2>
        {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">Nome</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="lastName">Cognome</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="adults">Numero di Adulti</Label>
                <div className="flex items-center">
                  <Button type="button" onClick={() => setFormData(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))} disabled={formData.adults <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                      id="adults"
                      name="adults"
                      type="number"
                      min="1"
                      value={formData.adults}
                      onChange={e => setFormData({ ...formData, adults: parseInt(e.target.value, 10) })}
                      className="mx-2 text-center"
                      required
                  />
                  <Button type="button" onClick={() => setFormData(prev => ({ ...prev, adults: prev.adults + 1 }))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="children">Numero di Bambini</Label>
                <div className="flex items-center">
                  <Button type="button" onClick={() => setFormData(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))} disabled={formData.children <= 0}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                      id="children"
                      name="children"
                      type="number"
                      min="0"
                      value={formData.children}
                      onChange={e => setFormData({ ...formData, children: parseInt(e.target.value, 10) })}
                      className="mx-2 text-center"
                      required
                  />
                  <Button type="button" onClick={() => setFormData(prev => ({ ...prev, children: prev.children + 1 }))}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={handleNextStep} disabled={!isStep1Valid || isLoading}>
                {isLoading ? 'Caricamento...' : 'Avanti'}
              </Button>
            </div>
        )}
        {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Seleziona Data</Label>
                <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={handleDateSelect}
                    disabled={(date) => !availableDates.some(d => isSameDay(new Date(d.date), date))} // Usa isSameDay per confrontare le date
                    className="rounded-md border"
                />
              </div>
              {formData.date && (
                  <div>
                    <Label>Seleziona Orario</Label>
                    <Select value={formData.time} onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona un orario" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes && availableTimes.length > 0 ? (
                            availableTimes.map((time) => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))
                        ) : (
                            <SelectItem disabled value="no-available-times">Nessun orario disponibile</SelectItem>
                        )}
                      </SelectContent>


                    </Select>
                  </div>
              )}
              <div className="flex justify-between">
                <Button onClick={handlePrevStep}>Indietro</Button>
                <Button onClick={handleNextStep} disabled={!formData.date || !formData.time}>Avanti</Button>
              </div>
            </div>
        )}
        {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="allergies">Allergie</Label>
                <Input id="allergies" name="allergies" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="strollers">Numero di Passeggini</Label>
                <Input id="strollers" name="strollers" type="number" min="0" value={formData.strollers} onChange={e => setFormData({ ...formData, strollers: parseInt(e.target.value, 10) })} />
              </div>
              <div>
                <Label htmlFor="highChairs">Numero di Seggioloni</Label>
                <Input id="highChairs" name="highChairs" type="number" min="0" value={formData.highChairs} onChange={e => setFormData({ ...formData, highChairs: parseInt(e.target.value, 10) })} />
              </div>
              <div>
                <Label>Data di Nascita</Label>
                <Calendar
                    mode="single"
                    selected={formData.dateOfBirth}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                    className="rounded-md border"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="marketingConsent"
                    checked={formData.marketingConsent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, marketingConsent: checked as boolean }))}
                />
                <Label htmlFor="marketingConsent">Acconsento a ricevere comunicazioni di marketing</Label>
              </div>
              <div className="flex justify-between">
                <Button onClick={handlePrevStep}>Indietro</Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? 'Prenotazione...' : 'Prenota'}
                </Button>
              </div>
            </div>
        )}
      </div>
  );
}
