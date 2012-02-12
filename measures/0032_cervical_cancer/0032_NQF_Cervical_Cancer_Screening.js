function () {
  var patient = this;
  var measure = patient.measures["0032"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var measurement_period_start = effective_date - 1*year;
  /*
   AND:"Patientcharacteristic:birthdate"(age) >=23 and <=63 (at beginning of measurement period) years to expect screening for patients within 
        three years after reaching 21 years and then every three years until 64 years;
  */
  var earliest_birthdate = earliestBirthdayForThisAge(63, measurement_period_start);
  var latest_birthdate = latestBirthdayForThisAge(23, measurement_period_start);
  var earliest_encounter = effective_date - 2*year;
  var earliest_pap = effective_date - 3*year;
  
  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }
  
  var denominator = function() {
    var outpatient_encounter = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
    var obgyn_encounter = inRange(measure.encounter_ob_gyn_encounter, earliest_encounter, effective_date);
    var hysterectomies = normalize(measure.hysterectomy_procedure_performed);
    var no_hysterectomy = hysterectomies.length==0 || (_.min(hysterectomies)>=effective_date);
    return ((outpatient_encounter==1 || obgyn_encounter==1) && no_hysterectomy);
  }
  
  var numerator = function() {
    return inRange(measure.pap_test_laboratory_test_result, earliest_pap, effective_date);
  }
  
  var exclusion = function() {
    return false;
  }
  
  map(patient, population, denominator, numerator, exclusion);
};
