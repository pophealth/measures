function() {
  var patient = this;
  var measure = patient.measures["0068"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;

  var effective_date =        <%= effective_date %>;

  var measurement_period_start =  effective_date - year;
  var latest_birthdate = latestBirthdayForThisAge(17, measurement_period_start);

  var earliest_encounter =  effective_date - (2 *  year);
  var latest_encounter =    effective_date - (1 *  year) - (61 * day);
  var earliest_procedure =  effective_date - (2 *  year);
  var latest_procedure =    effective_date - (1 *  year) - (61 * day);

  // The percentage of patients 18 years of age and older who were discharged alive for acute myocardial infarction (AMI),
  // coronary artery bypass graft (CABG) or percutaneous transluminal coronary angioplasty (PTCA) from January 1-November 1
  // of the year prior to the measurement year, or who had a diagnosis of ischemic vascular disease (IVD) during the
  // measurement year and the year prior to the measurement year and who had documentation of use of aspirin or another
  // antithrombotic during the measurement year.
  var population = function() {
    return (patient.birthdate <= latest_birthdate);
  }

  var denominator = function() {
    return ivd_denominator(measure, effective_date, earliest_procedure, latest_procedure, earliest_encounter, latest_encounter);
  }

  var numerator = function() {
    meds = inRange(measure.oral_anti_platelet_therapy_medication_active,    earliest_encounter, effective_date) +
           inRange(measure.oral_anti_platelet_therapy_medication_order,     earliest_encounter, effective_date) +
           inRange(measure.oral_anti_platelet_therapy_medication_dispensed, earliest_encounter, effective_date);
    return meds;
  }

  var exclusion = function() {
    false;
  }

  map(patient, population, denominator, numerator, exclusion);
};
