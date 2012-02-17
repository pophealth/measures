function() {
  var patient = this;
  var measure = patient.measures["0083"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);

  var earliest_encounter = effective_date - (1 * year);
  var all_encounters = normalize(
    measure.encounter_nursing_facility_encounter,
    measure.encounter_outpatient_encounter);
  var encounters_in_range = selectWithinRange(all_encounters, earliest_encounter, effective_date);

  var population = function() {
    var hf_before_encounter = actionFollowingSomething(
      measure.heart_failure_diagnosis_active, all_encounters);
    var encounters_in_range = inRange(all_encounters, earliest_encounter, effective_date);
    return (patient.birthdate <= latest_birthdate) && hf_before_encounter && (encounters_in_range >= 2);
  }

  var denominator = function() {
    // have to 2 or more encounters to get this far
    var MIN_FRACTION = 40;
    var final_encounter = _.max(encounters_in_range);
    var lvf = minValueInDateRange(measure.lvf_assmt_diagnostic_study_result,
      patient.birthdate, final_encounter, MIN_FRACTION + 1);
    var eject = minValueInDateRange(measure.ejection_fraction_diagnostic_study_result,
      patient.birthdate, final_encounter, MIN_FRACTION + 1);
    return (lvf < MIN_FRACTION) || (eject < MIN_FRACTION);
  }

  var numerator = function() {
    var active = inRange(measure.beta_blocker_therapy_medication_active,
      earliest_encounter, effective_date);
    var order = inRange(measure.beta_blocker_therapy_medication_order,
      earliest_encounter, effective_date);
    return (active || order);
  }

  var exclusion = function() {
    var allergy = actionFollowingSomething(
      measure.beta_blocker_therapy_medication_allergy, all_encounters);
    var adverse = actionFollowingSomething(
      measure.beta_blocker_therapy_medication_adverse_event, all_encounters);
    var intollerence = actionFollowingSomething(
      measure.beta_blocker_therapy_medication_intolerance, all_encounters);
    var patient = inRange(measure.patient_reason_medication_not_done,
      earliest_encounter, effective_date);
    var medical = inRange(measure.medical_reason_medication_not_done,
      earliest_encounter, effective_date);
    var system = inRange(measure.system_reason_medication_not_done,
      earliest_encounter, effective_date);

    var arrhythmia = actionFollowingSomething(
      measure.arrhythmia_diagnosis_active, all_encounters);
    var hypotension = actionFollowingSomething(
      measure.hypotension_diagnosis_active, all_encounters);
    var asthma = actionFollowingSomething(
      measure.asthma_diagnosis_active, all_encounters);
    var block = actionFollowingSomething(
      measure.atrioventricular_block_diagnosis_active, all_encounters);
    var cardiac_pacer_in_situ = actionFollowingSomething(
      measure.cardiac_pacer_in_situ_diagnosis_active, all_encounters);
    var cardiac_pacer = actionFollowingSomething(
      measure.cardiac_pacer_device_applied, all_encounters);
    var bradycardia = actionFollowingSomething(
      measure.bradycardia_diagnosis_active, all_encounters);
    var heart_rate = actionFollowingSomething(
      measure.heart_rate_physical_exam_finding, all_encounters);

    return (allergy || adverse || intollerence || patient || medical || system ||
      arrhythmia || hypotension || asthma || 
      (block && !(cardiac_pacer_in_situ || cardiac_pacer)) ||
      bradycardia || heart_rate);
  }

  map(patient, population, denominator, numerator, exclusion);
};