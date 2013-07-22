#!/usr/bin/env ruby

require 'rubygems'
require 'bundler'
require 'json'

require 'sinatra'
require 'httparty'

get '/' do
  @data = {}
  File.open('data.json', 'r') do |f|
    @data = JSON.parse(f.read)
  end
  puts @data
  erb :index
end

get '/update' do
  response = response = HTTParty.get('http://www.tweedekamer.nl/xml/kamerleden.xml')
  #puts response.inspect
  title = ''
  seniority = 0
  response.parsed_response['root']['kamerlid'].each do |kamerlid|
    #puts kamerlid['title']
    if kamerlid['seniority'].to_i > seniority
      seniority = kamerlid['seniority'].to_i
      title = kamerlid['title']
    end
  end
  data = {
    :title => title,
    :seniority => seniority
  }
  File.open("data.json","w") do |f|
    f.write(data.to_json)
  end
end