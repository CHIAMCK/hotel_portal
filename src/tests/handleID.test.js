const { handleID } = require("../cron/dataProcess");

describe("handleID function", () => {
    test("returns an empty string when both currentData and mergedData have no ID", () => {
        const currentData = {};
        const mergedData = {};
        expect(handleID(currentData, mergedData)).toBe("");
    });

    test("returns the ID from currentData when mergedData has no ID", () => {
        const currentData = { id: "12345" };
        const mergedData = {};
        expect(handleID(currentData, mergedData)).toBe(currentData.id);
    });

    test("returns the ID from mergedData when currentData has no ID", () => {
        const currentData = {};
        const mergedData = { id: "54321" };
        expect(handleID(currentData, mergedData)).toBe(mergedData.id);
    });

    test("returns the ID from mergedData when both currentData and mergedData have an ID", () => {
        const currentData = { id: "12345" };
        const mergedData = { id: "54321" };
        expect(handleID(currentData, mergedData)).toBe(mergedData.id);
    });
});
