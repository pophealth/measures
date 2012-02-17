function() {
  var patient = this;
  var measure = patient.measures["0089"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start =  effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);

  var earliest_encounter = measurement_period_start - (1 * year);
  var all_encounters = normalize(
    measure.encounter_domiciliary_encounter,
    measure.encounter_nursing_facility_encounter,
    measure.encounter_office_outpatient_consult_encounter,
    measure.encounter_ophthalmological_services_encounter);
  
  var population = function() {
    var retinopathy_before_encounter = actionFollowingSomething(measure.diabetic_retinopathy_diagnosis_active, all_encounters);
    var encounters = inRange(all_encounters, earliest_encounter, effective_date);
    return ((patient.birthdate <= latest_birthdate) &&
            retinopathy_before_encounter &&
            (encounters >= 2));
  }

  var denominator = function() {
    var exam = actionFollowingSomething(measure.macular_or_fundus_exam_procedure_performed, all_encounters);
    return exam;
  }

  var numerator = function() {
    var findings = actionFollowingSomething(all_encounters,
      measure.macular_edema_findings_communication_provider_to_provider);
    var severity = actionFollowingSomething(all_encounters,
      measure.level_of_severity_of_retinopathy_findings_communication_provider_to_provider);
    var both = actionFollowingSomething(all_encounters,
      measure.severity_of_retinopathy_and_macular_edema_findings_communication_provider_to_provider);
    return ((findings && severity) || both);
  }

  var exclusion = function() {
    var patient = inRange(measure.patient_reason_communication_not_done, 
      earliest_encounter, effective_date);
    var medical = inRange(measure.medical_reason_communication_not_done, 
      earliest_encounter, effective_date);
    return (patient || medical);
  }

  map(patient, population, denominator, numerator, exclusion);
};