// src/pages/UnitsPage.tsx
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
import { getUnits } from '../api/warehouseApi';
import type { Unit } from '../api/warehouseApi';
import { Link } from 'react-router-dom';

const UnitsPage = () => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка данных
    useEffect(() => {
        const loadUnits = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getUnits();
                setUnits(response);
            } catch (err) {
                console.error('Ошибка загрузки единиц измерения:', err);
                setError('Не удалось загрузить единицы измерения. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        loadUnits();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Единицы измерения</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item>
                    <Button
                        variant="outlined"
                        color="success"
                        disabled={loading}
                        component={Link}
                        to="/add-unit"
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
                            {units.length === 0 ? (
                                <TableRow>
                                    <TableCell align="center">Нет данных по единицам измерения</TableCell>
                                </TableRow>
                            ) : (
                                units.map((unit, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{unit.name}</TableCell>
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

export default UnitsPage;