import axios from "axios";

const httpRequest = axios.create({
 // baseURL: "https://goldenticket.lat:8089",
    baseURL: "http://localhost:8089",

  withCredentials: true,
});

export default httpRequest;
