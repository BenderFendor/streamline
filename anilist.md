```markdown
# AniList API Documentation

This document explains how to use the AniList GraphQL API based on the provided code snippets and GraphQL queries.

## Overview

The AniList API allows you to retrieve information about anime, manga, characters, staff, users, and more. It uses GraphQL, a query language for APIs, which lets you request exactly the data you need.

## Getting Started

### API Endpoint

The primary endpoint for the AniList GraphQL API is:

```
[https://graphql.anilist.co](https://graphql.anilist.co)
```

### Making Requests

You make requests to the API using HTTP POST requests. The request body should be a JSON object with the following structure:

```json
{
  "query": "YOUR_GRAPHQL_QUERY",
  "variables": {
    "YOUR_VARIABLES": "YOUR_VALUES"
  }
}
```

* `query`: The GraphQL query string.
* `variables`: An optional object containing variables used in the query.

### Example Request (Python)

```python
import requests

query = """
query ($id: Int) {
  Media (id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
  }
}
"""

variables = {
    'id': 15125
}

url = '[https://graphql.anilist.co](https://graphql.anilist.co)'

response = requests.post(url, json={'query': query, 'variables': variables})

print(response.json())
```

### Example Request (PHP)

```php
<?php
$query = '
query ($id: Int) {
  Media (id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
  }
}
';

$variables = [
    "id" => 15125
];

$http = new GuzzleHttp\Client;
$response = $http->post('[https://graphql.anilist.co](https://graphql.anilist.co)', [
    'json' => [
        'query' => $query,
        'variables' => $variables,
    ]
]);

$result = json_decode($response->getBody(), true);
print_r($result);
?>
```

### Example Request (JavaScript)

```javascript
const fetch = require('node-fetch');

const query = `
query ($id: Int) {
  Media (id: $id, type: ANIME) {
    id
    title {
      romaji
      english
      native
    }
  }
}
`;

const variables = {
    id: 15125
};

const url = '[https://graphql.anilist.co](https://graphql.anilist.co)';
const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    body: JSON.stringify({
        query: query,
        variables: variables
    })
};

fetch(url, options)
    .then(response => response.json())
    .then(data => console.log(data));
```

## Authentication

Some API requests require authentication. You'll need an access token.

### Getting an Access Token (Authorization Code Grant)

1.  **Request Authorization:** Redirect the user to the AniList authorization URL.
2.  **User Authorization:** The user authorizes your application.
3.  **Receive Authorization Code:** AniList redirects the user back to your `redirect_uri` with an authorization code.
4.  **Exchange Code for Token:** Use the authorization code to request an access token.

**Example (JavaScript):**

```javascript
fetch("[https://anilist.co/api/v2/oauth/token](https://anilist.co/api/v2/oauth/token)", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    body: JSON.stringify({
        "grant_type": "authorization_code",
        "client_id": "{client_id}",
        "client_secret": "{client_secret}",
        "redirect_uri": "{redirect_uri}",
        "code": "{code}"
    })
}).then(response => response.json())
  .then(data => console.log(data.access_token));
```

**Example (PHP):**

```php
<?php
$http = new GuzzleHttp\Client;

$response = $http->post('[https://anilist.co/api/v2/oauth/token](https://anilist.co/api/v2/oauth/token)', [
    'form_params' => [
        'grant_type' => 'authorization_code',
        'client_id' => '{client_id}',
        'client_secret' => '{client_secret}',
        'redirect_uri' => '{redirect_uri}',
        'code' => '{code}',
    ],
    'headers' => [
        'Accept' => 'application/json'
    ]
]);

$token = json_decode($response->getBody())->access_token;
print_r($token);
?>
```

### Using the Access Token

Include the access token in the `Authorization` header of your API requests:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

**Example (JavaScript):**

```javascript
const accessToken = "YOUR_ACCESS_TOKEN";

const options = {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // ... rest of your request
};
```

**Example (PHP):**

```php
<?php
$accessToken = "YOUR_ACCESS_TOKEN";

$response = $http->request('POST', '[https://graphql.anilist.co](https://graphql.anilist.co)', [
    'headers' => [
        'Authorization' => 'Bearer ' . $accessToken,
        'Accept' => 'application/json',
        'Content-Type' => 'application/json',
    ],
    // ... rest of your request
]);
?>
```

## GraphQL Queries

Here are some example GraphQL queries from the provided files:

### Searching Anime, Manga, Users, etc.

```graphql
query ($query: String) {
  AnimeSearch: Page {
    media(search: $query, type: ANIME) {
      id
      title {
        userPreferred
      }
      coverImage {
        large
      }
    }
  }
  // ... other searches (MangaSearch, UserSearch, etc.)
}
```

### Getting Character Details

```graphql
query ($id: Int!) {
  Character (id: $id) {
    id
    name {
      first
      last
      native
      alternative
    }
    description
    isFavourite
    image {
      medium
      large
    }
    // ... other fields
  }
}
```

### Getting Media Details

```graphql
query ($id: Int!, $type: MediaType) {
  Media(id: $id, type: $type) {
    id
    title {
      romaji
      english
      native
      userPreferred
    }
    // ... other fields
  }
}
```

### User Series List

```graphql
query ($id: Int!, $listType: MediaType) {
  MediaListCollection (userId: $id, type: $listType) {
    lists {
      name
      isCustomList
      isSplitCompletedList
      entries {
        ... mediaListEntry
      }
    }
    user {
      id
      name
      avatar {
        large
      }
      mediaListOptions {
        scoreFormat
        rowOrder
      }
    }
  }
}

fragment mediaListEntry on MediaList {
  id
  score
  scoreRaw: score (format: POINT_100)
  // ... other fields
  media {
    id
    title {
      userPreferred
    }
  }
}
```

### Pagination

```graphql
query ($id: Int, $page: Int, $perPage: Int, $search: String) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      currentPage
      hasNextPage
      perPage
    }
    media (id: $id, search: $search) {
      id
      title {
        romaji
      }
    }
  }
}
```

## Mutations

Mutations are used to modify data.

### Saving Media List Entry

```graphql
mutation ($listEntryId: Int, $mediaId: Int, $status: MediaListStatus) {
  SaveMediaListEntry(id: $listEntryId, mediaId: $mediaId, status: $status) {
    id
    status
  }
}
```

This mutation can be used to create or update media list entries.

## Key Concepts

* **GraphQL:** A query language for