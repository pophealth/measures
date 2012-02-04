function() {
  var patient = this;
  var measure = patient.measures["0389"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - (1 * year);
  var earliest_encounter =        effective_date - (1 * year);

  var population = function() {
    var prostate_cancer = lessThan(measure.prostate_cancer_diagnosis_active, effective_date);
    return prostate_cancer;
  }

  var denominator = function() {
    var prostate_cancer_treatments = selectWithinRange(measure.prostate_cancer_treatment_procedure_performed,
      earliest_encounter, effective_date);
    if (prostate_cancer_treatments.length == 0) {
      return false;
    }
    var final_treatment = _.max(prostate_cancer_treatments);
    var low_risk_prostate_cancer = actionFollowingSomething(
      measure.ajcc_cancer_stage_low_risk_recurrence_prostate_cancer_procedure_result,
      measure.prostate_cancer_treatment_procedure_performed);
    var MAX_ANTIGEN = 10;
    var antigens = minValueInDateRange(measure.prostate_specific_antigen_test_laboratory_test_result, -Infinity, final_treatment, MAX_ANTIGEN+1);
    var MAX_GLEASON = 6;
    var gleason = minValueInDateRange(measure.gleason_score_laboratory_test_result, -Infinity, final_treatment, MAX_GLEASON+1);
    var gleason_six = inRange(measure.gleason_score_6_laboratory_test_result, -Infinity, final_treatment);
    return (low_risk_prostate_cancer && // already checked for treatment above
            (antigens <= MAX_ANTIGEN) &&
            ((gleason <= MAX_GLEASON) || gleason_six));
  }

  var numerator = function() {
    var bone_scan = actionFollowingSomething(
      measure.prostate_cancer_diagnosis_active, measure.bone_scan_diagnostic_study_performed);
    return !(bone_scan);
  }

  var exclusion = function() {
    var pain = actionFollowingSomething(
      measure.prostate_cancer_diagnosis_active, measure.pain_related_to_prostate_cancer_diagnosis_active);
    var salvage = actionFollowingSomething(
      measure.prostate_cancer_diagnosis_active, measure.salvage_therapy_procedure_performed);
    // commented out waiting for issue response - would yield 100% result for measure if included
    // var bone_scan = actionFollowingSomething(
    // measure.prostate_cancer_diagnosis_active, measure.bone_scan_diagnostic_study_performed);
    // return (pain || salvage|| bone_scan );
    return (pain || salvage);
  }

  map(patient, population, denominator, numerator, exclusion);
};