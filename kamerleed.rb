#!/usr/bin/env ruby

require 'rubygems'
require 'bundler'
require 'json'

require 'sinatra'
require 'httparty'

enable :sessions

def random_member(members)
  mp_id = session['mp_id'] || '0'
  if mp_id.to_i > 0
    old_mp = members.select { |mp| mp['id'] == mp_id }[0]
    filtered_members = members.select { |mp| (mp['id'] != mp_id) && (mp['blockId'] != old_mp['blockId']) && (mp['party']['id'] != old_mp['party']['id']) }
  else
    filtered_members = members
  end
  kamerlid = filtered_members[rand(filtered_members.length)]

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

def load_mps
  members = []
  File.open('kamerleden.json', 'r') do |f|
    members = JSON.parse(f.read)
  end
  
  return members
end

def load_parties
  parties = []
  File.open('parties.json', 'r') do |f|
    parties = JSON.parse(f.read)
  end
  
  return parties
end

def get_details(mps)
  options = ['seniority', 'age', 'hometown', 'birthplace']

  details = {
    :mp => random_member(mps),
    :function => options[Random.rand(options.length)]
  }
  details[:sentence] = send(details[:function], details[:mp])

  session['mp_id'] = details[:mp]['id']

  return details
end

get '/' do
  @members = load_mps
  @parties = load_parties

  @details = get_details(@members)

  erb :index
end

get '/json/details' do
  response.headers['Content-type'] = "application/json"
  @members = load_mps
  @details = get_details(@members)

  @details.to_json
end

get '/json/parties' do
  response.headers['Content-type'] = "application/json"
  @parties = load_parties

  @parties.to_json
end

get '/update' do
  response = response = HTTParty.get('http://www.tweedekamer.nl/xml/kamerleden.xml')
  members = response.parsed_response['root']['kamerlid']

  response = HTTParty.get('http://www.tweedekamer.nl/xml/kamermaps_config.xml')
  data = response.parsed_response['config']

  parties = data['parties']['party']

  data['seats']['seat'].each do |seat|    
    seat_member = members.select { |member| member['id'] == seat['personId'] }[0]
    if not seat_member.nil?
      seat_member['seatId'] = seat['id'].to_i
      seat_member['blockId'] = ((seat_member['seatId'] / 25) + 1)
    end
  end
  
  File.open("kamerleden.json","w") do |f|
    f.write(members.to_json)
  end

  File.open("parties.json","w") do |f|
    f.write(parties.to_json)
  end
end