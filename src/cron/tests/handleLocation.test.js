const { handleLocation } = require("../dataProcess");

describe("handleLocation function", () => {
    test("should return merged location with lat and lng from currentData if available", () => {
        const currentData = {
            lat: 1.23456789,
            lng: 2.3456789,
            address: "123 Main St",
            city: "Example City",
            country: "Example Country"
        };
        const mergedData = {
            location: {
                lat: 0,
                lng: 0,
                address: "",
                city: "",
                country: ""
            }
        };
        const result = handleLocation(currentData, mergedData);
        expect(result.lat).toBe(currentData.lat);
        expect(result.lng).toBe(currentData.lng);
        expect(result.address).toBe(currentData.address);
        expect(result.city).toBe(currentData.city);
        expect(result.country).toBe(currentData.country);
    });

    test("should return merged location with lat and lng from currentData if address, city, country is longer", () => {
        const currentData = {
            lat: 1.23456789,
            lng: 2.3456789,
            address: "123 Main St test",
            city: "Example City test",
            country: "Example Country test"
        };
        const mergedData = {
            location: {
                lat: 3.456789,
                lng: 4.56789,
                address: "456 Elm St",
                city: "Another City",
                country: "Another Country"
            }
        };
        const result = handleLocation(currentData, mergedData);
        expect(result.lat).toBe(currentData.lat);
        expect(result.lng).toBe(currentData.lng);
        expect(result.address).toBe(currentData.address);
        expect(result.city).toBe(currentData.city);
        expect(result.country).toBe(currentData.country);
    });

    test("should return merged location with lat and lng from merged data if address, city, country is longer", () => {
        const currentData = {
            lat: 1.23456789,
            lng: 2.3456789,
            address: "123 Main St",
            city: "Example City",
            country: "Example Country"
        };
        const mergedData = {
            location: {
                lat: 3.456789,
                lng: 4.56789,
                address: "456 Elm St test",
                city: "Another City test",
                country: "Another Country test"
            }
        };
        const result = handleLocation(currentData, mergedData);
        expect(result.lat).toBe(currentData.lat);
        expect(result.lng).toBe(currentData.lng);
        expect(result.address).toBe(mergedData.location.address);
        expect(result.city).toBe(mergedData.location.city);
        expect(result.country).toBe(mergedData.location.country);
    });

    test("should return merged location with lat and lng from current data if lat, lng is longer", () => {
        const currentData = {
            lat: 1.23456789,
            lng: "4.567897778888",
            address: "123 Main St",
            city: "Example City",
            country: "Example Country"
        };
        const mergedData = {
            location: {
                lat: 3.4567899,
                lng: 4.56789777,
                address: "456 Elm St",
                city: "Another City",
                country: "Another Country"
            }
        };
        const result = handleLocation(currentData, mergedData);
        expect(result.lat).toBe(currentData.lat);
        expect(result.lng).toBe(4.567897778888);
        expect(result.address).toBe(currentData.address);
        expect(result.city).toBe(mergedData.location.city);
        expect(result.country).toBe(mergedData.location.country);
    });
});
