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
    const [view, setView] = useState<'active' | 'archive'>('active');

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

    const filteredUnits = units.filter(unit => {
        const status = unit.status ?? 0;
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
            <Typography variant="h4" gutterBottom>Единицы измерения</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item>
                    <Button
                        variant="outlined"
                        color="success"
                        disabled={loading}
                        component={Link}
                        to="/units/add"
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUnits.length > 0 ? (
                                filteredUnits.map((unit) => (
                                    <TableRow
                                        key={unit.id}
                                        component={Link}
                                        to={`/units/${unit.id}`}
                                        sx={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                                cursor: 'pointer',
                                            }
                                        }}
                                    >
                                        <TableCell>{unit.name}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell align="center">
                                        {view === 'active'
                                            ? 'Нет активных единиц измерения'
                                            : 'Нет единиц измерения в архиве'}
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

export default UnitsPage;