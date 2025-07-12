import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Tooltip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Types
type Template = {
  id: string;
  name: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

type TemplateFormData = {
  name: string;
  title: string;
  body: string;
};

// Validation schema
const templateSchema = yup.object().shape({
  name: yup.string().required('Le nom est requis'),
  title: yup.string().required('Le titre est requis'),
  body: yup.string().required('Le message est requis'),
});

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: yupResolver(templateSchema),
    defaultValues: {
      name: '',
      title: '',
      body: '',
    },
  });

  // Load templates (simulated)
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        // Mock data
        const mockTemplates: Template[] = [
          {
            id: '1',
            name: 'Bienvenue',
            title: 'Bienvenue sur FineA',
            body: 'Merci de nous avoir rejoint!',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            name: 'Nouveau cours',
            title: 'Nouveau cours disponible',
            body: 'Découvrez notre nouveau cours!',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleOpenDialog = (template: Template | null = null) => {
    if (template) {
      setEditingTemplate(template);
      reset({
        name: template.name,
        title: template.title,
        body: template.body,
      });
    } else {
      setEditingTemplate(null);
      reset({
        name: '',
        title: '',
        body: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveTemplate = async (data: TemplateFormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      if (editingTemplate) {
        // Update existing template
        setTemplates(
          templates.map((t) =>
            t.id === editingTemplate.id
              ? {
                  ...t,
                  ...data,
                  updatedAt: new Date(),
                }
              : t
          )
        );
      } else {
        // Add new template
        const newTemplate: Template = {
          id: Date.now().toString(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setTemplates([...templates, newTemplate]);
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTemplateToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setTemplates(templates.filter((t) => t.id !== templateToDelete));
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleUseTemplate = (template: Template) => {
    // This would typically navigate to the dashboard with the template data
    console.log('Using template:', template);
    // Navigate to dashboard with template data
    // navigate('/', { state: { template } });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Modèles de notifications
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau modèle
        </Button>
      </Box>

      <Card>
        <CardHeader title="Mes modèles" />
        <Divider />
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : templates.length === 0 ? (
            <Box textAlign="center" p={4}>
              <Typography variant="body1" color="textSecondary">
                Aucun modèle enregistré. Créez votre premier modèle pour gagner du temps!
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{ mt: 2 }}
              >
                Créer un modèle
              </Button>
            </Box>
          ) : (
            <List>
              {templates.map((template) => (
                <React.Fragment key={template.id}>
                  <ListItem
                    component={Paper}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      borderRadius: 1,
                      '&:hover': {
                        boxShadow: 1,
                      },
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" mb={0.5}>
                          <Typography variant="subtitle1" fontWeight="medium">
                            {template.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ ml: 1 }}
                          >
                            {formatDate(template.updatedAt)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography
                            variant="body2"
                            color="textPrimary"
                            component="div"
                            sx={{
                              fontWeight: 'medium',
                              mb: 0.5,
                            }}
                          >
                            {template.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            component="div"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {template.body}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <ListItemSecondaryAction>
                      <Box display="flex" gap={1}>
                        <Tooltip title="Utiliser ce modèle">
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={() => handleUseTemplate(template)}
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton
                            edge="end"
                            onClick={() => handleOpenDialog(template)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleDeleteClick(template.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Template Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(handleSaveTemplate)}>
          <DialogTitle>
            {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Nom du modèle"
                      variant="outlined"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      autoFocus
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Titre de la notification"
                      variant="outlined"
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="body"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Message de la notification"
                      variant="outlined"
                      error={!!errors.body}
                      helperText={errors.body?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingTemplate ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Supprimer le modèle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplatesPage;
