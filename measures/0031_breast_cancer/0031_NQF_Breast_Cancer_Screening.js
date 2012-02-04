function() {
  var patient = this;
  var measure = patient.measures["0031"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start = effective_date - (1 * year);
  var earliest_birthdate = earliestBirthdayForThisAge(68, measurement_period_start);
  var latest_birthdate = latestBirthdayForThisAge(41, measurement_period_start);
  var earliest_encounter = effective_date - (2 * year);

  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }

  var denominator = function() {
    var outpatient_encounter = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
    // look for bilateral mastectomy or unilateral mastectomy
    unilateral = _.uniq(normalize(measure.unilateral_mastectomy_procedure_performed));
    bilateral = normalize(measure.bilateral_mastectomy_procedure_performed);
    modifier = normalize(measure.bilateral_mastectomy_modifier_procedure_performed);
    var no_breast = (
      (bilateral.length > 0) ||
      (unilateral.length > 0 && modifier.length > 0) ||
      (unilateral.length > 1)  
    );
    return (outpatient_encounter && !no_breast);
  }

  var numerator = function() {
    return inRange(measure.breast_cancer_screening_diagnostic_study_performed, earliest_encounter, effective_date);
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};