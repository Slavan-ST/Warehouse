// src/pages/ClientsPage.tsx
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

    // Загрузка данных
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
                        to="/add-client"
                    >
                        Добавить
                    </Button>
                </Grid>
                <Grid item>
                    <Button variant="contained" color="warning">
                        К архиву
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
                                <TableCell>Наименование</TableCell>
                                <TableCell>Адрес</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2} align="center">
                                        Нет данных по клиентам
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{client.name}</TableCell>
                                        <TableCell>{client.address}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default ClientsPage;