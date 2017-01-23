
'use strict';

angular.module('ngD3TimelineDemo', ['ngD3Timeline']);

(function() {

  var injectParams = ['$scope', '$interval'];

  var DemoCtrl = function($scope, $interval) {
    var ctrl = this;

    ctrl.testNowLineAndDateLabelsData = [
      { times: [{"LPN":"TLPN242903","timestamp":Date.parse(new Date()) - 86000000,"activity":"Print iLPN List"} ] },
      { times: [{"LPN":"TLPN242903","timestamp":Date.parse(new Date()) - 24000000,"activity":"Pull iLPN List"} ] },
      { times: [{"LPN":"TLPN242903","timestamp":Date.parse(new Date()) - 6000000,"activity":"Pick iLPN List"} ] },
      { times: [{"LPN":"TLPN242903","timestamp":Date.parse(new Date()) - 3000000,"activity":"Pack iLPN List"} ] },
      { times: [{"LPN":"TLPN242903","timestamp":Date.parse(new Date()) + 6000000,"activity":"Load iLPN List"} ] },
    ]

    ctrl.testNowLineAndDateLabelsDateField = 'timestamp';

    ctrl.testNowLineAndDateLabelsOptions = {
      height: 100,
      tickFormat: {
        format: d3.time.format("%I %p"),
        tickTime: d3.time.hours,
        tickInterval: 6,
        tickSize: 20
      },
      beginDateLabel: true,
      endDateLabel: true,
      beginning: getMinDate(ctrl.testNowLineAndDateLabelsData, 'timestamp') - 6000000,
      ending: getMaxDate(ctrl.testNowLineAndDateLabelsData, 'timestamp') + 6000000,
      showDateChanges: true,
      showNowLine: true,
      rotateTicks: 0,
      display: 'circle', // 'rect'
      itemMargin: -8,
      itemHeight: 16,
      hover: function(d, index, datum) {
        console.log( 'This is d:', d, '\ndatum:', datum, '\nindex:', index);
      },
      click: function (d, i, datum) {
        console.log('datum is:', datum);
      }
    };

    ctrl.simpleTestData = [
      {times: [{"simple_start": 1355752800000, "simple_end": 1355759900000}, {"simple_start": 1355767900000, "simple_end": 1355774400000}]},
      {times: [{"simple_start": 1355759910000, "simple_end": 1355761900000}]},
      {times: [{"simple_start": 1355761910000, "simple_end": 1355763910000}]}
    ];

    ctrl.simpleStartField = 'simple_start';
    ctrl.simpleEndField = 'simple_end';

    ctrl.simpleOptions = {};


    ctrl.simpleNoAxisTestData = [
      {times: [{"simple_no_axis_begin": 1355752800000, "simple_no_axis_end": 1355759900000}, {"simple_no_axis_begin": 1355767900000, "simple_no_axis_end": 1355774400000}]},
      {times: [{"simple_no_axis_begin": 1355759910000, "simple_no_axis_end": 1355761900000}]},
      {times: [{"simple_no_axis_begin": 1355761910000, "simple_no_axis_end": 1355763910000}]}
    ];

    ctrl.simpleNoAxisStartField = 'simple_no_axis_begin';
    ctrl.simpleNoAxisEndField = 'simple_no_axis_end';

    ctrl.simpleNoAxisOptions = {
      showTimeAxis: false
    };


    ctrl.testWithCirclesData = [
      { times: [ { 'activity': 'Sitting', 'user': 'Paul L.', 'timestamp': 1355752800000, 'timestamp_start': 1355752800000, 'timestamp_end': 1355759900000 },  { 'activity': 'Redditing', 'user': 'Paul L.', 'timestamp': 1355767900000,  'timestamp_start': 1355752800000, 'timestamp_end': 1355774400000 } ] },
      { times: [ { 'activity': 'Eating', 'user': 'Ravi P.', 'timestamp': 1355759910000,  'timestamp_start': 1355759910000, 'timestamp_end': 1355761900000 } ] },
      { times: [ { 'activity': 'Napping', 'user': 'Andrew C.', 'timestamp': 1355761910000,  'timestamp_start': 1355761910000, 'timestamp_end': 1355763910000 } ] }
    ];

    ctrl.testWithCirclesDateField = 'timestamp';
    ctrl.testWithCirclesStartField = 'timestamp_start';
    ctrl.testWithCirclesEndField = 'timestamp_end';

    ctrl.testWithCirclesOptions = {
      height: 100,
      tickFormat: {
        format: d3.time.format("%I %p"),
        tickTime: d3.time.hours,
        tickInterval: 1,
        tickSize: 25
      },
      rotateTicks: 0,
      display: 'circle', // 'rect'
      itemMargin: -8,
      itemHeight: 16,
      hover: function(d, index, datum) {
        console.log( 'This is d:', d, '\ndatum:', datum, '\nindex:', index);
      },
      click: function (d, i, datum) {
        console.log('datum is:', datum);
      }
    };

    ctrl.rectAndCirclesTestData = [
      { times: [ { "starting_time": 1355752800000, "display": "circle" }, { "starting_time": 1355767900000,  "ending_time": 1355774400000 } ] },
      { times: [ { "starting_time": 1355759910000, "display":"circle" } ] },
      { times: [ { "starting_time": 1355761910000,  "ending_time": 1355763910000 } ] }
    ];

    ctrl.rectAndCirclesStartField = 'starting_time';
    ctrl.rectAndCirclesEndField = 'ending_time';

    ctrl.rectAndCirclesOptions = {
      width: 500,
      height: 100
    };

    ctrl.eventsTestData = [
      {label: "person a", times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}, {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
      {label: "person b", times: [{"starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
      {label: "person c", times: [{"starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

    ctrl.eventsStartField = 'starting_time';
    ctrl.eventsEndField = 'ending_time';

    ctrl.eventsOptions = {
      width: 1200,
      stacked: true,  // toggles graph stacking
      margin: {
        left:70,
        right:30,
        top:0,
        bottom:0
      },
      hover: function (d, i, datum) {
      // d is the current rendering object
      // i is the index during d3 rendering
      // datum is the id object
        var div = document.getElementById('hoverRes');
        var hoverColor = this.colorCycle(i);
        var colorDiv = document.getElementById('coloredDiv');
        colorDiv.style.backgroundColor = hoverColor;
        var nameDiv = document.getElementById('name');
        nameDiv.innerHTML = datum.label;
      },
      click: function(d, i, datum) {
        alert(datum.label);
      },
      scrollable: true,
      scroll: function(x, scale) {
        var scrolled_date = document.getElementById('scrolled_date');
        // console.log('scrolled_date:', scrolled_date, '\nx:', x);
        scrolled_date.innerHTML = (scale.invert(x) + ' to ' + scale.invert(x+this.width));
      }
    };


    ctrl.labelColorTestData = [
      {label: "person a", times: [{"color":"green", "label":"Weeee", "starting_time": 1355752800000, "ending_time": 1355759900000}, {"color":"blue", "label":"Weeee", "starting_time": 1355767900000, "ending_time": 1355774400000}]},
      {label: "person b", times: [{"color":"pink", "label":"Weeee", "starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
      {label: "person c", times: [{"color":"yellow", "label":"Weeee", "starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

    ctrl.labelColorStartField = 'starting_time';
    ctrl.labelColorEndField = 'ending_time';

    ctrl.labelColorOptions = {
      width: 500,
      height: 100,
      beginning: 1355752800000, // we can optionally add beginning and ending times to speed up rendering a little
      ending: 1355774400000,
      stacked: true,  // toggles graph stacking
      margin: {
        left:70,
        right:30,
        top:0,
        bottom:0
      }
    };

      var testDataWithColor = [
        {label: "fruit 1", fruit: "orange", times: [
          {"starting_time": 1355759910000, "ending_time": 1355761900000}]},
        {label: "fruit 2", fruit: "apple", times: [
          {"starting_time": 1355752800000, "ending_time": 1355759900000},
          {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
        {label: "fruit3", fruit: "lemon", times: [
          {"starting_time": 1355761910000, "ending_time": 1355763910000}]}
        ];


    var timePadding = {
      beginning: 3600000, // 1 hour in msecs,
      ending: 3600000
    };

    ctrl.dateField  = 'timestamp';
    ctrl.startField = 'timestamp_start';
    ctrl.endField   = 'timestamp_end';

    ctrl.timeRanges = function() {
      return false;
    };

    ctrl.timelineOptions = {
      width: 500,
      height: 300
    };

    ctrl.rotateTestData = [
      {times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}, {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
      {times: [{"starting_time": 1355759910000, "ending_time": 1355761900000}]},
      {times: [{"starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

    ctrl.rotateStartField = 'starting_time';
    ctrl.rotateEndField = 'ending_time';

    ctrl.rotateOptions = {
      width: 500,
      height: 100,
      rotateTicks: 45
    };

    ctrl.mappedColorsTestData = [
      {label: "fruit 1", fruit: "orange", times: [
        {"starting_time": 1355759910000, "ending_time": 1355761900000}]},
      {label: "fruit 2", fruit: "apple", times: [
        {"starting_time": 1355752800000, "ending_time": 1355759900000},
        {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
      {label: "fruit3", fruit: "lemon", times: [
        {"starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

    ctrl.mappedColorsStartField = 'starting_time';
    ctrl.mappedColorsEndField = 'ending_time';

    ctrl.mappedColorsOptions = {
      width: 500,
      height: 100,
      colorCycle: (function() {
        return d3.scale.ordinal()
                 .range(['#6b0000','#ef9b0f','#ffee00'])
                 .domain(['apple','orange','lemon']);
      })(),
      colorPropertyName: 'fruit'
    };

    ctrl.relativeTimeTestData = [
      {times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}, {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
      {times: [{"starting_time": 1355759910000, "ending_time": 1355761900000}]},
      {times: [{"starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

    ctrl.relativeTimeStartField = 'starting_time';
    ctrl.relativeTimeEndField = 'ending_time';

    ctrl.relativeTimeOptions = {
      width: 500,
      height: 100,
      timeIsRelative: true,
      tickFormat: {
        format: function(d) { return d3.time.format("%H:%M")(d) },
        tickTime: d3.time.minutes,
        tickInterval: 30,
        tickSize: 15
      }
    };

    ctrl.colorPerDataPointTestData = [
      {
        label: "fruit 2",
        fruit: "apple",
        times: [
        {fruit: "orange", "starting_time": 1355752800000, "ending_time": 1355759900000},
        {"starting_time": 1355767900000, "ending_time": 1355774400000},
        {fruit: "lemon", "starting_time": 1355774400000, "ending_time": 1355775500000}]}
    ];

    ctrl.colorPerDataPointStartField = 'starting_time';
    ctrl.colorPerDataPointEndField = 'ending_time';

    ctrl.colorPerDataPointOptions = {
      width: 500,
      height: 100,
      colorCycle: (function() {
        return d3.scale.ordinal()
                 .range(['#6b0000','#ef9b0f','#ffee00'])
                 .domain(['apple','orange','lemon']);
      })(),
      colorPropertyName: 'fruit'
    };

    ctrl.stackedTopAxisTestData = [
      {times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}, {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
      {times: [{"starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
      {times: [{"starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

    ctrl.stackedTopAxisStartField = 'starting_time';
    ctrl.stackedTopAxisEndField = 'ending_time';

    ctrl.stackedTopAxisOptions = {
      stacked: true,
      showAxisTop: true
    };



    ctrl.stackedBckgrdTestData = [
      {times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}, {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
      {times: [{"starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
      {times: [{"starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

    ctrl.stackedBckgrdStartField = 'starting_time';
    ctrl.stackedBckgrdEndField = 'ending_time';

    ctrl.stackedBckgrdOptions = {
      stacked: true,
      backgroundColor: 'grey'
    };


    ctrl.stackedBckgrdTicksTestData = [
      {times: [{"starting_time": 1355752800000, "ending_time": 1355759900000}, {"starting_time": 1355767900000, "ending_time": 1355774400000}]},
      {times: [{"starting_time": 1355759910000, "ending_time": 1355761900000}, ]},
      {times: [{"starting_time": 1355761910000, "ending_time": 1355763910000}]}
    ];

    ctrl.stackedBckgrdTicksStartField = 'starting_time';
    ctrl.stackedBckgrdTicksEndField   = 'ending_time';

    ctrl.stackedBckgrdTicksOptions = {
      stacked: true,
      timeAxisTick: true,
      backgroundColor: 'grey'
    };


    ctrl.complexTestData = [
      {label: "person a", times: [{"begin": 1355752800000, "end": 1355759900000}, {"begin": 1355767900000, "end": 1355774400000}]},
      {label: "person b", times: [{"begin": 1355759910000, "end": 1355761900000}, ]},
      {label: "person c", times: [{"begin": 1355761910000, "end": 1355763910000}]}
    ];

    ctrl.complexStartField = 'begin';
    ctrl.complexEndField = 'end';

    var complexBackgroundColor    = "#FCFCFD";
    var complexAltBackgroundColor = "red";

    ctrl.complexOptions = {
      width: 500,
      height: 100,
      stacked: true,
      timeAxisTick: true,
      margin: {
        left:250,
        right:0,
        top:20,
        bottom:0
      },
      itemMargin: 0,
      labelMargin: 25,
      backgroundColor: function (datum, i) {
       return (i % 2 === 0) ? complexAltBackgroundColor : complexBackgroundColor;
      },
      fullLengthBackgrounds: true
    };

    function getMinDate(dataSet, datetimeField) {
      var minDate = Date.parse(new Date());
      _.forEach(dataSet, function(item) {
        _.forEach(item.times, function(point) {
          minDate = (point[datetimeField] < minDate) ? point[datetimeField] : minDate;
        })
      });
      return minDate;
    }

    function getMaxDate(dataSet, datetimeField) {
      var maxDate = 0;
      _.forEach(dataSet, function(item) {
        _.forEach(item.times, function(point) {
          maxDate = (point[datetimeField] > maxDate) ? point[datetimeField] : maxDate;
        })
      });
      return maxDate;
    }

  };

  DemoCtrl.$inject = injectParams;

  angular.module('ngD3TimelineDemo')
    .controller('DemoCtrl', DemoCtrl);
})();