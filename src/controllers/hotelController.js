
const listHotels = async (req, res) => {
    res.json([
        {id: 1, name: "Hotel A"}
    ])
}

module.exports = {
    listHotels
}
