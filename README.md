
# AZA Finance FX Transactions Microservice
This is an FX Transactions microservice to be used for storing/creating transactions, listing all existing transactions and getting a specific transaction for the AZA Finance FX Platform. This project is an assessment for AZA Finance.
The app uses MongoDB cloud-hosted database for persisting data in the system.

## Api Authentication
All the microservice endpoints require an authorization header for authentication.
The Authorization header is a signed JWT token. Header should be in the format: "Authorization: Bearer {jwtToken}".
For the purpose of this assessment and to be able to consume the api endpoints, a signed JWT token has been generated and provided in the root of this repo as access-token.json. Simply pass this Authorizaiton header in all the requests for the different endpoints.
## Author
This microservice was engineered and developed by Enyinna Inya as part of assessment requirements.
- [@enyinnainya](https://github.com/enyinnainya)


## Installation and Usage
To install and deploy this app, run the following in the project root directory:

```bash
  npm install
```
This will install all the project required dependencies

```bash
  npm start
```
This will start the app server at http://127.0.0.1:3001 (on port 3001 unless you specify a different port in your .env file)

```bash
  npm test
```
This will run all tests cases to make sure the app is working correctly as expected and will highlight any failed tests. This app utilized TDD and BDD testing processes

To consume the Api endpoints, you can use Postman to make the api requests and provide the authorization header for each endpoint.

## Features
**Create a Transaction:**
```
POST /transactions
```
- This endpoint adds an fx transaction based on post data/payload.
  **Example:**
##### HTTP Header:

```
Authorization: Bearer [jwtToken]
```

##### POST Request Payload:

```
{
    "customerId":"215b611846676e356218923b",
    "fromAmount":10,
    "fromCurrency": "USD",
    "toAmount": 4500,
    "toCurrency": "NGN"
}
```
##### Api Response:

```
{
    "success": true,
    "data": {
        "customerId": "215b611846676e356218923b",
        "fromAmount": 10,
        "fromCurrency": "USD",
        "toAmount": 4500,
        "toCurrency": "NGN",
        "created": "June 11, 2022, 4:23 pm UTC",
        "createdTimestamp": 1654961013,
        "updated": "June 11, 2022, 4:23 pm UTC",
        "updatedTimestamp": 1654961013,
        "id": "62a4b375b7703e607b77d4e9"
    }
}
```

**List All Existing Transactions:**
```
GET /transactions
```
- This endpoint gets a specific fx transaction by ID.
  **Example:**
##### HTTP Header:

```
Authorization: Bearer [jwtToken]
```

##### Api Response:

```
{
    "success": true,
    "totalRecords": 2,
    "data": [
        {
            "customerId": "215b611846676e356218923b",
            "fromAmount": 10,
            "fromCurrency": "USD",
            "toAmount": 4500,
            "toCurrency": "NGN",
            "created": "June 11, 2022, 4:23 pm UTC",
            "createdTimestamp": 1654961013,
            "updated": "June 11, 2022, 4:23 pm UTC",
            "updatedTimestamp": 1654961013,
            "id": "62a4b375b7703e607b77d4e9"
        },
        {
            "customerId": "615b6742d6676e356218923b",
            "fromAmount": 543.39,
            "fromCurrency": "USD",
            "toAmount": 556090.34,
            "toCurrency": "NGN",
            "created": "June 10, 2022, 5:05 pm UTC",
            "createdTimestamp": 1654877113,
            "updated": "June 10, 2022, 5:05 pm UTC",
            "updatedTimestamp": 1654877113,
            "id": "62a36bb9766ff88ca1c264db"
        }
    ]
```
**Get a Transaction:**
```
GET /transactions/:id
```
- This endpoint adds an fx transaction based on post data/payload.
  **Example:**
##### HTTP Header:

```
Authorization: Bearer [jwtToken]
```

##### Request endpoint:

```
/transactions/62a3960304b745cd17d85ad2
```
##### Api Response:

```
{
    "success": true,
    "data": {
        "customerId": "615b6742d6676e356218923b",
        "fromAmount": 24.1,
        "fromCurrency": "EUR",
        "toAmount": 10000,
        "toCurrency": "NGN",
        "created": "June 10, 2022, 8:05 pm UTC",
        "createdTimestamp": 1654887939,
        "updated": "June 10, 2022, 8:05 pm UTC",
        "updatedTimestamp": 1654887939,
        "id": "62a3960304b745cd17d85ad2"
    }
}
```
## Technologies Used
The following technologies were used to build this app.
- NodeJS
- Express
- MongoDB
- Jest Testing Framework
- Supertest (used together with Jest for Testing)
