function () {
  var patient = this;
  var measure = patient.measures["0033"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;
  var measurement_period_start = effective_date - 1*year;
/*
            AND: “Patient characteristic: birth date” (age) >=15 and <= 23 years (at beginning of measurement period) 
                  to expect screening for patients within one year after reaching 15 years until 24 years;
*/
 var earliest_birthdate = earliestBirthdayForThisAge(23, measurement_period_start);
 var latest_birthdate = latestBirthdayForThisAge(15, measurement_period_start);
  var earliest_encounter = effective_date - 1 * year;
  var pregnancy_tests = normalize(measure.pregnancy_test_laboratory_test_performed,
    measure.pregnancy_test_laboratory_test_result);

  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }

  var denominator = function() {
    return chlamydiaDenominator(measure, pregnancy_tests, earliest_encounter, effective_date);
  }
  
  var numerator = function() {
    var screening = normalize(measure.chlamydia_screening_laboratory_test_performed,
      measure.chlamydia_screening_laboratory_test_result);
    return inRange(screening, earliest_encounter, effective_date);
  }
  
  var exclusion = function() {
    return chlamydiaExclusion(measure, pregnancy_tests, earliest_encounter, effective_date);
  }

  map(patient, population, denominator, numerator, exclusion);
};
