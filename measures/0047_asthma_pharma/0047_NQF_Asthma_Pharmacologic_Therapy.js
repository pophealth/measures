function() {
  var patient = this;
  var measure = patient.measures["0047"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;
  var measurement_period_start = effective_date - (1 * year);
  var earliest_birthdate = earliestBirthdayForThisAge(40, measurement_period_start);
  var latest_birthdate = latestBirthdayForThisAge(5, measurement_period_start);
  var earliest_encounter = effective_date - year;

  var population = function() {
    var correct_age = inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
    var encounters = inRange(measure.encounter_office_outpatient_consult_encounter, earliest_encounter, effective_date);
    var asthma = lessThan(measure.asthma_diagnosis_active, effective_date);
    var persistent_asthma = lessThan(measure.asthma_persistent_diagnosis_active, effective_date);
    return correct_age && (asthma || persistent_asthma) && encounters>=2;
  }

  var denominator = function() {
    return true;
  }

  var numerator = function() {
    var medication_active = inRange(measure.corticosteroid_inhaled_or_alternative_asthma_medication_medication_active, earliest_encounter, effective_date);
    var medication_order = inRange(measure.corticosteroid_inhaled_or_alternative_asthma_medication_medication_order, earliest_encounter, effective_date);
    return medication_active || medication_order;
  }

  var exclusion = function() {
    var not_done_patient = inRange(measure.patient_reason_medication_not_done, earliest_encounter, effective_date);
    var allergy = inRange(measure.corticosteroid_inhaled_or_alternative_asthma_medication_medication_allergy, earliest_encounter, effective_date);
    var adverse = inRange(measure.corticosteroid_inhaled_or_alternative_asthma_medication_medication_adverse_event, earliest_encounter, effective_date);
    var intolerance = inRange(measure.corticosteroid_inhaled_or_alternative_asthma_medication_medication_intolerance, earliest_encounter, effective_date);
    return not_done_patient && (allergy || adverse || intolerance);
  }

  map(patient, population, denominator, numerator, exclusion);
};