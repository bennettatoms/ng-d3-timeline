/**
 * ngD3Timeline (https://github.com/bennettatoms/ng-d3-timeline)
 * is an angular directive that wraps the d3.timeline
 * module by @jiahuang :: https://github.com/jiahuang/d3-timeline
 *
 * inject 'ngD3Timeline' module into your angular dependencies,
 * and use in markup with <ng-d3-timeline> element tag or attribute
 *
 * See demo for configuration options at http://plnkr.co/edit/atRu85zH9vJkLOzMEe7t?p=info
 *
 * @bennettatoms (Jan 19, 2017)
 */

'use strict';

angular.module('ngD3Timeline', []);

(function() {

  var injectParams = ['$window', '$filter'];

  var ngD3Timeline = function($window, $filter) {
     return {
      restrict: 'EA',
      scope: {
        timelineData: '<',
        timelineOptions: '<'
      },
      link: function(scope, elem, attrs) {

        function isDefinedAndNotNull(val) {
          return typeof(val) !== 'undefined' && val !== null;
        }

        var timeFieldArgs = (isDefinedAndNotNull(attrs.dateField) || !(isDefinedAndNotNull(attrs.startField) && isDefinedAndNotNull(attrs.endField))) ? [attrs.dateField] : [attrs.startField, attrs.endField];

        var userPreferences = scope.timelineOptions,
            chart = {},
            timelineSvg = null,
            defaultColorCycle = d3.scale.category20(),
            colorCycle = isDefinedAndNotNull(userPreferences.colorCycle) ? userPreferences.colorCycle : defaultColorCycle;

        var options = {
          DISPLAY_TYPES: ['circle', 'rect'],
          display: 'rect', // or 'rect'
          width: null,
          height: null,
          tickFormat: {
            format: d3.time.format("%I %p"),
            tickTime: d3.time.hours,
            tickInterval: 1,
            tickSize: 6
          },
          hover: function () {},
          mouseover: function () {},
          mouseout: function () {},
          click: function () {},
          scroll: function () {},
          scrollable: false,
          labelFunction: function(label) { return label; },
          navigateLeft: function () {},
          navigateRight: function () {},
          orient: "bottom",
          rowSeparatorsColor: null,
          backgroundColor: null,
          colorPropertyName: null,
          colorCycle: colorCycle,
          beginning: 0,
          beginDateLabel: false,
          beginDateLabelMargin: {
            left: 30,
            right: 0,
            top: 100,       // distance below top of div
            bottom:0
          },
          endDateLabel: false,
          endDateLabelMargin: {
            left: 0,
            right: 80,      // distance from right boundary -- to allow for label width
            top: 100,       // distance below top of div
            bottom:0
          },
          dateLabelFormat: 'M/d/yyyy',
          showDateChanges: false,
          dateChangeLineFormat: {
            marginTop: 25,
            marginBottom: 10,
            width: 1,
            color: '#ddd',  // or string color val or colorCycle
            stroke: '',
            spacing: '',
            addClass: ''    // optional -- to add styling via CSS
          },
          labelMargin: 0,
          ending: 0,
          margin: {
            left: 30,
            right: 30,
            top: 30,
            bottom: 30
          },
          stacked: false,
          rotateTicks: false,
          tooltips: {
            showOnHover: false,
            contentHtml: function (d, index, datum) {
              return '<div class="ng-d3-timeline-tooltip-div"><p class="ng-d3-timeline-tooltip-timestamp">' + new Date(d[timeFieldArgs[0]])  + '</p></div>';
            },
            border: {
              width: 3,     // integer number of pixels
              color: null,  // defaults to colorCycle(index), so same as datum circle/rect
              style: 'solid'
            },
            backgroundColor: '#eee',
            width: 200,
            offset: {
              top: 0,
              left: 0
            }
          },
          timeIsRelative: false,
          fullLengthBackgrounds: false,
          itemHeight: 20,
          itemMargin: 5,
          navMargin: 60,
          showTimeAxis: true,
          showAxisTop: false,
          showNowLine: true,
          nowLineFormat: {
            marginTop: 25,
            marginBottom: 10,
            width: 1,
            color: 'red',
            stroke: 'stroke-dasharray',
            spacing: '5 5',
            addClass: ''    // optional -- to add styling via CSS
          },
          timeAxisTick: false,
          timeAxisTickFormat: {
            stroke: 'stroke-dasharray',
            spacing: '4 10'
          },
          showBorderLine: false,
          borderLineFormat: {
            marginTop: 25,
            marginBottom: 0,
            width: 1,
            color: colorCycle,
            stroke: '',
            spacing: '',
            addClass: ''    // optional -- to add styling via CSS
          },
          showAxisHeaderBackground: false,
          showAxisNav: false,
          showAxisCalendarYear: false,
          axisBgColor: 'white'
        };

        /** initialize chart with required params */
        function initialize(args) {
          return ngD3Timeline.apply(this, args);
        }

        function setOptions(opts, userPrefs) {
          var eqValTypes = ['string', 'function', 'number', 'boolean'];
          for (var prop in userPrefs) {
            if (isDefinedAndNotNull(userPrefs[prop])) {
              if (eqValTypes.indexOf(typeof(userPrefs[prop])) > -1) {
                opts[prop] = userPrefs[prop];
              } else {
                for (var subprop in userPrefs[prop]) {
                  if (eqValTypes.indexOf(typeof(userPrefs[prop][subprop])) > -1) {
                    opts[prop][subprop] = userPrefs[prop][subprop];
                  } else {
                    for (var subsubprop in userPrefs[prop][subprop]) {
                      opts[prop][subprop][subsubprop] = userPrefs[prop][subprop][subsubprop];

                    }
                  }
                }
              }
            }
          }
          return opts;
        }

        options = setOptions(options, userPreferences);

        var timelineArgs = [options].concat(timeFieldArgs);

        chart = initialize(timelineArgs);

        function windowW() {
          return $window.innerWidth;
        }

        function formatDate(date) {
          return $filter('date')(date, options.dateLabelFormat);
        }

        function areSameDate(begin, end) {
          return begin.toDateString() === end.toDateString();
        }

        function getDateChanges(begin, end) {
          if (!areSameDate(begin, end)) {
            var dateChanges = [];
            var lastMidnight = end.setHours(0, 0, 0, 0);
            var firstMidnight = begin.setHours(0, 0, 0, 0);
            do {
              dateChanges.push(lastMidnight);
              lastMidnight -= 86400000; // go back to midnight the day before and check if still greater than first
            } while (lastMidnight > firstMidnight);
            return dateChanges;
          }

          return [];
        }

        function svgW() {
          if (isDefinedAndNotNull(options.width)) {
            if (options.scrollable) {
             return (windowW() < options.width) ? windowW() : options.width;
            } else {
              return options.width;
            }
          }
          return windowW();
        }

        function renderTimeline(data) {
          timelineSvg = d3.select(elem[0]).append('svg').attr('width', svgW())
            .datum(data).call(chart);
        }

        renderTimeline(scope.timelineData);

        function ngD3Timeline(opts, timestampField, optionalEndtimeField) {
          var timelineArgs = Array.prototype.slice.call(arguments),
              timestamp;

          function isDefinedAndNotNull(val) {
            return typeof(val) !== 'undefined' && val !== null;
          }

          function usingTimeRange() {
            return timelineArgs.length > 2 && isDefinedAndNotNull(timelineArgs[1]) && isDefinedAndNotNull(timelineArgs[0]);
          }

          if (usingTimeRange()) {
            timestamp = {
              start: timestampField,      // start timestamp property
              end: optionalEndtimeField   // end timestamp property
            }
          } else {
            timestamp = timestampField;   // set timestamp value to string value of timestampField
          }

          function timestampOrStartTime() {
            return usingTimeRange() ? timestamp.start : timestamp;
          }

          var appendTimeAxis = function appendTimeAxis(g, xAxis, yPosition) {

            if (opts.showAxisHeaderBackground){ appendAxisHeaderBackground(g, 0, 0); }

            if (opts.showAxisNav) { appendTimeAxisNav(g); }

            var axis = g.append('g')
              .attr('class', 'axis')
              .attr('transform', 'translate(' + 0 + ',' + yPosition + ')')
              .call(xAxis);
          };

          var appendTimeAxisCalendarYear = function appendTimeAxisCalendarYear(nav) {
            var calendarLabel = opts.beginning.getFullYear();

            if (opts.beginning.getFullYear() != opts.ending.getFullYear()) {
              calendarLabel = opts.beginning.getFullYear() + '-' + opts.ending.getFullYear();
            }

            nav.append('text')
              .attr('transform', 'translate(' + 20 + ', 0)')
              .attr('x', 0)
              .attr('y', 14)
              .attr('class', 'calendarYear')
              .text(calendarLabel);
          };

          var appendBeginDateLabel = function appendBeginDateLabel(g, formattedBeginDate, lblMargin, centered) {
            g.append('text')
              .attr('class', 'timeline-label')
              .attr('x', centered ? 0.5 * opts.width : lblMargin.left)
              .attr('y', lblMargin.top)
              .text(formattedBeginDate);
          };

          var appendEndDateLabel = function appendEndDateLabel(g, formattedEndDate, lblMargin) {
            // console.log('inside the appendTimeAxisEndDate function with format end date:', formattedEndDate);
            g.append('text')
              .attr('class', 'timeline-label')
              .attr('x', opts.width - lblMargin.right) //opts.margin.left + opts.width
              .attr('y', lblMargin.top)
              .text(formattedEndDate);
          };

          var fixedHTMLtooltip = d3.select('body').append('div')
            .attr('class', 'ng-d3-timeline-tooltip')
            .style('width', opts.tooltips.width + 'px')
            .style('position', 'absolute')
            .style('text-align', 'center')
            .style('padding', '0 2px')
            .style('margin-top', 0)
            .style('font', '12px sans-serif')
            .style('background', opts.tooltips.backgroundColor)
            .style('opacity', 0);

          var appendTimeAxisNav = function appendTimeAxisNav(g) {
            var timelineBlocks = 6;
            var leftNavMargin = (opts.margin.left - opts.navMargin);
            var incrementValue = (opts.width - opts.margin.left)/timelineBlocks;
            var rightNavMargin = (opts.width - opts.margin.right - incrementValue + opts.navMargin);

            var nav = g.append('g')
                .attr('class', 'axis')
                .attr('transform', 'translate(0, 20)');

            if (opts.showAxisCalendarYear) { appendTimeAxisCalendarYear(nav) };

            nav.append('text')
              .attr('transform', 'translate(' + leftNavMargin + ', 0)')
              .attr('x', 0)
              .attr('y', 14)
              .attr('class', 'chevron')
              .text('<')
              .on('click', function () {
                return navigateLeft(opts.beginning, opts.chartData);
              });

            nav.append('text')
              .attr('transform', 'translate(' + rightNavMargin + ', 0)')
              .attr('x', 0)
              .attr('y', 14)
              .attr('class', 'chevron')
              .text('>')
              .on('click', function () {
                return navigateRight(opts.ending, opts.chartData);
              });
          };

          var appendAxisHeaderBackground = function appendAxisHeaderBackground(g, xAxis, yAxis) {
            g.insert('rect')
              .attr('class', 'row-green-bar')
              .attr('x', xAxis)
              .attr('width', opts.width)
              .attr('y', yAxis)
              .attr('height', opts.itemHeight)
              .attr('fill', opts.axisBgColor);
          };

          var appendTimeAxisTick = function appendTimeAxisTick(g, xAxis, maxStack) {
            g.append('g')
              .attr('class', 'axis')
              .attr('transform', 'translate(' + 0 + ',' + (opts.margin.top + (opts.itemHeight + opts.itemMargin) * maxStack) + ')')
              .attr(opts.timeAxisTickFormat.stroke, opts.timeAxisTickFormat.spacing)
              .call(xAxis.tickFormat('').tickSize(-(opts.margin.top + (opts.itemHeight + opts.itemMargin) * (maxStack - 1) + 3), 0, 0));
          };

          var appendBackgroundBar = function appendBackgroundBar(yAxisMapping, index, g, data, datum) {
            var greenbarYAxis = ((opts.itemHeight + opts.itemMargin) * yAxisMapping[index]) + opts.margin.top;
            g.selectAll('svg').data(data).enter()
              .insert('rect')
              .attr('class', 'row-green-bar')
              .attr('x', opts.fullLengthBackgrounds ? 0 : opts.margin.left)
              .attr('width', opts.fullLengthBackgrounds ? opts.width : (opts.width - opts.margin.right - opts.margin.left))
              .attr('y', greenbarYAxis)
              .attr('height', opts.itemHeight)
              .attr('fill', opts.backgroundColor instanceof Function ? opts.backgroundColor(datum, index) : opts.backgroundColor)
            ;
          };

          var appendLabel = function appendLabel(gParent, yAxisMapping, index, hasLabel, datum) {
            var fullItemHeight = opts.itemHeight + opts.itemMargin;
            var rowsDown       = opts.margin.top + (fullItemHeight/2) + fullItemHeight * (yAxisMapping[index] || 1);

            gParent.append('text')
              .attr('class', 'timeline-label')
              .attr('transform', 'translate(' + opts.labelMargin + ',' + rowsDown + ')')
              .text(hasLabel ? opts.labelFunction(datum.label) : datum.id)
              .on('click', function (d, i) { opts.click(d, index, datum); });
          };

          function timeline(gParent) {
            var g = gParent.append('g');
            var gParentSize = gParent[0][0].getBoundingClientRect();

            var gParentItem = d3.select(gParent[0][0]);

            var yAxisMapping = {},
                maxStack = 1,
                minTime = 0,
                maxTime = 0;

            setWidth();

            // check if the user wants relative time
            // if so, substract the first timestamp from each subsequent timestamps
            if (opts.timeIsRelative) {
              g.each(function (d, i) {
                var originTime;
                d.forEach(function (datum, index) {
                  datum.times.forEach(function (time, j) {
                    if (index === 0 && j === 0){
                      originTime = time[timestampOrStartTime()];          // Store the timestamp that will serve as origin
                      time[timestampOrStartTime()] = 0;                       // Set the origin
                      if (usingTimeRange()) {
                        time[timestamp.end] = time[timestamp.end] - originTime;  // Store the relative time (millis)
                      }
                    } else {
                      time[timestampOrStartTime()] = time[timestampOrStartTime()] - originTime;
                      if (usingTimeRange()) {
                        time[timestamp.end] = time[timestamp.end] - originTime;
                      }
                    }
                  });
                });
              });
            }

            // check how many stacks we're gonna need
            // do this here so that we can draw the axis before the graph
            if (opts.stacked || opts.ending === 0 || opts.beginning === 0) {
              g.each(function (d, i) {
                d.forEach(function (datum, index) {

                  // create y mapping for stacked graph
                  if (opts.stacked && Object.keys(yAxisMapping).indexOf(index) == -1) {
                    yAxisMapping[index] = maxStack;
                    maxStack++;
                  }

                  // figure out beginning and ending times if they are unspecified
                  datum.times.forEach(function (time, i) {
                    if (opts.beginning === 0) {
                      if (time[timestampOrStartTime()] < minTime || (minTime === 0 && opts.timeIsRelative === false)) {
                        minTime = time[timestampOrStartTime()];
                      }
                    }
                    if (opts.ending === 0) {
                      if (usingTimeRange()) {
                        if (time[timestamp.end] > maxTime) {
                          maxTime = time[timestamp.end];
                        }
                      } else {
                        if (time[timestampOrStartTime()] > maxTime) {
                          maxTime = time[timestampOrStartTime()];
                        }
                      }
                    }
                  });
                });
              });

              if (opts.ending === 0) {
                opts.ending = maxTime;
              }
              if (opts.beginning === 0) {
                opts.beginning = minTime;
              }
            }

            var scaleFactor = (1/(opts.ending - opts.beginning)) * (opts.width - opts.margin.left - opts.margin.right);

            // draw the axis
            var xScale = d3.time.scale()
              .domain([opts.beginning, opts.ending])
              .range([opts.margin.left, opts.width - opts.margin.right]);

            var xAxis = d3.svg.axis()
              .scale(xScale)
              .orient(opts.orient)
              .tickFormat(opts.tickFormat.format)
              .tickSize(opts.tickFormat.tickSize);

            if (opts.tickFormat.tickValues != null) {
              xAxis.tickValues(opts.tickFormat.tickValues);
            } else {
              xAxis.ticks(opts.tickFormat.numTicks || opts.tickFormat.tickTime, opts.tickFormat.tickInterval);
            }

            // console.log(areSameDate(new Date(opts.beginning), new Date(opts.ending)));
            // append date labels
            if (opts.beginDateLabel) {
              // console.log('opts beginning is ', opts.beginning);
              // console.log('formatted begin:', formatDate(opts.beginning));
              if (areSameDate(new Date(opts.beginning), new Date(opts.ending))) {
                appendBeginDateLabel(g, formatDate(opts.beginning), opts.beginDateLabelMargin, true);
              } else {
                appendBeginDateLabel(g, formatDate(opts.beginning), opts.beginDateLabelMargin, false);
                if (opts.endDateLabel) {
                  // console.log('formatted end:', formatDate(opts.ending));
                  appendEndDateLabel(g, formatDate(opts.ending), opts.endDateLabelMargin);
                }
              }
            }

            // draw the chart
            g.each(function(d, i) {
              opts.chartData = d;
              d.forEach( function(datum, index){
                var data = datum.times;
                var hasLabel = isDefinedAndNotNull(datum.label);

                // issue warning about using id per data set. Ids should be individual to data elements
                if (isDefinedAndNotNull(datum.id)) {
                  var warning = 'd3Timeline Warning: Ids per dataset is deprecated in favor of a \'class\' key. Ids are now per data element.';
                  ('warn' in console) ? console.warn(warning) : console.log(warning);
                }

                if (opts.backgroundColor) { appendBackgroundBar(yAxisMapping, index, g, data, datum); }

                g.selectAll('svg').data(data).enter()
                  .append(function(d, i) {
                    return document.createElementNS(d3.ns.prefix.svg, 'display' in d ? d.display : opts.display);
                  })
                  .attr('x', getXPos)
                  .attr('y', getStackPosition)
                  .attr('width', function (d, i) {
                    return ( usingTimeRange() ? d[timestamp.end] - d[timestamp.start] : opts.itemHeight ) * scaleFactor;
                  })
                  .attr('cy', function(d, i) {
                    return getStackPosition(d, i) + opts.itemHeight/2;
                  })
                  .attr('cx', getXPos)
                  .attr('r', opts.itemHeight / 2)
                  .attr('height', opts.itemHeight)
                  .style('fill', function(d, i){
                    var dColorPropName;
                    if (d.color) return d.color;
                    if( opts.colorPropertyName ){
                      dColorPropName = d[opts.colorPropertyName];
                      if ( dColorPropName ) {
                        return opts.colorCycle( dColorPropName );
                      } else {
                        return opts.colorCycle( datum[opts.colorPropertyName] );
                      }
                    }
                    return opts.colorCycle(index);
                  })
                  .on('mousemove', function (d, i, datum) {
                    // console.log('MOUSEMOVE over item', d, 'with index', index, 'datum', datum, 'and with color', colorCycle(index))
                    if (opts.tooltips.showOnHover) {
                      var tooltipString = opts.tooltips.contentHtml(d, i, datum);
                      var borderStyle = opts.tooltips.border.width + 'px ' + opts.tooltips.border.style + ' ' + (isDefinedAndNotNull(opts.tooltips.border.color) ? opts.tooltips.border.color : colorCycle(index));

                      fixedHTMLtooltip
                        .html(tooltipString)
                        .style('left', (d3.event.pageX - 0.5 * opts.tooltips.width + opts.tooltips.offset.left) + 'px')
                        .style('top', (d3.event.pageY - 80 - opts.tooltips.offset.top) + 'px')
                        .style('border', borderStyle);
                    }
                  })
                  .on('mouseover', function (d, i) {
                    // console.log('moused over item', d, 'with index', i, 'and with color', colorCycle(i))
                    if (opts.tooltips.showOnHover) {
                      fixedHTMLtooltip
                        .style('opacity', 0)
                        .style('display', 'inline');

                      fixedHTMLtooltip
                        .transition()
                        .duration(200)
                        .style('opacity', .9);
                        // .style('background', colorCycle(index));
                        // .style('border', '2px solid ' + colorCycle(index));

                      d3.select(this).transition()
                        .ease('exp-out')
                        .delay(50)
                        .duration(500);
                    }
                  })
                  .on('mouseout', function (d, i) {
                    if (opts.tooltips.showOnHover) {
                      fixedHTMLtooltip
                        .style('display', 'none');
                    }
                  })
                  .on('click', function (d, i) {
                    opts.click(d, index, datum);
                  })
                  .attr('class', function (d, i) {
                    return datum.class ? 'timelineSeries_' + datum.class : 'timelineSeries_' + index;
                  })
                  .attr('id', function(d, i) {
                    // use deprecated id field
                    if (datum.id && !d.id) {
                      return 'timelineItem_' + datum.id;
                    }

                    return d.id ? d.id : 'timelineItem_' + index + '_' + i;
                  });

                g.selectAll('svg').data(data).enter()
                  .append('text')
                  .attr('x', getXTextPos)
                  .attr('y', getStackTextPosition)
                  .text(function(d) {
                    return d.label;
                  });

                if (opts.rowSeparatorsColor) {
                  var lineYAxis = ( opts.itemHeight + opts.itemMargin / 2 + opts.margin.top + (opts.itemHeight + opts.itemMargin) * yAxisMapping[index]);
                  gParent.append('svg:line')
                    .attr('class', 'row-separator')
                    .attr('x1', 0 + opts.margin.left)
                    .attr('x2', opts.width - opts.margin.right)
                    .attr('y1', lineYAxis)
                    .attr('y2', lineYAxis)
                    .attr('stroke-width', 1)
                    .attr('stroke', opts.rowSeparatorsColor);
                }

                // add the label
                if (hasLabel) { appendLabel(gParent, yAxisMapping, index, hasLabel, datum); }

                if (isDefinedAndNotNull(datum.icon)) {
                  gParent.append('image')
                    .attr('class', 'timeline-label')
                    .attr('transform', 'translate('+ 0 +','+ (opts.margin.top + (opts.itemHeight + opts.itemMargin) * yAxisMapping[index])+')')
                    .attr('xlink:href', datum.icon)
                    .attr('width', opts.margin.left)
                    .attr('height', opts.itemHeight);
                }

                function getStackPosition(d, i) {
                  if (opts.stacked) {
                    return opts.margin.top + (opts.itemHeight + opts.itemMargin) * yAxisMapping[index];
                  }
                  return opts.margin.top;
                }
                function getStackTextPosition(d, i) {
                  if (opts.stacked) {
                    return opts.margin.top + (opts.itemHeight + opts.itemMargin) * yAxisMapping[index] + opts.itemHeight * 0.75;
                  }
                  return opts.margin.top + opts.itemHeight * 0.75;
                }
              });
            });

            var belowLastItem = (opts.margin.top + (opts.itemHeight + opts.itemMargin) * maxStack);
            var aboveFirstItem = opts.margin.top;
            var timeAxisYPosition = opts.showAxisTop ? aboveFirstItem : belowLastItem;
            if (opts.showTimeAxis) { appendTimeAxis(g, xAxis, timeAxisYPosition); }
            if (opts.timeAxisTick) { appendTimeAxisTick(g, xAxis, maxStack); }

            if (opts.width > gParentSize.width) {
              var move = function() {
                var x = Math.min(0, Math.max(gParentSize.width - opts.width, d3.event.translate[0]));
                zoom.translate([x, 0]);
                g.attr('transform', 'translate(' + x + ',0)');
                opts.scroll(x*scaleFactor, xScale);
              };

              var zoom = d3.behavior.zoom().x(xScale).on('zoom', move);

              gParent
                .attr('class', 'scrollable')
                .call(zoom);
            }

            if (opts.rotateTicks) {
              g.selectAll('.tick text')
                .attr('transform', function(d) {
                  return 'rotate(' + opts.rotateTicks + ')translate('
                    + (this.getBBox().width / 2 + 10) + ',' // TODO: change this 10
                    + this.getBBox().height / 2 + ')';
                });
            }

            var gSize = g[0][0].getBoundingClientRect();
            setHeight();

            if (opts.showBorderLine) {
              g.each(function (d, i) {
                d.forEach(function (datum) {
                  var times = datum.times;
                  times.forEach(function (time) {
                    appendLine(xScale(time[timestampOrStartTime()]), opts.borderLineFormat);
                    if (usingTimeRange()) {
                      appendLine(xScale(time[timestamp.end]), opts.borderLineFormat);
                    }
                  });
                });
              });
            }

            if (opts.showNowLine) {
              var nowLine = xScale(new Date());
              appendLine(nowLine, opts.nowLineFormat);
            }

            if (opts.showDateChanges) {
              var dateLines = getDateChanges(new Date(opts.beginning), new Date(opts.ending));
              // console.log('date changes are:', dateLines);
              dateLines.forEach(function(midnight) {
                var thisLine = xScale(new Date(midnight));
                appendLine(thisLine, opts.dateChangeLineFormat);
              });
            }

            function getXPos(d, i) {
              return opts.margin.left + (d[timestampOrStartTime()] - opts.beginning) * scaleFactor;
            }

            function getXTextPos(d, i) {
              return opts.margin.left + (d[timestampOrStartTime()] - opts.beginning) * scaleFactor + 5;
            }

            function setHeight() {
              if (!opts.height && !gParentItem.attr('height')) {
                if (opts.itemHeight) {
                  // set height based off of item height
                  opts.height = gSize.height + gSize.top - gParentSize.top;
                  // set bounding rectangle height
                  d3.select(gParent[0][0]).attr('height', opts.height);
                } else {
                  throw 'height of the timeline is not set';
                }
              } else {
                if (!opts.height) {
                  opts.height = gParentItem.attr('height');
                } else {
                  gParentItem.attr('height', opts.height);
                }
              }
            }

            function setWidth() {
              if (!opts.width && !gParentSize.width) {
                try {
                  opts.width = gParentItem.attr('width');
                  if (!opts.width) {
                    throw 'width of the timeline is not set. As of Firefox 27, timeline().width(x) needs to be explicitly set in order to render';
                  }
                } catch (err) {
                  console.log( err );
                }
              } else if (!(opts.width && gParentSize.width)) {
                try {
                  opts.width = gParentItem.attr('width');
                } catch (err) {
                  console.log( err );
                }
              }
              // if both are set, do nothing
            }

            function appendLine(lineScale, lineFormat) {
              gParent.append('svg:line')
                .attr('x1', lineScale)
                .attr('y1', lineFormat.marginTop)
                .attr('x2', lineScale)
                .attr('y2', opts.height - lineFormat.marginBottom)
                .attr('class', lineFormat.addClass)
                .style('stroke', lineFormat.color)//'rgb(6,120,155)')
                .style(lineFormat.stroke, lineFormat.spacing)//'rgb(6,120,155)')
                .style('stroke-width', lineFormat.width);
            }

          }

          return timeline;
        }
      }
    };
  };

  ngD3Timeline.$inject = injectParams;

  angular.module('ngD3Timeline')
    .directive('ngD3Timeline', ngD3Timeline);
})();

