# -*- coding: utf-8 -*-
"""
Created on Wed Jan 11 15:56:22 2017

@author: rstreet
"""


from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import ConceptPage, TutorialPage, SitePage, InteractiveTool
import glob
import ingest_functions
from sys import exit
from os import path

class Command(BaseCommand):
    args = ''
    help = ''

    def add_arguments(self, parser):
        parser.add_argument('filename', nargs='+', type=str)

    def _create_article_entries(self,*args, **options):
        filename = options['filename'][0]
        if filename == 'ALL':
            file_list = glob.glob('website/static/raw_content/*html')
        else:
            file_list = glob.glob('website/static/raw_content/'+filename)

        print file_list

        for raw_file in file_list:

            # Parse the raw content of the article, extracting any marked-up
            # content so that they can be ingested as database entries
            file_lines = open(f,'r').readlines()
            header = self._parse_raw_file_header(file_lines)
            params = ingest_functions.parse_article(file_lines)

            # The header indicates which database table should be used
            # for the content type:
            if header['model'] = 'ConceptPage':
                page, created = ConceptPage.objects.get_or_create(**params)
            elif header['model'] = 'TutorialPage':
                page, created = TutorialPage.objects.get_or_create(**params)
            elif header['model'] = 'SitePage':
                page, created = SitePage.objects.get_or_create(**params)
            elif header['model'] = 'InteractiveTool':
                page, created = InteractiveTool.objects.get_or_create(**params)

            print(path.basename(raw_file)+': '+repr(created))

    def _parse_raw_file_header(file_lines):
        header = {}
        for line in file_lines:
            if 'HEADER::' in line:
                entry = line.replace('\n','').replace('HEADER::','').split('=')
                header[entry[0].lower()] = entry[1]
        return header

    def handle(self,*args, **options):
        self._create_article_entries(*args, **options)
