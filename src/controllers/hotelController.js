
const listHotels = async (req, res) => {
    const redisClient = req.app.get("redisClient") 
    try {
        const { destination, hotelIds } = req.query
        const promises = []
        if (destination && destination.length > 0) {
            // get all the hotel ids in that destination
            const hotelIds = await new Promise((resolve, reject) => {
                redisClient.smembers(destination, (err, hotelIds) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(hotelIds)
                    }
                })
            })

            // get hotel data based on hotel ids from cache
            promises = fetchHotelData(redisClient, hotels)
        }

        if (hotelIds && hotelIds.length > 0) {
            // get hotel data based on hotel ids from cache
            const hotels = hotelIds.split(",")
            promises = fetchHotelData(redisClient, hotels)
        }

        const hotelDataArray = await Promise.all(promises)
        console.log("hotelDataArray", hotelDataArray)
        res.json(hotelDataArray)
    } catch (e) {
        console.error("Error:", e)
        res.status(500).json({ error: "Internal server error" })
    }
}

function fetchHotelData(redisClient, hotelIds) {
    const promises = []
    hotelIds.forEach(hotelId => {
        promises.push(new Promise((resolve, reject) => {
            redisClient.hget(hotelId, "hotelData", (err, data) => {
                if (err) {
                    reject(err)
                } else {
                    try {
                        const parsedData = JSON.parse(data)
                        resolve(parsedData)
                    } catch (parseError) {
                        console.error("Error parsing JSON:", parseError)
                        reject(parseError)
                    }
                }
            })
        }))
    })

    return promises
}

module.exports = {
    listHotels
}
