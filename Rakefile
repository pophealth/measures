require 'quality-measure-engine'
require 'qme_test'

ENV['MEASURE_DIR'] = ENV['MEASURE_DIR'] || 'measures'
ENV['MEASURE_PROPS'] = ENV['MEASURE_PROPS'] || 'measure_props'



Dir['lib/tasks/*.rake'].sort.each do |ext|
  load ext
end