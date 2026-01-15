import axios from "axios";

const httpRequest = axios.create({
  baseURL: "http://localhost:8089",
  withCredentials: true,
});

export default httpRequest;
