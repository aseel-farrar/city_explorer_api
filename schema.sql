DROP TABLE IF EXISTS locations;
CREATE TABLE IF NOT EXISTS locations(
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude VARCHAR(255),
  longitude VARCHAR(255)
);