
import { useState, useEffect } from 'react';
import {
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    Button,
    CircularProgress,
    Alert,
} from '@mui/material'; // Убрали Grid из импорта
import { Link } from 'react-router-dom';

import { getActiveClients, getArchivedClients } from '../api/warehouseApi';
import type { ClientDto as Client } from '../api/warehouseApi';

const ClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'active' | 'archive'>('active');

    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = view === 'active'
                    ? await getActiveClients()
                    : await getArchivedClients();
                setClients(response);
            } catch (err) {
                console.error(`Ошибка загрузки ${view === 'active' ? 'активных' : 'архивированных'} клиентов:`, err);
                setError(
                    view === 'active'
                        ? 'Не удалось загрузить активных клиентов.'
                        : 'Не удалось загрузить клиентов из архива.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadClients();
    }, [view]);

    const handleArchiveClick = () => setView('archive');
    const handleActiveClick = () => setView('active');

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Клиенты</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Используем Box вместо Grid */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                    variant="outlined"
                    color="success"
                    disabled={loading}
                    component={Link}
                    to="/clients/add"
                >
                    Добавить
                </Button>
                <Button
                    variant={view === 'active' ? 'outlined' : 'contained'}
                    color="warning"
                    onClick={handleArchiveClick}
                    disabled={loading}
                >
                    К архиву
                </Button>
                <Button
                    variant={view === 'active' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={handleActiveClick}
                    disabled={loading}
                >
                    Активные
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Наименование</strong></TableCell>
                                <TableCell><strong>Адрес</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients.length > 0 ? (
                                clients.map((client) => (
                                    <TableRow
                                        key={client.id}
                                        component={Link}
                                        to={`/clients/${client.id}`}
                                        sx={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                                cursor: 'pointer',
                                            }
                                        }}
                                    >
                                        <TableCell>{client.name}</TableCell>
                                        <TableCell>{client.address}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        {view === 'active'
                                            ? 'Нет активных клиентов'
                                            : 'Нет клиентов в архиве'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default ClientsPage;