var trigger = {
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
  emotionChartData = {
    negative: 0,
    neutral: 0,
    positive: 0,
  },
  slides = [],
  total_ppl = 0,
  emojiData = {
    total_ppl: 0,
    max_value: 0,
    max_key: "",
  },
  emotion = {
    x: [],
    y: [],
  };

function ToDefaultView() {
  console.log("to default view...");

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({ time: time(), action: "to_default" });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);

  // set default width as 1/10 screen width
  //   console.log(screen.width);
  //   var width = (1 / 10) * screen.width;
  // $("#fullchart1").hide();
  // $("#fullchart2").hide();
  // $("#fullchart3").hide();
  // $("#default2").show();
  // $("#default3").show();
  // $("#default1").show();

  window.close();
  defaultWindow = window.open("default.html", "", "width=100,height=100");
  console.log((1 / 20) * screen.width);
  defaultWindow.resizeTo((1 / 10) * screen.width, screen.height);
  defaultWindow.moveTo(screen.width, 0);
}

function handleUnloadDashboard() {
  console.log("unload dashboard...");
}

function ToFullView(rate) {
  console.log("to full view...");

  // click on full view without setting the rate
  if (!rate) {
    // get the rate from cookie
    var cookieList = document.cookie.split("; ");
    var name = "fullsize";
    cookieList.forEach((val) => {
      if (val.indexOf(name) === 0) rate = val.substring(name.length + 1);
    });
    // if no rate info in cookie, initialize it
    if (!rate) rate = 1;
  }
  // click on full view with setting the rate
  else {
    // update the rate in cookie
    document.cookie = "fullsize=" + rate;
  }

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({ time: time(), action: "to_full", size: rate });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);

  window.close();
  fullWindow = window.open("full.html", "", "width=100,height=100");
  console.log(screen.width);
  fullWindow.resizeTo(rate * screen.width, screen.height);
  fullWindow.moveTo(screen.width, 0);
}

function ToDashboard() {
  console.log("to dashboard...");

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({ time: time(), action: "to_dashboard" });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);

  window.close();
  dashboard = window.open("index.html", "", "width=100,height=100");
  dashboard.resizeTo(screen.width, screen.height);
  dashboard.moveTo(0, 0);
}

function handleWindowResize() {
  console.log(window.innerWidth);
  // console.log("charts:", Highcharts.charts);
  var width = window.innerWidth - 25;
  $("#defaultchart2").css("width", width);
  // $("#defaultchart2").css("height", width + 50);
  $("#defaultchart3").css("width", width);
  $("#defaultchart4").css("width", width);
  // $("#defaultchart3").css("height", width + 50);
  $("#defaultchart1").css("width", width);
  // $("#defaultchart1").css("height", 100);
  $("#defaultTrigger").css("width", width);
  $("#threshold").css("width", width - 50);

  // $("#fullchart1").css("width", width);
  // $("#fullchart2").css("width", width);
  // $("#fullchart3").css("width", width);
}

function getServerData(update, alert, theme = null) {
  /*
  valence = -0.2;
  arousal = -0.21;


  if (valence !== 0) {
    if (valence < 0) {
      angle = Math.atan(arousal / valence) + Math.PI;
    } else {
      if (arousal > 0) {
        angle = Math.atan(arousal / valence);
      } else {
        angle = Math.atan(arousal / valence) + Math.PI * 2;
      }
    }
    if (Math.abs(valence) >= Math.abs(arousal)) {
      index = Math.abs(Math.cos(angle));
    } else {
      index = Math.abs(Math.sin(angle));
    }
  } else if (arousal >= 0) {
    angle = Math.PI / 2;
  } else {
    angle = (Math.PI * 3) / 2;
  }

  if (
    // Math.abs(a[i] * index) < 1 / 3 && Math.abs(b[i] * index) < 1 / 3 (if the point is in the middle with a radius of 1/3)
    Math.abs(valence)<=0.1
    ) {
    order = 4;
  } else {
    //var order = Math.floor(angle / (Math.PI / 2));
    var order = Math.floor(angle / (Math.PI / 4));

  }



  console.log(angle);
  console.log(order);
  */

  var cur_time = new Date().getTime() + 8 * 3600 * 1000,
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
  emotionChartData = { negative: 1, positive: 1, neutral: 1 };

  $.ajax({
    url: "https://shuaima.cc:5000/get_class_information_real",
    type: "GET",
    // async: false,
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
        confusion: [],
        gaze: [],
        valence: [],
        arousal: [],
        drowsiness: [],
        headnod: [],
        headshake: [],
        smile: [],
        speaking: [],
      };

      for (const [key, value] of Object.entries(total)) {
        if (key == "emotion") {
          data.forEach((d) => {
            new_log["valence"].push(d[key].split(" ")[0]);
            new_log["arousal"].push(d[key].split(" ")[1]);

            total[key] += parseFloat(d[key].split(" ")[0]);
            var x = parseFloat(d[key].split(" ")[0]),
              y = parseFloat(d[key].split(" ")[1]);
            if (x > 0.1 && y > 0.1) {
              cur_emo_percentage.upperRight += 1;
              emotionChartData.positive += 1;
            } else if (x > 0.1 && y < -0.1) {
              cur_emo_percentage.lowerRight += 1;
              emotionChartData.positive += 1;
            } else if (x < -0.1 && y < -0.1) {
              cur_emo_percentage.lowerLeft += 1;
              emotionChartData.negative += 1;
            } else if (x < -0.1 && y > 0.1) {
              cur_emo_percentage.upperLeft += 1;
              emotionChartData.negative += 1;
            } else {
              cur_emo_percentage.neutral += 1;
              emotionChartData.neutral += 1;
            }
            cur_emo_line.valence += x;
            cur_emo_line.arousal += y;
            heatpos.push([x, y]);
          });
        } else if (key == "engagement") {
          data.forEach((d) => {
            eng.push(parseFloat(d[key]));
            new_log[key].push(d[key]);
            total[key] += parseFloat(d[key]);
          });
        } else {
          data.forEach((d) => {
            total[key] += parseFloat(d[key]);
            if (Object.keys(new_log).indexOf(key) >= 0)
              new_log[key].push(d[key]);
          });
        }
      }
      // pass new heat pos info to add points on heatmap
      current_heatpos = heatpos;

      // get sum data for trigger
      Object.keys(trigger).forEach((key) => (trigger[key] = total[key]));
      console.log("trigger", trigger);
      // for default view
      emojiData.total_ppl = total_ppl;
      // get max value
      emojiData.max_value = Math.max(...Object.values(trigger));
      // find corresponding key
      emojiData.max_key = Object.keys(trigger).find(
        (key) => trigger[key] == emojiData.max_value
      );

      // get average data for radar overview
      Object.keys(current).forEach((key) => {
        if (key == "emotion") {
          current[key] = (current[key] + 1) / 2;
        } else {
          current[key] = total[key] / data.length;
        }
      });
      console.log("current", current); // for radar chart
      // store data for default view
      chartData = {
        confusion: current.confusion,
        engagement: current.engagement,
        gaze: current.gaze,
      };

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
          list_json.push([cur_time, Math.min(...eng), Math.max(...eng)]);
        else list_json.push([cur_time, current[d]]);
        list = JSON.stringify(list_json);
        localStorage.setItem(d, list);
      });
      // store 5 categories for emotion percentage chart
      Object.keys(cur_emo_percentage).forEach((key) => {
        var list = localStorage.getItem(key);
        list_json = list ? JSON.parse(list) : [];
        list_json.push([cur_time, cur_emo_percentage[key]]);
        list = JSON.stringify(list_json);
        localStorage.setItem(key, list);
      });
      // valence and arousal (non-normalized)
      Object.keys(cur_emo_line).forEach((key) => {
        var list = localStorage.getItem(key);
        list_json = list ? JSON.parse(list) : [];
        list_json.push([cur_time, cur_emo_line[key] / data.length]);
        new_log[key] = cur_emo_line[key] / data.length;
        list = JSON.stringify(list_json);
        localStorage.setItem(key, list);
      });

      var slide_num = data[0]["slides_num"];
      // console.log(slide_num);
      var list = localStorage.getItem("slides_num_time");
      slides_num_time = list ? JSON.parse(list) : {};
      slides_num_time[cur_time] = slide_num;
      list = JSON.stringify(slides_num_time);
      localStorage.setItem("slides_num_time", list);

      var list = localStorage.getItem("slides");
      slides = list ? JSON.parse(list) : [];
      if (slides.length === 0 || slides[slides.length - 1][0] !== slide_num)
        slides.push([slide_num, cur_time]);
      list = JSON.stringify(slides);
      localStorage.setItem("slides", list);

      // calculate average for log
      for (const [key, value] of Object.entries(new_log)) {
        if (key !== "time" && key !== "valence" && key !== "arousal") {
          let sum = value.reduce(function (a, b) {
            return parseFloat(a) + parseFloat(b);
          }, 0);
          new_log[key].push(sum / value.length);
          new_log[key] = total[key] / data.length;
        }
      }
      students_log.push(new_log);
      localStorage.setItem("students_log", JSON.stringify(students_log));

      // update slide for full view
      if (update) updateSlides(slides);

      // store current data for default view
      var name = "emotion";
      var x = [],
        y = [];
      data.forEach((d) => {
        x.push(parseFloat(d[name].split(" ")[0]));
        y.push(parseFloat(d[name].split(" ")[1]));
      });
      console.log("emotion", emotion);
      emotion = { x, y };

      if (alert) checkAlert(theme);

      console.log("localstorage:", localStorage);
    },
  }).done(function () {
    console.log("ajax done");
  });
}

function loadWindow() {
  setInterval(getServerData, 5000, false, false);

  // update default chart type status
  var cookieList = document.cookie.split("; ");
  console.log("on load window cookie", cookieList);

  var gazeChartType,
    gazeChartName = "gazecharttype";
  cookieList.forEach((val) => {
    if (val.indexOf(gazeChartName) === 0)
      gazeChartType = val.substring(gazeChartName.length + 1);
  });
  $("input[name='gazeradio'][value=" + gazeChartType + "]").prop(
    "checked",
    true
  );

  var engageChartType,
    engageChartName = "engagecharttype";
  cookieList.forEach((val) => {
    if (val.indexOf(engageChartName) === 0)
      engageChartType = val.substring(engageChartName.length + 1);
  });
  $("input[name='engageradio'][value=" + engageChartType + "]").prop(
    "checked",
    true
  );

  var confusedChartType,
    confusedChartName = "confusedcharttype";
  cookieList.forEach((val) => {
    if (val.indexOf(confusedChartName) === 0)
      confusedChartType = val.substring(confusedChartName.length + 1);
  });
  $("input[name='confusedradio'][value=" + confusedChartType + "]").prop(
    "checked",
    true
  );

  var emotionChartType,
    emotionChartName = "emotioncharttype";
  cookieList.forEach((val) => {
    if (val.indexOf(emotionChartName) === 0)
      emotionChartType = val.substring(emotionChartName.length + 1);
  });
  $("input[name='emotionradio'][value=" + emotionChartType + "]").prop(
    "checked",
    true
  );

  // update theme status
  var themeid,
    themeName = "themeid";
  cookieList.forEach((val) => {
    if (val.indexOf(themeName) === 0)
      themeid = val.substring(themeName.length + 1);
  });
  $("input[name='themeradio'][value=" + themeid + "]").prop("checked", true);

  // update threshold
  var gazeThresh,
    gazeThreshName = "gazethresh";
  cookieList.forEach((val) => {
    if (val.indexOf(gazeThreshName) === 0)
      gazeThresh = val.substring(gazeThreshName.length + 1);
  });
  $("#" + gazeThreshName).attr("value", gazeThresh);
  $(`#${gazeThreshName}text`).html("< " + gazeThresh + "%");

  var conThresh,
    conThreshName = "conthresh";
  cookieList.forEach((val) => {
    if (val.indexOf(conThreshName) === 0)
      conThresh = val.substring(conThreshName.length + 1);
  });
  $("#" + conThreshName).attr("value", conThresh);
  $(`#${conThreshName}text`).html("> " + conThresh + "%");

  var engThresh,
    engThreshName = "engthresh";
  cookieList.forEach((val) => {
    if (val.indexOf(engThreshName) === 0)
      engThresh = val.substring(engThreshName.length + 1);
  });
  $("#" + engThreshName).attr("value", engThresh);
  $(`#${engThreshName}text`).html("< " + engThresh + "%");

  // update full chart type
  var fullgazeType,
    fullgazeName = "full-gaze";
  cookieList.forEach((val) => {
    if (val.indexOf(fullgazeName) === 0)
      fullgazeType = val.substring(fullgazeName.length + 1);
  });
  $("input[name='full-gaze'][value=" + fullgazeType + "]").prop(
    "checked",
    true
  );

  var fullconfusedType,
    fullconfusedName = "full-confused";
  cookieList.forEach((val) => {
    if (val.indexOf(fullconfusedName) === 0)
      fullconfusedType = val.substring(fullconfusedName.length + 1);
  });
  $("input[name='full-confused'][value=" + fullconfusedType + "]").prop(
    "checked",
    true
  );

  var fullengType,
    fullengName = "full-eng";
  cookieList.forEach((val) => {
    if (val.indexOf(fullengName) === 0)
      fullengType = val.substring(fullengName.length + 1);
  });
  $("input[name='full-eng'][value=" + fullengType + "]").prop("checked", true);

  var fullemotionType,
    fullemotionName = "full-emotion";
  cookieList.forEach((val) => {
    if (val.indexOf(fullemotionName) === 0)
      fullemotionType = val.substring(fullemotionName.length + 1);
  });
  $("input[name='full-emotion'][value=" + fullemotionType + "]").prop(
    "checked",
    true
  );

  // update alert
  var alertBorder,
    alertBorderName = "alertBorder";
  cookieList.forEach((val) => {
    if (val.indexOf(alertBorderName) === 0)
      alertBorder = parseInt(val.substring(alertBorderName.length + 1));
  });

  var alertOnce,
    alertOnceName = "alertOnce";
  cookieList.forEach((val) => {
    if (val.indexOf(alertOnceName) === 0)
      alertOnce = parseInt(val.substring(alertOnceName.length + 1));
  });
  if (!alertBorder)
    $("input[name='alertType'][value=no]").prop("checked", true);
  else if (alertOnce)
    $("input[name='alertType'][value=once]").prop("checked", true);
  else $("input[name='alertType'][value=always]").prop("checked", true);

  var alertSound,
    alertSoundName = "alertSound";
  cookieList.forEach((val) => {
    if (val.indexOf(alertSoundName) === 0)
      alertSound = parseInt(val.substring(alertSoundName.length + 1));
  });
  if (alertSound) $("input#alertSound").prop("checked", true);

  // updata colorpicker
  var engcolor,
    engcolorName = "engcolor";
  cookieList.forEach((val) => {
    if (val.indexOf(engcolorName) === 0)
      engcolor = val.substring(engcolorName.length + 1);
  });
  if (engcolor) {
    $("input#eng-cp-radio").prop("checked", true);
  }
  $("#eng-cp")
    .colorpicker({ format: "rgb", color: `rgb(${engcolor})` })
    .on("colorpickerChange colorpickerCreate", function (e) {
      var color = e.color.string().split("(")[1].split(")")[0];
      console.log(color);
      if ($("#eng-cp-radio")[0].checked) {
        document.cookie = "engcolor=" + color;

        var list = localStorage.getItem("user_behavior");
        list_json = list ? JSON.parse(list) : [];
        list_json.push({
          time: time(),
          action: "chart_color",
          chart: "defaultchart3",
          color: `rgb(${color})`,
        });
        list = JSON.stringify(list_json);
        localStorage.setItem("user_behavior", list);
      }
    });

  var confcolor,
    confcolorName = "confcolor";
  cookieList.forEach((val) => {
    if (val.indexOf(confcolorName) === 0)
      confcolor = val.substring(confcolorName.length + 1);
  });
  if (confcolor) {
    $("input#conf-cp-radio").prop("checked", true);
  }
  $("#conf-cp")
    .colorpicker({ format: "rgb", color: `rgb(${confcolor})` })
    .on("colorpickerChange colorpickerCreate", function (e) {
      var color = e.color.string().split("(")[1].split(")")[0];
      console.log(color);
      if ($("#conf-cp-radio")[0].checked) {
        document.cookie = "confcolor=" + color;

        var list = localStorage.getItem("user_behavior");
        list_json = list ? JSON.parse(list) : [];
        list_json.push({
          time: time(),
          action: "chart_color",
          chart: "defaultchart2",
          color: `rgb(${color})`,
        });
        list = JSON.stringify(list_json);
        localStorage.setItem("user_behavior", list);
      }
    });

  var gazecolor,
    gazecolorName = "gazecolor";
  cookieList.forEach((val) => {
    if (val.indexOf(gazecolorName) === 0)
      gazecolor = val.substring(gazecolorName.length + 1);
  });
  if (gazecolor) {
    $("input#gaze-cp-radio").prop("checked", true);
  }
  $("#gaze-cp")
    .colorpicker({ format: "rgb", color: `rgb(${gazecolor})` })
    .on("colorpickerChange colorpickerCreate", function (e) {
      var color = e.color.string().split("(")[1].split(")")[0];
      console.log(color);
      if ($("#gaze-cp-radio")[0].checked) {
        document.cookie = "gazecolor=" + color;

        var list = localStorage.getItem("user_behavior");
        list_json = list ? JSON.parse(list) : [];
        list_json.push({
          time: time(),
          action: "chart_color",
          chart: "defaultchart1",
          color: `rgb(${color})`,
        });
        list = JSON.stringify(list_json);
        localStorage.setItem("user_behavior", list);
      }
    });

  var emocolor,
    emocolorName = "emocolor";
  cookieList.forEach((val) => {
    if (val.indexOf(emocolorName) === 0)
      emocolor = val.substring(emocolorName.length + 1);
  });
  if (emocolor) {
    $("input#emo-cp-radio").prop("checked", true);
  }
  $("#emo-cp")
    .colorpicker({ format: "rgb", color: `rgb(${emocolor})` })
    .on("colorpickerChange colorpickerCreate", function (e) {
      var color = e.color.string().split("(")[1].split(")")[0];
      console.log(color);
      if ($("#emo-cp-radio")[0].checked) {
        document.cookie = "emocolor=" + color;

        var list = localStorage.getItem("user_behavior");
        list_json = list ? JSON.parse(list) : [];
        list_json.push({
          time: time(),
          action: "chart_color",
          chart: "defaultchart4",
          color: `rgb(${color})`,
        });
        list = JSON.stringify(list_json);
        localStorage.setItem("user_behavior", list);
      }
    });

  // initial store in cookies when first load
  if (!gazeChartType) {
    gazeChartType = $("input[name='gazeradio']:checked").val();
    document.cookie = "gazecharttype=" + gazeChartType;
  }

  if (!confusedChartType) {
    confusedChartType = $("input[name='confusedradio']:checked").val();
    document.cookie = "confusedcharttype=" + confusedChartType;
  }

  if (!engageChartType) {
    engageChartType = $("input[name='engageradio']:checked").val();
    document.cookie = "engagecharttype=" + engageChartType;
  }

  if (!emotionChartType) {
    emotionChartType = $("input[name='emotionradio']:checked").val();
    document.cookie = "emotioncharttype=" + emotionChartType;
  }

  if (!themeid) {
    themeid = $("input[name='themeradio']:checked").val();
    document.cookie = "themeid=" + themeid;
    console.log(
      "themeid",
      (themeid = $("input[name='themeradio']:checked").val())
    );
  }

  if (!fullgazeType) {
    fullgazeType = $("input[name='full-gaze']:checked").val();
    document.cookie = "full-gaze=" + fullgazeType;
  }

  if (!fullconfusedType) {
    fullconfusedType = $("input[name='full-confused']:checked").val();
    document.cookie = "full-confused=" + fullconfusedType;
  }

  if (!fullengType) {
    fullengType = $("input[name='full-eng']:checked").val();
    document.cookie = "full-eng=" + fullengType;
  }

  if (!fullemotionType) {
    fullemotionType = $("input[name='full-emotion']:checked").val();
    document.cookie = "full-emotion=" + fullemotionType;
  }
}

function handleRadioChange() {
  gazeChartType = $("input[name='gazeradio']:checked").val();
  document.cookie = "gazecharttype=" + gazeChartType;

  confusedChartType = $("input[name='confusedradio']:checked").val();
  document.cookie = "confusedcharttype=" + confusedChartType;

  engageChartType = $("input[name='engageradio']:checked").val();
  document.cookie = "engagecharttype=" + engageChartType;

  emotionChartType = $("input[name='emotionradio']:checked").val();
  document.cookie = "emotioncharttype=" + emotionChartType;

  fullgaze = $("input[name='full-gaze']:checked").val();
  document.cookie = "full-gaze=" + fullgaze;

  fullconfused = $("input[name='full-confused']:checked").val();
  document.cookie = "full-confused=" + fullconfused;

  fulleng = $("input[name='full-eng']:checked").val();
  document.cookie = "full-eng=" + fulleng;

  fullemotion = $("input[name='full-emotion']:checked").val();
  document.cookie = "full-emotion=" + fullemotion;

  console.log(document.cookie);

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({
    time: time(),
    action: "initial_chart_type",
    chart_type: {
      default_gaze: gazeChartType,
      default_confused: confusedChartType,
      default_engage: engageChartType,
      default_emotion: emotionChartType,
      full_gaze: fullgaze,
      full_confused: fullconfused,
      full_engage: fulleng,
      full_emotion: fullemotion,
    },
  });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);
}

function handleDisplay(checkButton, chartContainer) {
  if ($("#" + checkButton)[0].checked) {
    $("#" + chartContainer).show();
    var list = localStorage.getItem("user_behavior");
    list_json = list ? JSON.parse(list) : [];
    list_json.push({
      time: time(),
      action: "display",
      chart: chartContainer,
      check: true,
    });
    list = JSON.stringify(list_json);
    localStorage.setItem("user_behavior", list);
  } else {
    $("#" + chartContainer).hide();
    var list = localStorage.getItem("user_behavior");
    list_json = list ? JSON.parse(list) : [];
    list_json.push({
      time: time(),
      action: "display",
      chart: chartContainer,
      check: false,
    });
    list = JSON.stringify(list_json);
    localStorage.setItem("user_behavior", list);
  }
}

function handleThemeChange() {
  themeid = $("input[name='themeradio']:checked").val();
  console.log("themeradio:", $("input[name='themeradio']:checked"));
  document.cookie = "themeid=" + themeid;

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({
    time: new Date().getTime(),
    action: "theme",
    theme: themeid,
  });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);
}

function handleChartThresholdChange(id) {
  const threshold = $("#" + id)[0].value;
  if (id == "conthresh") $(`#${id}text`).html("> " + threshold + "%");
  else $(`#${id}text`).html("< " + threshold + "%");
  document.cookie = id + "=" + threshold;

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({
    time: time(),
    action: "threshold",
    chart: `defaultchart${id === "conthresh" ? 2 : id === "engthresh" ? 3 : 1}`,
    threshold: threshold,
  });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);
}

function handleAlertChange() {
  var alertType = $("input[name='alertType']:checked").val();
  var sound = $("#alertSound")[0].checked;

  document.cookie = "alertBorder=" + (alertType === "no" ? 0 : 1);
  document.cookie = "alertOnce=" + (alertType === "once" ? 1 : 0);
  document.cookie = "alertSound=" + (sound ? 1 : 0);

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({
    time: time(),
    action: "alert_type",
    border: alertType,
    sound: sound,
  });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);
}

function time(time = +new Date()) {
  var date = new Date(time + 8 * 3600 * 1000);
  return date.toJSON().substr(0, 19).split("T")[1];
}

function handleColorpickerRadio() {
  if (!$("#eng-cp-radio")[0].checked) document.cookie = "engcolor=";
  if (!$("#conf-cp-radio")[0].checked) document.cookie = "confcolor=";
  if (!$("#gaze-cp-radio")[0].checked) document.cookie = "gazecolor=";
  if (!$("#emo-cp-radio")[0].checked) document.cookie = "emocolor=";

  var list = localStorage.getItem("user_behavior");
  list_json = list ? JSON.parse(list) : [];
  list_json.push({
    time: time(),
    action: "chart_color_customize",
    defaultchart3: $("#eng-cp-radio")[0].checked,
    defaultchart2: $("#conf-cp-radio")[0].checked,
    defaultchart1: $("#gaze-cp-radio")[0].checked,
    defaultchart4: $("#emo-cp-radio")[0].checked,
  });
  list = JSON.stringify(list_json);
  localStorage.setItem("user_behavior", list);
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
