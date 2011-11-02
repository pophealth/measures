source :gemcutter

gem 'quality-measure-engine', :git => 'http://github.com/pophealth/quality-measure-engine.git', :branch => 'develop'
#gem 'quality-measure-engine', :path=>'../quality-measure-engine'

gem 'bson_ext', :platforms => :mri
gem 'rake'

group :test do
  gem 'rspec'
  gem 'jsonschema'
  gem 'awesome_print', :require => 'ap'
  gem 'metric_fu'
  gem 'sinatra'
  gem 'roo'
  gem 'builder'
  gem 'spreadsheet'
  gem 'google-spreadsheet-ruby'
end

group :build do
  gem 'yard'
  gem 'kramdown' # needed by yard
end
