/*
 * generate a relatively unique id 
 *
 */
aspot = {}
aspot.uuid = function() {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789ABCDEF";
    for (var i = 0; i < 32; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[12] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01

    return s.join("");
}
aspot.isUUID = function(uuid) {
  return (
    (typeof uuid.substring == 'function') && //should be string
    uuid.match(/^[0-9A-F]{32,32}$/) //should be 32 char of hex
  );
}
aspot.triplet = function(spec) {
  spec = (typeof spec != 'undefined') ? spec : {};
  spec.predicate = (typeof spec.predicate != 'undefined') ? spec.predicate : '';
  spec.subject = typeof spec.subject != 'undefined' ? spec.subject : '';
  spec.object = typeof spec.object != 'undefined' ? spec.object : '';
  spec.hash = aspot.triplet.hash(spec);
  // I only want to freeze the S.P.O. but for now we feeze the whole thing
  spec.clone = function (changes) {
    nspec = {};
    nspec.predicate = (typeof changes.predicate != 'undefined') ? changes.predicate : this.predicate;
    nspec.subject = typeof changes.subject != 'undefined' ? changes.subject : this.subject;
    nspec.object = typeof changes.object != 'undefined' ? changes.object : this.object;
    return aspot.triplet(nspec);
  };
  Object.freeze(spec);

  return spec;
}
aspot.triplet.hash = function(spec) {
  return JSON.stringify( 
    { 
      subject:spec.subject, 
      predicate:spec.predicate, 
      object:spec.object, 
    }
  );
}
aspot.DB = function() {
  var that = {}
  that.query = function(query) {
    var ret = this.retrieve(aspot.query(query).compile());
    return ret;
  }
  that.retrieve = function(request) {
    this.lastRequest = request;
    return  [];

  }
  return that;
}
aspot.localDB = function(store) {
  var that = aspot.DB();
  that.store = {}
  that.insert = function(tri) { 
    tri = aspot.triplet(tri); //insure tri is a triplet
    this.store[tri.hash] = tri;
  }
  if(typeof store !== 'undefined') {
    store.forEach(function(trip) { that.insert(trip)});
  }
  that.remove = function (trip) {
    delete this.store[trip.hash];
  }
  that.datum = function(object) {
    return aspot.datum(this, object);
  }
  that.load = function (search) {
    trips = [];
    for( var key in this.store) {
      var find = true;
      if((typeof search.subject != 'undefined') &&
        (this.store[key].subject != search.subject)
        ){
        find = false;
      }
      if((typeof search.predicate != 'undefined') &&
        (this.store[key].predicate != search.predicate)
        ){
        find = false;
      }
      if((typeof search.object != 'undefined') &&
        (this.store[key].object != search.object)
        ){
        find = false;
      }
      if (find) {
        trips.push(this.store[key]);
      }
    }
   return trips;
  }
  that.requestLOOKUP = function (instruction) {
    var load = {};
    var variables = function() {
      that = {};
      that.variables = [];
      that.add = function (key, value) {
        while(typeof this.variables[key] === 'undefined') this.variables.push(null);
        this.variables[key] = value;
      }
      return that;
    }();
    ['subject', 'predicate', 'object'].forEach( function(part) {
      if(typeof instruction[part].name !== 'undefined') {
        variables.add(instruction[part].name, part);
      }
      if (instruction[part].value !== 'undefined') {
        load[part] = instruction[part].value;
      }
    });
    trips = this.load(load);
    var result = aspot.localDB.lookupTable();
    trips.forEach(function(trip) {
      var row = [];
      for(key in variables.variables) {
        if (variables.variables[key] !== null)
          row[key] = trip[variables.variables[key]];
        else
          row[key] = null;
      }
      result.add(row);
    });
    return result;
  }
  that.requestINTERSECT = function (instruction) {
    var lhs = this.request(instruction.lhs)
    var rhs = this.request(instruction.rhs)
    return lhs.intersect(rhs);
  }
  that.requestUNION = function (instruction) {
    var lhs = this.request(instruction.lhs)
    var rhs = this.request(instruction.rhs)
    return lhs.union(rhs);
  }
  that.request = function (instruction) {
    var key = 'request' + instruction.type;
    var table = this[key](instruction);
    return table;
  }
  that.retrieve = function(request) {
    var table = this.request(request.instruction);
    var db = this;
 
    items = table.table
      .map(function(row) {  return row[request.variable.name]})
    return items
      .filter(function(e,i) { 
        if(this.indexOf(e) == i) {
          return e
        }
      }, items)
      .map(function(value) {
        return db.datum(value)
      });
  }
  return that;
  // return new aspot.localDB.LocalTestDB(store);
}
aspot.localDB.lookupTable = function() {
  var that = {};
  that.table = [];
  that.add = function(row) {
    that.table.push(row)
  };
  that.union = function(table) {
    var ret = aspot.localDB.lookupTable();
    ret.table = this.table.concat(table.table);
    return ret;
  }
  that.intersect = function (table) {
    var intersectRow = function (lrow, rrow) {
      var new_row = JSON.parse(JSON.stringify(lrow)); //hacky
      if(rrow.every( function(item, index) {
        if(typeof new_row[index] === 'undefined') new_row[index] = null; 
        if(new_row[index] === null) new_row[index] = item;
        return (item === null) || (new_row[index] == item);
      })
      ) {
        return new_row;
      }
      return false;
    }
    var ret = aspot.localDB.lookupTable();
    this.table.forEach(function (lrow) {
      table.table.forEach(function(rrow) {
        if (new_row = intersectRow(lrow, rrow)) ret.add(new_row);
      })
    });
    return ret;
  }
  return that;
}
aspot.datumBranch = function(datum, trip, direction) {
  var that = function() { 
    return typeof attr === 'undefined' ? that.value : that.attr(attr);
  };
  that.direction = aspot.datumBranch.direction(direction);
  that.trip = aspot.triplet(trip);
  that.datum = datum;
  that.db = datum.db;

  //need test
  that.__defineGetter__("predicateValue", function(){
      return this.trip.predicate;
  });
 
  that.__defineSetter__("predicateValue", function(val){
      var trips = this.datum.db.load(this.trip);
      var update = trip.clone({predicate:val});
      for( var key in trips) {
        this.datum.db.remove(trips[key]);
      }
      this.datum.db.insert(update);
      this.trip = update;
  });

  that.__defineGetter__("value", function(){
      return this.trip[this.direction.endType];
  });
 
  that.__defineSetter__("value", function(val){
      var trips = this.datum.db.load(this.trip);
      var cloneChange = {}; cloneChange[this.direction.endType] = val;
      var update = trip.clone(cloneChange);
      for( var key in trips) {
        this.datum.db.remove(trips[key]);
      }
      this.datum.db.insert(update);
      this.trip = update;
  });

  that.attr = function(predicate, direction) {
    var d =aspot.datumBranch.direction(direction)
    var branch_trip = {predicate:predicate}; 
    branch_trip[d.startType] = this.value;
    return aspot.datumHelpers.attr(branch_trip, this.db, datum, direction); 
   
  }

  that.attrs = function(direction) {
    var d =aspot.datumBranch.direction(direction)
    var search_trip = {}; 
    search_trip[d.startType] = this.value
    var trips = this.db.load(search_trip);
    var attrs = trips.map(function(trip) { return trip.predicate });
    return attrs.filter(function(val, index) { 
      return index == attrs.indexOf(val);
    });
  }
  return that;

}
aspot.datumBranch.direction = function(direction) {
  that = {}
  that.direction = typeof direction === 'undefined' ? 'right' : direction;
  that.startType = that.direction === 'right' ? 'subject' : 'object';
  that.endType = that.startType === 'subject' ? 'object' : 'subject';
  return that;
}
aspot.datum = function(db, value) {
  var that = function(attr) { 
      return typeof attr === 'undefined' ? that.value : that.attr(attr);
    };

  that.value = value;
  that.db = db
 
  that.__defineGetter__("value", function(){
       return value;
  });
 
  that.__defineSetter__("value", function(val){
      trips = this.db.load({subject:value});
      for( var key in trips) {
        update = trips[key].clone({subject:val});
        this.db.remove(trips[key]);
        this.db.insert(update);
      }
      value = val;
  });

  that.attr = function(predicate, direction) {
    var d =aspot.datumBranch.direction(direction)
    var branch_trip = {predicate:predicate}; 
    branch_trip[d.startType] = this.value;
    return aspot.datumHelpers.attr(branch_trip, this.db, this, direction); 
  }
  that.attrs = function(direction) {
    var d =aspot.datumBranch.direction(direction)
    var search_trip = {}; 
    search_trip[d.startType] = this.value
    var trips = this.db.load(search_trip);
    var attrs = trips.map(function(trip) { return trip.predicate });
    return attrs.filter(function(val, index) { 
      return index == attrs.indexOf(val);
    });
 
  }

  /*
   * this is dead for now
  that.__defineGetter__("walk", function(){
    walker = {}
    datum = this;
    this.db.load({subject:value}).forEach(function (trip) {
      walker.__defineGetter__(trip.predicate, function(){
        return aspot.datum(datum.db, trip.object)
      });
    }, datum);
    return walker;

  });
  that.po = function() {
  }
  */
  return that;
}
aspot.datumHelpers = {}
aspot.datumHelpers.attr = function(branch_trip, db, datum, direction) {
    var branches = function(attr) { return this[0](attr) };
    branches.map = Array.prototype.map;
    branches.push = Array.prototype.push;
    branches.concat = Array.prototype.concat;
    branches.indexOf = Array.prototype.indexOf;
    branches.join = Array.prototype.join;
    branches.lastIndexOf = Array.prototype.lastIndexOf;
    branches.pop = Array.prototype.pop;
    branches.push = Array.prototype.push;
    branches.reverse = Array.prototype.reverse;
    branches.shift = Array.prototype.shift;
    branches.slice = Array.prototype.slice;
    branches.sort = Array.prototype.sort;
    branches.splice = Array.prototype.splice;
    branches.toString = Array.prototype.toString;
    branches.unshift = Array.prototype.unshift;
    branches.valueOf = Array.prototype.valueOf;
    db.load(branch_trip)
      .forEach(function(trip) {
        branches.push(aspot.datumBranch(datum, trip, direction));
      });
    branches.datum = datum;
    branches.branch_trip = branch_trip;
    branches.direction = direction

    if(branches.length <1) {
      branches.push(aspot.datumBranch(datum, branch_trip, direction));
    }
    branches.__defineGetter__("value", function(){
      return branches[0].value;
    });
   
    branches.__defineSetter__("value", function(val){
      branches[0].value = val;
    });
    //TODO NEEDS TEST
    branches.new = function () {
      return aspot.datumBranch(this.datum, this.branch_trip, this.direction);
    }
    branches.attr = function (attr, direction) { return branches[0].attr(attr, direction);}
    branches.attrs = function (direction) { return branches[0].attrs(direction);}
    return branches;
 
}

/*
 *
 * Imp
 *  * Query                       : Trail
 *  * Trail                       : Trail_Item Trail
 *  * Trail                       : Trail_Item
 *  * Trail_Item                  : getFromPredicateValue
 *    Trail_Item                  : getFromPredicateWhere
 *    Trail_Item                  : getPredicate
 *  * Trail_Item                  : [Where_Item]
 *    Trail_Item                  : getSelf
 *    getSelf                     : VALUE
 *  * getFromPredicateValue       : ."STRING"  
 *  * getFromPredicateValue       : .<"STRING" 
 *  * getFromPredicateValue       : .>"STRING"
 *    getFromPredicateValue       : .><"STRING"
 *    getFromPredicateWhere       : .{Where_Item}
 *    getFromPredicateWhere       : .>{Where_Item}
 *    getFromPredicateWhere       : .<{Where_Item}
 *    getFromPredicateWhere       : .><{Where_Item}
 *    getPredicate                : @
 *  * WhereClause                 : trailExists
 *  * WhereClause                 : trailCompare
 *    WhereClause                 : WhereClause AND WhereClause
 *    WhereClause                 : WhereClause OR WhereClause
 *  * trailExists                 : Trail EXISTS
 *  * trailCompare                : Trail = "STRING"
 *    trailCompare                : Trail < "STRING"
 *    trailCompare                : Trail > "STRING"
 *    trailCompare                : Trail != "STRING"
 *    trailCompare                : Trail CONTAINS "STRING"
 *  * trailCompare                : = "STRING"
 *    trailCompare                : < "STRING"
 *    trailCompare                : > "STRING"
 *    trailCompare                : != "STRING"
 *    trailCompare                : CONTAINS "STRING"
 *  
 */
aspot.query = function(query, type) {
/*
  if(type == 'trail') {
    return aspot.query.trail(query);
    
  }
  */
  var that = {};
  that.trail = aspot.query.trail(query);
  that.compile = function() {
    return this.trail.compile(aspot.instruction.variable());
  }
  return that;
}
aspot.query.trail = function(query, type) {
  var trail_item = {}

  parseWhere = function(query) {
  //we make sure parse is a local variable
  var parse = false;
    if(parse = /^\[/.exec(query)) { 
      var count = 1;
      var where = query.split('').reduce(function (current, next, index) {
        if (index == 1) current = '';
        if (count == 0) return current;
        if (next == ']') count --;
        if (next == '[') count ++;
        if (count == 0) return current;
        return current + next;
      });
      if(count == 0) {
        return where;
      }
    }
  }
  if(parse = /^(\.|\..)"(.*?)"(.*)$/.exec(query)) { 
    var directions = {
      '.' : 'right',
      '.>' : 'right',
      '.<' : 'left',
    }
    var direction = directions[parse[1]];
    var value = parse[2];
    var trail = parse[3];
    trail_item = aspot.token.getFromPredicateValue(value, direction);
    query = trail;
  }
  else if(parse = /^(?:VALUE|SELF)(.*)$/.exec(query)) { 
    trail_item = aspot.token.getSelf();
    query = parse[1];
  }
  else if(where = parseWhere(query)) { 
    trail_item = aspot.query.where(where);
    query = query.substring(where.length+2);
  }
  else {
    throw new Error(query + " Could not be parsed");
  }
  if(query.length > 0) {
    var tail = aspot.query.trail(query);
    return aspot.token.trail(trail_item, tail)
  }
  else {
    return aspot.token.trail(trail_item)
  }
}
aspot.query.where = function(query) {
  var clause = {};
  //we make sure parse is a local variable
  var parse = false;
  if(parse = /^(.*?) (AND|OR) (.*)$/.exec(query)) { 
    var left = aspot.query.where(parse[1]);
    var clause = parse[2]=='AND' ? 'whereClauseAnd' : 'whereClauseOr';
    var right = aspot.query.where(parse[3]);
    clause = aspot.token[clause](left,right);
  }
  else if(parse = /^(.*) EXISTS$/.exec(query)) { 
    var trail = aspot.query.trail(parse[1]);
    clause = aspot.token.trailExists(trail);
  }
  else if(parse = /^(.*) (=|contains) "(.*)"$/.exec(query)) { 
    var operator = parse[2];
    var value = parse[3];
    var trail = aspot.query.trail(parse[1]);
    clause = aspot.token.trailCompare(trail, operator, value);
  }
  else {
    throw new Error("PARSE ERROR: " + query + " is not a valid Where Clause");
  
  }
  return aspot.token.where(clause);
}
aspot.token = {};
aspot.token.trail = function(item, tail) {
  var that = function(variable) {this.compile(variable)};
  that.item = item;
  that.tail = tail;
  that.compile = function(variable) {
    if(typeof this.tail === 'undefined') {
      return this.item.compile(variable);
    }
    else {
      var that = {}
      lhs = this.item.compile(variable);
      rhs = this.tail.compile(lhs.variable);
      return {
        instruction: aspot.instruction.intersect(lhs.instruction, rhs.instruction),
        variable: rhs.variable
      }
    }
  }

  return that;
}
aspot.token.where = function(clause) {
  var that = function(variable) {this.compile(variable)};
  that.clause = clause;
  that.compile = function(variable) {
    result = this.clause.compile(variable);
    result.variable = variable;
    return result;
  }
  return that;
}
aspot.token.whereClauseAnd = function(left, right) {
  var that = function(variable) {this.compile(variable)};
  that.lhs = left;
  that.rhs = right;
  that.compile = function(variable) {
    return  {
      instruction : 
        aspot.instruction.intersect(
          this.lhs.compile(variable).instruction, 
          this.rhs.compile(variable).instruction),
      variable: variable,
    }
  }
  return that;
}
aspot.token.whereClauseOr = function(left, right) {
  var that = function(variable) {this.compile(variable)};
  that.lhs = left;
  that.rhs = right;
  that.compile = function(variable) {
    return  {
      instruction : 
        aspot.instruction.union(
          this.lhs.compile(variable).instruction, 
          this.rhs.compile(variable).instruction),
      variable: variable,
    }
  }
  return that;
}
aspot.token.getSelf = function() {
  var that = {};
  that.compile = function(variable) {
    return {
      instruction : aspot.instruction.lookup(variable, variable.next(), variable.next()),
      variable: variable,
      part : 'subject'
    }
  };
  return  that;
}
aspot.token.getFromPredicateValue = function(value, direction) {
  that = function() { this.compile};
  that.value = value
  that.direction = direction
  that.compile = function(variable) {
    var newVar = variable.next()
    v0 = this.direction == 'right' ? variable : newVar;
    v1 = this.direction == 'right' ? newVar : variable;
    var instruction = aspot.instruction.lookup(
      v0,
      aspot.instruction.lookupPart("=", this.value),
      v1
    );
    return {instruction: instruction, variable: newVar}
  }

  return that;
}
aspot.token.trailCompare = function(trail, operator, value) {
  var that = {};
  that.operator = operator;
  that.value = value;
  that.trail = trail;
  
  that.compile = function(variable) {
    var lhsc = this.trail.compile(variable);
    var part = typeof lhsc.part === 'undefined' ? 'object' : lhsc.part;
    var rhs = aspot.instruction.lookup(
      part == 'subject' ? aspot.instruction.lookupPart(this.operator, this.value, lhsc.variable) : lhsc.variable.next(),
      part == 'predicate' ? aspot.instruction.lookupPart(this.operator, this.value, lhsc.variable) : lhsc.variable.next(),
      part == 'object' ? aspot.instruction.lookupPart(this.operator, this.value, lhsc.variable) : lhsc.variable.next()
    );
    return {
      instruction :aspot.instruction.intersect(lhsc.instruction, rhs),
      variable : lhsc.variable,
    }
  }
  return that;
}
aspot.token.trailExists = function(trail) {
  var that = {};
  that.trail = trail
  that.compile = function(variable) {
    return this.trail.compile(variable);
  }

  return that;
}
/*
 * * instruction : intersection
 * * instruction : lookup
 * * intersection: instruction instruction
 *   union       : instruction instruction
 * * lookup      : lookup_part lookup_part lookup_part
 * * lookup_part : variable
 * * lookup_part : {operator : , value: }
 * * lookup_part : {operator : , value:. name: }
*/
aspot.instruction = {}
aspot.instruction.lookup = function(subject, predicate, object) {
  var that = {}
  that.subject = subject;
  that.predicate = predicate;
  that.object = object;
  that.type = 'LOOKUP';
  return that;
}
aspot.instruction.intersect = function(lhs, rhs) {
  var that = {}
  that.lhs = lhs;
  that.rhs = rhs;
  that.type = 'INTERSECT';
  return that;
}
aspot.instruction.union = function(lhs, rhs) {
  var that = {}
  that.lhs = lhs;
  that.rhs = rhs;
  that.type = 'UNION';
  return that;
}
aspot.instruction.lookupPart = function(op, value, variable) {
  that = {};
  if (typeof variable !== 'undefined') {
    that.name = variable.name;
    that.compile = variable.counter;
    that.next = variable.next;
  }
  that.operator = op;
  that.value = value;
  return that;
}
aspot.instruction.variable = function(counter) {
  that = {}
  that.counter = typeof counter === 'undefined' ? aspot.instruction.variable.counter(): counter;
  that.name = that.counter.count;
  that.next = function() {
    this.counter.count ++;
    return aspot.instruction.variable(this.counter);
  }
  return that;
}
aspot.instruction.variable.counter = function() {
  var that = {}
  that.count = 0;
  return that;
}

if(typeof exports !== 'undefined') exports.aspot = aspot;
