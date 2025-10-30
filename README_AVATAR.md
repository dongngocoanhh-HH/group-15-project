# 📸 Upload Avatar với Cloudinary - Feature Documentation

## Tổng quan

Feature Upload Avatar cho phép user upload ảnh đại diện, tự động resize và optimize, sau đó lưu lên Cloudinary CDN.

## Công nghệ sử dụng

### Backend
- **Multer**: Handle multipart/form-data upload
- **Sharp**: Resize và optimize ảnh (500x500px, JPEG quality 90%)
- **Cloudinary**: Cloud storage và CDN cho ảnh
- **JWT**: Xác thực user trước khi upload

### Frontend
- **React**: UI components
- **Material-UI**: Upload button và avatar display
- **Fetch API**: Gửi file lên server

## Kiến trúc

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ 1. Select image file
       │ 2. POST /api/users/upload-avatar
       │    (multipart/form-data)
       ▼
┌─────────────┐
│  Backend    │
│  (Express)  │
└──────┬──────┘
       │ 3. Multer parse file → Buffer
       ▼
┌─────────────┐
│   Sharp     │
│  (Resize)   │
└──────┬──────┘
       │ 4. Resize to 500x500px
       │    Convert to JPEG (quality 90%)
       │    Output: Buffer
       ▼
┌─────────────┐
│ Cloudinary  │
│    (CDN)    │
└──────┬──────┘
       │ 5. Upload image
       │    Returns secure_url
       ▼
┌─────────────┐
│  MongoDB    │
│   (User)    │
└──────┬──────┘
       │ 6. Update user.avatar = secure_url
       ▼
┌─────────────┐
│  Response   │
│  to Client  │
└─────────────┘
```

## API Endpoints

### POST /api/users/upload-avatar

**Authentication**: Required (JWT Bearer token)

**Content-Type**: `multipart/form-data`

**Body:**
- `file`: Image file (JPEG/PNG/WebP, max 5MB)

**Response:**
```json
{
  "success": true,
  "message": "Upload avatar thành công",
  "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg",
  "cloudinaryId": "avatars/user_xxx_1234567890",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "User Name",
    "role": "user",
    "avatar": "https://res.cloudinary.com/.../avatar.jpg"
  }
}
```

## Code Implementation

### Backend Controller

```javascript
// backend/controllers/userController.js

exports.uploadAvatar = async (req, res) => {
  // 1. Validate authentication
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
  }
  
  // 2. Validate file exists
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Không có file được upload' });
  }

  // 3. Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)' 
    });
  }

  // 4. Validate file size
  if (req.file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ 
      success: false, 
      message: 'File quá lớn. Tối đa 5MB' 
    });
  }

  // 5. Resize image using Sharp
  const resizedImageBuffer = await sharp(req.file.buffer)
    .resize(500, 500, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 90 })
    .toBuffer();

  // 6. Upload to Cloudinary
  // 7. Update user avatar in MongoDB
  // 8. Return response
};
```

### Frontend Service

```javascript
// frontend/src/services/userService.js

export async function uploadAvatar(file, token = getAccessToken()) {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_URL}/api/users/upload-avatar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    credentials: 'include',
  });
  
  const data = await res.json();
  return data;
}
```

### Frontend Component

```jsx
// frontend/src/pages/Profile.jsx

const onFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const res = await uploadAvatar(file);
  if (res.success) {
    setAvatar(res.avatarUrl);
    setMsg({ type: 'success', text: 'Upload thành công' });
  } else {
    setMsg({ type: 'error', text: res.message });
  }
};
```

## Validation Rules

### File Type
- ✅ Allowed: JPEG, JPG, PNG, WebP
- ❌ Rejected: PDF, GIF, BMP, TIFF, SVG, etc.

### File Size
- ✅ Max: 5MB (5 * 1024 * 1024 bytes)
- ❌ Larger files rejected

### Image Processing
- **Resize**: 500x500 pixels
- **Fit**: Cover (crop to fill, no distortion)
- **Position**: Center
- **Format**: JPEG
- **Quality**: 90%

## Cloudinary Configuration

### Environment Variables

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Upload Options

```javascript
{
  folder: 'avatars',
  resource_type: 'image',
  public_id: `user_${userId}_${timestamp}`,
  transformation: [
    { width: 500, height: 500, crop: 'fill', gravity: 'face' },
    { quality: 'auto' },
    { fetch_format: 'auto' }
  ]
}
```

## Testing

### Unit Tests (Optional)

```javascript
describe('Avatar Upload', () => {
  it('should upload valid image', async () => {
    const file = createMockFile('image/jpeg', 2 * 1024 * 1024);
    const res = await uploadAvatar(file, validToken);
    expect(res.success).toBe(true);
    expect(res.avatarUrl).toMatch(/cloudinary\.com/);
  });

  it('should reject large file', async () => {
    const file = createMockFile('image/jpeg', 10 * 1024 * 1024);
    const res = await uploadAvatar(file, validToken);
    expect(res.success).toBe(false);
    expect(res.message).toContain('quá lớn');
  });
});
```

### Manual Testing Checklist

- [ ] Upload JPEG image (< 5MB) → Success
- [ ] Upload PNG image (< 5MB) → Success
- [ ] Upload WebP image (< 5MB) → Success
- [ ] Upload PDF file → Rejected (file type)
- [ ] Upload 10MB image → Rejected (file size)
- [ ] Upload without login → 401 Unauthorized
- [ ] Avatar displays correctly after upload
- [ ] Avatar URL saved to MongoDB
- [ ] Avatar visible in Cloudinary dashboard

## Security Considerations

1. **Authentication Required**: Only logged-in users can upload
2. **File Type Validation**: Prevent upload of executable files
3. **File Size Limit**: Prevent DoS attacks via large files
4. **Sharp Processing**: Sanitize image, remove EXIF data
5. **Unique Filenames**: Prevent file conflicts using `user_${userId}_${timestamp}`

## Performance Optimization

1. **Memory Storage**: Multer uses memory (no disk I/O)
2. **Sharp Processing**: Fast C++ library for image processing
3. **Cloudinary CDN**: Global CDN for fast image delivery
4. **Auto Format**: Cloudinary serves WebP to supported browsers
5. **Quality Auto**: Cloudinary optimizes quality based on content

## Troubleshooting

### Issue: Sharp installation fails

**Solution:**
```bash
npm uninstall sharp
npm install --platform=win32 --arch=x64 sharp
```

### Issue: Cloudinary upload fails

**Check:**
1. Environment variables set correctly
2. Cloudinary account active
3. API credentials valid
4. Network connection OK

### Issue: Frontend CORS error

**Solution:**
- Ensure `credentials: 'include'` in fetch
- Check CORS config in backend

## Future Enhancements

- [ ] Crop tool trong frontend
- [ ] Multiple avatar sizes (thumbnail, medium, large)
- [ ] Delete old avatar khi upload mới
- [ ] Progress bar cho upload
- [ ] Image preview trước khi upload
- [ ] Support GIF avatars
- [ ] Avatar gallery/history

## Liên hệ

- **Developer**: Group 15
- **Email**: support@group15.com
- **Documentation**: See TESTING_AVATAR.md
