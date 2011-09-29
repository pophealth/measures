// Adds childhood immunization utility functions to the root JS object. These 
// are then available for use by the supporting map-reduce functions for any 
// measure that needs common definitions of childhood-immunization-specific 
// algorithms.
//
// lib/qme/mongo_helpers.rb executes this function on a database
// connection.
function () {
  var day = 24 * 60 * 60;
  var year = 365 * day;
  var root = this;

  // Denominator function
  root.has_outpatient_encounter_with_pcp_obgyn = function (measure, earliest_diagnosis, effective_date) {
    return inRange(measure.encounter_outpatient_w_pcp_obgyn_encounter, earliest_diagnosis, effective_date);
  };

  // dtap -- numerator 1
  root.dtap_numerator = function (measure, birthdate, effective_date) {
    var earliest_vaccine = birthdate + 42 * day;
    var latest_vaccine = birthdate + 2 * year;
    var number_dtap_vaccine_administered = inRange(unique_dates(measure.dtap_vaccine_medication_administered), earliest_vaccine, latest_vaccine);
    var number_dtap_vaccine_procedure = inRange(unique_dates(measure.dtap_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);

    return (number_dtap_vaccine_administered >= 4 || number_dtap_vaccine_procedure >= 4);
  };

  // dtap -- exclusion 1
  root.dtap_exclusion = function (measure, birthdate, effective_date) {
    many_exclusions = normalize(
      measure.dtap_vaccine_medication_allergy,
      measure.encephalopathy_diagnosis_active,
      measure.progressive_neurologic_disorder_diagnosis_active);
    return (inRange(many_exclusions, birthdate, effective_date));
  };
  /// IPV -- numerator 2
  root.ipv_numerator = function (measure, birthdate, effective_date) {
    // IPV vaccines are considered when they are occurring >= 42 days and 
    // < 2 years after the patients' birthdate
    var earliest_vaccine = birthdate + 42 * day;
    var latest_vaccine = birthdate + 2 * year;
    var number_ipv_vaccine_administered = inRange(unique_dates(measure.ipv_medication_administered), earliest_vaccine, latest_vaccine);
    var number_ipv_vaccine_procedure = inRange(unique_dates(measure.ipv_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);

    return (number_ipv_vaccine_administered >= 3 || number_ipv_vaccine_procedure >= 3);
  };

  // IPC -- exclusion 2 Exclude patients who have an allergy to ipv Vaccine and various medications
  root.ipv_exclusion = function (measure, birthdate, effective_date) {
    var many_exclusions = normalize(
      measure.ipv_medication_allergy,
      measure.neomycin_medication_allergy,
      measure.streptomycin_medication_allergy,
      measure.polymyxin_medication_allergy);
    return (inRange(many_exclusions, birthdate, effective_date));

  };
  /// MMR Numerator 3
  root.mmr_numerator = function (measure, birthdate, effective_date) {
    var latest_vaccine = birthdate + (2 * year);
    var earliest_vaccine = birthdate;

    var number_mmr_vaccine_administered = inRange(unique_dates(measure.mmr_vaccine_medication_administered), earliest_vaccine, latest_vaccine);
    var number_measles_vaccine_administered = inRange(unique_dates(measure.measles_vaccine_medication_administered), earliest_vaccine, latest_vaccine);
    var number_mumps_vaccine_administered = inRange(unique_dates(measure.mumps_vaccine_medication_administered), earliest_vaccine, latest_vaccine);
    var number_rubella_vaccine_administered = inRange(unique_dates(measure.rubella_vaccine_medication_administered), earliest_vaccine, latest_vaccine);

    var number_mmr_vaccine_procedure = inRange(unique_dates(measure.mmr_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);
    var number_measles_vaccine_procedure = inRange(unique_dates(measure.measles_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);
    var number_mumps_vaccine_procedure = inRange(unique_dates(measure.mumps_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);
    var number_rubella_vaccine_procedure = inRange(unique_dates(measure.rubella_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);

    var mmr_criteria = (number_mmr_vaccine_administered >= 1 || number_mmr_vaccine_procedure >= 1);
    var rubella_criteria = (number_rubella_vaccine_administered >= 1 || number_rubella_vaccine_procedure >= 1) ||
                            (conditionResolved(measure.rubella_diagnosis_resolved, birthdate, effective_date));
    var measles_criteria = (number_measles_vaccine_administered >= 1 || number_measles_vaccine_procedure >= 1) ||
                            (conditionResolved(measure.measles_diagnosis_resolved, birthdate, effective_date));
    var mumps_criteria = (number_mumps_vaccine_administered >= 1 || number_mumps_vaccine_procedure >= 1) ||
                          (conditionResolved(measure.mumps_diagnosis_resolved, birthdate, effective_date));
    return (mmr_criteria || (rubella_criteria && measles_criteria && mumps_criteria));
  };

  root.mmr_exclusion = function (measure, birthdate, effective_date) {
    many_exclusions = normalize(
      measure.cancer_of_lymphoreticular_or_histiocytic_tissue_diagnosis_active,
      measure.cancer_of_lymphoreticular_or_histiocytic_tissue_diagnosis_inactive,
      measure.hiv_disease_diagnosis_active,
      measure.multiple_myeloma_diagnosis_active,
      measure.leukemia_diagnosis_active,
      measure.immunodeficiency_diagnosis_active,
      measure.measles_vaccine_medication_allergy,
      measure.mumps_vaccine_medication_allergy,
      measure.rubella_vaccine_medication_allergy);
    return (inRange(many_exclusions, birthdate, effective_date));

  };

  // HiB - Numerator 4
  root.hib_numerator = function (measure, birthdate, effective_date) {
    // HiB vaccines are considered when they are occurring >= 42 days and
    // < 2 years after the patients' birthdate
    var earliest_vaccine = birthdate + 42 * day;
    var latest_vaccine = birthdate + 2 * year;
    var number_hib_vaccine_administered = inRange(unique_dates(measure.hib_medication_administered), earliest_vaccine, latest_vaccine);
    var number_hib_vaccine_procedure = inRange(unique_dates(measure.hib_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);

    return (number_hib_vaccine_administered >= 2 || number_hib_vaccine_procedure >= 2);
  };

  // Exclude patients who have an allergy to hib Vaccine
  root.hib_exclusion = function (measure, birthdate, effective_date) {
    return (inRange(measure.hib_medication_allergy, birthdate, effective_date));
  };


  // Hepatitis B -- Numerator 5
  root.hep_b_numerator = function (measure, birthdate, effective_date) {
    // Hepatitis B vaccines are considered when they are occurring < 2 years after
    // the patients' birthdate
    var earliest_vaccine = birthdate;
    var latest_vaccine = birthdate + 2 * year;
    var number_hep_b_vaccine_procedure = inRange(unique_dates(measure.hepatitis_b_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);
    var number_hep_b_vaccine_administered = inRange(unique_dates(measure.hepatitis_b_vaccine_medication_administered), earliest_vaccine, latest_vaccine);

    return (number_hep_b_vaccine_administered >= 3 || number_hep_b_vaccine_procedure >= 3 || (conditionResolved(measure.hepatitis_b_diagnosis_diagnosis_resolved, birthdate, effective_date)));
  };

  // Hepatitis B -- Exclusion 5   Exclude patients who have an allergy to hep_b Vaccine
  root.hep_b_exclusion = function (measure, birthdate, effective_date) {
    return ((inRange(measure.hepatitis_b_vaccine_medication_allergy, birthdate, effective_date)) || (inRange(measure.baker_s_yeast_substance_substance_allergy, birthdate, effective_date)) || (inRange(measure.baker_s_yeast_medication_allergy, birthdate, effective_date)));
  };

  /// VZV -- numerator 6
  // To meet the criteria for this report, the patient needs to have either:
  // 1 Chicken Pox (VZV) vaccine up until the time that they are 2 years old,
  // OR resolution on VZV diagnosis by the end of the effective date of this measure
  root.vzv_numerator = function (measure, birthdate, effective_date) {
    var latest_vaccine = birthdate + 2 * year;
    var earliest_vaccine = birthdate;

    var number_vzv_vaccine_administered = inRange(unique_dates(measure.vzv_vaccine_medication_administered), earliest_vaccine, latest_vaccine);
    var number_vzv_vaccine_procedure = inRange(unique_dates(measure.vzv_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);

    return ((number_vzv_vaccine_administered >= 1 || number_vzv_vaccine_procedure >= 1) || (conditionResolved(measure.vzv_diagnosis_resolved, birthdate, effective_date)));
  };

  //VSV  -- exclusion 6
  // Exclude patients who have either Lymphoreticular or Histiocytic cancer, or Asymptomatic HIV,
  // or Multiple Myeloma, or Leukemia, or Immunodeficiency, or medication allergy to VZV vaccine
  root.vzv_exclusion = function (measure, birthdate, effective_date) {
    many_exclusions = normalize(
      measure.cancer_of_lymphoreticular_or_histiocytic_tissue_diagnosis_active,
      measure.cancer_of_lymphoreticular_or_histiocytic_tissue_diagnosis_inactive,
      measure.hiv_disease_diagnosis_active,
      measure.multiple_myeloma_diagnosis_active,
      measure.leukemia_diagnosis_active,
      measure.immunodeficiency_diagnosis_active,
      measure.vzv_vaccine_medication_allergy);
    return (inRange(many_exclusions, birthdate, effective_date));

  };

  /// PCV - numerator 7
  root.pcv_numerator = function (measure, birthdate, effective_date) {
    // PCV vaccines are considered when they are occurring < 2 years after 
    // the patients' birthdate
    var latest_vaccine = birthdate + 2 * year;
    var earliest_vaccine = birthdate;
    var number_pcv_vaccine_administered = inRange(unique_dates(measure.pneumococcal_vaccine_medication_administered), earliest_vaccine, latest_vaccine);
    var number_pcv_vaccine_procedure = inRange(unique_dates(measure.pneumococcal_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);

    return (number_pcv_vaccine_administered >= 4 || number_pcv_vaccine_procedure >= 4);
  };

  // PCV - exclusion 7
  root.pcv_exclusion = function (measure, birthdate, effective_date) {
    return (inRange(measure.pneumococcal_vaccine_medication_allergy, birthdate, effective_date));
  };


  // Hepatitis A -- numerator 8
  root.hep_a_numerator = function (measure, birthdate, effective_date) {
    // Hepatitis A vaccines are considered when they are occurring < 2 years after
    // the patients' birthdate
    var latest_vaccine = birthdate + 2 * year;
    var earliest_vaccine = birthdate;
    var number_hep_a_vaccine_administered = inRange(unique_dates(measure.hepatitis_a_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);
    var number_hep_a_vaccine_procedure = inRange(unique_dates(measure.hepatitis_a_vaccine_medication_administered), earliest_vaccine, latest_vaccine);

    return (number_hep_a_vaccine_administered >= 2 || number_hep_a_vaccine_procedure >= 2 || (conditionResolved(measure.hepatitis_a_diagnosis_diagnosis_resolved, birthdate, effective_date)));
  };

  // Exclude patients who have an allergy to hep_a Vaccine
  root.hep_a_exclusion = function (measure, birthdate, effective_date) {
    return (inRange(measure.hepatitis_a_vaccine_medication_allergy, birthdate, effective_date));
  };

  /// Rotavirus -- numerator 9
  root.rv_numerator = function (measure, birthdate, effective_date) {
    // RV vaccines are considered when they are occurring < 2 years after 
    // the patients' birthdate
    var latest_vaccine = birthdate + 2 * year;
    var earliest_vaccine = birthdate;
    var number_rv_vaccine_administered = inRange(unique_dates(measure.rotavirus_vaccine_medication_administered), earliest_vaccine, latest_vaccine);
    var number_rv_vaccine_procedure = inRange(unique_dates(measure.rotavirus_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);

    return (number_rv_vaccine_administered >= 2 || number_rv_vaccine_procedure >= 2);
  };

  /// Rotavirus -- exclusion 9
  root.rv_exclusion = function (measure, birthdate, effective_date) {
    return (inRange(measure.rotavirus_vaccine_medication_allergy, birthdate, effective_date));
  };
  /// influenza -- numerator 10
  root.inf_numerator = function (measure, birthdate, effective_date) {
    // Influenza vaccines are considered when they are occurring >= 180 days and 
    // < 2 years after the patients' birthdate
    var earliest_vaccine = birthdate + 180 * day;
    var latest_vaccine = birthdate + 2 * year;
    var number_inf_vaccine_administered = inRange(unique_dates(measure.influenza_vaccination_procedure_performed), earliest_vaccine, latest_vaccine);
    var number_inf_vaccine_procedure = inRange(unique_dates(measure.influenza_vaccine_medication_administered), earliest_vaccine, latest_vaccine);

    return (number_inf_vaccine_administered >= 2 || number_inf_vaccine_procedure >= 2);
  };

  root.inf_exclusion = function (measure, birthdate, effective_date) {
    many_exclusions = normalize(
      measure.cancer_of_lymphoreticular_or_histiocytic_tissue_diagnosis_active,
      measure.cancer_of_lymphoreticular_or_histiocytic_tissue_diagnosis_inactive,
      measure.hiv_disease_diagnosis_active, 
      measure.multiple_myeloma_diagnosis_active,
      measure.leukemia_diagnosis_active,
      measure.influenza_vaccine_medication_allergy, 
      measure.immunodeficiency_diagnosis_active);
    return (inRange(many_exclusions, birthdate, effective_date));
  };

}