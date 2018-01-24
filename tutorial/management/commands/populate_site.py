# -*- coding: utf-8 -*-
"""
Created on Tue Aug  9 21:37:39 2016

@author: rstreet
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import SitePage
import glob
import ingest_functions 

class Command(BaseCommand):
    args = ''
    help = ''
    
    def add_arguments(self, parser):
        parser.add_argument('filename', nargs='+', type=str)
        
    def _create_site_page(self,*args, **options):
        filename = options['filename'][0]
        if filename == 'ALL':
            file_list = glob.glob('tutorial/static/site/site_*html')
            file_list = file_list + glob.glob('tutorial/static/tutorial/site_*html')
        else:
            file_list = glob.glob('tutorial/static/tutorial/'+filename)
        for f in file_list:
            print('Parsing '+f)
            file_lines = open(f,'r').readlines()
            params = ingest_functions.parse_article(file_lines)
            page, created = SitePage.objects.get_or_create(**params)
    
    def handle(self,*args, **options):
        self._create_site_page(*args, **options)

