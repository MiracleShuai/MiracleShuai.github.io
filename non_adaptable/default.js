var radialInterval3,
  default1 = 0,
  default2 = 0,
  default3 = 0,
  default4 = 0,
  slides = [],
  total_ppl = 0,
  threshold_value = {
    confusion: 0.5,
    engagement: 0.5,
    gaze: 0.5,
  },
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
  alertBorder = 0,
  alertOnce = 0,
  alertSound = 0,
  alert = {
    confusion: false,
    engagement: false,
    gaze: false,
  },
  themes;

const correspond_name = {
  Confused: "confusion",
  Engagement: "engagement",
  Gaze: "gaze",
  Emotion: "emotion",
};

const chart_name = {
  confusion: "defaultchart2",
  engagement: "defaultchart3",
  gaze: "defaultchart1",
};

function getServerData(update, alert, theme = null) {
  var cur_time = new Date().getTime() + 8 * 3600 * 1000,
    eng = [],
    heatpos = [],
    total = {
      engagement: 0,
    };

  $.ajax({
    url: "https://shuaima.cc:5000/get_class_information_real",
    type: "GET",
    //async: false,
    success: function (res) {
      console.log("getting data from backend");
      data = JSON.parse(res);
      console.log("data", data);
      total_ppl = data.length;

      var list = localStorage.getItem("students_log");
      students_log = list ? JSON.parse(list) : [];
      var new_log = {
        time: time(),
        engagement: [],
      };

      for (const [key, value] of Object.entries(total)) {
        if (key == "engagement") {
          data.forEach((d) => {
            eng.push(parseFloat(d[key]));
            new_log[key].push(d[key]);
            total[key] += parseFloat(d[key]);
          });
        }
      }

      // store data for default view

      current["engagement"] = total["engagement"] / data.length;

      // store in local storage
      var store_categories = ["engagement"];
      store_categories.forEach((d) => {
        var list = localStorage.getItem(d);
        list_json = list ? JSON.parse(list) : [];
        list_json.push([cur_time, current[d]]);
        list = JSON.stringify(list_json);
        localStorage.setItem(d, list);
      });

      var slide_num = data[0]["slides_num"];
      console.log(slide_num);

      var list = localStorage.getItem("slides");
      slides = list ? JSON.parse(list) : [];
      if (slides.length === 0 || slides[slides.length - 1][0] !== slide_num)
        slides.push([slide_num, cur_time]);
      list = JSON.stringify(slides);
      localStorage.setItem("slides", list);

      // calculate average for log
      for (const [key, value] of Object.entries(new_log)) {
        if (key !== "time") {
          let sum = value.reduce(function (a, b) {
            return parseFloat(a) + parseFloat(b);
          }, 0);
          new_log[key].push(sum / value.length);
        }
      }
      students_log.push(new_log);
      localStorage.setItem("students_log", JSON.stringify(students_log));

      // update slide for full view
      if (update) updateSlides(slides);

      console.log("localstorage:", localStorage);
    },
  }).done(function () {
    console.log("ajax done");
  });
}

function loadDefaultWindow() {
  var theme;
  $.getJSON("./theme.json", function (data) {
    // get theme
    themes = data.theme;
    theme = themes["theme_blue"];
    // set theme
    for (const [key, value] of Object.entries(theme.default)) {
      console.log(`${key}: ${value}`);
      $(`#${key}`).css("border-color", `rgb(${value})`);
      $(`#${key}Check`).css("background-color", `rgba(${value},0.5)`);
      // $(`#${key}Check`).css("opacity", 0.5);
    }

    console.log("theme", theme);
    setInterval(getServerData, 2000, false, true, theme);

    // initial width
    const width = $(window).width - 30;
    $("#defaultchart3").css("width", width);

    // draw default 3 Engagement
    if (radialInterval3) clearInterval(radialInterval3);

    drawRadialChart("defaultchart3", "Engagement", theme);
    $("#defaultchart3").css("height", 140);
  });
}

function drawRadialChart(container, name, theme) {
  var image;
  var RadialChart = Highcharts.chart(container, {
    colors: [`rgb(${theme.default[container]})`],
    credits: false,
    chart: {
      type: "column",
      inverted: true,
      polar: true,
      margin: [30, 0, 40, 0],
      height: 140,
      // backgroundColor: "lightblue",
      // borderColor: "lightblue",
      // borderWidth: 2,
      // plotBackgroundImage: "info_img/engage.png",

      events: {
        // load: function () {
        //   var series = this.series[0];
        //   setInterval(function () {
        //     data = [];
        //     data.push(Math.random() * 150);
        //     series.setData(data);
        //   }, 2000);
        // },
        redraw: function () {
          // console.log("redraw", this.chartHeight);
          if (image) image.destroy();
          image = this.renderer.image(
            `icon_img/${name}.png`,
            this.chartWidth / 2 - 10,
            this.chartHeight / 2 - 18,
            22,
            22
          );
          image.add();
        },
      },
    },
    exporting: {
      enabled: false,
      buttons: {
        contextButton: {
          verticalAlign: "bottom",
          width: 10,
        },
      },
    },
    title: {
      text: name,
      style: { fontSize: "13px" },
    },
    tooltip: {
      enabled: false,
      outside: true,
    },
    pane: {
      size: "100%",
      innerSize: "50%",
      endAngle: 360,
    },
    xAxis: {
      tickInterval: 1,
      lineWidth: 0,
      categories: [
        ' <span class="f16"><span id="flag" class="flag no">' +
          "</span></span>",
      ],
    },
    yAxis: {
      visible: false,
      crosshair: {
        enabled: true,
        color: "#333",
      },
      lineWidth: 0,
      tickInterval: 25,
      max: 150,
      reversedStacks: false,
      endOnTick: true,
      showLastLabel: true,
    },
    plotOptions: {
      column: {
        stacking: "normal",
        borderWidth: 0,
        pointPadding: 0,
        groupPadding: 0.15,
      },
    },
    legend: {
      labelFormatter: function () {
        return Math.round((this.yData / 150) * 100) + "%";
      },
      // hide the dot
      symbolHeight: 0.001,
      symbolWidth: 0.001,
      symbolRadius: 0.001,
    },
    series: [
      {
        name: "",
        data: [100],
      },
    ],
  });

  image = RadialChart.renderer
    .image(
      `icon_img/${name}.png`,
      RadialChart.chartWidth / 2 - 10,
      RadialChart.chartHeight / 2 - 18,
      22,
      22
    )
    .add();

  var radialInterval = setInterval(function () {
    if (RadialChart.series) {
      data = [];
      data.push(current[correspond_name[name]] * 150);
      RadialChart.series[0].setData(data);
      console.log("radial chart set data", current);
    }
  }, 1000);

  return radialInterval;
}

function time(time = +new Date()) {
  var date = new Date(time + 8 * 3600 * 1000);
  return date.toJSON().substr(0, 19).split("T")[1];
}

function ToFullView() {
  console.log("to full view...");

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({ time: time(), action: "to_full" });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);

  window.close();
  fullWindow = window.open("full.html", "", "width=600,height=500");
  console.log(screen.width);
  // fullWindow.resizeTo(rate * screen.width, screen.height);
  fullWindow.moveTo(screen.width, 0);
}

function handleWindowResize() {
  console.log(window.innerWidth);
  var width = window.innerWidth - 25;
  $("#defaultchart3").css("width", width);
}
