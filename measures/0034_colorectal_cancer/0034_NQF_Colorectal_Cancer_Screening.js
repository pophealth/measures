function () {
  var patient = this;
  var measure = patient.measures["0034"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365*24*60*60;
  var effective_date = <%= effective_date %>;
  var measurement_period_start = effective_date - 1*year;
  /*
	AND: "Patient characteristic: birth date" >= 50 and <= 74 years (from beginning of measurement period) to 
	      expect screening for patients within one year after reaching 50 years until 75 years;
   */
  var latest_birthdate = latestBirthdayForThisAge(50, measurement_period_start);
  var earliest_birthdate = earliestBirthdayForThisAge(74, measurement_period_start);
  var earliest_encounter = effective_date - 2*year;
  var one_year = effective_date - 1*year;
  var five_years = effective_date - 5*year;
  var ten_years = effective_date - 10*year;
  
  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }
  
  var denominator = function() {
    var total_colectomy = lessThan(measure.total_colectomy_procedure_performed, effective_date);
    var encounter = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
    return encounter && !total_colectomy;
  }
  
  var numerator = function() {
    var colonoscopy = inRange(measure.colonoscopy_procedure_performed, ten_years, effective_date);
    var sigmoidoscopy = inRange(measure.flexible_sigmoidoscopy_procedure_performed, five_years, effective_date);
    var fobt = inRange(measure.fobt_laboratory_test_performed, one_year, effective_date);
    return colonoscopy || sigmoidoscopy || fobt;
  }
  
  var exclusion = function() {
    return ( lessThan(measure.colorectal_cancer_diagnosis_active, effective_date) +
             lessThan(measure.colorectal_cancer_diagnosis_inactive, effective_date) +
             lessThan(measure.colorectal_cancer_diagnosis_resolved, effective_date));
             
  }
  
  map(patient, population, denominator, numerator, exclusion);
};
