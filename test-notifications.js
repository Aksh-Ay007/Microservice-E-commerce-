const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Simple notification routes for testing
app.get('/api/admin/notifications', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, priority, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notifications.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      }),
      prisma.notifications.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

app.get('/api/admin/notifications/stats', async (req, res) => {
  try {
    const [total, unread, byType, byPriority] = await Promise.all([
      prisma.notifications.count(),
      prisma.notifications.count({ where: { status: 'Unread' } }),
      prisma.notifications.groupBy({
        by: ['type'],
        _count: { type: true }
      }),
      prisma.notifications.groupBy({
        by: ['priority'],
        _count: { priority: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        total,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {}),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count.priority;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification statistics' });
  }
});

const port = 6007;
app.listen(port, () => {
  console.log(`Test notification service running on port ${port}`);
});
