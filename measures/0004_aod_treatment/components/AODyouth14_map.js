function() {
  var patient = this;
  var measure = patient.measures["0004"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start = effective_date - (1 * year);
  var latest_birthdate =   latestBirthdayForThisAge(12, measurement_period_start);
  var earliest_birthdate = earliestBirthdayForThisAge(16, measurement_period_start);

  var population = function() {
    return((patient.birthdate < latest_birthdate) && (patient.birthdate > earliest_birthdate) &&
            alcoholDrugFirstEvent(measure, effective_date));
  };

  var denominator = function() {
    return(alcohol_drug_denominator(measure));
  };

  var numerator = function() {
    return(alcohol_drug_numerator1(measure));
  };

  var exclusion = function() {
    return false;
  };

  map(patient, population, denominator, numerator, exclusion);
};