#!/usr/bin/env ruby

require 'rubygems'
require 'bundler'
require 'json'

require 'sinatra'
require 'httparty'

def random_member(members)
  #kamerlid = members[rand(members.length)]
  members.each { |member| puts "%s - %s" % [member['name'], member['seatId']] }
  active = members.select { |member| (not member['seatId'].nil?) and (member['seatId'].to_i <= 50) }
  kamerlid = active[rand(active.length)]

  return kamerlid
end

def seniority(kamerlid)
  title = kamerlid['title']
  seniority = kamerlid['seniority'].to_i

  return "%s zit al %s dagen in de tweede kamer!" % [title, seniority]
end

def age(kamerlid)
  title = kamerlid['title']
  age = kamerlid['age'].to_i

  return "Wist je dat %s alweer %s jaar oud is?" % [title, age]
end

def hometown(kamerlid)
  title = kamerlid['title']
  hometown = kamerlid['hometown']

  return "Blijkbaar woont %s in %s!" % [title, hometown]
end

def birthplace(kamerlid)
  title = kamerlid['title']
  birthplace = kamerlid['birthplace']

  return "%s werd geboren in %s." % [title, birthplace]
end

get '/' do
  @data = {}
  @members = []
  File.open('kamerleden.json', 'r') do |f|
    @members = JSON.parse(f.read)
  end

  @options = ['seniority', 'age', 'hometown', 'birthplace']


  @kamerlid = random_member(@members)
  @function = @options[Random.rand(@options.length)]
  @sentence = send(@function, @kamerlid)

  erb :index
end

get '/update' do
  response = response = HTTParty.get('http://www.tweedekamer.nl/xml/kamerleden.xml')
  members = response.parsed_response['root']['kamerlid']

  response = HTTParty.get('http://www.tweedekamer.nl/xml/kamermaps_config.xml')
  data = response.parsed_response['config']

  data['seats']['seat'].each do |seat|    
    seat_member = members.select { |member| member['id'] == seat['personId'] }[0]
    seat_member['seatId'] = seat['id'].to_i if not seat_member.nil?
  end
  
  File.open("kamerleden.json","w") do |f|
    f.write(members.to_json)
  end
end