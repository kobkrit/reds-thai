
/**
 * Module dependencies.
 */

var reds = require('../')
  , should = require('should')
  , redis = require('redis')
  , search = reds.createSearch('reds')
  , db = redis.createClient();

var start = new Date;

reds.version.should.match(/^\d+\.\d+\.\d+$/);

reds
  .words('foo bar baz สวัสดีครับ')
  .should.eql(['foo', 'bar', 'baz', 'สวัสดี','ครับ']);

reds
  .words(' Punctuation and whitespace; should be, handled. มาก เลย')
  .should.eql(['Punctuation', 'and', 'whitespace', 'should', 'be', 'handled', 'มาก', 'เลย']);

reds
  .stripStopWords(['this', 'is', 'just', 'a', 'test', 'ครับ'])
  .should.eql(['just', 'test', 'ครับ']);

reds
  .countWords(['foo', 'bar', 'baz', 'foo', 'jaz', 'foo', 'baz','ทดสอบ'])
  .should.eql({
    foo: 3
    , bar: 1
    , baz: 2
    , jaz: 1
    , ทดสอบ: 1
  });

reds
  .metaphoneMap(['foo', 'bar', 'baz', 'ทดสอบ'])
  .should.eql({
      foo: 'F'
    , bar: 'BR'
    , baz: 'BS'
    , ทดสอบ: 'ทดสอบ'
  });

reds
  .metaphoneArray(['foo', 'bar', 'baz','ทดสอบ'])
  .should.eql(['F', 'BR', 'BS','ทดสอบ'])

reds
  .metaphoneKeys('reds', ['foo', 'bar', 'baz','ทดสอบ'])
  .should.eql(['reds:word:F', 'reds:word:BR', 'reds:word:BS', 'reds:word:ทดสอบ']);

reds
  .metaphoneKeys('foobar', ['foo', 'bar', 'baz'])
  .should.eql(['foobar:word:F', 'foobar:word:BR', 'foobar:word:BS']);

db.flushdb(function(){
  search
    .index('Tobi wants 4 dollars', 0)
    .index('Loki is a ferret', 2)
    .index('Tobi is also a ferret', 3)
    .index('Jane is a bitchy ferret', 4)
    .index('Tobi is employed by LearnBoost', 5, test)
    .index('computing stuff', 6)
    .index('simple words do not mean simple ideas', 7)
    .index('The dog spoke the words, much to our unbelief.', 8)
    .index('puppy dog eagle puppy frog puppy dog simple', 9)
    .index('ทดสอบ ภาษาไทย ดูนะครับ', 10)
    .index('ทดสอบ', 11);
});

function test() {
  var pending = 0;

  ++pending;
  search
    .query('ภาษาไทย')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.eql(['10']);
      --pending || done();
    });

  ++pending;
  search
    .query('ทดสอบ')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.have.length(2);
      ids.should.containEql('10');
      ids.should.containEql('11');
      --pending || done();
    });

  ++pending;
  search
    .query('stuff compute')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.eql(['6']);
      --pending || done();
    });

  ++pending;
  search
    .query('Tobi')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.have.length(3);
      ids.should.containEql('0');
      ids.should.containEql('3');
      ids.should.containEql('5');
      --pending || done();
    });

  ++pending;
  search
    .query('tobi')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.have.length(3);
      ids.should.containEql('0');
      ids.should.containEql('3');
      ids.should.containEql('5');
      --pending || done();
    });

  ++pending;
  search
    .query('bitchy')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.eql(['4']);
      --pending || done();
    });

  ++pending;
  search
    .query('bitchy jane')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.eql(['4']);
      --pending || done();
    });

  ++pending;
  search
    .query('loki and jane')
    .type('or')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.have.length(2);
      ids.should.containEql('2');
      ids.should.containEql('4');
      --pending || done();
    });

  ++pending;
  search
    .query('loki and jane')
    .type('or')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.have.length(2);
      ids.should.containEql('2');
      ids.should.containEql('4');
      --pending || done();
    });

  ++pending;
  search
    .query('loki and jane')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.eql([]);
      --pending || done();
    });

  ++pending;
  search
    .query('jane ferret')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.eql(['4']);
      --pending || done();
    });

  ++pending;
  search
    .query('is a')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.eql([]);
      --pending || done();
    });

  ++pending;
  search
    .query('simple')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.have.length(2);
      ids.should.containEql('7');
      ids.should.containEql('9');
      ids[0].should.eql('7');
      ids[1].should.eql('9');
      --pending || done();
    });

  ++pending;
  search
    .query('dog ideas')
    .type('or')
    .end(function(err, ids){
      if (err) throw err;
      ids.should.have.length(3);
      ids.should.containEql('7');
      ids.should.containEql('8');
      ids.should.containEql('9');
      ids[0].should.eql('9');
      --pending || done();
    });

  ++pending;
  search
    .index('keyboard cat', 6, function(err){
      if (err) throw err;
      search.query('keyboard').end(function(err, ids){
        if (err) throw err;
        ids.should.eql(['6']);
        search.query('cat').end(function(err, ids){
          if (err) throw err;
          ids.should.eql(['6']);
          search.remove(6, function(err){
            if (err) throw err;
            search.query('keyboard').end(function(err, ids){
              if (err) throw err;
              ids.should.be.empty;
              search.query('cat').end(function(err, ids){
                if (err) throw err;
                ids.should.be.empty;
                --pending || done();
              });
            });
          });
        });
      });
    });
}

function done() {
  console.log();
  console.log('  tests completed in %dms', new Date - start);
  console.log();
  process.exit();
}
