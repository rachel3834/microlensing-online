# -*- coding: utf-8 -*-
"""
Created on Tue Jan 10 14:59:26 2017

@author: rstreet
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import Movie, Picture
import glob
from os import path

class Command(BaseCommand):
    args = ''
    help = ''

    def _create_resource_entries(self):

        for resource in [ 'movies' ]:
            file_list = glob.glob(path.join('tutorial/static/tutorial',resource,'*'))
            for f in file_list:
                if '_tb.png' not in f:
                    filename = path.basename(f)
                    credit = filename.split('__')[0].replace('_',' ')
                    name = filename.split('__')[1].split('.')[0].replace('_',' ')

                    try:
                        m = Movie.objects.get(name=name)
                    except Movie.DoesNotExist:
                        m = Movie(name=name, filename=filename, credit=credit)
                        m.save()

    def handle(self,*args, **options):
        self._create_resource_entries()
