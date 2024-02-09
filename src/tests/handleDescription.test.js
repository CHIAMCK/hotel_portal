const { handleDescription } = require("../cron/dataProcess");

describe("handleDescription function", () => {
    it("should return currentData description when currentData has more words", () => {
        const currentData = { Description: "This is a sample description with more words" };
        const mergedData = { description: "Short description" };
        const expected = "This is a sample description with more words";
        expect(handleDescription(currentData, mergedData)).toEqual(expected);
    });

    it("should return mergedData description when mergedData has more words", () => {
        const currentData = { Description: "Short description" };
        const mergedData = { description: "This is a sample description with more words" };
        const expected = "This is a sample description with more words";
        expect(handleDescription(currentData, mergedData)).toEqual(expected);
    });

    it("should return empty string when both descriptions are empty", () => {
        const currentData = { Description: "wqe" };
        const mergedData = { description: "" };
        const expected = "";
        expect(handleDescription(currentData, mergedData)).toEqual(expected);
    });
});
