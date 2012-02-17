function() {
  var patient = this;
  var measure = patient.measures["0024"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - (1 * year);
  var earliest_birthdate = earliestBirthdayForThisAge(10, measurement_period_start);
  var latest_birthdate = latestBirthdayForThisAge(2, measurement_period_start);

  var population = function() {
    return weight_population(patient,
                             earliest_birthdate,
                             latest_birthdate);
  }

  var denominator = function() {
    return weight_denominator(measure,
                              measurement_period_start,
                              effective_date);
  }

  var numerator = function() {
    return inRange(measure.bmi_percentile_physical_exam_finding,
                   measurement_period_start,
                   effective_date);
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};