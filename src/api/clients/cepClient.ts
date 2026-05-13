import axios from "axios";

export const cepClient = axios.create({
  baseURL: "https://viacep.com.br/ws",
});
