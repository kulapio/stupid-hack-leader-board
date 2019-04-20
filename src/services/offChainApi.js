import axios from "axios";

const api = axios.create({
  // baseURL: "https://api.myjson.com/bins"
  baseURL: "http://localhost:3000/api/v1"
});

export default {
  getLeaderBoard() {
    // return api.get("/1bhe90");
    return api.get("/leader-board");
  },
  getParties() {
    // return api.get("/e9ep0");
    return api.get("/leader-board");
  }
};
