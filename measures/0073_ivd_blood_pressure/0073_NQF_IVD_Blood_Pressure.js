function() {
  var patient = this;
  var measure = patient.measures["0073"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - year;
  var latest_birthdate = latestBirthdayForThisAge(17, measurement_period_start);

  var earliest_encounter = effective_date - (2 *  year);
  var latest_encounter =   effective_date - (1 *  year) - (61 * day);
  var earliest_procedure = effective_date - (2 *  year);
  var latest_procedure =   effective_date - (1 *  year) - (61 * day);

  var population = function() {
    return (patient.birthdate <= latest_birthdate);
  }

  var denominator = function() {
     return ivd_denominator(measure, effective_date, earliest_procedure, latest_procedure, earliest_encounter, latest_encounter);
  }

  var numerator = function() {
    var encounters = selectWithinRange(measure.encounter_acute_inpt_and_outpt_encounter, -Infinity, effective_date);
    if (encounters.length==0)
      return false;
    var last_inpt_and_outpt_encounter = _.max(encounters);
    var start_latest_encounter = last_inpt_and_outpt_encounter - day;
    var end_latest_encounter = last_inpt_and_outpt_encounter   + day;
    var systolic_min  = minValueInDateRange(measure.systolic_blood_pressure_physical_exam_finding,
                                            start_latest_encounter,
                                            end_latest_encounter,
                                            false);
    var diastolic_min = minValueInDateRange(measure.diastolic_blood_pressure_physical_exam_finding,
                                            start_latest_encounter,
                                            end_latest_encounter,
                                            false);
    if (systolic_min === false || diastolic_min === false)
      return false;
    return (systolic_min < 140 && diastolic_min < 90);
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};