function () {
  var patient = this;
  var measure = patient.measures["0036"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24*60*60;
  var year = 365*day;
  var effective_date = <%= effective_date %>;
  var measurement_period_start = effective_date - 1*year;
  /*
   AND: “Patient characteristic: birth date” (age) >=4 and <=10 before the “measurement period” to 
         capture all patients who will reach the age of 5 through 11 during the “measurement period”;
  */
  var earliest_birthdate = earliestBirthdayForThisAge(10, measurement_period_start);
  var latest_birthdate = latestBirthdayForThisAge(4, measurement_period_start);

  var earliest_encounter = effective_date - 1*year;

  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }
  
  var denominator = function() {
    var den = asthmaDenominator(measure, earliest_birthdate, effective_date);
    return den;
  }
  
  var numerator = function() {
    var num = asthmaNumerator(measure, earliest_birthdate, effective_date);
    return num;
  }
  
  var exclusion = function() {
    var exc = asthmaExclusion(measure);
    return exc;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};
