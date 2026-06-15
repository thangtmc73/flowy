# Frontend - Insurance FAQ Chat UI

Modern chat interface for the Flowy Agent insurance chatbot, built with React 19 + Vite + TailwindCSS.

## Features

- **Modern Chat UI**: Clean, responsive design với Zalopay branding
- **File Upload**: Drag & drop hoặc click để upload tài liệu (PDF, JSON, TXT, CSV, Excel, Word)
- **Real-time Messaging**: Typing indicators và instant feedback
- **Message Formatting**: Hỗ trợ Markdown, tables, và formatted text
- **Mobile Responsive**: Tối ưu cho cả desktop và mobile
- **Session Management**: Tự động tạo và lưu session IDs

## Tech Stack

- **React 19.2** - Latest React with modern features
- **Vite 8** - Fast build tool with HMR
- **TailwindCSS 4.3** - Utility-first CSS framework
- **ESLint** - Code linting

## Development

### Install Dependencies

```bash
npm install
```

### Run Dev Server

```bash
npm run dev
```

Server chạy tại `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Build output sẽ nằm trong `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # Entry point
│   ├── index.css                # Global styles + Tailwind
│   │
│   ├── components/
│   │   ├── ChatContainer.jsx    # Chat layout wrapper
│   │   ├── MessageBubble.jsx    # Individual message component
│   │   ├── InputArea.jsx        # Message input + file upload
│   │   └── FileUpload.jsx       # Drag & drop file upload
│   │
│   ├── hooks/
│   │   └── useChat.js           # Chat state management hook
│   │
│   ├── utils/
│   │   └── api.js               # API client for backend
│   │
│   └── assets/                  # Images and static assets
│       ├── zlp_logo_horizontal_white.webp
│       └── zlp_logo_square.webp
│
├── public/                      # Static files
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── eslint.config.js            # ESLint rules
└── package.json
```

## Configuration

### Environment Variables

Tạo file `.env` trong folder `frontend/`:

```env
VITE_API_URL=http://localhost:8080
```

**Production**: Update VITE_API_URL to your deployed backend URL.

### API Client

File `src/utils/api.js` chứa functions để gọi backend API:

```javascript
import { sendMessage } from './utils/api'

const response = await sendMessage({
  message: 'Hello',
  userId: 'user123',
  sessionId: 'session456',
  file: null  // optional
})
```

## Components

### ChatContainer

Main layout component chứa header, messages, và input area.

### MessageBubble

Hiển thị một tin nhắn (user hoặc bot). Hỗ trợ:
- Markdown rendering
- Table formatting
- Error states
- Typing indicator

### InputArea

Input box với các features:
- Auto-resize textarea
- File upload integration
- Send button
- Enter to send (Shift+Enter for newline)

### FileUpload

Drag & drop file upload component:
- Validates file type và size
- Shows file preview
- Parses JSON files
- Base64 encodes binary files

## Styling

### TailwindCSS

Project sử dụng TailwindCSS 4.3 với custom theme:

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: '#0068FF',      // Zalopay blue
        'brand-light': '#E6F0FF'
      }
    }
  }
}
```

### Custom Styles

Global styles trong `src/index.css`:
- Font: System fonts với fallbacks
- Scrollbar styling
- Markdown rendering styles

## Deployment

### Docker Build

Frontend được build trong Docker multi-stage build và served bởi nginx:

```dockerfile
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build
```

### Static Hosting

Deploy `dist/` folder lên:
- Vercel
- Netlify
- CloudFlare Pages
- AWS S3 + CloudFront

**Important**: Update VITE_API_URL để trỏ đến backend URL.

## ESLint Configuration

ESLint config với React rules:

```bash
npm run lint
```

Fix auto-fixable issues:

```bash
npm run lint -- --fix
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari, Chrome Android

## Performance

- Code splitting: React lazy loading (nếu cần)
- Vite optimizations: Tree shaking, minification
- Image optimization: WebP format
- TailwindCSS purge: Unused styles removed in production

## Contributing

1. Follow React best practices
2. Use functional components và hooks
3. Keep components small và reusable
4. Add PropTypes hoặc migrate to TypeScript (future)
5. Test locally trước khi commit

## Troubleshooting

**Issue**: API calls fail

- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check browser console for CORS errors

**Issue**: File upload not working

- Check file size < 10MB
- Verify file type is allowed
- Check browser console for errors

**Issue**: Styles not applying

- Clear Vite cache: `rm -rf node_modules/.vite`
- Rebuild: `npm run build`

## Future Improvements

- [ ] Migrate to TypeScript
- [ ] Add unit tests (Vitest)
- [ ] Add E2E tests (Playwright)
- [ ] Implement message streaming
- [ ] Add voice input
- [ ] Add image support in chat
- [ ] Add conversation export (PDF/JSON)

## Resources

- [React Docs](https://react.dev/)
- [Vite Docs](https://vite.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Vite React Plugin](https://github.com/vitejs/vite-plugin-react)
