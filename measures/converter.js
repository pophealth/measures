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

/*fs.readdir('.', function(e, files){
  $.each(files, function(i, dir){
    if (dir.match(/^\d{4}/)){
      runonce = true;*/
      dir = '0001_asthma_assessment';
      fs.readdir(dir,  function(e, files){
        $.each(files, function(i, file){
          if (!file.match(/\.v2\.json$/) && file.match(/\.json$/)){
            console.log('Processsing file: ' + file)
            fs.readFile(dir+'/'+file, 'utf8',
              function(file, e, data){
                data = JSON.parse(data);
                r = {};
                debugger;
                r.numerator = toObj(data.numerator)
                r.denominator = toObj(data.denominator)
                r.population = toObj(data.population)
                r.exclusions = toObj(data.exclusions)
                fs.writeFile(dir+'/'+file.match(/(.+)\.json/)[1]+'.v2.json', JSON.stringify(r, null, 2), 'utf8');
              }.curry(file)
            );
          }
        });
      });/*
    }
  });
});*/
