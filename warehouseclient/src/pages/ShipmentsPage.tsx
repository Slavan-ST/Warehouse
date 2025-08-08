// src/pages/ShipmentPage.tsx
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
    Button,
    CircularProgress,
    Alert,
    Grid,
    Chip,
    InputLabel,
    FormControl,
    Select,
} from '@mui/material';
import { getShipments, getResources, getUnits, getClients } from '../api/warehouseApi';
import type { ResourceDto, ShipmentItem, UnitOfMeasureDto} from '../api/warehouseApi';
import { Link } from 'react-router-dom';

const ShipmentsPage = () => {
    const [shipments, setShipments] = useState<ShipmentItem[]>([]);
    const [resources, setResources] = useState<ResourceDto[]>([]);
    const [units, setUnits] = useState<UnitOfMeasureDto[]>([]);
    const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Фильтры
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [shipmentNumber, setShipmentNumber] = useState('');
    const [clientFilter, setClientFilter] = useState<number | ''>('');
    const [resourceFilter, setResourceFilter] = useState<number[]>([]);
    const [unitFilter, setUnitFilter] = useState<number[]>([]);

    // Загрузка справочников
    useEffect(() => {
        const loadReferences = async () => {
            try {
                const [res, unt, clt] = await Promise.all([
                    getResources(),
                    getUnits(),
                    getClients()
                ]);
                setResources(res);
                setUnits(unt);
                setClients(clt.map(c => ({ id: c.id, name: c.name })));
            } catch (err) {
                setError('Не удалось загрузить справочники');
            }
        };

        loadReferences();
    }, []);

    // Загрузка данных при изменении фильтров
    useEffect(() => {
        const loadShipments = async () => {
            if (loading && resources.length === 0) return; // Ждём справочники

            try {
                setLoading(true);
                const clientName = clientFilter
                    ? clients.find(c => c.id === clientFilter)?.name
                    : undefined;

                const data = await getShipments(
                    fromDate,
                    toDate,
                    shipmentNumber || undefined,
                    clientName,
                    resourceFilter.length > 0 ? resourceFilter : undefined,
                    unitFilter.length > 0 ? unitFilter : undefined
                );
                setShipments(data);
            } catch (err) {
                setError('Не удалось загрузить отгрузки');
            } finally {
                setLoading(false);
            }
        };

        loadShipments();
    }, [fromDate, toDate, shipmentNumber, clientFilter, resourceFilter, unitFilter, resources, clients]);

    const handleApplyFilters = () => {
        // useEffect сам вызовется при изменении состояния
    };

    const handleResetFilters = () => {
        setFromDate(null);
        setToDate(null);
        setShipmentNumber('');
        setClientFilter('');
        setResourceFilter([]);
        setUnitFilter([]);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Отгрузки</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={2}>
                    <TextField
                        label="С"
                        type="date"
                        value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : null)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        disabled={loading}
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        label="По"
                        type="date"
                        value={toDate ? toDate.toISOString().split('T')[0] : ''}
                        onChange={(e) => setToDate(e.target.value ? new Date(e.target.value) : null)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        disabled={loading}
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        label="Номер отгрузки"
                        value={shipmentNumber}
                        onChange={(e) => setShipmentNumber(e.target.value)}
                        fullWidth
                        disabled={loading}
                    />
                </Grid>
                <Grid item xs={2}>
                    <FormControl fullWidth disabled={loading}>
                        <InputLabel>Клиент</InputLabel>
                        <Select
                            value={clientFilter}
                            label="Клиент"
                            onChange={(e) => setClientFilter(e.target.value as number)}
                        >
                            <MenuItem value="">Все</MenuItem>
                            {clients.map(c => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        select
                        label="Ресурс"
                        value={resourceFilter}
                        onChange={(e) => setResourceFilter(
                            typeof e.target.value === 'string' ? [parseInt(e.target.value)] : e.target.value.map(Number)
                        )}
                        SelectProps={{ multiple: true }}
                        fullWidth
                        disabled={loading}
                    >
                        {resources.map(r => (
                            <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        select
                        label="Единица"
                        value={unitFilter}
                        onChange={(e) => setUnitFilter(
                            typeof e.target.value === 'string' ? [parseInt(e.target.value)] : e.target.value.map(Number)
                        )}
                        SelectProps={{ multiple: true }}
                        fullWidth
                        disabled={loading}
                    >
                        {units.map(u => (
                            <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button variant="contained" color="primary" onClick={handleApplyFilters} disabled={loading}>
                    Применить
                </Button>
                <Button variant="outlined" onClick={handleResetFilters} disabled={loading}>
                    Сбросить
                </Button>
                <Button
                    variant="outlined"
                    color="success"
                    disabled={loading}
                    component={Link}
                    to="/add-shipment"
                >
                    Добавить
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
                                <TableCell>Номер</TableCell>
                                <TableCell>Дата</TableCell>
                                <TableCell>Клиент</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Ресурс</TableCell>
                                <TableCell>Ед. изм.</TableCell>
                                <TableCell align="right">Кол-во</TableCell>
                            </TableRow>
                        </TableHead>
                            <TableBody>
                                {shipments.length > 0 ? (
                                    shipments.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            component={Link}
                                            to={`/shipments/${item.id}`}
                                            sx={{
                                                textDecoration: 'none',
                                                color: 'inherit',
                                                '&:hover': {
                                                    backgroundColor: 'action.hover',
                                                    cursor: 'pointer',
                                                },
                                            }}
                                        >
                                            <TableCell>{item.documentNumber}</TableCell>
                                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{item.clientName}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={
                                                        item.status === 'signed' ? 'Подписан' :
                                                            item.status === 'confirmed' ? 'Подтверждён' : 'Черновик'
                                                    }
                                                    color={
                                                        item.status === 'signed' ? 'success' :
                                                            item.status === 'confirmed' ? 'info' : 'default'
                                                    }
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>{item.resourceName}</TableCell>
                                            <TableCell>{item.unitName}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Нет данных по отгрузкам
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

export default ShipmentsPage;