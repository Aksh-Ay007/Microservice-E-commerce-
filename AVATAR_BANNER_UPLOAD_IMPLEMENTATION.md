# Avatar and Banner Upload Implementation

## Overview
This implementation provides avatar upload functionality for users and both avatar and banner upload functionality for sellers using ImageKit as the image storage service.

## Database Schema Changes

### Updated Models

#### 1. `images` Model
```prisma
model images {
  id         String  @id @default(auto()) @map("_id") @db.ObjectId
  file_id    String
  url        String
  userId     String? @db.ObjectId
  shopId     String? @db.ObjectId
  productsId String? @db.ObjectId
  type       String? @default("general") // "avatar", "banner", "product", "general"

  users    users[]   @relation
  products products? @relation(fields: [productsId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  shopAvatars shops[] @relation("ShopAvatar")
  shopBanners shops[] @relation("ShopBanner")
}
```

#### 2. `shops` Model
```prisma
model shops {
  // ... existing fields ...
  avatar        images?       @relation("ShopAvatar", fields: [avatarId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  coverBanner   images?       @relation("ShopBanner", fields: [bannerId], references: [id], onDelete: NoAction, onUpdate: NoAction)
  // ... existing fields ...
  avatarId      String?       @db.ObjectId
  bannerId      String?       @db.ObjectId
  // ... existing fields ...
}
```

## API Endpoints

### User Avatar Upload
- **Endpoint**: `POST /api/update-avatar`
- **Authentication**: Required (User token)
- **Request Body**:
  ```json
  {
    "fileName": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Avatar updated successfully",
    "avatarUrl": "https://ik.imagekit.io/your-endpoint/avatars/avatar-userId-timestamp.jpg"
  }
  ```

### Seller Avatar Upload
- **Endpoint**: `POST /api/seller/update-avatar`
- **Authentication**: Required (Seller token)
- **Request Body**:
  ```json
  {
    "fileName": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Avatar updated successfully",
    "avatarUrl": "https://ik.imagekit.io/your-endpoint/seller-avatars/seller-avatar-sellerId-timestamp.jpg"
  }
  ```

### Seller Banner Upload
- **Endpoint**: `POST /api/seller/update-banner`
- **Authentication**: Required (Seller token)
- **Request Body**:
  ```json
  {
    "fileName": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Banner updated successfully",
    "bannerUrl": "https://ik.imagekit.io/your-endpoint/seller-banners/seller-banner-sellerId-timestamp.jpg"
  }
  ```

## Implementation Details

### 1. User Avatar Upload (`apps/auth-services/src/controllers/auth.controller.ts`)
- Function: `updateUserAvatar`
- Route: `POST /api/update-avatar`
- Features:
  - Validates user authentication
  - Uploads image to ImageKit with folder `/avatars`
  - Deletes old avatar if exists
  - Creates new image record with type "avatar"
  - Updates user's `imagesId` field

### 2. Seller Avatar Upload (`apps/seller-service/src/controller/seller.controller.ts`)
- Function: `updateSellerAvatar`
- Route: `POST /api/seller/update-avatar`
- Features:
  - Validates seller authentication
  - Finds seller's shop
  - Uploads image to ImageKit with folder `/seller-avatars`
  - Deletes old avatar if exists
  - Creates new image record with type "avatar"
  - Updates shop's `avatarId` field

### 3. Seller Banner Upload (`apps/seller-service/src/controller/seller.controller.ts`)
- Function: `updateSellerBanner`
- Route: `POST /api/seller/update-banner`
- Features:
  - Validates seller authentication
  - Finds seller's shop
  - Uploads image to ImageKit with folder `/seller-banners`
  - Deletes old banner if exists
  - Creates new image record with type "banner"
  - Updates shop's `bannerId` field

## ImageKit Configuration

The implementation uses the existing ImageKit configuration in `packages/libs/imagekit/index.ts`:

```typescript
import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_SECRET_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});
```

## Frontend Integration

### User Avatar Upload (Already implemented)
The user avatar upload is already implemented in `apps/user-ui/src/app/(routes)/profile/page.tsx`:

```typescript
const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64String = reader.result as string;
    
    try {
      await axiosInstance.post("/api/update-avatar", {
        fileName: base64String,
      });
      toast.success("Profile photo updated!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Upload failed");
    }
  };
  reader.readAsDataURL(file);
};
```

### Seller Avatar/Banner Upload (To be implemented in seller UI)
Similar implementation can be added to the seller dashboard for avatar and banner uploads.

## Error Handling

All upload functions include comprehensive error handling:
- Authentication validation
- File validation
- ImageKit upload errors
- Database operation errors
- Old image cleanup errors (non-blocking)

## Security Considerations

1. **Authentication**: All endpoints require proper authentication
2. **File Validation**: Base64 image data is validated
3. **ImageKit Security**: Uses private key for server-side operations
4. **Database Relations**: Proper foreign key constraints with NoAction on delete/update to prevent cascading issues

## Testing

A test script is provided in `test-avatar-upload.js` that can be used to verify the implementation:

```bash
node test-avatar-upload.js
```

## Migration Steps

1. ✅ Updated Prisma schema with new relations
2. ✅ Generated Prisma client
3. ✅ Implemented seller avatar upload controller
4. ✅ Implemented seller banner upload controller
5. ✅ Added routes for seller uploads
6. ✅ Updated user avatar upload to include type field
7. ✅ Fixed circular reference issues in schema

## Next Steps

1. **Frontend Implementation**: Add seller avatar/banner upload UI to seller dashboard
2. **Database Migration**: Run `npx prisma db push` to apply schema changes to database
3. **Testing**: Test all endpoints with proper authentication
4. **Error Handling**: Add more specific error messages for different failure scenarios
5. **Image Optimization**: Consider adding image resizing/optimization before upload

## File Structure

```
├── prisma/schema.prisma (Updated)
├── apps/auth-services/src/controllers/auth.controller.ts (Updated)
├── apps/seller-service/src/controller/seller.controller.ts (Updated)
├── apps/seller-service/src/routes/seller.router.ts (Updated)
├── packages/libs/imagekit/index.ts (Existing)
├── test-avatar-upload.js (New)
└── AVATAR_BANNER_UPLOAD_IMPLEMENTATION.md (New)
```