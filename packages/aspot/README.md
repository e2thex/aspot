# `ASPOT`

ASPOT is a subject Predicate Object Transformer.  It is a store that hold all of its data as a array of sentences with three parts subject predicate and object. As an example lets see some information about Bob.

| Subject                              | Predicate    | Object    |
| ------------------------------------ | ------------ | --------- |
| d47c38d1-4521-4c05-96a0-f14b3602bc3f | firstName    | Bob       |
| d47c38d1-4521-4c05-96a0-f14b3602bc3f | lastName     | Newhart   |
| d47c38d1-4521-4c05-96a0-f14b3602bc3f | age          | 75        |

Now lets add more info about Bob's husband and Bobs relationship

| Subject                              | Predicate    | Object    |
| ------------------------------------ | ------------ | --------- |
| fbf8d8d0-8886-4647-baa7-6cd82d45bf4c | firstName    | Sam       |
| fbf8d8d0-8886-4647-baa7-6cd82d45bf4c | lastName     | Newhart   |
| fbf8d8d0-8886-4647-baa7-6cd82d45bf4c | age          | 78        |
| d47c38d1-4521-4c05-96a0-f14b3602bc3f | Husband      | fbf8d8d0-8886-4647-baa7-6cd82d45bf4c       |

Because the data is stored in this way ASPOT can be use in a distribed manor where each of these sentences are updated independently of each other.

While the data is stored this way as you will see in Usage this is not how we access the data.

## Instalation

To install use npm or yarn

``` bash
npm install @asopt/core
```

or

``` bash
yarn install @asopt/core
```

## Usage

Aspot proves a store contructor function aspot.

``` js
import aspot from '@aspot/core'
const store = aspot();
```

By default the store is only held in memory it can be connect to local storage by using `localConnector`.

``` js
localConnector('localStoragekey')(store);
```

all change to the store will then be help in the browser localStorage.

There are two main was to use the store, one is to walk the nodes and the other is to do a search.

### Walking nodes

I will be using an example of date around a person named bob in the following section

to walk the nodes one first use `store.node` to initiate a node.

``` js
const bob = store.node('d47c38d1-4521-4c05-96a0-f14b3602bc3f')
```

we can then start walking the node tree using the `s` function.  and can use the `is` method to get values. One can use multiple `s` calls to keep walking'

``` js
const firstName = bob.s('firstName').is();
const lastName = bob.s('lastName').is();
cosnt husbandFirstName = bob.s('husband').s('firstName').is();
```

The `is` function can also be used to set values

``` js
bob.s('middleName').is('Juan');
```

Along with the `is` method  there is an `on` method that can be pass a function to run each time the value is updated.

``` js
bob.s('age').on(age => sendBirthdayCard('bob', age))

### Searching

Not yet documented
