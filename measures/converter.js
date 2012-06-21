fs = require('fs.extra');
$ = jQuery = require('jquery');

Function.prototype.curry = function() {
    if (arguments.length<1) {
        return this; //nothing to curry with - return function
    }
    var __method = this;
    var args = Array.prototype.slice.call(arguments);
    return function() {
        return __method.apply(this, args.concat(Array.prototype.slice.call(arguments)));
    }
}

toObj = function(obj){
  var r = [];
  var key = obj.and !== undefined ? 'and' : 'or'
  if (!obj.and && !obj.or) return obj;
  obj = obj.and || obj.or;
  if ($.isArray(obj)){
    $.each(obj,function(i, e){
      r.push(toObj(e));
    });
  }

  return {
    conjunction: key,
    items: r || toObj(obj.and || obj.or)
  };
};

var minify = process.argv[2] == '--min'

fs.readdir('.', function(e, files){
  $.each(files, function(i, dir){
    if (dir.match(/^\d{4}/)){
      fs.readdir(dir,  function(e, files){
        $.each(files, function(i, file){
          if (!file.match(/\.v2\.json$/) && !file.match(/\.v2\.min\.json$/) && file.match(/\.json$/)){
            console.log('Processsing file: ' + file)
            fs.readFile(dir+'/'+file, 'utf8',
              function(file, e, data){
                data = JSON.parse(data);
                data.numerator = toObj(data.numerator)
                data.denominator = toObj(data.denominator)
                data.population = toObj(data.population)
                data.exclusions = toObj(data.exclusions)
                fs.writeFile(dir+'/'+file.match(/(.+)\.json/)[1]+'.v2' + (minify?'.min':'') + '.json', JSON.stringify(data, null, minify ? null : 2), 'utf8');
              }.curry(file)
            );
          }
        });
      });
    }
  });
});
