# reds-thai (REDis Search THAI language)

  This project was forked from reds, a light-weight Redis search for node.js (https://github.com/visionmedia/reds).

  This project have two updates from reds.
  1. It supports Thai language. We uses Thai word segmentation from wordcut library (https://github.com/veer66/wordcut).
  2. It includes prefix search. originally, the reds does not index the prefix of words. The articles that have word `tomato` can not be found by search query `tom`. Users need to input the full query `tomato` to found them.

## Installation

      $ npm install reds-thai

## Example

The first thing you'll want to do is create a `Search` instance, which allows you to pass a `key`, used for namespacing within Redis so that you may have several searches in the same db.

    var search = reds-thai.createSearch('pets');

 reds-thai acts against arbitrary numeric or string based ids, so you could utilize this library with essentially anything you wish, even combining data stores. The following example just uses an array for our "database", containing some strings, which we add to reds-thai by calling `Search#index()` padding the body of text and an id of some kind, in this case the index.

```js
var strs = [];
strs.push('ภาษาไทย หรีอ English ก็ได้นะครับ');
strs.push('Tobi wants four dollars');
strs.push('Tobi only wants $4');
strs.push('Loki is really fat');
strs.push('Loki, Jane, and Tobi are ferrets');
strs.push('Manny is a cat');
strs.push('Luna is a cat');
strs.push('Mustachio is the Ferrari');

strs.forEach(function(str, i){ search.index(str, i); });
```

 To perform a query against reds-thai simply invoke `Search#query()` with a string, and pass a callback, which receives an array of ids when present, or an empty array otherwise.

```js
search
  .query(query = 'fer')
  .end(function(err, ids){
    if (err) throw err;
    console.log('Search results for "%s":', query);
    ids.forEach(function(id){
      console.log('  - %s', strs[id]);
    });
    process.exit();
  });
```

```
Search results for "fer":
  - Loki, Jane, and Tobi are ferrets
  - Mustachio is the Ferrari
```

 By default reds-thai performs an intersection of the search words, the following example would yield the following output:

```js
search
  .query(query = 'tobi dollars')
  .end(function(err, ids){
    if (err) throw err;
    console.log('Search results for "%s":', query);
    ids.forEach(function(id){
      console.log('  - %s', strs[id]);
    });
    process.exit();
  });
```

```
Search results for "tobi dollars":
  - Tobi wants four dollars
```

 We can tweak reds-thai to perform a union by passing either "union" or "or" to `reds-thai.search()` after the callback, indicating that _any_ of the constants computed may be present for the id to match.

```js
search
  .query(query = 'tobi dollars')
  .end(function(err, ids){
    if (err) throw err;
    console.log('Search results for "%s":', query);
    ids.forEach(function(id){
      console.log('  - %s', strs[id]);
    });
    process.exit();
  }, 'or');
```

 The intersection would yield the following since only one string contains both "Tobi" _and_ "dollars".

```
Search results for "tobi dollars":
  - Tobi wants four dollars
  - Tobi only wants $4
  - Loki, Jane, and Tobi are ferrets
```

## API

```js
reds-thai.createSearch(key)
Search#index(text, id[, fn])
Search#remove(id[, fn]);
Search#query(text, fn[, type]);
```

 Examples:

```js
var search = reds-thai.createSearch('misc');
search.index('Foo bar baz', 'abc');
search.index('Foo bar', 'bcd');
search.remove('bcd');
search.query('foo bar').end(function(err, ids){});
```

## About on English Language 

  Currently reds-thai strips stop words and applies the metaphone and porter stemmer algorithms to the remaining English words before mapping the constants in Redis sets (Thai words not apply). For example the following text:

    Tobi is a ferret and he only wants four dollars

  Converts to the following constant map:
  
```js
{
  Tobi: 'TB',
  ferret: 'FRT',
  wants: 'WNTS',
  four: 'FR',
  dollars: 'DLRS'
}
```

 This also means that phonetically similar words will match, for example "stefen", "stephen", "steven" and "stefan" all resolve to the constant "STFN". reds-thai takes this further and applies the porter stemming algorithm to "stem" words, for example "counts", and "counting" become "count".

 Consider we have the following bodies of text:

    Tobi really wants four dollars
    For some reason tobi is always wanting four dollars

 The following search query will then match _both_ of these bodies, and "wanting", and "wants" both reduce to "want".

    tobi wants four dollars

## License 

(The MIT License)

Copyright (c) 2014 Kobkrit Viriyayudhakorn &lt;kobkrit@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
