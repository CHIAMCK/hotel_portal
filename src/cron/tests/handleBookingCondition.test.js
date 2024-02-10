const { handleBookingCondition } = require("../dataProcess")

describe("handleBookingCondition function", () => {
    test("returns an empty array when both booking conditions arrays are empty", () => {
        const currentData = { booking_conditions: [] };
        const mergedData = { booking_conditions: [] };
        expect(handleBookingCondition(currentData, mergedData)).toEqual([]);
    });

    test("returns the non-empty booking conditions array", () => {
        const currentData = { booking_conditions: ["Condition 1", "Condition 2"] };
        const mergedData = { booking_conditions: [] };
        expect(handleBookingCondition(currentData, mergedData)).toEqual(["Condition 1", "Condition 2"]);
    });

    test("returns mergedData conditions when it has more conditions", () => {
        const currentData = { booking_conditions: ["Condition 1", "Condition 2"] };
        const mergedData = { booking_conditions: ["Condition 3", "Condition 4", "Condition 5"] };
        expect(handleBookingCondition(currentData, mergedData)).toEqual(mergedData.booking_conditions);
    });

    test("returns current conditions when it has more conditions", () => {
        const currentData = { booking_conditions: ["Condition 1", "Condition 2", "Condition 5"] };
        const mergedData = { booking_conditions: ["Condition 3", "Condition 4"] };
        expect(handleBookingCondition(currentData, mergedData)).toEqual(currentData.booking_conditions);
    });
});
