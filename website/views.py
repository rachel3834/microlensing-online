from django.shortcuts import render
from .models import *
from django.views.generic.detail import DetailView
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
from django.http import HttpResponse

def home(request):
    return HttpResponse("Hello, world.")
