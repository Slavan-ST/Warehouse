import { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Grid,
    MenuItem,
    Select,
} from '@mui/material';
import { ru } from 'date-fns/locale';
import { format, isValid } from 'date-fns';
import type { Resource, Unit } from '../api/warehouseApi';
import { getResources, getUnits } from '../api/warehouseApi';

const AddReceiptPage = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);

    // Состояние для формы
    const [formData, setFormData] = useState({
        documentNumber: '',
        date: new Date(),
        items: [] as {
            resourceId: number;
            unitOfMeasureId: number;
            quantity: number;
        }[],
    });

    // Загрузка справочников
    useEffect(() => {
        const loadReferences = async () => {
            try {
                const [res, unt] = await Promise.all([getResources(), getUnits()]);
                setResources(res);
                setUnits(unt);
            } catch (err) {
                console.error('Ошибка загрузки справочников:', err);
            }
        };
        loadReferences();
    }, []);

    // Обработчик изменения номера документа
    const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, documentNumber: e.target.value });
    };

    // Обработчик изменения даты
    const handleDateChange = (newValue: string | null) => {
        if (!newValue || !isValid(new Date(newValue))) return;
        setFormData({ ...formData, date: new Date(newValue) });
    };

    // Обработчик добавления нового ресурса
    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [
                ...formData.items,
                { resourceId: 0, unitOfMeasureId: 0, quantity: 0 },
            ],
        });
    };

    // Обработчик удаления ресурса
    const handleRemoveItem = (index: number) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        });
    };

    // Обработчик изменения значения ресурса
    const handleResourceChange = (index: number, value: string) => {
        const resourceId = parseInt(value, 10);
        setFormData({
            ...formData,
            items: formData.items.map((item, i) =>
                i === index ? { ...item, resourceId } : item
            ),
        });
    };

    // Обработчик изменения единицы измерения
    const handleUnitChange = (index: number, value: string) => {
        const unitOfMeasureId = parseInt(value, 10);
        setFormData({
            ...formData,
            items: formData.items.map((item, i) =>
                i === index ? { ...item, unitOfMeasureId } : item
            ),
        });
    };

    // Обработчик изменения количества
    const handleQuantityChange = (index: number, value: string) => {
        const quantity = parseInt(value, 10);
        setFormData({
            ...formData,
            items: formData.items.map((item, i) =>
                i === index ? { ...item, quantity } : item
            ),
        });
    };

    // Функция сохранения нового поступления
    const handleSubmit = async () => {
        try {
            // Здесь должна быть реализация отправки данных на сервер
            console.log('Сохранение нового поступления:', formData);
            alert('Поступление успешно сохранено!');
        } catch (err) {
            console.error('Ошибка сохранения поступления:', err);
            alert('Ошибка при сохранении поступления');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Добавление поступления</Typography>
            <Grid container spacing={2}>
                {/* Номер документа */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Номер документа"
                        value={formData.documentNumber}
                        onChange={handleDocumentNumberChange}
                        fullWidth
                    />
                </Grid>
                {/* Дата */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Дата"
                        type="date"
                        value={formData.date.toISOString().split('T')[0]}
                        onChange={(e) => handleDateChange(e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>
            </Grid>
            {/* Таблица для добавления ресурсов */}
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Ресурс</TableCell>
                            <TableCell>Единица измерения</TableCell>
                            <TableCell align="right">Количество</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {formData.items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Button
                                        color="error"
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={formData.items.length === 1}
                                    >
                                        ×
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={item.resourceId.toString()}
                                        onChange={(e) => handleResourceChange(index, e.target.value)}
                                        fullWidth
                                    >
                                        <MenuItem value="">Выберите ресурс</MenuItem>
                                        {resources.map(resource => (
                                            <MenuItem key={resource.id} value={resource.id}>
                                                {resource.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={item.unitOfMeasureId.toString()}
                                        onChange={(e) => handleUnitChange(index, e.target.value)}
                                        fullWidth
                                    >
                                        <MenuItem value="">Выберите единицу измерения</MenuItem>
                                        {units.map(unit => (
                                            <MenuItem key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell align="right">
                                    <TextField
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                        fullWidth
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {/* Кнопка добавления нового ресурса */}
                        <TableRow>
                            <TableCell colSpan={4}>
                                <Button
                                    variant="contained"
                                    color="success"
                                    onClick={handleAddItem}
                                >
                                    + Добавить ресурс
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Кнопка сохранения */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="success"
                    onClick={handleSubmit}
                    disabled={!formData.documentNumber || formData.items.length === 0}
                >
                    Сохранить
                </Button>
            </Box>
        </Box>
    );
};

export default AddReceiptPage;