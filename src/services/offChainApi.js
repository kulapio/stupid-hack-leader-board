import axios from "axios";

const api = axios.create({
  // baseURL: "http://172.20.10.3:3000/api/v1"
  baseURL: "http://127.0.0.1:3000/api/v1"
});

export default {
  getLeaderBoard () {
    return api.get("/leader-board");
  },
  getParties () {
    return api.get("/leader-board");
  },
  getIsAuctionStart () {
    return api.get("/is-auction-start");
  },
  postStartAuction () {
    return api.post("/start-auction");
  },
  postStopAuction () {
    return api.post("/stop-auction");
  }
};
