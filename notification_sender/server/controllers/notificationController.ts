import { Request, Response } from 'express';
import { messaging, db } from '../config';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';

// Interfaces
export interface NotificationData {
  [key: string]: string | number | boolean | null;
}

export interface NotificationInput {
  title: string;
  body: string;
  data?: NotificationData;
  imageUrl?: string;
  userIds?: string[];
  topic?: string;
  scheduledTime?: Date | string;
}

export interface NotificationRecord extends NotificationInput {
  id: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  createdAt: admin.firestore.Timestamp | Date;
  updatedAt: admin.firestore.Timestamp | Date;
  messageId?: string;
  error?: string;
  retryCount?: number;
}

interface PaginationOptions {
  limit: number;
  offset: number;
  total: number;
}

interface NotificationListResponse {
  data: NotificationRecord[];
  pagination: PaginationOptions;
}

// Validation schemas
const notificationSchema = {
  title: { type: 'string', min: 1, max: 100 },
  body: { type: 'string', min: 1, max: 500 },
  imageUrl: { type: 'string', optional: true, pattern: '^https?://.+$' },
  userIds: { type: 'array', items: 'string', optional: true },
  topic: { type: 'string', optional: true, pattern: '^[a-zA-Z0-9-_.~%]+$' },
  scheduledTime: { type: 'date', optional: true, convert: true }
};

// Helper function to validate input
const validateInput = (data: any, schema: any): { valid: boolean; errors?: string[] } => {
  const errors: string[] = [];
  
  for (const [key, rule] of Object.entries(schema)) {
    const value = data[key];
    const ruleObj = rule as any;
    
    if (ruleObj.optional && (value === undefined || value === null)) {
      continue;
    }
    
    if (value === undefined || value === null) {
      errors.push(`${key} is required`);
      continue;
    }
    
    if (ruleObj.type === 'string' && typeof value !== 'string') {
      errors.push(`${key} must be a string`);
    } else if (ruleObj.type === 'number' && typeof value !== 'number') {
      errors.push(`${key} must be a number`);
    } else if (ruleObj.type === 'array' && !Array.isArray(value)) {
      errors.push(`${key} must be an array`);
    } else if (ruleObj.type === 'date' && !(value instanceof Date) && isNaN(Date.parse(value))) {
      errors.push(`${key} must be a valid date`);
    }
    
    if (ruleObj.min && typeof value === 'string' && value.length < ruleObj.min) {
      errors.push(`${key} must be at least ${ruleObj.min} characters`);
    }
    
    if (ruleObj.max && typeof value === 'string' && value.length > ruleObj.max) {
      errors.push(`${key} must be at most ${ruleObj.max} characters`);
    }
    
    if (ruleObj.pattern && typeof value === 'string' && !new RegExp(ruleObj.pattern).test(value)) {
      errors.push(`${key} has an invalid format`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
};

// Envoyer une notification
// Rate limiting configuration
const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 100 // Max requests per window
};

const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

const rateLimitMiddleware = (req: Request, res: Response, next: Function) => {
  const now = Date.now();
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT.WINDOW_MS });
  } else {
    const entry = rateLimitStore.get(ip)!;
    
    if (now > entry.resetTime) {
      // Reset the counter if the window has passed
      entry.count = 1;
      entry.resetTime = now + RATE_LIMIT.WINDOW_MS;
    } else if (entry.count >= RATE_LIMIT.MAX_REQUESTS) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: `${retryAfter} seconds`
      });
    } else {
      // Increment the counter
      entry.count++;
    }
  }
  
  next();
};

export const sendNotification = async (req: Request, res: Response) => {
  try {
    // Apply rate limiting
    rateLimitMiddleware(req, res, () => {});
    
    const { title, body, data, imageUrl, userIds, topic, scheduledTime } = req.body as NotificationInput;
    
    // Input validation
    const validation = validateInput(req.body, notificationSchema);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    if (!topic && (!userIds || userIds.length === 0)) {
      return res.status(400).json({ 
        error: 'Either topic or userIds must be provided' 
      });
    }

    const message: any = {
      notification: {
        title,
        body,
        ...(imageUrl && { image: imageUrl })
      },
      ...(data && { data }),
    };

    // Ciblage (topic ou tokens utilisateurs)
    if (topic) {
      message.topic = topic;
    } else if (userIds && userIds.length > 0) {
      // Récupérer les tokens FCM des utilisateurs
      const tokens = await Promise.all(
        userIds.map(async (userId: string) => {
          const userDoc = await db.collection('users').doc(userId).get();
          return userDoc.data()?.fcmToken;
        })
      );
      
      const validTokens = tokens.filter(Boolean);
      if (validTokens.length === 0) {
        return res.status(400).json({ error: 'No valid FCM tokens found' });
      }
      
      message.tokens = validTokens;
    } else {
      return res.status(400).json({ error: 'Either topic or userIds must be provided' });
    }

    // Check if this is a scheduled notification
    const isScheduled = scheduledTime && new Date(scheduledTime) > new Date();
    
    // Create notification record
    const now = admin.firestore.Timestamp.now();
    const notificationRecord: NotificationRecord = {
      id: uuidv4(),
      title,
      body,
      data,
      imageUrl,
      userIds: userIds || [],
      topic: topic,
      status: isScheduled ? 'scheduled' : 'pending',
      createdAt: now,
      updatedAt: now,
      retryCount: 0
    };
    
    // Save to database first
    const notificationRef = db.collection('notifications').doc(notificationRecord.id);
    await notificationRef.set(notificationRecord);
    
    // Process the notification (send now or schedule)
    if (isScheduled) {
      // Schedule the notification
      const scheduledTimeDate = new Date(scheduledTime);
      const delay = scheduledTimeDate.getTime() - Date.now();
      
      setTimeout(async () => {
        try {
          const response = await messaging.send(message);
          await notificationRef.update({
            status: 'sent',
            messageId: response,
            updatedAt: admin.firestore.Timestamp.now()
          });
        } catch (error) {
          console.error('Error sending scheduled notification:', error);
          await notificationRef.update({
            status: 'failed',
            error: error.message,
            updatedAt: admin.firestore.Timestamp.now(),
            $inc: { retryCount: 1 }
          });
        }
      }, delay);
      
      return res.status(202).json({
        success: true,
        message: 'Notification scheduled',
        scheduledTime: scheduledTimeDate.toISOString(),
        notification: notificationRecord
      });
    }
    
    // Send immediately
    try {
      const response = await messaging.send(message);
      
      // Update the notification record
      await notificationRef.update({
        status: 'sent',
        messageId: response,
        updatedAt: admin.firestore.Timestamp.now()
      });
      
      notificationRecord.status = 'sent';
      notificationRecord.messageId = response;

      return res.status(200).json({
        success: true,
        messageId: response,
        notification: notificationRecord
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      
      // Update notification status to failed
      if (notificationRef) {
        try {
          await notificationRef.update({
            status: 'failed',
            error: error.message,
            updatedAt: admin.firestore.Timestamp.now()
          });
        } catch (updateError) {
          console.error('Error updating notification status:', updateError);
        }
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Failed to send notification',
        details: error.message 
      });
    }
  } catch (error: any) {
    console.error('Error in notification controller:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

// Get notification history with filtering and pagination
export const getNotificationHistory = async (req: Request, res: Response) => {
  try {
    const { 
      limit = '50', 
      offset = '0',
      status,
      topic,
      startDate,
      endDate,
      search
    } = req.query;
    
    // Parse query parameters
    const limitNum = Math.min(Number(limit), 100); // Max 100 items per page
    const offsetNum = Math.max(0, Number(offset));
    
    // Build the query
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = 
      db.collection('notifications');
    
    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (topic) {
      query = query.where('topic', '==', topic);
    }
    
    if (startDate) {
      const start = new Date(startDate as string);
      query = query.where('createdAt', '>=', start);
    }
    
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999); // End of the day
      query = query.where('createdAt', '<=', end);
    }
    
    // Search in title and body if search term is provided
    if (search) {
      // Note: This is a simple implementation. For production, consider using a search service like Algolia
      const searchTerm = (search as string).toLowerCase();
      const snapshot = await query.get();
      
      const filtered = snapshot.docs
        .filter(doc => {
          const data = doc.data();
          return (
            data.title.toLowerCase().includes(searchTerm) ||
            (data.body && data.body.toLowerCase().includes(searchTerm))
          );
        })
        .slice(offsetNum, offsetNum + limitNum)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      
      // Get total count for pagination
      const totalCount = await query.count().get();
      
      const response: NotificationListResponse = {
        data: filtered,
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          total: totalCount.data().count
        }
      };
      
      return res.status(200).json(response);
    }
    
    // If no search, use direct query with pagination
    const [snapshot, totalCount] = await Promise.all([
      query
        .orderBy('createdAt', 'desc')
        .limit(limitNum)
        .offset(offsetNum)
        .get(),
      query.count().get()
    ]);
    
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    const response: NotificationListResponse = {
      data: notifications as NotificationRecord[],
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: totalCount.data().count
      }
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({ error: 'Failed to fetch notification history' });
  }
};

// Get notification details
export const getNotificationDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('notifications').doc(id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }
    
    const data = doc.data() as NotificationRecord;
    
    res.status(200).json({
      success: true,
      data: {
        id: doc.id,
        ...data
      }
    });
  } catch (error) {
    console.error('Error fetching notification details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notification details',
      details: error.message 
    });
  }
};

// Retry failed notification
export const retryNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notificationRef = db.collection('notifications').doc(id);
    const doc = await notificationRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ 
        success: false,
        error: 'Notification not found' 
      });
    }
    
    const notification = doc.data() as NotificationRecord;
    
    if (notification.status !== 'failed') {
      return res.status(400).json({
        success: false,
        error: 'Only failed notifications can be retried'
      });
    }
    
    // Update status to pending
    await notificationRef.update({
      status: 'pending',
      updatedAt: admin.firestore.Timestamp.now(),
      $inc: { retryCount: 1 }
    });
    
    // Prepare the message
    const message: any = {
      notification: {
        title: notification.title,
        body: notification.body,
        ...(notification.imageUrl && { image: notification.imageUrl })
      },
      ...(notification.data && { data: notification.data })
    };
    
    // Set target (topic or tokens)
    if (notification.topic) {
      message.topic = notification.topic;
    } else if (notification.userIds && notification.userIds.length > 0) {
      // Get fresh tokens
      const tokens = await Promise.all(
        notification.userIds.map(async (userId: string) => {
          const userDoc = await db.collection('users').doc(userId).get();
          return userDoc.data()?.fcmToken;
        })
      );
      
      const validTokens = tokens.filter(Boolean);
      if (validTokens.length === 0) {
        throw new Error('No valid FCM tokens found');
      }
      
      message.tokens = validTokens;
    } else {
      throw new Error('No valid target specified');
    }
    
    // Send the notification
    const response = await messaging.send(message);
    
    // Update the notification
    await notificationRef.update({
      status: 'sent',
      messageId: response,
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    res.status(200).json({
      success: true,
      messageId: response,
      notification: {
        id: doc.id,
        ...notification,
        status: 'sent',
        messageId: response,
        updatedAt: admin.firestore.Timestamp.now()
      }
    });
  } catch (error) {
    console.error('Error retrying notification:', error);
    
    // Update notification status to failed
    if (id) {
      try {
        await db.collection('notifications').doc(id).update({
          status: 'failed',
          error: error.message,
          updatedAt: admin.firestore.Timestamp.now()
        });
      } catch (updateError) {
        console.error('Error updating notification status:', updateError);
      }
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to retry notification',
      details: error.message
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Get counts by status
    const [total, sent, failed, pending, scheduled] = await Promise.all([
      db.collection('notifications').count().get(),
      db.collection('notifications').where('status', '==', 'sent').count().get(),
      db.collection('notifications').where('status', '==', 'failed').count().get(),
      db.collection('notifications').where('status', '==', 'pending').count().get(),
      db.collection('notifications').where('status', '==', 'scheduled').count().get()
    ]);
    
    // Get daily stats for the last 30 days
    const dailyStats = await db.collection('notifications')
      .where('createdAt', '>=', thirtyDaysAgo)
      .orderBy('createdAt')
      .get();
    
    const dailyCounts: { [date: string]: number } = {};
    
    // Initialize last 30 days with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
    }
    
    // Count notifications per day
    dailyStats.docs.forEach(doc => {
      const date = (doc.data().createdAt as admin.firestore.Timestamp).toDate();
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
    });
    
    // Convert to array for the chart
    const dailyData = Object.entries(dailyCounts)
      .map(([date, count]) => ({
        date,
        count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    res.status(200).json({
      success: true,
      data: {
        total: total.data().count,
        sent: sent.data().count,
        failed: failed.data().count,
        pending: pending.data().count,
        scheduled: scheduled.data().count,
        dailyData
      }
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get notification statistics',
      details: error.message
    });
  }
};
