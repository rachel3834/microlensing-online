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
    
    def _create_site_page(self):
        file_list = glob.glob('tutorial/static/site/site_*html')
        file_list = file_list + glob.glob('tutorial/static/tutorial/site_*html')
        for f in file_list:
            file_lines = open(f,'r').readlines()
            page_name = file_lines[0].replace('NAME','').lstrip().replace('\n','')
            
            page_text = ''
            references = []
            urls = []
            for line in file_lines[4:]:
                if 'REF:' in line:
                    ref_string = ingest_functions.reference(line)
                    references.append(ref_string)
                elif 'URL::' in line:
                    print 'URL line: ',line
                    url_string = ingest_functions.url(line)
                    urls.append(url_string)
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
                page = SitePage.objects.get(name=page_name)
            except SitePage.DoesNotExist:
                page = SitePage(name=page_name, text=page_text)
                page.save()
    
    def handle(self,*args, **options):
        self._create_site_page()

