const axios = require('axios')

const testData = async () => {
    try {
        const url = "https://api.petfinder.com/v2/animals"
        const response = await axios({
          method: "get",
          url: url,
          headers: {
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJZbFNlMllCT3JwWkVVNmV6RnFIa2dzbXlVb3ZraWM3VjBWZjBZWTczQnVkYk1JSk93YSIsImp0aSI6IjNiNTNlMTdlYTcwNmQ2OWU5YzVjZjRjNGQwOWQ1ZThlNjEzNzYyYzhmNDg1MGJiNjI4MjdlM2UxMTY1OGZhYjY5OWFmYWVjNjU1MWQ2NWY4IiwiaWF0IjoxNjUzOTYxMzI2LCJuYmYiOjE2NTM5NjEzMjYsImV4cCI6MTY1Mzk2NDkyNiwic3ViIjoiIiwic2NvcGVzIjpbXX0.uUDu3Hp3nw5aOYm9o0tYFJra-49Z8T59XShigi3Mj6O5bvH1_pgLv8I0QEa7zoVTOHxIWA_9d0IzJmOot8e7Yn-9kwhCM88zNMxIQLGCGoGLem-PbHxKh4DlXtdvvQ9sfuDw-jmszGIPqHuqlNp894Hr1-3QT-Q-uAXgCmtBtawQVrnIUWiGpd_5_l6rmwSsw3E3sxBoVZxUmIevn53TmPiUpr7nmY-ROb6DjkgWdq4drtSr6mZvWmYR20yGpWYW5F437KGIgJCaDq5muFC3M60BuuPAMtcqfpi_vAw7RdbTLMgDNeBsjJOZpbGRE3l4gBWLgq6_h2cIF-sLJtJD6w",
          },
        });
        console.log(response.data.animals[0].photos[0].medium)
    } catch (error) {
        console.log(error)
    }
    
}

testData()