function() {
  var patient = this;
  var measure = patient.measures["0001"];
  if (measure == null)
    measure = {};

  <%= init_js_frameworks %>

  var year = 365 * 24 * 60 * 60;
  var effective_date =        <%=effective_date %>;
  var measurement_period_start = effective_date - (1 * year);
  var earliest_birthdate =       earliestBirthdayForThisAge(40, measurement_period_start);
  var latest_birthdate =         latestBirthdayForThisAge(5, measurement_period_start);
  
  var population = function() {
      // the number of counts of office encounters and outpatient consults
      // to determine the physician has a relationship with the patient
      var encounter_after_asthma_diagnosis = actionFollowingSomething(measure.asthma_diagnosis_active, measure.encounter_office_outpatient_consult_encounter);
      var encounters = inRange(measure.encounter_office_outpatient_consult_encounter,
                               measurement_period_start,
                               effective_date);
  
      return (inRange(patient.birthdate, earliest_birthdate, latest_birthdate) && 
              encounter_after_asthma_diagnosis && 
              encounters >= 2);
  }
  
  var denominator = function() {
      return population();
  }
  
  var numerator = function() {
      var daytime_symptoms_assessed_before_encounter = actionFollowingSomething(
      measure.asthma_daytime_symptoms_quantified_symptom_assessed,
      measure.encounter_office_outpatient_consult_encounter);
  
      var nighttime_symptoms_assessed_before_encounter = actionFollowingSomething(
      measure.asthma_nighttime_symptoms_quantified_symptom_assessed,
      measure.encounter_office_outpatient_consult_encounter);
  
      var daytime_symptoms_diagnosed_before_encounter = actionFollowingSomething(
      measure.asthma_daytime_symptoms_diagnosis_active,
      measure.encounter_office_outpatient_consult_encounter);
  
      var nighttime_symptoms_diagnosed_before_encounter = actionFollowingSomething(
      measure.asthma_nighttime_symptoms_symptom_active,
      measure.encounter_office_outpatient_consult_encounter);
  
      var asthma_assessment_before_encounter = actionFollowingSomething(
      measure.asthma_symptom_assessment_tool_risk_category_assessment,
      measure.encounter_office_outpatient_consult_encounter);
  
      return ((daytime_symptoms_assessed_before_encounter && nighttime_symptoms_assessed_before_encounter) ||
              (daytime_symptoms_diagnosed_before_encounter && nighttime_symptoms_diagnosed_before_encounter) ||
              asthma_assessment_before_encounter);
  }
  
  var exclusion = function() {
      return false;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};