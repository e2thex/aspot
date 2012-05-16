/*
 * generate a relatively unique id 
 *
 */
exports.uuid = function() {
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

exports.DB = function() {
  that = {}
  that.variable = exports.DB.variable;
  that.parseQuery = exports.DB.parseQuery;
  return that;
}
exports.DB.variable = function(name) {
  that = {}
  that.final = typeof name === 'undefined';
  that.name = that.final ? 0 : name;
  that.next = function() {
    return exports.DB.variable(this.name + 1);
  }
  return that;
}

exports.DB.parseQuery = function(query, ret, currentVariable) {
  data = {};
  data.current = typeof currentVariable === 'undefined' ? exports.DB.variable() : currentVariable;
  data.query = query;
  data.ret = typeof ret === 'undefined' ? [] : ret;
  operators = ['='];
  trail = ['\.'];
  exports.DB.parseQuery.attrChain(data);
  if (data.query.length >0) {
    data.ret = exports.DB.parseQuery(data.query, data.ret, data.current);
  }
  return data.ret;
}
/*
exports.DB.parseQuery.attrChain = function(data) {
  rx = /(.*)((?:\.)\((?:=)\)"[^"]*")$/;
  part = rx.exec(data.query)[2];
  rest = rx.exec(data.query)[1];
  if (part) {
    rx = /^(\.)\((=)\)"([^"]*)"$/;
    findings = rx.exec(part);
    item = {
      subject: {
        variable: data.current.next()
      },
      predicate :  {
        operator: findings[2],
        value : findings[3],
      },
      object : {
        variable: data.current
      }
    }
    data.ret.unshift(item);
    data.current = data.current.next();
    data.query = rest;
  }
}
*/
exports.triplet = function(spec) {
  spec = (typeof spec != 'undefined') ? spec : {};
  spec.predicate = (typeof spec.predicate != 'undefined') ? spec.predicate : '';
  spec.subject = typeof spec.subject != 'undefined' ? spec.subject : '';
  spec.object = typeof spec.object != 'undefined' ? spec.object : '';
  spec.hash = exports.triplet.hash(spec);
  // I only want to freeze the S.P.O. but for now we feeze the whole thing
  spec.clone = function (changes) {
    nspec = {};
    nspec.predicate = (typeof changes.predicate != 'undefined') ? changes.predicate : this.predicate;
    nspec.subject = typeof changes.subject != 'undefined' ? changes.subject : this.subject;
    nspec.object = typeof changes.object != 'undefined' ? changes.object : this.object;
    return exports.triplet(nspec);
    
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
  //return new exports.triplet.Triplet(subject, object, predicate,uuid);
}
exports.triplet.hash = function(spec) {
  return JSON.stringify( 
    { 
      subject:spec.subject, 
      predicate:spec.predicate, 
      object:spec.object, 
    }
  );
}

exports.localTestDB = function(store) {
  var that = {};
  that.store = {};
  that.insert = function(tri) { 
    tri = exports.triplet(tri); //insure tri is a triplet
    this.store[tri.hash] = tri;
  }
 that.remove = function (trip) {
   delete this.store[trip.hash];
 }
 that.datum = function(object) {
   return exports.datum(this, object);
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
 return that;
 // return new exports.localTestDB.LocalTestDB(store);
}


exports.datumBranch = function(datum, trip) {
  var that = function() { return that.value};
  that.trip = exports.triplet(trip);
  that.datum = datum;
  that.db = datum.db;

  that.__defineGetter__("value", function(){
      return trip.object;
  });
 
  that.__defineSetter__("value", function(val){
      trips = this.datum.db.load(trip);
      update = trip.clone({object:val});
      for( var key in trips) {
        this.datum.db.remove(trips[key]);
      }
      this.datum.db.insert(update);
      trip = update;
  });

  that.attr = function(predicate) {
    datum = this;
    branch_trip = {subject:datum.trip.object, predicate:predicate};
    return exports.datumHelpers.attr(branch_trip,this.db, this); 
   
  }

  return that;

}
exports.datum = function(db, value) {
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
    return exports.datumHelpers.attr(branch_trip,this.db, this); 
  }

  /*
   * this is dead for now
  that.__defineGetter__("walk", function(){
    walker = {}
    datum = this;
    this.db.load({subject:value}).forEach(function (trip) {
      walker.__defineGetter__(trip.predicate, function(){
        return exports.datum(datum.db, trip.object)
      });
    }, datum);
    return walker;

  });
  that.po = function() {
  }
  */
  return that;
}
exports.datumHelpers = {}
exports.datumHelpers.attr = function(branch_trip, db, datum) {
    branches = db.load(branch_trip)
      .map(function(trip) {
        return exports.datumBranch(datum, trip);
      });
    if(branches.length <1) {
      branches.push(exports.datumBranch(datum, branch_trip));
    }
    branches.__defineGetter__("value", function(){
      return branches[0].value;
    });
   
    branches.__defineSetter__("value", function(val){
      branches[0].value = val;
    });
    branches.attr = function (attr) { return branches[0].attr(attr);}
    return branches;
 
}

/*
 *
 *
 *  * Query                       : Trail
 *  * Trail                       : TrailTrail_Item
 *  * Trail                       : Trail_Item
 *  * Trail_Item                  : getObjectFromEqualPredicate
 *  * Trail_Item                  : [Where_Item]
 *  * getObjectFromEqualPredicate : ."STRING"
 *  * Where                       : trailExists
 *  * trailExists                 : Trail EXISTS
 *  * 
 */
exports.query = function(query) {
  var that = {};
  that.trail = exports.query.trail(query);
  return that;
}
exports.query.getObjectFromEqualPredicate = function(query) {

  rx = /^\."(.*)"$/;
  parse = rx.exec(query);
  if(parse) {
    var that = {};
    that.predicate = parse[1];
  }
  else {
    throw new Error("PARSE ERROR: " + query + " is not a valid get Object from equal predicate attr trail");
  }
  return that;
}

exports.query.trail = function(query) {
  var that = {};

  parseWhere = function(query) {
    if(parse = /]$/.exec(query)) { 
      var count = 1;
      where = query.split('').reverse().reduce(function (current, next, index) {
        if (index == 1) current = '';
        if (count == 0) return current;
        if (next == '[') count --;
        if (next == ']') count ++;
        if (count == 0) return current;
        return next + current;
      });
     if(count == 0) {
       return where;
     }
    }
  }
  if(parse = /^(.*)(\.".*")$/.exec(query)) { 
    var getObjectFromEqualPredicate = parse[2];
    var trail = parse[1];
    that.item = exports.query.getObjectFromEqualPredicate(getObjectFromEqualPredicate);
    query = trail;
  }
  else if(where = parseWhere(query)) { 
    console.log(where);
    that.item = exports.query.where(where);
    query = query.substring( 0, query.length - where.length-2);
  }
  else {
    throw new Error("PARSE ERROR: " + query + " is not a valid trail");
    console.log(query);
  }
  if(query.length > 0) {
    that.trail = exports.query.trail(query);
  }

  return that;
}
exports.query.trailExists = function(query) {
  var that = {};
  if(parse = /^(.*) EXISTS$/.exec(query)) { 
    var trail = parse[1];
    that.trail = exports.query.trail(trail);
  }
  else {
    throw new Error("PARSE ERROR: " + query + " is not a valid trailExists");
  }
  return that;
}
exports.query.where = function(query) {
  var that = {};
  if(parse = /EXISTS$/.exec(query)) { 
    that.item = exports.query.trailExists(query);
  }
  return that;

}
