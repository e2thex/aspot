Aspot (Aspot a Subject Predicate Object Transformer) goal is to provide codes a object-oreninted data model for arbrtrary data.  To do this the client libraries brake down all data into subject-predicate-object triplets for transmision to the data source.  This structure is also transmited to the client lib, where it is reconstucted in to a more object friendly interface.


.-----------------------------------------.
| b = db.datum("bob");                    |
| b.attr("first name").value = "Bob";     |
| b.attr("last name").value = "jones";    |
| jane = b.attr("mother");                |
| jane.attr("first name").value = "Jane"; |
| jane.attr("last name").value = "jones"; |
'-----------------------------------------'
                     |
                     |
                     v
     .------------------------------.
     |       Aspot client Lib       |
     |------------------------------|
     | Transforms attr instructions |
     | into triplets and            |
     | transports to server         |
     '------------------------------'
                     |
                     v
  .-------------------------------------.       .------------------.
  | add ["bob", "first name", "Bob"],   |       |   Aspot Server   |
  | add ["bob", "last name", "Jones"],  |       |------------------|
  | add ["bob", "mother", "jane"],      |------>| Takes Triplets   |
  | add ["jane", "first name", "Jane"], |       | and stores in DB |
  | add ["jane", "last name", "Jones"], |       '------------------'
  '-------------------------------------'                 |
                                                          v
                                                      _.-----._  
                                                    .-         -.
                                                    |-_       _-|
                                                    |  ~-----~  |
                                                    |           |
                                                    `._       _.'
                                                       "-----"   

#ASPOT Library Datums

Each library will provide an interface to data, that lets them 'walk' the data.  As there will not be a root object for data, one can start anywhere in the data and walk along.

for example. in the js lib 

zip = datum.attr("address").attr("zip");

would return the zip of the address of the current datum.attr



