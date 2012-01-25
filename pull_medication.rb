
require 'json'
require 'pry'
require 'mysql'

codes = []

Dir.glob(File.join('./tmp/', '*.json')).each do |file|
  doc = JSON.parse(File.new(file).read)
  doc['measure'].each do |key, value| 
    if value['standard_category'] == 'medication'
      value['codes'].each {|x| codes.concat(x['values'])}
    end
  end

end

codes.uniq!

conn = Mysql.new('localhost', 'root', nil, 'ndc')

decoder = {}
i=0
ps = conn.prepare "SELECT atv, sab FROM ndc.rxnsat WHERE atn = 'NDC' AND rxcui = ? "
codes.each do |code|
  startTime = Time.now
  ps.execute code
  
  while row = ps.fetch do
    decoder[row[0]] = code
  end
  i+=1
  endTime = Time.now
  puts "#{i}/#{codes.count} -> #{endTime - startTime}"
  if (i%100 == 0)
    File.open("./med_decoder/medication_decoder_#{i}.json",'w') do |file|
      file.write(decoder.to_json)
    end
  end
end

File.open("./medication_decoder.json",'w') do |file|
  file.write(decoder.to_json)
end

ps.close


