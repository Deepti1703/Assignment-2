# AI Log

In this assignment, I used AI tools (like ChatGPT) to help me figure out some of the tricky parts of the logic. specifically doing the requests in parallel and handling API errors gracefully without breaking the server. Here are the prompts I used:

### Prompt 1: Parallel Fetching
**My Prompt:**
"How do I fetch data from the openweathermap api for a list of cities in parallel using express, axios, and a JSON file containing the cities? I want to make sure the server doesn't crash if one city is invalid."

**What I learned:**
The AI suggested using `Promise.allSettled()`. I originally thought about just using a normal `for` loop with `await` or `Promise.all()`, but the AI explained that `Promise.all()` will fail completely if just one city (like "InvalidCity123") throws a 404 error. By mapping my orders array to an array of Axios GET promises and then awaiting `Promise.allSettled()`, I was able to check the status of each request individually and gracefully log the 404 error, fulfilling the resilience requirement.

### Prompt 2: Weather Apology Function
**My Prompt:**
"Write a small javascript function that takes a customer name, a city, and a weather description and returns a professional apology message about their delivery being delayed."

**What I learned:**
The AI generated a simple string concatenation function. I adapted the result into my own code as the `getWeatherApology` function in `index.js`. 

### Prompt 3: Error Handling
**My Prompt:**
"In Promise.allSettled, how do I check if the request was an error and log it without crashing?"

**What I learned:**
The AI showed me that the result objects in the array returned by `Promise.allSettled` have a `.status` property. If it equals `'fulfilled'`, I can grab the weather data from `.value.data`. If it equals `'rejected'`, I know the city was invalid and I can manually set my order status to "Error (City Unknown)".
