// ===== WEATHER APP =====

// Apna OpenWeatherMap API key yahan daalo
const API_KEY = "62de848f017f8e8a4ea029dff7404347";

// Saare HTML elements ko pakad rahe hain
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const unitBtn = document.getElementById("unitBtn");
const weatherError = document.getElementById("weatherError");
const weatherLoading = document.getElementById("weatherLoading");
const weatherCard = document.getElementById("weatherCard");
const recentSearches = document.getElementById("recentSearches");
const recentChips = document.getElementById("recentChips");

if (cityInput) {

    let currentUnit = "metric";
    let lastCity = "";

    function getRecentSearches() {
        const data = localStorage.getItem("recentCities");
        return data ? JSON.parse(data) : [];
    }

    function addToRecentSearches(city) {
        let recent = getRecentSearches();
        recent = recent.filter(c => c.toLowerCase() !== city.toLowerCase());
        recent.unshift(city);
        recent = recent.slice(0, 5);
        localStorage.setItem("recentCities", JSON.stringify(recent));
        renderRecentSearches();
    }

    function renderRecentSearches() {
        const recent = getRecentSearches();

        if (recent.length === 0) {
            recentSearches.style.display = "none";
            return;
        }

        recentSearches.style.display = "block";
        recentChips.innerHTML = "";

        recent.forEach(city => {
            const chip = document.createElement("button");
            chip.className = "recent-chip";
            chip.textContent = city;
            chip.addEventListener("click", () => {
                cityInput.value = city;
                fetchWeatherByCity(city);
            });
            recentChips.appendChild(chip);
        });
    }

    async function fetchWeatherByCity(city) {
        weatherError.textContent = "";
        weatherLoading.textContent = "Loading weather data...";
        weatherCard.style.display = "none";

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(response.status === 404 ? "City not found!" : "Something went wrong!");
            }

            const data = await response.json();
            displayWeather(data);
            lastCity = city;
            addToRecentSearches(data.name);

        } catch (error) {
            weatherError.textContent = "⚠️ " + error.message;
        } finally {
            weatherLoading.textContent = "";
        }
    }

    async function fetchWeatherByCoords(lat, lon) {
        weatherError.textContent = "";
        weatherLoading.textContent = "Detecting your location...";
        weatherCard.style.display = "none";

        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Could not fetch weather for your location!");
            }

            const data = await response.json();
            displayWeather(data);
            lastCity = data.name;
            addToRecentSearches(data.name);

        } catch (error) {
            weatherError.textContent = "⚠️ " + error.message;
        } finally {
            weatherLoading.textContent = "";
        }
    }

    function displayWeather(data) {
        const icon = data.weather[0].icon;
        const description = data.weather[0].description;

        document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
        document.getElementById("weatherCity").textContent = `${data.name}, ${data.sys.country}`;

        const unitSymbol = currentUnit === "metric" ? "°C" : "°F";
        document.getElementById("weatherTemp").textContent = `${Math.round(data.main.temp)}${unitSymbol}`;

        document.getElementById("weatherDesc").textContent = description;
        document.getElementById("weatherFeels").textContent = `${Math.round(data.main.feels_like)}${unitSymbol}`;
        document.getElementById("weatherHumidity").textContent = `${data.main.humidity}%`;

        const windUnit = currentUnit === "metric" ? "m/s" : "mph";
        document.getElementById("weatherWind").textContent = `${data.wind.speed} ${windUnit}`;
        document.getElementById("weatherPressure").textContent = `${data.main.pressure} hPa`;

        weatherCard.style.display = "block";
    }

    searchBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city === "") {
            weatherError.textContent = "⚠️ Please enter a city name!";
            return;
        }
        fetchWeatherByCity(city);
    });

    cityInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            searchBtn.click();
        }
    });

    locationBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            weatherError.textContent = "⚠️ Geolocation is not supported by your browser!";
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeatherByCoords(lat, lon);
            },
            () => {
                weatherError.textContent = "⚠️ Location access denied. Please allow location or search manually.";
            }
        );
    });

    unitBtn.addEventListener("click", () => {
        currentUnit = currentUnit === "metric" ? "imperial" : "metric";
        unitBtn.textContent = currentUnit === "metric" ? "Switch to °F" : "Switch to °C";

        if (lastCity) {
            fetchWeatherByCity(lastCity);
        }
    });

    renderRecentSearches();
}
