# Pathao 1.0.0

## Installation

1. clone the repository
2. Create the environment file

   ```bash
   cp server/src/example.config.env server/src/config.env
   ```

3. Create a demo account in twillo and update the `config.env` file with the following information

   ```env
    TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    TWILIO_AUTH_TOKEN=your_auth_token
    TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
   ```

4. Run in development mode

   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```

5. Run in production mode

   ```bash
    docker compose -f docker-compose.prod.yml up -d --build
   ```

**_Note: The code for sending sms is commented out and the otp is sent with a response for testing purposes_**

## How the Application works:

<!-- create an index -->

1. [User Registration](#1-user-registration)
2. [User Login](#2-user-login)
3. [Driver Location Pinging](#3-driver-location-pinging)
4. [Ride Request](#4-ride-request)
5. [Ride Handling by the driver](#5-ride-handling-by-the-driver)
6. [Ride Cancellation by the rider](#6-ride-cancellation-by-the-rider)

### 1. User Registration

There are two types of users in the application. Both of them can be registered by one single endpoint.

```http
POST /api/v1/auth/register
```

1. To **_register as a rider_**, you have to send the following payload in the request body:

   ```json
   {
     "name": "Rider Name",
     "email": "test@test.com",
     "password": "password",
     "phone": "017xxxxxxxx"
   }
   ```

   It'll return a response like this:

   ```json
   {
     "status": "success",
     "data": {
       "user": {
         "id": "65bd1c6c3381a7936e93f6fd",
         "name": "Rider",
         "email": "test@test.com",
         "phone": "+8801767191651",
         "role": "rider"
       },
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YmQxYzZjMzM4MWE3OTM2ZTkzZjZmZCIsImlhdCI6MTcwNjg5MjM5NiwiZXhwIjoxNzA5NDg0Mzk2fQ.AHlJg_q5LbX-1MIZ6KnI35mPv0uyodXPmz8HM3L7bXw"
     }
   }
   ```

   It'll automatically be logged in and send the token in the response.

2. To **_register as a driver_**, you have to send the following payload in the request body:

   ```json
   {
     "name": "driver",
     "phone": "+8801767191652",
     "role": "driver"
   }
   ```

   and it'll create the account as a driver but won't send the token in the response. The driver have to use the login route to send an OTP and then verify it to be logged in.

### 2. User Login

To login as a rider, use the following route with the following payload:

```http
POST /api/v1/auth/login
```

```json
{
  "email": "test@test.com",
  "password": "{{password}}"
}
```

But to login as a driver,there are 2 steps,

1. Send the phone number to the following route:

```http
POST /api/v1/auth/driver-login-otp
```

```json
{
  "phone": "+8801767191652"
}
```

it'll send an OTP to the phone number. For testing purposes, we are sending the OTP in the response.

The response will look like this:

```json
{
  "hash": "578777f1d861cfa8c6067ea7afed5f527213751a77cdeed8a1504afe6b429057.1706893112994",
  "otp": "7692"
}
```

The hash is important to verify the OTP. Now, send the OTP and the hash with the phone number to the following route:

```http
POST /api/v1/auth/driver-login
```

```json
{
  "phone": "+8801767191652",
  "otp": "7692",
  "hash": "578777f1d861cfa8c6067ea7afed5f527213751a77cdeed8a1504afe6b429057.1706893112994"
}
```

![commented](documentResources/commented.png)

**_Uncomment the line number 121 and comment out line 129 before shipping the application to send the sms properly._**

### 3. Driver Location Pinging

All the drivers will be connected to a socket server and will send their location to the server frequently by emmiting an SocketIo event named `driverLocationPing`. The payload will look like this:

```json
{
  "location": "25.498793, 88.966867"
}
```

Theire should be a header named `authorization` with the value of the token of the driver. Otherwise it won't be accepted.

And every driver will be listening to a socket event named `rideRequest` to get the ride requests. And also another event named `error` to get the error messages.

### 4. Ride Request

A rider will send a ride request to the server with the following payload:

```http
POST /api/v1/riders/ride_request
```

```json
{
  "origin": {
    "coordinates": [25.497887, 88.964516],
    "address": "fulbari , dhaka mor",
    "type": "Point"
  },
  "destination": {
    "coordinates": [25.499795, 88.955518],
    "address": "fulbari govt college",
    "type": "Point"
  }
}
```

whenever a rider sends a ride request, the server will send the request to the nearest driver who is currently online and available for the ride and the driver will get the request in the socket event named `rideRequest`.

**_Here, the rider can not make another ride request until the previous ride is completed or cancelled._**

### 5. Ride Handling by the driver

After a user requests for a ride, the api will send the `rideRequest` to the nearest driver. If the driver canceles the request, it'll again find a nearest driver excluding the previous one and send the `rideRequest`. The rider can see these updates by being connected to the socket server and listening to the event named `tripUpdate`.

the driver can accept/cancel/start/complete the ride by sending the status `accepted`/`cancelled`/`started`/`completed` to the following route:

here the trip_id will be sent in the `rideRequest` event which is recived by the driver earlier.

```http
PATCH api/v1/drivers/trip_status/:trip_id
```

All the ride related status can be monitored by the rider if he is connected to the socket server and listening to the event named `tripUpdate`.

### 6. Ride Cancellation by the rider

Rider can cancel the requested ride if it is not started yet. If the ride is already started, the rider can not cancel the ride. The rider can cancel the ride by sending the following request:

```http
POST api/v1/riders/ride_cancel/:trip_id
```

Here, trip_id is the id of the ride the rider wants to cancel.

### 7. Ride History

Both the rider and the driver can see their ride history by sending the following request:

```http
GET api/v1/trips
```

It'll return the ride history of the user. If the user is a rider, it'll return the ride history of the rider and if the user is a driver, it'll return the ride history of the driver.

Also they can view individual ride details by sending the following request:

```http
GET api/v1/trips/:trip_id
```

Here, if the user is the rider of the trip or the driver of the trip, he can see the details of the trip.
