import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
  Paper,
  useTheme,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { Send as SendIcon, Save as SaveIcon } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { sendNotification } from '@/services/notificationService';
import { getTemplates, NotificationTemplate } from '@/services/templateService';

// Types
type NotificationFormData = {
  title: string;
  body: string;
  token: string;
  templateId?: string;
  topic?: string;
  imageUrl?: string;
};

// Validation schema
const notificationSchema = yup.object().shape({
  title: yup.string().required('Le titre est requis'),
  body: yup.string().required('Le message est requis'),
  token: yup.string().when('topic', {
    is: (topic: string) => !topic,
    then: (schema) => schema.required("L'identifiant du dispositif est requis si aucun sujet n'est sélectionné"),
    otherwise: (schema) => schema.notRequired(),
  }),
  topic: yup.string(),
  templateId: yup.string(),
  imageUrl: yup.string().url('Doit être une URL valide'),
});

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [isSending, setIsSending] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
  
  // Charger les modèles au montage du composant
  React.useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const data = await getTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Erreur lors du chargement des modèles:', error);
        setSnackbar({
          open: true,
          message: 'Erreur lors du chargement des modèles',
          severity: 'error',
        });
      } finally {
        setIsLoadingTemplates(false);
      }
    };
    
    fetchTemplates();
  }, []);

  const { control, handleSubmit, formState: { errors }, reset, getValues, watch } = useForm<NotificationFormData>({
    resolver: yupResolver(notificationSchema),
    defaultValues: {
      title: '',
      body: '',
      token: '',
      topic: '',
      templateId: '',
      imageUrl: '',
    },
  });
  
  // Observer les changements pour le débogage
  const formValues = watch();

  const onSubmit = async (data: NotificationFormData) => {
    try {
      console.log('Envoi de la notification:', data);
      setIsSending(true);
      
      // Préparer les données pour l'API
      const notificationData = {
        title: data.title,
        body: data.body,
        ...(data.topic ? { topic: data.topic } : { userIds: [data.token] }),
        ...(data.imageUrl && { imageUrl: data.imageUrl }),
        data: {
          // Ajouter des données supplémentaires si nécessaire
          timestamp: new Date().toISOString(),
        },
      };
      
      // Envoyer la notification via le service
      const response = await sendNotification(notificationData);
      
      console.log('Réponse du serveur:', response);
      
      // Afficher un message de succès
      setSnackbar({
        open: true,
        message: 'Notification envoyée avec succès!',
        severity: 'success',
      });
      
      // Réinitialiser le formulaire
      reset();
      
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      
      setSnackbar({
        open: true,
        message: error.message || 'Erreur lors de l\'envoi de la notification',
        severity: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };
  
  // Gérer la sélection d'un modèle
  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    const templateId = event.target.value;
    if (templateId) {
      const selectedTemplate = templates.find(t => t.id === templateId);
      if (selectedTemplate) {
        reset({
          ...getValues(),
          title: selectedTemplate.title,
          body: selectedTemplate.body,
          templateId: selectedTemplate.id,
        });
      }
    }
  };

  const handleSaveAsTemplate = (data: NotificationFormData) => {
    // TODO: Implement save as template functionality
    console.log('Saving as template:', data);
    setSnackbar({
      open: true,
      message: 'Modèle enregistré avec succès!',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Nouvelle notification
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Composer une notification" />
            <Divider />
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  {/* Sélecteur de modèle */}
                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id="template-select-label">Charger un modèle</InputLabel>
                      <Select
                        labelId="template-select-label"
                        id="template-select"
                        value={formValues.templateId || ''}
                        onChange={handleTemplateChange}
                        label="Charger un modèle"
                        disabled={isLoadingTemplates}
                      >
                        <MenuItem value="">
                          <em>Aucun modèle sélectionné</em>
                        </MenuItem>
                        {templates.map((template) => (
                          <MenuItem key={template.id} value={template.id}>
                            {template.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="token"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Identifiant du dispositif (token FCM)"
                          variant="outlined"
                          error={!!errors.token}
                          helperText={errors.token?.message || 'Laissez vide si vous utilisez un sujet'}
                          disabled={!!formValues.topic}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="topic"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Sujet (topic) - Optionnel"
                          variant="outlined"
                          placeholder="ex: news_updates"
                          helperText="Laissez vide pour envoyer à un appareil spécifique"
                          disabled={!!formValues.token}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Controller
                      name="imageUrl"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="URL de l'image (optionnel)"
                          variant="outlined"
                          error={!!errors.imageUrl}
                          helperText={errors.imageUrl?.message || 'URL d\'une image à afficher dans la notification'}
                        />
                      )}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSubmit(handleSaveAsTemplate)}
                        disabled={isSending}
                      >
                        Enregistrer comme modèle
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        disabled={isSending}
                      >
                        {isSending ? 'Envoi en cours...' : 'Envoyer la notification'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Aperçu" />
            <Divider />
            <CardContent>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  backgroundColor: theme.palette.background.paper,
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <Typography variant="subtitle1" fontWeight="bold">
                      {field.value || '(Aucun titre)'}
                    </Typography>
                  )}
                />
                <Divider />
                <Controller
                  name="body"
                  control={control}
                  render={({ field }) => (
                    <Typography variant="body2" color="text.secondary">
                      {field.value || 'Aperçu du message de la notification...'}
                    </Typography>
                  )}
                />
              </Paper>
            </CardContent>
          </Card>
          
          <Box mt={3}>
            <Card>
              <CardHeader title="Statistiques" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Aucune donnée disponible pour le moment.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
