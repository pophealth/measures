source :gemcutter

gem 'quality-measure-engine', '1.1.0'
#gem 'quality-measure-engine', :path=>'../quality-measure-engine'
#gem 'quality-measure-engine', :git => 'http://github.com/pophealth/quality-measure-engine.git', :branch => 'master'
#gem 'health-data-standards', '0.7.0'
gem 'health-data-standards', :git => 'https://github.com/projectcypress/health-data-standards.git', :branch => 'master'

gem 'activemodel', '3.1.3'

gem 'mongo', '1.5.1'
gem 'bson_ext', '1.5.1',  :platforms => :mri
gem 'rake'
gem 'rspec'

group :test do
  gem 'jsonschema'
  gem 'awesome_print', :require => 'ap'
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
