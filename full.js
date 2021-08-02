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
  slide_range = [],
  current_heatpos = [],
  start_time,
  slides = [],
  total_ppl = 0;
// current stage info don't need to be stored in local storage, can be directly sent to chart
// average of historical data can be calculated each time in drawRadarChart through local storage

function getServerData() {
  var x = new Date().getTime(),
    eng = [],
    heatpos = [],
    total = {
      engagement: 0,
      emotion: 0,
      confusion: 0,
      gaze: 0,
      drowsiness: 0,
      headnod: 0,
      headshake: 0,
      smile: 0,
      speaking: 0,
    },
    cur_emo_percentage = {
      upperRight: 0,
      lowerRight: 0,
      lowerLeft: 0,
      upperLeft: 0,
      neutral: 0,
    },
    cur_emo_line = { valence: 0, arousal: 0 };

  $.ajax({
    url: "https://shuaima.cc:5000/get_class_information_real",
    type: "GET",
    async: false,
    success: function (res) {
      console.log("getting data from backend");
      data = JSON.parse(res);
      console.log("data", data);
      total_ppl = data.length;
      for (const [key, value] of Object.entries(total)) {
        if (key == "emotion") {
          data.forEach((d) => {
            total[key] += parseFloat(d[key].split(" ")[0]);
            var x = parseFloat(d[key].split(" ")[0]),
              y = parseFloat(d[key].split(" ")[1]);
            if (x > 0.2 && y > 0.2) cur_emo_percentage.upperRight += 1;
            else if (x > 0.2 && y < -0.2) cur_emo_percentage.lowerRight += 1;
            else if (x < -0.2 && y < -0.2) cur_emo_percentage.lowerLeft += 1;
            else if (x < -0.2 && y > 0.2) cur_emo_percentage.upperLeft += 1;
            else cur_emo_percentage.neutral += 1;
            cur_emo_line.valence += x;
            cur_emo_line.arousal += y;
            heatpos.push([x, y]);
          });
        } else if (key == "engagement") {
          data.forEach((d) => {
            eng.push(parseFloat(d[key]));
            total[key] += parseFloat(d[key]);
          });
        } else {
          data.forEach((d) => {
            total[key] += parseFloat(d[key]);
          });
        }
      }
      // pass new heat pos info to add points on heatmap
      current_heatpos = heatpos;

      // get sum data for trigger
      Object.keys(trigger).forEach((key) => (trigger[key] = total[key]));
      console.log("trigger", trigger);

      // get average data for radar overview
      Object.keys(current).forEach((key) => {
        current[key] = total[key] / data.length;
        if (key == "emotion") current[key] = (current[key] + 1) / 2;
      });
      console.log("current", current); // for radar chart

      // store in local storage
      var store_categories = [
        "engagement",
        "emotion",
        "confusion",
        "gaze",
        "eng_range",
      ];
      store_categories.forEach((d) => {
        var list = localStorage.getItem(d);
        list_json = list ? JSON.parse(list) : [];
        if (d == "eng_range")
          list_json.push([x, Math.min(...eng), Math.max(...eng)]);
        else list_json.push([x, current[d]]);
        list = JSON.stringify(list_json);
        localStorage.setItem(d, list);
      });
      // store 5 categories for emotion percentage chart
      Object.keys(cur_emo_percentage).forEach((key) => {
        var list = localStorage.getItem(key);
        list_json = list ? JSON.parse(list) : [];
        list_json.push([x, cur_emo_percentage[key]]);
        list = JSON.stringify(list_json);
        localStorage.setItem(key, list);
      });
      // valence and arousal (non-normalized)
      Object.keys(cur_emo_line).forEach((key) => {
        var list = localStorage.getItem(key);
        list_json = list ? JSON.parse(list) : [];
        list_json.push([x, cur_emo_line[key] / data.length]);
        list = JSON.stringify(list_json);
        localStorage.setItem(key, list);
      });

      var slide_num = data[0]["slides_num"];
      console.log(slide_num);
      if (slides.length === 0) updateSlides(slide_num, x);
      else if (slides[slides.length - 1][0] !== slide_num)
        updateSlides(slide_num, x);
      console.log("localstorage:", localStorage);
    },
  }).done(function () {
    console.log("ajax done");
  });
}

function updateSlides(slide_num, time) {
  slides.push([slide_num, time]);
  const charts = [
    fullChart2,
    fullChart3,
    fullChart4,
    fullChart5,
    fullChart6,
    fullChart7,
    fullChart8,
    fullChart9,
    fullChart10,
  ];
  var plotBands = [];
  for (var i = 1; i < slides.length; i += 2) {
    plotBands.push({
      from: slides[i - 1][1],
      to: slides[i][1],
      color: "rgba(68, 170, 213, .2)",
    });
  }
  charts.forEach((chart) => {
    console.log(chart);
    if (Object.keys(chart).length)
      chart.update({
        xAxis: {
          plotBands: plotBands,
        },
      });
  });
}

function loadFullWindow() {
  setInterval(getServerData, 1000);
  start_time = new Date().getTime();

  let grid = GridStack.init({
    cellHeight: 100,
  });

  // always fit the size of container
  setInterval(function () {
    [...Array(11).keys()].forEach((d, i) => {
      $(`#fullchart${i}`).width($(`#fulldiv${i}`).width() - 40);
      $(`#fullchart${i}`).height($(`#fulldiv${i}`).height() - 40);
    });

    $("#fullchart11").width($("#fulldiv11").width() - 40);
    $("#fullchart11").height($("#fulldiv11").height() - 40);
  }, 1000);

  // manually resize chart to fit container
  grid.on("resize", function (e, items) {
    [...Array(11).keys()].forEach((d, i) => {
      $(`#fullchart${i}`).width($(`#fulldiv${i}`).width() - 40);
      $(`#fullchart${i}`).height($(`#fulldiv${i}`).height() - 40);
    });

    if (Object.keys(fullChart0).length)
      fullChart0.setSize(
        $("#fulldiv0").width() - 40,
        $("#fulldiv0").height() - 40
      );

    if (Object.keys(fullChart1).length)
      fullChart1.setSize(
        $("#fulldiv1").width() - 40,
        $("#fulldiv1").height() - 40
      );

    if (Object.keys(fullChart2).length)
      fullChart2.setSize(
        $("#fulldiv2").width() - 40,
        $("#fulldiv2").height() - 40
      );

    if (Object.keys(fullChart3).length)
      fullChart3.setSize(
        $("#fulldiv3").width() - 40,
        $("#fulldiv3").height() - 40
      );

    if (Object.keys(fullChart4).length)
      fullChart4.setSize(
        $("#fulldiv4").width() - 40,
        $("#fulldiv4").height() - 40
      );

    if (Object.keys(fullChart5).length)
      fullChart5.setSize(
        $("#fulldiv5").width() - 40,
        $("#fulldiv5").height() - 40
      );

    if (Object.keys(fullChart6).length)
      fullChart6.setSize(
        $("#fulldiv6").width() - 40,
        $("#fulldiv6").height() - 40
      );

    if (Object.keys(fullChart7).length)
      fullChart7.setSize(
        $("#fulldiv7").width() - 40,
        $("#fulldiv7").height() - 40
      );

    if (Object.keys(fullChart8).length)
      fullChart8.setSize(
        $("#fulldiv8").width() - 40,
        $("#fulldiv8").height() - 40
      );

    if (Object.keys(fullChart9).length)
      fullChart9.setSize(
        $("#fulldiv9").width() - 40,
        $("#fulldiv9").height() - 40
      );

    if (Object.keys(fullChart10).length0)
      fullChart10.setSize(
        $("#fulldiv10").width() - 40,
        $("#fulldiv10").height() - 40
      );
  });

  // get theme
  var theme;
  $.getJSON("./theme.json", function (data) {
    var themes = data.theme;
    // console.log("themes:",themes);
    var cookieList = document.cookie.split("; ");
    var themeid,
      themeName = "themeid";
    cookieList.forEach((val) => {
      if (val.indexOf(themeName) === 0)
        themeid = val.substring(themeName.length + 1);
    });
    theme = themes[themeid];

    // set theme
    for (const [key, value] of Object.entries(theme.full)) {
      // console.log(`${key}: ${value}`);
      $(`#${key}`).css("border-color", `rgb(${value})`);
      $(`#${key}Check`).css("background-color", `rgba(${value},0.5)`);
      // $(`#${key}Check`).css("opacity", 0.5);
    }
  });

  drawFullChart0();

  drawFullChart1();

  drawFullChart2();

  drawFullChart3();

  drawFullChart4();

  drawFullChart5();

  drawFullChart6();

  drawFullChart7();

  drawFullChart8();

  drawFullChart9();

  drawFullChart10();

  drawFullChart11();

  var charts = [
      fullChart0,
      fullChart1,
      fullChart2,
      fullChart3,
      fullChart4,
      fullChart5,
      fullChart6,
      fullChart7,
      fullChart8,
      fullChart9,
      fullChart10,
    ],
    remove_id = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  // get charts initially displayed
  var cookieList = document.cookie.split("; ");
  var fullgazeType,
    fullgazeName = "full-gaze";
  cookieList.forEach((val) => {
    if (val.indexOf(fullgazeName) === 0)
      fullgazeType = val.substring(fullgazeName.length + 1);
  });
  if (fullgazeType === "area") {
    remove_id = remove_id.filter((d) => d !== 2);
  }
  if (fullgazeType === "thres") remove_id = remove_id.filter((d) => d !== 3);

  var fullconfusedType,
    fullconfusedName = "full-confused";
  cookieList.forEach((val) => {
    if (val.indexOf(fullconfusedName) === 0)
      fullconfusedType = val.substring(fullconfusedName.length + 1);
  });
  if (fullconfusedType === "area") remove_id = remove_id.filter((d) => d !== 4);
  if (fullconfusedType === "thres")
    remove_id = remove_id.filter((d) => d !== 5);

  var fullengType,
    fullengName = "full-eng";
  cookieList.forEach((val) => {
    if (val.indexOf(fullengName) === 0)
      fullengType = val.substring(fullengName.length + 1);
  });
  if (fullengType === "area") remove_id = remove_id.filter((d) => d !== 6);
  if (fullengType === "thres") remove_id = remove_id.filter((d) => d !== 7);
  if (fullengType === "border") remove_id = remove_id.filter((d) => d !== 8);

  var fullemotionType,
    fullemotionName = "full-emotion";
  cookieList.forEach((val) => {
    if (val.indexOf(fullemotionName) === 0)
      fullemotionType = val.substring(fullemotionName.length + 1);
  });
  if (fullemotionType === "area") remove_id = remove_id.filter((d) => d !== 9);
  if (fullemotionType === "line") remove_id = remove_id.filter((d) => d !== 10);
  if (fullemotionType === "heat") remove_id = remove_id.filter((d) => d !== 11);

  console.log(remove_id);
  remove_id.forEach((id) => {
    if (id == 11) {
      // hide card container
      $(`#fullchart${id.toString()}`).hide();
    } else {
      // remove highchart
      charts[id].destroy();
      console.log("remove", charts[id]);
    }
    // remove gridstack widget
    var el = grid
      .getGridItems()
      .filter((item) => item.id == `grid-stack-item-${id.toString()}`)[0];
    grid.removeWidget(el);

    $(`input#fullcheck${id}`).prop("checked", false);
  });

  grid.compact();
}

function handleUnloadFull() {
  localStorage.clear();
  // clearInterval(updateFullInterval);
  // no need to clear the interval cause all the timers got cleaned when the browser closed
}

function drawFullChart0() {
  // var categories = ["engagement", "emotion", "confusion", "gaze"];
  var img_path = [
    "https://i.ibb.co/h2PTxzp/Engagement.png",
    "https://i.ibb.co/VVtRXdb/Emotion.png",
    "https://i.ibb.co/0qJp4NK/Confused.png",
    "https://i.ibb.co/2NPbFBw/Gaze.png",
  ];
  fullChart0 = new Highcharts.chart("fullchart0", {
    credits: false,
    chart: {
      polar: true,
      width: $("#fulldiv0").width() - 40,
      height: $("#fulldiv0").height() - 40,
      reflow: true,
    },

    title: {
      text: "Overview",
    },

    pane: {
      startAngle: 0,
      endAngle: 360,
    },

    xAxis: {
      // type: categories,
      tickInterval: 90,
      min: 0,
      max: 360,
      labels: {
        formatter: function () {
          // return categories[this.value / 90];
          return `<span>   </span><img src="${
            img_path[this.value / 90]
          }" style="width:20px;height:20px;" />`;
        },
        useHTML: true,
        align: "center",
      },
    },

    yAxis: {
      min: 0,
    },

    plotOptions: {
      series: {
        pointStart: 0,
        pointInterval: 90,
      },
      area: {},
    },

    series: [
      {
        type: "area",
        name: "Average",
        data: [0, 0, 0, 0],
      },
      {
        type: "line",
        name: "Current",
        data: [0, 0, 0, 0],
      },
    ],
  });

  fullinterval0 = setInterval(function () {
    // calculate average
    var average = {
      engagement: 0,
      emotion: 0,
      confusion: 0,
      gaze: 0,
    };

    Object.keys(average).forEach((key) => {
      var list = localStorage.getItem(key);
      list_json = list ? JSON.parse(list) : [];
      list_json.forEach((d) => {
        average[key] += d[1];
      });
      average[key] /= list_json.length;
    });

    // console.log("average", average);

    if (fullChart0.series) {
      fullChart0.series[0].setData(Object.values(average));
      fullChart0.series[1].setData(Object.values(current));
    }
  }, 1000);
}

function drawFullChart1() {
  var img_path = [
    "https://i.ibb.co/7y9X07S/confusion.gif",
    "https://i.ibb.co/Kyvyw1L/drowsiness.gif",
    "https://i.ibb.co/zbPRnny/headnod.gif",
    "https://i.ibb.co/SsD93F1/headshake.gif",
    "https://i.ibb.co/dgq4SBp/smile.gif",
    "https://i.ibb.co/FhYGtCF/speaking.gif",
  ];
  fullChart1 = new Highcharts.Chart({
    credits: false,
    chart: {
      renderTo: "fullchart1",
      type: "bar",
      reflow: true,
      width: $("#fulldiv1").width() - 40,
      height: $("#fulldiv1").height() - 40,
      events: {
        load: function () {
          // set up the updating of the chart each second
          var series = this.series[0];
          fullinterval1 = setInterval(function () {
            series.setData(Object.values(trigger));
          }, 1000);
        },
      },
    },
    title: {
      text: "<img src='https://i.ibb.co/d6b8s7q/trigger.png' style='width:20px;height:20px'/><span>  Trigger</span>",
      useHTML: true,
    },
    xAxis: {
      categories: [0, 1, 2, 3, 4, 5],
      labels: {
        formatter: function () {
          return `<span>   </span><img src="${
            img_path[this.value]
          }" style="width:20px;height:20px;" />`;
        },
        useHTML: true,
        align: "center",
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: "number of people",
      },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: "bold",
          color: (Highcharts.theme && Highcharts.theme.textColor) || "gray",
        },
      },
    },
    legend: {
      enabled: false,
      // align: "right",
      // x: -100,
      // verticalAlign: "top",
      // y: 20,
      // floating: true,
      // backgroundColor:
      //   (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) ||
      //   "white",
      // borderColor: "#CCC",
      // borderWidth: 1,
      // shadow: false,
    },
    tooltip: {
      enabled: false,
      // formatter: function () {
      //   return (
      //     "<b>" +
      //     this.x +
      //     "</b><br/>" +
      //     this.series.name +
      //     ": " +
      //     Math.round(this.y) +
      //     "<br/>" +
      //     "Total: " +
      //     Math.round(this.point.stackTotal)
      //   );
      // },
    },
    plotOptions: {
      bar: {
        // stacking: "normal",
        dataLabels: {
          enabled: true,
          // color:
          //   (Highcharts.theme && Highcharts.theme.dataLabelsColor) || "white",
        },
      },
    },
    series: [
      {
        name: "",
        data: [5, 3, 4, 7, 2, 9],
      },
    ],
  });
}

function drawFullChart2() {
  // gaze area
  var startTime = new Date().getTime();
  fullChart2 = Highcharts.chart("fullchart2", {
    credits: false,
    chart: {
      type: "area",
      width: $("#fulldiv2").width() - 40,
      height: $("#fulldiv2").height() - 40,
    },

    title: {
      text: "<img src='https://i.ibb.co/2NPbFBw/Gaze.png' style='width:20px;height:20px'/><span>  Gaze</span>",
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
      min: start_time,
      tickPixelInterval: 100,
      // tickPositioner: function () {
      //   date = new Date(this.dataMin);
      //   hour = date.getHours().toString();
      //   min = date.getMinutes().toString();
      //   time = hour + ":" + min;
      //   console.log(typeof hour, new Date(this.dataMin).getMinutes());

      //   return ["time", this.dataMax];
      // },
      // min: 1625842192120,
    },

    series: [
      {
        lineWidth: 0.5,
        name: "Average level",
      },
    ],
  });

  fullinterval2 = setInterval(function () {
    if (fullChart2.series) {
      var list = localStorage.getItem("gaze");
      var list_json = list ? JSON.parse(list) : [];
      fullChart2.series[0].setData(list_json);
    }
  }, 1000);
}

function drawFullChart3() {
  // gaze area neg
  fullChart3 = Highcharts.chart("fullchart3", {
    credits: false,
    chart: {
      type: "area",
      width: $("#fulldiv3").width() - 40,
      height: $("#fulldiv3").height() - 40,
    },

    title: {
      text: "<img src='https://i.ibb.co/2NPbFBw/Gaze.png' style='width:20px;height:20px'/><span>  Gaze</span>",
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

    plotOptions: {
      series: {
        threshold: 0.4,
      },
    },

    series: [
      {
        lineWidth: 0.5,
        name: "Average level",
        data: [
          [start_time, 1],
          [start_time + 300000, 0.5],
        ],
      },
    ],
  });

  fullinterval3 = setInterval(function () {
    if (fullChart3.series) {
      var list = localStorage.getItem("gaze");
      var list_json = list ? JSON.parse(list) : [];
      fullChart3.series[0].setData(list_json);

      // fullChart3.xAxis[0].addPlotBand(plotBands[0]);
    }
  }, 1000);
}

function drawFullChart4() {
  // confusion area
  var startTime = new Date().getTime();
  fullChart4 = Highcharts.chart("fullchart4", {
    credits: false,
    chart: {
      type: "area",
      width: $("#fulldiv4").width() - 40,
      height: $("#fulldiv4").height() - 40,
    },

    title: {
      text: "<img src='https://i.ibb.co/0qJp4NK/Confused.png' style='width:20px;height:20px'/><span>  Confusion</span>",
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
      min: startTime,
      tickPixelInterval: 100,
      // tickPositioner: function () {
      //   date = new Date(this.dataMin);
      //   hour = date.getHours().toString();
      //   min = date.getMinutes().toString();
      //   time = hour + ":" + min;
      //   console.log(typeof hour, new Date(this.dataMin).getMinutes());

      //   return ["time", this.dataMax];
      // },
      // min: 1625842192120,
    },

    series: [
      {
        lineWidth: 0.5,
        name: "Average level",
      },
    ],
  });

  fullinterval4 = setInterval(function () {
    if (fullChart4.series) {
      var list = localStorage.getItem("confusion");
      var list_json = list ? JSON.parse(list) : [];
      fullChart4.series[0].setData(list_json);
    }
  }, 1000);
}

function drawFullChart5() {
  // confusion area neg
  var startTime = new Date().getTime();
  var threshold = 0.4;
  fullChart5 = Highcharts.chart("fullchart5", {
    credits: false,
    chart: {
      type: "area",
      width: $("#fulldiv5").width() - 40,
      height: $("#fulldiv5").height() - 40,
    },

    title: {
      text: "<img src='https://i.ibb.co/0qJp4NK/Confused.png' style='width:20px;height:20px'/><span>  Confusion</span>",
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
      min: startTime,
      // min: 1625842192120,
      plotBands: [
        {
          from: startTime,
          to: startTime + 10000,
          color: "rgba(68, 170, 213, .2)",
        },
        {
          from: startTime + 20000,
          to: startTime + 25000,
          color: "rgba(68, 170, 213, .2)",
        },
        {
          from: startTime + 30000,
          to: startTime + 40000,
          color: "rgba(68, 170, 213, .2)",
        },
        {
          from: startTime + 50000,
          to: startTime + 60000,
          color: "rgba(68, 170, 213, .2)",
        },
      ],
    },

    plotOptions: {
      series: {
        threshold: 0.4,
      },
    },

    series: [
      {
        lineWidth: 0.5,
        name: "Average level",
      },
    ],
  });

  fullinterval5 = setInterval(function () {
    if (fullChart5.series) {
      var list = localStorage.getItem("confusion");
      var list_json = list ? JSON.parse(list) : [];
      fullChart5.series[0].setData(list_json);
      // fullChart5.xAxis[0].addPlotBand(plotBands[0]);
    }
  }, 1000);
}

function drawFullChart6() {
  // eng area
  var startTime = new Date().getTime();
  fullChart6 = Highcharts.chart("fullchart6", {
    credits: false,
    chart: {
      type: "area",
      width: $("#fulldiv6").width() - 40,
      height: $("#fulldiv6").height() - 40,
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
      min: startTime,
      tickPixelInterval: 100,
      // tickPositioner: function () {
      //   date = new Date(this.dataMin);
      //   hour = date.getHours().toString();
      //   min = date.getMinutes().toString();
      //   time = hour + ":" + min;
      //   console.log(typeof hour, new Date(this.dataMin).getMinutes());

      //   return ["time", this.dataMax];
      // },
      // min: 1625842192120,
    },

    series: [
      {
        lineWidth: 0.5,
        name: "Average level",
      },
    ],
  });

  fullinterval6 = setInterval(function () {
    if (fullChart6.series) {
      var list = localStorage.getItem("engagement");
      var list_json = list ? JSON.parse(list) : [];
      fullChart6.series[0].setData(list_json);
    }
  }, 1000);
}

function drawFullChart7() {
  // eng area neg
  var startTime = new Date().getTime();
  var threshold = 0.4;
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
      min: startTime,
      // min: 1625842192120,
      plotBands: [
        {
          from: startTime,
          to: startTime + 10000,
          color: "rgba(68, 170, 213, .2)",
        },
        {
          from: startTime + 20000,
          to: startTime + 25000,
          color: "rgba(68, 170, 213, .2)",
        },
        {
          from: startTime + 30000,
          to: startTime + 40000,
          color: "rgba(68, 170, 213, .2)",
        },
        {
          from: startTime + 50000,
          to: startTime + 60000,
          color: "rgba(68, 170, 213, .2)",
        },
      ],
    },

    plotOptions: {
      series: {
        threshold: 0.4,
      },
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

function drawFullChart8() {
  // eng area border
  var startTime = new Date().getTime();
  fullChart8 = Highcharts.chart("fullchart8", {
    credits: false,
    chart: {
      // type: "area",
      width: $("#fulldiv8").width() - 40,
      height: $("#fulldiv8").height() - 40,
    },

    title: {
      text: "<img src='https://i.ibb.co/h2PTxzp/Engagement.png' style='width:20px;height:20px'/><span>  Engagement</span>",
      useHTML: true,
    },

    subtitle: {
      text: "Historical data (updata per second)",
    },

    tooltip: {
      // valueDecimals: 2,
      // useHTML: true,
      // formatter: function () {
      //   return `<div style="min-height: 120px;">
      //   <img src="https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/article_thumbnails/other/dog_cool_summer_slideshow/1800x1200_dog_cool_summer_other.jpg" width="150"/>
      //   <br />► ${this.series.name}: ${this.point.y.toFixed(2)}<br /></div>`;
      // },
      crosshairs: true,
      shared: true,
    },

    legend: {
      enabled: false,
    },

    xAxis: {
      type: "datetime",
      // tickInterval: 10,
      min: startTime,
      tickPixelInterval: 100,
      // min: 1625842192120,
    },

    series: [
      {
        name: "Engagement",
        data: [],
        zIndex: 1,
        marker: {
          fillColor: "white",
          lineWidth: 2,
          lineColor: Highcharts.getOptions().colors[0],
        },
      },
      {
        name: "Range",
        data: [],
        type: "arearange",
        lineWidth: 0,
        linkedTo: ":previous",
        color: Highcharts.getOptions().colors[0],
        fillOpacity: 0.3,
        zIndex: 0,
        marker: {
          enabled: false,
        },
      },
    ],
  });

  fullinterval8 = setInterval(function () {
    if (fullChart8.series) {
      var list = localStorage.getItem("engagement");
      var list_json = list ? JSON.parse(list) : [];
      fullChart8.series[0].setData(list_json);
      var range_list = localStorage.getItem("eng_range");
      var range_list_json = range_list ? JSON.parse(range_list) : [];
      fullChart8.series[1].setData(range_list_json);
    }
  }, 1000);
}

function drawFullChart9() {
  var startTime = new Date().getTime();
  fullChart9 = Highcharts.chart("fullchart9", {
    credits: false,
    chart: {
      type: "area",
      width: $("#fulldiv9").width() - 40,
      height: $("#fulldiv9").height() - 40,
    },

    title: {
      text: "<img src='https://i.ibb.co/VVtRXdb/Emotion.png' style='width:20px;height:20px'/><span>  Emotion</span>",
      useHTML: true,
    },

    subtitle: {
      text: "Historical data (updata per second)",
    },

    // tooltip: {
    //   valueDecimals: 2,
    //   useHTML: true,
    //   formatter: function () {
    //     return `<div style="min-height: 120px;">
    //     <img src="https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/article_thumbnails/other/dog_cool_summer_slideshow/1800x1200_dog_cool_summer_other.jpg" width="150"/>
    //     <br />► ${this.series.name}: ${this.point.y.toFixed(2)}<br /></div>`;
    //   },
    // },

    legend: {
      enabled: true,
    },

    xAxis: {
      type: "datetime",
      // tickInterval: 10,
      format: "{value}",
      tickPixelInterval: 100,
      // min: startTime,
      // min: 1625842192120,
    },

    yAxis: {
      labels: {
        format: "{value}%",
      },
      title: {
        enabled: false,
      },
    },

    plotOptions: {
      area: {
        stacking: "percent",
        lineColor: "#ffffff",
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: "#ffffff",
        },
        accessibility: {
          pointDescriptionFormatter: function (point) {
            function round(x) {
              return Math.round(x * 100) / 100;
            }
            return (
              point.index +
              1 +
              ", " +
              point.category +
              ", " +
              point.y +
              " people, " +
              round(point.percentage) +
              "%, " +
              point.series.name
            );
          },
        },
      },
    },

    series: [
      {
        name: "Neutral",
        data: [502, 635, 809, 947, 1402, 3634, 5268],
      },
      {
        name: "Excited",
        data: [106, 107, 111, 133, 221, 767, 1766],
      },
      {
        name: "Relaxed",
        data: [163, 203, 276, 408, 547, 729, 628],
      },
      {
        name: "Bored",
        data: [18, 31, 54, 156, 339, 818, 1201],
      },
      {
        name: "Anxious",
        data: [2, 2, 2, 6, 13, 30, 46],
      },
    ],
  });

  fullinterval9 = setInterval(function () {
    if (fullChart9.series) {
      const categories = [
        "neutral",
        "upperRight",
        "lowerRight",
        "lowerLeft",
        "upperLeft",
      ];
      categories.forEach((d, i) => {
        var list = localStorage.getItem(d);
        var list_json = list ? JSON.parse(list) : [];
        fullChart9.series[i].setData(list_json);
      });
    }
  }, 1000);
}

function drawFullChart10() {
  var startTime = new Date().getTime();
  fullChart10 = Highcharts.chart("fullchart10", {
    credits: false,
    chart: {
      width: $("#fulldiv10").width() - 40,
      height: $("#fulldiv10").height() - 40,
    },

    title: {
      text: "<img src='https://i.ibb.co/VVtRXdb/Emotion.png' style='width:20px;height:20px'/><span>  Emotion</span>",
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
      min: startTime,
      tickPixelInterval: 100,
      // min: 1625842192120,
    },

    series: [
      {
        lineWidth: 0.5,
        name: "Valence",
      },
      {
        lineWidth: 0.5,
        name: "Arousal",
      },
    ],
  });

  fullinterval10 = setInterval(function () {
    if (fullChart10.series) {
      ["valence", "arousal"].forEach((d, i) => {
        var list = localStorage.getItem(d);
        var list_json = list ? JSON.parse(list) : [];
        fullChart10.series[i].setData(list_json);
      });
    }
  }, 1000);
}

function drawFullChart11() {
  // minimal heatmap instance configuration
  heatmapInstance = h337.create({
    // only container is required, the rest will be defaults
    container: document.getElementById("heatmap_container"),
    maxOpacity: 0.6,
    minOpacity: 0,
    blur: 0.5,
  });

  // now generate some random data
  var points = [];
  var max = total_ppl;
  var width = $("#heatmap_container").width();
  var height = 300;
  var len = 10;

  // while (len--) {
  //   var val = Math.floor(Math.random() * 100);
  //   max = Math.max(max, val);
  //   var point = {
  //     x: Math.floor(Math.random() * width),
  //     y: Math.floor(Math.random() * height),
  //     // x: 100 + Math.floor(Math.random() * 10),
  //     // y: 100 + Math.floor(Math.random() * 10),
  //     value: val,
  //   };
  //   points.push(point);
  // }
  // heatmap data format
  var data = {
    max: total_ppl,
    data: [{ x: 0, y: 0, value: 0 }],
  };
  // if you have a set of datapoints always use setData instead of addData
  // for data initialization
  heatmapInstance.setData(data);

  // add data
  setInterval(function () {
    // get history valence and arousal from localStorage (non-normalized)
    var point = {
      valence: 0,
      arousal: 0,
    };
    // Object.keys(point).forEach((key) => {
    //   var list = localStorage.getItem(key);
    //   list_json = list ? JSON.parse(list) : [];
    //   list_json.map((d) => d[1]).forEach((i) => (point[key] += (i + 1) / 2)); // sum of history data
    //   console.log("sum", point[key]);
    //   point[key] /= list_json.length; // average over time
    //   console.log("average", point[key]);
    //   point[key] *= 300; // scale up
    // });
    points = current_heatpos.map((d) => {
      x = ((d[0] + 1) / 2) * width;
      y = ((-d[1] + 1) / 2) * width;
      return { x, y, value: 10 };
    });

    // var datapoint = {
    //   x: point["valence"],
    //   y: point["arousal"],
    //   value: 10,
    // };
    // console.log("points", points);
    heatmapInstance.addData(points);
    max += 5;
    heatmapInstance.setDataMax(max);
  }, 1000);
}

const containers = [
  "fullchart0",
  "fullchart1",
  "fullchart2",
  "fullchart3",
  "fullchart4",
  "fullchart5",
  "fullchart6",
  "fullchart7",
  "fullchart8",
  "fullchart9",
  "fullchart10",
  "fullchart11",
];

function handleHighlight(container) {
  containers.forEach((item) => {
    if (item != container) $("#" + item).css("opacity", "0.5");
    else {
      // $("#" + item).css("border-color", "orange");
      $("#" + item).css("border-width", "4");
    }
  });
}

function handleUndoHighlight(container) {
  containers.forEach((item) => {
    if (item != container) $("#" + item).css("opacity", "1");
    else {
      // $("#" + item).css("border-color", "");
      $("#" + item).css("border-width", "2");
    }
  });
}

function handleDisplayFull(id) {
  const charts = [
      fullChart0,
      fullChart1,
      fullChart2,
      fullChart3,
      fullChart4,
      fullChart5,
      fullChart6,
      fullChart7,
      fullChart8,
      fullChart9,
      fullChart10,
    ],
    grid = document.querySelector(".grid-stack").gridstack;

  if ($(`#fullcheck${id.toString()}`)[0].checked) {
    if (id == 11) {
      grid.addWidget(
        `<div class="grid-stack-item" id="grid-stack-item-${id.toString()}" gs-w="3" gs-h="3">
          <div class="grid-stack-item-content" id="fulldiv${id.toString()}">
            <div class="card" id="fullchart${id.toString()}" style="justify-items: center; align-items:center;margin:5px 0px 5px 0px; padding: 15px;">
              <p id="heatmap_title" style="font-size: 17px; text-align: center; padding: 5px;">Emotion Heatmap  
              <div id="heatmap_container" style="width:200px; height:200px;">
                            <img src="./emo_heatmap.png" id="heatmap_img"
                                style="width:200px; height:200px;z-index: 999;" />
              </div>
            </div>
          </div>
        </div>`
      );
      drawFullChart11();
    } else {
      grid.addWidget(
        `<div class="grid-stack-item" id="grid-stack-item-${id.toString()}" gs-w="5" gs-h="3">
        <div class="grid-stack-item-content" id="fulldiv${id.toString()}">
          <div class="card" id="fullchart${id.toString()}" style="margin:5px 0px 5px 0px; padding: 15px;">
          </div>
        </div>
      </div>`
      );

      if (id == 0) {
        clearInterval(fullinterval0);
        drawFullChart0();
      } else if (id == 1) {
        clearInterval(fullinterval1);
        drawFullChart1();
      } else if (id == 2) {
        clearInterval(fullinterval2);
        drawFullChart2();
      } else if (id == 3) {
        clearInterval(fullinterval3);
        drawFullChart3();
      } else if (id == 4) {
        clearInterval(fullinterval4);
        drawFullChart4();
      } else if (id == 5) {
        clearInterval(fullinterval5);
        drawFullChart5();
      } else if (id == 6) {
        clearInterval(fullinterval6);
        drawFullChart6();
      } else if (id == 7) {
        clearInterval(fullinterval7);
        drawFullChart7();
      } else if (id == 8) {
        clearInterval(fullinterval8);
        drawFullChart8();
      } else if (id == 9) {
        clearInterval(fullinterval9);
        drawFullChart9();
      } else if (id == 10) {
        clearInterval(fullinterval10);
        drawFullChart10();
      }
    }

    // get theme
    var theme;
    $.getJSON("./theme.json", function (data) {
      var themes = data.theme;
      // console.log("themes:",themes);
      var cookieList = document.cookie.split("; ");
      var themeid,
        themeName = "themeid";
      cookieList.forEach((val) => {
        if (val.indexOf(themeName) === 0)
          themeid = val.substring(themeName.length + 1);
      });
      theme = themes[themeid];

      // set theme
      for (const [key, value] of Object.entries(theme.full)) {
        console.log(`${key}: ${value}`);
        $(`#${key}`).css("border-color", `rgb(${value})`);
        // $(`#${key}Check`).css("background-color", `rgba(${value},0.5)`);
        // $(`#${key}Check`).css("opacity", 0.5);
      }
    });
  } else {
    if (id == 11) {
      // hide card container
      $(`#fullchart${id.toString()}`).hide();
    } else {
      // remove highchart
      charts[id].destroy();
      console.log("remove", charts[id]);
    }

    // remove gridstack widget
    var el = grid
      .getGridItems()
      .filter((item) => item.id == `grid-stack-item-${id.toString()}`)[0];
    grid.removeWidget(el);
  }
  grid.compact();
}

function handleFullThresholdChange(id) {
  var charts = { 3: fullChart3, 5: fullChart5, 7: fullChart7 };
  const threshold = $(`#full-threshold${id}`)[0].value / 10;
  $(`#full-threshold${id}-text`).html("> " + threshold);
  charts[id].update({
    plotOptions: {
      series: {
        threshold: threshold,
      },
    },
  });
}

// function drawFullChart2() {
//   // categories
//   var categories = ["whether in/out of slides", "whether in/out of screen"];
//   fullChart2 = Highcharts.chart("fullchart2", {
//     credits: false,
//     chart: {
//       type: "bar",
//       events: {
//         load: function () {
//           // set up the updating of the chart each second
//           var series = this.series[0];
//           // console.log(series);
//           fullinterval2 = setInterval(function () {
//             var data = [];
//             data.push([
//               //   Math.round(Math.random() * 100),
//               Math.round(Math.random() * 100),
//             ]);
//             data.push(["In screen", Math.round(Math.random() * 100)]);
//             series.setData(data);
//           }, 2000);
//         },
//       },
//     },
//     title: {
//       text: "Eye Gaze Focusing",
//     },
//     accessibility: {
//       point: {
//         valueDescriptionFormat: "{index}. {xDescription}, {value}%.",
//       },
//     },
//     xAxis: [
//       {
//         categories: categories,
//         reversed: false,
//         labels: {
//           step: 1,
//         },
//         accessibility: {
//           description: "Age (male)",
//         },
//       },
//       {
//         // mirror axis on right side
//         opposite: true,
//         reversed: false,
//         categories: categories,
//         linkedTo: 0,
//         labels: {
//           step: 1,
//         },
//         accessibility: {
//           description: "Age (female)",
//         },
//       },
//     ],
//     yAxis: {
//       title: {
//         text: null,
//       },
//       labels: {
//         formatter: function () {
//           return Math.abs(this.value) + "%";
//         },
//       },
//       accessibility: {
//         description: "Percentage population",
//         rangeDescription: "Range: 0 to 5%",
//       },
//     },

//     plotOptions: {
//       series: {
//         stacking: "normal",
//       },
//     },

//     tooltip: {
//       formatter: function () {
//         // console.log(this);
//         return (
//           "<b>" +
//           this.series.name +
//           "</b><br/>" +
//           "Population: " +
//           Highcharts.numberFormat(Math.abs(this.point.y), 1) +
//           "%"
//         );
//       },
//     },

//     series: [
//       {
//         name: "In Screen",
//         data: [60, 90],
//       },
//       {
//         name: "Out of Screen",
//         data: [-23, -12],
//       },
//     ],
//   });
// }

// function drawFullChart3() {
//   fullChart3 = Highcharts.chart("fullchart3", {
//     credits: false,
//     chart: {
//       type: "spline",
//       animation: Highcharts.svg, // don't animate in old IE
//       marginRight: 10,
//       events: {
//         load: function () {
//           // set up the updating of the chart each second
//           var series = this.series[0];
//           fullinterval3 = setInterval(function () {
//             // var x = new Date().getTime(),
//             //   engagement = 0; // current time
//             // $.ajax({
//             //   url: "http://49.232.60.34:5000/get_class_information",
//             //   type: "GET",
//             //   async: false,
//             //   success: function (res) {
//             //     console.log("getting data from backend");
//             //     data = JSON.parse(res);
//             //     data.forEach((d) => {
//             //       engagement += parseFloat(d.engagement);
//             //     });
//             //     engagement /= data.length;
//             //     console.log("ajax success engagement:", engagement);
//             //     // localStorage.clear();
//             //     var eng_list = localStorage.getItem("engagement");
//             //     var time = new Date().getTime();
//             //     if (eng_list) {
//             //       var eng_list_obj = JSON.parse(eng_list);
//             //       eng_list_obj.push({ time, engagement });
//             //     } else {
//             //       var eng_list_obj = [{ time, engagement }];
//             //     }
//             //     console.log(eng_list_obj);
//             //     eng_list = JSON.stringify(eng_list_obj);
//             //     localStorage.setItem("engagement", eng_list);
//             //     console.log("localstorage:", localStorage);
//             //   },
//             // }).done(function () {
//             //   console.log("ajax done");
//             // });
//             // var eng = doAjax("http://49.232.60.34:5000/get_class_information");
//             // console.log("doajax:", eng);
//             // console.log("engagement:", engagement);
//             // series.addPoint([x, engagement], true, true);
//           }, 1000);
//         },
//       },
//     },

//     time: {
//       useUTC: false,
//     },

//     title: {
//       text: "Live random data",
//     },

//     accessibility: {
//       announceNewData: {
//         enabled: true,
//         minAnnounceInterval: 15000,
//         announcementFormatter: function (allSeries, newSeries, newPoint) {
//           if (newPoint) {
//             return "New point added. Value: " + newPoint.y;
//           }
//           return false;
//         },
//       },
//     },

//     xAxis: {
//       type: "datetime",
//       tickPixelInterval: 150,
//     },

//     yAxis: {
//       title: {
//         text: "Value",
//       },
//       plotLines: [
//         {
//           value: 0,
//           width: 1,
//           color: "#808080",
//         },
//       ],
//     },

//     tooltip: {
//       headerFormat: "<b>{series.name}</b><br/>",
//       pointFormat: "{point.x:%Y-%m-%d %H:%M:%S}<br/>{point.y:.2f}",
//     },

//     legend: {
//       enabled: false,
//     },

//     exporting: {
//       enabled: false,
//     },

//     series: [
//       {
//         name: "Random data",
//         data: (function () {
//           // generate an array of random data
//           var data = [],
//             time = new Date().getTime(),
//             i;

//           for (i = -19; i <= 0; i += 1) {
//             data.push({
//               x: time + i * 1000,
//               y: Math.random(),
//             });
//           }
//           return data;
//         })(),
//       },
//     ],
//   });

//   setInterval(() => {}, 1000);
// }
