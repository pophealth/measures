function () {
  var patient = this;
  var measure = patient.measures["0038"];
  if (measure==null)
    measure={};

  <%= init_js_frameworks %>

  var year = 365 * 24 * 60 * 60;;
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

  // To meet the criteria for this report, the patient needs either:
  // 2 different Hepatitis A (Hep A) vaccines until the time that they are 2 years old,
  // OR resolution on a hepatitis A diagnosis by the end of the effective date
  var numerator = function() {
    return(hep_a_numerator(measure, patient.birthdate, effective_date));
  }

  // Exclude patients who have an allergy to hepatitis A vaccine
  var exclusion = function() {
    return (hep_a_exclusion(measure, patient.birthdate, effective_date));
  }

  map(patient, population, denominator, numerator, exclusion);
};
