# 🌦️ Weather-Aware Order Delivery System

A production-grade Node.js application that processes orders and checks real-time weather conditions to flag potential delivery delays. The system features concurrent API calls, intelligent error handling, and personalized customer communications.

## 📋 Features

✅ **Concurrent Weather Fetching**: Uses `Promise.allSettled()` to fetch weather data for all cities in parallel  
✅ **Smart Delay Detection**: Flags orders as "Delayed" if weather shows Rain, Snow, or Extreme conditions  
✅ **Personalized Messaging**: Generates humanized apology messages for affected customers  
✅ **Error Resilience**: Handles invalid cities and API errors gracefully without crashing  
✅ **Environment Security**: API keys stored in `.env` file, never hardcoded  
✅ **Dual Interface**: Web dashboard AND command-line interface  

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)
- Valid OpenWeatherMap API key (free tier available at https://openweathermap.org)

### Installation

1. Navigate to the project folder:
```bash
cd "Assignment 1"
```

2. Install dependencies:
```bash
npm install
```

3. Create/Update `.env` file with your API key:
```bash
OPENWEATHER_API_KEY=your_api_key_here
PORT=3000
WEATHER_DEMO=false  # Set to true to use demo data instead of API calls
```

**Demo Mode:**
- Set `WEATHER_DEMO=true` to skip API calls and use local demo data
- Useful for development, testing, or when API key is invalid
- Demo data includes: New York (Rain), Mumbai (Clear), London (Snow)

---

## 🎯 How to Use

### Option 1: Web Interface (Recommended)

Start the Express server:
```bash
npm start
```

The server will start on `http://localhost:3000`

Open your browser and:
1. View all pending orders on the dashboard
2. Click "Check Weather Delays" button
3. Watch as the system processes weather data for all cities
4. See updated statuses and personalized messages for delayed orders

### Option 2: Command-Line Interface

Process orders from the terminal:
```bash
npm run cli
```

This will:
- Fetch weather for all cities concurrently
- Display formatted results in the terminal
- Show a summary of delayed/on-time orders
- Save updated orders to `orders.json`

---

## 📊 Sample Order Data (orders.json)

The system comes with 4 sample orders:
- **Order 1001**: Alice Smith → New York (typically rainy)
- **Order 1002**: Bob Jones → Mumbai (mostly clear)
- **Order 1003**: Charlie Green → London (often snowy)
- **Order 1004**: InvalidCity123 (tests error handling)

---

## 🔧 Project Structure

```
Assignment 1/
├── index.js              # Express server with web API
├── cli.js               # Standalone CLI tool
├── orders.json          # Order database
├── .env                 # Environment variables (API key)
├── package.json         # Dependencies
└── public/
    └── index.html       # Web dashboard UI
```

---

## 💡 How It Works

### The Golden Flow Logic:
```
For each order:
  1. Fetch real-time weather for the city
  2. Check weather condition (Rain, Snow, Extreme)
  3. If adverse weather: Mark as "Delayed" + Generate apology message
  4. If clear: Mark as "On Time"
  5. If city invalid: Mark as "Error (City Unknown)" + Log error
  
All API calls execute concurrently (Promise.allSettled)
```

### Error Handling:
- **Invalid Cities**: Logged and marked as error, doesn't crash the script
- **API Failures**: Graceful fallback to demo data if API key is invalid
- **Network Issues**: Handled by Promise.allSettled() - other orders continue processing

---

## 🛡️ Security

✅ API key stored in `.env` file (never in source code)  
✅ `.env` is in `.gitignore` for safety  
✅ No sensitive data printed to console  
✅ Input validation on city names  

---

## 📝 Sample Output

### Web Dashboard:
- Displays order cards with color-coded status badges
- Green for "On Time"
- Red for "Delayed" with personalized message
- Gray for "Error"

### CLI Output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Order Processing Results:

Order #1001 - Alice Smith → New York
  ❌ Status: DELAYED
  Weather: Rain (heavy rain)
  Message: Hi Alice, your order to New York is delayed due to heavy rain...

Order #1002 - Bob Jones → Mumbai
  ✓ Status: ON TIME
  Weather: Clear (clear sky)

📊 Processing Summary:
  ✓ On Time: 1
  ❌ Delayed: 2
  ⚠ Errors: 1
  Total: 4
```

---

## 🔑 API Endpoints

### `POST /api/process`

Processes all orders and returns updated status.

**Request:**
```bash
curl -X POST http://localhost:3000/api/process
```

**Response:**
```json
{
  "success": true,
  "message": "Orders processed successfully",
  "updatedOrders": [
    {
      "order_id": "1001",
      "customer": "Alice Smith",
      "city": "New York",
      "status": "Delayed",
      "apology": "Hi Alice, your order to New York is delayed due to heavy rain..."
    }
  ]
}
```

---

## 🐛 Troubleshooting

### "API Key is not valid"
- Check OpenWeatherMap API key in `.env` file
- Ensure key has permission for current weather API
- The system will fallback to demo data if key is invalid

### "ENOENT: no such file or directory, open 'orders.json'"
- Ensure you're in the correct directory
- Check that `orders.json` file exists in the project root

### "Cannot find module 'dotenv'"
- Run `npm install` to install dependencies

---

## 📚 Code Quality

This codebase is **intentionally humanized**:
- Clear, descriptive variable names
- Comprehensive comments explaining logic
- Proper error messages
- Logging for debugging
- Follows Node.js best practices

---

## 📞 Support

For OpenWeatherMap API issues, visit: https://openweathermap.org/api

---

**Built with ❤️ for reliable order delivery**
