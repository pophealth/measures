function() {
  var patient = this;
  var measure = patient.measures["0088"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start =  effective_date - (1 * year);
  var latest_birthdate = effective_date - (18 * year);

  var earliest_encounter = effective_date - (1 * year);
  var all_encounters = normalize(
    measure.encounter_domiciliary_encounter,
    measure.encounter_nursing_facility_encounter,
    measure.encounter_office_outpatient_consult_encounter,
    measure.encounter_ophthalmological_services_encounter);  

  var population = function() {
    var encounters = inRange(all_encounters, earliest_encounter, effective_date);
    var retinopathy_diagnosis_before_encounter = actionFollowingSomething(all_encounters,
      measure.diabetic_retinopathy_diagnosis_active,  
      earliest_encounter, effective_date);
    return ((patient.birthdate<=latest_birthdate) && (encounters>=2) && retinopathy_diagnosis_before_encounter);
  }
  
  var denominator = function() {
    return true;
  }
  
  var numerator = function() {
    var macular_fundus = diagnosisDuringEncounter(measure.macular_or_fundus_exam_procedure_performed, 
      all_encounters, earliest_encounter, effective_date);
    var macular_edema = actionFollowingSomething(all_encounters,
      measure.macular_edema_findings_physical_exam_finding, 
      earliest_encounter, effective_date);
    var retinopathy = actionFollowingSomething (all_encounters,
      measure.level_of_severity_of_retinopathy_findings_physical_exam_finding, 
      earliest_encounter, effective_date);
    var retinopathy_and_macular = actionFollowingSomething (all_encounters,                                   
       measure.severity_of_retinopathy_and_macular_edema_findings_physical_exam_finding, 
       earliest_encounter, effective_date);
    return (macular_fundus && ((macular_edema && retinopathy) || retinopathy_and_macular));
  }
  
  var exclusion = function() {
    var patient = inRange(measure.patient_reason_procedure_not_done, earliest_encounter, effective_date);
    var medical = inRange(measure.medical_reason_procedure_not_done, earliest_encounter, effective_date);
    return patient || medical;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};
