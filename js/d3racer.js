// --- ---- D3RACE PREDICTION PLUGIN ---- ---
// *********     by mark oliver     *********
// 
// OPTIONS:
// container: jquery html element that will contain the animation
// runners: array of runners built in the format: [{betting_interest_number:Integer,runner_name:String,probability:Float},...]
// max_finishers: maximum number of runners shown on animation (defaults to 6).
// duration: milliseconds it will take winner to travel from start to finish (defaults to 3000).
// margin: percentage increase/decrease the speeds can change between control points (defaults to 10%).
// runner_dimensions: dimensions of runner gif (defaults to 62x44).
// 

var d3Racer = function(options) {
  this.init(options);
}

d3Racer.prototype.init = function(options) {
  try {
    if (options['container'][0] && options['runners']) {
      this.container = options['container'];
      this.runners = options['runners'];
      this.container.empty();
    } else if (options['runners']) {
      throw("Couldn't build d3racer. Container is a mandatory option!");
    } else {
      throw("Couldn't build d3racer. Runners is a mandatory option!");
    }
    if (options['runner_dimensions']) {
      this.runner_dimensions = {
        x: options['runner_dimensions'].split("x")[0],
        y: options['runner_dimensions'].split("x")[1]
      }
    } else {
      this.runner_dimensions = {x: 62, y: 44}
    }
    this.width = this.container.width();
    this.height = this.container.height();
    this.cp1 = Math.floor(this.width/3);
    this.cp2 = Math.floor(this.width/3)*2;
    this.max_finishers = parseInt(options['max_finishers']) || 6;
    this.duration = parseInt(options['duration']) || 3000;
    this.margin = (parseFloat(options['margin'])/50) || 0.2; // divide % by 50 to give double multiplier for +/-
    this.num_runners = (this.runners.length > this.max_finishers) ? this.max_finishers : this.runners.length;
    this.finish_multipliers = {0: 1.0, 1: 0.96, 2: 0.92, 3: 0.90, 4: 0.88, 5: 0.86, 6: 0.84, 7: 0.82, 8: 0.8, 9: 0.78, 10: 0.75};
    this.data = {};
    
    this.setup();
    this.run();
  } catch(e) {
    alert(e);
  }
}

d3Racer.prototype.setup = function() {
  var self = this;
  var probables = [];
  this.finishers = {};
  
  // build array of betting interest numbers weighted by runners probability of winning
  $.each(this.runners, function(i,runner) {
    for (i=0;i<(parseFloat(runner['probability'])*100);i++) probables.push(runner['betting_interest_number']);
  });
  
  // randomly select unique winners for each desired finish position
  for (i=0;i<this.num_runners;i++) {
    var filtered = [], name;
    var bin = probables[Math.floor(Math.random()*probables.length)];
    $.each(probables, function(i,filt) {
      if (filt != bin) filtered.push(filt);
    });
    probables = filtered;
    
    // data structure with finishing position and split times between control points
    $.each(self.runners, function(i,runner) {
      name = (runner['betting_interest_number'] == bin) ? runner['runner_name'] : name;
    });
    var split1 = Math.floor((self.duration/3)*(1+((Math.random()*self.margin)-(self.margin/2))));
    var split2 = Math.floor((self.duration/3)*(1+((Math.random()*self.margin)-(self.margin/2))));
    self.data[i+1] = {
      bin: bin,
      name: name,
      finish: (self.finish_multipliers[i] ? Math.floor(self.width*self.finish_multipliers[i]) : self.cp2),
      split1: split1,
      split2: split2,
      split3: self.duration-(split1+split2)
    };
  }
}

d3Racer.prototype.run = function() {
  var self = this;
  var order = this.order();
  
  var offset = function(pos) {return pos-self.runner_dimensions['x']};
  var y = d3.scale.linear()
    .domain([0, this.num_runners+1])
    .range([0, this.height]);
  
  var track = d3.select("#"+this.container.attr('id'))
    .append("svg:svg")
    .attr("width",this.width)
    .attr("height",this.height)
    .attr("id","racerSvg");
  
  $.each(order, function(i,position) {
    runner = self.data[position];
    track.append("svg:image")
      .attr("class", "d3runner position"+position)
      .attr("data-id", runner['bin'])
      .attr("data-name", runner['name'])
      .attr("x", offset(0))
      .attr("y", y(i))
      .attr("width", self.runner_dimensions['x'])
      .attr("height", self.runner_dimensions['y'])
      .attr("xlink:href", "../D3Racer/images/runner.gif")
      .transition()
        .duration(runner['split1'])
        .ease("linear")
        .attr("x", offset(self.cp1))
      .transition()
        .duration(runner['split2'])
        .delay(runner['split1'])
        .ease("linear")
        .attr("x", offset(self.cp2))
      .transition("linear")
        .duration(runner['split3'])
        .delay(runner['split1']+runner['split2'])
        .ease("linear")
        .attr("x", offset(runner['finish']))
      .transition()
        .duration(10000000)
        .delay(self.duration)
        .attr("xlink:href", "../D3Racer/images/runner.jpg");
    
    if (position == 1 || position == 2 || position == 3) {
      var text, fill, font;
      switch(position) {
        case 1:
          text = "1st: "+runner['bin'];
          fill = "#CD7F32";
          font = "#FFFFFF";
        break;
        case 2:
          text = "2nd: "+runner['bin'];
          fill = "#E6E8FA";
          font = "#000000";
        break;
        case 3:
          text = "3rd: "+runner['bin'];
          fill = "#8C7853";
          font = "#FFFFFF";
        break;
      }
      track.append("svg:rect")
        .attr("x", offset(runner['finish'])-60)
        .attr("y", y(i)+10)
        .attr("width", 60)
        .attr("height", 25)
        .attr("fill", fill)
        .attr("stroke", "#000")
        .attr("opacity", 0)
        .transition()
          .duration(500)
          .delay(self.duration)
          .attr("opacity", 1);
      track.append("svg:text")
        .attr("x", offset(runner['finish'])-55)
        .attr("text-anchor", "right")
        .attr("y", y(i)+28)
        .attr("height", 25)
        .attr("fill", font)
        .text(text)
        .attr("opacity", 0)
        .transition()
          .duration(500)
          .delay(self.duration)
          .attr("opacity", 1);
    } else {
      track.select(".runner"+position)
        .attr("title", "rollover");
    }
  });
}

d3Racer.prototype.order = function() {
  var arr = [], i = this.num_runners, j, temp;
  for (i=0;i<this.num_runners;i++) arr.push(i+1);
  while (--i) {
    j = Math.floor(Math.random()*(i+1));
    temp = arr[i];
    arr[i] = arr[j]; 
    arr[j] = temp;
  }
  return arr;
}

d3Racer.prototype.teardown = function() {
  this.container = null;
  this.width = null;
  this.height = null;
  this.cp1 = null;
  this.cp2 = null;
  this.runners = null;
  this.num_runners = null;
  this.max_finishers = null;
  this.duration = null;
  this.margin = null;
  this.finish_multipliers = null;
  this.data = null;
}
