// Adds alcohol and drug treatment utility functions to the root JS object. 
// Since measure 0004 has 3 populations with two numerators each, this allows code reuse.
//
// lib/qme/mongo_helpers.rb executes this function on a database
// connection.
function () {
  var root = this;

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var latest_birthdate;
  var earliest_birthdate;
  var earliest_encounter;
  var earliest_diagnosis;
  var latest_diagnosis;
  var inpatient_encounters;
  var encounters;
  var diagnoses_during_encounters;
  var rehab_and_detox_during_inpatient_encounters;

  var first_alcohol_drug_event;
  var first_alcohol_drug_treatment_event;


  root.alcoholDrugFirstEvent = function (measure, effective_date) {

    earliest_encounter = effective_date - 1 * year;
    earliest_diagnosis = effective_date - 1 * year;
    latest_diagnosis = effective_date - 45 * day;

    inpatient_encounters = normalize(measure.encounter_acute_inpt_encounter,
      measure.encounter_non_acute_inpatient_encounter);
    encounters = normalize(inpatient_encounters, 
      measure.encounter_ed_encounter, 
      measure.encounter_outpatient_bh_encounter);
    diagnoses_during_encounters = allDiagnosesDuringEncounter(
      measure.alcohol_or_drug_dependence_diagnosis_active,
      encounters, earliest_diagnosis, latest_diagnosis);
    rehab_and_detox_during_inpatient_encounters = allEventsDuringEncounter(
      measure.alcohol_drug_rehab_and_detox_interventions_procedure_performed,
      inpatient_encounters, earliest_diagnosis, latest_diagnosis);

    var first_diagnosis_during_encounter = _.min(diagnoses_during_encounters);
    var first_rehab_and_detox_during_inpatient_encounter = _.min(
      rehab_and_detox_during_inpatient_encounters);

    first_alcohol_drug_event = Math.min(first_diagnosis_during_encounter,
      first_rehab_and_detox_during_inpatient_encounter);

    return (first_alcohol_drug_event<Infinity);
  };

  root.alcohol_drug_denominator = function (measure) {
    // first_alcohol_drug_event is defined in population
    var begin_range = first_alcohol_drug_event - 60 * day;
    var previous_event = inRange(
      measure.alcohol_or_drug_dependence_diagnosis_active,
      begin_range, first_alcohol_drug_event - 1);
    return (previous_event == 0);
  };

  root.alcohol_drug_numerator1 = function (measure) {
    var alcohol_drug_treatments = selectWithinRange(diagnoses_during_encounters,
      first_alcohol_drug_event + 1, first_alcohol_drug_event + 14 * day);

    if (alcohol_drug_treatments.length > 0)
      first_alcohol_drug_treatment_event = _.min(alcohol_drug_treatments);

    return (alcohol_drug_treatments.length > 0);
  };

  root.alcohol_drug_numerator2 = function (measure) {
    var followup_treatments = inRange(diagnoses_during_encounters,
      first_alcohol_drug_treatment_event + 1, 
      first_alcohol_drug_treatment_event + 30 * day);
    return (followup_treatments >= 2);
  };

}
