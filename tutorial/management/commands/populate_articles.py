# -*- coding: utf-8 -*-
"""
Created on Wed Jan 11 15:56:22 2017

@author: rstreet
"""


from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import ConceptPage, TutorialPage
import glob
import ingest_functions
from sys import exit

class Command(BaseCommand):
    args = ''
    help = ''
    
    def add_arguments(self, parser):
        parser.add_argument('filename', nargs='+', type=str)
        
    def _create_article_entries(self,*args, **options):
        filename = options['filename'][0]
        concepts = []
        tutorials = []
        if filename == 'ALL':
            concepts = glob.glob('tutorial/static/tutorial/concept_*html')
            tutorials = glob.glob('tutorial/static/tutorial/tutorial_*html')
        else:
            if 'concept' in filename:
                concepts = glob.glob('tutorial/static/tutorial/'+filename)
            else:
                tutorials = glob.glob('tutorial/static/tutorial/'+filename)
        
        print tutorials
        for f in concepts:
            file_lines = open(f,'r').readlines()
            params = ingest_functions.parse_article(file_lines)
            page, created = ConceptPage.objects.get_or_create(**params)
            
        for f in tutorials:
            file_lines = open(f,'r').readlines()
            params = ingest_functions.parse_article(file_lines)
            page, created = TutorialPage.objects.get_or_create(**params)
    
    
    def handle(self,*args, **options):
        self._create_article_entries(*args, **options)
