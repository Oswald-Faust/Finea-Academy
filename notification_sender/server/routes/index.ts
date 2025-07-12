import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import * as templateController from '../controllers/templateController';

const router = Router();

// Middleware d'authentification (à implémenter)
const authenticate = (req: any, res: any, next: any) => {
  // Vérifier le token JWT ou utiliser Firebase Auth
  // Pour l'instant, on passe simplement à la suite
  next();
};

// Routes pour les notifications
router.post('/notifications', authenticate, notificationController.sendNotification);
router.get('/notifications', authenticate, notificationController.getNotificationHistory);
router.get('/notifications/:id', authenticate, notificationController.getNotificationDetails);

// Routes pour les modèles de notifications
router.post('/templates', authenticate, templateController.createTemplate);
router.get('/templates', authenticate, templateController.getTemplates);
router.put('/templates/:id', authenticate, templateController.updateTemplate);
router.delete('/templates/:id', authenticate, templateController.deleteTemplate);

export default router;
