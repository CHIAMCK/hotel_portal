const { fetchDataAndMerge } = require("../dataProcess");

const mockData = [{ id: 1, images: ['image1.jpg', 'image2.jpg'] }];
const mockMergedData = [{ id: 1, images: ['image1.jpg', 'image2.jpg'] }];

const fetchAllDataConcurrently = jest.fn(() => Promise.resolve(mockData));
const mergeSources = jest.fn(() => mockMergedData);
const storeDataInRedis = jest.fn();

jest.mock('../dataProcess', () => ({
  fetchDataAndMerge: jest.fn(),
}));

describe('fetchDataAndMerge', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch and merge data successfully', async () => {
    fetchDataAndMerge.mockImplementationOnce(async ({ fetchAllDataConcurrently, mergeSources, storeDataInRedis }) => {
      const data = await fetchAllDataConcurrently();
      if (data) {
        const mergedData = mergeSources(data);
        await storeDataInRedis({}, mergedData);
        return mergedData;
      } else {
        return null;
      }
    });

    const result = await fetchDataAndMerge({
      fetchAllDataConcurrently,
      mergeSources,
      storeDataInRedis
    });

    expect(result).toEqual(mockMergedData);
    expect(fetchAllDataConcurrently).toHaveBeenCalled();
    expect(mergeSources).toHaveBeenCalledWith(mockData);
    expect(storeDataInRedis).toHaveBeenCalledWith({}, mockMergedData);
  });
});
