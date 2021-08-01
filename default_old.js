function handleThresholdChange() {
  //   console.log($("#threshold")[0].value);
  const threshold = $("#threshold")[0].value;
  $("#thresholdtext").html("> " + threshold);
}

function handleHidden() {
  console.log($("#chart_type").is(":visible"));
  if ($("#chart_type").is(":visible")) $("#hidden_space").hide();
  else $("#hidden_space").show();
}

var radialInterval1,
  motorInterval1,
  barInterval1,
  radialInterval2,
  motorInterval2,
  barInterval2,
  radialInterval3,
  motorInterval3,
  barInterval3,
  radialInterval4,
  motorInterval4,
  barInterval4,
  default1 = 0,
  default2 = 0,
  default3 = 0,
  default4 = 0,
  threshold_value = {
    confusion: 0.5,
    engagement: 0.5,
    gaze: 0.5,
  },
  chartData = {
    confusion: 0,
    engagement: 0,
    gaze: 0,
    // emotion: 0,
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

// const themes = {
//   theme_orange: {
//     default: {
//       defaultTrigger: "254,240,217",
//       defaultchart1: "227,74,51",
//       defaultchart2: "252,141,89",
//       defaultchart3: "253,204,138",
//       defaultchart4: "179,0,0",
//     },
//     motor: [
//       [0.1, "#fee8c8"],
//       [0.5, "#fdbb84"],
//       [0.9, "#e34a33"],
//     ],
//   },
//   theme_blue: {
//     default: {
//       defaultTrigger: "239,243,255",
//       defaultchart1: "49,130,189",
//       defaultchart2: "107,174,214",
//       defaultchart3: "189,215,231",
//       defaultchart4: "8,81,156",
//     },
//     motor: [
//       [0.1, "#deebf7"],
//       [0.5, "#9ecae1"],
//       [0.9, "#3182bd"],
//     ],
//   },
//   theme_green: {
//     default: {
//       defaultTrigger: "237,248,233",
//       defaultchart1: "49,163,84",
//       defaultchart2: "116,196,118",
//       defaultchart3: "186,228,179",
//       defaultchart4: "0,109,44",
//     },

//     motor: [
//       [0.1, "#e5f5e0"],
//       [0.5, "#a1d99b"],
//       [0.9, "#31a354"],
//     ],
//   },
// };

function getServerData(theme) {
  // get data from backend
  $.ajax({
    url: "http://49.232.60.34:5000/get_class_information",
    type: "GET",
    success: function (res) {
      // console.log("getting data from backend");
      var live_data = JSON.parse(res);
      console.log(live_data);

      // get emoji data
      var emoji_data = {
        confusion: 0,
        smile: 0,
        headnod: 0,
        headshake: 0,
        drowsiness: 0,
        speaking: 0,
      };

      for (const [key, value] of Object.entries(emoji_data)) {
        var total = 0;
        emojiData.total_ppl = live_data.length;
        live_data.forEach((d) => {
          return (total += parseInt(d[key]));
        });
        // console.log(key, total);
        emoji_data[key] = total;
      }
      // get max value
      emojiData.max_value = Math.max(...Object.values(emoji_data));
      // find corresponding key
      emojiData.max_key = Object.keys(emoji_data).find(
        (key) => emoji_data[key] == emojiData.max_value
      );

      // get chart data
      Object.keys(chartData).forEach((name) => {
        var norm_data = 0;

        live_data.forEach((d) => {
          // console.log(parseFloat(d[name]));
          norm_data += parseFloat(d[name]);
        });
        norm_data /= live_data.length;

        // console.log(name, norm_data);
        chartData[name] = norm_data;
      });
      console.log("getServerData chartData", chartData);
      // console.log("normalized data:", norm_data);

      var name = "emotion";
      var x = [],
        y = [];
      live_data.forEach((d) => {
        x.push(parseFloat(d[name].split(" ")[0]));
        y.push(parseFloat(d[name].split(" ")[1]));
      });
      console.log("emotion", emotion);
      emotion = { x, y };

      checkAlert(theme);
    },
  });
}

var borderIntervals = {
  confusion: null,
  gaze: null,
  engagement: null,
};

function checkAlert(theme) {
  for (const [key, value] of Object.entries(chartData)) {
    console.log("alert", alert);

    if (value > threshold_value[key]) {
      // continuous on and alert on => don't trigger
      if (alertOnce && alert[key]) continue;

      alert[key] = true;
      console.log(key, "value: ", value);
      console.log("thresh: ", threshold_value[key]);
      console.log(alert);
      if (alertBorder) {
        // shine for 3 times
        var x = 0;
        console.log("border", key);
        borderIntervals[key] = setInterval(function () {
          if (x >= 2) {
            console.log(x, "clearinterval", borderIntervals[key]);
            clearInterval(borderIntervals[key]);
            console.log(x, "after clear", borderIntervals[key]);
          }
          $("#" + chart_name[key]).css("border-width", "5");
          $("#" + chart_name[key]).css("border-color", "orange");
          setTimeout(function () {
            $("#" + chart_name[key]).css("border-width", "3");
            $("#" + chart_name[key]).css(
              "border-color",
              `rgb(${theme.default[chart_name[key]]})`
            );
          }, 250);
          console.log("x", x);
          x++;
        }, 500);
      }

      if (alertSound) {
        var audio = new Audio("ding.wav");
        audio.play();
      }

      // if (alertIcon) {
      // console.log($("image"));
      // $("image").css("color", "red");
      // console.log(d3.select("image"));
      // d3.selectAll("image").style("filter", "invert(100%)");
      // }
    } else {
      if (alertOnce) alert[key] = false;
      console.log("else", key);
      console.log(alert);
      $("#" + chart_name[key]).css("border-width", "3");
      $("#" + chart_name[key]).css(
        "border-color",
        `rgb(${theme.default[chart_name[key]]})`
      );
    }
  }
}

function loadDefaultWindow() {
  setInterval(create_emotion_wheel, 1000);
  // get the chart type
  var cookieList = document.cookie.split("; ");
  console.log("cookie list:", cookieList);

  var alertBorderName = "alertBorder";
  cookieList.forEach((val) => {
    if (val.indexOf(alertBorderName) === 0)
      alertBorder = parseInt(val.substring(alertBorderName.length + 1));
  });
  console.log("alertBorder:", alertBorder);

  var alertOnceName = "alertOnce";
  cookieList.forEach((val) => {
    if (val.indexOf(alertOnceName) === 0)
      alertOnce = parseInt(val.substring(alertOnceName.length + 1));
  });
  console.log("alertOnce:", alertOnce);

  var alertSoundName = "alertSound";
  cookieList.forEach((val) => {
    if (val.indexOf(alertSoundName) === 0)
      alertSound = parseInt(val.substring(alertSoundName.length + 1));
  });
  console.log("alertSound:", alertSound);

  var gazeChartType,
    gazeChartName = "gazecharttype";
  cookieList.forEach((val) => {
    if (val.indexOf(gazeChartName) === 0)
      gazeChartType = val.substring(gazeChartName.length + 1);
  });
  console.log("gaze:", gazeChartType);

  var engageChartType,
    engageChartName = "engagecharttype";
  cookieList.forEach((val) => {
    if (val.indexOf(engageChartName) === 0)
      engageChartType = val.substring(engageChartName.length + 1);
  });
  console.log("engage:", engageChartType);

  var confusedChartType,
    confusedChartName = "confusedcharttype";
  cookieList.forEach((val) => {
    if (val.indexOf(confusedChartName) === 0)
      confusedChartType = val.substring(confusedChartName.length + 1);
  });
  console.log("confused:", confusedChartType);

  var emoChartType,
    emoChartName = "emocharttype";
  cookieList.forEach((val) => {
    if (val.indexOf(emoChartName) === 0)
      emoChartType = val.substring(emoChartName.length + 1);
  });
  console.log("emo:", emoChartType);

  // get threshold
  var gazeThresh,
    gazeThreshName = "gazethresh";
  cookieList.forEach((val) => {
    if (val.indexOf(gazeThreshName) === 0)
      gazeThresh = val.substring(gazeThreshName.length + 1);
  });
  console.log("gaze thresh:", gazeThresh);

  var conThresh,
    conThreshName = "conthresh";
  cookieList.forEach((val) => {
    if (val.indexOf(conThreshName) === 0)
      conThresh = val.substring(conThreshName.length + 1);
  });
  console.log("con thresh:", conThresh);

  var engThresh,
    engThreshName = "engthresh";
  cookieList.forEach((val) => {
    if (val.indexOf(engThreshName) === 0)
      engThresh = val.substring(engThreshName.length + 1);
  });
  console.log("eng thresh:", engThresh);
  threshold_value = {
    confusion: conThresh / 100,
    gaze: gazeThresh / 100,
    engagement: engThresh / 100,
  };

  // get theme
  var theme;
  $.getJSON("./theme.json", function (data) {
    themes = data.theme;
    // console.log("themes:",themes);
    var cookieList = document.cookie.split("; ");
    var themeid,
      themeName = "themeid";
    cookieList.forEach((val) => {
      if (val.indexOf(themeName) === 0)
        themeid = val.substring(themeName.length + 1);
    });
    theme = themes[themeid];

    // check for customization
    var engcolor,
      engcolorName = "engcolor";
    cookieList.forEach((val) => {
      if (val.indexOf(engcolorName) === 0)
        engcolor = val.substring(engcolorName.length + 1);
    });
    if (engcolor) theme["default"]["defaultchart1"] = engcolor;

    var confcolor,
      confcolorName = "confcolor";
    cookieList.forEach((val) => {
      if (val.indexOf(confcolorName) === 0)
        confcolor = val.substring(confcolorName.length + 1);
    });
    if (confcolor) theme["default"]["defaultchart2"] = confcolor;

    var gazecolor,
      gazecolorName = "gazecolor";
    cookieList.forEach((val) => {
      if (val.indexOf(gazecolorName) === 0)
        gazecolor = val.substring(gazecolorName.length + 1);
    });
    if (gazecolor) theme["default"]["defaultchart3"] = gazecolor;

    // set theme
    for (const [key, value] of Object.entries(theme.default)) {
      console.log(`${key}: ${value}`);
      $(`#${key}`).css("border-color", `rgb(${value})`);
      $(`#${key}Check`).css("background-color", `rgba(${value},0.5)`);
      // $(`#${key}Check`).css("opacity", 0.5);
    }

    console.log("theme", theme);
    setInterval(getServerData, 2000, theme);

    // make it sortable
    // $("#draggable").draggable();
    $("#sortable").sortable({
      // placeholder: "ui-state-highlight",
    });
    // $("#sortable").disableSelection();

    // initial width
    const width = $(window).width - 30;
    $("#defaultchart2").css("width", width);
    // $("#defaultchart2").css("height", width + 50);
    $("#defaultchart3").css("width", width);
    // $("#defaultchart3").css("height", 120);
    $("#defaultchart1").css("width", width);
    // $("#defaultchart1").css("height", width + 50 - 100);
    $("#defaultTrigger").css("width", width);
    // $("#defaultTrigger").css("height", width + 50);
    //   console.log(width);

    // draw default 1 gaze
    if (barInterval1) clearInterval(barInterval1);
    if (radialInterval1) clearInterval(radialInterval1);
    if (motorInterval1) clearInterval(motorInterval1);

    if (gazeChartType == "Motor") {
      drawMotorChart("defaultchart1", "Gaze", theme);
      $("#defaultchart1").css("height", 120);
    } else if (gazeChartType == "Radial") {
      drawRadialChart("defaultchart1", "Gaze", theme);
      $("#defaultchart1").css("height", 140);
    } else {
      drawBarChart("defaultchart1", "Gaze", theme);
      $("#defaultchart1").css("height", 90);
    }

    // draw default 2 confused
    if (barInterval2) clearInterval(barInterval2);
    if (radialInterval2) clearInterval(radialInterval2);
    if (motorInterval2) clearInterval(motorInterval2);

    if (confusedChartType == "Motor") {
      drawMotorChart("defaultchart2", "Confused", theme);
      $("#defaultchart2").css("height", 120);
    } else if (confusedChartType == "Radial") {
      drawRadialChart("defaultchart2", "Confused", theme);
      $("#defaultchart2").css("height", 140);
    } else {
      drawBarChart("defaultchart2", "Confused", theme);
      $("#defaultchart2").css("height", 90);
    }

    // draw default 3 Engagement
    if (barInterval3) clearInterval(barInterval3);
    if (radialInterval3) clearInterval(radialInterval3);
    if (motorInterval3) clearInterval(motorInterval3);

    if (engageChartType == "Motor") {
      drawMotorChart("defaultchart3", "Engagement", theme);
      $("#defaultchart3").css("height", 120);
    } else if (engageChartType == "Radial") {
      drawRadialChart("defaultchart3", "Engagement", theme);
      $("#defaultchart3").css("height", 140);
    } else {
      drawBarChart("defaultchart3", "Engagement", theme);
      $("#defaultchart3").css("height", 90);
    }
  });

  // draw default 4 emotion
  // if (barInterval4) clearInterval(barInterval4);
  // if (radialInterval4) clearInterval(radialInterval4);
  // if (motorInterval4) clearInterval(motorInterval4);

  // if (emoChartType == "Motor") {
  //   drawMotorChart("defaultchart4", "Emotion", theme);
  //   $("#defaultchart4").css("height", 120);
  // } else if (emoChartType == "Radial") {
  //   drawRadialChart("defaultchart4", "Emotion", theme);
  //   $("#defaultchart4").css("height", 140);
  // } else {
  //   drawBarChart("defaultchart4", "Emotion", theme);
  //   $("#defaultchart4").css("height", 90);
  // }

  // trigger
  setInterval(function () {
    $("#threshold").attr("max", emojiData.total_ppl);
    const threshold = $("#threshold")[0].value;
    if (emojiData.max_value > threshold) {
      // change the height of the card
      $("#defaultTrigger").css("height", "8rem");

      // svg
      var svg = d3.select("svg#trigger-svg");
      svg.selectAll("image").remove();
      svg.selectAll("circle").remove();
      svg.selectAll("text").remove();

      var img = svg
        .append("image")
        .attr("xlink:href", `./emoji/${emojiData.max_key}.gif`)
        .attr("width", 60)
        .attr("height", 60)
        .attr("x", 0)
        .attr("y", 0);

      var hint = svg
        .append("circle")
        .attr("cx", 50)
        .attr("cy", 10)
        .attr("r", 10)
        .attr("fill", "red");

      var text = svg
        .append("text")
        .attr("x", 50)
        .attr("y", 15)
        .attr("fill", "white")
        .attr("font-size", 15)
        .text(emojiData.max_value)
        .attr("text-anchor", "middle");
    } else {
      // change the height of the card
      $("#defaultTrigger").css("height", "3rem");

      var svg = d3.select("svg#trigger-svg");
      svg.selectAll("image").remove();
      svg.selectAll("circle").remove();
      svg.selectAll("text").remove();

      // $("#trigger-img").hide();
      // $("#trigger-text").hide();
    }
  }, 1000);
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
      data.push(chartData[correspond_name[name]] * 150);
      RadialChart.series[0].setData(data);
      // console.log("radial chart set data");
    }
  }, 1000);

  return radialInterval;
}

function drawMotorChart(container, name, theme) {
  var image;
  // console.log(theme);
  var gaugeOptions = {
    chart: {
      type: "solidgauge",
      margin: [30, 0, 0, 0],
      height: 118,
      events: {
        redraw: function () {
          // console.log("redraw", this.chartWidth);
          if (image) image.destroy();
          image = this.renderer.image(
            `icon_img/${name}.png`,
            this.chartWidth / 2 - 10,
            this.chartHeight / 2 - 6,
            22,
            22
          );
          image.add();
        },
      },
    },

    title: {
      text: name,
      style: { fontSize: "13px" },
    },

    pane: {
      center: ["50%", "50%"],
      size: "100%",
      startAngle: -90,
      endAngle: 90,
      background: {
        backgroundColor:
          Highcharts.defaultOptions.legend.backgroundColor || "#EEE",
        innerRadius: "60%",
        outerRadius: "100%",
        shape: "arc",
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

    tooltip: {
      enabled: false,
    },

    // the value axis
    yAxis: {
      // stops: [
      //   [0.1, "#55BF3B"], // green
      //   [0.5, "#DDDF0D"], // yellow
      //   [0.9, "#DF5353"], // red
      // ],
      stops: theme.motor,
      lineWidth: 0,
      tickWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      // title: {},
      labels: {
        y: 16,
        enabled: false,
      },
    },

    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true,
        },
      },
    },
  };

  var MotorChart = Highcharts.chart(
    container,
    Highcharts.merge(gaugeOptions, {
      yAxis: {
        min: 0,
        max: 200,
      },

      credits: {
        enabled: false,
      },

      series: [
        {
          data: [80],
          dataLabels: {
            formatter: function () {
              // console.log(this.y);
              var size = 20;
              return (
                '<div style="text-align:center">' +
                '<span style="font-size:{size}">' +
                Math.round((this.y / 200) * 100) +
                "</span>" +
                '<span style="font-size:12px;opacity:0.4">%</span>' +
                "</div>"
              );
            },
          },
        },
      ],
    })
  );

  image = MotorChart.renderer
    .image(
      `icon_img/${name}.png`,
      MotorChart.chartWidth / 2 - 10,
      MotorChart.chartHeight / 2 - 6,
      22,
      22
    )
    .add();

  var motorInterval = setInterval(function () {
    var point, newVal, inc;

    if (MotorChart.series) {
      point = MotorChart.series[0].points[0];
      inc = (chartData[correspond_name[name]] - 0.5) * 100;
      newVal = point.y + inc;

      if (newVal < 0 || newVal > 200) {
        newVal = point.y - inc;
      }
      // console.log("chart value", chartData[correspond_name[name]]);
      // console.log("inc", inc);
      // console.log("point", point);
      // console.log("newVal", newVal);

      point.update(newVal);
    }
  }, 1000);

  return motorInterval;
}

function drawBarChart(container, name, theme, barInterval) {
  var image;
  var BarChart = Highcharts.chart(container, {
    colors: [`rgb(${theme.default[container]})`],
    chart: {
      type: "bar",
      margin: [20, 0, 40, 0],
      height: 100,
      events: {
        redraw: function () {
          // console.log("redraw", this.chartHeight);
          if (image) image.destroy();
          image = this.renderer.image(
            `icon_img/${name}.png`,
            this.chartWidth / 2 - 35,
            this.chartHeight / 2 + 10,
            22,
            22
          );
          image.add();
        },
      },
    },
    exporting: {
      enabled: false,
    },
    title: {
      text: name,
      style: { fontSize: "13px" },
    },
    tooltip: {
      enabled: false,
    },
    xAxis: {
      tickInterval: 1,
      lineWidth: 0,
    },
    yAxis: {
      crosshair: {
        enabled: true,
      },
      lineWidth: 0,
      tickInterval: 25,
      max: 150,
      reversedStacks: false,
      labels: {
        enabled: false,
      },
      title: undefined,
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

  image = BarChart.renderer
    .image(
      `icon_img/${name}.png`,
      BarChart.chartWidth / 2 - 35,
      BarChart.chartHeight / 2 + 10,
      22,
      22
    )
    .add();

  var barInterval = setInterval(function () {
    if (BarChart.series) {
      data = [];
      data.push(chartData[correspond_name[name]] * 150);
      BarChart.series[0].setData(data);
      // console.log("bar chart set data");
    }
  }, 1000);

  return barInterval;
}

function handleDefaultChart1() {
  // get theme
  var cookieList = document.cookie.split("; ");
  var themeid,
    themeName = "themeid";
  cookieList.forEach((val) => {
    if (val.indexOf(themeName) === 0)
      themeid = val.substring(themeName.length + 1);
  });
  const theme = themes[themeid];

  console.log("handle default chart 1");
  if (barInterval1) clearInterval(barInterval1);
  if (radialInterval1) clearInterval(radialInterval1);
  if (motorInterval1) clearInterval(motorInterval1);

  if (default1 == 0) {
    motorInterval1 = drawMotorChart("defaultchart1", "Gaze", theme);
    document.cookie = "gazecharttype=Motor";
    $("#defaultchart1").css("height", 120);
  } else if (default1 == 1) {
    radialInterval1 = drawRadialChart("defaultchart1", "Gaze", theme);
    document.cookie = "gazecharttype=Radial";
    $("#defaultchart1").css("height", 140);
  } else {
    barInterval1 = drawBarChart("defaultchart1", "Gaze", theme);
    document.cookie = "gazecharttype=Bar";
    $("#defaultchart1").css("height", 90);
  }
  default1 = (default1 + 1) % 3;
}

function handleDefaultChart2() {
  // get theme
  var cookieList = document.cookie.split("; ");
  var themeid,
    themeName = "themeid";
  cookieList.forEach((val) => {
    if (val.indexOf(themeName) === 0)
      themeid = val.substring(themeName.length + 1);
  });
  const theme = themes[themeid];

  console.log("handle default chart 2");
  if (barInterval2) clearInterval(barInterval2);
  if (radialInterval2) clearInterval(radialInterval2);
  if (motorInterval2) clearInterval(motorInterval2);

  if (default2 == 0) {
    drawMotorChart("defaultchart2", "Confused", theme);
    document.cookie = "confusedcharttype=Motor";
    $("#defaultchart2").css("height", 120);
  } else if (default2 == 1) {
    drawRadialChart("defaultchart2", "Confused", theme);
    document.cookie = "confusedcharttype=Radial";
    $("#defaultchart2").css("height", 140);
  } else {
    drawBarChart("defaultchart2", "Confused", theme);
    document.cookie = "confusedcharttype=Bar";
    $("#defaultchart2").css("height", 90);
  }
  default2 = (default2 + 1) % 3;
}

function handleDefaultChart3() {
  // get theme
  var cookieList = document.cookie.split("; ");
  var themeid,
    themeName = "themeid";
  cookieList.forEach((val) => {
    if (val.indexOf(themeName) === 0)
      themeid = val.substring(themeName.length + 1);
  });
  const theme = themes[themeid];

  console.log("handle default chart 3");
  if (barInterval3) clearInterval(barInterval3);
  if (radialInterval3) clearInterval(radialInterval3);
  if (motorInterval3) clearInterval(motorInterval3);

  if (default3 == 0) {
    drawMotorChart("defaultchart3", "Engagement", theme);
    document.cookie = "engagecharttype=Motor";
    $("#defaultchart3").css("height", 120);
  } else if (default3 == 1) {
    drawRadialChart("defaultchart3", "Engagement", theme);
    document.cookie = "engagecharttype=Radial";
    $("#defaultchart3").css("height", 140);
  } else {
    drawBarChart("defaultchart3", "Engagement", theme);
    document.cookie = "engagecharttype=Bar";
    $("#defaultchart3").css("height", 90);
  }
  default3 = (default3 + 1) % 3;
}

// function handleDefaultChart4() {
//   // get theme
//   var cookieList = document.cookie.split("; ");
//   var themeid,
//     themeName = "themeid";
//   cookieList.forEach((val) => {
//     if (val.indexOf(themeName) === 0)
//       themeid = val.substring(themeName.length + 1);
//   });
//   const theme = themes[themeid];

//   console.log("handle default chart 1");
//   if (barInterval4) clearInterval(barInterval4);
//   if (radialInterval4) clearInterval(radialInterval4);
//   if (motorInterval4) clearInterval(motorInterval4);

//   if (default4 == 0) {
//     drawMotorChart("defaultchart4", "Emotion", theme);
//     document.cookie = "emocharttype=Motor";
//     $("#defaultchart4").css("height", 120);
//   } else if (default4 == 1) {
//     drawRadialChart("defaultchart4", "Emotion", theme);
//     document.cookie = "emocharttype=Radial";
//     $("#defaultchart4").css("height", 140);
//   } else {
//     drawBarChart("defaultchart4", "Emotion", theme);
//     document.cookie = "emocharttype=Bar";
//     $("#defaultchart4").css("height", 90);
//   }
//   default4 = (default4 + 1) % 3;
// }

const containers = [
  "defaultchart1",
  "defaultchart2",
  "defaultchart3",
  "defaultchart4",
  "defaultTrigger",
];

function handleHighlight(container) {
  containers.forEach((item) => {
    if (item != container) $("#" + item).css("opacity", "0.5");
    else {
      // $("#" + item).css("border-color", "orange");
      $("#" + item).css("border-width", "5");
    }
  });
}

function handleUndoHighlight(container) {
  containers.forEach((item) => {
    if (item != container) $("#" + item).css("opacity", "1");
    else {
      // $("#" + item).css("border-color", "");
      $("#" + item).css("border-width", "3");
    }
  });
  // for (const [key, value] of Object.entries(theme)) {
  //   console.log(`${key}: ${value}`);
  //   $(`#${key}`).css("border-color", `rgb(${value})`);
  //   $(`#${key}Check`).css("background-color", `rgba(${value},0.5)`);
  //   // $(`#${key}Check`).css("opacity", 0.5);
  // }
}
