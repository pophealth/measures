function() {
  var patient = this;
  var measure = patient.measures["0062"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =                <%= effective_date %>;

  var measurement_period_start =          effective_date - year;
  // AGE BUG FIXED - AQ (17-74, not 18-85)
  var earliest_birthdate = earliestBirthdayForThisAge(74, measurement_period_start);
  var latest_birthdate = latestBirthdayForThisAge(17, measurement_period_start);

  var earliest_encounter = measurement_period_start;
  var earliest_diagnosis =                effective_date - (2 * year);

  var population = function() {
    return diabetes_population(patient, earliest_birthdate, latest_birthdate);
  }

  var denominator = function() {
    return diabetes_denominator(measure, earliest_diagnosis, earliest_encounter, effective_date);
  }

  var ace_arbs = function() {
    ace_arb_order = inRange(measure.ace_inhibitors_arbs_medication_order, measurement_period_start, effective_date);
    ace_arb_active = inRange(measure.ace_inhibitors_arbs_medication_active, measurement_period_start, effective_date);
    ace_arb_dispensed = inRange(measure.ace_inhibitors_arbs_medication_dispensed, measurement_period_start, effective_date);
    return ace_arb_order || ace_arb_active || ace_arb_dispensed;
  }

  // This numerator function is the only code that is specific to this particular
  // MU diabetes measure.  All of the other definitions for the initial population,
  // the denominator, and the exclusions are shared in the 'diabetes_utils.js' file
  // that is located in the /js directory of the project
  var numerator = function() {
    nephropathy = inRange(measure.nephropathy_diagnosis_active, measurement_period_start, effective_date);
    nephropathy_proc = inRange(measure.nephropathy_related_procedures_procedure_performed, measurement_period_start, effective_date);
    urine_microalbumin = inRange(measure.urine_macroalbumin_laboratory_test_performed, measurement_period_start, effective_date);
    nephropathy_screen = inRange(measure.nephropathy_screening_laboratory_test_performed, measurement_period_start, effective_date);
    return (nephropathy || nephropathy_proc || urine_microalbumin || nephropathy_screen || ace_arbs());
  }

  var exclusion = function() {
    return diabetes_exclusions(measure, earliest_diagnosis, effective_date);
  }

  map(patient, population, denominator, numerator, exclusion);
};