import { useState } from 'react';
import {
    Typography,
    Box,
    TextField,
    Button,
} from '@mui/material';

const AddClientPage = () => {
    // Состояние для формы
    const [formData, setFormData] = useState({
        name: '',
        address: '',
    });

    // Обработчик изменения значения поля "Наименование"
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, name: e.target.value });
    };

    // Обработчик изменения значения поля "Адрес"
    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, address: e.target.value });
    };

    // Функция сохранения нового клиента
    const handleSubmit = async () => {
        try {
            // Здесь должна быть реализация отправки данных на сервер
            console.log('Сохранение нового клиента:', formData);
            alert('Клиент успешно сохранен!');
        } catch (err) {
            console.error('Ошибка сохранения клиента:', err);
            alert('Ошибка при сохранении клиента');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Добавление клиента</Typography>
            <Box sx={{ mt: 2 }}>
                {/* Поле для наименования */}
                <TextField
                    label="Наименование"
                    value={formData.name}
                    onChange={handleNameChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
                {/* Поле для адреса */}
                <TextField
                    label="Адрес"
                    value={formData.address}
                    onChange={handleAddressChange}
                    fullWidth
                    sx={{ mb: 2 }}
                />
            </Box>
            {/* Кнопка сохранения */}
            <Button
                variant="contained"
                color="success"
                onClick={handleSubmit}
                disabled={!formData.name || !formData.address}
                sx={{ mt: 2 }}
            >
                Сохранить
            </Button>
        </Box>
    );
};

export default AddClientPage;