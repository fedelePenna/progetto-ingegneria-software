"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select"
import { MinusIcon, PlusIcon, CalendarDaysIcon } from "lucide-react"
import Spinner from "../ui/spinner"


export default function BookingForm() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [availableDates, setAvailableDates] = useState([])
  const [availableTimes, setAvailableTimes] = useState([])
  const [clienteId, setClienteId] = useState(null) // ID cliente dopo il primo step
  const [tavoloId, setTavoloId] = useState(null) // ID tavolo per la prenotazione
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    telefono: "",
    email: "",
    copertiAdulti: 2,
    copertiBambini: 0,
    data: null,
    time: null,
    allergie: "",
    numeroPasseggini: 0,
    numeroSeggiolini: 0,
    occasioneVisita: "",
  })

  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }))
  }

  const handleIncrement = (field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: prevData[field] + 1,
    }))
  }

  const handleDecrement = (field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: Math.max(prevData[field] - 1, 0),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (step === 1) {
      // Step 1: Salva il cliente e ottieni clienteId
      setLoading(true)
      try {
        const response = await fetch("/api/cliente", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: formData.nome,
            cognome: formData.cognome,
            telefono: formData.telefono,
            email: formData.email,
            ristoranteId: 1, // Assumiamo un ristorante fisso
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setClienteId(data.data.id) // Salva clienteId

          // Step 2: Ottieni le date e gli orari disponibili
          const availResponse = await fetch("/api/prenotazione/avaibility", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              adults: formData.copertiAdulti,
              children: formData.copertiBambini,
            }),
          })

          if (availResponse.ok) {
            const availData = await availResponse.json()

            if (availData.availableDates && availData.availableDates.length > 0) {
              setAvailableDates(availData.availableDates)
              setAvailableTimes(availData.availableDates[0].times) // Mostra gli orari disponibili per la prima data
              setFormData((prevData) => ({
                ...prevData,
                data: availData.availableDates[0].date,
              }))
              setTavoloId(availData.availableDates[0].tavoloId) // Salva tavoloId
            } else {
              console.error("Nessuna data disponibile")
            }

            setStep(2) // Passa al secondo step
          } else {
            console.error("Errore nel recuperare le disponibilità")
          }
        } else {
          console.error("Errore nell'upsert del cliente")
        }
      } catch (error) {
        console.error("Errore:", error)
      } finally {
        setLoading(false)
      }
    } else if (step === 2) {
      // Passaggio alla terza fase una volta selezionati data e orario
      setStep(3)
    } else if (step === 3) {
      // Step 3: Invia i dati per creare la prenotazione
      setLoading(true)
      try {
        const response = await fetch("/api/prenotazione", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            copertiAdulti: formData.copertiAdulti,
            copertiBambini: formData.copertiBambini,
            data: formData.data,
            time: formData.time,
            allergie: formData.allergie,
            numeroPasseggini: formData.numeroPasseggini,
            numeroSeggiolini: formData.numeroSeggiolini,
            occasioneVisita: formData.occasioneVisita,
            clienteId,
            tavoloId,
          }),
        })

        if (response.ok) {
          console.log("Prenotazione creata con successo")
        } else {
          console.error("Errore nella creazione della prenotazione")
        }
      } catch (error) {
        console.error("Errore:", error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      <form onSubmit={handleSubmit}>
        {/* Spinner durante il caricamento */}
        {loading && (
          <div className="flex justify-center items-center">
            <Spinner  />
          </div>
        )}

        {/* Step 1: Dati del cliente e numero di coperti */}
        {!loading && step === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cognome">Cognome</Label>
              <Input
                id="cognome"
                value={formData.cognome}
                onChange={(e) => handleInputChange("cognome", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange("telefono", e.target.value)}
                required
              />
            </div>
            {/* Coperti Adulti e Bambini */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="copertiAdulti">Coperti Adulti</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={() => handleDecrement("copertiAdulti")}>
                    <MinusIcon className="w-4 h-4" />
                  </Button>
                  <span>{formData.copertiAdulti}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => handleIncrement("copertiAdulti")}>
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="copertiBambini">Coperti Bambini</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" onClick={() => handleDecrement("copertiBambini")}>
                    <MinusIcon className="w-4 h-4" />
                  </Button>
                  <span>{formData.copertiBambini}</span>
                  <Button type="button" variant="outline" size="icon" onClick={() => handleIncrement("copertiBambini")}>
                    <PlusIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Seleziona Data e Orario */}
        {!loading && step === 2 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="data">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="data" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarDaysIcon className="mr-1 h-4 w-4 -translate-x-1" />
                    {formData.data ? formData.data : "Seleziona una data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={new Date(formData.data)}
                    onSelect={(date) => handleInputChange("data", date.toISOString().split("T")[0])}
                    disabled={(date) => !availableDates.some(d => d.date === date.toISOString().split("T")[0])}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="time">Orario</Label>
              <Select value={formData.time} onValueChange={(time) => handleInputChange("time", time)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleziona un orario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Orari disponibili</SelectLabel>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3: Dati aggiuntivi per la prenotazione */}
        {!loading && step === 3 && (
          <div className="grid gap-4">
            {/* Allergie */}
            <div className="grid gap-2">
              <Label htmlFor="allergie">Allergie</Label>
              <Input
                id="allergie"
                value={formData.allergie}
                onChange={(e) => handleInputChange("allergie", e.target.value)}
              />
            </div>
            {/* Numero Passeggini */}
            <div className="grid gap-2">
              <Label htmlFor="numeroPasseggini">Numero Passeggini</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => handleDecrement("numeroPasseggini")}>
                  <MinusIcon className="w-4 h-4" />
                </Button>
                <span>{formData.numeroPasseggini}</span>
                <Button type="button" variant="outline" size="icon" onClick={() => handleIncrement("numeroPasseggini")}>
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Numero Seggiolini */}
            <div className="grid gap-2">
              <Label htmlFor="numeroSeggiolini">Numero Seggiolini</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="icon" onClick={() => handleDecrement("numeroSeggiolini")}>
                  <MinusIcon className="w-4 h-4" />
                </Button>
                <span>{formData.numeroSeggiolini}</span>
                <Button type="button" variant="outline" size="icon" onClick={() => handleIncrement("numeroSeggiolini")}>
                  <PlusIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* Occasione Visita */}
            <div className="grid gap-2">
              <Label htmlFor="occasioneVisita">Occasione Visita</Label>
              <Input
                id="occasioneVisita"
                value={formData.occasioneVisita}
                onChange={(e) => handleInputChange("occasioneVisita", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Navigazione */}
        {!loading && (
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                Indietro
              </Button>
            )}
            <Button type="submit">{step === 3 ? "Invia Prenotazione" : "Avanti"}</Button>
          </div>
        )}
      </form>
    </div>
  )
}
