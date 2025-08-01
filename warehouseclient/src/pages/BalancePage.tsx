// src/pages/BalancePage.tsx
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
    TextField,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import { getBalances, getResources, getUnits } from '../api/warehouseApi';
import type { BalanceItem, Resource, Unit } from '../api/warehouseApi';

const BalancePage = () => {
    const [balances, setBalances] = useState<BalanceItem[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resourceFilter, setResourceFilter] = useState<number[]>([]);
    const [unitFilter, setUnitFilter] = useState<number[]>([]);

    // Загрузка начальных данных
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [resourcesResponse, unitsResponse, balancesResponse] = await Promise.all([
                    getResources(),
                    getUnits(),
                    getBalances()
                ]);

                setResources(resourcesResponse);
                setUnits(unitsResponse);
                setBalances(balancesResponse);
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Обновление данных при изменении фильтров
    useEffect(() => {
        const updateFilteredData = async () => {
            try {
                setLoading(true);
                const filteredBalances = await getBalances(
                    resourceFilter.length > 0 ? resourceFilter : undefined,
                    unitFilter.length > 0 ? unitFilter : undefined
                );
                setBalances(filteredBalances);
            } catch (err) {
                console.error('Ошибка фильтрации:', err);
                setError('Не удалось применить фильтры');
            } finally {
                setLoading(false);
            }
        };

        updateFilteredData();
    }, [resourceFilter, unitFilter]);

    const handleResourceFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setResourceFilter(typeof value === 'string' ? [parseInt(value)] : value.map(id => parseInt(id as string)));
    };

    const handleUnitFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUnitFilter(typeof value === 'string' ? [parseInt(value)] : value.map(id => parseInt(id as string)));
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Баланс</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    select
                    label="Ресурсы"
                    value={resourceFilter}
                    onChange={handleResourceFilterChange}
                    SelectProps={{ multiple: true }}
                    sx={{ minWidth: 200 }}
                    disabled={loading}
                >
                    {resources.map((resource) => (
                        <MenuItem key={resource.id} value={resource.id}>
                            {resource.name}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Единицы измерения"
                    value={unitFilter}
                    onChange={handleUnitFilterChange}
                    SelectProps={{ multiple: true }}
                    sx={{ minWidth: 200 }}
                    disabled={loading}
                >
                    {units.map((unit) => (
                        <MenuItem key={unit.id} value={unit.id}>
                            {unit.name}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Ресурс</TableCell>
                                <TableCell>Единица измерения</TableCell>
                                <TableCell align="right">Количество</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {balances.map((item) => (
                                <TableRow key={`${item.resourceId}-${item.unitId}`}>
                                    <TableCell>{item.resourceName}</TableCell>
                                    <TableCell>{item.unitName}</TableCell>
                                    <TableCell align="right">{item.quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default BalancePage;