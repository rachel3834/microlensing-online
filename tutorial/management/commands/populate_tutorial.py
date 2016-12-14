# -*- coding: utf-8 -*-
"""
Created on Mon Aug  8 21:00:08 2016

@author: rstreet
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import TutorialPage, Author, Reference
import glob
from sys import exit

class Command(BaseCommand):
    args = ''
    help = ''
    
    def _create_tutorial_entries(self):
        file_list = glob.glob('tutorial/static/tutorial/tutorial_*html')
        for f in file_list:
            file_lines = open(f,'r').readlines()
            page_title = file_lines[0].replace('TITLE','').lstrip().replace('\n','')
            page_short_title = file_lines[1].replace('SHORTTITLE','').lstrip().replace('\n','')
            page_course_index = int(file_lines[2].replace('COURSEINDEX','').lstrip().replace('\n',''))
            page_author = file_lines[3].replace('AUTHOR','').lstrip().replace('\n','')
            page_text = ''
            references = []
            for line in file_lines[4:]:
                if 'REF:' in line:
                    ref_string = ingest_reference(line)
                    references.append(ref_string)
                else:
                    page_text += line
            
            if len(references) > 0:
                page_text += '<p><h3>References</h3>\n'
                for ref_string in references:
                    page_text += ref_string+'</br>\n'
                page_text += '</p>'
                
            try:
                author = Author.objects.get(name=page_author)
            except Author.DoesNotExist:
                author = Author(name=page_author)
                author.save()
            try:
                tutorial = TutorialPage.objects.get(title=page_title)
            except TutorialPage.DoesNotExist:
                page = TutorialPage(title=page_title, \
                                    short_title=page_short_title, \
                                    course_index=page_course_index,\
                                    author=author, \
                                    text=page_text)
                page.save()
    
    def handle(self,*args, **options):
        self._create_tutorial_entries()

def ingest_reference(ref_string):
    entries = ref_string.replace('REF:','').replace('\n','').split(':')
    params = {}
    for item in entries:
        (key, value) = item.split('=')
        params[str(key).lower()] = value
    params['search_key'] = params['authors']+params['year']
    
    try:
        ref = Reference.objects.get(search_key=params['search_key'])
    except Reference.DoesNotExist:
        ref = Reference()
        ref.set_params(params)
        ref.save()
    
    return ref.__str__()
    