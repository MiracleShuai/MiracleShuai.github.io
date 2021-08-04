// const { GridStack } = require("gridstack");

var fullinterval0,
  fullinterval1,
  fullinterval2,
  fullinterval3,
  fullinterval4,
  updateFullInterval,
  trigger = {
    confusion: 0,
    drowsiness: 0,
    headnod: 0,
    headshake: 0,
    smile: 0,
    speaking: 0,
  },
  current = {
    engagement: 0,
    emotion: 0,
    confusion: 0,
    gaze: 0,
  },
  emojiData = {
    total_ppl: 0,
    max_value: 0,
    max_key: "",
  },
  emotion = {
    x: [],
    y: [],
  },
  slide_range = [],
  current_heatpos = [],
  start_time,
  slides = [],
  total_ppl = 0;
// current stage info don't need to be stored in local storage, can be directly sent to chart
// average of historical data can be calculated each time in drawRadarChart through local storage

function updateSlides(slides) {
  // slides.push([slide_num, time]);
  const charts = [fullChart7];
  var plotBands = [];
  for (var i = 1; i < slides.length; i += 2) {
    plotBands.push({
      from: slides[i - 1][1],
      to: slides[i][1],
      color: "rgba(68, 170, 213, .2)",
    });
  }
  charts.forEach((chart) => {
    // console.log(chart);
    if (Object.keys(chart).length)
      chart.update({
        xAxis: {
          plotBands: plotBands,
        },
      });
  });
}

function loadFullWindow() {
  setInterval(getServerData, 1000, true, false);

  // let grid = GridStack.init({
  //   cellHeight: 100,
  // });

  // always fit the size of container
  setInterval(function () {
    $(`#fullchart7`).width($(`#fulldiv7`).width() - 40);
    $(`#fullchart7`).height($(`#fulldiv7`).height() - 40);
  }, 1000);

  // manually resize chart to fit container
  // grid.on("resizestop", function (e, items) {
  //   var chartname = "fullchart" + e.target.id[e.target.id.length - 1];
  //   var w = e.target.attributes[2].value,
  //     h = e.target.attributes[3].value;
  //   var list = localStorage.getItem("user_behavior");
  //   list_json = list ? JSON.parse(list) : [];
  //   list_json.push({
  //     time: time(),
  //     action: "resize",
  //     chart: chartname,
  //     size: [w, h],
  //   });
  //   list = JSON.stringify(list_json);
  //   localStorage.setItem("user_behavior", list);

  //     $(`#fullchart7`).width($(`#fulldiv7`).width() - 40);
  //     $(`#fullchart7`).height($(`#fulldiv7`).height() - 40);

  //   if (Object.keys(fullChart0).length)
  //     fullChart0.setSize(
  //       $("#fulldiv0").width() - 40,
  //       $("#fulldiv0").height() - 40
  //     );

  //   if (Object.keys(fullChart1).length)
  //     fullChart1.setSize(
  //       $("#fulldiv1").width() - 40,
  //       $("#fulldiv1").height() - 40
  //     );

  //   if (Object.keys(fullChart2).length)
  //     fullChart2.setSize(
  //       $("#fulldiv2").width() - 40,
  //       $("#fulldiv2").height() - 40
  //     );

  //   if (Object.keys(fullChart3).length)
  //     fullChart3.setSize(
  //       $("#fulldiv3").width() - 40,
  //       $("#fulldiv3").height() - 40
  //     );

  //   if (Object.keys(fullChart4).length)
  //     fullChart4.setSize(
  //       $("#fulldiv4").width() - 40,
  //       $("#fulldiv4").height() - 40
  //     );

  //   if (Object.keys(fullChart5).length)
  //     fullChart5.setSize(
  //       $("#fulldiv5").width() - 40,
  //       $("#fulldiv5").height() - 40
  //     );

  //   if (Object.keys(fullChart6).length)
  //     fullChart6.setSize(
  //       $("#fulldiv6").width() - 40,
  //       $("#fulldiv6").height() - 40
  //     );

  //   if (Object.keys(fullChart7).length)
  //     fullChart7.setSize(
  //       $("#fulldiv7").width() - 40,
  //       $("#fulldiv7").height() - 40
  //     );

  //   if (Object.keys(fullChart8).length)
  //     fullChart8.setSize(
  //       $("#fulldiv8").width() - 40,
  //       $("#fulldiv8").height() - 40
  //     );

  //   if (Object.keys(fullChart9).length)
  //     fullChart9.setSize(
  //       $("#fulldiv9").width() - 40,
  //       $("#fulldiv9").height() - 40
  //     );

  //   if (Object.keys(fullChart10).length)
  //     fullChart10.setSize(
  //       $("#fulldiv10").width() - 40,
  //       $("#fulldiv10").height() - 40
  //     );
  // });

  // get theme
  var theme;
  $.getJSON("./theme.json", function (data) {
    var themes = data.theme;
    theme = themes["theme_blue"];

    // set theme
    for (const [key, value] of Object.entries(theme.full)) {
      // console.log(`${key}: ${value}`);
      $(`#${key}`).css("border-color", `rgb(${value})`);
      $(`#${key}Check`).css("background-color", `rgba(${value},0.5)`);
      // $(`#${key}Check`).css("opacity", 0.5);
    }
  });

  drawFullChart7();

  // grid.compact();
}

function handleUnloadFull() {
  // localStorage.clear();
  // clearInterval(updateFullInterval);
  // no need to clear the interval cause all the timers got cleaned when the browser closed
}

function drawFullChart7() {
  // eng area neg
  // var start_time = new Date().getTime();
  // var threshold = 0.4;
  fullChart7 = Highcharts.chart("fullchart7", {
    credits: false,
    chart: {
      type: "area",
      width: $("#fulldiv7").width() - 40,
      height: $("#fulldiv7").height() - 40,
    },

    title: {
      text: "<img src='https://i.ibb.co/h2PTxzp/Engagement.png' style='width:20px;height:20px'/><span>  Engagement</span>",
      useHTML: true,
    },

    subtitle: {
      text: "Historical data (updata per second)",
    },

    tooltip: {
      valueDecimals: 2,
      useHTML: true,
      formatter: function () {
        return `<div style="min-height: 120px;">
        <img src="https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/article_thumbnails/other/dog_cool_summer_slideshow/1800x1200_dog_cool_summer_other.jpg" width="150"/>
        <br />► ${this.series.name}: ${this.point.y.toFixed(2)}<br /></div>`;
      },
    },

    legend: {
      enabled: false,
    },

    xAxis: {
      type: "datetime",
      // tickInterval: 10,
      tickPixelInterval: 100,
      min: start_time,
      // min: 1625842192120,
      plotBands: [
        {
          from: start_time,
          to: start_time + 10000,
          color: "rgba(68, 170, 213, .2)",
        },
        {
          from: start_time + 20000,
          to: start_time + 25000,
          color: "rgba(68, 170, 213, .2)",
        },
        {
          from: start_time + 30000,
          to: start_time + 40000,
          color: "rgba(68, 170, 213, .2)",
        },
        {
          from: start_time + 50000,
          to: start_time + 60000,
          color: "rgba(68, 170, 213, .2)",
        },
      ],
    },

    series: [
      {
        lineWidth: 0.5,
        name: "Average level",
      },
    ],
  });

  fullinterval7 = setInterval(function () {
    if (fullChart7.series) {
      var list = localStorage.getItem("engagement");
      var list_json = list ? JSON.parse(list) : [];
      fullChart7.series[0].setData(list_json);

      // fullChart7.xAxis[0].addPlotBand(plotBands[0]);
    }
  }, 1000);
}

function ToDefaultView() {
  console.log("to default view...");

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({ time: time(), action: "to_default" });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);

  window.close();
  defaultWindow = window.open("default.html", "", "width=150,height=300");
  console.log((1 / 20) * screen.width);
  // defaultWindow.resizeTo((1 / 10) * screen.width, screen.height);
  defaultWindow.moveTo(screen.width, 0);
}

function handleStartRecord() {
  localStorage.clear();
}

function handleFinishRecord() {
  ["user_behavior", "students_log"].forEach((name) => {
    const filename = name + ".txt";
    const str = localStorage.getItem(name);
    console.log(localStorage.getItem(name));

    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(str)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  });

  localStorage.clear();
}
