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
  /*
  nspec = {};
  delete spec.predicate;
  Object.defineProperty(spec,"predicate", {value:predicate});
  delete spec.subject;
  Object.defineProperty(spec,"subject", {value:subject});
  delete spec.object;
  Object.defineProperty(spec,"object", {value:object});
  var hash = JSON.stringify(
    {
      subject:subject,
      predicate: predicate,
      object:object,
    }
  );
  Object.defineProperty(spec, "hash", {value:hash});
  return spec;
  */
  //return new aspot.triplet.Triplet(subject, object, predicate,uuid);
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

aspot.localDB = function(store) {
  var that = aspot.DB();
  that.store = typeof store !== 'undefined' ? store : {};
  that.insert = function(tri) { 
    tri = aspot.triplet(tri); //insure tri is a triplet
    this.store[tri.hash] = tri;
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
     else {
       load[part] = instruction[part].value;
       if(typeof instruction[part].variable !== 'undefined') {
         variables.add(instruction[part].variable.name, part);
       }
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
  that.intersect = function (table) {
    intersectRow = function (lrow, rrow) {
      var new_row = lrow
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
 


aspot.datumBranch = function(datum, trip) {
  var that = function() { return that.value};
  that.trip = aspot.triplet(trip);
  that.datum = datum;
  that.db = datum.db;

  that.__defineGetter__("value", function(){
      return this.trip.object;
  });
 
  that.__defineSetter__("value", function(val){
      var trips = this.datum.db.load(this.trip);
      var update = trip.clone({object:val});
      for( var key in trips) {
        this.datum.db.remove(trips[key]);
      }
      this.datum.db.insert(update);
      this.trip = update;
  });

  that.attr = function(predicate) {
    datum = this;
    branch_trip = {subject:datum.trip.object, predicate:predicate};
    return aspot.datumHelpers.attr(branch_trip,this.db, datum); 
   
  }

  //TODO needs test
  that.attrs = function() {
    trips = this.db.load({subject:that.trip.object});
    return trips.map(function(trip) { return trip.predicate });
  }
  return that;

}
aspot.datum = function(db, value) {
  var that = function() { return that.value};

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

  that.attr = function(predicate) {
    branch_trip = {subject:this.value, predicate:predicate};
    return aspot.datumHelpers.attr(branch_trip,this.db, this); 
  }
  //TODO needs test
  that.attrs = function() {
    trips = this.db.load({subject:that.value});
    return trips.map(function(trip) { return trip.predicate });
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
aspot.datumHelpers.attr = function(branch_trip, db, datum) {
    var branches = db.load(branch_trip)
      .map(function(trip) {
        return aspot.datumBranch(datum, trip);
      });
    branches.datum = datum;
    branches.branch_trip = branch_trip;

    if(branches.length <1) {
      branches.push(aspot.datumBranch(datum, branch_trip));
    }
    branches.__defineGetter__("value", function(){
      return branches[0].value;
    });
   
    branches.__defineSetter__("value", function(val){
      branches[0].value = val;
    });
    //TODO NEEDS TEST
    branches.new = function () {
      return aspot.datumBranch(this.datum, this.branch_trip);
    }
    branches.attr = function (attr) { return branches[0].attr(attr);}
    return branches;
 
}

/*
 *
 *
 *  * Query                       : Trail
 *  * Trail                       : Trail_Item Trail
 *  * Trail                       : Trail_Item
 *  * Trail_Item                  : getObjectFromEqualPredicate
 *  * Trail_Item                  : [Where_Item]
 *  * getObjectFromEqualPredicate : ."STRING"
 *  * Where                       : trailExists
 *  * Where                       : trailCompare
 *  * trailExists                 : Trail EXISTS
 *  * trailCompare                : Trail operator "STRING"
 *  * operator                    : =
 *  * 
 */
aspot.query = function(query) {
  var that = {};
  that.trail = aspot.query.trail(query);
  that.compile = function() {
    return this.trail.compile(aspot.query.instruction.variable());
  }
  return that;
}
aspot.query.getObjectFromEqualPredicate = function(query) {
  rx = /^\."(.*)"$/;
  parse = rx.exec(query);
  if(parse) {
    var that = {};
    that.predicate = parse[1];
  }
  else {
    throw new Error("PARSE ERROR: " + query + " is not a valid get Object from equal predicate attr trail");
  }
  that.compile = function(variable) {
    var newVar = variable.next()
    var instruction = aspot.query.instruction.lookup(
      variable,
      aspot.query.instruction.lookupPart("=", this.predicate),
      newVar
    );
    return {instruction: instruction, variable: newVar}
  }
  return that;
}

aspot.query.trail = function(query) {
  var that = {};

  parseWhere = function(query) {
    if(parse = /^\[/.exec(query)) { 
      var count = 1;
      where = query.split('').reduce(function (current, next, index) {
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
  if(parse = /^(\.".*?")(.*)$/.exec(query)) { 
    var getObjectFromEqualPredicate = parse[1];
    var trail = parse[2];
    that.item = aspot.query.getObjectFromEqualPredicate(getObjectFromEqualPredicate);
    query = trail;
  }
  else if(where = parseWhere(query)) { 
    that.item = aspot.query.where(where);
    query = query.substring(where.length+2);
  }
  else {
    throw new Error("PARSE ERROR: " + query + " is not a valid trail");
  }
  if(query.length > 0) {
    that.trail = aspot.query.trail(query);
  }
  that.compile = function(variable) {
    if(typeof this.trail === 'undefined') {
      return this.item.compile(variable);
    }
    else {
      var that = {}
      lhs = this.item.compile(variable);
      rhs = this.trail.compile(lhs.variable);
      return {
        instruction: aspot.query.instruction.intersect(lhs.instruction, rhs.instruction),
        variable: rhs.variable
      }
    }
  }
  return that;
}
aspot.query.trailCompare = function(query) {
  var that = {};
  if(parse = /^(.*) (=|contains) "(.*)"$/.exec(query)) { 
    var trail = parse[1];
    that.operator = parse[2];
    that.value = parse[3];
    that.trail = aspot.query.trail(trail);
    that.compile = function(variable) {
      var lhsc = this.trail.compile(variable);
      var v1 = lhsc.variable.next()
      var v2 = lhsc.variable.next()
      var rhs = aspot.query.instruction.lookup(
        v1,
        v2,
        aspot.query.instruction.lookupPart(this.operator, this.value, lhsc.variable)
      );
      return {
        instruction :aspot.query.instruction.intersect(lhsc.instruction, rhs),
        variable : v1
      }
    }

  }
  else {
    throw new Error("PARSE ERROR: " + query + " is not a valid trailExists");
  }
  return that;
}
aspot.query.trailExists = function(query) {
  var that = {};
  if(parse = /^(.*) EXISTS$/.exec(query)) { 
    var trail = parse[1];
    that.trail = aspot.query.trail(trail);
  }
  else {
    throw new Error("PARSE ERROR: " + query + " is not a valid trailExists");
  }
  that.compile = function(variable) {
    return this.trail.compile(variable);
  }

  return that;
}
aspot.query.where = function(query) {
  var that = {};
  if(parse = /EXISTS$/.exec(query)) { 
    that.item = aspot.query.trailExists(query);
  }
  else if(parse = /(=|CONTAINS) ".*"$/.exec(query)) { 
    that.item = aspot.query.trailCompare(query);
  }
  else {
    throw new Error("PARSE ERROR: " + query + " is not a valid Where Item");
  
  }
  that.compile = function(variable) {
    result = this.item.compile(variable);
    result.variable = variable;
    return result;
  }
  return that;
}
/*
 * instruction : intersection
 * instruction : lookup
 * intersection: instruction instruction
 * lookup      : lookup_part lookup_part lookup_part
 * lookup_part : variable
 * lookup_part : {operator : , value }
*/
aspot.query.instruction = {}
aspot.query.instruction.lookup = function(subject, predicate, object) {
  var that = {}
  that.subject = subject;
  that.predicate = predicate;
  that.object = object;
  that.type = 'LOOKUP';
  return that;
}
aspot.query.instruction.intersect = function(lhs, rhs) {
  var that = {}
  that.lhs = lhs;
  that.rhs = rhs;
  that.type = 'INTERSECT';
  return that;
  
}
aspot.query.instruction.lookupPart = function(op, value, variable) {
  var that = {}
  that.operator = op;
  that.value = value;
  that.variable = variable;
  return that;
}
aspot.query.instruction.variable = function(counter) {
  that = {}
  that.counter = typeof counter === 'undefined' ? aspot.query.instruction.variable.counter(): counter;
  that.name = that.counter.count;
  that.final = that.name === 0 ;
  that.next = function() {
    this.counter.count ++;
    return aspot.query.instruction.variable(this.counter);
  }
  return that;
}
aspot.query.instruction.variable.counter = function() {
  var that = {}
  that.count = 0;
  return that;
}

if(typeof exports !== 'undefined') exports.aspot = aspot;
