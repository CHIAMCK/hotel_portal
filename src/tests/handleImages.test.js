const { handleImages } = require("../cron/dataProcess");

describe("handleImages function", () => {
    test("returns an empty object when both currentData and mergedData have no images", () => {
        const currentData = {};
        const mergedData = {};
        expect(handleImages(currentData, mergedData)).toEqual({});
    });

    test("returns currentData images when mergedData has no images", () => {
        const currentData = { images: { rooms: [{ link: "image1.jpg", description: "Room 1" }] } };
        const mergedData = {};
        expect(handleImages(currentData, mergedData)).toEqual(currentData.images);
    });

    test("returns mergedData images when currentData has no images", () => {
        const currentData = {};
        const mergedData = { images: { rooms: [{ link: "image2.jpg", description: "Room 2" }] } };
        expect(handleImages(currentData, mergedData)).toEqual(mergedData.images);
    });

    test("returns combined images when both currentData and mergedData have images with no duplicates", () => {
        const currentData = { images: { rooms: [{ link: "image1.jpg", description: "Room 1" }, { link: "image2.jpg", description: "Room 2" }] } };
        const mergedData = { images: { rooms: [{ link: "image2.jpg", description: "Room 2" }] } };
        expect(handleImages(currentData, mergedData)).toEqual({
            rooms: [
                { link: "image2.jpg", description: "Room 2" },
                { link: "image1.jpg", description: "Room 1" },
            ]
        });
    });
});
