<template>
  <div>
    <vue-element-loading :active="loading" spinner="bar-fade-scale" is-full-screen color="rgba(255, 99, 132, 0.2)"/>
    <div v-if="isAuctionStart">
      <canvas id="leader-board-chart"></canvas>
      <br>
      <div class="button-stop" @click="stopAuction()">
        ปิดการประมูล
      </div>
    </div>
    <div class="center-screen" v-else>
      <div>
        ยังไม่เปิดการประมูล
      </div>
      <div class="button-start" @click="startAuction()">
        เปิดการประมูล
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js";
import VueElementLoading from "vue-element-loading";
import offChainApi from "@/services/offChainApi";

export default {
  name: "BarChart",
  components: {
    VueElementLoading
  },
  data() {
    return {
      chartData: [],
      parties: [],
      chairs: [],
      leaderBoardData: null,
      loading: false,
      isAuctionStart: false
    };
  },
  async mounted() {
    this.generateChart()
  },
  methods: {
    async generateChart () {
      this.loading = true;
      const { data } = await offChainApi.getIsAuctionStart()
      this.isAuctionStart = data
      if (data) {
        await this.fetchLeaderBoard();
        await this.fetchParties();
        this.initChartInstance();
        this.initialLabels();
        this.createChart("leader-board-chart", this.leaderBoardData);
        this.subscribeAuctionChange();
      }
      this.loading = false;
    },
    async fetchLeaderBoard() {
      const { data } = await offChainApi.getLeaderBoard();
      if (data.length) {
        this.chartData = data.map(d => ({
          name: d.winnerParty.name,
          amount: d.bidAmount,
          color: d.winnerParty.color,
        }));
        this.chairs = data.map(d => d.chair);
      }
    },
    async fetchParties() {
      const { data } = await offChainApi.getParties();
      this.parties = data;
    },
    initChartInstance() {
      this.leaderBoardData = {
        type: "bar",
        data: {
          labels: this.chairs,
          datasets: [
            {
              label: "กระทรวง",
              data: this.chartData.map(d => d.amount),
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)"
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)"
              ],
              borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                  beginAtZero: true,
                  stepSize: 5
                }
              }
            ]
          }
        }
      };
    },
    initialLabels() {
      const self = this;
      // Define a plugin to provide data labels
      Chart.plugins.register({
        afterDatasetsDraw: function(chart) {
          var ctx = chart.ctx;
          chart.data.datasets.forEach(function(dataset, i) {
            var meta = chart.getDatasetMeta(i);
            if (!meta.hidden) {
              meta.data.forEach(function(element, index) {
                // ctx.fillStyle = "rgb(250, 20, 250)";
                ctx.fillStyle = self.chartData[index].color;
                var fontSize = 21;
                var fontStyle = "normal";
                var fontFamily = "Helvetica Neue";
                ctx.font = Chart.helpers.fontString(
                  fontSize,
                  fontStyle,
                  fontFamily
                );
                var dataString = `${self.chartData[index].name} (${dataset.data[index]} ล้าน)`;
                if (parseInt(dataString) !== 0) {
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  var padding = 5;
                  var position = element.tooltipPosition();
                  ctx.fillText(
                    dataString,
                    position.x,
                    position.y - fontSize / 2 - padding
                  );

                  if (self.currentState === self.showTeamNameOnState) {
                    ctx.font = Chart.helpers.fontString(
                      21,
                      fontStyle,
                      fontFamily
                    );
                  }
                }
              });
            }
          });
        }
      });
    },
    createChart(chartId, chartData) {
      if (chartData) {
        const ctx = document.getElementById(chartId).getContext("2d");
        Chart.defaults.global.defaultFontSize = 18
        this.leaderBoardChart = new Chart(ctx, {
          type: chartData.type,
          data: chartData.data,
          options: chartData.options
        });
      }
    },
    subscribeAuctionChange () {
      setInterval(async () => {
        const { data } = await offChainApi.getLeaderBoard()
        data.forEach((d, i) => {
          const auction = d
          this.chartData[i].name = auction.winnerParty.name
          this.chartData[i].color = auction.winnerParty.color
          this.leaderBoardChart.data.datasets[0].data[parseInt(auction.id-1)] = parseInt(auction.bidAmount)
        })
        // this.leaderBoardChart.scales['y-axis-0'].max = Math.max(...this.leaderBoardChart.data.datasets[0].data) + 3
        // console.log(Math.max(...this.leaderBoardChart.data.datasets[0].data))
        // console.log(this.leaderBoardChart.scales['y-axis-0'].max)
        this.leaderBoardChart.update()
      }, 1000)
    },
    async startAuction () {
      await offChainApi.postStartAuction()
      this.generateChart()
    },
    async stopAuction () {
      await offChainApi.postStopAuction()
    }
  }
};
</script>

<style scoped>
.center-screen {
  position:fixed;
  top: 50%;
  left: 50%;
  width:30em;
  height:18em;
  margin-top: -9em; /*set to a negative number 1/2 of your height*/
  margin-left: -15em; /*set to a negative number 1/2 of your width*/
}
.button-start {
  padding: 10px;
  border-radius: 3px;
  background-color: #2ecc71;
  width: fit-content;
  color: #fff;
  margin: 10px auto;
  cursor: pointer;
}
.button-stop {
  padding: 10px;
  border-radius: 3px;
  background-color: #e74c3c;
  width: fit-content;
  color: #fff;
  margin: 10px auto;
  cursor: pointer;
}
</style>

