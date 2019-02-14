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
import ingest_functions 

class Command(BaseCommand):
    args = ''
    help = ''
    
    def _create_tutorial_entries(self):
        file_list = glob.glob('tutorial/static/tutorial/tutorial_*html')
        for f in file_list:
            file_lines = open(f,'r').readlines()
            page_title = file_lines[0].replace('HEADER::TITLE=','').lstrip().replace('\n','')
            page_short_title = file_lines[1].replace('HEADER::SHORT_TITLE=','').lstrip().replace('\n','')
            page_course_index = int(file_lines[2].replace('HEADER::COURSE_INDEX=','').lstrip().replace('\n',''))
            page_author = file_lines[3].replace('HEADER::AUTHOR=','').lstrip().replace('\n','')
            page_text = ''
            references = []
            for line in file_lines[4:]:
                if 'REF:' in line:
                    ref_string = ingest_functions.reference(line)
                    references.append(ref_string)
                else:
                    page_text += line
            
            if len(references) > 0:
                page_text += '<p><h3>References</h3>\n'
                for ref_string in references:
                    try:
                        page_text += str(ref_string)+'</br>\n'
                    except UnicodeDecodeError:
                        print 'ERROR:'+ref_string+':', f
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

    