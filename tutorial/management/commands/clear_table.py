# -*- coding: utf-8 -*-
"""
Created on Thu Jan 12 16:07:00 2017

@author: rstreet
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from tutorial.models import Movie, Picture

class Command(BaseCommand):
    args = ''
    help = ''

    def _clear_table(self):
        Picture.objects.all().delete()

    def handle(self,*args, **options):
        self._clear_table()
