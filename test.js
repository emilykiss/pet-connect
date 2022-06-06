const { default: axios } = require("axios")
require('dotenv').config()
// This is where the API key is programmed to update automatically
const getAccessToken = async () => {
    let gettingToken = `grant_type=client_credentials&client_id=${process.env.API_KEY}&client_secret=${process.env.SECRET}`
    try {
        const response = await axios.post("https://api.petfinder.com/v2/oauth2/token", gettingToken)
        const header = `Bearer ${response.data.access_token}`
        return header
    } catch (error) {
        console.log(error)
    }
}
module.exports = getAccessToken
