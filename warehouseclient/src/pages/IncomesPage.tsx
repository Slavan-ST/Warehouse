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
    Alert,
    Button,
    Grid
} from '@mui/material';
import { ru } from 'date-fns/locale';
import { format, isValid, isBefore, isAfter } from 'date-fns';

import type { ReceiptItem } from '../api/warehouseApi';
import { getReceipts, getResources, getUnits } from '../api/warehouseApi';

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

    // Загрузка начальных данных
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [resourcesResponse, unitsResponse] = await Promise.all([
                    getResources(),
                    getUnits()
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
    }, []);

    // Функция загрузки поступлений с учетом фильтров
    const loadReceipts = async () => {
        if (dateError) return;

        try {
            setLoading(true);
            const documentNumbers = documentNumberFilter ? [documentNumberFilter] : undefined;
            const receiptsResponse = await getReceipts(
                startDate,
                endDate,
                documentNumbers,
                resourceFilter.length > 0 ? resourceFilter : undefined,
                unitFilter.length > 0 ? unitFilter : undefined
            );
            setReceipts(receiptsResponse);
        } catch (err) {
            console.error('Ошибка загрузки поступлений:', err);
            setError('Не удалось загрузить поступления');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyFilters = () => {
        loadReceipts();
    };

    const handleAddReceipt = () => {
        console.log('Добавление нового поступления');
    };

    const handleStartDateChange = (newValue: Date | null) => {
        if (!newValue || !isValid(newValue)) return;
        setStartDate(newValue);
    };

    const handleEndDateChange = (newValue: Date | null) => {
        if (!newValue || !isValid(newValue)) return;
        setEndDate(newValue);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Поступления</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            label="Номер документа"
                            value={documentNumberFilter}
                            onChange={(e) => setDocumentNumberFilter(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                {/* Остальной код остается без изменений */}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            label="Ресурс"
                            value={resourceFilter.map(String)} // преобразуем number[] → string[]
                            onChange={(e) => {
                                const value = e.target.value;
                                const ids = Array.isArray(value)
                                    ? value.map(id => parseInt(id, 10))
                                    : [parseInt(value, 10)];
                                setResourceFilter(ids);
                            }}
                            SelectProps={{
                                multiple: true,
                                renderValue: (selected) => {
                                    return selected
                                        .map(id => {
                                            const resource = resources.find(r => r.id === Number(id));
                                            return resource?.name || '';
                                        })
                                        .filter(name => name)
                                        .join(', ');
                                }
                            }}
                            fullWidth
                            disabled={loading}
                        >
                            {resources.map((resource) => (
                                <MenuItem
                                    key={resource.id}
                                    value={resource.id} // будет приведено к строке
                                >
                                    {resource.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            select
                            label="Единица измерения"
                            value={unitFilter}
                            onChange={(e) => setUnitFilter(
                                typeof e.target.value === 'string'
                                    ? [parseInt(e.target.value)]
                                    : e.target.value.map(id => parseInt(id as string))
                            )}
                            SelectProps={{ multiple: true }}
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
                        onClick={handleAddReceipt}
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
                            {receipts.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.documentNumber}</TableCell>
                                    <TableCell>{format(new Date(item.date), 'dd.MM.yyyy')}</TableCell>
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

export default IncomesPage;