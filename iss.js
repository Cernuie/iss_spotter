const request = require('request');

/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) {
      return callback(error, null);
    }

    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const ip = JSON.parse(body);
    return callback(null, ip.ip);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
  
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    const geoLoc = JSON.parse(body);
    const latLong = {"latitude" : geoLoc["latitude"],
      "longitude" : geoLoc["longitude"]};
    return callback(null, latLong);
  });
};

const fetchISSFlyOverTimes = function(latLong, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${latLong.latitude}&lon=${latLong.longitude}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
  
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching fly over times. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    let data = JSON.parse(body);
    return callback(null, data.response);
  });
};

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      callback(error, null);
      return;
    }
    fetchCoordsByIP(ip, (error1, coords) => {
      if (error1) {
        callback(error1, null);
        return;
      }
      fetchISSFlyOverTimes(coords, (error2, passTimes) => {
        if (error2) {
          callback(error2, null);
          return;
        }
        callback(null, passTimes);
      });
    });
  });
};


module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation};