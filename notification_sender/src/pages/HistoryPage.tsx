import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  TextField,
  InputAdornment,
  Avatar,
  Collapse,
  TableSortLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButtonProps,
  styled,
  Button,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types
interface Notification {
  id: string;
  title: string;
  body: string;
  status: 'sent' | 'scheduled' | 'failed';
  createdAt: string;
  updatedAt: string;
  messageId?: string;
  userIds?: string[];
  topic?: string;
  data?: Record<string, any>;
  imageUrl?: string;
}

interface SortConfig {
  field: keyof Notification;
  direction: 'asc' | 'desc';
}

// Composant pour l'expansion des lignes
interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled(({ expand, ...props }: ExpandMoreProps) => {
  return <IconButton {...props} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const HistoryPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    direction: 'desc',
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  // État pour le nombre total d'éléments (utilisé pour la pagination côté serveur)
  const [totalItems, setTotalItems] = useState(0);

  // Fonction pour charger les notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ici, nous utiliserions normalement l'API pour récupérer les données
      // Pour l'instant, nous utilisons des données simulées
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des notifications');
      }
      
      const data = await response.json();
      
      // Si l'API renvoie un objet avec une propriété 'items' et 'total'
      if (data && Array.isArray(data.items)) {
        setNotifications(data.items);
        setTotalItems(data.total || data.items.length);
      } else {
        // Pour la simulation, nous utilisons directement les données
        setNotifications(data);
        setTotalItems(data.length);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError('Impossible de charger les notifications. Veuillez réessayer.');
      
      // Données de simulation en cas d'erreur (à supprimer en production)
      const mockData: Notification[] = [
        {
          id: '1',
          title: 'Bienvenue sur FineA',
          body: 'Merci de vous être inscrit sur notre plateforme. Commencez à explorer nos fonctionnalités !',
          status: 'sent',
          createdAt: new Date('2023-06-01T10:30:00').toISOString(),
          updatedAt: new Date('2023-06-01T10:30:00').toISOString(),
          messageId: 'msg_123',
          userIds: ['user_123'],
          data: { type: 'welcome' },
        },
        {
          id: '2',
          title: 'Promotion spéciale',
          body: 'Profitez de 20% de réduction sur votre première commande avec le code BIENVENUE20',
          status: 'sent',
          createdAt: new Date('2023-06-02T14:15:00').toISOString(),
          updatedAt: new Date('2023-06-02T14:15:00').toISOString(),
          messageId: 'msg_456',
          topic: 'promotions',
          imageUrl: 'https://example.com/promo.jpg',
        },
        {
          id: '3',
          title: 'Mise à jour disponible',
          body: 'Une nouvelle version de l\'application est disponible. Mettez à jour dès maintenant !',
          status: 'failed',
          createdAt: new Date('2023-06-03T09:45:00').toISOString(),
          updatedAt: new Date('2023-06-03T09:45:00').toISOString(),
          userIds: ['user_123', 'user_456'],
        },
      ];
      
      setNotifications(mockData);
      setTotalItems(mockData.length);
    } finally {
      setLoading(false);
    }
  };

  // Charger les notifications au montage du composant
  useEffect(() => {
    fetchNotifications();
  }, [page, rowsPerPage, sortConfig, statusFilter]);
  
  // Gérer le tri des notifications
  const handleSort = (field: keyof Notification) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };
  
  // Gérer le changement de page
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Gérer le changement du nombre de lignes par page
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Gérer la recherche
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Gérer le filtre par statut
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Gérer l'expansion des lignes
  const handleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };
  
  // Filtrer et trier les notifications
  const filteredNotifications = React.useMemo(() => {
    return notifications
      .filter(notification => {
        // Filtre par recherche
        const matchesSearch = 
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.body.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filtre par statut
        const matchesStatus = 
          statusFilter === 'all' || 
          notification.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Trier selon la configuration
        const aValue = a[sortConfig.field];
        const bValue = b[sortConfig.field];
        
        if (aValue === bValue) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        return aValue > bValue ? direction : -direction;
      });
  }, [notifications, searchQuery, statusFilter, sortConfig]);
  
  // Paginer les résultats
  const paginatedNotifications = React.useMemo(() => {
    return filteredNotifications.slice(
      page * rowsPerPage,
      (page + 1) * rowsPerPage
    );
  }, [filteredNotifications, page, rowsPerPage]);
  
  // Obtenir la classe de statut pour le badge
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Chip
            icon={<CheckCircleIcon fontSize="small" />}
            label="Envoyé"
            color="success"
            size="small"
            variant="outlined"
          />
        );
      case 'scheduled':
        return (
          <Chip
            icon={<ScheduleIcon fontSize="small" />}
            label="Planifié"
            color="info"
            size="small"
            variant="outlined"
          />
        );
      case 'failed':
        return (
          <Chip
            icon={<ErrorIcon fontSize="small" />}
            label="Échec"
            color="error"
            size="small"
            variant="outlined"
          />
        );
      default:
        return (
          <Chip
            label={status}
            size="small"
            variant="outlined"
          />
        );
    }
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'PPpp', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };
  
  // Formater la date relative (il y a...)
  const formatRelativeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: fr 
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Historique des Notifications
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2, mb: 3 }}>
            <Typography variant="h6" component="div">
              Liste des notifications
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: { xs: '100%', md: 'auto' } }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="status-filter-label">Statut</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Statut"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="all">Tous les statuts</MenuItem>
                  <MenuItem value="sent">Envoyées</MenuItem>
                  <MenuItem value="scheduled">Planifiées</MenuItem>
                  <MenuItem value="failed">Échecs</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                size="small"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={handleSearch}
                sx={{ flexGrow: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Tooltip title="Actualiser">
                <IconButton 
                  onClick={fetchNotifications}
                  disabled={loading}
                  color="primary"
                  sx={{ alignSelf: 'center' }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <TableContainer component={Paper}>
            {loading && notifications.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
                <Typography color="error">{error}</Typography>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={fetchNotifications}
                  sx={{ mt: 2 }}
                >
                  Réessayer
                </Button>
              </Box>
            ) : (
              <>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 40 }}></TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.field === 'title'}
                          direction={sortConfig.field === 'title' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('title')}
                        >
                          Titre
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.field === 'status'}
                          direction={sortConfig.field === 'status' ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort('status')}
                        >
                          Statut
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortConfig.field === 'createdAt'}
                          direction={sortConfig.field === 'createdAt' ? sortConfig.direction : 'desc'}
                          onClick={() => handleSort('createdAt')}
                        >
                          Date d'envoi
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Destinataire</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedNotifications.length > 0 ? (
                      paginatedNotifications.map((notification) => (
                        <React.Fragment key={notification.id}>
                          <TableRow hover>
                            <TableCell>
                              <ExpandMore
                                expand={expandedRow === notification.id}
                                onClick={() => handleExpandRow(notification.id)}
                                aria-expanded={expandedRow === notification.id}
                                aria-label="Afficher plus"
                              >
                                <ExpandMoreIcon />
                              </ExpandMore>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {notification.title}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {notification.body}
                            </TableCell>
                            <TableCell>
                              {getStatusChip(notification.status)}
                            </TableCell>
                            <TableCell>
                              <Tooltip title={formatDate(notification.createdAt)}>
                                <Typography variant="body2">
                                  {formatRelativeDate(notification.createdAt)}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              {notification.topic ? (
                                <Chip 
                                  label={`Topic: ${notification.topic}`} 
                                  size="small" 
                                  variant="outlined"
                                />
                              ) : notification.userIds && notification.userIds.length > 0 ? (
                                <Tooltip title={notification.userIds.join(', ')}>
                                  <Chip 
                                    label={`${notification.userIds.length} destinataire(s)`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Tooltip>
                              ) : (
                                <Typography variant="body2" color="textSecondary">
                                  Aucun destinataire
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                          
                          {/* Ligne détaillée */}
                          <TableRow>
                            <TableCell style={{ padding: 0 }} colSpan={6}>
                              <Collapse in={expandedRow === notification.id} timeout="auto" unmountOnExit>
                                <Box sx={{ p: 2, backgroundColor: 'action.hover' }}>
                                  <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        Détails de la notification
                                      </Typography>
                                      <Box sx={{ pl: 2, mb: 2 }}>
                                        <Typography variant="body2">
                                          <strong>ID:</strong> {notification.id}
                                        </Typography>
                                        {notification.messageId && (
                                          <Typography variant="body2">
                                            <strong>Message ID:</strong> {notification.messageId}
                                          </Typography>
                                        )}
                                        <Typography variant="body2">
                                          <strong>Créé le:</strong> {formatDate(notification.createdAt)}
                                        </Typography>
                                        <Typography variant="body2">
                                          <strong>Mis à jour le:</strong> {formatDate(notification.updatedAt)}
                                        </Typography>
                                      </Box>
                                      
                                      {notification.data && Object.keys(notification.data).length > 0 && (
                                        <>
                                          <Typography variant="subtitle2" gutterBottom>
                                            Données supplémentaires
                                          </Typography>
                                          <Box component="pre" sx={{ 
                                            p: 1, 
                                            backgroundColor: 'background.paper', 
                                            borderRadius: 1,
                                            overflowX: 'auto',
                                            fontSize: '0.75rem',
                                            mt: 1
                                          }}>
                                            {JSON.stringify(notification.data, null, 2)}
                                          </Box>
                                        </>
                                      )}
                                    </Grid>
                                    
                                    {notification.imageUrl && (
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Aperçu de l'image
                                        </Typography>
                                        <Box 
                                          component="img"
                                          src={notification.imageUrl}
                                          alt="Aperçu de la notification"
                                          sx={{ 
                                            maxWidth: '100%', 
                                            maxHeight: 200, 
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                          }}
                                        />
                                      </Grid>
                                    )}
                                  </Grid>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <SearchIcon color="disabled" fontSize="large" />
                            <Typography variant="body1" color="textSecondary">
                              Aucune notification trouvée
                            </Typography>
                            {(searchQuery || statusFilter !== 'all') && (
                              <Button 
                                variant="text" 
                                size="small" 
                                onClick={() => {
                                  setSearchQuery('');
                                  setStatusFilter('all');
                                }}
                              >
                                Réinitialiser les filtres
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredNotifications.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Lignes par page:"
                  labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
                  }
                />
              </>
            )}
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HistoryPage;
