const { listHotels } = require('./hotelController');

const mockRedisClient = {
    smembers: jest.fn(),
    hget: jest.fn(),
};

describe('listHotels', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            app: {
                get: jest.fn(() => mockRedisClient),
            },
            query: {},
        };
        mockRes = {
            json: jest.fn(),
            status: jest.fn(() => mockRes),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch and return hotel data based on destination', async () => {
        const destination = 'destination1';
        const hotelIds = ['hotelId1', 'hotelId2'];

        mockReq.query.destination = destination;
        mockRedisClient.smembers.mockImplementation((destination, callback) => {
            callback(null, hotelIds);
        });

        const mockHotelData = [{ id: 'hotelId1', name: 'Hotel 1' }, { id: 'hotelId2', name: 'Hotel 2' }];
        mockRedisClient.hget.mockImplementation((hotelId, field, callback) => {
            const hotel = mockHotelData.find(hotel => hotel.id === hotelId);
            callback(null, JSON.stringify(hotel));
        });

        await listHotels(mockReq, mockRes);
        jest.spyOn(Promise, 'all').mockImplementation(() => Promise.resolve(mockHotelData));

        expect(mockRedisClient.smembers).toHaveBeenCalledWith(destination, expect.any(Function));
        expect(mockRedisClient.hget).toHaveBeenCalledTimes(2);
        expect(mockRes.json).toHaveBeenCalledWith(mockHotelData);
    });


    test('should fetch and return hotel data based on hotelIds', async () => {
        const hotelIds = ['hotelId1', 'hotelId2'];
        const mockHotelData = [{ id: 'hotelId1', name: 'Hotel 1' }, { id: 'hotelId2', name: 'Hotel 2' }];
        mockReq.query.hotelIds = hotelIds.join(',');
        mockRedisClient.hget.mockImplementation((hotelId, field, callback) => {
            const hotel = mockHotelData.find(hotel => hotel.id === hotelId);
            callback(null, JSON.stringify(hotel));
        });

        await listHotels(mockReq, mockRes);

        expect(mockRedisClient.hget).toHaveBeenCalledTimes(2);
        expect(mockRes.json).toHaveBeenCalledWith(mockHotelData);
    });
});
