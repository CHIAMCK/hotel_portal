const { handleAmenities } = require("../dataProcess")

describe("handleAmenities function", () => {
    it("should return curentData amenities when it has more keys", () => {
        const currentData = { amenities: { general: ["indoor pool"], room: ["tv"] } }
        const mergedData = { amenities: { general: ["indoor pool"] } }
        const expected = { general: ["indoor pool"], room: ["tv"] }
        expect(handleAmenities(currentData, mergedData)).toEqual(expected)
    })

    it("should return mergedData amenities when it has more keys", () => {
        const currentData = { amenities: { general: ["indoor pool"] } }
        const mergedData = { amenities: { general: ["indoor pool"], room: ["tv"] } }
        const expected = { general: ["indoor pool"], room: ["tv"] }
        expect(handleAmenities(currentData, mergedData)).toEqual(expected)
    })

    it("should return empty object when both currentData and mergedData have no amenities", () => {
        const currentData = {}
        const mergedData = {}
        const expected = {}
        expect(handleAmenities(currentData, mergedData)).toEqual(expected)
    })

    it("should return empty object when currentData amenities is array", () => {
        const currentData = { amenities: ["tv", "washroom", "sofa"] }
        const mergedData = {}
        const expected = { general: ["tv", "washroom", "sofa"] }
        expect(handleAmenities(currentData, mergedData)).toEqual(expected)
    })
})
