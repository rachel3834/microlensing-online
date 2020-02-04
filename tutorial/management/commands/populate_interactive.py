# -*- coding: utf-8 -*-
"""
Created on Sun Oct  2 20:54:37 2016

@author: rstreet
"""


from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import InteractiveTool
import glob
import ingest_functions 
from sys import exit

class Command(BaseCommand):
    args = ''
    help = ''
    
    def _create_tool(self):
        file_list = glob.glob('tutorial/static/site/tools_*html')
        for f in file_list:
            file_lines = open(f,'r').readlines()
            params = ingest_functions.parse_article(file_lines)
            page, created = InteractiveTool.objects.get_or_create(**params)
    
    def handle(self,*args, **options):
        self._create_tool()