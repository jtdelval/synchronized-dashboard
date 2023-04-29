function switchChart() {
  var x = document.getElementById("barh_container");
  var y = document.getElementById("pie_container");
  if (x.style.display === "none") {
    y.style.display = "none";
    x.style.display = "block";
  } else {
    x.style.display = "none";
    y.style.display = "block";
  }
}

var arrayMe = false;
var bgc = "#eef9ff";
var color_one = "#C24F3D"; //distillate -- currently red
var color_two = "#913DC2"; //gas -- currently purple
var color_three = "#3DB0C2"; //hydro -- currently blue
var color_four = "#6EC23D"; //wind -- currently green
/*
The purpose of this demo is to demonstrate how multiple charts on the same page
can be linked through DOM and Highcharts events and API methods. It takes a
standard Highcharts config with a small variation for each data set, and a
mouse/touch event handler to bind the charts together.
*/


/**
 * In order to synchronize tooltips and crosshairs, override the
 * built-in events with handlers defined on the parent element.
 */
['mousemove', 'touchmove', 'touchstart'].forEach(function (eventType) {
    document.getElementById('container').addEventListener(
      eventType,
      function (e) {
        var chart,
          point,
          i,
          event;
  
        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
          chart = Highcharts.charts[i];
          // Find coordinates within the chart
          event = chart.pointer.normalize(e);
          // Get the hovered point
          point = chart.series[0].searchPoint(event, true);
          
          //thedata = getTheData(point);
          if (chart['title'].textStr == 'Generation MW'){
            arrayMe = true;
            if (point){
              var num = (point.x - chart['xAxis'][0].dataMin) / (300 * 1000);
              var windp = chart['series'][0].processedYData[num];
              var hydrop = chart['series'][1].processedYData[num];
              var gasp = chart['series'][2].processedYData[num];
              var distp = chart['series'][3].processedYData[num];
              var coalp = chart['series'][4].processedYData[num];
              var expp = chart['series'][5].processedYData[num];
              var pumpp = chart['series'][6].processedYData[num];
              var whgdc = [['Wind', windp],['Hydro', hydrop], ['Gas (CCGT)', gasp], ['Distillate', distp], ['Black Coal', coalp]];
              updateGlobalEnergyData(whgdc);
              updateTablePowerCont([[windp, hydrop, gasp, distp, coalp], [expp, pumpp]])
            }
          }
          else {
            arrayMe = false;
          }
          
          if (chart['title'].textStr == 'Total'){
            chart['series'][0].update({data: globalEnergyData['values']});
            chart.redraw();
          }

          if (point) {
            if (chart['title'].textStr == 'Generation MW'){arrayMe=true;}
            point.highlight(e);
          }

          if (chart['title'].textStr == 'Price $/MWH'){
            if (chart['hoverPoint']){
              /*var num = (chart['hoverPoints'][0].x - chart['xAxis'][0].dataMin) / (300 * 1000);
              var pric = chart['series'][0].processedYData[num];*/
              updatePrice([["-", "-", "-", "-", "-"], ["-", "-"], ["$" + chart['hoverPoint'].y + ".00"]])
            }
          }
        }
      }
    );
  });
  
  ['mouseleave'].forEach(function (eventType) {
    document.getElementById('container').addEventListener(
      eventType,
      function (e) {
        var chart,
            point,
            i,
            event;
            
        for (i = 0; i < Highcharts.charts.length; i = i + 1) {
          chart = Highcharts.charts[i];
          // Find coordinates within the chart
          event = chart.pointer.normalize(e);
          // Get the hovered point
          point = chart.series[0].searchPoint(event, true);
          if (point) {
              point.onMouseOut(); 
              chart.tooltip.hide(point);
              chart.xAxis[0].hideCrosshair(); 
          }
        }
      }
    )
  });

  /**
   * Get data from the Gen chart
   * @returns data
   */
  function getTheData(point) {
    for (i = 0; i < Highcharts.charts.length; i = i + 1) {
      chart = Highcharts.charts[i];
      if (chart['title'].textStr == 'Generation MW'){
        var num = (point.x - chart['xAxis'][0].dataMin) / (300 * 1000);
        var windp = chart['series'][0].processedYData[num];
        var hydrop = chart['series'][1].processedYData[num];
        var gasp = chart['series'][2].processedYData[num];
        var distp = chart['series'][3].processedYData[num];
        var coalp = chart['series'][4].processedYData[num];
        var expp = chart['series'][5].processedYData[num];
        var pumpp = chart['series'][6].processedYData[num];

        var whgdc = [['Wind', windp],['Hydro', hydrop], ['Gas (CCGT)', gasp], ['Distillate', distp], ['Black Coal', coalp]];
        //updateGlobalEnergyData(whgdc);
        updateTablePowerCont([[windp, hydrop, gasp, distp, coalp], [expp, pumpp]])
        return whgdc;
        
      }
    }
  }
  /**
   * Override the reset function, we don't need to hide the tooltips and
   * crosshairs.
   */
  Highcharts.Pointer.prototype.reset = function () {
    return undefined;
  };
  
  /**
   * Highlight a point by showing tooltip, setting hover state and draw crosshair
   */
  Highcharts.Point.prototype.highlight = function (event) {
    if (arrayMe){
      event = this.series.chart.pointer.normalize(event);
      this.onMouseOver(); // Show the hover marker
      this.series.chart.tooltip.refresh([this]); // Show the tooltip
      this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    }
    else {
      event = this.series.chart.pointer.normalize(event);
      this.onMouseOver(); // Show the hover marker
      this.series.chart.tooltip.refresh(this); // Show the tooltip
      this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    }
    
    
  };
  
  /**
   * Synchronize zooming through the setExtremes event handler.
   */
  function syncExtremes(e) {
    var thisChart = this.chart;
  
    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
      Highcharts.each(Highcharts.charts, function (chart) {
        if (chart !== thisChart) {
          if (chart.xAxis[0].setExtremes) { // It is null while updating
            chart.xAxis[0].setExtremes(
              e.min,
              e.max,
              undefined,
              false,
              { trigger: 'syncExtremes' }
            );
          }
        }
      });
    }
  }

  var defaultTable = [
    [81, 60, 65, 0.02, 891],
    [.07, .051, .056, 0.00002, .765],
    ['$56.43', '$63.96', '$60.22', '$57.42', '$59.01'],
    [-2, -12],
    [-0.002, -0.01],
    ['$65.36', '$46.49'],
    ['$58.62']
  ];
  var defaultTablePower = [
    [81, 60, 65, 0.02, 891],
    [-2, -12],
  ]
  var defaultPrice = [
    ['$56.43', '$63.96', '$60.22', '$57.42', '$59.01'],
    ['$65.36', '$46.49'],
    ['$58.62']
  ]

  function imaginationBreaker(x) {
    updateTablePowerCont(defaultTablePower);
    updatePrice(defaultPrice);
  }

  function updateTablePowerCont(data) {
    pwr = data[0];
    pwr_sum = (pwr[0]+pwr[1]+pwr[2]+pwr[3]+pwr[4]).toFixed(0);
    document.getElementById('source_power').innerHTML = pwr_sum;
    document.getElementById('wind_power').innerHTML = replaceNeg(pwr[0].toFixed(0));
    document.getElementById('hydro_power').innerHTML = replaceNeg(pwr[1].toFixed(0));
    document.getElementById('gas_power').innerHTML = replaceNeg(pwr[2].toFixed(0));
    document.getElementById('distillate_power').innerHTML = replaceNeg(pwr[3].toFixed(2));
    document.getElementById('coal_power').innerHTML = replaceNeg(pwr[4].toFixed(0));

    cont = pwr.map(function(x) {return (x / pwr_sum);});
    document.getElementById('wind_contribution').innerHTML = percenter(cont[0].toFixed(3));
    document.getElementById('hydro_contribution').innerHTML = percenter(cont[1].toFixed(3));
    document.getElementById('gas_contribution').innerHTML = percenter(cont[2].toFixed(3));
    document.getElementById('distillate_contribution').innerHTML = percenter(cont[3].toFixed(5));
    document.getElementById('coal_contribution').innerHTML = percenter(cont[4].toFixed(3));

    exp = data[1];
    document.getElementById('exports_power').innerHTML = replaceNeg(exp[0]);
    document.getElementById('pumps_power').innerHTML = replaceNeg(exp[1]);

    load_sum = exp[0] + exp[1]
    net = parseInt(pwr_sum) + load_sum
    exc = exp.map(function(x) {return x / net;})
    document.getElementById('exports_contribution').innerHTML = percenter(exc[0].toFixed(3));
    document.getElementById('pumps_contribution').innerHTML = percenter(exc[1].toFixed(3));

    document.getElementById('net_power').innerHTML = net;
    document.getElementById('renewable_contribution').innerHTML = percenter(cont[0] + cont[1]);
  }
  function updatePrice(data) {
    
    val = data[0];
    document.getElementById('wind_value').innerHTML = val[0];
    document.getElementById('hydro_value').innerHTML = val[1];
    document.getElementById('gas_value').innerHTML = val[2];
    document.getElementById('distillate_value').innerHTML = val[3];
    document.getElementById('coal_value').innerHTML = val[4];

    exv = data[1];
    document.getElementById('exports_value').innerHTML = exv[0];
    document.getElementById('pumps_value').innerHTML = exv[1];

    pri = data[2];
    document.getElementById('source_value').innerHTML = pri[0];
  }

  function percenter(val) {
    if (val == 0) {
      return replaceNeg(val);
    }
    return ((val * 100).toFixed(1)).toString() + "%";
  }

  function replaceNeg(val) {
    if (val == 0) {
      return "-"
    }
    return val
  }

  var globalEnergyData = {
    values: []
  };
  
  function updateGlobalEnergyData(data) {
    globalEnergyData['values'] = [];
    globalEnergyData['values'] = data;
  }
  

  // Get the data. The contents of the data file can be viewed at
  Highcharts.ajax({
    
    url: 'assets/springfield.json',
    dataType: 'text',
    success: function (activity) {
  
      activity = JSON.parse(activity);

      if (globalEnergyData["values"].length == 0){
        var nu = [['Wind', activity[5]['history']['data'][0]],
        ['Hydro', activity[3]['history']['data'][0]],
        ['Gas (CCGT)', activity[2]['history']['data'][0]],
        ['Distillate', activity[1]['history']['data'][0]],
        ['Black Coal', activity[0]['history']['data'][0]]];
        updateGlobalEnergyData(nu);
      }

      //BEGIN BARH

      var chartDivBarh = document.createElement('div');
      chartDivBarh.classname = 'chart'
      document.getElementById('barh_container').appendChild(chartDivBarh);

      Highcharts.chart(chartDivBarh, {
        chart: {
          type: 'bar',
          backgroundColor: bgc,
          height: '50%'
        },
        title: {
          text: 'Total'
        },
        xAxis: {
          categories: ['Wind', 'Hydro', 'Gas (CCGT)', 'Distillate', 'Black Coal'],
          title: {
            text: null
          }
        },
        yAxis: {
          min: 0,
          title: {
            text: null
          }
        },
        plotOptions: {
          bar: {
            colorByPoint: true,
            colors: [color_four, color_three, color_two, color_one, '#121212'],
            dataLabels: {
              enabled: true
            },
          }
        },
        tooltip: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        credits: {
          enabled: false
        },
        series: [{
          data: globalEnergyData['values']
        }]
      })

      //BEGIN PIE
      
      var chartDivPie = document.createElement('div');
      chartDivPie.classname = 'chart'
      document.getElementById('pie_container').appendChild(chartDivPie);

      Highcharts.chart(chartDivPie, {
        chart: {
          type: 'pie',
          backgroundColor: bgc,
        },
        title: {
          text: 'Total'
        },
        plotOptions: {
          pie: {
            borderColor: '#000000',
            colors: [color_four, color_three, color_two, color_one, '#121212'],
            size: '50%',
            innerSize: '50%'
          }
        },
        series: [{
          data: globalEnergyData['values']
        }]
      })

      //BEGIN AREA

      var chartDivArea = document.createElement('div');
      chartDivArea.classname = 'chart'
      document.getElementById('container').appendChild(chartDivArea);

      Highcharts.chart(chartDivArea, {
        chart: {
          type: 'area',
          height: '40%',
          backgroundColor: bgc
        },
        title: {
          text: 'Generation MW',
          align: 'left'
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        xAxis: {
          type: 'datetime',
          crosshair: true,
          events: {
            setExtremes: syncExtremes
          },
          dateTimeLabelFormats: {
            day: '%e. %b'
          },
          title: {
            enabled: false
          }
        },
        yAxis: {
          title: {
            text: null
          }
        },
        tooltip: {
          positioner: function () {
            return {
              // right aligned
              x: this.chart.chartWidth - this.label.width,
              y: 10 // align to title
            };
          },
          formatter: function() {
            let options = {
              dateStyle: "medium", 
              timeStyle: "short", 
              //timeZone: "America/New_York" //8
              timeZone: "UTC"
            }
            return new Date(this.x).toLocaleString('en-us',options)
          },
          borderWidth: 0,
          backgroundColor: 'none',
          shadow: false,
          shared: true,
          //followPointer: false,
          style: {
            fontSize: '18px'
          },
        },
        navigation: {
          buttonOptions: {
            verticalAlign: 'bottom'
          }
        },
        plotOptions: {
          area: {
            stacking: 'normal',
            lineColor: '#666666',
            lineWidth: 1,
            marker: {
              lineWidth: 1,
              lineColor: '#666666'
            },
            //enableMouseTracking: true,
            stickyTracking: false,
            trackByArea: true
            //trackByArea: false
            //findNearestPointBy: 'xy'
          },
          series: {
            states: {
              inactive: {
                opacity: 1
              }
            }
          }
        },
        series: [{
          name: 'Wind',
          data: activity[5]['history']['data'],
          pointStart: activity[5]['history']['start'] * 1000,
          pointInterval: 300 * 1000,
          color: color_four
        }, {
          name: 'Hydro',
          data: activity[3]['history']['data'],
          pointStart: activity[3]['history']['start'] * 1000,
          pointInterval: 300 * 1000,
          color: color_three
        }, {
          name: 'Gas (CCGT)',
          data: activity[2]['history']['data'],
          pointStart: activity[2]['history']['start'] * 1000,
          pointInterval: 300 * 1000,
          color: color_two
        }, {
          name: 'Distillate',
          data: activity[1]['history']['data'],
          pointStart: activity[1]['history']['start'] * 1000,
          pointInterval: 300 * 1000,
          color: color_one
        }, {
          name: 'Black Coal',
          data: activity[0]['history']['data'],
          pointStart: activity[0]['history']['start'] * 1000,
          pointInterval: 300 * 1000,
          color: '#121212'
        }, {
          name: 'Exports',
          data: activity[6]['history']['data'],
          pointStart: activity[6]['history']['start'] * 1000,
          pointInterval: 300 * 1000,
          visible: false
        }, {
          name: 'Pumps',
          data: activity[4]['history']['data'],
          pointStart: activity[4]['history']['start'] * 1000,
          pointInterval: 300 * 1000,
          visible: false
        }]
      });


      //BEGIN PRICE

      var priceset = activity[8];
      var priceset_start = priceset['history']['start'] * 1000;
      var price_timestamps = []
      for (var i = 1; i<priceset['history']['data'].length + 1; i++) {
          price_timestamps.push(priceset_start + (1800 * i * 1000))
      }
      priceset['history']["data"] = Highcharts.map(priceset['history']["data"], function(val, j) {
          return [price_timestamps[j], val]
      })

      var chartDivPrice = document.createElement('div');
      chartDivPrice.classname = 'chart'
      document.getElementById('container').appendChild(chartDivPrice);

      Highcharts.chart(chartDivPrice, {
          chart: {
              marginLeft: 40,
              spacingTop: 20,
              spacingBottom: 20,
              height: '20%',
              backgroundColor: bgc
          },
          title: {
              text: 'Price $/MWH',
              align: 'left',
              margin: 0,
              x: 30
          },
          plotOptions: {
            line: {
              step: 'left'
            }
          },
          credits: {
              enabled: false
          },
          legend: {
              enabled: false
          },
          navigation: {
            buttonOptions: {
              verticalAlign: 'bottom'
            }
          },
          xAxis: {
              crosshair: true,
              events: {
                  setExtremes: syncExtremes
              },
              dateTimeLabelFormats: {
                  day: '%e. %b'
              },
              type: 'datetime'
          },
          yAxis: {
              title: {
                  text: null
              },
              max: 300
          },
          tooltip: {
            positioner: function () {
              return {
                // right aligned
                x: this.chart.chartWidth - this.label.width,
                y: 10 // align to title
              };
            },
            borderWidth: 0,
            backgroundColor: 'none',
            pointFormat: '{point.y}',
            headerFormat: '',
            shadow: false,
            style: {
              fontSize: '18px'
            },
          },
        series: [{
            data: priceset['history']['data'],
            name: priceset['id'],
            type: 'line',
            color: color_one,
            fillOpacity: 0.3,
            tooltip: {
              valuePrefix: '$',
              valueSuffix: '.00'
            }
        }]
      })


      // BEGIN TEMPERATURE

      var tempset = activity[10];
      var tempset_start = tempset['history']['start'] * 1000;
      var temp_timestamps = []
      for (var i = 1; i<tempset['history']['data'].length + 1; i++) {
          temp_timestamps.push(tempset_start + (1800 * i * 1000))
      }
      tempset['history']["data"] = Highcharts.map(tempset['history']["data"], function(val, j) {
          return [temp_timestamps[j], val]
      })

      var chartDivTemp = document.createElement('div');
      chartDivTemp.classname = 'chart'
      document.getElementById('container').appendChild(chartDivTemp);

      Highcharts.chart(chartDivTemp, {
          chart: {
              marginLeft: 40,
              spacingTop: 20,
              spacingBottom: 20,
              height: '20%',
              backgroundColor: bgc
          },
          title: {
              text: 'Temperature °F',
              align: 'left',
              margin: 0,
              x: 30
          },
          credits: {
              enabled: false
          },
          legend: {
              enabled: false
          },
          navigation: {
            buttonOptions: {
              verticalAlign: 'bottom'
            }
          },
          xAxis: {
              crosshair: true,
              events: {
                  setExtremes: syncExtremes
              },
              dateTimeLabelFormats: {
                  day: '%b. %e'
              },
              type: 'datetime'
          },
          yAxis: {
              title: {
                  text: null
              },
              min: 0,
              max: 100
          },
          tooltip: {
            positioner: function () {
              return {
                // right aligned
                x: this.chart.chartWidth - this.label.width,
                y: 10 // align to title
              };
            },
            borderWidth: 0,
            backgroundColor: 'none',
            pointFormat: '{point.y}',
            headerFormat: '',
            shadow: false,
            style: {
              fontSize: '18px'
            },
        },
        series: [{
            data: tempset['history']['data'],
            name: tempset['id'],
            type: 'line',
            color: color_one,
            fillOpacity: 0.3,
            tooltip: {
              valueSuffix: ' degrees'
            }
        }]
      })
    }
});