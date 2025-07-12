import { Request, Response } from 'express';
import { db } from '../config';
import { v4 as uuidv4 } from 'uuid';

// Créer un modèle de notification
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const { name, title, body, data } = req.body;
    const userId = req.user?.uid; // À partir du middleware d'authentification

    // Validation
    if (!name || !title || !body) {
      return res.status(400).json({ error: 'Name, title, and body are required' });
    }

    const template = {
      id: uuidv4(),
      name,
      title,
      body,
      data: data || {},
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('templates').doc(template.id).set(template);

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

// Récupérer tous les modèles
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('templates')
      .orderBy('updatedAt', 'desc')
      .get();
    
    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

// Mettre à jour un modèle
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, title, body, data } = req.body;
    const userId = req.user?.uid;

    // Vérifier si le modèle existe
    const doc = await db.collection('templates').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Vérifier les autorisations (seul le créateur peut modifier)
    const template = doc.data();
    if (template.createdBy !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this template' });
    }

    const updates = {
      ...(name && { name }),
      ...(title && { title }),
      ...(body && { body }),
      ...(data && { data }),
      updatedAt: new Date(),
    };

    await db.collection('templates').doc(id).update(updates);

    res.status(200).json({
      id,
      ...updates
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

// Supprimer un modèle
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid;

    // Vérifier si le modèle existe
    const doc = await db.collection('templates').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Vérifier les autorisations (seul le créateur peut supprimer)
    const template = doc.data();
    if (template.createdBy !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this template' });
    }

    await db.collection('templates').doc(id).delete();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};
