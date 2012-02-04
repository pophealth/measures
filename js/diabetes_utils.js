// Adds diabetes utility functions to the root JS object. These are then
// available for use by the supporting map-reduce functions for any measure
// that needs common definitions of diabetes-specific algorithms.
//
// lib/qme/mongo_helpers.rb executes this function on a database
// connection.
function() {

  var root = this;

  root.has_medications_indicative_of_diabetes = function(measure, earliest_diagnosis, effective_date) {
    var dispensed = inRange(measure.medications_indicative_of_diabetes_medication_dispensed,
      earliest_diagnosis, effective_date);
    var ordered = inRange(measure.medications_indicative_of_diabetes_medication_order,
      earliest_diagnosis, effective_date);
    var active = inRange(measure.medications_indicative_of_diabetes_medication_active,
      earliest_diagnosis, effective_date);
    return dispensed || ordered || active;
  }

  root.diabetes_population = function(patient, earliest_birthdate, latest_birthdate) {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }

  root.diabetes_denominator = function(measure, earliest_diagnosis, earliest_encounter, effective_date) {
    var diagnosis_diabetes = inRange(measure.diabetes_diagnosis_active, earliest_diagnosis, effective_date);
    var encounter_acute = inRange(measure.encounter_acute_inpatient_or_ed_encounter, earliest_encounter, effective_date);
    // Change in supplemental (12/10) is requirement that encounters be on different dates
    var encounter_other = inRange(unique_dates(measure.encounter_non_acute_inpatient_outpatient_or_ophthalmology_encounter), earliest_encounter, effective_date);
    return (has_medications_indicative_of_diabetes(measure, earliest_diagnosis, effective_date) 
            || 
            (diagnosis_diabetes && (encounter_acute || (encounter_other>=2))));
  }

  root.diabetes_exclusions = function(measure, earliest_diagnosis, effective_date) {
    var diagnosis_diabetes = inRange(measure.diabetes_diagnosis_active, 
      earliest_diagnosis, effective_date);
    var encounter_acute = inRange(measure.encounter_acute_inpatient_or_ed_encounter,
      earliest_diagnosis, effective_date);
    var encounter_other = inRange(measure.encounter_non_acute_inpatient_outpatient_or_ophthalmology_encounter, 
      earliest_diagnosis, effective_date);
    var polycystic_ovaries = inRange(measure.polycystic_ovaries_diagnosis_active, 
      earliest_diagnosis, effective_date);
    var diagnosis_gestational_diabetes = inRange(measure.gestational_diabetes_diagnosis_active,
      earliest_diagnosis, effective_date);
    var diagnosis_steroid_induced_diabetes = inRange(measure.steroid_induced_diabetes_diagnosis_active,
      earliest_diagnosis, effective_date);

    return ((polycystic_ovaries && !(diagnosis_diabetes && (encounter_acute || encounter_other)))
             ||
            ((diagnosis_gestational_diabetes || diagnosis_steroid_induced_diabetes)
             && has_medications_indicative_of_diabetes(measure, earliest_diagnosis, effective_date)
             && !(diagnosis_diabetes && (encounter_acute || encounter_other))));
  };

}
