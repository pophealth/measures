function() {
  var patient = this;
  var measure = patient.measures["0061"];
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

  // This numerator function is the only code that is specific to this particular
  // MU diabetes measure.  All of the other definitions for the initial population,
  // the denominator, and the exclusions are shared in the 'diabetes_utils.js' file
  // that is located in the /js directory of the project
  var numerator = function() {
    var all_encounters = normalize(measure.encounter_acute_inpatient_or_ed_encounter,
      measure.encounter_non_acute_inpatient_outpatient_or_ophthalmology_encounter);
    var all_encounters_in_range = selectWithinRange(all_encounters, measurement_period_start, effective_date);
    if (all_encounters_in_range.length == 0) {
      return false;
    }
    latest_encounter = _.max(all_encounters_in_range);
    // for measure purposes a BP reading is considered to be during an encounter if its timestamp
    // is between 24 hours before and 24 hours after the timestamp of the encounter
    start_latest_encounter = latest_encounter - day;
    end_latest_encounter = latest_encounter + day;

    systolic_min = minValueInDateRange(measure.systolic_blood_pressure_physical_exam_finding,
                                       start_latest_encounter,
                                       end_latest_encounter,
                                       false);
    diastolic_min = minValueInDateRange(measure.diastolic_blood_pressure_physical_exam_finding,
                                        start_latest_encounter,
                                        end_latest_encounter,
                                        false);
    if ((systolic_min === false) || (diastolic_min === false)) {
      return false;
    }
    return ((systolic_min < 140) && (diastolic_min < 90));
  }

  var exclusion = function() {
    return diabetes_exclusions(measure, earliest_diagnosis, effective_date);
  }

  map(patient, population, denominator, numerator, exclusion);
};