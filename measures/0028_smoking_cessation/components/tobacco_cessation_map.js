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
  var earliest_cessation_method_date = effective_date - twenty_four_months;
  var latest_encounter = effective_date;

  var preventive_encounters = normalize(measure.encounter_prev_med_services_18_and_older_encounter,
    measure.encounter_prev_med_other_services_encounter,
    measure.encounter_prev_med_individual_counseling_encounter,
    measure.encounter_prev_med_group_counseling_encounter);
  var other_encounters = normalize(measure.encounter_health_and_behavior_assessment_encounter,
    measure.encounter_occupational_therapy_encounter,
    measure.encounter_office_visit_encounter,
    measure.encounter_psychiatric_psychologic_encounter);

  var all_encounters = normalize(preventive_encounters, other_encounters);
  var preventive_encounters_in_measurement_period = selectWithinRange(preventive_encounters, earliest_encounter, latest_encounter);
  var other_encounters_in_measurement_period = selectWithinRange(other_encounters, earliest_encounter, latest_encounter);
  var all_encounters_in_measurement_period = selectWithinRange(all_encounters, earliest_encounter, latest_encounter);
  var last_encounter_in_measurement_period = _.max(all_encounters_in_measurement_period);

  var population = function() {
    return (patient.birthdate <= latest_birthdate && 
            (other_encounters_in_measurement_period.length >= 2 || preventive_encounters_in_measurement_period.length >= 1));
  }

  var denominator = function() {
    // Tobacco user in last 24 months, prior to an encounter... If not a user, false
    return(inRange(measure.tobacco_user_patient_characteristic,
                   earliest_cessation_method_date,
                   last_encounter_in_measurement_period));
  }

  var numerator = function() {
    // need to check that cessation methods are within 24 months and before an encounter.
    var cessation_procedure = inRange(measure.tobacco_use_cessation_counseling_procedure_performed,
                                      earliest_cessation_method_date,
                                      last_encounter_in_measurement_period);
    var cessation_medication_active = inRange(measure.smoking_cessation_agents_medication_active,
                                              earliest_cessation_method_date,
                                              last_encounter_in_measurement_period);
    var cessation_medication_order = inRange(measure.smoking_cessation_agents_medication_order,
                                             earliest_cessation_method_date,
                                             last_encounter_in_measurement_period);
    return (cessation_procedure || cessation_medication_active || cessation_medication_order);
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};
