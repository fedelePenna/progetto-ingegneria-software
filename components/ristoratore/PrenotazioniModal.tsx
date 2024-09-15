import { useEffect, useState, useRef } from 'react';

const PrenotazioniModal = ({ clienteId, isOpen, onClose }) => {
  const [prenotazioni, setPrenotazioni] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevClienteId = useRef(null);

  useEffect(() => {
    if (isOpen && clienteId && prevClienteId.current !== clienteId) {
      const fetchPrenotazioni = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/cliente/funzioni/${clienteId}`);
          const data = await response.json();
          console.log(data);
          setPrenotazioni(data.data|| []);
        } catch (error) {
          console.error("Errore nel caricamento delle prenotazioni:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPrenotazioni();
      prevClienteId.current = clienteId;
    }
  }, [clienteId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Prenotazioni Cliente #{clienteId}</h2>

        {loading ? (
          <p>Caricamento prenotazioni...</p>
        ) : prenotazioni.length === 0 ? (
          <p>Nessuna prenotazione trovata.</p>
        ) : (
          <div className='overflow-y-auto h-64'>
            <ul>
              {prenotazioni.map((prenotazione) => (
                <li key={prenotazione.id} className="mb-4">
                  <strong>ID Prenotazione:</strong> {prenotazione.id}<br />
                  <strong>Data:</strong> {new Date(prenotazione.data).toLocaleString()}<br />
                  <strong>Coperti Adulti:</strong> {prenotazione.copertiAdulti}<br />
                  <strong>Coperti Bambini:</strong> {prenotazione.copertiBambini}<br />
                  <strong>Allergie:</strong> {prenotazione.allergie || 'Nessuna'}<br />
                  <strong>Numero Passeggini:</strong> {prenotazione.numeroPasseggini || 'Nessuno'}<br />
                  <strong>Numero Seggiolini:</strong> {prenotazione.numeroSeggiolini || 'Nessuno'}<br />
                  <strong>Tavolo ID:</strong> {prenotazione.tavoloId}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={onClose} className="mt-4 bg-red-500 text-white p-2 rounded">
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default PrenotazioniModal;