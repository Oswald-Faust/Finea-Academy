import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Paper,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Save as SaveIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';

// Types
type SettingsFormData = {
  apiKey: string;
  notificationsEnabled: boolean;
  maxNotifications: number;
  theme: 'light' | 'dark';
};

const SettingsPage: React.FC = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Load settings (simulated)
  const loadSettings = (): SettingsFormData => ({
    apiKey: 'sk_test_1234567890abcdef',
    notificationsEnabled: true,
    maxNotifications: 100,
    theme: 'light',
  });

  const { control, handleSubmit, reset } = useForm<SettingsFormData>({
    defaultValues: loadSettings(),
  });

  const handleSaveSettings = async (data: SettingsFormData) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In a real app, you would save these settings to your backend
      console.log('Saving settings:', data);
      
      setSnackbar({
        open: true,
        message: 'Paramètres enregistrés avec succès!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la sauvegarde des paramètres',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Paramètres
      </Typography>

      <form onSubmit={handleSubmit(handleSaveSettings)}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Paramètres généraux" />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Controller
                      name="apiKey"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Clé API FCM"
                          variant="outlined"
                          type={showApiKey ? 'text' : 'password'}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={toggleApiKeyVisibility}
                                  edge="end"
                                >
                                  {showApiKey ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    />
                    <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
                      La clé API est utilisée pour envoyer des notifications via Firebase Cloud Messaging.
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Controller
                      name="notificationsEnabled"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              color="primary"
                            />
                          }
                          label={
                            <Box>
                              <Typography>Notifications activées</Typography>
                              <Typography variant="caption" color="textSecondary">
                                Activez ou désactivez les notifications push
                              </Typography>
                            </Box>
                          }
                          labelPlacement="end"
                          sx={{ m: 0, width: '100%' }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="maxNotifications"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          type="number"
                          label="Nombre maximum de notifications"
                          variant="outlined"
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                          InputProps={{
                            inputProps: { min: 1, max: 1000 },
                          }}
                        />
                      )}
                    />
                    <Typography variant="caption" color="textSecondary" component="p" sx={{ mt: 1 }}>
                      Nombre maximum de notifications à conserver dans l'historique
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Actions" />
              <Divider />
              <CardContent>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={isSaving}
                    fullWidth
                  >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => reset(loadSettings())}
                    disabled={isSaving}
                    fullWidth
                  >
                    Réinitialiser
                  </Button>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      if (window.confirm('Voulez-vous vraiment réinitialiser tous les paramètres ?')) {
                        reset({
                          apiKey: '',
                          notificationsEnabled: true,
                          maxNotifications: 100,
                          theme: 'light',
                        });
                      }
                    }}
                    disabled={isSaving}
                    fullWidth
                  >
                    Réinitialiser tout
                  </Button>
                </Box>
              </CardContent>
            </Card>
            
            <Box mt={3}>
              <Card>
                <CardHeader title="À propos" />
                <CardContent>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    <strong>Version:</strong> 1.0.0
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    <strong>Dernière mise à jour:</strong> 30/06/2024
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    FineA Notification Dashboard - Générez et gérez facilement vos notifications push.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </form>

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

export default SettingsPage;
