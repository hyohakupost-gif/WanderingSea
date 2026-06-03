# GAS API Specification

This document describes the Google Apps Script APIs used by the WanderingSea ID search frontend.

## Endpoints

The endpoint URLs are configured in `js/config.js`.

| Constant | Purpose |
|---|---|
| `SCRIPT_URL` | Letter ID search API |
| `LAST_UPDATE_API_URL` | Latest update status API |

## Search API

### Endpoint

Google Apps Script Web App URL configured as `SCRIPT_URL`.

### Request

Searches letter records by sender name and/or letter title.

Method: `GET`

Parameters:

| Name | Required | Description |
|---|---:|---|
| `name` | no | Sender name search keyword. Partial match, case-insensitive. |
| `title` | no | Letter title search keyword. Partial match, case-insensitive. |

At least one of `name` or `title` must be provided.

Example:

```txt
?name=Alice
```

```txt
?title=Voyage
```

```txt
?name=Alice&title=Voyage
```

### Response

Content-Type: `application/json`

#### Success

Returned when one or more matches are found and the total match count is not greater than the maximum result limit.

```json
{
  "status": "success",
  "data": [
    {
      "id": "12345",
      "date": "2026/06/03",
      "name": "Alice",
      "title": "Voyage"
    }
  ]
}
```

Fields:

| Name | Type | Description |
|---|---|---|
| `status` | string | Always `success`. |
| `data` | array | Matching letter records. |
| `data[].id` | string/number | Letter ID. |
| `data[].date` | string | Posted date formatted as `yyyy/MM/dd`. |
| `data[].name` | string | Sender name. |
| `data[].title` | string | Letter title. |

#### Error: Missing Search Keyword

Returned when both `name` and `title` are empty or omitted.

```json
{
  "status": "error",
  "message": "検索ワードを入力してください"
}
```

#### Error: No Results

Returned when no records match the search conditions.

```json
{
  "status": "error",
  "message": "該当するデータはありません"
}
```

#### Error: Too Many Results

Returned when the number of matching records is greater than the maximum result limit.

```json
{
  "status": "error",
  "message": "検索結果が多すぎます\n（現在の検索結果：45件）30件以下に絞ってください"
}
```

#### Debug Error

Returned when an exception occurs inside the GAS implementation.

```json
{
  "status": "debug_error",
  "message": "Exception message"
}
```

### Search Behavior

| Item | Specification |
|---|---|
| Match type | Partial match |
| Case handling | Case-insensitive |
| Multiple parameters | `name` and `title` are combined with AND conditions |
| Maximum returned records | 30 |
| Too many matches | Returns `status: "error"` instead of truncating silently |
| Cache duration | 300 seconds |

### Data Source

The API reads records from the active spreadsheet.

| Spreadsheet Column Index | Field |
|---:|---|
| 1 | Unused by response |
| 2 | `id` |
| 3 | `date` |
| 4 | `name` |
| 5 | `title` |

Rows with an empty `id` are skipped.

## Latest Update Status API

### Endpoint

Google Apps Script Web App URL configured as `LAST_UPDATE_API_URL`.

### Request

The frontend calls this endpoint as JSONP.

Method: `GET`

Parameters:

| Name | Required | Description |
|---|---:|---|
| `callback` | yes | JSONP callback function name. The frontend sends `callback=callback`. |

Example:

```txt
?callback=callback
```

### Response

Content-Type: JavaScript JSONP response.

Example:

```js
callback({
  "last_updated": "2026/06/03"
});
```

Fields:

| Name | Type | Description |
|---|---|---|
| `last_updated` | string | Latest posting/update date displayed by the frontend. |

## Frontend Consumers

| File | Usage |
|---|---|
| `js/search.js` | Calls `SCRIPT_URL` and renders `status`, `data`, and `message`. |
| `js/update-status.js` | Calls `LAST_UPDATE_API_URL` through JSONP and displays `last_updated`. |
