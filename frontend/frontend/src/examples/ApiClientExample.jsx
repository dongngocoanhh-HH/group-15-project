// Example: Using apiClient with auto-refresh token
// frontend/src/examples/ApiClientExample.jsx

import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';
import { apiGet, parseJsonResponse } from '../utils/apiClient';

export default function ApiClientExample() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Example: Protected API call với auto-refresh
  const testProtectedApi = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Gọi API protected với auto-refresh
      const response = await apiGet('/api/profile');
      const data = await parseJsonResponse(response);
      
      if (response.ok) {
        setResult(`✅ Success: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        API Client với Auto-Refresh Token Demo
      </Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Click nút bên dưới để test API call. Nếu Access Token hết hạn,
          hệ thống sẽ tự động:
        </Typography>
        <ol>
          <li>Phát hiện token hết hạn (401 - TOKEN_EXPIRED)</li>
          <li>Gọi /api/auth/refresh để lấy token mới</li>
          <li>Retry request với token mới</li>
          <li>Trả về kết quả như bình thường</li>
        </ol>
      </Paper>

      <Button 
        variant="contained" 
        onClick={testProtectedApi}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? 'Đang gọi API...' : 'Test Protected API'}
      </Button>

      {result && (
        <Alert severity={result.startsWith('✅') ? 'success' : 'error'}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{result}</pre>
        </Alert>
      )}
    </Box>
  );
}
