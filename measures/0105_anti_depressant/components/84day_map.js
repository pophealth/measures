function() {
  var patient = this;
  var measure = patient.measures["0105"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =        <%= effective_date %>;
  var latest_birthdate = latestBirthdayForThisAge(18, effective_date) - (245 * day);
  var earliest_encounter =        effective_date - ((1 * year) + (245 * day));
  var latest_encounter =          effective_date - (245 * day);
  var first_diagnosis = null;
  var encounters_during_interval = null;

  var population = function() {
    if (patient.birthdate > latest_birthdate) {
      return(false);
    }
    var all_encounters = normalize(measure.encounter_ed_encounter,
                                   measure.encounter_outpt_bh_req_pos_encounter,
                                   measure.encounter_outpt_bh_encounter);
    var encounters_during_interval = inRange(all_encounters,
                                             earliest_encounter,
                                             latest_encounter);
    var major_depression_during_interval = inRange(measure.major_depression_diagnosis_active,
                                                   earliest_encounter,
                                                   latest_encounter);
    var depression_during_encounter = allDiagnosesDuringEncounter(measure.major_depression_diagnosis_active,
                                                                  all_encounters,
                                                                  earliest_encounter,
                                                                  latest_encounter);
    if (depression_during_encounter.length == 0) {
      return(false);
    }

    first_diagnosis = _.min(depression_during_encounter);
    var meds_dispensed_before_first_diagnosis30 = inRange(measure.antidepressant_medications_medication_dispensed,first_diagnosis - (30 * day), first_diagnosis);
    var meds_dispensed_after_first_diagnosis14 = inRange(measure.antidepressant_medications_medication_dispensed, first_diagnosis, first_diagnosis + (14 * day));
    var meds_ordered_before_first_diagnosis30 = inRange(measure.antidepressant_medications_medication_order,first_diagnosis - (30 * day), first_diagnosis);
    var meds_ordered_after_first_diagnosis14 = inRange(measure.antidepressant_medications_medication_order, first_diagnosis, first_diagnosis + (14 * day));
    var meds_active_before_first_diagnosis30 = inRange(measure.antidepressant_medications_medication_active,first_diagnosis - (30 * day), first_diagnosis);
    var meds_active_after_first_diagnosis14 = inRange(measure.antidepressant_medications_medication_active, first_diagnosis, first_diagnosis + (14 * day));

    return(meds_dispensed_before_first_diagnosis30 &&
           meds_ordered_before_first_diagnosis30 &&
           meds_active_before_first_diagnosis30 &&
           meds_dispensed_after_first_diagnosis14 &&
           meds_ordered_after_first_diagnosis14 &&
           meds_active_after_first_diagnosis14);
  }

  var denominator = function() {
    var earlier_major_depression = inRange(measure.major_depression_diagnosis_active,
                                           first_diagnosis - (120 * day),
                                           (first_diagnosis - 1));
    var earlier_depression = inRange(measure.depression_diagnosis_active,
                                     first_diagnosis - (120 * day),
                                     (first_diagnosis - 1));
    return((earlier_major_depression + earlier_depression) == 0);
  }

  var numerator = function() {
    var meds_after = first_diagnosis + (84 * day);
    var max_meds = _.max(measure.antidepressant_medications_medication_dispensed);
    return(meds_after < max_meds);
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};
