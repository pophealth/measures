function () {
  var patient = this;
  var measure = patient.measures["0038"];
  if (measure==null)
    measure={};
    
  <%= init_js_frameworks %>

  var year = 365 * 24 * 60 * 60;
  var effective_date =  <%= effective_date %>;
  // earliest and latest birthday are the same number because earliest birthday removes an extra year ( 1 <= age < 2)
  var earliest_birthdate = earliestBirthdayForThisAge(1, effective_date);
  var latest_birthdate = latestBirthdayForThisAge(1, effective_date);

  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }

  // the denominator logic is the same for all of the 0038 reports and this
  // code is defined in the shared library in the project in the code from
  // /js/childhood_immunizations.js
  var denominator = function() {
    return has_outpatient_encounter_with_pcp_obgyn(measure, patient.birthdate, effective_date);
  }

  var numerator = function() {
    return(dtap_numerator(measure, patient.birthdate, effective_date) &&
           ipv_numerator(measure, patient.birthdate, effective_date) &&
           mmr_numerator(measure, patient.birthdate, effective_date) &&
           hib_numerator(measure, patient.birthdate, effective_date) &&
           hep_b_numerator(measure, patient.birthdate, effective_date) &&
           vzv_numerator(measure, patient.birthdate, effective_date) );
   }

  var exclusion = function() {
    return(
           dtap_exclusion(measure, patient.birthdate, effective_date) ||
           ipv_exclusion(measure, patient.birthdate, effective_date) ||
           mmr_exclusion(measure, patient.birthdate, effective_date) ||
           hib_exclusion(measure, patient.birthdate, effective_date) ||
           hep_b_exclusion(measure, patient.birthdate, effective_date) ||
           vzv_exclusion(measure, patient.birthdate, effective_date) );
  }

  map(patient, population, denominator, numerator, exclusion);
};
