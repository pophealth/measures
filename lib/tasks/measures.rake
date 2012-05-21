measures_dir = ENV['MEASURE_DIR']
js_dir = "js"
gem 'rubyzip'
require 'zip/zip'
require 'zip/zipfilesystem'

namespace :measures do 
  desc 'Build all measures to tmp directory'
  task :build_zip do
    puts "Loading measures from #{measures_dir}"
  
  
    dest_dir = File.join('.', 'tmp', 'build')
    json_dir =  File.join(dest_dir,"json")
    lib_dir = File.join(dest_dir,"libraries")
    FileUtils.remove_dir(dest_dir)       if Dir.exists?(dest_dir)
    FileUtils.mkdir_p(json_dir) 
    FileUtils.mkdir_p(lib_dir)
  
  
    Dir.glob(File.join(measures_dir, '*')).each do |measure_dir|
      measures = QME::Measure::Loader.load_measure(measure_dir)
      measures.each do |measure|
        id = measure['id']
        sub_id = measure['sub_id']
        json = JSON.pretty_generate(measure)
        file_name = File.join(json_dir, "#{id}#{sub_id}.json")
        file = File.new(file_name,  "w")
        file.write(json)
        file.close
      end
    end
  
 
  
    Dir.glob(File.join(js_dir, '*')).each do |js_file|
       FileUtils.cp(js_file, lib_dir)
     end
    bundle_meta = JSON.parse(File.read("./bundle.json"))
    
    bundle_meta[:license] = File.read("./license.html")
    File.open(File.join(dest_dir,"bundle.json"),"w") do |f|
      f.puts(bundle_meta.to_json)
    end
    
    version = bundle_meta["version"] || ""
  
    archive = File.join("./tmp", "bundle_#{version}.zip")
    puts "building  #{archive}"
    FileUtils.rm archive, :force=>true
    
    Zip::ZipFile.open(archive, 'w') do |zipfile|
      Dir["#{dest_dir}/**/**"].each do |file|
        zipfile.add(file.gsub(/.*tmp\/build\//,""),file)
      end
    end
  
  end
  
  
  desc "push zip file to github"
  task :publish => :build_zip do 
    
  end
end
