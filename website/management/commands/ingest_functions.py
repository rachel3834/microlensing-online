# -*- coding: utf-8 -*-
"""
Created on Sun Oct  2 20:54:37 2016

@author: rstreet
"""

from tutorial.models import Reference, OnlineResource
from tutorial.models import Picture, Movie, Author, SitePage, File
from tutorial.models import TutorialPage, ConceptPage, InteractiveTool
from sys import exit

def ingest_object(params,entry_type):
    def get_thumb_name(params):
        if 'thumbnail' not in params.keys():
            components = str(params['filename']).split('.')
            params['thumbnail'] = components[0]+'_tb.'+components[1]
        return params
        
    params_ok = verify_db_entry(entry_type,params)
    
    if params_ok:
        if entry_type == 'URL':
            entry, created = OnlineResource.objects.get_or_create(**params)
        elif entry_type == 'PICTURE':
            params= get_thumb_name(params)
            entry, created = Picture.objects.get_or_create(**params)
        elif entry_type == 'MOVIE':
            params= get_thumb_name(params)
            entry, created = Movie.objects.get_or_create(**params)
        elif entry_type == 'REF':
            params['search_key'] = params['authors']+params['year']
            entry, created = Reference.objects.get_or_create(**params)
        elif entry_type == 'FILE':
            entry, created = File.objects.get_or_create(**params)
            
    else:
        print 'Halting until formatting issues resolved'
        exit()
        
    return entry

def verify_db_entry(entry_type,params):
    req_fields = { 'MOVIE': ['name','filename','caption','credit'],
                   'PICTURE': ['name','filename','caption','credit'],
                    'REF': ['authors','year','journal'],
                    'URL': ['url'],
                    'FILE': ['name', 'filename']
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
    Valid entry_types include HEADER, PICTURE, MOVIE, REF, URL, SITELINK, FILE
    """
    entries = line.replace(entry_type+'::','').replace('\n','').split('::')
    params = {}
    for item in entries:
        try:
            (key, value) = item.split('=')
        except ValueError:
            if entry_type == 'URL':
                entries = item.split('=')
                key = entries[0]
                value = ''.join(entries[1:])
            else:
                print 'Error parsing '+entry_type+' file entry: ',line
                print 'Problem with item: ',item
                exit()
        params[str(key).lower().lstrip()] = value
    
    return params

def resolve_site_link(params,entry_type):
    """Function to provide a handle to link to other pages within the same
    site"""
    
    try:
        if str(params['table']).lower() == 'sitepage':
            entry = SitePage.objects.get(name=params['name'])
        elif str(params['table']).lower() == 'concept' or str(params['table']).lower() == 'conceptpage':
            entry = ConceptPage.objects.get(short_title=params['shorttitle'])
        elif str(params['table']).lower() == 'tutorial':
            entry = TutorialPage.objects.get(short_title=params['shorttitle'])
        elif str(params['table']).lower() == 'interactivetool':
            entry = TutorialPage.objects.get(name=params['name'])
               
        else:
            print params
            print 'Unrecognised sitelink table '+params['table']
            print 'Halting until formatting issues resolved'
            exit()
    
    except KeyError:
        print params
        print 'Cannot parse sitelink'
        print 'Halting until formatting issues resolved'
        exit()
            
    return entry
    
def parse_article(page_text):
    content = []
    dbentries = {}
    params = {}
    
    # Each line the in file is checked to see if it refers to information
    # which should be stored as entries in the database. URL should always be
    # last in this list, because the other types can have URL as a parameter
    entry_types = [ 'HEADER', 'PICTURE', 'MOVIE', 'REF', 'URL', 'SITELINK', 'FILE' ]
    
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
                
                elif t == 'SITELINK':
                    entry = resolve_site_link(line_entries,t)

                    idb = len(dbentries) + 1
                    dbentries[idb] = entry
                    content.append('DBENTRY'+str(idb)+' '+t+' '+str(entry.pk)+\
                    ' ::TABLE='+str(line_entries['table']).upper()+\
                    ' ::LINKTEXT='+line_entries['linktext']+'::\n')
                elif t == 'FILE':
                    pars = line_entries.copy()
                    foo = pars.pop('linktext')
                    entry = ingest_object(pars,t)
                    
                    idb = len(dbentries) + 1
                    dbentries[idb] = entry
                    content.append('DBENTRY'+str(idb)+' '+t+' '+str(entry.pk)+\
                    ' ::LINKTEXT='+line_entries['linktext']+'::\n')
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
