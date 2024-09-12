'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

interface ILog {
    id: string;
    eventType: string;
    details: any;
    timestamp: Date;
}

// Funzione API per ottenere i log reali
const fetchLogs = async (page: number, limit: number, eventTypeFilter: string, detailsFilter: string, sortOrder: 'asc' | 'desc'): Promise<{ logs: ILog[], total: number }> => {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        eventType: eventTypeFilter,
        details: detailsFilter,
        sortOrder: sortOrder
    });

    const response = await fetch(`/api/logs?${query.toString()}`);
    if (!response.ok) {
        throw new Error('Errore nel caricamento dei log');
    }
    return response.json();
};

export default function VisualizzatoreLog() {
    const [logs, setLogs] = useState<ILog[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [total, setTotal] = useState(0);
    const [eventTypeFilter, setEventTypeFilter] = useState('');
    const [detailsFilter, setDetailsFilter] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const { logs: fetchedLogs, total: totalLogs } = await fetchLogs(page, limit, eventTypeFilter, detailsFilter, sortOrder);
            setLogs(fetchedLogs);
            setTotal(totalLogs);
        } catch (error) {
            setError('Errore nel recupero dei log');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Fetch iniziale
        fetchData();

        // Imposta l'intervallo di aggiornamento ogni 30 secondi
        const intervalId = setInterval(() => {
            fetchData();
        }, 30000);

        // Pulisce l'intervallo quando il componente viene smontato
        return () => clearInterval(intervalId);
    }, [page, eventTypeFilter, detailsFilter, sortOrder]);

    const totalPages = useMemo(() => Math.ceil(total / limit), [total, limit]);

    const handlePrevPage = () => setPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setPage(prev => Math.min(prev + 1, totalPages));

    const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

    return (
        <div className="container mx-auto p-4 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Visualizzatore di Log</h1>

            <div className="flex space-x-2">
                <Input
                    placeholder="Filtra per Tipo di Evento"
                    value={eventTypeFilter}
                    onChange={(e) => setEventTypeFilter(e.target.value)}
                    className="max-w-xs"
                />
                <Input
                    placeholder="Filtra per Dettagli"
                    value={detailsFilter}
                    onChange={(e) => setDetailsFilter(e.target.value)}
                    className="max-w-xs"
                />
                <Button onClick={toggleSortOrder}>
                    Ordina per Data
                    {sortOrder === 'asc' ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tipo di Evento</TableHead>
                        <TableHead>Dettagli</TableHead>
                        <TableHead className="text-right">
                            Data
                            <Button variant="ghost" size="sm" onClick={toggleSortOrder}>
                                <ChevronsUpDown className="h-4 w-4" />
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">Caricamento...</TableCell>
                        </TableRow>
                    ) : Array.isArray(logs) && logs.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center">Nessun log trovato</TableCell>
                        </TableRow>
                    ) : (
                        logs?.map((log) => (
                            <TableRow key={log.id}>
                                <TableCell>{log.eventType}</TableCell>
                                <TableCell>
                                    <pre className="whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                                </TableCell>
                                <TableCell className="text-right">{new Date(log.timestamp).toLocaleString()}</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>

            </Table>

            {error && <div className="text-red-500">{error}</div>}

            <div className="flex justify-between items-center">
                <div>
                    Mostrando {Math.min((page - 1) * limit + 1, total)} - {Math.min(page * limit, total)} di {total} log
                </div>
                <div className="space-x-2">
                    <Button onClick={handlePrevPage} disabled={page === 1}>Precedente</Button>
                    <Button onClick={handleNextPage} disabled={page === totalPages}>Successivo</Button>
                </div>
            </div>
        </div>
    );
}
