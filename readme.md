# ZESTO --- Role-Based Food Delivery Platform

ZESTO is a food delivery platform for **customers, restaurant owners
(sellers), and riders**. It is being developed with a React frontend and
a microservices-oriented backend. The current backend is split into
Auth, Restaurant, and Utils services.

> **Project status:** Work in progress. This README clearly separates
> implemented features from ongoing work and planned infrastructure. Do
> not treat the roadmap as completed functionality.

------------------------------------------------------------------------

## Contents

-   [Screenshots](#screenshots)
-   [Features and Development Status](#features-and-development-status)
-   [Architecture](#architecture)
-   [Technology Stack](#technology-stack)
-   [Repository Structure](#repository-structure)
-   [Key Engineering Decisions](#key-engineering-decisions)
-   [Getting Started](#getting-started)
-   [Environment Configuration](#environment-configuration)
-   [Running the Project](#running-the-project)
-   [API Overview](#api-overview)
-   [Roadmap](#roadmap)

------------------------------------------------------------------------

## Screenshots

Add your screenshots to `docs/screenshots/` in the repository, then
replace the filenames below with your actual image filenames. GitHub
will render these images on the repository homepage.

```{=html}
<!-- SCREENSHOT PLACEHOLDER 1
     Capture: Landing page / restaurant discovery page.
     Show: ZESTO branding, location selection, restaurant cards and nearby results.
     Save as: docs/screenshots/01-restaurant-discovery.png
-->
```
### Restaurant Discovery

![Restaurant discovery
page](docs/screenshots/01-restaurant-discovery.png)

```{=html}
<!-- SCREENSHOT PLACEHOLDER 2
     Capture: Restaurant details and menu page.
     Show: Restaurant information, menu items, prices and availability.
     Save as: docs/screenshots/02-restaurant-menu.png
-->
```
### Restaurant Menu

![Restaurant menu page](docs/screenshots/02-restaurant-menu.png)

```{=html}
<!-- SCREENSHOT PLACEHOLDER 3
     Capture: Cart page.
     Show: Selected items, quantities, subtotal and restaurant restriction if visible.
     Save as: docs/screenshots/03-cart.png
-->
```
### Shopping Cart

![Shopping cart](docs/screenshots/03-cart.png)

```{=html}
<!-- SCREENSHOT PLACEHOLDER 4
     Capture: Address management / address selection page.
     Show: Saved addresses and selected delivery address. Do not show personal phone numbers or exact home addresses in a public screenshot.
     Save as: docs/screenshots/04-addresses.png
-->
```
### Delivery Addresses

![Address management](docs/screenshots/04-addresses.png)

```{=html}
<!-- SCREENSHOT PLACEHOLDER 5
     Capture: Seller dashboard.
     Show: Restaurant management, open/close status, menu management or item availability controls.
     Save as: docs/screenshots/05-seller-dashboard.png
-->
```
### Seller Dashboard

![Seller dashboard](docs/screenshots/05-seller-dashboard.png)

```{=html}
<!-- SCREENSHOT PLACEHOLDER 6
     Capture: Architecture diagram.
     Show: React frontend, Auth Service, Restaurant Service, Utils Service, databases and Cloudinary. Mark RabbitMQ, Redis and Docker as planned/dashed components.
     Save as: docs/screenshots/06-architecture.png
-->
```
### System Architecture

![ZESTO architecture](docs/screenshots/06-architecture.png)

> **Screenshot setup:** The image links above are intentional
> placeholders. Until you add the matching image files, GitHub will show
> broken-image icons. You can remove any section for a screen that is
> not implemented yet. Avoid screenshots containing `.env` values, API
> keys, tokens, private user details, or real payment information.

------------------------------------------------------------------------

## Features and Development Status

### Implemented

**Authentication and authorization** - Google OAuth 2.0 using the
authorization-code flow. - JWT access and refresh tokens. - HTTP-only
cookies for token delivery. - Refresh-token rotation, with refresh-token
hashes stored in the Auth database. - Roles for customer, seller, and
rider. - Protected routes using JWT verification and role/ownership
middleware. - Axios-based refresh handling on the frontend.

**Restaurant and menu management** - Create, edit, and retrieve
restaurant information. - Update restaurant open/closed status. -
Discover nearby restaurants using MongoDB geospatial queries. - Add menu
items with image upload. - Delete menu items and toggle item
availability. - Seller ownership checks for protected restaurant and
menu operations.

**Cart** - Add items, increment/decrement quantities, fetch cart
contents, and clear the cart. - One-restaurant-per-cart rule. - Cart
data references menu items and restaurants.

**Address and geospatial support** - Add, list, and delete customer
addresses. - Store locations as GeoJSON `Point` values. - MongoDB
`2dsphere` indexes for geospatial queries. - `$geoNear` for nearby
restaurant discovery and distance calculation. - GeoJSON coordinate
order: **\[longitude, latitude\]**.

**Shared utilities** - Cloudinary image-upload utility. - Restaurant
Service calls the Utils Service over HTTP for uploads.

### In Progress

-   **Order workflow:** Order creation and related checkout logic are
    being developed in the Restaurant/Order domain. The work includes
    validating the selected address, retrieving cart and restaurant
    data, calculating delivery distance with `$geoNear`, calculating
    fees, and creating an order with item/address snapshots.
-   **Payment workflow:** An internal Order Service endpoint is being
    developed to return an order ID, amount, and currency to the Payment
    Service after validating the internal service key and pending
    payment status.
-   **Razorpay:** Test-mode integration, gateway order creation, payment
    signature verification, and verified payment-status updates are not
    yet represented as completed.
-   **Customer checkout and rider delivery:** End-to-end flows are still
    being completed.

### Planned

-   RabbitMQ for asynchronous events between services.
-   Redis for caching.
-   Docker and Docker Compose for containerized development.
-   Rider assignment, pickup, delivery tracking, and notifications.
-   Dedicated Payment, Rider, and Notification service boundaries as the
    system evolves.

------------------------------------------------------------------------

## Architecture

### Current services

``` text
                         React Frontend
                    Vite · TypeScript · Axios
                         localhost:5173
                               |
                     HTTP / httpOnly cookies
                               |
          +--------------------+--------------------+
          |                    |                    |
          v                    v                    v
     Auth Service        Restaurant Service      Utils Service
     localhost:5000      localhost:5001           localhost:5002
          |                    |                    |
          v                    v                    v
      Auth DB             Restaurant DB          Cloudinary
   User, RefreshToken   Restaurant, MenuItem,
                        Cart, Address, Order*
```

`*` Order functionality is under development. The Order model and
portions of the order/payment workflow should not be described as a
complete production lifecycle.

The Auth Service manages identity and token issuance. The Restaurant
Service owns restaurant, menu, cart, address, and developing order
functionality. The Utils Service handles image uploads to Cloudinary.

The Restaurant Service verifies access JWTs locally using the configured
shared access-token secret. It does not need to call the Auth Service
for every protected request.

### Planned architecture components

``` text
     Restaurant / Order Service
                |
             RabbitMQ
       (planned event broker)
          /      |       \
       Payment  Rider  Notifications
       (planned services / workflows)

       Redis cache       Docker Compose
          (planned)        (planned)
```

RabbitMQ, Redis, and Docker are roadmap items, not currently implemented
infrastructure.

------------------------------------------------------------------------

## Technology Stack

  Area                     Technologies
  ------------------------ ------------------------------------------
  Frontend                 React, TypeScript, Vite, Axios
  Backend                  Node.js, Express.js, TypeScript
  Database / ODM           MongoDB, Mongoose
  Authentication           Google OAuth 2.0, JWT, HTTP-only cookies
  Geospatial queries       GeoJSON, MongoDB `2dsphere`, `$geoNear`
  Image storage            Cloudinary
  Payment gateway          Razorpay --- integration in progress
  Planned infrastructure   RabbitMQ, Redis, Docker

------------------------------------------------------------------------

## Repository Structure

The repository is organized into a frontend and independently managed
backend services. Exact filenames may evolve during development.

``` text
ZESTO/
├── README.md
├── docs/
│   └── screenshots/
│       ├── 01-restaurant-discovery.png
│       ├── 02-restaurant-menu.png
│       ├── 03-cart.png
│       ├── 04-addresses.png
│       ├── 05-seller-dashboard.png
│       └── 06-architecture.png
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── Context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types.ts
│   └── package.json
└── services/
    ├── auth/
    ├── restaurant/
    └── utils/
```

------------------------------------------------------------------------

## Key Engineering Decisions

### 1. Service-owned data

Each backend service owns its data and exposes functionality through
APIs. Services refer to users and other resources by identifiers rather
than performing cross-database joins.

### 2. Local JWT verification

The Auth Service issues JWTs containing the user identifier and role.
Protected services verify access tokens locally using the configured
shared secret, avoiding an Auth Service network call on every request.

### 3. HTTP-only cookies

Tokens are stored in HTTP-only cookies so frontend JavaScript cannot
directly read them. Cookie, CORS, and CSRF settings must be configured
carefully, particularly when frontend and backend are deployed on
different domains.

### 4. Refresh-token rotation

Refresh tokens are rotated and their hashes are stored in the Auth
database. The frontend coordinates refresh requests to avoid multiple
simultaneous refresh attempts.

### 5. Geospatial search

Restaurant and address locations use GeoJSON `Point` values and
`2dsphere` indexes. MongoDB `$geoNear` supports proximity-based
restaurant discovery and distance calculation. Coordinates must be
supplied as `[longitude, latitude]`.

### 6. One restaurant per cart

A cart is restricted to items from one restaurant at a time. This keeps
restaurant ownership, order preparation, and delivery-fee calculation
unambiguous.

### 7. Order snapshots

The order workflow is designed to preserve item names/prices and
delivery-address details as they were at checkout. Later menu-price or
saved-address changes should not rewrite historical order details.

------------------------------------------------------------------------

## Getting Started

### Prerequisites

-   Node.js and npm
-   MongoDB (local instance or MongoDB Atlas)
-   Google OAuth credentials
-   Cloudinary account for image uploads

### 1. Clone the repository

``` bash
git clone https://github.com/Rakshit099-g/ZESTO.git
cd ZESTO
```

### 2. Install dependencies

Install dependencies separately in each application/service directory:

``` bash
cd Frontend
npm install

cd ../services/auth
npm install

cd ../restaurant
npm install

cd ../utils
npm install
```

### 3. Configure environment variables

Create the environment files required by each service. Use the exact
variable names referenced by the current source code. See [Environment
Configuration](#environment-configuration).

### 4. Start the services

Run each command in a separate terminal. Check each service's
`package.json` for the available development script.

``` bash
# Frontend
cd Frontend
npm run dev
```

``` bash
# Auth Service
cd services/auth
npm run dev
```

``` bash
# Restaurant Service
cd services/restaurant
npm run dev
```

``` bash
# Utils Service
cd services/utils
npm run dev
```

The frontend Vite server typically runs at `http://localhost:5173`. The
documented backend ports are Auth `5000`, Restaurant `5001`, and Utils
`5002`; confirm the configured `PORT` values in your local environment.

------------------------------------------------------------------------

## Environment Configuration

Environment variable names can change as services evolve. Use the names
read by the current source code when creating local environment files.

  -----------------------------------------------------------------------
  Service                             Configuration categories
  ----------------------------------- -----------------------------------
  Frontend                            Backend API base URL(s), such as
                                      the Vite API URL used by the Axios
                                      client

  Auth                                Port, MongoDB URI, Google OAuth
                                      client credentials, access-token
                                      secret, refresh-token secret,
                                      frontend origin

  Restaurant                          Port, MongoDB URI, access-token
                                      verification secret, frontend
                                      origin, Utils Service base URL,
                                      internal service key where required

  Utils                               Port, Cloudinary cloud name, API
                                      key, API secret

  Payment (when added)                Razorpay test/live key ID and
                                      secret, stored only on the backend
  -----------------------------------------------------------------------

**Security** - Never commit `.env` files, API keys, OAuth secrets, JWT
secrets, database connection strings, or payment credentials. - Keep
private credentials on the backend. Never expose server secrets through
`VITE_` frontend variables. - Use separate credentials for local
development and production. - Do not expose internal service keys in
frontend code or public screenshots. - Redact personal addresses, phone
numbers, tokens, and account details from screenshots.

------------------------------------------------------------------------

## API Overview

This is a high-level route overview based on the current architecture
notes. Confirm exact paths, methods, and request schemas in the source
route files before using them.

  -----------------------------------------------------------------------
  Service                 Route group /           Purpose
                          operations              
  ----------------------- ----------------------- -----------------------
  Auth                    Login, refresh, logout, Authentication and role
                          current user, role      management
                          update                  

  Restaurant              Create, edit, status,   Restaurant management
                          own restaurant, nearby  and discovery
                          list, single restaurant 

  Menu items              Create, list by         Menu management
                          restaurant, delete,     
                          availability status     

  Cart                    Add, fetch, increment,  Cart operations
                          decrement, clear        

  Address                 Create, list, delete    Customer delivery
                                                  addresses

  Utils                   Image upload            Cloudinary upload
                                                  helper

  Order / Payment         Order creation and      Checkout and payment
                          internal payment lookup workflow
                          are being developed     
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Roadmap

-   [x] Google OAuth and JWT authentication foundation
-   [x] Restaurant and menu management
-   [x] Cart operations and one-restaurant-per-cart rule
-   [x] Address management and GeoJSON geospatial support
-   [x] Cloudinary upload utility
-   [ ] Complete and test order lifecycle and checkout
-   [ ] Razorpay gateway order creation and payment signature
    verification
-   [ ] Verified payment webhook and idempotent payment updates
-   [ ] Rider assignment and delivery workflow
-   [ ] RabbitMQ event-driven communication
-   [ ] Redis caching
-   [ ] Docker and Docker Compose
-   [ ] Automated tests and deployment hardening

------------------------------------------------------------------------

## Author

**Rakshit Gupta**

-   GitHub: [Rakshit099-g](https://github.com/Rakshit099-g)
-   Project repository: [ZESTO](https://github.com/Rakshit099-g/ZESTO)

------------------------------------------------------------------------

*ZESTO is an actively developed portfolio project. Features marked as in
progress or planned are not represented as production-ready
implementations.*
