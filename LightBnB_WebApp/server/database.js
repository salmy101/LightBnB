const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Pool } = require("pg");

const pool = new Pool({
  user: "vagrant",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});

pool.connect(() => {
  console.log(`AYE YO!`);
});

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = (email) => {
  return pool
    .query(`SELECT * FROM users WHERE email = $1`, [email])
    .then((result) => {
      console.log(result.rows);

      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = (id) => {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => {
      console.log(result.rows);

      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = (users) => {
  return pool
    .query(
      `
    INSERT INTO users(name, email, password)
    VALUES($1, $2, $3)`,
      [users.name, users.email, users.password]
    )
    .then((result) => {
      console.log("-------", users);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = (guest_id, limit = 10) => {
  return pool
    .query(
      `
    SELECT reservations.*, properties.*, avg(rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;`,
      [guest_id, limit]
    )
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  let queryString = `
  \nSELECT properties.*, avg(property_reviews.rating) as average_rating
  \nFROM properties
  \nJOIN property_reviews ON properties.id = property_id
  \nWHERE 1 = 1
  `;
  if (options.city) {
    console.log("CITY", options.city);
    queryParams.push(`%${options.city}%`);
    queryString += `\nAND city LIKE $${queryParams.length} `;
  }
  if (options.minimum_price_per_night) {
    console.log("MIN PRICE", options.minimum_price_per_night);
    queryParams.push(`${options.minimum_price_per_night}`);
    queryString += `\nAND cost_per_night >= $${queryParams.length} `;
  }
  if (options.maximum_price_per_night) {
    console.log("MAX PRICE", options.maximum_price_per_night);
    queryParams.push(`${options.maximum_price_per_night}`);
    queryString += `\nAND cost_per_night <= $${queryParams.length} `;
  }
  queryString += `
  \nGROUP BY properties.id`;
  if (options.minimum_rating) {
    console.log("MIN RATING", options.minimum_rating);
    queryParams.push(`${options.minimum_rating}`);
    queryString += `\nHAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  }
  queryParams.push(limit);
  queryString += `\nORDER BY cost_per_night
  \nLIMIT $${queryParams.length};
  `;
  console.log(queryString);
  return pool
    .query(queryString, queryParams)
    .then((result) => {
      // console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = (properties) => {
  // console.log(properties);
  return pool
    .query(
      `
    INSERT INTO properties (
      owner_id, 
      title,
       description, 
       thumbnail_photo_url, 
       cover_photo_url, 
       cost_per_night, 
       parking_spaces, 
       number_of_bathrooms, 
       number_of_bedrooms, 
       country, 
       street, 
       city, 
       province,
       post_code)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        properties.owner_id,
        properties.title,
        properties.description,
        properties.thumbnail_photo_url,
        properties.cover_photo_url,
        properties.cost_per_night,
        properties.parking_spaces,
        properties.number_of_bathrooms,
        properties.number_of_bedrooms,
        properties.country,
        properties.street,
        properties.city,
        properties.province,
        properties.post_code,
      ]
    )
    .then((result) => {
      console.log("-------", properties);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};

exports.addProperty = addProperty;
