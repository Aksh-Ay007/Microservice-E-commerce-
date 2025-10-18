# Notification System Documentation

## Overview
This notification system provides real-time notifications for admin users and sellers in the e-commerce platform. It includes both database persistence and real-time WebSocket delivery.

## Architecture

### Components
1. **Notification Service** (Port 6009) - WebSocket server for real-time notifications
2. **Admin UI** - Real-time notification dashboard for admins
3. **Seller UI** - Real-time notification dashboard for sellers
4. **Product Service** - Triggers notifications when products/events are created
5. **Admin Service** - Manages notification CRUD operations
6. **API Gateway** - Routes notification requests

### Database Schema
```prisma
model notifications {
  id            String               @id @default(auto()) @map("_id") @db.ObjectId
  creatorId     String               @db.ObjectId
  receiverId    String
  redirect_link String?
  title         String
  message       String
  status        notificationStatus   @default(Unread)
  type          notificationType     @default(general)
  priority      notificationPriority @default(normal)
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt

  creator users @relation("NotificationCreator", fields: [creatorId], references: [id], onDelete: Cascade)

  @@index([receiverId, status])
  @@index([createdAt])
  @@index([type])
  @@index([priority])
}
```

## Features

### Real-time Notifications
- WebSocket-based real-time delivery
- Automatic reconnection on connection loss
- Notification count badges in UI
- Mark as read/unread functionality

### Notification Types
- **Product**: New product created, product approved/rejected
- **Order**: New order, order status changes
- **System**: System maintenance, updates
- **General**: General notifications

### Priority Levels
- **Low**: Informational notifications
- **Normal**: Standard notifications
- **High**: Important notifications requiring attention
- **Urgent**: Critical notifications requiring immediate action

## API Endpoints

### Admin Notifications
- `GET /api/admin/notifications` - Get all notifications with filters
- `GET /api/admin/notifications/stats` - Get notification statistics
- `PUT /api/admin/notifications/:id/read` - Mark notification as read
- `PUT /api/admin/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/admin/notifications/:id` - Delete notification
- `POST /api/admin/notifications` - Create notification

### Seller Notifications
- `GET /api/seller/notifications` - Get seller notifications
- `PUT /api/seller/notifications/:id/read` - Mark notification as read
- `PUT /api/seller/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/seller/notifications/:id` - Delete notification

## WebSocket Events

### Client to Server
- `join` - Join notification room (admin/seller)
- `getNotifications` - Request current notifications

### Server to Client
- `newNotification` - New notification received
- `notifications` - Current notifications list
- `joined` - Successfully joined room
- `error` - Error occurred

## Usage Examples

### Creating a Notification
```typescript
// In product service when creating an event
await notificationService.sendNotificationToAdmins({
  title: "New Event Created",
  message: `A new event "${title}" has been created by ${seller.name}.`,
  type: "product",
  priority: "normal",
  redirect_link: `/admin/events/${eventId}`
});
```

### Using Notifications in UI
```typescript
// In React component
const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

// Mark notification as read
await markAsRead(notificationId);

// Mark all as read
await markAllAsRead();
```

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:
```env
NEXT_PUBLIC_NOTIFICATION_SERVICE_URL=http://localhost:6009
NOTIFICATION_SERVICE_URL=http://localhost:6009
```

### 2. Start Services
```bash
# Start notification service
cd apps/notification-service
npm install
npm run start:dev

# Start other services
npm run start:dev
```

### 3. Database Migration
The notification schema is already included in the Prisma schema. Run:
```bash
npx prisma db push
```

## Notification Triggers

### Automatic Triggers
1. **Product Creation**: Notifies admins when sellers create products
2. **Event Creation**: Notifies admins when sellers create events
3. **Order Updates**: Notifies relevant parties about order changes
4. **System Events**: Notifies about system maintenance, updates

### Manual Triggers
- Admins can create notifications for specific users
- System can create broadcast notifications
- Custom triggers can be added as needed

## UI Components

### Admin Dashboard
- Real-time notification list
- Filter by status, type, priority
- Search functionality
- Mark as read/unread
- Delete notifications
- Statistics dashboard

### Seller Dashboard
- Real-time notification list
- Filter and search
- Mark as read/unread
- Delete notifications
- Notification count badge in sidebar

## Performance Considerations

### Database Indexes
- `receiverId + status` - Fast filtering by user and read status
- `createdAt` - Fast sorting by date
- `type` - Fast filtering by notification type
- `priority` - Fast filtering by priority

### WebSocket Optimization
- Connection pooling
- Automatic reconnection
- Efficient message broadcasting
- Rate limiting for high-frequency updates

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check WebSocket connection status
   - Verify notification service is running
   - Check browser console for errors

2. **Real-time updates not working**
   - Ensure WebSocket URL is correct
   - Check if user is properly authenticated
   - Verify notification service is accessible

3. **Database errors**
   - Check Prisma schema is up to date
   - Verify database connection
   - Check notification indexes exist

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=notification:*
```

## Future Enhancements

1. **Email Notifications**: Send email for important notifications
2. **Push Notifications**: Browser push notifications
3. **Mobile App**: React Native notification support
4. **Notification Templates**: Customizable notification templates
5. **Analytics**: Notification engagement tracking
6. **Bulk Operations**: Bulk mark as read/delete
7. **Notification Scheduling**: Schedule notifications for later delivery