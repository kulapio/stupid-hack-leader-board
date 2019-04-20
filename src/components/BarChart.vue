<template>
  <div>
    <vue-element-loading :active="loading" spinner="bar-fade-scale" is-full-screen color="rgba(255, 99, 132, 0.2)"/>
    <canvas id="leader-board-chart"></canvas>
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
      loading: false
    };
  },
  async mounted() {
    this.loading = true;
    await this.fetchLeaderBoard();
    await this.fetchParties();
    this.initChartInstance();
    this.initialLabels();
    this.createChart("leader-board-chart", this.leaderBoardData);
    this.subscribeAuctionChange();
    this.loading = false;
  },
  methods: {
    async fetchLeaderBoard() {
      const { data } = await offChainApi.getLeaderBoard();
      this.chartData = data.map(d => ({
        name: d.winnerParty.name,
        amount: d.bidAmount
      }));
      this.chairs = data.map(d => d.chair);
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
                  beginAtZero: true
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
                ctx.fillStyle = "rgb(0, 0, 0)";
                var fontSize = 14;
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
                      14,
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
        this.leaderBoardChart = new Chart(ctx, {
          type: chartData.type,
          data: chartData.data,
          options: chartData.options
        });
      }
    },
    getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    subscribeAuctionChange () {
      setInterval(() => {
        const len = this.leaderBoardChart.data.datasets[0].data.length
        const rand = this.getRandomInt(1, 100)
        this.leaderBoardChart.data.datasets[0].data[rand % len]++
        this.leaderBoardChart.update()
      }, 1000)
    }
  }
};
</script>

