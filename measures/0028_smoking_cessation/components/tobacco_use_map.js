function() {
  var patient = this;
  var measure = patient.measures["0028"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var twenty_four_months = 2 * year;   // interval used in numerator
  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);

  var earliest_encounter = measurement_period_start;
  var latest_encounter =   effective_date;
  var preventive_encounters = normalize(measure.encounter_prev_med_services_18_and_older_encounter,
    measure.encounter_prev_med_other_services_encounter,
    measure.encounter_prev_med_individual_counseling_encounter,
    measure.encounter_prev_med_group_counseling_encounter);
  var other_encounters = normalize(measure.encounter_health_and_behavior_assessment_encounter,
    measure.encounter_occupational_therapy_encounter,
    measure.encounter_office_visit_encounter,
    measure.encounter_psychiatric_psychologic_encounter);
  var all_encounters = normalize(preventive_encounters, other_encounters);

  // Qualify the lists of encounters with the measurement period
  var preventive_encounters_in_measurement_period = selectWithinRange(preventive_encounters, earliest_encounter, latest_encounter);
  var other_encounters_in_measurement_period = selectWithinRange(other_encounters, earliest_encounter, latest_encounter);
  var all_encounters_in_measurement_period = selectWithinRange(all_encounters, earliest_encounter, latest_encounter);

  var population = function() {
    return (patient.birthdate <= latest_birthdate &&
            ((other_encounters_in_measurement_period.length >= 2) ||
             (preventive_encounters_in_measurement_period.length >= 1)));
  }

  var denominator = function() {
    return true;
  }

  var numerator = function() {
    // Look for an encounter within the measurement period that follows within 24 months of tobacco use/non-use
    var tobacco_user = actionFollowingSomething(measure.tobacco_user_patient_characteristic,
                                                all_encounters_in_measurement_period,
                                                twenty_four_months);
    var tobacco_non_user = actionFollowingSomething(measure.tobacco_non_user_patient_characteristic,
                                                    all_encounters_in_measurement_period,
                                                    twenty_four_months);
    return (tobacco_user || tobacco_non_user);
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};
