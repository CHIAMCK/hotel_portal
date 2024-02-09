const { mergeSources } = require("../cron/dataProcess");

jest.mock("../cron/dataProcess", () => ({
  ...jest.requireActual("../cron/dataProcess"),
  handleID: jest.fn(),
  handleDestinationID: jest.fn(),
  handleName: jest.fn(),
  handleLocation:  jest.fn(),
  handleDescription: jest.fn(),
  handleAmenities: jest.fn(),
  handleImages: jest.fn(),
  handleBookingCondition: jest.fn(),
}));

const { handleID, handleDestinationID, handleName, handleLocation, handleDescription, handleAmenities, handleImages, handleBookingCondition } = require("../cron/dataProcess");

describe("mergeSources function", () => {
    test("returns an empty array when sources array is empty", () => {
        const sources = [];
        expect(mergeSources(sources)).toEqual([]);
    });

    test("merges data from a single source containing a single hotel", () => {
        handleID.mockReturnValue("7777");
        handleDestinationID.mockReturnValue("456");
        handleName.mockReturnValue("Hotel ABC");
        handleLocation.mockReturnValue({ lat: 1.23, lng: 4.56 });
        handleDescription.mockReturnValue("Description");
        handleAmenities.mockReturnValue({ amenity1: true });
        handleImages.mockReturnValue({ image1: "url1" });
        handleBookingCondition.mockReturnValue(["Condition"]);

        const sources = [[{
            id: "123",
            destination: 123,
            name: "hotel ABC",
            lat: 1.264751, 
            lng: 103.824006,
            Description: "Description 1",
            amenities: { amenity1: true },
            images: { image1: [{ description: "", link: "url1"}] },
            booking_conditions: handleBookingCondition(),
        }]];

        const expectedOutput = [{
            id: "123",
            destination_id: 123,
            name: "hotel ABC",
            location: { lat: 1.264751, lng: 103.824006, address: "", city: "", country: "" },
            description: "Description 1",
            amenities: { amenity1: true },
            images: { image1: [{ description: "", link: "url1"}] },
            booking_conditions: ["Condition"],
        }];

        expect(mergeSources(sources)).toEqual(expectedOutput);
    });
});
