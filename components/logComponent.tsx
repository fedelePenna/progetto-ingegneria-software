"use client"
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Log {
    _id: string;
    eventType: string;
    details: any;
    timestamp: string;
}

export default function LogComponent() {
    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            const response = await fetch('/api/logs');
            console.log("log response", response)
            const data = await response.json();
            setLogs(data);
        };

        fetchLogs();

        const interval = setInterval(fetchLogs, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Timestamp</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.map((log) => (
                    <TableRow key={log._id}>
                        <TableCell>{log.eventType}</TableCell>
                        <TableCell>{JSON.stringify(log.details)}</TableCell>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
