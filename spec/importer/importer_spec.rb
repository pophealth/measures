require 'ap'
require 'health-data-standards'

RSpec.configure do |config|
  # RSpec automatically cleans stuff out of backtraces;
  # sometimes this is annoying when trying to debug something e.g. a gem
  config.backtrace_clean_patterns = [
    /\/lib\d*\/ruby\//,
    /bin\//,
    /spec\/spec_helper\.rb/,
    /lib\/rspec\/(core|expectations|matchers|mocks)/
  ]
end 

describe QME::Importer::GenericImporter do

  before(:all) do
    @loader = reload_bundle
    
    measure_ids = @loader.get_db.collection('measures').find({}, {:fields => {:id => 1}}).map {|r| r['id']}.uniq

    measure_ids.each do |id|
      QME::Importer::MeasurePropertiesGenerator.instance.add_measure(id, QME::Importer::GenericImporter.new(@loader.get_db.collection('measures').find_one({:id => id})))
    end
  end

  def get_measure_info(c32_file, measure_id)
    doc = Nokogiri::XML(File.new(c32_file))
    doc.root.add_namespace_definition('cda', 'urn:hl7-org:v3')
    patient = HealthDataStandards::Import::C32::PatientImporter.instance.parse_c32(doc)
    measure_properties = QME::Importer::MeasurePropertiesGenerator.instance.generate_properties(patient)
    measure_properties[measure_id]
  end

  context "when working with the extended NIST example C32 file" do
    it "should import the information relevant to 0001" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0001')
      measure_info['asthma_daytime_symptoms_quantified_symptom_assessed'].should include(1286668800)
    end

    it "should import the information relevant to 0028" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0028')
      measure_info['tobacco_non_user_patient_characteristic'].should include(-725846400)
    end

    it "should import the information relevant to 0033" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0033')
      measure_info['iud_use_device_applied'].should include(853459200)
      measure_info['contraceptive_use_education_communication_to_patient'].should include(1286668800)
    end

    #	0055/N_c47 Diabetes active
    it "should import the information relevant relevant to 0055" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0055')
      measure_info['diabetes_diagnosis_active'].should include(-631152000 )
    end

    # 0068/N_c191 (acute MI) Active Cardiac Pacemaker in Situ 
    it "should import the information relevant to 0068" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0068')
      measure_info['acute_myocardial_infarction_diagnosis_active'].should include(852422400)
    end
    
    # 0070/A_c303 Pacemaker 
    it "should import the information relevant to 0070" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0070')
      measure_info['cardiac_pacer_device_applied'].should include(942278400)
    end

    # 0081/A_c532 Active Pregnancy  (changed the NIST example, which had a past pregnancy)
    # 0081/A_c39, added 3 records, one each for an allergy, intolerance, and an adverse event (A_518, A_68, A_75)
    it "should import the information relevant to 0081" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0081')
      measure_info['pregnancy_diagnosis_active'].should include(1291852800)
#       measure_info['ace_inhibitor_or_arb_medication_allergy'].should include(1134345600)
#       measure_info['ace_inhibitor_or_arb_medication_intolerance'].should include(1134345600)
#       measure_info['ace_inhibitor_or_arb_medication_adverse_event'].should include(1134345600)
    end

    # 0389/A_c271 Bone Scan
    it "should import the information relevant to 0389" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0389')
      measure_info['bone_scan_diagnostic_study_performed'].should include(955026000)
    end

    # 0387/A_c278History of Breast Cancer (basically inactive breast cancer) 
    it "should import the information relevant to 0387" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0387')
      measure_info['breast_cancer_history_diagnosis_inactive'].should include(-631152000 )
    end

    # 0421/Q_C155 BMI Management Plan
    it "should import the information relevant to 0421" do
      measure_info = get_measure_info('fixtures/c32_fragments/testingc32.xml', '0421')
      measure_info['follow_up_plan_bmi_management_care_plan'].should include(956275200)
    end
  end
  
  it "should import the information relevant to determining hypertension blood pressure measurement" do
    measure_info = get_measure_info('fixtures/c32_fragments/0013/numerator.xml', '0013')

    measure_info['encounter_outpatient_encounter'].should include(1270598400)
    measure_info['hypertension_diagnosis_active'].should include(1262304000)
    measure_info['diastolic_blood_pressure_physical_exam_finding'].should include(942537600)
    measure_info['systolic_blood_pressure_physical_exam_finding'].should include(942537600)
  end

  it "should import the information relevant to determining high blood pressure" do
    measure_info = get_measure_info('fixtures/c32_fragments/0018/numerator.xml', '0018')
    measure_info['procedures_indicative_of_esrd_procedure_performed'].should include(1291939200)
    measure_info['pregnancy_diagnosis_active'].should include(1291939200)
    measure_info['esrd_diagnosis_active'].should include (1291939200)
    measure_info['encounter_outpatient_encounter'].should include(1239062400)
    measure_info['hypertension_diagnosis_active'].should include(1258156800)
    measure_info['systolic_blood_pressure_physical_exam_finding'].should include('date' => 1258156800, 'value' => 132.0)
    measure_info['diastolic_blood_pressure_physical_exam_finding'].should include('date' => 1258156800, 'value' => 86.0)
  end

  it "should import the the information relevant to determining tobacco use" do
    measure_info = get_measure_info('fixtures/c32_fragments/0028/numerator.xml', '0028')
    measure_info['encounter_prev_med_individual_counseling_encounter'].should include(1270598400)
    measure_info['tobacco_user_patient_characteristic'].should include(1262304000)
  end

  it "should import the the information relevant to determining cervical cancer screening status" do
    measure_info = get_measure_info('fixtures/c32_fragments/0032/numerator.xml', '0032')

    measure_info['encounter_outpatient_encounter'].should include(1270598400)
    measure_info['pap_test_laboratory_test_result'].should include(1269302400)
    measure_info['hysterectomy_procedure_performed'].should eql(nil)
  end

  it "should import the the information relevant to chlamydia screening" do
    measure_info = get_measure_info('fixtures/c32_fragments/0033/numerator.xml', '0033')

    measure_info['encounter_outpatient_encounter'].should include(1270598400)
#     measure_info['encounter_pregnancy_encounter'].should include(1273190400)
    measure_info['contraceptives_medication_active'].should include(1248825600)
    measure_info['retinoid_medication_active'].should include(1248825600)
#     measure_info['chlamydia_screening_laboratory_test_performed'].should include(1269302400)
    measure_info['laboratory_tests_indicative_of_sexually_active_women_laboratory_test_performed'].should include(1269354600)
    measure_info['pregnancy_test_laboratory_test_performed'].should include(1269354600)
    measure_info['procedures_indicative_of_sexually_active_woman_procedure_performed'].should include(1269354600)
    measure_info['sexually_active_woman_diagnosis_active'].should include(1262304000)
  end

  it "should import the the information relevant to breast cancer screening" do
    measure_info = get_measure_info('fixtures/c32_fragments/0031/numerator.xml', '0031')
    
    measure_info['encounter_outpatient_encounter'].should include(1270598400)
    measure_info['unilateral_mastectomy_procedure_performed'].length.should == 2
    measure_info['unilateral_mastectomy_procedure_performed'].should include(1248825600)
    measure_info['unilateral_mastectomy_procedure_performed'].should include(1248825600)
    measure_info['bilateral_mastectomy_procedure_performed'].length.should == 1
    measure_info['bilateral_mastectomy_procedure_performed'].should include(1248825600)
    
    measure_info['breast_cancer_screening_diagnostic_study_performed'].should include(1248825600)
  end
  
  it "should import the the information relevant to determining pneumonia vaccination status" do
    measure_info = get_measure_info('fixtures/c32_fragments/0043/numerator.xml', '0043')

    measure_info['pneumococcal_vaccine_all_ages_medication_administered'].should include(1248825600)
    measure_info['encounter_outpatient_encounter'].should include(1270598400)
  end

  it "should import the the information relevant to determining diabetic eye exam measure status" do
    measure_info = get_measure_info('fixtures/c32_fragments/diabetes/numerator.xml', '0055')

    measure_info['encounter_acute_inpatient_or_ed_encounter'].should include(1275177600)
    measure_info['encounter_non_acute_inpatient_outpatient_or_ophthalmology_encounter'].should include(1275177600)
    measure_info['diabetes_diagnosis_active'].should include(1275177600)
    measure_info['gestational_diabetes_diagnosis_active'].should include(1275177600)
    measure_info['steroid_induced_diabetes_diagnosis_active'].should include(1275177600)
    measure_info['polycystic_ovaries_diagnosis_active'].should include(1275177600)
    measure_info['eye_exam_procedure_performed'].should include(1275177600)
    measure_info['medications_indicative_of_diabetes_medication_active'].should include(1275177600)
  end
end
