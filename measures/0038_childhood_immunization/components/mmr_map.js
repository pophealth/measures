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

  // Measles, Mumps and Rubella (MMR) vaccines are considered when they are occur
  // < 2 years after the patients' birthdate
  var latest_mmr_vaccine =   patient.birthdate + 2 * year;

  var population = function() {
    return inRange(patient.birthdate, earliest_birthdate, latest_birthdate);
  }

  // the denominator logic is the same for all of the 0038 reports and this
  // code is defined in the shared library in the project in the code from
  // /js/childhood_immunizations.js
  var denominator = function() {
    return has_outpatient_encounter_with_pcp_obgyn(measure, patient.birthdate, effective_date);
  }

  // patient needs 1 Measles, Mumps and Rubella (MMR) vaccine prior to 2 years old
  // or needs to address measles, mumpls, and rubella independently through vaccine,
  // resolved condition, or allergy to individual vaccine
  var numerator = function() {
    return(mmr_numerator(measure, patient.birthdate, effective_date));
  }

  var exclusion = function(){
    return(mmr_exclusion(measure, patient.birthdate, effective_date));
 }

  map(patient, population, denominator, numerator, exclusion);
};
