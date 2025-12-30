module.exports = {
  apps: [
    {
      name: 'rental-api',
      script: 'dist/main.js',
      instances: 1, // Chỉ chạy 1 instance vì RAM thấp
      exec_mode: 'fork', // Fork mode thay vì cluster để tiết kiệm RAM
      autorestart: true,
      watch: false,
      max_memory_restart: '400M', // Restart nếu vượt 400MB
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Tối ưu cho low memory
      node_args: '--max-old-space-size=512', // Giới hạn heap size
    },
  ],
};
