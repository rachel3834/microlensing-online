# -*- coding: utf-8 -*-
"""
Created on Sun Oct  2 20:54:37 2016

@author: rstreet
"""

from tutorial.models import Reference, OnlineResource
from tutorial.models import Picture, Movie, Author
from sys import exit

def ingest_object(params,entry_type):
    params_ok = verify_db_entry(entry_type,params)
    
    if params_ok:
        if entry_type == 'URL':
            entry, created = OnlineResource.objects.get_or_create(**params)
        elif entry_type == 'PICTURE':
            entry, created = Picture.objects.get_or_create(**params)
        elif entry_type == 'MOVIE':
            entry, created = Movie.objects.get_or_create(**params)
        elif entry_type == 'REF':
            params['search_key'] = params['authors']+params['year']
            entry, created = Reference.objects.get_or_create(**params)
    else:
        print 'Halting until formatting issues resolved'
        exit()
        
    return entry

def verify_db_entry(entry_type,params):
    req_fields = { 'MOVIE': ['name','filename','caption','credit'],
                   'PICTURE': ['name','filename','caption','credit'],
                    'REF': ['authors','year','journal'],
                    'URL': ['url']
                  }
    status= True
    if entry_type in req_fields.keys():
        fields = req_fields[entry_type]
        for f in fields:
            if f not in params.keys():
                print 'Error: New database entry is missing information'
                print entry_type+' entries need field "'+f+'", got: ',params
                status = False
                if entry_type == 'URL':
                    print '''Note that database entries need to be on separate 
                    lines of the input file, without surrounding text'''
    return status
    
def parse_db_entry(line,entry_type):
    """Function to parse an entry in an input article which refers to information
    which will comprise an independent entry in the database, such as a picture,
    movie or reference.
    Valid entry_types include HEADER, PICTURE, MOVIE, REF, URL
    """
    entries = line.replace(entry_type+'::','').replace('\n','').split('::')
    params = {}
    for item in entries:
        try:
            (key, value) = item.split('=')
        except ValueError:
            print 'Error parsing '+entry_type+' file entry: ',line
            print 'Problem with item: ',item
            exit()
        params[str(key).lower().lstrip()] = value
    
    return params
    
def parse_article(page_text):
    content = []
    dbentries = {}
    params = {}
    
    # Each line the in file is checked to see if it refers to information
    # which should be stored as entries in the database. URL should always be
    # last in this list, because the other types can have URL as a parameter
    entry_types = [ 'HEADER', 'PICTURE', 'MOVIE', 'REF', 'URL' ]
    
    for i in range(0,len(page_text),1):
        line = page_text[i]
        got_object = False
        
        # Check whether the line contains a database object
        j = 0
        while j<len(entry_types) and got_object == False:
            t = entry_types[j]
            if line.__contains__(t):
                got_object = True
                line_entries = parse_db_entry(line,t)
                if t == 'HEADER':
                    for key, value in line_entries.items():
                        
                        if key == 'author':
                            try:
                                author = Author.objects.get(name=line_entries['author'])
                            except Author.DoesNotExist:
                                author = Author(name=line_entries['author'])
                                author.save()
                            params[key] = author
                        else:
                            params[key] = value
                        
                else:
                    entry = ingest_object(line_entries,t)
                    
                    idb = len(dbentries) + 1
                    dbentries[idb] = entry
                    content.append('DBENTRY'+str(idb)+' '+t+' '+str(entry.pk)+'\n')
            if got_object:
                j = len(entry_types)
            else:
                j += 1
            
        # Otherwise the line is appended to the page text unmodified
        if got_object == False:
            content.append(line)
            
    params['text'] = ''.join(content)
    
    return params
    