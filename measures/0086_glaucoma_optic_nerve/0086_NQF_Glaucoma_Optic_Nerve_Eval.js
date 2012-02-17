function() {
  var patient = this;
  var measure = patient.measures["0086"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start =  effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);

  var earliest_encounter = effective_date - (1 * year);
  var all_encounters = normalize(
    measure.encounter_domiciliary_encounter,
    measure.encounter_nursing_facility_encounter,
    measure.encounter_office_outpatient_consult_encounter,
    measure.encounter_ophthalmological_services_encounter);
  
  var population = function() {
    var encounters_in_range = inRange(all_encounters, earliest_encounter, effective_date);
    var poag_before_encounter = actionFollowingSomething(measure.primary_open_angle_glaucoma_poag_diagnosis_active, all_encounters);
    return ((patient.birthdate<=latest_birthdate) && (encounters_in_range>=2) && poag_before_encounter);
  }

  var denominator = function() {
    return true;
  }

  var numerator = function() {
    var procedure = somethingDuringEncounter(measure.optic_nerve_head_evaluation_procedure_performed, 
      all_encounters, earliest_encounter, effective_date);
    return (procedure);
  }

  var exclusion = function() {
    var medical = inRange(measure.medical_reason_procedure_not_done, 
      earliest_encounter, effective_date);
    return medical;
  }

  map(patient, population, denominator, numerator, exclusion);
};