import axios from 'axios'

const myAxios = axios.create({
  //区分开发和生产环境的baseURL
  baseURL: import.meta.env.DEV ? 'http://localhost:8080' : '',
  timeout: 10000,
  withCredentials: true,
})

myAxios.interceptors.request.use(
  function (config) {
    return config
  },
  function (error) {
    return Promise.reject(error)
  },
)

myAxios.interceptors.response.use(
  function (response) {
    console.log(response)

    const { data } = response
    console.log(data)
    if (data.code === 40100) {
      if (
        !response.request.responseURL.includes('user/current') &&
        !window.location.pathname.includes('/user/login')
      ) {
        window.location.href = `/user/login?redirect=${window.location.href}`
      }
    }
    return response
  },
  function (error) {
    return Promise.reject(error)
  },
)

export default myAxios
