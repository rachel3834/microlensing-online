# -*- coding: utf-8 -*-
"""
Created on Mon Aug  8 21:00:08 2016

@author: rstreet
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import TutorialPage
import glob

class Command(BaseCommand):
    args = ''
    help = ''
    
    def _create_tutorial_entries(self):
        file_list = glob.glob('tutorial/static/tutorial/tutorial_*html')
        for f in file_list:
            file_lines = open(f,'r').readlines()
            page_title = file_lines[0].replace('TITLE','').lstrip().replace('\n','')
            page_author = file_lines[1].replace('AUTHOR','').lstrip().replace('\n','')
            try:
                user = User.objects.get(username=page_author)
            except User.DoesNotExist:
                user = User.create(username=page_author)
            page_text = ''.join(file_lines[2:])
            page = TutorialPage(title=page_title, author=user, \
                                text=page_text)
            page.save()
    
    def handle(self,*args, **options):
        self._create_tutorial_entries()