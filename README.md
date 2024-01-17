# VideoMe API Documentation

Welcome to the VideoMe API - your go-to platform for managing multimedia content. This API is built with Node.js and Express.js, using TypeScript. MongoDB serves as the primary database, and Mongoose, along with `mongoose-aggregate-paginate-v2`, is utilized for powerful MongoDB query capabilities. Passwords are securely encrypted using bcrypt, and file uploading is handled with Multer. Cloudinary is integrated for cloud storage, offering a scalable solution for media assets. JSON Web Tokens (JWT) are employed for authorization and authentication, while Joi is used for input validation.

### some useful links
| Modal Link               | Postman Link                                     |
|--------------------------|--------------------------------------------------|
| [Schema Design](https://app.eraser.io/workspace/ISvPZ5hbXev4jGEPUcIL?origin=share)  | [Postman Collection](https://documenter.getpostman.com/view/28624054/2s9YsRboTE)  |



## Table of Contents

1. [Technologies Used](#technologies-used)
2. [Setup Instructions](#setup-instructions)
   - [Clone the Repository](#1-clone-the-repository)
   - [](#2-install-dependencies)
   - [Build the TypeScript Files](#3-build-the-typescript-files)
   - [Run the Project](#4-run-the-project)
   - [Environment Variables](#5-environment-variables)
     - [Sample Environment File (.env)](#sample-environment-file-env)
3. [Base URL](#base-url)
4. [Middleware](#middleware)
   - [Authentication Middleware](#authentication-middleware)
5. [User API](#user-api)
   - [Register](#1-register)
   - [Login](#2-login)
   - [Get Access Token](#3-get-access-token)
   - [Logout](#4-logout)
   - [Update Password](#5-update-password)
   - [Update Avatar](#6-update-avatar)
   - [Update Cover Image](#7-update-cover-image)
   - [Update User Details](#8-update-user-details)
   - [Get User Channel Profile](#9-get-user-channel-profile)
   - [Get Watch History](#10-get-watch-history)
6. [Subscription API](#subscription-api)
   - [Toggle Subscription](#1-toggle-subscription)
   - [Get User Channel Subscribers](#2-get-user-channel-subscribers)
   - [Get Subscribed Channels for a User](#3-get-subscribed-channels-for-a-user)
7. [Video API](#video-api)
   - [Publish a Video](#1-publish-a-video)
   - [Get All Videos](#2-get-all-videos)
   - [Get, Delete a Video by ID](#3-get-delete-a-video-by-id)
   - [Update a Video by ID](#4-update-a-video-by-id)
   - [Toggle Publish Status of a Video](#5-toggle-publish-status-of-a-video)
8. [Playlist API](#playlist-api)
   - [Create a Playlist](#1-create-a-playlist)
   - [Get, Delete a Playlist by ID](#2-get-delete-a-playlist-by-id)
   - [Update a Playlist by ID](#3-update-a-playlist-by-id)
   - [Add and Remove Videos to/from a Playlist](#4-add-and-remove-videos-tofrom-a-playlist)
   - [Get User's Playlists](#5-get-users-playlists)
9. [Tweet API](#tweet-api)
   - [Create a Tweet](#1-create-a-tweet)
   - [Get User's Tweets](#2-get-users-tweets)
   - [Delete a Tweet by ID](#3-delete-a-tweet-by-id)
   - [Update a Tweet by ID](#4-update-a-tweet-by-id)
10. [Like API](#like-api)

    - [Toggle Like on a Video](#1-toggle-like-on-a-video)
    - [Toggle Like on a Comment](#2-toggle-like-on-a-comment)
    - [Toggle Like on a Tweet](#3-toggle-like-on-a-tweet)
    - [Get Liked Videos](#4-get-liked-videos)

11. [Dashboard API](#dashboard-api)

    - [Get Channel Statistics](#1-get-channel-statistics)
    - [Get Channel Videos](#2-get-channel-videos)

12. [Video Comments API](#video-comments-api)

    - [Get Video Comments](#1-get-video-comments)
    - [Delete Comment](#2-delete-comment)
    - [Update Comment](#3-update-comment)

13. [Health Check API](#health-check-api)

    - [Health Check](#1-health-check)

## Technologies Used

- **Node.js:** Server-side JavaScript runtime.
- **Express.js:** Web application framework for Node.js.
- **TypeScript:** Superset of JavaScript with static typing.
- **MongoDB:** Primary NoSQL database for data storage.
- **Mongoose:** MongoDB ODM for simplified data manipulation.
- **mongoose-aggregate-paginate-v2:** Enhances Mongoose with advanced aggregation and pagination support.
- **bcrypt:** Library for securely hashing and encrypting passwords.
- **Multer:** Middleware for handling file uploads.
- **Cloudinary:** Cloud-based storage for media assets.
- **JSON Web Tokens (JWT):** Token-based authentication and authorization.
- **Joi:** Library for input validation.

## Setup Instructions

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Sujeet76/youtube-ts.git
   cd videoMe_Api
   ```
2. **Install Dependencies**
   ```bash
   npm i
   ```
3. **Build the TypeScript Files**
   ```bash
   npm run build
   ```
4. **Run the Project**
   ```bash
   npm run dev
   ```

### Sample Environment File (.env)

```bash
  PORT =8080
  BD_URL =
  CORS_ORIGIN =

  ACCESS_TOKEN_SECRET =
  ACCESS_TOKEN_EXPIRATION_TIME = 1d
  REFRESH_TOKEN_SECRET =
  REFRESH_TOKEN_EXPIRATION_TIME =10d

  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=
```

## Base URL

- **Base URL:** `http://localhost:3000/api/v1`

## Middleware

- **Authentication Middleware:** The `isAuthorized` middleware is applied across various routes to verify JWT for secure authentication.

---

## User API

### Overview

- **Base URL:** `/users`

### Endpoints

1. **Register**

   - **Path:** `/register`
   - **HTTP Method:** POST
   - **Description:** Create a new user account with username, full name, email, password, and optional avatar and cover image.
   - **Required Parameter**
     - **username**
     - **fullName**
     - **email**
     - **password**
     - **avatar(file)**
     - **coverImage(file,optional)**

2. **Login**

   - **Path:** `/login`
   - **HTTP Method:** POST
   - **Description:** Log in with valid credentials to obtain an access token.
   - **Required Parameter**
     - **username(optional,any one)**
     - **email(optional,any one)**
     - **password**

3. **Get Access Token**

   - **Path:** `/get-token`
   - **HTTP Method:** GET
   - **Description:** Obtain a new access token using the refresh token.

4. **Logout**

   - **Path:** `/logout`
   - **HTTP Method:** POST
   - **Description:** Log out the user by invalidating the access token.

5. **Update Password**

   - **Path:** `/update-password`
   - **HTTP Method:** PATCH
   - **Description:** Update the user's password.
   - **Required Parameter**
     - **currentPassword**
     - **newPassword**

6. **Update Avatar**

   - **Path:** `/update-avatar`
   - **HTTP Method:** PATCH
   - **Description:** Update the user's avatar.
   - **Required Parameter**
     - **avatar(file)**

7. **Update Cover Image**

   - **Path:** `/update-cover-img`
   - **HTTP Method:** PATCH
   - **Description:** Update the user's cover image.
   - **Required Parameter**
     - **coverImage**

8. **Update User Details**

   - **Path:** `/update-user`
   - **HTTP Method:** PATCH
   - **Description:** Update the user's profile details.
   - **Required Parameter**
     - **fullName (optional)**
     - **email (optional)**

9. **Get User Channel Profile**

   - **Path:** `/c/:username`
   - **HTTP Method:** GET
   - **Description:** Retrieve the profile information for a user's channel.

10. **Get Watch History**
    - **Path:** `/history`
    - **HTTP Method:** GET
    - **Description:** Retrieve the watch history for the authenticated user.

---

## Subscription API

### Overview

- **Base URL:** `/subscriptions`

### Middleware

- **Middleware:** `isAuthorized`

### Endpoints

1. **Toggle Subscription**

   - **Path:** `/c/:channelId`
   - **HTTP Methods:** POST
   - **Description:** Toggle subscription status for a specific channel.

2. **Get User Channel Subscribers**

   - **Path:** `/c/:channelId`
   - **HTTP Methods:** GET
   - **Description:** Retrieve subscriber lists

3. **Get Subscribed Channels for a User**
   - **Path:** `/u/:subscriberId`
   - **HTTP Method:** GET
   - **Description:** Retrieve the list of channels to which a user has subscribed.

---

## Video API

### Overview

- **Base URL:** `/videos`

### Middleware

- **Middleware:** `isAuthorized`

### Endpoints

1. **Publish a Video**

   - **Path:** `/`
   - **HTTP Methods:** POST
   - **Description:** Publish a new video.
   - **Required Parameter**
     - **_title_**
     - **_description_**
     - **_videoFile (file)_**
     - **_thumbnail (file)_**

2. **Get All Videos**

   - **Path:** `/`
   - **HTTP Methods:** GET
   - **Description:** Retrieve a list of all videos
   - **Query Parameter**
     - **_userId_**
     - **_query (optional)_**
     - **_page (optional, default 1)_**
     - **_limit (optional, default 10)_**
     - **_sortType (optional, default asc)_**
     - **_sortBy (optional, default createdAt)_**

3. **Get, Delete a Video by ID**

   - **Path:** `/videos/:videoId`
   - **HTTP Methods:** GET, DELETE
   - **Description:** Retrieve and delete video details by ID.

4. **Update a Video by ID**

   - **Path:** `/videos/:videoId`
   - **HTTP Methods:** PATCH
   - **Description:** Update video details by ID.
   - **Required Parameter**
     - **_title (optional)_**
     - **_description (optional)_**
     - **_thumbnail (optional,file)_**

5. **Toggle Publish Status of a Video**
   - **Path:** `/toggle/publish/:videoId`
   - **HTTP Method:** PATCH
   - **Description:** Toggle the publish status of a video.

---

## Playlist API

### Overview

- **Base URL:** `/playlists`

### Middleware

- **Middleware:** `isAuthorized`

### Endpoints

1. **Create a Playlist**

   - **Path:** `/`
   - **HTTP Method:** POST
   - **Description:** Create a new playlist.
   - **Required Parameter**
     - **_name_**
     - **_description_**

2. **Get, Delete a Playlist by ID**

   - **Path:** `/:playlistId`
   - **HTTP Methods:** GET, DELETE
   - **Description:** Retrieve and delete playlist details by ID.

3. **Update a Playlist by ID**

   - **Path:** `/:playlistId`
   - **HTTP Methods:** PATCH
   - **Description:** Update playlist details by ID.
   - **Required Parameter**
     - **_name_**
     - **_description_**

4. **Add and Remove Videos to/from a Playlist**

   - **Path:** `/add/:playlistId` and `/remove/:playlistId`
   - **HTTP Method:** PATCH
   - **Description:** Add and remove videos to/from a playlist.
   - **Required Parameter**
     - **_videoIds (array of video ids)_**

5. **Get User's Playlists**
   - **Path:** `/user/playlist`
   - **HTTP Method:** GET
   - **Description:** Retrieve playlists associated with the authenticated user.

---

## Tweet API

### Overview

- **Base URL:** `/tweets`

### Middleware

- **Middleware:** `isAuthorized`

### Endpoints

1. **Create a Tweet**

   - **Path:** `/`
   - **HTTP Method:** POST
   - **Description:** Create a new tweet.
   - **Required Parameter**
     - **_content_**

2. **Get User's Tweets**

   - **Path:** `/user/:userId`
   - **HTTP Method:** GET
   - **Description:** Retrieve tweets associated with a specific user.

3. **Delete a Tweet by ID**

   - **Path:** `/:tweetId`
   - **HTTP Methods:** DELETE
   - **Description:** Delete a tweet by its ID.

4. **Update a Tweet by ID**
   - **Path:** `/:tweetId`
   - **HTTP Methods:** PATCH
   - **Description:** Update a tweet by its ID.
   - **Required Parameter**
     - **_content_**

---

## Like API

### Overview

- **Base URL:** `/likes`

### Middleware

- **Middleware:** `isAuthorized`

### Endpoints

1. **Toggle Like on a Video**

   - **Path:** `/toggle/v/:videoId`
   - **HTTP Method:** POST
   - **Description:** Toggle the like status on a video.

2. **Toggle Like on a Comment**

   - **Path:** `/toggle/c/:commentId`
   - **HTTP Method:** POST
   - **Description:** Toggle the like status on a comment.

3. **Toggle Like on a Tweet**

   - **Path:** `/toggle/t/:tweetId`
   - **HTTP Method:** POST
   - **Description:** Toggle the like status on a tweet.

4. **Get Liked Videos**
   - **Path:** `/videos`
   - **HTTP Method:** GET
   - **Description:** Retrieve a list of videos liked by the authenticated user.

---

## Dashboard API

### Overview

- **Base URL:** `/dashboard`

### Middleware

- **Middleware:** `isAuthorized`

### Endpoints

1. **Get Channel Statistics**

   - **Path:** `/stats`
   - **HTTP Method:** GET
   - **Description:** Retrieve statistics for the authenticated user's channel.

2. **Get Channel Videos**
   - **Path:** `/videos`
   - **HTTP Method:** GET
   - **Description:** Retrieve a list of videos associated with the authenticated user's channel.

---

## Video Comments API

### Overview

- **Base URL:** `/comments`

### Endpoints

1. **Get Video Comments**

   - **Path:** `/:videoId`
   - **HTTP Method:** GET
   - **Description:** Retrieve comments associated with a specific video.
   - **Query Parameter**
     - **_page (optional, default 1)_**
     - **_limit (optional, default 10)_**

2. **Delete Comment**

   - **Path:** `/c/:commentId`
   - **HTTP Methods:** DELETE
   - **Description:** Delete comment by their ID.

3. **Update Comment**
   - **Path:** `/c/:commentId`
   - **HTTP Methods:** PATCH
   - **Description:** Update comment by their ID.

---

## Health Check API

### Overview

- **Base URL:** `/healthcheck`

### Endpoints

1. **Health Check**
   - **Path:** `/`
   - **HTTP Method:** GET
   - **Description:** Perform a health check on the server.

---
