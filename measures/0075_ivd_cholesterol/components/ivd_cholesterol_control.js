function() {
  var patient = this;
  var measure = patient.measures["0075"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - year;
  var latest_birthdate = latestBirthdayForThisAge(17, measurement_period_start);

  var earliest_encounter = effective_date - (2 *  year);
  var latest_encounter =   effective_date - (1 *  year) - (61 * day);
  var earliest_procedure = effective_date - (2 *  year);
  var latest_procedure =   effective_date - (1 *  year) - (61 * day);

  var population = function() {
    return (patient.birthdate <= latest_birthdate);
  }

  var denominator = function() {
     return ivd_denominator(measure, effective_date, earliest_procedure, latest_procedure, earliest_encounter, latest_encounter);
  }

  var numerator = function() {

    latestLDLValue = latestValueInDateRange(measure.ldl_test_laboratory_test_performed, -Infinity, effective_date, false);
    if (latestLDLValue && latestLDLValue < 100)
    {
      return true;
    }

    latestTotalCholesterolValue = latestValueInDateRange(measure.total_cholesterol_laboratory_test_performed,
                                                         -Infinity, effective_date, false);
    latestHDLValue =              latestValueInDateRange(measure.high_density_lipoprotein_hdl_laboratory_test_performed,
                                                         -Infinity, effective_date, false);
    latestTrigylceridesValue =    latestValueInDateRange(measure.triglycerides_laboratory_test_performed,
                                                         -Infinity, effective_date, false);
    if (latestTotalCholesterolValue && latestHDLValue && latestTrigylceridesValue) {
      lipidPanelResult = latestTotalCholesterolValue - latestHDLValue - (latestTrigylceridesValue / 5);
      return (lipidPanelResult < 100);
    }

    return false;
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};