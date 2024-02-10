# Hotels data merge

## Installation

1. Download the repository.
2. Install dependencies with `npm install`.

## Usage

1. Run the application with `npm start`.
2. Open a web browser and navigate to `http://localhost:3000`.

## Other configuration

1. make sure redis is run locally at port 6379

## Get hotel data

1. List hotels by destination id

   http://localhost:3000/v1/hotels?destinationId=1122

2. List hotels by hotel ids

   http://localhost:3000/v1/hotels?hotelIds=iJhz,SjyX,f8c9

## Build hotel data

1. There is a cron job that every 5 minutes to collect the latest data and store it in cache.


## Testing

Run tests with `npm test`.


## Contact

For questions, contact me at chiamck91@hotmail.com
