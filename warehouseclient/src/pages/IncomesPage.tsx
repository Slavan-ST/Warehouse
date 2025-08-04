import { useState, useEffect, useCallback } from 'react';
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
    Alert,
    Button,
    Grid,
} from '@mui/material';
import { format, isValid, isAfter } from 'date-fns';
import type { ReceiptItem } from '../api/warehouseApi';
import { getReceipts, getResources, getUnits } from '../api/warehouseApi';
import { Link } from 'react-router-dom';

// Определите типы, если они не импортированы
interface Resource {
    id: number;
    name: string;
}

interface Unit {
    id: number;
    name: string;
}

const IncomesPage = () => {
    const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Фильтры
    const [startDate, setStartDate] = useState<Date | null>(new Date('2000-07-28'));
    const [endDate, setEndDate] = useState<Date | null>(new Date('2025-08-11'));
    const [documentNumberFilter, setDocumentNumberFilter] = useState<string>('');
    const [resourceFilter, setResourceFilter] = useState<number[]>([]);
    const [unitFilter, setUnitFilter] = useState<number[]>([]);
    const [dateError, setDateError] = useState<string | null>(null);

    // Валидация дат
    useEffect(() => {
        if (startDate && endDate && isAfter(startDate, endDate)) {
            setDateError('Дата начала не может быть позже даты окончания');
        } else {
            setDateError(null);
        }
    }, [startDate, endDate]);

    // Загрузка поступлений
    const loadReceipts = useCallback(async () => {
        if (dateError) return;
        try {
            setLoading(true);
            setError(null);

            const documentNumbers = documentNumberFilter ? [documentNumberFilter] : undefined;
            const resourceIds = resourceFilter.length > 0 ? resourceFilter : undefined;
            const unitIds = unitFilter.length > 0 ? unitFilter : undefined;

            const receiptsResponse = await getReceipts(
                startDate,
                endDate,
                documentNumbers,
                resourceIds,
                unitIds
            );
            setReceipts(receiptsResponse);
        } catch (err) {
            console.error('Ошибка загрузки поступлений:', err);
            setError('Не удалось загрузить поступления');
        } finally {
            setLoading(false);
        }
    }, [
        startDate,
        endDate,
        documentNumberFilter,
        resourceFilter,
        unitFilter,
        dateError,
    ]);

    // Загрузка начальных данных
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [resourcesResponse, unitsResponse] = await Promise.all([
                    getResources(),
                    getUnits(),
                ]);

                setResources(resourcesResponse);
                setUnits(unitsResponse);

                await loadReceipts();
            } catch (err) {
                console.error('Ошибка загрузки данных:', err);
                setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [loadReceipts]);

    const handleApplyFilters = () => {
        loadReceipts();
    };

    const handleStartDateChange = (newValue: string | null) => {
        if (!newValue) return;
        const date = new Date(newValue);
        if (isValid(date)) {
            setStartDate(date);
        }
    };

    const handleEndDateChange = (newValue: string | null) => {
        if (!newValue) return;
        const date = new Date(newValue);
        if (isValid(date)) {
            setEndDate(date);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Поступления
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    {/* Дата начала */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Дата начала"
                            type="date"
                            value={startDate ? startDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!!dateError}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Дата окончания */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Дата окончания"
                            type="date"
                            value={endDate ? endDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={!!dateError}
                            helperText={dateError}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Номер документа */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Номер документа"
                            value={documentNumberFilter}
                            onChange={(e) => setDocumentNumberFilter(e.target.value)}
                            fullWidth
                            disabled={loading}
                        />
                    </Grid>

                    {/* Ресурс */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            label="Ресурс"
                            value={resourceFilter.map(String)}
                            onChange={(e) => {
                                const value = e.target.value;
                                const ids = Array.isArray(value)
                                    ? value.map((id) => parseInt(id, 10))
                                    : [parseInt(value, 10)];
                                setResourceFilter(ids);
                            }}
                            SelectProps={{
                                multiple: true,
                                renderValue: (selected) =>
                                    selected
                                        .map((id) => {
                                            const resource = resources.find((r) => r.id === Number(id));
                                            return resource?.name || '';
                                        })
                                        .filter(Boolean)
                                        .join(', '),
                            }}
                            fullWidth
                            disabled={loading}
                        >
                            {resources.map((resource) => (
                                <MenuItem key={resource.id} value={resource.id}>
                                    {resource.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Единица измерения */}
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            label="Единица измерения"
                            value={unitFilter.map(String)} // Исправлено: преобразуем числа в строки
                            onChange={(e) => {
                                const value = e.target.value;
                                const ids = Array.isArray(value)
                                    ? value.map((id) => parseInt(id, 10))
                                    : [parseInt(value, 10)];
                                setUnitFilter(ids);
                            }}
                            SelectProps={{
                                multiple: true,
                                renderValue: (selected) =>
                                    selected
                                        .map((id) => {
                                            const unit = units.find((u) => u.id === Number(id));
                                            return unit?.name || '';
                                        })
                                        .filter(Boolean)
                                        .join(', '),
                            }}
                            fullWidth
                            disabled={loading}
                        >
                            {units.map((unit) => (
                                <MenuItem key={unit.id} value={unit.id}>
                                    {unit.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button
                        variant="contained"
                        onClick={handleApplyFilters}
                        disabled={loading || !!dateError}
                    >
                        Применить
                    </Button>
                    <Button
                        variant="outlined"
                        component={Link}
                        to="/add-receipt"
                        disabled={loading}
                    >
                        Добавить
                    </Button>
                </Box>
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
                                <TableCell>Номер документа</TableCell>
                                <TableCell>Дата</TableCell>
                                <TableCell>Ресурс</TableCell>
                                <TableCell>Единица измерения</TableCell>
                                <TableCell align="right">Количество</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {receipts.length > 0 ? (
                                    receipts.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.documentNumber}</TableCell>
                                            <TableCell>{format(new Date(item.date), 'dd.MM.yyyy')}</TableCell>
                                            <TableCell>{item.resourceName}</TableCell>
                                            <TableCell>{item.unitName}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                        </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Нет данных
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

export default IncomesPage;