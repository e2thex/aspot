var crud = require('../lib/crud.js');

helper = {};
helper.testUUID = function(func, test) {
  if (typeof func == 'function') {
    uuid = func();
  }
  else {
    uuid = func;
  }
  //test if uuid is a string
  test.ok(typeof uuid.substring == 'function', "UUID should be a string");
  if (uuid instanceof String) {
    test.equal(uuid.length, 32, "UUID should be 32 char long");
  }
}
helper.testTripletValues = function (test, message, tri, value) {

    test.equal(tri.subject, value.subject, message + ": Subject does not match");
    test.equal(tri.predicate, value.predicate, message + ": Predicate does not match");
    test.equal(tri.object, value.object, message + ": Object does not match");
}
helper.testTripletMutability = function(test,message, tri) {
  tri.predicate = "shouldnotchange";
  test.notEqual(tri.predicate, "shouldnotchange", "Predicate should be immutable");
  tri.object = "shouldnotchange";
  test.notEqual(tri.object, "shouldnotchange", "Predicate should be immutable");
  tri.subject = "shouldnotchange";
  test.notEqual(tri.subject, "shouldnotchange", "Predicate should be immutable");
}
helper.testTripletEquals = function (test, message, tri1, tri2, skipUUID) {
  test.ok(crud.triplet.isTriplet(tri1), message + ": First Item not Triplet");
  test.ok(crud.triplet.isTriplet(tri2), message + ": Second Item not Triplet");
  test.equal(tri1.subject, tri2.subject, message + ": Subject does not match");
  test.equal(tri1.predicate, tri2.predicate, message + ": Predicate does not match");
  test.equal(tri1.object, tri2.object, message + ": Object does not match");
  //allow skipping of UUID
  if(skipUUID) {
    test.equal(tri1.uuid, tri2.uuid, message + ": UUID does not match");
  }
}

  
exports.uuid = function (test) {
  helper.testUUID(crud.uuid, test);
  test.done();
};

exports.query = {
  queryCreation: function (test) {
    test.equal(typeof crud.query, 'function', "Should have query function");
    attr_trail = crud.query('."as_a"');
    test.equal(attr_trail.trail.item.predicate, "as_a");
  
    test.done();  
  },
  getObjectFromEqualPredicateCreation : function (test) {
    test.equal(typeof crud.query.getObjectFromEqualPredicate,'function', "Should have query.getObjectFromEqualPredicate function");
    attr_trail = crud.query.getObjectFromEqualPredicate('."as_a"');
    test.equal(attr_trail.predicate, "as_a");
    test.throws(function () {
      attr_trail = crud.query.getObjectFromEqualPredicate('"as_a"');
    }, " query.getObjectFromEqualPredicate show throw if the query is not parse able");
    test.done();
  },
  trailCreation : function (test) {
    test.equal(typeof crud.query.trail,'function', "Should have query.trailNode function");

    attr_trail = crud.query.trail('."as_a"');
    test.equal(attr_trail.item.predicate, "as_a");

    attr_trail = crud.query.trail('."friend_of"."as_a"');
    test.equal(attr_trail.item.predicate, "as_a", "trail should past the last item off to a getObjectFromEqualPredicate");
    test.equal(attr_trail.trail.item.predicate, "friend_of", "trail should past the not last item off to a new trail ");
    test.throws(function () {
      attr_trail = crud.query.trail('bob');
    }, " query.trail should throw if the query is not parse able");

    attr_trail = crud.query.trail('[."as_a" EXISTS]');
    test.equal(attr_trail.item.item.trail.item.predicate, "as_a","trail should return a where for its item");

    test.done();
  },
  trailExistsCreation : function (test) {
    test.equal(typeof crud.query.trailExists,'function', "Should have query.trailexists function");

    attr_trail = crud.query.trailExists('."friend_of"."as_a" EXISTS');
    test.equal(attr_trail.trail.item.predicate, "as_a", "trailExists should past the trail on to trail");
    test.equal(attr_trail.trail.trail.item.predicate, "friend_of", "trailExists should pass the trail on to trail");
    test.throws(function () {
      attr_trail = crud.query.trailExists('."as_a"');
    }, " query.trailExists should throw if the query is not parseable");
    test.done();
  },
  whereCreation : function (test) {
    test.equal(typeof crud.query.where,'function', "Should have query.where function");
    attr_trail = crud.query.where('."friend_of"."as_a" EXISTS');
    test.equal(attr_trail.item.trail.item.predicate, "as_a", "trailExists should past the trail on to trail");
    test.equal(attr_trail.item.trail.trail.item.predicate, "friend_of", "trailExists should pass the trail on to trail");
/*
    test.throws(function () {
      attr_trail = crud.query.trailExists('."as_a"');
    }, " query.trailExists should throw if the query is not parseable");
    */
    test.done();
  }

}

exports.DB = {
  DBExists : function (test) {
  test.equals(typeof crud.DB, 'function');
  test.done();
  },

  variable : function(test) {
    db = crud.DB();
    test.equal(typeof db.variable,'function', "DB should have variable function");
    variable = db.variable("1");
    test.equal(variable.name, "1", "A db.variable should have the name that was used to create it");
    test.equal(variable.final, false, "A db.variable that is named should not have final set");
    
    variable = db.variable();
    test.equal(variable.final, true, "A db.variable that is not named should be the final one");
    test.done();
  },
  /*

  parseQuery : function(test) {
    test.equal(typeof crud.DB.parseQuery,'function', "DB should have a parseQuery function");
    DB = crud.DB;

    query = DB.parseQuery('.(=)"is_a_owner_of"');
    result = [
      { 
      subject: { variable: DB.variable(1), }, 
      predicate: { operator: "=", value : "is_a_owner_of", },
      object: { variable: DB.variable(), } }
    ]
    test.equal(JSON.stringify(query), JSON.stringify(result), "Test attrChain");

    query = DB.parseQuery('.(=)"is_friend_of".(=)"is_a_owner_of"');
    result = [
      { subject: { variable: DB.variable(2), }, predicate: { operator: "=", value : "is_friend_of", }, object: { variable: DB.variable(1), } },
      { subject: { variable: DB.variable(1), }, predicate: { operator: "=", value : "is_a_owner_of", }, object: { variable: DB.variable(), } }
    ]
    test.equal(JSON.stringify(query), JSON.stringify(result), "Test attrChain Level2");

    query = DB.parseQuery('[.(=)"type_of"].(=)"is_a_owner_of"');
    result = [
      {subject: { variable: DB.variable(1), }, 
       predicate: { operator: "=", value : "type_of", }, 
       object: { variable: DB.variable(2), } },
      {subject: { variable: DB.variable(1), }, 
       predicate: { operator: "=", value : "is_a_owner_of", }, 
       object: { variable: DB.variable(), } }
    ]
    // 
    // . = attr passthrough
    // [] where
    //
    /*
    .(=)"is_a_owner_of"
    s:= v(1), p:=is_a_owner_of, v();
    .(=)"is_a_owner_of".(=)"is_a"
    s:= v(2), p:=is_a_owner_of, v(1);
    s:= v(1), p:=is_a, v();
    .(=)"is_a_owner_of".(=)"is_a".(=)"type_of"
    s:is v(4), p:=is_a_owner_of, is v(3);
    s:is v(2), p:=is_a, is v(1);
    s:is v(1), p:=type_of, is v();

    [.(=)"is_a" = "dog"].(=)"is_a_owner_of"
    s:= v(1), p:=is_a,, o:=dog
    s:= v(1), p:=is_a_owner_of,, o:=v()
    [.(=)"is_a".(=)"is_a" = "type"].(=)"is_a_owner_of"
    [."is_a"."is_a" = "type"]."is_a_owner_of"
    s:= v(1), p:="is_a", o:=v(2)
    s:= v(2), p:="is_a", 0:="type"
    s:= v(1), p:="is_a_owner_of", o:=v()
    [.(ANY).(=)"area_code" = '202'].(=)"adress".(=).zip
    [.(ANY)."area_code" = '202']."adress"."zip"
    */
    /*
    db = new crud.localTestDB();
    test.equal(typeof db.variable,'function', "localTestDB should have variable function");
    s:= v(1), p:=is_a,, o:=dog
    s:= v(1), p:=is_a_owner_of,, o:=v()
    
    values {
      v(1) : joe, james
    }

    {
      subject: {
        value : ''
        operator : ''
      },
      predicate: {
        value : ''
        operator : ''
      },
      object: {
        value : ''
        operator : ''
      }
    }
    varable = exports.variable(exports.uuid());

    test.done();
  },
  */
  retrieve : function(test) {
    test.done();
  }


}

exports.triplet = {
  Hash : function (test) {
    var trip = {subject:'bob', predicate:'is_a', object : 'human'};
    var trip1 = {subject:'bob', predicate:'is_a', object : 'human', other:'otherstuff'};
    test.equal(crud.triplet.hash(trip), JSON.stringify(trip), "Hash function shoulw be a stringify of the triplet");
    test.equal(crud.triplet.hash(trip1), JSON.stringify(trip), "Has function should be a stringify of the subject, predicate and object of the triplet");
    test.done();
  },
  Creation : function (test) {
    test.equals(typeof crud.triplet, 'function', "triplet Should Exist");
    trip = crud.triplet();
    helper.testTripletValues(test,"Triplet Default should be empty strings", trip,{subject:'', object:'', predicate:''});
    helper.testTripletMutability(test,"", trip); //triplet should not be mutable
    trip = crud.triplet({subject:'bob', predicate:'is_a', object : 'human'} );
    helper.testTripletValues(test,"Triplet should pass throw triplet values", trip, {subject:'bob', predicate:'is_a', object : 'human'} );
    //TODO: test for misformed triplets
    test.done();
  },
  Clone : function (test) {
    trip = crud.triplet({subject:'bob', predicate:'is_a', object : 'human'} );
    trip_tim = crud.triplet({subject:'tim', predicate:'is_a', object : 'human'} );
    trip_other = crud.triplet({subject:'bob', predicate:'is_a_pet_of', object : 'James'} );
    test.equals(typeof trip.clone, 'function', "triplet.clone Should Exist");
    new_trip = trip.clone({subject:'tim'});
    new_trip2 = trip.clone({ predicate:'is_a_pet_of', object : 'James'});
    test.notEqual(typeof new_trip, 'undefined',"triplet.clone should return an object");
    test.notEqual(typeof new_trip.hash, 'undefined',"triplet.clone should return a trip");
    test.equals(trip_tim.hash, new_trip.hash,"triplet.clone Should Create new trip with alterations");
    test.equals(trip_other.hash, new_trip2.hash,"triplet.clone Should Create new trip with alterations");

    test.done();

  
  }
}
exports.localTestDB = {
  exists : function (test) {
    test.equals(typeof crud.localTestDB, 'function', "localTestDB should exist");
    test.done();
  },
  store : function (test) {
    db = new crud.localTestDB();
    test.ok(db.store instanceof Object, "Store should be an Array");
    
    trip = {subject:'bob', predicate:'is_a', object : 'human'};
    test.equal(typeof db.insert,'function', "locakTestDB should have insert method");
    db.insert(trip);
    trip = crud.triplet(trip);
    test.equals(db.store[trip.hash], trip, "localTestDB insert should add to store array");
    helper.testTripletMutability(test,"", db.store[trip.hash]);  //store trip should not mutable
    test.equal(typeof db.remove,'function', "localTestDB should have remove method");
    db.remove(trip);
    test.equal(typeof db.store[trip.hash], 'undefined');
    trip1 = {subject:'bob', predicate:'is_a', object : 'human'};
    trip2 = {subject:'joe', predicate:'is_a', object : 'dog'};
    trip3 = {subject:'jake', predicate:'owner_of', object : 'joe'};
    trip4 = {subject:'jake', predicate:'friend_of', object : 'bob'};
    db.insert(trip1);
    db.insert(trip2);
    db.insert(trip3);
    db.insert(trip4);
    trip1 = crud.triplet(trip1);
    test.equal(typeof db.load,'function', "localTestDB should have load method");
    trips = db.load({subject:'bob'});
    test.equal(toString.call(trips), "[object Array]", "localTestDB.load should return array");
    test.equal(trip1.hash, trips[0].hash, "loadTestDb.load should find all items where the subject is matched.");
    test.equal(typeof trips[1], 'undefined' , "loadTestDb.load should find only items where the subject is matched.");

    trips = db.load({predicate:'is_a'});
    test.equal(trip1.hash, trips[0].hash, "loadTestDb.load should find all items where the predicate is matched.");
    test.equal(trip2.hash, trips[1].hash, "loadTestDb.load should find all items where the predicate is matched.");
    test.equal(typeof trips[2], 'undefined' , "loadTestDb.load should find only items where the subject is matched.");
    
    trips = db.load({object:'dog'});
    //test.equal('', trips);
    test.equal(trip2.hash, trips[0].hash, "loadTestDb.load should find all items where the object is matched.");
    test.equal(typeof trips[1], 'undefined' , "loadTestDb.load should find only items where the subject is matched.");
    
    trips = db.load({subject:'jake', predicate:'friend_of'});
    test.equal(trip4.hash, trips[0].hash, "loadTestDb.load should find all items where the subject and predicate are matched.");
    test.equal(typeof trips[1], 'undefined' , "loadTestDb.load should find only items where the subject is matched.");
    test.done();
  },
  datum : function (test) {
    db = new crud.localTestDB();
    trip1 = {subject:'bob', predicate:'is_a', object : 'human'};
    trip2 = {subject:'joe', predicate:'is_a', object : 'dog'};
    trip3 = {subject:'jake', predicate:'owner_of', object : 'joe'};
    trip4 = {subject:'jake', predicate:'friend_of', object : 'bob'};
    db.insert(trip1);
    db.insert(trip2);
    db.insert(trip3);
    db.insert(trip4);

    test.equal(typeof db.load,'function', "localTestDB should have datum method");
    test.equals(typeof crud.datum, 'function', "datum should exist");
    datum = db.datum("bob");
    test.equals(datum.value, "bob", "db.datum should create a datum using export.datum");
    test.done();
    
  }

}
exports.datums = {
  Contruct : function (test) {

    trip1 = {subject:'bob', predicate:'is_a', object : 'human'};
    trip2 = {subject:'joe', predicate:'is_a', object : 'dog'};
    trip3 = {subject:'joe', predicate:'is_a_pet_of', object : 'bob'};
    db = new crud.localTestDB();
    db.insert(trip1);
    db.insert(trip2);
    db.insert(trip3);

    test.ok(typeof crud.datum === 'function', "Function datum should exist");
    datum = crud.datum(db, "bob");
    test.equals(datum.value, "bob", "A new datum should save its value");
    test.equals(datum(), "bob", "A new datum should return it value if called as a function");
    test.done();
  },
  Value : function (test) {

    trip1 = {subject:'bob', predicate:'is_a', object : 'human'};
    trip2 = {subject:'joe', predicate:'is_a', object : 'dog'};
    trip3 = {subject:'joe', predicate:'is_a_pet_of', object : 'bob'};
    db = new crud.localTestDB();
    db.insert(trip1);
    db.insert(trip2);
    db.insert(trip3);
    datum = crud.datum(db, "bob");
    datum.value = 'tim';
    test.equals(datum.value, "tim", "A new datum value should change");
    trips = db.load({subject:'tim'});
    trip_tim = crud.triplet({subject:'tim', predicate:'is_a', object : 'human'});
    test.equal(trip_tim.hash, trips[0].hash, "Update a datum value should alter all trip where it is the subject.");

    test.done();
  },

  Attr : function (test) {
    trip1 = {subject:'bob', predicate:'is_a', object : 'human'};
    trip2 = {subject:'jane', predicate:'is_a', object : 'cat'};
    trip3 = {subject:'joe', predicate:'is_a', object : 'dog'};
    trip4 = {subject:'joe', predicate:'is_a_pet_of', object : 'bob'};
    db = new crud.localTestDB();
    db.insert(trip1);
    db.insert(trip2);
    db.insert(trip3);
    db.insert(trip4);
    datum = crud.datum(db, "joe");
 


    test.ok(typeof datum.attr == 'function', "datum should have attr function");

    test.equal(toString.call(datum.attr("is_a")), "[object Array]", "datum.attr should return array");
    test.notEqual(typeof datum.attr("is_a")[0],'undefined', "datum.attr should always have at least one item");
    test.equal(datum.attr("is_a")[0](), 'dog', "Getting an Attr should return a array of branch that when call will return the value of the branch");
    
    test.equal(datum.attr("is_a").value, 'dog', "If not called as an array the value should return the value of the first item");
    
    test.equal(datum.attr("friend_of")[0](), '', "Getting an Attr that does not exist should return a array with one item with a '' value");
    
    datum.attr("friend_of")[0].value = "Fred";
    test.equal(datum.attr("friend_of")[0](), "Fred", "Setting a value on a non exist branch should set the value for the branch");
    
    datum.attr("is_a_pet_of")[0].value = "jane";
    trips_a = db.load({subject:'joe', predicate: "is_a_pet_of"});
    trip3_new = crud.triplet({subject:'joe', predicate:'is_a_pet_of', object : 'jane'});
    test.equal(trip3_new.hash, trips_a[0].hash, "Changing an attr value should change the trip of that attr");
    test.equal(typeof trips_a[1], 'undefined' , "Changing an attr value should change the trip of that attr and nothing else");
    trips_b = db.load({subject:'bob'});
    test.equal(trip1.hash, trips_b[0].hash, "Changing an attr value should not effect the attr of the past object");



    test.equal(datum.attr("is_a_pet_of")[0].attr("is_a")[0](), "cat", "Attr should also allow a continuation to that items attributes");
    test.equal(datum.attr("is_a_pet_of").attr("is_a")[0](), "cat", "If Attr is not access as an array then .attr should access the attr function of the first item");

    test.done();
  },
  Set : function (test) {
  /*
    trip1 = {subject:'bob', predicate:'is_a', object : 'human'};
    trip2 = {subject:'jane', predicate:'is_a', object : 'cat'};
    trip3 = {subject:'joe', predicate:'is_a', object : 'dog'};
    trip4 = {subject:'joe', predicate:'is_a_pet_of', object : 'bob'};
    db = new crud.localTestDB();
    datum = new db.datum('joe');
    datum_return = datum.set("is_a", "dog").set("is_a_pet_of", "bob");
    
    trips_a = db.load({subject:'joe', predicate:"is_a"});
    test.equal(trip3.hash, trips_a[0].hash, "set should set the value of that attr");
    trips_b = db.load({subject:'joe', predicate:"is_a_pet_of"});
    test.equal(trip3.hash, trips_b[0].hash, "Set should be chainable");
  */
    test.done();
  }
}
