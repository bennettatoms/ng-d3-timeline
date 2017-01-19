# ng-d3-timeline

Angular directive that wraps the [`d3.timeline` module by @jiahuang](https://github.com/jiahuang/d3-timeline)

See [demo plunker](http://plnkr.co/edit/atRu85zH9vJkLOzMEe7t?p=preview) for sample configurations.

## Using ng-d3-timeline

Not currently set up for bower or other package install, so for now:

  * clone this repo
  * include the `src/ng-d3-timeline.js` file somewhere in your project and add a script reference in `index.html`
  * inject the `'ngD3Timeline'` module into your angular dependencies
  * use in markup with <ng-d3-timeline> element tag or attribute


### Differences from original d3.timeline

  Params to pass in as attributes:

  * `timeline-data` :: { Array }

    The data to display, an array of objects with a `times` property, whose value is the data points to display, e.g.:

      [
          {
              times: [
                {"begin": 1355752800000, "end": 1355759900000},
                {"begin": 1355767900000, "end": 1355774400000}
            ]
          },
          {
              times: [
                {"begin": 1355783100000, "end": 1355791300000},
                {"begin": 1355792100000, "end": 1355793400000}
              ]
          }
        ]

  * `timeline-options` :: { Object }

  An object whose properties configure the timeline (options listed below).

#### Datetime parameter(s) to pass in:
  
  **EITHER** (for discrete data points):

  * `date-field` :: { String (literal or angular expression) }

  	Datetime property name

  **OR** (for date/time ranges):

  * `start-field` :: { String (literal or angular expression) }

    Start datetime property name (e.g. `begin` in the above data example)

  	**AND**

  * `end-field`   :: { String (literal or angular expression) }

    End datetime property name (e.g. `end` in the above data example)

**Note:** If `date-field` attribute is given a value in the markup, it will override any start or end parameters given.

## Configuring the timeline

The following properties are configurable from your angular controller (along with default values):

  * **display:** 'rect', (or 'circle')
  * **width:** null,     (Number)
  * **height:** null,    (Number)
  * **tickFormat:** {
    format: d3.time.format("%I %p"),
    tickTime: d3.time.hours,
    tickInterval: 1,
    tickSize: 6
  },
  * **hover:** function () {},
  * **mouseover:** function () {},
  * **mouseout:** function () {},
  * **click:** function () {},
  * **scroll:** function () {},
  * **scrollable:** false,
  * **labelFunction:** function(label) { return label; },
  * **navigateLeft:** function () {},
  * **navigateRight:** function () {},
  * **orient:** "bottom",
  * **rowSeparatorsColor:** null,
  * **backgroundColor:** null,
  * **colorPropertyName:** null,
  * **colorCycle:** d3.scale.category20(),

      	// can be set from controller with IIFE like:
      	colorCycle: (function() {
          return d3.scale.ordinal()
              .range(['#6b0000','#ef9b0f','#ffee00'])
                .domain(['apple','orange','lemon']);
      	})()

  * **beginning:** 0,
  * **labelMargin:** 0,
  * **ending:** 0,
  * **margin:** {
    left: 30,
    right:30,
    top: 30,
    bottom:30
  },
  * **stacked:** false,
  * **rotateTicks:** false, (Number, in degrees)
  * **timeIsRelative:** false,
  * **fullLengthBackgrounds:** false,
  * **itemHeight:** 20,
  * **itemMargin:** 5,
  * **navMargin:** 60,
  * **showTimeAxis:** true,
  * **showAxisTop:** false,
  * **showTodayLine:** false,
  * **timeAxisTick:** false,
  * **timeAxisTickFormat:** {
    stroke: 'stroke-dasharray',
    spacing: '4 10'
  },
  * **showTodayFormat:** {
    marginTop: 25,
    marginBottom: 0,
    width: 1,
    color: colorCycle
  },
  * **showBorderLine:** false,
  * **showBorderFormat:** {
    marginTop: 25,
    marginBottom: 0,
    width: 1,
    color: colorCycle
  },
  * **showAxisHeaderBackground:** false,
  * **showAxisNav:** false,
  * **showAxisCalendarYear:** false,
  * **axisBgColor:** "white"


### Scrolling
**Note:** If you want the timeline to be horizontally scrollable, as can be accomplished with `d3.timeline`, you must set `scrollable: true`, in the configuration options object. Additionally, you can set the custom `scroll` callback to execute on scroll.


##License
MIT