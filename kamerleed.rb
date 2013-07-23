#!/usr/bin/env ruby

require 'rubygems'
require 'bundler'
require 'json'

require 'sinatra'
require 'httparty'

def seniority(members)
  kamerlid = members[rand(members.length)]
  title = kamerlid['title']
  seniority = kamerlid['seniority'].to_i

  return {
    'title' => title,
    'seniority' => seniority
  }
end

get '/' do
  @data = {}
  @members = []
  File.open('data.json', 'r') do |f|
    @members = JSON.parse(f.read)
  end
  @options = ['seniority']
  @function = @options[Random.rand(@options.length)]
  @data = send(@function, @members)
  puts @data
  erb :index
end

get '/update' do
  response = response = HTTParty.get('http://www.tweedekamer.nl/xml/kamerleden.xml')
  #puts response.inspect
  data = response.parsed_response['root']['kamerlid']
  File.open("data.json","w") do |f|
    f.write(data.to_json)
  end
end