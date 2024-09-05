"use client"

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Dish = {
  id: number;
  nome: string;
  descrizione: string;
  prezzo: number;
  etichetta?: string;
};

type Category = {
  id: number;
  nome: string;
  Pietanza: Dish[];
};

type AreaCompentenzaResponse = {
  id: number;
  nome: string;
  CateogorieOnAree: {
    categoria: Category;
  }[];
};

export default function MenuComponent() {
  const [menu, setMenu] = useState<AreaCompentenzaResponse | null>(null);
  const pathname = usePathname();

  // Estrai l'id dallo slug nell'URL
  const id = pathname.split("/")[2];

  useEffect(() => {
    const fetchMenu = async () => {
      if (!id) return; // Evita di fare fetch se l'id non è ancora disponibile

      try {
        const response = await fetch(`/api/menu/areaCompetenza/${id}`);
        const data = await response.json();

        if (response.ok) {
          setMenu(data.data);
        } else {
          console.error("Error fetching menu:", data.message);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };

    fetchMenu();
  }, [id]);

  if (!menu) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{menu.nome}</h1>
        <Accordion type="single" collapsible>
          {menu.CateogorieOnAree.map((area) => (
            area.categoria.Pietanza.length > 0 && ( // Visualizza la categoria solo se ha delle pietanze
              <AccordionItem key={area.categoria.id} value={area.categoria.nome}>
                <AccordionTrigger className="flex justify-between items-center bg-muted py-4 px-6 rounded-t-lg">
                  <h2 className="text-xl font-semibold">{area.categoria.nome}</h2>
                </AccordionTrigger>
                <AccordionContent className="bg-card p-6 rounded-b-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {area.categoria.Pietanza.map((dish) => (
                      <Card key={dish.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold">{dish.nome}</h3>
                            <span className="text-primary font-semibold">{dish.prezzo.toFixed(2)}€</span>
                          </div>
                          <p className="text-muted-foreground mb-4">{dish.descrizione}</p>
                          {dish.etichetta && (
                            <div className="flex gap-2">
                              <Badge variant="secondary">{dish.etichetta}</Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )
          ))}
        </Accordion>
      </div>
    </div>
  );
}
