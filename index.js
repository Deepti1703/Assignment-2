const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const weatherKey = process.env.OPENWEATHER_API_KEY;
const weatherDemo = process.env.WEATHER_DEMO === 'true';

if (!weatherKey) {
    console.error('ERROR: OPENWEATHER_API_KEY is missing. Set it in .env without quotes.');
    process.exit(1);
}

// Validate API key at startup (unless demo mode)
if (!weatherDemo) {
    console.log('🔍 Validating OpenWeather API key...');
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=London&appid=${weatherKey}`)
        .then(() => {
            console.log('✅ OpenWeather API key is valid. Using LIVE weather data.');
        })
        .catch(error => {
            if (error.response && error.response.status === 401) {
                console.warn('⚠️  OpenWeather API key is invalid. Falling back to DEMO mode.');
                console.warn('   To use live data, get a valid API key from https://openweathermap.org');
            } else {
                console.error('❌ OpenWeather API validation failed:', error.message);
                console.warn('   Falling back to DEMO mode.');
            }
        });
} else {
    console.log('🔧 DEMO mode enabled. Using demo weather data.');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Generate a personalized weather apology message
// This makes customers feel valued even when their delivery is delayed
function generateWeatherApology(customerName, cityName, weatherDescription) {
    return `Hi ${customerName}, your order to ${cityName} is delayed due to ${weatherDescription}. We appreciate your patience!`;
}

app.post('/api/process', async (req, res) => {
    try {
        // Read the orders database
        const orderDataFile = fs.readFileSync(path.join(__dirname, 'orders.json'));
        const orders = JSON.parse(orderDataFile);

        // Step 1: Create weather API request promises for all cities (concurrent fetching)
        const weatherPromises = orders.map(async (order) => {
            const cityName = order.city;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${weatherKey}`;

            try {
                // If demo mode, skip API call and use demo data
                if (weatherDemo) {
                    const demoWeatherData = {
                        "New York": { data: { weather: [{ main: "Rain", description: "heavy rain" }] } },
                        "Mumbai": { data: { weather: [{ main: "Clear", description: "clear sky" }] } },
                        "London": { data: { weather: [{ main: "Snow", description: "light snow" }] } }
                    };
                    if (demoWeatherData[cityName]) {
                        return demoWeatherData[cityName];
                    }
                    throw new Error('City not in demo data');
                }

                return await axios.get(apiUrl);
            } catch (error) {
                // Handle 401 Unauthorized - API key might be new/invalid
                if (error.response && error.response.status === 401) {
                    console.warn(`API Key issue detected. Using demo weather data for ${cityName}`);
                    const demoWeatherData = {
                        "New York": { data: { weather: [{ main: "Rain", description: "heavy rain" }] } },
                        "Mumbai": { data: { weather: [{ main: "Clear", description: "clear sky" }] } },
                        "London": { data: { weather: [{ main: "Snow", description: "light snow" }] } }
                    };
                    if (demoWeatherData[cityName]) {
                        return demoWeatherData[cityName];
                    }
                }
                throw error;
            }
        });

        // Step 2: Wait for all API calls (concurrent execution with graceful error handling)
        const apiResults = await Promise.allSettled(weatherPromises);

        // Step 3: Process each result and update order status accordingly
        for (let i = 0; i < apiResults.length; i++) {
            const result = apiResults[i];
            const order = orders[i];

            if (result.status === 'fulfilled') {
                // Successfully received weather data
                const weatherCondition = result.value.data.weather[0].main;
                const weatherDescription = result.value.data.weather[0].description;

                // Golden Flow Logic: Check for adverse weather conditions
                if (weatherCondition === 'Rain' || weatherCondition === 'Snow' || weatherCondition === 'Extreme') {
                    order.status = 'Delayed';
                    order.apology = generateWeatherApology(order.customer, order.city, weatherDescription);
                } else {
                    order.status = 'On Time';
                }
            } else {
                // Error occurred (invalid city, network issue, etc.)
                order.status = 'Error (City Unknown)';
                console.error(`Weather fetch failed for ${order.city}: ${result.reason}`);
            }
        }

        // Step 4: Save updated orders back to the database
        fs.writeFileSync(path.join(__dirname, 'orders.json'), JSON.stringify(orders, null, 2));

        // Return success response
        res.json({
            success: true,
            message: 'Orders processed successfully',
            updatedOrders: orders
        });
    } catch (error) {
        console.error('Server error during order processing:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing orders'
        });
    }
});

function startServer(desiredPort) {
    const server = app.listen(desiredPort, () => {
        console.log(`✓ Weather Delay Checker server running on port ${desiredPort}`);
        console.log(`✓ Visit http://localhost:${desiredPort} to use the interface`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.warn(`✗ Port ${desiredPort} is already in use. Trying port ${desiredPort + 1}...`);
            startServer(desiredPort + 1);
            return;
        }
        console.error('Server error:', error);
        process.exit(1);
    });
}

if (require.main === module) {
    startServer(port);
}

// Export for Vercel serverless functions
module.exports = app;
