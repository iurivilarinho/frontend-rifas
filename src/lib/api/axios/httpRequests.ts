import axios from "axios";

const httpRequest = axios.create({
  baseURL: "http://192.168.1.111:8089",
  withCredentials: true,
});

export default httpRequest;
