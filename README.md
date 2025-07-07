# URL Threat Analyzer

A modern, AI-powered web application for analyzing URLs and detecting potential security threats. Built with Next.js 14, TypeScript, and Tailwind CSS, featuring real-time threat analysis using VirusTotal and HuggingFace APIs.

## ✨ Features

### Core Functionality
- **Real-time URL Analysis**: Instant threat detection using multiple security services
- **Dual-Engine Detection**: Combines VirusTotal's comprehensive database with AI-powered analysis
- **Batch Analysis**: Analyze multiple URLs simultaneously (up to 10 per batch)
- **Smart Caching**: 15-minute result caching to reduce API calls
- **URL History**: Track and re-analyze previously checked URLs

### Enhanced User Experience
- **Modern UI/UX**: Beautiful, responsive interface with smooth animations
- **Dark Mode**: Full dark mode support with system preference detection
- **Educational Content**: Learn about phishing, malware, and URL safety
- **Detailed Results**: Comprehensive threat information with actionable recommendations
- **Export Functionality**: Download batch analysis results as CSV

### Technical Features
- **Progressive Web App**: Optimized for all devices
- **Server-Side Rendering**: Fast initial load with Next.js
- **Type Safety**: Full TypeScript implementation
- **API Routes**: Secure backend API with proper error handling
- **Vercel-Ready**: Optimized for deployment on Vercel

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- VirusTotal API key
- HuggingFace API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/amanthanvi/malicious-url-detector.git
cd malicious-url-detector
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
VIRUSTOTAL_API_KEY=your_virustotal_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌐 Deployment

### Deploy to Vercel

The easiest way to deploy is using Vercel:

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `VIRUSTOTAL_API_KEY`
   - `HUGGINGFACE_API_KEY`
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amanthanvi/malicious-url-detector)

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI, Hero Icons
- **Animations**: Framer Motion
- **State Management**: Zustand
- **API Integration**: Axios
- **Theme**: next-themes
- **Analytics**: Vercel Analytics

## 📚 API Documentation

### POST /api/analyze

Analyzes a single URL for threats.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "timestamp": "2024-01-01T00:00:00Z",
  "status": "safe|suspicious|malicious|error",
  "summary": "Analysis summary",
  "details": {
    "virusTotal": { ... },
    "huggingFace": { ... }
  },
  "threatInfo": { ... }
}
```

## 🔐 Security Considerations

- API keys are stored as environment variables
- Input validation on all user inputs
- Rate limiting implemented via caching
- No user data is permanently stored
- HTTPS enforced in production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [VirusTotal](https://www.virustotal.com) for their comprehensive threat intelligence API
- [HuggingFace](https://huggingface.co) for the [malware-url-detect](https://huggingface.co/elftsdmr/malware-url-detect) model
- [Vercel](https://vercel.com) for hosting and deployment

## 📧 Contact

Aman Thanvi - contact@amanthanvi.com | aman_thanvi@outlook.com

Project Link: [https://github.com/amanthanvi/malicious-url-detector](https://github.com/amanthanvi/malicious-url-detector)