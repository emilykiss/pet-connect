const bcrypt = require('bcryptjs')
const cryptoJS = require('crypto-js')


const testBcrypt = () => {
    const password = 'hello_1234'
    // Turn this password string into a hash
    // When a user signs up, this will hash their password and store it in db
    const salt = 12
    const hash = bcrypt.hashSync(password, salt)
    console.log(hash)

    // When a user log in, we can use compare sync to match passowrd to hash
    console.log('do they match', compare)
}

// testBcrypt()

const testCrypto = () => {
    // this passphrase will be know only to the server admins
    const passphrase = '1234_hello'
    // this message will be in the cookie as the user's id
    const message = 'hi, i am encrypted'
    const encrypted = cryptoJS.AES.encrypt(message, passphrase).toString()
    console.log(encrypted)
    // Decrypt it in the middleware 
    const decrypted = cryptoJS.AES.decrypt(encrypted, passphrase).toString(cryptoJS.enc.Utf8)
    console.log(decrypted)
}

testCrypto()