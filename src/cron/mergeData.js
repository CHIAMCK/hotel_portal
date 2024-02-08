const axios = require('axios');

// URLs of the data sources
const dataSourceUrls = [
    'https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/acme',
    'https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/patagonia',
    'https://5f2be0b4ffc88500167b85a0.mockapi.io/suppliers/paperflies'
];

async function fetchData(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Failed to fetch data from ${url}:`, error.message);
        return null;
    }
}

// fetch data concurrently from all sources
async function fetchAllDataConcurrently() {
    try {
        const fetchPromises = dataSourceUrls.map(url => fetchData(url));
        return await Promise.all(fetchPromises);
    } catch (error) {
        console.error('Error fetching data concurrently:', error.message);
        return null;
    }
}

function mergeSources(sources) {
    let mergedData = {};

    sources.forEach(source => {
        source.forEach(hotel => {
            const id = hotel.id || hotel.Id || hotel.hotel_id;
            const destinationId = hotel.destination || hotel.DestinationId || hotel.destination_id;
            const commonKey = `${id}_${destinationId}`;

            const commonData = {
                id: handleID(hotel, mergedData[commonKey]),
                destination_id: handleDestinationID(hotel, mergedData[commonKey]),
                name: handleName(hotel, mergedData[commonKey]),
                location: handleLocation(hotel, mergedData[commonKey]),
                description: handleDescription(hotel, mergedData[commonKey]),
                amenitites: handleAmenities(hotel, mergedData[commonKey]),
                images: handleImages(hotel, mergedData[commonKey]),
                booking_conditions: handleBookingCondition(hotel, mergedData[commonKey])
            };

            if (mergedData[commonKey]) {
                for (let key in commonData) {
                    if (key in mergedData[commonKey] && commonData[key] !== null) {
                        mergedData[commonKey][key] = commonData[key];[]
                    }
                }
            } else {
                mergedData[commonKey] = commonData;
            }
        });
    });

    return Object.values(mergedData);
}

// Fetch data concurrently and merge it
async function fetchDataAndMerge() {
    try {
        const data = await fetchAllDataConcurrently();
        if (data) {
            const mergedData = mergeSources(data);
            console.log("merged data !!!!")
            console.log(mergedData); // Merged data
            console.log("hotel id", mergedData[0].id)
            console.log("destinationImages", mergedData[0].images)

            console.log("hotel id", mergedData[1].id)
            console.log("destinationImages", mergedData[1].images)

            console.log("hotel id", mergedData[2].id)
            console.log("destinationImages", mergedData[2].images)

            return mergedData;
        } else {
            console.error('Error fetching or merging data.');
            return null;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

function handleID(data1, data2) {
    return (data1?.id || data1?.Id || data1?.hotel_id || data2?.id || "")?.trim();
}
  
function handleDestinationID(data1, data2) {
    return data1?.destination || data1?.DestinationId || data1?.destination_id || data2?.destination_id;
}
  
function handleName(data1, data2) {
    const name1 = (data1?.name || data1?.Name || data1?.hotel_name || "")?.trim();
    const name2 = (data2?.name || "")?.trim();
    return name1?.length > name2?.length ? name1 : name2;
}

function handleLocation(data1, data2) {
    const location1 = {
        lat: data1?.lat || data1?.Latitude,
        lng: data1?.lng || data1?.Longitude,
        address: (data1?.address || data1?.Address || data1?.location?.address || "").trim(),
        city: (data1?.city || data1?.City || data1?.location?.city || "").trim(),
        country: (data1?.country || data1?.Country || data1?.location?.country || "").trim()
    }

    const mergedLocation = {
        lat: location1.lat || data2?.location.lat,
        lng: location1.lng || data2?.location.lng,
        address: location1.address || data2?.location.address,
        city: location1.city || data2?.location.city,
        country: location1.country || data2.location?.country
    }

    return mergedLocation;
}
  
function handleDescription(data1, data2) {
    // Choose the most detailed description (count number of words) and trim space
    const description1 = (data1?.Description || "").trim();
    const description2 = (data2?.description || "").trim();

    return description1.split(' ').length > description2.split(' ').length ? description1 : description2;
}


function handleAmenities(data1, data2) {
    const amenities1 = typeof data1?.amenities === 'object' && !Array.isArray(data1?.amenities) ? data1.amenities : (Array.isArray(data1?.amenities) ? createAmenitiesObject(data1.amenities) : null);
    const amenities2 = data2?.amenities;

    const numKeys1 = amenities1 ? Object.keys(amenities1).length : 0;
    const numKeys2 = amenities2 ? Object.keys(amenities2).length : 0;

    // console.log("amenities1", amenities1)
    // console.log("amenities2", amenities2)

    // Return the amenities object with more keys
    return numKeys1 > numKeys2 ? amenities1 : amenities2;
}

function createAmenitiesObject(amenitiesArray) {
    const amenitiesObject = {};
    amenitiesObject['general'] = amenitiesArray;
    return amenitiesObject;
}

function handleBookingCondition(data1, data2) {
    const bookingCondition1 = data1?.booking_conditions;
    const bookingCondition2 = data2?.booking_conditions;


    // console.log("bookingCondition1", bookingCondition1)
    // console.log("bookingCondition2", bookingCondition2)
    return (bookingCondition1?.length || 0) > (bookingCondition2?.length || 0) ? bookingCondition1 : bookingCondition2 || [];
}

function handleImages(data1, data2) {
    const sourceImages = data1?.images || {};
    const destinationImages = data2?.images || {};

    for (const category in sourceImages) {
        if (!destinationImages[category]) {
            destinationImages[category] = [];
        }

        const sourceCategoryImages = sourceImages[category];
        const destCategoryImages = destinationImages[category];

        for (let i = 0; i < sourceCategoryImages.length; i++) {
            const image = sourceCategoryImages[i];
            console.log("source image", image)
            let foundDuplicate = false;

            for (let j = 0; j < destCategoryImages.length; j++) {
                const img = destCategoryImages[j];
                console.log("dest image", img)

                if ((image.url && img.link === image.url) || (image.link && img.link === image.link)) {
                    foundDuplicate = true;
                    break;
                }
            }

            if (!foundDuplicate) {
                destinationImages[category].push({
                    "link": image?.url || image?.link,
                    "description": image?.description || image?.caption
                });
            }
        }
    }

    return destinationImages;
}

fetchDataAndMerge();
