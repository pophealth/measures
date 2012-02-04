function() {
  var patient = this;
  var measure = patient.measures["0013"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start = effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);

  var encounters = normalize(measure.encounter_outpatient_encounter,
                             measure.encounter_nursing_facility_encounter);

  var population = function() {
    var correct_age = patient.birthdate <= latest_birthdate;
    var hypertension = lessThan(measure.hypertension_diagnosis_active, effective_date); // hypertension diagnosis is not bounded in time
    var num_encounters = inRange(encounters, measurement_period_start, effective_date);
    return (correct_age && hypertension && (num_encounters >= 2));
  };

  var denominator = function() {
    return true;
  };

  var numerator = function() {
    var systolic =  eventDuringEncounter(measure.systolic_blood_pressure_physical_exam_finding,
                                         encounters,
                                         measurement_period_start,
                                         effective_date);
    var diastolic = eventDuringEncounter(measure.diastolic_blood_pressure_physical_exam_finding,
                                         encounters,
                                         measurement_period_start,
                                         effective_date);
    return (systolic && diastolic);
  };

  var exclusion = function() {
    return false;
  };

  map(patient, population, denominator, numerator, exclusion);
}
