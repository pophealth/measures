function() {
  var patient = this;
  var measure = patient.measures["0070"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - year;
  var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);

  var earliest_encounter =        effective_date - (1 * year);
  var all_encounters = normalize(
    measure.encounter_inpatient_discharge_encounter,
    measure.encounter_nursing_facility_encounter,
    measure.encounter_outpatient_encounter);

  var population = function() {
    var cad_before_encounter = actionFollowingSomething(
      measure.coronary_artery_disease_no_mi_diagnosis_active, all_encounters);
    var surgery_before_encounter = actionFollowingSomething(
      measure.cardiac_surgery_procedure_performed, all_encounters);

    var nursing = inRange(measure.encounter_nursing_facility_encounter, earliest_encounter, effective_date);
    var inpatient = inRange(measure.encounter_inpatient_discharge_encounter, earliest_encounter, effective_date);
    var outpatient = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);

    return (patient.birthdate<=latest_birthdate) && 
      (cad_before_encounter || surgery_before_encounter) &&
      (outpatient>=2 || nursing>=2 || inpatient>=1);
  }

  var denominator = function() {
    var mia = actionFollowingSomething(
      measure.myocardial_infarction_diagnosis_resolved, all_encounters);
    return mia;
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
    var bradycardia = actionFollowingSomething(
      measure.bradycardia_diagnosis_active, all_encounters);
    var atresia = actionFollowingSomething(
      measure.atresia_and_stenosis_of_aorta_diagnosis_active, all_encounters);
    var cardiac_monitoring = actionFollowingSomething(
      measure.cardiac_monitoring_procedure_performed, all_encounters);
      
    var atrioventricular_block = actionFollowingSomething(
      measure.atrioventricular_block_diagnosis_active, all_encounters);
    var pacer_in_situ = actionFollowingSomething(
      measure.cardiac_pacer_in_situ_diagnosis_active, all_encounters);
    var cardiac_pacer = actionFollowingSomething(
      measure.cardiac_pacer_device_applied, all_encounters);
      
    var final_encounter = _.max(all_encounters); // must be one or more to get this far
    var heart_rate_measurements = normalize(measure.heart_rate_physical_exam_finding);
    var low_rate_measurements = _.select(heart_rate_measurements, function(value) { return value.date<final_encounter && value.value<50; });
      
    return (allergy || adverse || intollerence || patient || medical || system ||
      arrhythmia || hypotension || asthma || bradycardia || atresia || cardiac_monitoring ||
      (atrioventricular_block && !(pacer_in_situ || cardiac_pacer)) ||
      low_rate_measurements.length>1);
  }
  
  map(patient, population, denominator, numerator, exclusion);
};