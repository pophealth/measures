function() {
  var patient = this;
  var measure = patient.measures["0084"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);

  var earliest_encounter =        measurement_period_start - (1 * year);
  var all_encounters = normalize(
    measure.encounter_nursing_facility_encounter,
    measure.encounter_outpatient_encounter);

  var population = function() {
    var hf_before_encounter = actionFollowingSomething(
      measure.heart_failure_diagnosis_active, all_encounters);
    var encounters_in_range = inRange(all_encounters, earliest_encounter, effective_date);
    return ((patient.birthdate <= latest_birthdate) && 
            hf_before_encounter &&
            (encounters_in_range >= 2));
  }

  var denominator = function() {
    var afib = inRange(measure.atrial_fibrillation_diagnosis_active, earliest_encounter, effective_date);
    return afib;
  }

  var numerator = function() {
    var active = inRange(measure.warfarin_therapy_medication_active, 
      earliest_encounter, effective_date);
    var order = inRange(measure.warfarin_therapy_medication_order, 
      earliest_encounter, effective_date);
    return (active || order);
  }

  var exclusion = function() {
    var allergy = actionFollowingSomething(
      measure.warfarin_therapy_medication_allergy, all_encounters);
    var adverse = actionFollowingSomething(
      measure.warfarin_therapy_medication_adverse_event, all_encounters);
    var intollerence = actionFollowingSomething(
      measure.warfarin_therapy_medication_intolerance, all_encounters);
    var patient = inRange(measure.patient_reason_medication_not_done, 
      earliest_encounter, effective_date);
    var medical = inRange(measure.medical_reason_medication_not_done, 
      earliest_encounter, effective_date);
    var system = inRange(measure.system_reason_medication_not_done, 
      earliest_encounter, effective_date);

    var anemia = actionFollowingSomething(
      measure.anemias_and_bleeding_disorders_diagnosis_active, all_encounters);
    var esophageal = actionFollowingSomething(
      measure.esophageal_and_gi_bleed_diagnosis_active, all_encounters);
    var intracranial = actionFollowingSomething(
      measure.intracranial_hemorrhage_diagnosis_active, all_encounters);
    var leukemias = actionFollowingSomething(
      measure.leukemias_myeloproliferative_disorders_diagnosis_active, all_encounters);
    var hematuria = actionFollowingSomething(
      measure.hematuria_diagnosis_active, all_encounters);
    var hemoptysis = actionFollowingSomething(
      measure.hemoptysis_diagnosis_active, all_encounters);
    var hemorrhage = actionFollowingSomething(
      measure.hemorrhage_diagnosis_active, all_encounters);
    var liver = actionFollowingSomething(
      measure.liver_disorders_diagnosis_active, all_encounters);

    return (allergy || adverse || intollerence || patient || medical || system || anemia ||
      esophageal || intracranial || leukemias || hematuria || hemoptysis || hemorrhage || 
      liver);
  }
  
  map(patient, population, denominator, numerator, exclusion);
};