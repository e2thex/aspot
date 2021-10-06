# `aspot`

> TODO: description

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

There are two main was to use the store, one is to walk the nodes and the other is do do a find.

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

The is function can also be used to set valules

``` js
bob.s('middleName').is('Juan');
```

Along with the `is` method  there is an `on` method that can be pass a function to run each time the value is updated.

``` js
bob.s('age').on(age => sendBirthdayCard('bob', age))
