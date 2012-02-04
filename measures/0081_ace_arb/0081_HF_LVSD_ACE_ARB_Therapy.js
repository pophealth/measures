function() {
  var patient = this;
  var measure = patient.measures["0081"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var ancient_times = -2208988800; // 1.1.1900
  var effective_date = <%= effective_date %>;

  var measurement_period_start =  effective_date - year;
  var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);
  var earliest_encounter = effective_date - (1 * year);

  var latest_encounter = effective_date;
  var earliest_procedure = earliest_encounter;
  var latest_procedure = effective_date;
  var earliest_diagnosis = earliest_encounter;
  var allEncounters = _.flatten(_.compact([
    measure.encounter_outpatient_encounter, 
    measure.encounter_nursing_facility_encounter, 
    measure.encounter_inpatient_discharge_encounter]));

  var population = function () {
    encounter_outpatient = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
    encounter_nursing_facility = inRange(measure.encounter_nursing_facility_encounter, earliest_encounter, effective_date);
    encounter_inpatient_discharge = inRange(measure.encounter_inpatient_discharge_encounter, earliest_encounter, effective_date);
    heart_failure = actionFollowingSomething(measure.heart_failure_diagnosis_active, allEncounters);
    return (patient.birthdate <= latest_birthdate &&
            heart_failure &&
            heart_failure >= 1 &&
            (encounter_outpatient >= 2 || encounter_nursing_facility >= 2 || encounter_inpatient_discharge >= 1));
  }

  var denominator = function () {
    // See if there are any encounters
    var lvf_assmt = actionAfterReading(measure.lvf_assmt_diagnostic_study_result, allEncounters);
    var ejection_fraction = actionAfterReading(measure.ejection_fraction_diagnostic_study_result, allEncounters);

    // The measure stewards have clarified that if ANY measured value is below threshhold, it should be used.  Not necessarily the latest.
    lvf_value = minValueInDateRange(measure.lvf_assmt_diagnostic_study_result, ancient_times, effective_date, 100);

    // Returns the most recent readings  
    ejection_fraction_value = minValueInDateRange(measure.ejection_fraction_diagnostic_study_result, ancient_times, effective_date, 100);
    return ((lvf_value < 40 && lvf_assmt > 0) || 
            (ejection_fraction > 0 && ejection_fraction_value < 40));
  }

  var numerator = function () {
    var ace_inhibitor_or_arb = inRange(measure.ace_inhibitor_or_arb_medication_active, earliest_encounter, effective_date);
    return (ace_inhibitor_or_arb > 0);
  }

  var exclusion = function () {
    var manyDiseaseExclusions = normalize(
      measure.nonrheumatic_mitral_valve_disease_diagnosis_active,
      measure.chronic_kidney_disease_with_and_without_hypertension_diagnosis_active,
      measure.hypertensive_renal_disease_with_renal_failure_diagnosis_active,
      measure.renal_failure_and_esrd_diagnosis_active,
      measure.acute_renal_failure_diagnosis_active,
      measure.atresia_and_stenosis_of_aorta_diagnosis_active,
      measure.atherosclerosis_of_renal_artery_diagnosis_active,
      measure.deficiencies_of_circulating_enzymes_diagnosis_active,
      measure.disease_of_aortic_and_mitral_valves_diagnosis_active);

    var pregnancy = diagnosisDuringEncounter(measure.pregnancy_diagnosis_active, allEncounters, earliest_encounter, latest_encounter);
    var disease_exclusions = actionFollowingSomething(manyDiseaseExclusions, allEncounters);
    var allergy_exclusions = actionFollowingSomething(measure.ace_inhibitor_or_arb_medication_allergy, allEncounters) +
                             actionFollowingSomething(measure.ace_inhibitor_or_arb_medication_intolerance, allEncounters) +
                             actionFollowingSomething(measure.ace_inhibitor_or_arb_medication_adverse_event, allEncounters);
    var medication_not_done_exclusions = inRange(measure.medical_reason_medication_not_done, ancient_times, effective_date) +
                                         inRange(measure.system_reason_medication_not_done, ancient_times, effective_date) +
                                         inRange(measure.patient_reason_medication_not_done, ancient_times, effective_date);

    return (medication_not_done_exclusions || disease_exclusions || pregnancy || allergy_exclusions);
  }

  map(patient, population, denominator, numerator, exclusion);
};