import axios from "axios";

const httpRequest = axios.create({
  baseURL: "http://goldenticket.lat:8089",
  withCredentials: true,
});

export default httpRequest;
