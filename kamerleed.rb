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

  return "%s zit al %s dagen in de tweede kamer!" % [title, seniority]
end

def age(members)
  kamerlid = members[rand(members.length)]
  title = kamerlid['title']
  age = kamerlid['age'].to_i
  return "Wist je dat %s alweer %s jaar oud is?" % [title, age]
end

def hometown(members)
  kamerlid = members[rand(members.length)]
  title = kamerlid['title']
  hometown = kamerlid['hometown']
  return "Blijkbaar woont %s in %s!" % [title, hometown]
end

def birthplace(members)
  kamerlid = members[rand(members.length)]
  title = kamerlid['title']
  hometown = kamerlid['birthplace']
  return "%s werd geboren in %s." % [title, hometown]
end

get '/' do
  @data = {}
  @members = []
  File.open('data.json', 'r') do |f|
    @members = JSON.parse(f.read)
  end
  @options = ['seniority', 'age', 'hometown', 'birthplace']
  @function = @options[Random.rand(@options.length)]
  @sentence = send(@function, @members)
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