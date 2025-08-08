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
import { getActiveResources, getArchivedResources, type ResourceDto } from '../api/warehouseApi';
import { Link } from 'react-router-dom';

const ResourcesPage = () => {
    const [resources, setResources] = useState<ResourceDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<'active' | 'archive'>('active');

    useEffect(() => {
        const load = async () => {
            try {
                const data = view === 'active' ? await getActiveResources() : await getArchivedResources();
                setResources(data);
            } catch (err) {
                setError('Ошибка загрузки ресурсов');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [view]);

    const filteredResources = resources.filter(resource => {
        const status = resource.status ?? 0;
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
            <Typography variant="h4" gutterBottom>Ресурсы</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item>
                    <Button
                        variant="outlined"
                        color="success"
                        disabled={loading}
                        component={Link}
                        to="/resources/add"
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
                            {filteredResources.length > 0 ? (
                                filteredResources.map((resource) => (
                                    <TableRow
                                        key={resource.id}
                                        component={Link}
                                        to={`/resources/${resource.id}`}
                                        sx={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            '&:hover': {
                                                backgroundColor: 'action.hover',
                                                cursor: 'pointer',
                                            }
                                        }}
                                    >
                                        <TableCell>{resource.name}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell align="center" colSpan={1}>
                                        {view === 'active'
                                            ? 'Нет активных ресурсов'
                                            : 'Нет ресурсов в архиве'}
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

export default ResourcesPage;