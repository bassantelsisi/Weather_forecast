const API_KEY = '0e7dada426a74e2f834152030241212';
// get the wather from the API        
async function getWeather() {
    const cityInput = document.getElementById('cityInput');
    const city = cityInput.value;
    
    if (!city) return;

    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=3`);
        const data = await response.json();
        
        if (response.ok) {
            displayWeather(data);
        } else {
            alert('City not found. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
    }
}
// display the weather in the card

function displayWeather(data) {
    const weatherCards = document.getElementById('weatherCards');
    weatherCards.innerHTML = '';

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    data.forecast.forecastday.forEach((day, index) => {
        const date = new Date(day.date); //object date
        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const dayOfMonth = date.getDate();

        const card = `
            <div class="col-md-4 mb-4">
                <div class="weather-card">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h5 class="mb-0 day-name">${dayName}</h5>
                            <small class="text-info">${dayOfMonth} ${monthName}</small>
                        </div>
                        ${index === 0 ? `
                            <div class="current-conditions">
                                <div class="condition">
                                    <i class="fas fa-tint"></i> ${data.current.humidity}%
                                </div>
                                <div class="condition">
                                    <i class="fas fa-wind"></i> ${data.current.wind_kph}km/h
                                </div>
                                <div class="condition">
                                    <i class="fas fa-compass"></i> ${data.current.wind_dir}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="temperature">
                            ${index === 0 ? data.current.temp_c : day.day.avgtemp_c}°C
                        </div>
                        <img src="${index === 0 ? data.current.condition.icon : day.day.condition.icon}" 
                             alt="Weather Icon" 
                             class="weather-icon ms-3">
                    </div>
                    <p class="text-info mb-0 mt-3">
                        ${index === 0 ? data.current.condition.text : day.day.condition.text}
                    </p>
                    <small class="text-muted">
                    <div class="range-temp">
                        ${day.day.mintemp_c}° / ${day.day.maxtemp_c}° </div>
                    </small>
                </div>
            </div>
        `;
        weatherCards.innerHTML += card;
    });
}

// default city according to the user location
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const city = await getCityNameFromCoordinates(latitude, longitude);
                
                if (city) {
                    document.getElementById('cityInput').value = city;
                    getWeather();
                } else {
                    console.error('Unable to fetch city name. Using default.');
                    document.getElementById('cityInput').value = 'Cairo';
                    getWeather();
                }
            },
            (error) => {
                console.error('Geolocation error:', error.message);
                document.getElementById('cityInput').value = 'Cairo'; //  default value
                getWeather();
            }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
        document.getElementById('cityInput').value = 'Cairo'; // default value
        getWeather();
    }
});
// get the ccordinates and convert it into readable address by opencage API
async function getCityNameFromCoordinates(latitude, longitude) {
    try {
        const response = await fetch(
             `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=cfc5ca1f57ba4e64bd75406816f33a91`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            return data.results[0].components.city || data.results[0].components.town;
        }
        return null;
    } catch (error) {
        console.error('Error fetching city name:', error);
        return null;
    }
}
