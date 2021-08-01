function ToDefaultView() {
  console.log("to default view...");
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

  window.close();
  fullWindow = window.open("full.html", "", "width=100,height=100");
  console.log(screen.width);
  fullWindow.resizeTo(rate * screen.width, screen.height);
  fullWindow.moveTo(screen.width, 0);
}

function ToDashboard() {
  console.log("to dashboard...");
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

function loadWindow() {
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

  var emoChartType,
    emoChartName = "emocharttype";
  cookieList.forEach((val) => {
    if (val.indexOf(emoChartName) === 0)
      emoChartType = val.substring(emoChartName.length + 1);
  });
  $("input[name='emoradio'][value=" + emoChartType + "]").prop("checked", true);

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
      if ($("#eng-cp-radio")[0].checked) document.cookie = "engcolor=" + color;
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
      if ($("#conf-cp-radio")[0].checked)
        document.cookie = "confcolor=" + color;
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
      if ($("#gaze-cp-radio")[0].checked)
        document.cookie = "gazecolor=" + color;
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

  if (!emoChartType) {
    emoChartType = $("input[name='emoradio']:checked").val();
    document.cookie = "emocharttype=" + emoChartType;
  }

  if (!themeid) {
    themeid = $("input[name='themeradio']:checked").val();
    document.cookie = "themeid=" + themeid;
  }
}

function handleRadioChange() {
  gazeChartType = $("input[name='gazeradio']:checked").val();
  document.cookie = "gazecharttype=" + gazeChartType;

  confusedChartType = $("input[name='confusedradio']:checked").val();
  document.cookie = "confusedcharttype=" + confusedChartType;

  engageChartType = $("input[name='engageradio']:checked").val();
  document.cookie = "engagecharttype=" + engageChartType;

  fullgaze = $("input[name='full-gaze']:checked").val();
  document.cookie = "full-gaze=" + fullgaze;

  fullconfused = $("input[name='full-confused']:checked").val();
  document.cookie = "full-confused=" + fullconfused;

  fulleng = $("input[name='full-eng']:checked").val();
  document.cookie = "full-eng=" + fulleng;

  fullemotion = $("input[name='full-emotion']:checked").val();
  document.cookie = "full-emotion=" + fullemotion;

  console.log(document.cookie);
}

function handleDisplay(checkButton, chartContainer) {
  if ($("#" + checkButton)[0].checked) {
    $("#" + chartContainer).show();
  } else {
    $("#" + chartContainer).hide();
  }
}

function handleThemeChange() {
  themeid = $("input[name='themeradio']:checked").val();
  console.log("themeradio:", $("input[name='themeradio']:checked"));
  document.cookie = "themeid=" + themeid;
}

function handleChartThresholdChange(id) {
  const threshold = $("#" + id)[0].value;
  if (id == "engthresh") $(`#${id}text`).html("> " + threshold + "%");
  else $(`#${id}text`).html("< " + threshold + "%");
  document.cookie = id + "=" + threshold;
}

function handleAlertChange() {
  var alertType = $("input[name='alertType']:checked").val();
  var sound = $("#alertSound")[0].checked;

  document.cookie = "alertBorder=" + (alertType === "no" ? 0 : 1);
  document.cookie = "alertOnce=" + (alertType === "once" ? 1 : 0);
  document.cookie = "alertSound=" + (sound ? 1 : 0);
}

function handleColorpickerRadio() {
  if (!$("#eng-cp-radio")[0].checked) document.cookie = "engcolor=";
  if (!$("#conf-cp-radio")[0].checked) document.cookie = "confcolor=";
  if (!$("#gaze-cp-radio")[0].checked) document.cookie = "gazecolor=";
}
