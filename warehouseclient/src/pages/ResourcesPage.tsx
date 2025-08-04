// src/pages/ResourcesPage.tsx
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
import { getResources } from '../api/warehouseApi';
import type { Resource } from '../api/warehouseApi';
import { Link } from 'react-router-dom';

const ResourcesPage = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка данных
    useEffect(() => {
        const loadResources = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getResources();
                setResources(response);
            } catch (err) {
                console.error('Ошибка загрузки ресурсов:', err);
                setError('Не удалось загрузить ресурсы. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        loadResources();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Ресурсы</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item>
                    <Button
                        variant="outlined"
                        color="success"
                        disabled={loading}
                        component={Link}
                        to="/add-resource"
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {resources.length === 0 ? (
                                <TableRow>
                                    <TableCell align="center">Нет данных по ресурсам</TableCell>
                                </TableRow>
                            ) : (
                                resources.map((resource, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{resource.name}</TableCell>
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

export default ResourcesPage;