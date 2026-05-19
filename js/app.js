(function () {
      'use strict';

      // WMO code → [label, animation-class]
      const WX = {
        0:  ['Clear',            'wx-clear'],
        1:  ['Mainly Clear',     'wx-mainly-clear'],
        2:  ['Partly Cloudy',    'wx-partly-cloudy'],
        3:  ['Overcast',         'wx-overcast'],
        45: ['Fog',              'wx-fog'],
        48: ['Fog',              'wx-fog'],
        51: ['Light Drizzle',    'wx-drizzle'],
        53: ['Drizzle',          'wx-drizzle'],
        55: ['Heavy Drizzle',    'wx-drizzle'],
        56: ['Freezing Drizzle', 'wx-freezing'],
        57: ['Freezing Drizzle', 'wx-freezing'],
        61: ['Light Rain',       'wx-rain'],
        63: ['Rain',             'wx-rain'],
        65: ['Heavy Rain',       'wx-heavy-rain'],
        66: ['Freezing Rain',    'wx-freezing'],
        67: ['Freezing Rain',    'wx-freezing'],
        71: ['Light Snow',       'wx-snow'],
        73: ['Snow',             'wx-snow'],
        75: ['Heavy Snow',       'wx-heavy-snow'],
        77: ['Snow Grains',      'wx-snow'],
        80: ['Showers',          'wx-rain'],
        81: ['Rain Showers',     'wx-rain'],
        82: ['Heavy Showers',    'wx-heavy-rain'],
        85: ['Snow Showers',     'wx-snow'],
        86: ['Heavy Snow',       'wx-heavy-snow'],
        95: ['Thunderstorm',     'wx-thunder'],
        96: ['Thunderstorm',     'wx-thunder'],
        99: ['Thunderstorm',     'wx-thunder'],
      };

      function showStatus(card, msg) {
        card.querySelector('.wx-data').innerHTML =
          '<div class="weather-status"><span class="weather-dot"></span>' + msg + '</div>';
      }

      function render(card, temp, code, city) {
        const [label, cls] = WX[code] || ['Unknown', 'wx-clear'];
        card.className = 'weather-card ' + cls;
        card.querySelector('.wx-data').innerHTML =
          '<div class="weather-temp">' + Math.round(temp) +
            '<span class="weather-unit">&deg;F</span>' +
          '</div>' +
          '<div class="weather-condition">' + label + '</div>' +
          '<div class="weather-location">' + city + '</div>';
      }

      function loadWeather(card, lat, lon, cityLabel) {
        const weatherUrl =
          'https://api.open-meteo.com/v1/forecast' +
          '?latitude='  + lat + '&longitude=' + lon +
          '&current=temperature_2m,weathercode' +
          '&temperature_unit=fahrenheit&forecast_days=1';

        const cityPromise = cityLabel
          ? Promise.resolve(cityLabel)
          : fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon)
              .then(r => r.json())
              .then(g => {
                const a = g.address || {};
                return a.city || a.town || a.village || a.county || a.state || 'Your Location';
              });

        Promise.all([fetch(weatherUrl).then(r => r.json()), cityPromise])
          .then(([weather, city]) => {
            render(card, weather.current.temperature_2m, weather.current.weathercode, city);
          })
          .catch(() => showStatus(card, 'Unavailable'));
      }

      // Fixed city cards — fetched on page load
      loadWeather(document.getElementById('weather-kc'),    39.0997, -94.5786,  'Kansas City');
      loadWeather(document.getElementById('weather-estes'), 40.3772, -105.5217, 'Estes Park');

      // User's location card
      const userCard = document.getElementById('weather-widget');

      if (!navigator.geolocation) {
        showStatus(userCard, 'Location unavailable');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        pos => loadWeather(userCard, pos.coords.latitude, pos.coords.longitude, null),
        ()  => showStatus(userCard, 'Enable location to see your weather.'),
        { timeout: 10000 }
      );
    }());
