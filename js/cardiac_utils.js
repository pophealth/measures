// Adds cardiac utility functions to the root JS object. These are then
// available for use by the supporting map-reduce functions for any measure
// that needs common definitions of cardiac-specific algorithms.
//
// lib/qme/mongo_helpers.rb executes this function on a database
// connection.
function() {

  var root = this;

  root.ivd_denominator = function(measure, effective_date, earliest_procedure, latest_procedure, earliest_encounter, latest_encounter) {
    // if criteria for either:
    //   ptac (Percutaneous Transluminal Cardiac Angioplasty)
    //   or ami (Acute Myocardial Infarction)
    //   or cabg (Coronary Artery Bypass Graft)
    //   or ivd (Ischemic Vascular Disease)
    // ... is met for this patient, he/she is in the denominator for this Ischemic Vascular Disease (IVD) measure
    ptca = inRange(measure.ptca_procedure_performed, earliest_procedure, latest_procedure);
    ami =  (inRange(measure.acute_myocardial_infarction_diagnosis_active, earliest_encounter, latest_encounter)
            &&
            inRange(measure.encounter_acute_inpt_encounter, earliest_encounter, latest_encounter));
    cabg = (inRange(measure.cabg_procedure_performed, earliest_procedure, latest_procedure)
            &&
            inRange(measure.encounter_acute_inpt_encounter, earliest_encounter, latest_encounter));
    ivd =  (inRange(measure.encounter_acute_inpt_and_outpt_encounter, earliest_encounter, effective_date)
            &&
            diagnosisDuringEncounter(measure.ischemic_vascular_disease_diagnosis_active, measure.encounter_acute_inpt_and_outpt_encounter, earliest_encounter, effective_date));
    return (ptca || cabg || ami || ivd);
  }

}