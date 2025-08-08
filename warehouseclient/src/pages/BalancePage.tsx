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
import { getBalances, getResources, getUnits, type BalanceDto, type ResourceDto, type UnitOfMeasureDto } from '../api/warehouseApi';


const BalancePage = () => {
    const [balances, setBalances] = useState<BalanceDto[]>([]);
    const [resources, setResources] = useState<ResourceDto[]>([]);
    const [units, setUnits] = useState<UnitOfMeasureDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resourceFilter, setResourceFilter] = useState<number[]>([]);
    const [unitFilter, setUnitFilter] = useState<number[]>([]);

    // Загрузка справочников (ресурсы и единицы)
    useEffect(() => {
        const loadReferences = async () => {
            try {
                const [res, unt] = await Promise.all([
                    getResources(),
                    getUnits()
                ]);
                setResources(res);
                setUnits(unt);
            } catch (err) {
                setError('Не удалось загрузить справочники');
            }
        };

        loadReferences();
    }, []);

    // Загрузка и обогащение балансов
    useEffect(() => {
        const loadBalances = async () => {
            // Ждём, пока загрузятся справочники
            if (resources.length === 0 || units.length === 0) return;

            try {
                setLoading(true);
                setError(null);

                const rawBalances = await getBalances(
                    resourceFilter.length > 0 ? resourceFilter : undefined,
                    unitFilter.length > 0 ? unitFilter : undefined
                );

                // Добавляем имена ресурсов и единиц измерения
                const enrichedBalances: BalanceDto[] = rawBalances.map(item => ({
                    ...item,
                    resourceName: resources.find(r => r.id === item.resourceId)?.name || 'Неизвестно',
                    unitName: units.find(u => u.id === item.unitOfMeasureId)?.name || 'Неизвестно'
                }));

                setBalances(enrichedBalances);
            } catch (err) {
                setError('Не удалось загрузить баланс');
            } finally {
                setLoading(false);
            }
        };

        loadBalances();
    }, [resourceFilter, unitFilter, resources, units]);

    const handleResourceFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setResourceFilter(
            typeof value === 'string' ? [parseInt(value)] : value.map(Number)
        );
    };

    const handleUnitFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUnitFilter(
            typeof value === 'string' ? [parseInt(value)] : value.map(Number)
        );
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
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Ресурс</TableCell>
                                <TableCell>Единица измерения</TableCell>
                                <TableCell align="right">Количество</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {balances.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Нет данных по балансу
                                    </TableCell>
                                </TableRow>
                            ) : (
                                balances.map((item) => (
                                    <TableRow key={`${item.resourceId}-${item.unitOfMeasureId}`}>
                                        <TableCell>{item.resourceName}</TableCell>
                                        <TableCell>{item.unitName}</TableCell>
                                        <TableCell align="right">{item.quantity}</TableCell>
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

export default BalancePage;