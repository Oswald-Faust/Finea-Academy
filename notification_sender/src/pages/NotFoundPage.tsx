import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  useTheme,
} from '@mui/material';
import { Home as HomeIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Card elevation={3} sx={{ width: '100%', maxWidth: 600, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h1"
              component="div"
              sx={{
                fontSize: '6rem',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mb: 2,
                lineHeight: 1,
              }}
            >
              404
            </Typography>
            
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 'bold', mb: 2 }}
            >
              Page non trouvée
            </Typography>
            
            <Typography
              variant="body1"
              color="textSecondary"
              paragraph
              sx={{ mb: 4, maxWidth: '80%', mx: 'auto' }}
            >
              La page que vous recherchez semble avoir été déplacée, supprimée ou n'a jamais existé.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                sx={{ minWidth: 200, mb: 1 }}
              >
                Page d'accueil
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ minWidth: 200, mb: 1 }}
              >
                Retour
              </Button>
            </Box>
            
            <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="textSecondary">
                Code d'erreur: 404 | Page non trouvée
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
