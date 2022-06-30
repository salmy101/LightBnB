-- SELECT properties.city as city, count(reservations) as total_reservations
-- FROM reservations
-- JOIN properties ON properties_id = property.id
-- ORDER BY total_reservations
-- LIMIT 10;

SELECT properties.city, count(reservations) as total_reservations
FROM reservations
JOIN properties ON property_id = properties.id
GROUP BY properties.city
ORDER BY total_reservations DESC;