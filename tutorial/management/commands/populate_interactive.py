# -*- coding: utf-8 -*-
"""
Created on Sun Oct  2 20:54:37 2016

@author: rstreet
"""


from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import InteractiveTool
import glob

class Command(BaseCommand):
    args = ''
    help = ''
    
    def _create_tool(self):
        print InteractiveTool.objects.all()
        file_list = glob.glob('tutorial/static/site/tools_*html')
        for f in file_list:
            file_lines = open(f,'r').readlines()
            page_name = file_lines[0].replace('NAME','').lstrip().replace('\n','')
            page_tool_index = int(file_lines[1].replace('TOOLINDEX','').lstrip().replace('\n',''))
            page_text = ''.join(file_lines[2:])
            try:
                page = InteractiveTool.objects.get(name=page_name)
            except InteractiveTool.DoesNotExist:
                page = InteractiveTool(name=page_name,  \
                                    tools_index=page_tool_index,\
                                    text=page_text)
                page.save()
    
    def handle(self,*args, **options):
        self._create_tool()