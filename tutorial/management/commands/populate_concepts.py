# -*- coding: utf-8 -*-
"""
Created on Mon Aug  8 21:00:08 2016

@author: rstreet
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import ConceptPage, Author
import glob

class Command(BaseCommand):
    args = ''
    help = ''
    
    def _create_concept_entries(self):
        file_list = glob.glob('tutorial/static/tutorial/concept_*html')
        for f in file_list:
            file_lines = open(f,'r').readlines()
            page_title = file_lines[0].replace('TITLE','').lstrip().replace('\n','')
            page_short_title = file_lines[1].replace('SHORTTITLE','').lstrip().replace('\n','')
            page_course_index = int(file_lines[2].replace('COURSEINDEX','').lstrip().replace('\n',''))
            page_author = file_lines[3].replace('AUTHOR','').lstrip().replace('\n','')
            page_text = ''.join(file_lines[4:])
            try:
                author = Author.objects.get(name=page_author)
            except Author.DoesNotExist:
                author = Author(name=page_author)
                author.save()
            try:
                tutorial = ConceptPage.objects.get(title=page_title)
            except ConceptPage.DoesNotExist:
                page = ConceptPage(title=page_title, \
                                    short_title=page_short_title, \
                                    course_index=page_course_index,\
                                    author=author, \
                                    text=page_text)
                page.save()
    
    def handle(self,*args, **options):
        self._create_concept_entries()