// --- ---- D3RACE PREDICTION PLUGIN ---- ---
// *********     by mark oliver     *********
// 
// OPTIONS:
// container: jquery html element that will contain the animation
// runners: array of runners built in the format: [{betting_interest_number:Integer,runner_name:String,probability:Float},...]
// max_finishers: maximum number of runners shown on animation (defaults to 6).
// duration: milliseconds it will take winner to travel from start to finish (defaults to 3000).
// margin: percentage increase/decrease the speeds can change between control points (defaults to 10%).
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
    this.width = this.container.width();
    this.height = this.container.height();
    this.cp1 = Math.floor(this.width/3);
    this.cp2 = Math.floor(this.width/3)*2;
    this.max_finishers = parseInt(options['max_finishers']) || 6;
    this.duration = parseInt(options['duration']) || 3000;
    this.margin = (parseFloat(options['margin'])/50) || 0.2; // divide % by 50 to give double multiplier for +/-
    this.num_runners = (this.runners.length > this.max_finishers) ? this.max_finishers : this.runners.length;
    this.finish_multipliers = {0: 1.0, 1: 0.9, 2: 0.8, 3: 0.75, 4: 0.7};
    this.data = {};
    
    this.finishers();
    this.setup();
    this.run();
    
    console.log(this.data);
  } catch(e) {
    alert(e);
  }
}

d3Racer.prototype.finishers = function() {
  var self = this;
  var probables = [];
  this.finishers = {};
  
  // build array of betting interest numbers weighted by runners probability of winning
  $.each(this.runners, function(i,runner) {
    for (i=0;i<(parseFloat(runner['probability'])*100);i++) probables.push(runner['betting_interest_number']);
  });
  
  // randomly select unique winners for each desired finish position
  for (i=0;i<this.num_runners;i++) {
    var filtered = [];
    var bin = probables[Math.floor(Math.random()*probables.length)];
    $.each(probables, function(i,filt) {
      if ($.inArray(filt,filtered) === -1 && filt != bin) filtered.push(filt);
    });
    probables = filtered;
    
    // data structure with finishing position and split times between control points
    var split1 = Math.floor((self.duration/3)*(1+((Math.random()*self.margin)-(self.margin/2))));
    var split2 = Math.floor((self.duration/3)*(1+((Math.random()*self.margin)-(self.margin/2))));
    self.data[i+1] = {
      bin: bin,
      finish: (self.finish_multipliers[i] ? Math.floor(self.width*self.finish_multipliers[i]) : self.cp2),
      split1: split1,
      split2: split2,
      split3: self.duration-(split1+split2)
    };
  }
}

d3Racer.prototype.setup = function() {
  
}

d3Racer.prototype.run = function() {
  
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
