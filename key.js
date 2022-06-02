const axios = require('axios')

const testData = async () => {
    try {
        const url = "https://api.petfinder.com/v2/animals"
        const response = await axios({
          method: "get",
          url: url,
          headers: {
            Authorization:
              "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiJZbFNlMllCT3JwWkVVNmV6RnFIa2dzbXlVb3ZraWM3VjBWZjBZWTczQnVkYk1JSk93YSIsImp0aSI6IjUxNzcyNGU1MDIyMDZmM2JiM2UxNTgwMTExOGU3OTViODIxMWI3NGU0NDYxY2VmZGM0YzUyMTkwZjU1OGY2NjY5NDNkMTA1NTg1YjMzYjJiIiwiaWF0IjoxNjU0MTE5NjA2LCJuYmYiOjE2NTQxMTk2MDYsImV4cCI6MTY1NDEyMzIwNiwic3ViIjoiIiwic2NvcGVzIjpbXX0.rRbmaLCOrpnRoC0fEyBKd7Iy1JBfA3ktLbuUDUG2qaJp0ePBV7VzcGyiFa6UQKepWBnS-qCT5JFHBbcwCr7RYaKhlXmC520ks_fqha0hOJrJx7FRJGJFZ0J6oS4_bvh_CU9Lu0G9ridhCf33idA3mYA8YCcQVHO8XZN_RFQq1a6bobSCl_EQDyDlqxOmWE1UtSZPPVAUtLPrdkV9Y9Z72pzpQwARA6V9AnyqfsIN0YRf4u5sbjpouQCt_cva7P4E2XVmxmKyC3-1-Xq1oIiQiIHnTN2DOkyMeZJpR90eLeAwFdTOjE5OXeOlTF_LQFLLoiUEoOWtiZY_mnUM-R7Yqg",
          },
        });
        console.log(response.data.animals[0].photos[0].medium)
    } catch (error) {
        console.log(error)
    }
    
}

testData()