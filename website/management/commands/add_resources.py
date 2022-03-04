# -*- coding: utf-8 -*-
"""
Created on Tue Jan 10 14:59:26 2017

@author: rstreet
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from .models import Movie, Picture
import glob
from os import path

class Command(BaseCommand):
    args = ''
    help = ''

    def add_arguments(self, parser):
        parser.add_argument('filename', nargs='+', type=str)
        parser.add_argument('type', nargs='+', type=str)

    def _create_resource_entry(self):
        filename = options['filename'][0]
        filetype = options['type'][0]

        filepath = glob.glob(path.join('website/static/website',filename))
        if not path.isfile(file_path):
            raise IOError('Cannot find input file '+filename)

        params = {}
        params['filename'] = path.basename(f)
        params['credit = filename.split('__')[0].replace('_',' ')
        params['name = filename.split('__')[1].split('.')[0].replace('_',' ')
        extn = filename.split('.')[-1]
        thumbnail = filename.replace('.'+extn, '_tb.png')
        if not path.isfile(path.join('website/static/website',thumbnail)):
            thumbnail = ''
        if len(thumbnail) > 0:
            params['thumbnail'] = thumbnail

        if filetype == 'image' or filetype == 'picture':
            self._store_resource(Picture, params)
        elif filetype == 'movie':
            self._store_resource(Movie, params)

    def _store_resource(dbObject,params):
        try:
            obj = dbObject.objects.get(name=params['name'])
        except dbObject.DoesNotExist:
            obj = dbObject(params)
            obj.save()

    def handle(self,*args, **options):
        self._create_resource_entry()
