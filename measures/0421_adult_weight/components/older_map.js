function() {
  var patient = this;
  var measure = patient.measures["0421"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(65, measurement_period_start);
  var earliest_encounter =        measurement_period_start - year;

  var population = function() {
    var correct_age = patient.birthdate <= latest_birthdate;
    return (correct_age);
  }

  var denominator = function() {
    return inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
  }

  var numerator = function() {
    return weight_numerator(measure, 22, 30);
  }

  var exclusion = function() {
    return weight_exclusion(measure, earliest_encounter, effective_date);
  }

  map(patient, population, denominator, numerator, exclusion);
};