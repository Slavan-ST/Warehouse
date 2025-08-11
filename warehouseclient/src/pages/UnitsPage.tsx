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
} from '@mui/material';
import { getActiveUnits, getArchivedUnits } from '../api/warehouseApi';
import type { UnitOfMeasureDto } from '../api/warehouseApi';
import { Link } from 'react-router-dom';

const UnitsPage = () => {
    const [units, setUnits] = useState<UnitOfMeasureDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'active' | 'archive'>('active');

    useEffect(() => {
        const load = async () => {
            try {
                const data = view === 'active' ? await getActiveUnits() : await getArchivedUnits();
                setUnits(data);
            } catch (err) {
                setError('Ошибка загрузки единиц измерения');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [view]);


    const handleArchiveClick = () => setView('archive');
    const handleActiveClick = () => setView('active');

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Единицы измерения</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                    variant="outlined"
                    color="success"
                    disabled={loading}
                    component={Link}
                    to="/units/add"
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
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {units.length > 0 ? (
                                units.map((unit) => (
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
                                    <TableCell align="center" colSpan={1}>
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