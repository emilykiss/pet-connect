const axios = require('axios')

const testData = async () => {
    try {
        const url = "https://api.petfinder.com/v2/animals"
        // const response = await axios.get(url, {
        //   header: {
        //     bearer: ""
              
        //   }
        // })
        const response = await axios({
          method: "get",
          url: url,
          headers: {
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJZbFNlMllCT3JwWkVVNmV6RnFIa2dzbXlVb3ZraWM3VjBWZjBZWTczQnVkYk1JSk93YSIsImp0aSI6ImUwNDQ1YjgzMTc2NzY0ZjE5YzI3YTk3Y2QxM2JiY2I3YTVlY2FlOTQxNzIxMDgxNjViN2UxNDQxOGZhNmRkNzQ1MmNkZThkYjg3YTMzNzE5IiwiaWF0IjoxNjUzNjkxNDA3LCJuYmYiOjE2NTM2OTE0MDcsImV4cCI6MTY1MzY5NTAwNywic3ViIjoiIiwic2NvcGVzIjpbXX0.rODQRWNSG67L-you9gHmdg_NFoeaFW1t-EIw8E1_0RAAqxHDehf9FSMeAorpKANhiJM18iWTfzyRjEUUVh4VRt1wVma7WFpNnHsO-1KXA3EF8e-yb4K6rB7OTMVrMGJyfHUpLmJMUzIgDxxLXL4W06JJcmyOyTXGRZue0-KErBCT4DgUCXPbVyGRLaOBQQmrEpU269NzabvDq4MmQn1oi9UVXufsPZ7BOyWG-C8wXwsu9ZVIaO-ln5sbfp3YIg3kxKVxLhOLk9iEEVnD5f3xwmesN8FffOlF6YWEMTnYAlDkQvGG0DXJRByi2AShpfBDIuyAOF51kwgYOVgdMfNsuA"
          }
        });
        console.log(response.data.animals)
    } catch (error) {
        console.log(error)
    }
    
}

testData()