import axios from "axios";

const api = axios.create({
  baseURL: "https://api.myjson.com/bins"
});

export default {
  getLeaderBoard() {
    return api.get("/1bhe90");
  },
  getParties() {
    return api.get("/e9ep0");
  }
};
