# Voice-Enabled AI Expense Tracker

An intuitive, voice-enabled AI assistant expense tracker that categorizes expenses through natural language input, provides monthly/yearly spending summaries, and visualizes data through clean infographics.

## 🌟 Features

### Voice Input
- **Natural Language Processing**: Speak your expenses in natural language
- **AI-Powered Extraction**: Automatically extracts amount, merchant, and category
- **Web Speech API**: Works in modern browsers with no additional setup
- **Real-time Feedback**: See your speech being transcribed live

### Smart Categorization
- **Dynamic Categories**: AI automatically categorizes your expenses
- **Standard Categories**: Food & Drink, Transportation, Shopping, Entertainment, etc.
- **Learning System**: Improves categorization based on your spending patterns

### Interactive Dashboard
- **Spending Trends**: Visual charts showing spending over time
- **Category Breakdown**: Pie charts showing spending by category
- **Key Metrics**: Today's spending, monthly totals, average expenses
- **Recent Transactions**: Quick view of latest expenses

### Complete Expense Management
- **Manual Entry**: Traditional form-based expense entry
- **Edit & Delete**: Full CRUD operations on all expenses
- **Search & Filter**: Find expenses quickly with advanced filtering
- **Responsive Design**: Works perfectly on mobile and desktop

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Chart.js** with react-chartjs-2 for visualizations
- **React Router** for navigation
- **React Hook Form** for form handling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM for database management
- **PostgreSQL** for data storage
- **OpenAI API** for AI processing
- **Winston** for logging

### Key Technologies
- **Web Speech API** for voice recognition
- **OpenAI GPT-4o-mini** for expense extraction
- **Chart.js** for data visualization
- **JWT** for authentication (ready for implementation)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Linkedln_Job_Scrapper/expense-tracker
   ```

2. **Set up environment variables**

   **Backend** (`backend/.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"
   OPENAI_API_KEY="your_openai_api_key_here"
   PORT=3001
   NODE_ENV=development
   JWT_SECRET="your_jwt_secret_here"
   ```

   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_URL="http://localhost:3001"
   VITE_NODE_ENV="development"
   ```

3. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   npx prisma generate
   npx prisma db push

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Start the development servers**
   ```bash
   # Backend (terminal 1)
   cd backend
   npm run dev

   # Frontend (terminal 2)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Database Studio: `npx prisma studio` (from backend directory)

## 📱 Usage

### Adding Expenses with Voice
1. Navigate to "Add Expense" or click the microphone on the dashboard
2. Tap the microphone button and speak naturally
3. Examples:
   - "I spent $25 at Starbucks for coffee"
   - "Paid $50 for gas yesterday"
   - "Bought groceries for $120 this morning"
4. The AI will extract amount, merchant, and categorize automatically

### Manual Entry
1. Use the manual form to enter expenses precisely
2. All fields are validated for accuracy
3. Categories can be selected from predefined list

### Viewing Analytics
1. Dashboard shows spending trends and category breakdowns
2. Charts are interactive - click on segments for details
3. Filter by date ranges and categories

### Managing Expenses
1. View all expenses in the expense list
2. Search by description, merchant, or category
3. Edit or delete expenses as needed
4. Export functionality available (coming soon)

## 🗂️ Project Structure

```
expense-tracker/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Dashboard/   # Dashboard components
│   │   │   ├── Expenses/    # Expense management
│   │   │   ├── VoiceInput/  # Voice input components
│   │   │   └── shared/      # Shared UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React context providers
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   ├── prisma/              # Database schema
│   └── package.json
├── shared/                  # Shared types and interfaces
│   └── types.ts
└── README.md
```

## 🔧 Configuration

### OpenAI API Setup
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add it to your backend `.env` file
3. The app uses GPT-4o-mini for cost-effective processing

### Database Setup
1. Create a PostgreSQL database named `expense_tracker`
2. Update `DATABASE_URL` in backend `.env`
3. Run `npx prisma db push` to create tables
4. Use `npx prisma studio` to manage data visually

### Environment Variables
- **Backend**: `OPENAI_API_KEY`, `DATABASE_URL`, `JWT_SECRET`
- **Frontend**: `VITE_API_URL`

## 🎯 API Endpoints

### Expenses
- `GET /api/expenses` - List expenses with pagination
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/process-voice` - Process voice transcript with AI
- `GET /api/expenses/stats` - Get spending statistics

### Health
- `GET /health` - Health check endpoint

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### Manual Testing Checklist
- [ ] Voice input works in supported browsers
- [ ] AI correctly extracts expense information
- [ ] Manual form validation works
- [ ] Charts render correctly
- [ ] Responsive design works on mobile
- [ ] Search and filtering functions
- [ ] CRUD operations work properly

## 🚀 Deployment

### Production Deployment

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build the backend**
   ```bash
   cd backend
   npm run build
   ```

3. **Set up production database**
4. **Configure environment variables**
5. **Deploy to your preferred platform**

### Docker Support (Coming Soon)
Docker configuration will be added for easy deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔒 Security & Privacy

- **No Audio Storage**: Voice recordings are not stored, only text transcripts
- **API Security**: JWT authentication and rate limiting
- **Data Encryption**: Encrypted data transmission and storage
- **GDPR Compliant**: Right to export/delete user data

## 🆘 Troubleshooting

### Common Issues

**Voice input not working**
- Ensure you're using Chrome, Edge, or Firefox
- Check microphone permissions
- Try refreshing the page

**AI processing failing**
- Verify OpenAI API key is correct
- Check internet connection
- Monitor API rate limits

**Database connection issues**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with details

---

Built with ❤️ using modern web technologies and AI integration