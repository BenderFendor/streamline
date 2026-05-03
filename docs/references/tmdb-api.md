# TMDB API Documentation for AI

This document provides a guide to using the TMDB API (The Movie Database API) with JavaScript. It is designed for AI models that may not have prior context about web APIs or TMDB.

## Introduction

The TMDB API allows you to access a vast database of movie, TV show, and cast information. You can use this API to search for movies and TV shows, discover new content, and retrieve detailed information about specific titles or people.

This documentation will focus on how to make requests to the TMDB API using JavaScript and how to understand the API's responses.

## Base URL

All API requests should be made to the following base URL:

`https://api.themoviedb.org`

## Authentication

To use the TMDB API, you need to authenticate your requests using an API key. This API key should be included in the `Authorization` header of your HTTP requests as a Bearer token.

**How to include the API Key in JavaScript:**

When making requests using `fetch` in JavaScript, you will need to set the `Authorization` header:

```javascript
fetch(url, {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
content_copy
download
Use code with caution.
Markdown

Replace YOUR_API_KEY with your actual TMDB API key.

Endpoints

This documentation covers the following key endpoints of the TMDB API.

1. Search for Movies - /3/search/movie

Endpoint: GET /3/search/movie

Summary: Search for movies by title.

Description: This endpoint allows you to search for movies based on keywords in their titles. It supports searching by original, translated, and alternative titles.

Parameters:

query (query, required):

in: query

name: query

required: true

schema: string

Description: The text query to search for. This is the movie title you are looking for.

include_adult (query, optional):

in: query

name: include_adult

schema: boolean

default: false

Description: Include adult content in the search results. Defaults to false.

language (query, optional):

in: query

name: language

schema: string

default: en-US

Description: Pass a ISO-639-1 value to display translated results.

primary_release_year (query, optional):

in: query

name: primary_release_year

schema: string

Description: Filter results to movies with this primary release year.

page (query, optional):

in: query

name: page

schema: integer (format: int32)

default: 1

Description: Specify the page of results to query. Defaults to 1.

region (query, optional):

in: query

name: region

schema: string

Description: Specify a ISO-3166-1 value to display translated results.

year (query, optional):

in: query

name: year

schema: string

Description: Filter results to movies with this release year.

Responses:

200 OK:

Description: Success.

Content Type: application/json

Schema: object with properties:

page: integer - The current page number.

results: array of object - An array of movie objects matching the search query. Each movie object contains details like adult, backdrop_path, genre_ids, id, original_language, original_title, overview, popularity, poster_path, release_date, title, video, vote_average, vote_count.

total_pages: integer - The total number of pages available.

total_results: integer - The total number of movies matching the search query.

Example Request (JavaScript):

const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const query = 'Fight Club'; // Example movie title
const url = `https://api.themoviedb.org/3/search/movie?query=${query}`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the movie search results
})
.catch(error => console.error('Error:', error));
content_copy
download
Use code with caution.
JavaScript
2. Discover Movies - /3/discover/movie

Endpoint: GET /3/discover/movie

Summary: Discover movies based on various filters and sort options.

Description: This endpoint allows you to discover movies using a wide range of filters (like genres, release date, rating, etc.) and sorting options.

Parameters: (Many parameters available - see OpenAPI spec for full list. Some key parameters are:)

sort_by (query, optional):

in: query

name: sort_by

schema: string (enum: original_title.asc, original_title.desc, popularity.asc, popularity.desc, revenue.asc, revenue.desc, primary_release_date.asc, title.asc, title.desc, primary_release_date.desc, vote_average.asc, vote_average.desc, vote_count.asc, vote_count.desc)

default: popularity.desc

Description: Sort results by attribute. Default is popularity.desc (popularity descending).

with_genres (query, optional):

in: query

name: with_genres

schema: string

Description: Filter movies by genre IDs. Can be comma-separated (AND) or pipe-separated (OR).

primary_release_year (query, optional):

in: query

name: primary_release_year

schema: integer (format: int32)

Description: Filter movies by primary release year.

vote_average.gte (query, optional):

in: query

name: vote_average.gte

schema: number (format: float)

Description: Filter movies with a vote average greater than or equal to this value.

page (query, optional):

in: query

name: page

schema: integer (format: int32)

default: 1

Description: Specify the page of results to query. Defaults to 1.

Responses:

200 OK:

Description: Success.

Content Type: application/json

Schema: object with properties similar to /3/search/movie response (page, results, total_pages, total_results).

Example Request (JavaScript):

const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const genreIds = '28,12'; // Example genre IDs for Action and Adventure
const sortBy = 'vote_average.desc'; // Example sort option
const url = `https://api.themoviedb.org/3/discover/movie?with_genres=${genreIds}&sort_by=${sortBy}`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the movie discovery results
})
.catch(error => console.error('Error:', error));
content_copy
download
Use code with caution.
JavaScript
3. Movie Details - /3/movie/{movie_id}

Endpoint: GET /3/movie/{movie_id}

Summary: Get detailed information about a specific movie.

Description: Retrieve comprehensive details for a movie, including genres, budget, revenue, overview, cast, crew, images, videos, and more.

Parameters:

movie_id (path, required):

in: path

name: movie_id

schema: integer (format: int32)

required: true

Description: The ID of the movie to retrieve details for.

language (query, optional):

in: query

name: language

schema: string

default: en-US

Description: Pass a ISO-639-1 value to display translated results.

append_to_response (query, optional):

in: query

name: append_to_response

schema: string

Description: Append additional information to the response. For example, append_to_response=videos,images,credits. (See TMDB API documentation for valid options).

Responses:

200 OK:

Description: Success.

Content Type: application/json

Schema: object - A detailed movie object. Properties include adult, backdrop_path, belongs_to_collection, budget, genres, homepage, id, imdb_id, original_language, original_title, overview, popularity, poster_path, production_companies, production_countries, release_date, revenue, runtime, spoken_languages, status, tagline, title, video, vote_average, vote_count.

Example Request (JavaScript):

const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const movieId = 550; // Example movie ID (Fight Club)
const url = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=videos,images,credits`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the movie details response
})
.catch(error => console.error('Error:', error));
content_copy
download
Use code with caution.
JavaScript
4. Search for TV Shows - /3/search/tv

Endpoint: GET /3/search/tv

Summary: Search for TV shows by name.

Description: This endpoint allows you to search for TV shows by their original, translated, and "also known as" names.

Parameters:

query (query, required):

in: query

name: query

schema: string

required: true

Description: The text query to search for. This is the TV show title you are looking for.

include_adult (query, optional):

in: query

name: include_adult

schema: boolean

default: false

Description: Include adult content in the search results. Defaults to false.

language (query, optional):

in: query

name: language

schema: string

default: en-US

Description: Pass a ISO-639-1 value to display translated results.

first_air_date_year (query, optional):

in: query

name: first_air_date_year

schema: integer (format: int32)

Description: Filter results to TV shows with this first air date year.

page (query, optional):

in: query

name: page

schema: integer (format: int32)

default: 1

Description: Specify the page of results to query. Defaults to 1.

year (query, optional):

in: query

name: year

schema: integer (format: int32)

Description: Filter results to TV shows with this first air date and all episode air dates year.

Responses:

200 OK:

Description: Success.

Content Type: application/json

Schema: object with properties similar to /3/search/movie response, but with TV show specific fields like origin_country, original_name, first_air_date, name.

Example Request (JavaScript):

const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const query = 'Breaking Bad'; // Example TV show title
const url = `https://api.themoviedb.org/3/search/tv?query=${query}`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the TV show search results
})
.catch(error => console.error('Error:', error));
content_copy
download
Use code with caution.
JavaScript
5. TV Show Details - /3/tv/{series_id}

Endpoint: GET /3/tv/{series_id}

Summary: Get detailed information about a specific TV show.

Description: Retrieve comprehensive details for a TV show, including created by, episode run time, genres, homepage, overview, networks, seasons, spoken languages, status, tagline, and more.

Parameters:

series_id (path, required):

in: path

name: series_id

schema: integer (format: int32)

required: true

Description: The ID of the TV show to retrieve details for.

language (query, optional):

in: query

name: language

schema: string

default: en-US

Description: Pass a ISO-639-1 value to display translated results.

append_to_response (query, optional):

in: query

name: append_to_response

schema: string

Description: Append additional information to the response. For example, append_to_response=videos,images,credits. (See TMDB API documentation for valid options).

Responses:

200 OK:

Description: Success.

Content Type: application/json

Schema: object - A detailed TV show object. Properties include adult, backdrop_path, created_by, episode_run_time, first_air_date, genres, homepage, id, in_production, languages, last_air_date, last_episode_to_air, name, next_episode_to_air, networks, number_of_episodes, number_of_seasons, origin_country, original_language, original_name, overview, popularity, poster_path, production_companies, production_countries, seasons, spoken_languages, status, tagline, type, vote_average, vote_count.

Example Request (JavaScript):

const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const seriesId = 1399; // Example TV show ID (Game of Thrones)
const url = `https://api.themoviedb.org/3/tv/${seriesId}?append_to_response=videos,images,credits`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the TV show details response
})
.catch(error => console.error('Error:', error));
content_copy
download
Use code with caution.
JavaScript
6. Get Configuration - /3/configuration

Endpoint: GET /3/configuration

Summary: Get API configuration details.

Description: This endpoint retrieves configuration information needed to use the API, particularly the base URLs for images and valid image sizes.

Parameters:

None

Responses:

200 OK:

Description: Success.

Content Type: application/json

Schema: object with properties:

images: object - Image configuration.

base_url: string - Base URL for images (e.g., http://image.tmdb.org/t/p/).

secure_base_url: string - Secure base URL for images (e.g., https://image.tmdb.org/t/p/).

backdrop_sizes: array of string - Available backdrop sizes (e.g., ["w300", "w780", "w1280", "original"]).

logo_sizes: array of string - Available logo sizes.

poster_sizes: array of string - Available poster sizes.

profile_sizes: array of string - Available profile sizes.

still_sizes: array of string - Available still sizes.

change_keys: array of string - List of keys that can be used to detect changes.

Example Request (JavaScript):

const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const url = `https://api.themoviedb.org/3/configuration`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the configuration response
  const baseUrl = data.images.secure_base_url;
  const posterSize = data.images.poster_sizes[3]; // Example: Use 'w342' poster size
  console.log(`Image Base URL: ${baseUrl}`);
  console.log(`Poster Size: ${posterSize}`);
})
.catch(error => console.error('Error:', error));
content_copy
download
Use code with caution.
JavaScript
General JavaScript Usage Pattern

Here's a reusable JavaScript function for making TMDB API requests:

async function fetchTMDBData(endpoint, apiKey) {
  const url = `https://api.themoviedb.org/3${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Unable to fetch data:", error);
    return null;
  }
}

// Example usage:
async function searchMovies(query) {
  const apiKey = 'YOUR_API_KEY'; // Replace with your API key
  const endpoint = `/search/movie?query=${query}`;
  const movieData = await fetchTMDBData(endpoint, apiKey);
  if (movieData) {
    console.log("Search results:", movieData);
  }
}

searchMovies('Fight Club');
content_copy
download
Use code with caution.
JavaScript
Security Reminder

Remember to keep your API key secure and do not expose it directly in client-side code if possible. For AI applications, consider using environment variables or secure configuration methods to manage your API key.

Conclusion

This documentation provides a basic introduction to using the TMDB API with JavaScript. The provided endpoints are a starting point for exploring the vast amount of data available. Refer to the complete TMDB API documentation for more endpoints and advanced features. Experiment with different endpoints and parameters to explore the full capabilities of the TMDB API!

content_copy
download
Use code with caution.

```markdown
# TMDB API Documentation for AI

This document provides a guide to using the TMDB API (The Movie Database API) with JavaScript. It is designed for AI models that may not have prior context about web APIs or TMDB.

## Introduction

The TMDB API allows you to access a vast database of movie, TV show, and cast information. You can use this API to search for movies and TV shows, discover new content, and retrieve detailed information about specific titles or people.

This documentation will focus on how to make requests to the TMDB API using JavaScript and how to understand the API's responses.

## Base URL

All API requests should be made to the following base URL:

`https://api.themoviedb.org`

## Authentication

To use the TMDB API, you need to authenticate your requests using an API key. This API key should be included in the `Authorization` header of your HTTP requests as a Bearer token.

**How to include the API Key in JavaScript:**

When making requests using `fetch` in JavaScript, you will need to set the `Authorization` header:

```javascript
fetch(url, {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
```

**Replace `YOUR_API_KEY` with your actual TMDB API key.**

## Endpoints

This documentation covers the following key endpoints of the TMDB API.

### 1. Search for Movies - `/3/search/movie`

**Endpoint:** `GET /3/search/movie`

**Summary:** Search for movies by title.

**Description:** This endpoint allows you to search for movies based on keywords in their titles. It supports searching by original, translated, and alternative titles.

**Parameters:**

*   **query** (query, required):
    *   `in`: query
    *   `name`: query
    *   `required`: true
    *   `schema`: `string`
    *   Description: The text query to search for. This is the movie title you are looking for.

*   **include_adult** (query, optional):
    *   `in`: query
    *   `name`: include\_adult
    *   `schema`: `boolean`
    *   `default`: `false`
    *   Description:  Include adult content in the search results.  Defaults to `false`.

*   **language** (query, optional):
    *   `in`: query
    *   `name`: language
    *   `schema`: `string`
    *   `default`: `en-US`
    *   Description:  Pass a ISO-639-1 value to display translated results.

*   **primary_release_year** (query, optional):
    *   `in`: query
    *   `name`: primary\_release\_year
    *   `schema`: `string`
    *   Description: Filter results to movies with this primary release year.

*   **page** (query, optional):
    *   `in`: query
    *   `name`: page
    *   `schema`: `integer` (format: `int32`)
    *   `default`: `1`
    *   Description: Specify the page of results to query. Defaults to `1`.

*   **region** (query, optional):
    *   `in`: query
    *   `name`: region
    *   `schema`: `string`
    *   Description: Specify a ISO-3166-1 value to display translated results.

*   **year** (query, optional):
    *   `in`: query
    *   `name`: year
    *   `schema`: `string`
    *   Description: Filter results to movies with this release year.

**Responses:**

*   **200 OK**:
    *   Description: Success.
    *   Content Type: `application/json`
    *   Schema: `object` with properties:
        *   `page`: `integer` - The current page number.
        *   `results`: `array` of `object` - An array of movie objects matching the search query. Each movie object contains details like `adult`, `backdrop_path`, `genre_ids`, `id`, `original_language`, `original_title`, `overview`, `popularity`, `poster_path`, `release_date`, `title`, `video`, `vote_average`, `vote_count`.
        *   `total_pages`: `integer` - The total number of pages available.
        *   `total_results`: `integer` - The total number of movies matching the search query.

**Example Request (JavaScript):**

```javascript
const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const query = 'Fight Club'; // Example movie title
const url = `https://api.themoviedb.org/3/search/movie?query=${query}`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the movie search results
})
.catch(error => console.error('Error:', error));
```

### 2. Discover Movies - `/3/discover/movie`

**Endpoint:** `GET /3/discover/movie`

**Summary:** Discover movies based on various filters and sort options.

**Description:** This endpoint allows you to discover movies using a wide range of filters (like genres, release date, rating, etc.) and sorting options.

**Parameters:** (Many parameters available - see OpenAPI spec for full list. Some key parameters are:)

*   **sort_by** (query, optional):
    *   `in`: query
    *   `name`: sort\_by
    *   `schema`: `string` (enum: `original_title.asc`, `original_title.desc`, `popularity.asc`, `popularity.desc`, `revenue.asc`, `revenue.desc`, `primary_release_date.asc`, `title.asc`, `title.desc`, `primary_release_date.desc`, `vote_average.asc`, `vote_average.desc`, `vote_count.asc`, `vote_count.desc`)
    *   `default`: `popularity.desc`
    *   Description:  Sort results by attribute. Default is `popularity.desc` (popularity descending).

*   **with_genres** (query, optional):
    *   `in`: query
    *   `name`: with\_genres
    *   `schema`: `string`
    *   Description: Filter movies by genre IDs.  Can be comma-separated (AND) or pipe-separated (OR).

*   **primary_release_year** (query, optional):
    *   `in`: query
    *   `name`: primary\_release\_year
    *   `schema`: `integer` (format: `int32`)
    *   Description: Filter movies by primary release year.

*   **vote_average.gte** (query, optional):
    *   `in`: query
    *   `name`: vote\_average.gte
    *   `schema`: `number` (format: `float`)
    *   Description: Filter movies with a vote average greater than or equal to this value.

*   **page** (query, optional):
    *   `in`: query
    *   `name`: page
    *   `schema`: `integer` (format: `int32`)
    *   `default`: `1`
    *   Description: Specify the page of results to query. Defaults to `1`.

**Responses:**

*   **200 OK**:
    *   Description: Success.
    *   Content Type: `application/json`
    *   Schema: `object` with properties similar to `/3/search/movie` response (page, results, total\_pages, total\_results).

**Example Request (JavaScript):**

```javascript
const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const genreIds = '28,12'; // Example genre IDs for Action and Adventure
const sortBy = 'vote_average.desc'; // Example sort option
const url = `https://api.themoviedb.org/3/discover/movie?with_genres=${genreIds}&sort_by=${sortBy}`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the movie discovery results
})
.catch(error => console.error('Error:', error));
```

### 3. Movie Details - `/3/movie/{movie_id}`

**Endpoint:** `GET /3/movie/{movie_id}`

**Summary:** Get detailed information about a specific movie.

**Description:** Retrieve comprehensive details for a movie, including genres, budget, revenue, overview, cast, crew, images, videos, and more.

**Parameters:**

*   **movie_id** (path, required):
    *   `in`: path
    *   `name`: movie\_id
    *   `schema`: `integer` (format: `int32`)
    *   `required`: true
    *   Description: The ID of the movie to retrieve details for.

*   **language** (query, optional):
    *   `in`: query
    *   `name`: language
    *   `schema`: `string`
    *   `default`: `en-US`
    *   Description:  Pass a ISO-639-1 value to display translated results.

*   **append_to_response** (query, optional):
    *   `in`: query
    *   `name`: append\_to\_response
    *   `schema`: `string`
    *   Description:  Append additional information to the response. For example, `append_to_response=videos,images,credits`. (See TMDB API documentation for valid options).

**Responses:**

*   **200 OK**:
    *   Description: Success.
    *   Content Type: `application/json`
    *   Schema: `object` - A detailed movie object. Properties include `adult`, `backdrop_path`, `belongs_to_collection`, `budget`, `genres`, `homepage`, `id`, `imdb_id`, `original_language`, `original_title`, `overview`, `popularity`, `poster_path`, `production_companies`, `production_countries`, `release_date`, `revenue`, `runtime`, `spoken_languages`, `status`, `tagline`, `title`, `video`, `vote_average`, `vote_count`.

**Example Request (JavaScript):**

```javascript
const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const movieId = 550; // Example movie ID (Fight Club)
const url = `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=videos,images,credits`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the movie details response
})
.catch(error => console.error('Error:', error));
```

### 4. Search for TV Shows - `/3/search/tv`

**Endpoint:** `GET /3/search/tv`

**Summary:** Search for TV shows by name.

**Description:**  This endpoint allows you to search for TV shows by their original, translated, and "also known as" names.

**Parameters:**

*   **query** (query, required):
    *   `in`: query
    *   `name`: query
    *   `schema`: `string`
    *   `required`: true
    *   Description: The text query to search for. This is the TV show title you are looking for.

*   **include_adult** (query, optional):
    *   `in`: query
    *   `name`: include\_adult
    *   `schema`: `boolean`
    *   `default`: `false`
    *   Description:  Include adult content in the search results.  Defaults to `false`.

*   **language** (query, optional):
    *   `in`: query
    *   `name`: language
    *   `schema`: `string`
    *   `default`: `en-US`
    *   Description:  Pass a ISO-639-1 value to display translated results.

*   **first_air_date_year** (query, optional):
    *   `in`: query
    *   `name`: first\_air\_date\_year
    *   `schema`: `integer` (format: `int32`)
    *   Description:  Filter results to TV shows with this first air date year.

*   **page** (query, optional):
    *   `in`: query
    *   `name`: page
    *   `schema`: `integer` (format: `int32`)
    *   `default`: `1`
    *   Description: Specify the page of results to query. Defaults to `1`.

*   **year** (query, optional):
    *   `in`: query
    *   `name`: year
    *   `schema`: `integer` (format: `int32`)
    *   Description: Filter results to TV shows with this first air date and all episode air dates year.

**Responses:**

*   **200 OK**:
    *   Description: Success.
    *   Content Type: `application/json`
    *   Schema: `object` with properties similar to `/3/search/movie` response, but with TV show specific fields like `origin_country`, `original_name`, `first_air_date`, `name`.

**Example Request (JavaScript):**

```javascript
const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const query = 'Breaking Bad'; // Example TV show title
const url = `https://api.themoviedb.org/3/search/tv?query=${query}`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the TV show search results
})
.catch(error => console.error('Error:', error));
```

### 5. TV Show Details - `/3/tv/{series_id}`

**Endpoint:** `GET /3/tv/{series_id}`

**Summary:** Get detailed information about a specific TV show.

**Description:** Retrieve comprehensive details for a TV show, including created by, episode run time, genres, homepage, overview, networks, seasons, spoken languages, status, tagline, and more.

**Parameters:**

*   **series_id** (path, required):
    *   `in`: path
    *   `name`: series\_id
    *   `schema`: `integer` (format: `int32`)
    *   `required`: true
    *   Description: The ID of the TV show to retrieve details for.

*   **language** (query, optional):
    *   `in`: query
    *   `name`: language
    *   `schema`: `string`
    *   `default`: `en-US`
    *   Description:  Pass a ISO-639-1 value to display translated results.

*   **append_to_response** (query, optional):
    *   `in`: query
    *   `name`: append\_to\_response
    *   `schema`: `string`
    *   Description:  Append additional information to the response. For example, `append_to_response=videos,images,credits`. (See TMDB API documentation for valid options).

**Responses:**

*   **200 OK**:
    *   Description: Success.
    *   Content Type: `application/json`
    *   Schema: `object` - A detailed TV show object. Properties include `adult`, `backdrop_path`, `created_by`, `episode_run_time`, `first_air_date`, `genres`, `homepage`, `id`, `in_production`, `languages`, `last_air_date`, `last_episode_to_air`, `name`, `next_episode_to_air`, `networks`, `number_of_episodes`, `number_of_seasons`, `origin_country`, `original_language`, `original_name`, `overview`, `popularity`, `poster_path`, `production_companies`, `production_countries`, `seasons`, `spoken_languages`, `status`, `tagline`, `type`, `vote_average`, `vote_count`.

**Example Request (JavaScript):**

```javascript
const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const seriesId = 1399; // Example TV show ID (Game of Thrones)
const url = `https://api.themoviedb.org/3/tv/${seriesId}?append_to_response=videos,images,credits`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the TV show details response
})
.catch(error => console.error('Error:', error));
```

### 6. Get Configuration - `/3/configuration`

**Endpoint:** `GET /3/configuration`

**Summary:** Get API configuration details.

**Description:**  This endpoint retrieves configuration information needed to use the API, particularly the base URLs for images and valid image sizes.

**Parameters:**

*   None

**Responses:**

*   **200 OK**:
    *   Description: Success.
    *   Content Type: `application/json`
    *   Schema: `object` with properties:
        *   `images`: `object` - Image configuration.
            *   `base_url`: `string` - Base URL for images (e.g., `http://image.tmdb.org/t/p/`).
            *   `secure_base_url`: `string` - Secure base URL for images (e.g., `https://image.tmdb.org/t/p/`).
            *   `backdrop_sizes`: `array` of `string` - Available backdrop sizes (e.g., `["w300", "w780", "w1280", "original"]`).
            *   `logo_sizes`: `array` of `string` - Available logo sizes.
            *   `poster_sizes`: `array` of `string` - Available poster sizes.
            *   `profile_sizes`: `array` of `string` - Available profile sizes.
            *   `still_sizes`: `array` of `string` - Available still sizes.
        *   `change_keys`: `array` of `string` -  List of keys that can be used to detect changes.

**Example Request (JavaScript):**

```javascript
const apiKey = 'YOUR_API_KEY'; // Replace with your API key
const url = `https://api.themoviedb.org/3/configuration`;

fetch(url, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log(data); // Log the configuration response
  const baseUrl = data.images.secure_base_url;
  const posterSize = data.images.poster_sizes[3]; // Example: Use 'w342' poster size
  console.log(`Image Base URL: ${baseUrl}`);
  console.log(`Poster Size: ${posterSize}`);
})
.catch(error => console.error('Error:', error));
```

## General JavaScript Usage Pattern

Here's a reusable JavaScript function for making TMDB API requests:

```javascript
async function fetchTMDBData(endpoint, apiKey) {
  const url = `https://api.themoviedb.org/3${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Unable to fetch data:", error);
    return null;
  }
}

// Example usage:
async function searchMovies(query) {
  const apiKey = 'YOUR_API_KEY'; // Replace with your API key
  const endpoint = `/search/movie?query=${query}`;
  const movieData = await fetchTMDBData(endpoint, apiKey);
  if (movieData) {
    console.log("Search results:", movieData);
  }
}

searchMovies('Fight Club');
```

## Security Reminder

Remember to keep your API key secure and do not expose it directly in client-side code if possible. For AI applications, consider using environment variables or secure configuration methods to manage your API key.

## Conclusion

This documentation provides a basic introduction to using the TMDB API with JavaScript. The provided endpoints are a starting point for exploring the vast amount of data available.  Refer to the complete TMDB API documentation for more endpoints and advanced features.  Experiment with different endpoints and parameters to explore the full capabilities of the TMDB API!
```