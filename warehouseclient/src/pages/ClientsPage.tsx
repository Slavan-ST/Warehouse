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
    Grid,
} from '@mui/material';
import { getClients } from '../api/warehouseApi';
import type { Client } from '../api/warehouseApi';
import { Link } from 'react-router-dom';

const ClientsPage = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'active' | 'archive'>('active'); // Режим отображения

    useEffect(() => {
        const loadClients = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getClients();
                setClients(response);
            } catch (err) {
                console.error('Ошибка загрузки клиентов:', err);
                setError('Не удалось загрузить клиентов. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };
        loadClients();
    }, []);

    // Фильтрация по статусу: 0 = активный, 1 = архив
    const filteredClients = clients.filter(client => {
        const status = client.status ?? 0;
        return view === 'active' ? status === 0 : status === 1;
    });

    const handleArchiveClick = () => {
        setView('archive');
    };

    const handleActiveClick = () => {
        setView('active');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Клиенты</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item>
                    <Button
                        variant="outlined"
                        color="success"
                        disabled={loading}
                        component={Link}
                        to="/clients/add"
                    >
                        Добавить
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant={view === 'active' ? 'outlined' : 'contained'}
                        color="warning"
                        onClick={handleArchiveClick}
                        disabled={loading}
                    >
                        К архиву
                    </Button>
                </Grid>
                <Grid item>
                    <Button
                        variant={view === 'active' ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={handleActiveClick}
                        disabled={loading}
                    >
                        Активные
                    </Button>
                </Grid>
            </Grid>

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
                            {filteredClients.length > 0 ? (
                                filteredClients.map((client) => (
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