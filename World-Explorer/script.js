"use strict";

const btnFindMe = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");
const input = document.querySelector(".input-country");
let suggestions = document.querySelector(".suggestions");
const countriesList = [];
const btnSearch = document.querySelector(".btn-search");
const btnWeather = document.createElement("button");
btnWeather.classList.add("btnHeader");
btnWeather.textContent = "More details";
let currentLng = 0;
let currentLat = 0;

btnWeather.addEventListener("click", async function () {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${currentLat}&longitude=${currentLng}&current_weather=true`
    );
    const data = await res.json();
    console.log(data);
    renderWeather(data);
  } catch (err) {
    console.log(err);
  }
});

const fillCountries = async () => {
  try {
    const res = await fetch(`https://restcountries.com/v3.1/all`);
    const data = await res.json();
    data.forEach((country) => {
      countriesList.push(country.name.common);
    });
  } catch (error) {
    console.log(error);
  }
};

input.addEventListener("click", function () {
  suggestions.classList.add("displayNone");
});

input.addEventListener("input", function () {
  console.log("load");
  suggestions.innerHTML = " ";
  const query = this.value.toLowerCase();
  if (!query.trim()) return;
  const filteredCountries = countriesList.filter((country) =>
    country.toLowerCase().startsWith(query)
  );
  filteredCountries.forEach((country) => {
    let li = document.createElement("li");
    li.textContent = country;
    suggestions.appendChild(li);
    suggestions.classList.toggle("displayNone");
  });
  suggestions.addEventListener("click", function (event) {
    if (event.target.tagName === "LI") {
      input.value = event.target.textContent;
      suggestions.classList.add("displayNone"); // הסתרה לאחר הבחירה
    }
  });
});

btnSearch.addEventListener("click", () => {
  const input = document.querySelector(".input-country");
  countriesContainer.innerHTML = "";
  getCountryData(input.value);
});

const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const whereAmI = async function () {
  try {
    const position = await getPosition();
    const { latitude: lat, longitude: lng } = position.coords;
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`
    );
    if (!res.ok) throw new Error(`Something wrong (${res.status})`);
    const data = await res.json();
    console.log(`You are in ${data.locality}, ${data.countryName}`);
    const countryName = data.countryName;
    countriesContainer.innerHTML = "";
    await getCountryData(countryName);
  } catch (err) {
    renderError(`Something went wrong. (${err})`);
  }
};

const getJSON = async function (url, errorMsg = "Something went wrong.") {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
  return response.json();
};

const renderError = function (msg) {
  countriesContainer.innerHTML = "";
  countriesContainer.insertAdjacentText("beforeend", msg);
};

let imgTemp = function (temp) {
  if (temp < 5) {
    return "❄️";
  } else if (temp > 5 && temp <= 10) {
    return "☁️";
  } else if (temp > 10 && temp <= 15) {
    return "🌥️";
  } else if (temp > 15 && temp <= 20) {
    return "🌤️";
  } else {
    return "☀️";
  }
};

const renderCountry = async function (data, className = "") {
  let html = `<article class="country ${className}">
          <img class="country__img" src="${data.flag}" />
          <div class="country__data">
            <h3 class="country__name">${data.name}</h3>
            <h4 class="country__region">${data.region}</h4>
            <p class="country__row"><span>👫</span>${(
              +data.population / 1000000
            ).toFixed(1)}</p>
            <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
            <p class="country__row"><span>✒️</span>${
              data.languages[0].nativeName
            }</p>
            <p class="country__row"><span>💰</span>${
              data.currencies[0].name
            }</p>
            <button class="more__details btnHeader" data-lat="${
              data.latlng[0]
            }" data-lng="${data.latlng[1]}">More details</button>
          </div>
        </article>`;
  const card = document.createElement("countryCard");
  card.insertAdjacentHTML("beforeend", html);
  countriesContainer.appendChild(card);
  const btnDetails = card.querySelector(".more__details");
  btnDetails.addEventListener("click", async function () {
    const lat = btnDetails.getAttribute("data-lat");
    const lng = btnDetails.getAttribute("data-lng");
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
      );
      const data = await res.json();
      console.log(data);
      renderWeather(data);
    } catch (err) {
      console.log(err);
    }
  });
};

const renderWeather = function (data) {
  console.log(data);
  const modal = document.querySelector(".modal");
  const overlay = document.querySelector(".overlay");
  const weatherDataElement = document.getElementById("weather-data");
  const tempImg = imgTemp(data.current_weather.temperature);
  const lat = data.latitude;
  const lng = data.longitude;
  weatherDataElement.innerHTML = `
        ${tempImg} temp: ${data.current_weather.temperature}°C <br>
        🌬️ wind: ${data.current_weather.windspeed} km/h
    <iframe class="map" width="100%" height="100%"
            src="https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=5&amp;output=embed">
            </iframe>`;
  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

// פונקציות לסגירת הפופאפ
document.querySelector(".close").addEventListener("click", function () {
  document.querySelector(".modal").classList.add("hidden");
  document.querySelector(".overlay").classList.add("hidden");
});
document.querySelector(".overlay").addEventListener("click", function () {
  document.querySelector(".modal").classList.add("hidden");
  document.querySelector(".overlay").classList.add("hidden");
});

const getCoordinates = async function (city) {
  const myKey = "bacaf869031441d08be4edd1f9eee40c";
  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        city
      )}&apiKey=${myKey}`
    );
    const data = await res.json();
    currentLat = data.features[0].properties.lat;
    currentLng = data.features[0].properties.lon;
  } catch (err) {
    console.log(err);
  }
};

const getCountryData = async function (country) {
  try {
    const data = await getJSON(
      `https://restcountries.com/v2/name/${country}`,
      "Country not found"
    );
    console.log(data[0]);
    await getCoordinates(data[0].capital);
    renderCountry(data[0]);
  } catch (err) {
    renderError(`Something went wrong 💥💥 ${err.message}. Try again!`);
  } finally {
    countriesContainer.style.opacity = 1;
  }
};

btnFindMe.addEventListener("click", whereAmI);

const init = async function () {
  await fillCountries();
  await getCountryData("israel");
  await getCountryData("thailand");
  await getCountryData("france");
};
init();
// 'use strict';
// const btnFindMe = document.querySelector('.btn-country');
// const countriesContainer = document.querySelector('.countries');
// const input = document.querySelector('.input-country');
// let suggestions = document.querySelector('.suggestions');
// const countriesList = [];
// const btnSearch = document.querySelector('.btn-search');
// const btnWeather = document.createElement('button');
// btnWeather.classList.add('btnHeader');
// btnWeather.textContent = 'More details';
// let currentLng = 0;
// let currentLat = 0;

// btnWeather.addEventListener('click', function () {
//     fetch(`https://api.open-meteo.com/v1/forecast?latitude=${currentLat}&longitude=${currentLng}&current_weather=true`)
//     .then(res => res.json())
//     .then(data => {
//         console.log(data);
//         renderWeather(data);
//     })
//     .catch(err => console.log(err));
//     const moreDetails = document.querySelector('weatherElement'); //
// })

// const fillCountries = () => {
//     fetch(`https://restcountries.com/v3.1/all`)
//         .then(res => res.json())
//         .then(data => {
//             data.forEach(country => {
//                 countriesList.push(country.name.common);
//             });
//         })
//         .catch(error => console.log(error));
// };

// input.addEventListener('click', function(){
//     suggestions.classList.add('displayNone');
// })

// input.addEventListener('input', function () {
//     console.log('load')
//     suggestions.innerHTML = ' ';
//     const query = this.value.toLowerCase();
//     if (!query.trim()) return;
//     const filteredCountries = countriesList.filter(country => country.toLowerCase().startsWith(query));
//     filteredCountries.forEach(country => {
//         let li = document.createElement('li');
//         li.textContent = country;
//         suggestions.appendChild(li);
//         suggestions.classList.toggle('displayNone');
//     });
//     suggestions.addEventListener('click', function (event) {
//         if (event.target.tagName === 'LI') {
//             input.value = event.target.textContent;
//             suggestions.classList.add('displayNone'); // הסתרה לאחר הבחירה
//         }
//     });
// });

// btnSearch.addEventListener('click', () => {
//     const input = document.querySelector('.input-country');
//     countriesContainer.innerHTML = '';
//     getCountryData(input.value);
// })

// const getPosition = function(){
//     return new Promise(function(resolve, reject) {
//         navigator.geolocation.getCurrentPosition(resolve, reject);
//     })
// }

// const whereAmI = function () {
//     getPosition()
//         .then(position => {
//             const { latitude: lat, longitude: lng } = position.coords;
//             return fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}`)
//         })
//         .then(res => {
//             if (!res.ok) throw new Error(`Something wrong (${res.status})`);
//             return res.json();
//         })
//         .then(data => {
//             console.log(`You are in ${data.locality}, ${data.countryName}`);
//             const countryName = data.countryName;
//             countriesContainer.innerHTML = '';
//             getCountryData(countryName);
//         })
//         .catch(err => renderError(`Something went wrong. (${err})`));
// };
// const getJSON = function (url, errorMsg = 'Something went wrong.') {
//     return fetch((url)).then(response => {
//         if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);
//         return response.json();
//     });
// }
// const renderError = function (msg) {
//     countriesContainer.innerHTML = '';
//     countriesContainer.insertAdjacentText('beforeend', msg);
// }
// let imgTemp = function(temp) {
//     if (temp < 5) {
//         return '❄️';
//     } else if (temp > 5 && temp <= 10) {
//         return '☁️';
//     } else if (temp > 10 && temp <= 15) {
//         return '🌥️';
//     } else if (temp > 15 && temp <= 20) {
//         return '🌤️';
//     }
//     else{
//         return '☀️';
//     }
// }

// const renderCountry = function (data, className = '') {
//     let html = `<article class="country ${className}">
//           <img class="country__img" src="${data.flag}" />
//           <div class="country__data">
//             <h3 class="country__name">${data.name}</h3>
//             <h4 class="country__region">${data.region}</h4>
//             <p class="country__row"><span>👫</span>${(+data.population / 1000000).toFixed(1)}</p>
//             <p class="country__row"><span>🗣️</span>${data.languages[0].name}</p>
//             <p class="country__row"><span>✒️</span>${data.languages[0].nativeName}</p>
//             <p class="country__row"><span>💰</span>${data.currencies[0].name}</p>
//             <button class="more__details btnHeader" data-lat="${data.latlng[0]}" data-lng="${data.latlng[1]}">More details</button>
//           </div>
//         </article>`;
//     const card = document.createElement('countryCard');
//     card.insertAdjacentHTML('beforeend', html);
//     countriesContainer.appendChild(card);
//     const btnDetails = card.querySelector('.more__details');
//     btnDetails.addEventListener('click', function () {
//         const lat = btnDetails.getAttribute('data-lat');
//         const lng = btnDetails.getAttribute('data-lng');
//         fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`)
//             .then(res => res.json())
//             .then(data => {
//                 console.log(data);
//                 renderWeather(data);
//             })
//             .catch(err => console.log(err));
//     })
// }
// const renderWeather = function (data) {
//     console.log(data);
//     const modal = document.querySelector('.modal');
//     const overlay = document.querySelector('.overlay');
//     const weatherDataElement = document.getElementById('weather-data');
//     const tempImg = imgTemp(data.current_weather.temperature);
//     const lat = data.latitude;
//     const lng = data.longitude;
//     weatherDataElement.innerHTML = `
//         ${tempImg} temp: ${data.current_weather.temperature}°C <br>
//         🌬️ wind: ${data.current_weather.windspeed} km/h
//     <iframe class="map" width="100%" height="100%"
//             src="https://maps.google.com/maps?q=${lat},${lng}&hl=es&z=5&amp;output=embed">
//             </iframe>`;
//     modal.classList.remove('hidden');
//     overlay.classList.remove('hidden');
// };

// // פונקציות לסגירת הפופאפ
// document.querySelector('.close').addEventListener('click', function () {
//     document.querySelector('.modal').classList.add('hidden');
//     document.querySelector('.overlay').classList.add('hidden');
// });
// document.querySelector('.overlay').addEventListener('click', function () {
//     document.querySelector('.modal').classList.add('hidden');
//     document.querySelector('.overlay').classList.add('hidden');
// });

// const getCoordinates = function (city){
//     const myKey = 'bacaf869031441d08be4edd1f9eee40c';
//     fetch( `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(city)}&apiKey=${myKey}`)
//     .then(res => res.json())
//     .then(data => {
//         currentLat = data.features[0].properties.lat;
//         currentLng = data.features[0].properties.lon;
//     })
// }

// const getCountryData = function (country) {
//     getJSON(`https://restcountries.com/v2/name/${country}`, 'Country not found')
//         .then(data => {
//             console.log(data[0]);
//             getCoordinates(data[0].capital);
//             renderCountry(data[0]);
//         })
//         .catch(err => {
//             renderError(`Something went wrong 💥💥 ${err.message}. Try again!`);
//         })
//         .finally(() => {
//             countriesContainer.style.opacity = 1;
//         })
// }
// btnFindMe.addEventListener('click', whereAmI);

// const init = function (){
//     fillCountries();
//     getCountryData('israel');
//     getCountryData('thailand');
//     getCountryData('france');
// }
// init();
