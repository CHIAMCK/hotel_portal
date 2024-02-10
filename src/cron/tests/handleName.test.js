const { handleName, removeSpecialCharacters } = require("../dataProcess");

jest.mock("../dataProcess", () => ({
    ...jest.requireActual("../dataProcess"),
    removeSpecialCharacters: jest.fn(),
}));

describe("handleName function", () => {
    it("should return currentData if it has more words", () => {
        const currentData = { name: "Hotel ABC TEST" };
        const mergedData = { name: "Hotel DEF" };

        removeSpecialCharacters.mockImplementation(name => name);

        const result = handleName(currentData, mergedData);

        expect(result).toBe(currentData.name);
    });

    it("should return mergedData if it has more words", () => {
        const currentData = { name: "Hotel ABC" };
        const mergedData = { name: "Hotel DEF DEF" };

        removeSpecialCharacters.mockImplementation(name => name);

        const result = handleName(currentData, mergedData);

        expect(result).toBe(mergedData.name);
    });

    it("should return mergedData if both names have the same number of words", () => {
        const currentData = { name: "Hotel ABC DDD" };
        const mergedData = { name: "Hotel DEF GHI" };

        removeSpecialCharacters.mockImplementation(name => name);

        const result = handleName(currentData, mergedData);

        expect(result).toBe(mergedData.name);
    });
});
