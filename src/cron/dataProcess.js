const axios = require("axios")

const batchSize = 10
const ttlInSeconds = 1800
const dataSourceUrls = [
    "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme",
    "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia",
    "https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies"
]

async function fetchData(url) {
    try {
        const response = await axios.get(url)
        return response.data
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error.message)
        return null
    }
}

// fetch data concurrently from all sources
async function fetchAllDataConcurrently() {
    try {
        const fetchPromises = dataSourceUrls.map(url => fetchData(url))
        return await Promise.all(fetchPromises)
    } catch (error) {
        console.error("Error fetching data concurrently:", error.message)
        return null
    }
}

async function storeDataInRedis(redisClient, data) {
    try {
        // use pipeline to execute multiple commands in a single request
        const pipeline = redisClient.pipeline()
        let count = 0
        for (const hotel of data) {
            const destinationId = hotel.destination_id
            const hotelId = hotel.id
            const hotelJson = JSON.stringify(hotel)
            // group hotelId based on destination
            pipeline.sadd(destinationId, hotelId)
            pipeline.hmset(hotelId, "hotelData", hotelJson)

            pipeline.expire(destinationId, ttlInSeconds)
            pipeline.expire(hotelId, ttlInSeconds)

            count++

            // execute redis command in batches
            if (count % batchSize === 0) {
                await pipeline.exec()
                pipeline.clear()
            }
        }

        if (count % batchSize !== 0) {
            await pipeline.exec()
        }
    } catch (error) {
        console.error("Error storing data in Redis:", error)
    }
}

function mergeSources(sources) {
    // merge data and store it in a new object
    let mergedData = {}
    // loop all the data
    sources.forEach(source => {
        source.forEach(hotel => {
            const id = hotel.id || hotel.Id || hotel.hotel_id
            const destinationId = hotel.destination || hotel.DestinationId || hotel.destination_id
            // generate unique key
            const commonKey = `${id}_${destinationId}`
            const commonData = {
                id: handleID(hotel, mergedData[commonKey]),
                destination_id: handleDestinationID(hotel, mergedData[commonKey]),
                name: handleName(hotel, mergedData[commonKey]),
                location: handleLocation(hotel, mergedData[commonKey]),
                description: handleDescription(hotel, mergedData[commonKey]),
                amenities: handleAmenities(hotel, mergedData[commonKey]),
                images: handleImages(hotel, mergedData[commonKey]),
                booking_conditions: handleBookingCondition(hotel, mergedData[commonKey])
            }

            // merge data
            if (mergedData[commonKey]) {
                for (let key in commonData) {
                    if (key in mergedData[commonKey] && commonData[key] !== null) {
                        mergedData[commonKey][key] = commonData[key]
                    }
                }
            } else {
                mergedData[commonKey] = commonData
            }
        })
    })

    return Object.values(mergedData)
}

async function fetchDataAndMerge(redisClient) {
    try {
        const data = await fetchAllDataConcurrently()
        if (data) {
            const mergedData = mergeSources(data)
            await storeDataInRedis(redisClient, mergedData)
            return mergedData
        } else {
            console.error("Error fetching or merging data.")
            return null
        }
    } catch (error) {
        console.error("Error:", error.message)
        return null
    }
}

function handleID(currentData, mergedData) {
    return (mergedData?.id || currentData?.id || currentData?.Id || currentData?.hotel_id || "")?.trim()
}

function handleDestinationID(currentData, mergedData) {
    return mergedData?.destination_id || currentData?.destination || currentData?.DestinationId || currentData?.destination_id || 0
}

function handleName(currentData, mergedData) {
    const name1 = removeSpecialCharacters(currentData?.name || currentData?.Name || currentData?.hotel_name || "")
    const name2 = removeSpecialCharacters(mergedData?.name || "")
    // choose name with more words
    return name1.split(" ").length > name2.split(" ").length ? name1 : name2
}

function handleLocation(currentData, mergedData) {
    const location1 = {
        // parse lat, lng to float if it is string
        lat: parseToFloatIfString(currentData?.lat || currentData?.Latitude || 0),
        lng: parseToFloatIfString(currentData?.lng || currentData?.Longitude || 0),
        address: removeSpecialCharacters(currentData?.address || currentData?.Address || currentData?.location?.address || ""),
        city: removeSpecialCharacters(currentData?.city || currentData?.City || currentData?.location?.city || ""),
        country: removeSpecialCharacters(currentData?.country || currentData?.Country || currentData?.location?.country || "")
    }

    const mergedLat = mergedData?.location?.lat || 0;
    const mergedLng = mergedData?.location?.lng || 0;
    // choose lat, lng with more decimal
    // choose longer address, city, country
    const mergedLocation = {
        lat: (location1.lat.toString().length > mergedLat.toString().length) ? location1.lat : mergedData?.location?.lat || 0,
        lng: (location1.lng.toString().length > mergedLng.toString().length) ? location1.lng : mergedData?.location?.lng || 0,
        address: location1.address.length > (mergedData?.location?.address || "").length ? location1.address : mergedData?.location?.address || "",
        city: location1.city.length > (mergedData?.location?.city || "").length ? location1.city : mergedData?.location?.city || "",
        country: location1.country.length > (mergedData?.location?.country || "").length ? location1.country : mergedData?.location?.country || ""
    }

    return mergedLocation
}

const parseToFloatIfString = (value) => {
    if (typeof value === "string") {
        return parseFloat(value)
    }
    return value
}

function handleDescription(currentData, mergedData) {
    const description1 = removeSpecialCharacters(currentData?.Description || "")
    const description2 = removeSpecialCharacters(mergedData?.description || "")
    // choose description with more words
    return description1.split(" ").length > description2.split(" ").length ? description1 : description2
}

function handleAmenities(currentData, mergedData) {
    const amenities1 = typeof currentData?.amenities === "object" && !Array.isArray(currentData?.amenities) ? currentData.amenities : (Array.isArray(currentData?.amenities) ? createAmenitiesObject(currentData.amenities) : {})
    const amenities2 = mergedData?.amenities || {}

    const numKeys1 = amenities1 ? Object.keys(amenities1).length : 0
    const numKeys2 = amenities2 ? Object.keys(amenities2).length : 0

    // choose amenities with more data (more keys)
    return numKeys1 > numKeys2 ? amenities1 : amenities2
}

// if array is provided, convert it into object, with general as key
function createAmenitiesObject(amenitiesArray) {
    const amenitiesObject = {}
    amenitiesObject["general"] = amenitiesArray
    return amenitiesObject
}

function handleBookingCondition(currentData, mergedData) {
    const bookingCondition1 = currentData?.booking_conditions || []
    const bookingCondition2 = mergedData?.booking_conditions || []
    // choose booking condition with more details
    const returnArray = (bookingCondition1.length > bookingCondition2.length) ? bookingCondition1 : bookingCondition2
    const trimmedArray = returnArray.map(condition => removeSpecialCharacters(condition))
    return trimmedArray
}

function handleImages(currentData, mergedData) {
    const sourceImages = currentData?.images || {}
    const destinationImages = mergedData?.images || {}

    for (const category in sourceImages) {
        if (!destinationImages[category]) {
            destinationImages[category] = []
        }

        const sourceCategoryImages = sourceImages[category]
        const destCategoryImages = destinationImages[category]
        for (let i = 0; i < sourceCategoryImages.length; i++) {
            const image = sourceCategoryImages[i]
            let foundDuplicate = false
            for (let j = 0; j < destCategoryImages.length; j++) {
                const img = destCategoryImages[j]
                if ((image.url && img.link === image.url) || (image.link && img.link === image.link)) {
                    foundDuplicate = true
                    break
                }
            }

            if (!foundDuplicate) {
                // choose all the available images and remove duplicate image
                destinationImages[category].push({
                    "link": image?.url || image?.link || "",
                    "description": image?.description || image?.caption || ""
                })
            }
        }
    }

    return destinationImages
}

function removeSpecialCharacters(rawString) {
    return rawString.replace(/[^\w\s,.:#'()-\/]/gi, "").trim();
}

module.exports = {
    handleName,
    removeSpecialCharacters,
    handleLocation,
    handleDescription,
    handleAmenities,
    handleBookingCondition,
    handleImages,
    handleID,
    mergeSources,
    handleDestinationID,
    storeDataInRedis,
    fetchAllDataConcurrently,
    fetchDataAndMerge
};
